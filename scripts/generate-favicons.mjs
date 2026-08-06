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

/** ICO 컨테이너에 PNG 데이터를 감싸는 최소 ICO 포맷 (PNG-in-ICO, Win Vista+/모든 현대 브라우저 지원) */
function pngToIco(pngBuffer, size) {
  const HEADER_SIZE = 6;
  const ENTRY_SIZE = 16;
  const dataOffset = HEADER_SIZE + ENTRY_SIZE;
  const buf = Buffer.alloc(dataOffset + pngBuffer.length);

  buf.writeUInt16LE(0, 0);
  buf.writeUInt16LE(1, 2);                          // type: 1 = ICO
  buf.writeUInt16LE(1, 4);                          // image count: 1
  buf.writeUInt8(size >= 256 ? 0 : size, 6);
  buf.writeUInt8(size >= 256 ? 0 : size, 7);
  buf.writeUInt8(0, 8);
  buf.writeUInt8(0, 9);
  buf.writeUInt16LE(1, 10);
  buf.writeUInt16LE(32, 12);
  buf.writeUInt32LE(pngBuffer.length, 14);
  buf.writeUInt32LE(dataOffset, 18);
  pngBuffer.copy(buf, dataOffset);
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

  return sharp(redCircleSvg(size))
    .composite([{ input: logoPng, gravity: 'centre' }])
    .png()
    .toBuffer();
}

/**
 * 빨간 원 배경 + 검정 THE LIT 로고 합성 PNG 생성
 * paddingRatio: 아이콘 크기 대비 여백 비율
 */
async function makeBrandIcon(size, filename, paddingRatio = 0.14) {
  const buf = await makeBrandIconBuffer(size, paddingRatio);
  await sharp(buf).toFile(join(OUT, filename));
  console.log(`✓ ${filename}`);
}

async function main() {
  // favicon.ico — 32×32 PNG-in-ICO
  const icoLogoSize = Math.round(32 * (1 - 0.14 * 2));
  const icoLogo = await sharp(LOGO_SRC)
    .resize(icoLogoSize, icoLogoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const icoPng = await sharp(redCircleSvg(32))
    .composite([{ input: icoLogo, gravity: 'centre' }])
    .png()
    .toBuffer();
  writeFileSync(join(OUT, 'favicon.ico'), pngToIco(icoPng, 32));
  console.log('✓ favicon.ico');

  await makeBrandIcon(48,  'favicon-48x48.png',          0.14);
  await makeBrandIcon(96,  'favicon-96x96.png',          0.12);
  await makeBrandIcon(180, 'apple-touch-icon.png',       0.10);
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
