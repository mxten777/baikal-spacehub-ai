/**
 * optimize-archive-image.mjs
 * Archive 섹션의 5.1MB 원본 이미지를 WebP로 최적화 → Storage 업로드 → DB URL 교체
 *
 * 실행: node scripts/optimize-archive-image.mjs
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

const TARGET_FILENAME = '97fbc559-3fdb-4b45-bf69-7eab1ecc9451.jpg';
const BUCKET = 'photos';
const STORAGE_PATH = `the-lit-2026/archive/web/${TARGET_FILENAME}`;
const ORIG_URL = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${STORAGE_PATH}`;

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
  console.log('✅ 로그인 성공');

  // 2. photos 테이블에서 해당 레코드 조회
  console.log('\n🔍 DB 레코드 조회...');
  const { data: records, error: queryErr } = await supabase
    .from('photos')
    .select('id, public_url, project_category, project_stage, upload_status')
    .ilike('public_url', `%${TARGET_FILENAME}%`);

  if (queryErr) {
    console.error('❌ 조회 실패:', queryErr.message);
    process.exit(1);
  }
  if (!records?.length) {
    console.error('❌ 레코드 없음 — URL:', ORIG_URL);
    process.exit(1);
  }

  console.log(`✅ 레코드 발견: ${records.length}건`);
  records.forEach(r => console.log(`  id=${r.id}, stage=${r.project_stage}, status=${r.upload_status}, url=...${r.public_url?.split('/').pop()?.substring(0, 40)}`));

  const record = records[0];

  // 3. 원본 다운로드
  console.log('\n📥 원본 Storage 다운로드...');
  const { data: dlData, error: dlErr } = await supabase.storage
    .from(BUCKET)
    .download(STORAGE_PATH);

  if (dlErr || !dlData) {
    console.error('❌ 다운로드 실패:', dlErr?.message);
    process.exit(1);
  }

  const originalBuffer = Buffer.from(await dlData.arrayBuffer());
  const originalSize = originalBuffer.length;
  const meta = await sharp(originalBuffer).metadata();
  console.log(`  원본: ${meta.width}×${meta.height}px, ${(originalSize / 1024 / 1024).toFixed(2)}MB`);

  // 4. WebP 최적화 (1600px, quality 80)
  console.log('\n⚙️  WebP 최적화 (1600px, quality 80)...');
  const optimizedBuffer = await sharp(originalBuffer)
    .resize(1600, null, { withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toBuffer();
  const optimizedInfo = await sharp(optimizedBuffer).metadata();
  const optimizedSize = optimizedBuffer.length;
  console.log(`  최적화: ${optimizedInfo.width}×${optimizedInfo.height}px, ${(optimizedSize / 1024).toFixed(0)}KB`);
  console.log(`  절감: ${((1 - optimizedSize / originalSize) * 100).toFixed(1)}%`);

  // 5. 새 파일명으로 Storage 업로드
  const origBasename = TARGET_FILENAME.replace(/\.[^.]+$/, '');
  const newFilename = `${origBasename}_optimized.webp`;
  const newStoragePath = STORAGE_PATH.replace(TARGET_FILENAME, newFilename);

  console.log(`\n📤 Storage 업로드: ${newStoragePath}`);
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(newStoragePath, optimizedBuffer, {
      contentType: 'image/webp',
      upsert: true,
    });
  if (uploadErr) {
    console.error('❌ 업로드 실패:', uploadErr.message);
    process.exit(1);
  }

  // 6. 새 Public URL 생성
  const { data: { publicUrl: newPublicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(newStoragePath);
  console.log(`  ✅ 새 URL: .../${newPublicUrl.split('/').slice(-3).join('/')}`);

  // 7. photos 테이블 public_url 업데이트
  console.log('\n📝 DB public_url 업데이트...');
  const { error: updateErr } = await supabase
    .from('photos')
    .update({ public_url: newPublicUrl })
    .eq('id', record.id);

  if (updateErr) {
    console.error('❌ DB 업데이트 실패:', updateErr.message);
    process.exit(1);
  }
  console.log('  ✅ DB 업데이트 완료');

  // 8. 결과 요약
  console.log('\n\n=== 결과 요약 ===');
  console.log(`원본:  ${meta.width}×${meta.height}px  ${(originalSize / 1024 / 1024).toFixed(2)}MB  JPEG`);
  console.log(`최적화: ${optimizedInfo.width}×${optimizedInfo.height}px  ${(optimizedSize / 1024).toFixed(0)}KB  WebP`);
  console.log(`절감: ${((1 - optimizedSize / originalSize) * 100).toFixed(1)}%`);
  console.log(`원본 URL: ${ORIG_URL}`);
  console.log(`새 URL:   ${newPublicUrl}`);
  console.log('\n✅ 완료. 원본 Storage 파일은 보존됨.');
}

run().catch(e => { console.error('❌ 오류:', e.message); process.exit(1); });
