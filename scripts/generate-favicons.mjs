/**
 * generate-favicons.mjs
 * THE LIT Brand Icon (빨간 원 + 검정 THE LIT 로고) → favicon 파일 세트 생성
 * 실행: node scripts/generate-favicons.mjs
 *
 * 소스: public/images/thelitlogo_black_trans.png (1024×1024, 투명 배경)
 * 모든 아이콘: 빨간 원(#FF050C) 배경 + 검정 THE LIT 전체 로고 합성
 * favicon.svg: 64×64 Brand Icon PNG를 base64 임베드 (모던 브라우저 최우선 적용)
 */

import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public');
const LOGO_SRC = join(OUT, 'images/thelitlogo_black_trans.png');
const BRAND_RED = '#FF050C';

/** 지정 크기의 빨간 원 SVG 버퍼 반환 */
function redCircleSvg(size) {
  const r = size / 2;
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${r}" cy="${r}" r="${r}" fill="${BRAND_RED}"/></svg>`
  );
}

/**
 * PNG-in-ICO 멀티 레이어 포맷 (Win Vista+/모든 현대 브라우저 지원)
 * entries: [{ pngBuffer, size }] — 각 레이어 PNG는 Alpha Channel 보존 상태여야 함
 */
function pngToIcoMulti(entries) {
  const HEADER_SIZE = 6;
  const ENTRY_SIZE = 16;
  const count = entries.length;
  let dataOffset = HEADER_SIZE + ENTRY_SIZE * count;

  // 전체 버퍼 크기 = 헤더 + 디렉토리 엔트리들 + 모든 PNG 데이터
  const totalSize = dataOffset + entries.reduce((sum, e) => sum + e.pngBuffer.length, 0);
  const buf = Buffer.alloc(totalSize);

  buf.writeUInt16LE(0, 0);         // reserved
  buf.writeUInt16LE(1, 2);         // type: 1 = ICO
  buf.writeUInt16LE(count, 4);     // image count

  entries.forEach(({ pngBuffer, size }, i) => {
    const entryOffset = HEADER_SIZE + ENTRY_SIZE * i;
    buf.writeUInt8(size >= 256 ? 0 : size, entryOffset);      // width (0 = 256)
    buf.writeUInt8(size >= 256 ? 0 : size, entryOffset + 1);  // height
    buf.writeUInt8(0, entryOffset + 2);    // color count
    buf.writeUInt8(0, entryOffset + 3);    // reserved
    buf.writeUInt16LE(1, entryOffset + 4); // color planes
    buf.writeUInt16LE(32, entryOffset + 6);// bit count (32 = RGBA)
    buf.writeUInt32LE(pngBuffer.length, entryOffset + 8);  // data size
    buf.writeUInt32LE(dataOffset, entryOffset + 12);       // data offset

    pngBuffer.copy(buf, dataOffset);
    dataOffset += pngBuffer.length;
  });

  return buf;
}

/** 빨간 원 배경 + 검정 THE LIT 전체 로고 합성 PNG 버퍼 반환 */
async function makeBrandIconBuffer(size, paddingRatio = 0.14) {
  const pad = Math.round(size * paddingRatio);
  const logoSize = size - pad * 2;

  const logoPng = await sharp(LOGO_SRC)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // 투명 캔버스 + 빨간 원 + 검정 로고 (모서리 alpha 0 유지)
  return sharp(redCircleSvg(size))
    .composite([{ input: logoPng, gravity: 'centre' }])
    .png()
    .toBuffer();
}

/** 투명 모서리 → 빨간색으로 채운 solid 버전 (Apple Touch Icon 전용) */
async function makeBrandIconSolid(size, filename, paddingRatio = 0.14) {
  const pad = Math.round(size * paddingRatio);
  const logoSize = size - pad * 2;
  const logoPng = await sharp(LOGO_SRC)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp(redCircleSvg(size))
    .composite([{ input: logoPng, gravity: 'centre' }])
    .flatten({ background: BRAND_RED })  // iOS는 투명 불지원 — 전체 빨간 배경
    .png()
    .toFile(join(OUT, filename));
  console.log(`✓ ${filename} (solid)`);
}

/** 투명 모서리 빨간 원 PNG 생성 */
async function makeBrandIcon(size, filename, paddingRatio = 0.14) {
  const buf = await makeBrandIconBuffer(size, paddingRatio);
  await sharp(buf).toFile(join(OUT, filename));
  console.log(`✓ ${filename}`);
}

async function main() {
  // favicon.ico — 16×16 / 32×32 / 48×48 멀티 레이어 PNG-in-ICO
  // Sharp는 SVG→PNG 변환 시 기본적으로 Alpha 채널을 유지하므로
  // ensureAlpha()를 명시하여 채널 누락을 방지
  const icoEntries = await Promise.all([16, 32, 48].map(async (size) => {
    const logoSize = Math.round(size * (1 - 0.14 * 2));
    const logoPng = await sharp(LOGO_SRC)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    const pngBuffer = await sharp(redCircleSvg(size))
      .ensureAlpha()                                        // Alpha 채널 보존 명시
      .composite([{ input: logoPng, gravity: 'centre' }])
      .png({ compressionLevel: 9 })
      .toBuffer();
    return { pngBuffer, size };
  }));
  writeFileSync(join(OUT, 'favicon.ico'), pngToIcoMulti(icoEntries));
  console.log('✓ favicon.ico (16x16 + 32x32 + 48x48, alpha preserved)');

  await makeBrandIcon(48,  'favicon-48x48.png',          0.14);
  await makeBrandIcon(96,  'favicon-96x96.png',          0.12);
  await makeBrandIconSolid(180, 'apple-touch-icon.png',  0.10);  // iOS 전용: solid 배경
  await makeBrandIcon(192, 'android-chrome-192x192.png', 0.10);
  await makeBrandIcon(512, 'android-chrome-512x512.png', 0.10);

  // favicon.svg — 64×64 Brand Icon PNG를 base64 임베드 (self-contained, 모던 브라우저 최우선)
  const svgBuf = await makeBrandIconBuffer(64, 0.12);
  const svgB64 = svgBuf.toString('base64');
  const faviconSvg =
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 64 64">\n` +
    `  <image width="64" height="64" href="data:image/png;base64,${svgB64}"/>\n` +
    `</svg>\n`;
  writeFileSync(join(OUT, 'favicon.svg'), faviconSvg);
  console.log('✓ favicon.svg');

  console.log('\n모든 favicon 파일 생성 완료.');
}

main().catch((err) => { console.error(err); process.exit(1); });
