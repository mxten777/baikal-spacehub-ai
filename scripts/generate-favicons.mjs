/**
 * generate-favicons.mjs
 * THE LIT 별(✦) 심볼 SVG → favicon 파일 세트 생성
 * 실행: node scripts/generate-favicons.mjs
 *
 * favicon.svg 는 이 스크립트가 덮어쓰지 않음 (public/favicon.svg 가 소스 역할).
 * PNG/ICO 생성에는 sharp의 SVG 래스터라이즈 기능 사용 (librsvg 필요).
 */

import sharp from 'sharp';
import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public');

// PNG 래스터화용 SVG — 투명 배경, 브랜드 레드 #FF050C (라이트모드 고정)
const STAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M16,2 Q17.4,14.6 30,16 Q17.4,17.4 16,30 Q14.6,17.4 2,16 Q14.6,14.6 16,2Z" fill="#FF050C"/>
</svg>`;
const SRC = Buffer.from(STAR_SVG);

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
  await sharp(SRC, { density: Math.round((size / 32) * 72) })
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
  const icoSrc = await sharp(SRC, { density: 72 })
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

  // favicon.svg — public/favicon.svg 를 그대로 유지 (순수 벡터, 덮어쓰지 않음)
  console.log('✓ favicon.svg (스크립트가 덮어쓰지 않음 — public/favicon.svg 직접 관리)');

  console.log('\n모든 favicon 파일 생성 완료.');
}

main().catch((err) => { console.error(err); process.exit(1); });
