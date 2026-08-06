/**
 * generate-favicons.mjs
 * public/images/thelitlogo_red_trans.png → favicon 파일 세트 생성
 * 실행: node scripts/generate-favicons.mjs
 */

import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, '../public/images/thelitlogo_red_trans.png');
const OUT = join(__dirname, '../public');

/** ICO 컨테이너에 PNG 데이터를 감싸는 최소 ICO 포맷 (PNG-in-ICO, Win Vista+/모든 현대 브라우저 지원) */
function pngToIco(pngBuffer, size) {
  const HEADER_SIZE = 6;
  const ENTRY_SIZE = 16;
  const dataOffset = HEADER_SIZE + ENTRY_SIZE;
  const buf = Buffer.alloc(dataOffset + pngBuffer.length);

  buf.writeUInt16LE(0, 0);                          // reserved
  buf.writeUInt16LE(1, 2);                          // type: 1 = ICO
  buf.writeUInt16LE(1, 4);                          // image count: 1
  buf.writeUInt8(size >= 256 ? 0 : size, 6);        // width (0 = 256)
  buf.writeUInt8(size >= 256 ? 0 : size, 7);        // height
  buf.writeUInt8(0, 8);                             // color count
  buf.writeUInt8(0, 9);                             // reserved
  buf.writeUInt16LE(1, 10);                         // planes
  buf.writeUInt16LE(32, 12);                        // bit count
  buf.writeUInt32LE(pngBuffer.length, 14);          // size of PNG data
  buf.writeUInt32LE(dataOffset, 18);                // offset to PNG data
  pngBuffer.copy(buf, dataOffset);
  return buf;
}

/** 흰 배경 + 여백이 있는 정사각형 PNG를 생성 */
async function makePng(size, filename, paddingRatio = 0.1) {
  const pad = Math.round(size * paddingRatio);
  const logoSize = size - pad * 2;
  await sharp(SRC)
    .resize(logoSize, logoSize, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .extend({
      top: pad, bottom: pad, left: pad, right: pad,
      background: { r: 255, g: 255, b: 255, alpha: 255 },
    })
    .flatten({ background: '#ffffff' })
    .png()
    .toFile(join(OUT, filename));
  console.log(`✓ ${filename}`);
}

async function main() {
  // favicon.ico — 32×32 PNG-in-ICO
  const icoSrc = await sharp(SRC)
    .resize(28, 28, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .extend({ top: 2, bottom: 2, left: 2, right: 2, background: { r: 255, g: 255, b: 255, alpha: 255 } })
    .flatten({ background: '#ffffff' })
    .png()
    .toBuffer();
  writeFileSync(join(OUT, 'favicon.ico'), pngToIco(icoSrc, 32));
  console.log('✓ favicon.ico');

  await makePng(48, 'favicon-48x48.png', 0.1);
  await makePng(96, 'favicon-96x96.png', 0.1);
  await makePng(180, 'apple-touch-icon.png', 0.1);
  await makePng(192, 'android-chrome-192x192.png', 0.08);
  await makePng(512, 'android-chrome-512x512.png', 0.08);

  // favicon.svg — 공식 로고 PNG를 base64로 내장한 SVG (브라우저 탭 & PWA 고해상도)
  const svgPng = await sharp(SRC)
    .resize(168, 168, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .extend({ top: 12, bottom: 12, left: 12, right: 12, background: { r: 255, g: 255, b: 255, alpha: 255 } })
    .flatten({ background: '#ffffff' })
    .png()
    .toBuffer();
  const b64 = svgPng.toString('base64');
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 192 192">',
    `  <image width="192" height="192" href="data:image/png;base64,${b64}"/>`,
    '</svg>',
  ].join('\n');
  writeFileSync(join(OUT, 'favicon.svg'), svg);
  console.log('✓ favicon.svg');

  console.log('\n모든 favicon 파일 생성 완료.');
}

main().catch((err) => { console.error(err); process.exit(1); });
