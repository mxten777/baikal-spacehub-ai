/**
 * optimize-hero-images.mjs
 * Hero 슬라이드 이미지를 Supabase Storage에서 다운로드 → WebP 최적화 → 재업로드 → DB URL 교체
 *
 * 실행: node scripts/optimize-hero-images.mjs
 * 환경변수: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_ADMIN_EMAIL, SUPABASE_ADMIN_PASSWORD
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// env 로드
const envLocal = readFileSync(join(rootDir, '.env.local'), 'utf8');
const envLines = Object.fromEntries(
  envLocal.split('\n')
    .filter(l => l.includes('='))
    .map(l => l.split('=').map(s => s.trim()))
    .map(([k, v]) => [k, v])
);

const SUPABASE_URL = envLines['VITE_SUPABASE_URL'];
const SUPABASE_ANON_KEY = envLines['VITE_SUPABASE_ANON_KEY'];

// .env 에서 admin 계정 로드
const envMain = readFileSync(join(rootDir, '.env'), 'utf8');
const envMainLines = Object.fromEntries(
  envMain.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const idx = l.indexOf('='); return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]; })
);
const ADMIN_EMAIL = envMainLines['CAPTURE_ADMIN_EMAIL'];
const ADMIN_PASSWORD = envMainLines['CAPTURE_ADMIN_PASSWORD'];

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase 환경변수 없음');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const WORK_DIR = join(rootDir, '.hero-optimize-tmp');
if (!existsSync(WORK_DIR)) mkdirSync(WORK_DIR, { recursive: true });

async function run() {
  // 1. Admin 로그인
  console.log('🔐 Supabase 로그인...');
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  if (authErr || !authData.session) {
    console.error('❌ 로그인 실패:', authErr?.message);
    process.exit(1);
  }
  console.log('✅ 로그인 성공');

  // 2. hero_slides 조회
  const { data: slides, error: slidesErr } = await supabase
    .from('hero_slides')
    .select('id, display_order, desktop_image_url, mobile_image_url')
    .eq('is_active', true)
    .order('display_order');

  if (slidesErr || !slides?.length) {
    console.error('❌ 슬라이드 조회 실패:', slidesErr?.message);
    process.exit(1);
  }
  console.log(`📋 슬라이드 ${slides.length}장 확인`);

  const results = [];

  for (const slide of slides) {
    const url = slide.desktop_image_url;
    if (!url || !url.includes('supabase')) {
      console.log(`⏭️  슬라이드 ${slide.display_order}: 로컬 이미지, 건너뜀`);
      continue;
    }

    console.log(`\n📥 [${slide.display_order}] 원본 다운로드...`);

    // URL에서 Storage path 추출
    // https://xxx.supabase.co/storage/v1/object/public/{bucket}/{path}
    const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+?)(\?.*)?$/);
    if (!match) { console.error('  URL 파싱 실패:', url); continue; }
    const [, bucket, storagePath] = match;
    const cleanPath = storagePath.split('?')[0];

    // 원본 다운로드
    const { data: dlData, error: dlErr } = await supabase.storage
      .from(bucket)
      .download(cleanPath);
    if (dlErr || !dlData) { console.error('  다운로드 실패:', dlErr?.message); continue; }

    const originalBuffer = Buffer.from(await dlData.arrayBuffer());
    const originalSize = originalBuffer.length;
    const origFilename = `orig_slide${slide.display_order}_${cleanPath.split('/').pop()}`;
    writeFileSync(join(WORK_DIR, origFilename), originalBuffer);

    // 원본 메타데이터
    const meta = await sharp(originalBuffer).metadata();
    console.log(`  원본: ${meta.width}x${meta.height}, ${(originalSize / 1024 / 1024).toFixed(1)}MB`);

    // Sharp WebP 최적화 (1920px, quality 81)
    const optimizedBuffer = await sharp(originalBuffer)
      .resize(1920, null, { withoutEnlargement: true })
      .webp({ quality: 81, effort: 5 })
      .toBuffer();
    const optimizedSize = optimizedBuffer.length;
    console.log(`  최적화: 1920px WebP, ${(optimizedSize / 1024).toFixed(0)}KB (${((1 - optimizedSize / originalSize) * 100).toFixed(1)}% 절감)`);

    // 새 파일명 (WebP, 같은 폴더)
    const origBasename = cleanPath.split('/').pop().replace(/\.[^.]+$/, '');
    const newFilename = `${origBasename}_optimized.webp`;
    const newStoragePath = cleanPath.replace(/[^/]+$/, newFilename);

    // Supabase Storage 업로드
    console.log(`  📤 업로드: ${newStoragePath}`);
    const { error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(newStoragePath, optimizedBuffer, {
        contentType: 'image/webp',
        upsert: true,
      });
    if (uploadErr) { console.error('  업로드 실패:', uploadErr.message); continue; }

    // 새 Public URL 생성
    const { data: { publicUrl: newPublicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(newStoragePath);
    console.log(`  ✅ 새 URL: ${newPublicUrl.split('/').slice(-1)[0]}`);

    // DB hero_slides 업데이트
    const { error: updateErr } = await supabase
      .from('hero_slides')
      .update({ desktop_image_url: newPublicUrl })
      .eq('id', slide.id);
    if (updateErr) { console.error('  DB 업데이트 실패:', updateErr.message); continue; }
    console.log(`  ✅ DB 업데이트 완료`);

    results.push({
      order: slide.display_order,
      originalUrl: url,
      newUrl: newPublicUrl,
      originalSize: `${(originalSize / 1024 / 1024).toFixed(1)}MB`,
      optimizedSize: `${(optimizedSize / 1024).toFixed(0)}KB`,
      savings: `${((1 - optimizedSize / originalSize) * 100).toFixed(1)}%`,
    });
  }

  console.log('\n\n=== 결과 요약 ===');
  results.forEach(r => {
    console.log(`슬라이드 ${r.order}: ${r.originalSize} → ${r.optimizedSize} (${r.savings} 절감)`);
    console.log(`  원본 URL 기록: ${r.originalUrl.split('/').pop()}`);
  });
  console.log('\n✅ 완료. 원본 파일은 .hero-optimize-tmp/ 에 백업됨.');
  console.log('검증 후 원본 Storage 파일을 삭제하려면 Supabase 대시보드에서 직접 삭제하세요.');
}

run().catch(e => { console.error('❌ 오류:', e.message); process.exit(1); });
