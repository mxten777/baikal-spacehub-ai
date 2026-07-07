/**
 * Full-page screenshot → PDF 캡처 스크립트
 *
 * 사용법:
 *   npm run capture:pdf                     # 기본 (thelit.kr)
 *   npm run capture:pdf -- https://thelit.kr
 *   npm run capture:pdf -- http://localhost:5173
 */

import { chromium } from "playwright";
import { PDFDocument } from "pdf-lib";
import * as fs from "fs";
import * as path from "path";
import { defaultConfig, type CaptureConfig } from "./capture.config.js";

// ─── 날짜 헬퍼 ─────────────────────────────────────────────────────────────────

function todayStr(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ─── 경로 설정 ─────────────────────────────────────────────────────────────────

function buildPaths(config: CaptureConfig) {
  const date = todayStr();
  const root = path.resolve("captures", `${config.siteName}-${date}`);
  const imagesDir = path.join(root, "images");
  const pdfDir = path.join(root, "pdf");
  const logFile = path.join(root, "log.txt");
  const pdfFile = path.join(
    pdfDir,
    `${config.siteName}-full-capture-${date}.pdf`,
  );
  return { root, imagesDir, pdfDir, logFile, pdfFile };
}

// ─── 로거 ──────────────────────────────────────────────────────────────────────

function createLogger(logFile: string) {
  const lines: string[] = [];

  function write(msg: string) {
    const ts = new Date().toISOString();
    const line = `[${ts}] ${msg}`;
    console.log(line);
    lines.push(line);
  }

  function flush() {
    fs.writeFileSync(logFile, lines.join("\n") + "\n", "utf-8");
  }

  return { write, flush };
}

// ─── Lazy Loading 유발 스크롤 ─────────────────────────────────────────────────

async function scrollToLoadImages(
  page: import("playwright").Page,
  step: number,
  delay: number,
) {
  await page.evaluate(
    async ({ step, delay }) => {
      await new Promise<void>((resolve) => {
        let scrolled = 0;
        const height = document.body.scrollHeight;

        const timer = setInterval(() => {
          window.scrollBy(0, step);
          scrolled += step;
          if (scrolled >= height) {
            clearInterval(timer);
            resolve();
          }
        }, delay);
      });
    },
    { step, delay },
  );

  // 상단으로 복귀
  await page.evaluate(() => window.scrollTo(0, 0));
  // 상단 복귀 후 짧게 대기
  await page.waitForTimeout(300);
}

// ─── 단일 페이지 캡처 ─────────────────────────────────────────────────────────

async function capturePage(
  page: import("playwright").Page,
  url: string,
  outputPath: string,
  config: CaptureConfig,
  log: (msg: string) => void,
): Promise<boolean> {
  try {
    log(`접속 중: ${url}`);
    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });

    // 페이지 로딩 후 추가 대기 (애니메이션 등 안정화)
    await page.waitForTimeout(config.waitAfterLoad);

    // Lazy Loading 이미지 유발 스크롤
    await scrollToLoadImages(page, config.scrollStep, config.scrollDelay);

    // 전체 화면 캡처
    await page.screenshot({ path: outputPath, fullPage: true });
    log(`캡처 완료: ${path.basename(outputPath)}`);
    return true;
  } catch (err) {
    log(`캡처 실패: ${url} — ${(err as Error).message}`);
    return false;
  }
}

// ─── PNG 이미지 → PDF 변환 ────────────────────────────────────────────────────

async function buildPdf(
  imagePaths: string[],
  pdfPath: string,
  log: (msg: string) => void,
): Promise<void> {
  log("PDF 생성 시작...");
  const pdfDoc = await PDFDocument.create();

  for (const imgPath of imagePaths) {
    if (!fs.existsSync(imgPath)) {
      log(`스킵 (파일 없음): ${path.basename(imgPath)}`);
      continue;
    }

    const imgBytes = fs.readFileSync(imgPath);
    const pngImage = await pdfDoc.embedPng(imgBytes);
    const { width, height } = pngImage.scale(1);

    const pdfPage = pdfDoc.addPage([width, height]);
    pdfPage.drawImage(pngImage, { x: 0, y: 0, width, height });
    log(`PDF에 추가: ${path.basename(imgPath)}`);
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(pdfPath, pdfBytes);
  log(`PDF 저장 완료: ${pdfPath}`);
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

async function main() {
  // CLI 인수로 baseUrl 오버라이드 가능
  const cliUrl = process.argv[2];
  const config: CaptureConfig = {
    ...defaultConfig,
    ...(cliUrl ? { baseUrl: cliUrl.replace(/\/$/, "") } : {}),
  };

  const paths = buildPaths(config);
  fs.mkdirSync(paths.imagesDir, { recursive: true });
  fs.mkdirSync(paths.pdfDir, { recursive: true });

  const logger = createLogger(paths.logFile);
  const log = logger.write;

  log(`=== 캡처 시작 ===`);
  log(`대상 사이트: ${config.baseUrl}`);
  log(`뷰포트: ${config.viewportWidth}x${config.viewportHeight}`);
  log(`저장 경로: ${paths.root}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: config.viewportWidth, height: config.viewportHeight },
  });
  const page = await context.newPage();

  const capturedImages: string[] = [];
  let successCount = 0;
  let failCount = 0;

  for (const pageConfig of config.pages) {
    const url = `${config.baseUrl}${pageConfig.path}`;
    const imgPath = path.join(paths.imagesDir, `${pageConfig.filename}.png`);

    const ok = await capturePage(page, url, imgPath, config, log);
    if (ok) {
      capturedImages.push(imgPath);
      successCount++;
    } else {
      failCount++;
    }
  }

  await browser.close();

  log(`─── 캡처 완료: 성공 ${successCount}건 / 실패 ${failCount}건 ───`);

  if (capturedImages.length > 0) {
    await buildPdf(capturedImages, paths.pdfFile, log);
  } else {
    log("캡처된 이미지가 없어 PDF를 생성하지 않습니다.");
  }

  log(`=== 작업 완료 ===`);
  logger.flush();

  console.log("\n결과물 위치:");
  console.log(`  이미지: ${paths.imagesDir}`);
  console.log(`  PDF   : ${paths.pdfFile}`);
  console.log(`  로그  : ${paths.logFile}`);

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("치명적 오류:", err);
  process.exit(1);
});
