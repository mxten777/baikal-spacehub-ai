/**
 * optimize-archive-pool.mjs
 * Archive Pool(project_category='archive', project_stage='web') 전체 이미지를
 * WebP로 일괄 최적화 → Storage 업로드 → DB public_url 교체
 *
 * 실행: node scripts/optimize-archive-pool.mjs
 * 환경변수: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (.env.local)
 *           CAPTURE_ADMIN_EMAIL, CAPTURE_ADMIN_PASSWORD (.env)
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

function parseEnvFile(path) {
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split('\n')
      .filter(l => l.includes('=') && !l.startsWith('#'))
      .map(l => { const idx = l.indexOf('='); return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]; })
  );
}

const envLocal = parseEnvFile(join(rootDir, '.env.local'));
const envMain = parseEnvFile(join(rootDir, '.env'));

const SUPABASE_URL = envLocal['VITE_SUPABASE_URL'];
const SUPABASE_ANON_KEY = envLocal['VITE_SUPABASE_ANON_KEY'];
const ADMIN_EMAIL = envMain['CAPTURE_ADMIN_EMAIL'];
const ADMIN_PASSWORD = envMain['CAPTURE_ADMIN_PASSWORD'];

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase 환경변수 없음 (.env.local)');
  process.exit(1);
}

const BUCKET = 'photos';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  console.log('✅ 로그인 성공\n');

  // 2. Archive web 사진 전체 조회
  console.log('🔍 Archive Pool 조회 (project_category=archive, project_stage=web)...');
  const { data: photos, error: queryErr } = await supabase
    .from('photos')
    .select('id, storage_path, public_url, mime_type, file_size')
    .eq('project_category', 'archive')
    .eq('project_stage', 'web')
    .eq('upload_status', 'completed')
    .order('created_at', { ascending: true });

  if (queryErr) {
    console.error('❌ 조회 실패:', queryErr.message);
    process.exit(1);
  }

  console.log(`  발견: ${photos?.length ?? 0}건`);

  if (!photos?.length) {
    console.log('\n⚠️  처리할 이미지 없음. 종료.');
    process.exit(0);
  }

  // 3. 이미 WebP이거나 _optimized인 항목 필터링 (storage_path 또는 public_url 기준)
  const targets = photos.filter(p => {
    const path = p.storage_path ?? '';
    const url = p.public_url ?? '';
    const isAlreadyWebp = path.toLowerCase().endsWith('.webp');
    const isAlreadyOptimized = path.includes('_optimized') || url.includes('_optimized');
    return !isAlreadyWebp && !isAlreadyOptimized;
  });

  const skipped = photos.length - targets.length;
  if (skipped > 0) {
    console.log(`  ⏭  이미 최적화됨 (WebP 또는 _optimized): ${skipped}건 건너뜀`);
  }
  console.log(`  처리 대상: ${targets.length}건\n`);

  if (!targets.length) {
    console.log('✅ 모든 Archive 이미지가 이미 최적화되어 있습니다.');
    process.exit(0);
  }

  // 4. 통계 누적
  let totalOriginalBytes = 0;
  let totalOptimizedBytes = 0;
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < targets.length; i++) {
    const photo = targets[i];
    const storagePath = photo.storage_path;
    const basename = storagePath.replace(/\.[^./]+$/, '');
    const newStoragePath = `${basename}_optimized.webp`;
    const prefix = `[${i + 1}/${targets.length}]`;

    console.log(`${prefix} ${storagePath.split('/').pop()}`);

    try {
      // 4a. 원본 다운로드
      const { data: dlData, error: dlErr } = await supabase.storage
        .from(BUCKET)
        .download(storagePath);

      if (dlErr || !dlData) {
        throw new Error(`다운로드 실패: ${dlErr?.message ?? 'no data'}`);
      }

      const originalBuffer = Buffer.from(await dlData.arrayBuffer());
      const originalSize = originalBuffer.length;
      totalOriginalBytes += originalSize;

      const meta = await sharp(originalBuffer).metadata();

      // 4b. WebP 최적화 (최대 1600px, quality 80)
      const optimizedBuffer = await sharp(originalBuffer)
        .resize(1600, null, { withoutEnlargement: true })
        .webp({ quality: 80, effort: 5 })
        .toBuffer();

      const optimizedSize = optimizedBuffer.length;
      totalOptimizedBytes += optimizedSize;
      const saving = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

      // 4c. Storage 업로드 (_optimized.webp)
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(newStoragePath, optimizedBuffer, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (uploadErr) {
        throw new Error(`업로드 실패: ${uploadErr.message}`);
      }

      // 4d. 새 Public URL 생성
      const { data: { publicUrl: newPublicUrl } } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(newStoragePath);

      // 4e. DB public_url 업데이트
      const { error: updateErr } = await supabase
        .from('photos')
        .update({ public_url: newPublicUrl })
        .eq('id', photo.id);

      if (updateErr) {
        throw new Error(`DB 업데이트 실패: ${updateErr.message}`);
      }

      const origW = meta.width ?? 0;
      console.log(
        `     ${origW}px → WebP  ${(originalSize / 1024).toFixed(0)}KB → ${(optimizedSize / 1024).toFixed(0)}KB  (-${saving}%)  ✅`
      );
      successCount++;

    } catch (err) {
      console.error(`     ❌ ${err.message}`);
      errors.push({ id: photo.id, path: storagePath, error: err.message });
      errorCount++;
      // 오류가 있어도 다음 이미지 계속 처리
    }
  }

  // 5. 결과 요약
  console.log('\n' + '='.repeat(60));
  console.log('결과 요약');
  console.log('='.repeat(60));
  console.log(`처리 대상:   ${targets.length}건`);
  console.log(`성공:        ${successCount}건`);
  console.log(`실패:        ${errorCount}건`);

  if (successCount > 0) {
    const origMB = (totalOriginalBytes / 1024 / 1024).toFixed(2);
    const optKB = (totalOptimizedBytes / 1024).toFixed(0);
    const saving = ((1 - totalOptimizedBytes / totalOriginalBytes) * 100).toFixed(1);
    console.log(`\n총 용량 (성공 건)`);
    console.log(`  이전: ${origMB} MB`);
    console.log(`  이후: ${optKB} KB`);
    console.log(`  절감: ${saving}%`);
  }

  if (errors.length > 0) {
    console.log('\n실패 목록:');
    errors.forEach(e => console.log(`  - ${e.path}: ${e.error}`));
  }

  console.log('\n✅ 원본 Storage 파일 보존됨.');
  console.log('완료.');
}

run().catch(e => { console.error('❌ 치명적 오류:', e.message); process.exit(1); });
