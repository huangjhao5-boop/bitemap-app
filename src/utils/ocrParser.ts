import { createWorker } from 'tesseract.js';
import { extractRestaurantInfoFromText, type ExtractedRestaurantInfo } from './videoParser';

export interface OcrParseResult {
  extractedInfo: ExtractedRestaurantInfo;
  rawText: string;
  candidateWords: string[];
}

let workerPromise: Promise<any> | null = null;

async function getOcrWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      try {
        const worker = await createWorker('chi_tra+eng');
        return worker;
      } catch (err) {
        console.warn('Failed to load chi_tra+eng worker, falling back to eng', err);
        const worker = await createWorker('eng');
        return worker;
      }
    })();
  }
  return workerPromise;
}

/**
 * 前處理圖片：將圖片繪製至 Canvas 並提升對比度與銳利度，增強短影音字幕與招牌標籤之辨識率
 */
export function preprocessImageForOcr(imageSource: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_DIM = 1200;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        }
      } else {
        if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageSource);
        return;
      }

      // 繪製原圖
      ctx.drawImage(img, 0, 0, width, height);
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // 適度拉高對比度 (Contrast Enhancement)
      const contrast = 30; // -255 to 255
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

      for (let i = 0; i < data.length; i += 4) {
        // 灰階化
        const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const color = factor * (avg - 128) + 128;
        const finalVal = Math.min(255, Math.max(0, color));
        data[i] = finalVal;
        data[i + 1] = finalVal;
        data[i + 2] = finalVal;
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => resolve(imageSource);
    img.src = imageSource;
  });
}

/**
 * 離線影像文字辨識（全自動本機運行，0 API 費用、0 金鑰）
 */
export async function parseScreenshotWithOcr(imageSource: string): Promise<OcrParseResult> {
  try {
    const processedImage = await preprocessImageForOcr(imageSource);
    
    // 🛡️ 8 秒超時熔斷保護，防止慢速網路或載入權限異常導致 UI 永久卡在「辨識中...」
    const timeoutPromise = new Promise<{ data: { text: string } }>((_, reject) => {
      setTimeout(() => reject(new Error('OCR Timeout')), 8000);
    });

    const worker = await getOcrWorker();
    const ret = await Promise.race([
      worker.recognize(processedImage),
      timeoutPromise
    ]);
    const rawText = ret.data.text || '';

    // 使用離線 NLP 引擎提取結構化店家資訊
    const extractedInfo = extractRestaurantInfoFromText(rawText);

    // 提煉出短字候選詞彙（供使用者點擊快填）
    const lines: string[] = rawText
      .split(/[\n,，。!！?？\s]+/)
      .map((w: string) => w.trim().replace(/^[^\w\u4e00-\u9fa5]+|[^\w\u4e00-\u9fa5]+$/g, ''))
      .filter((w: string) => w.length >= 2 && w.length <= 25 && !w.startsWith('http') && !/^\d+$/.test(w));

    const candidateWords: string[] = Array.from(new Set(lines)).slice(0, 20);

    return {
      extractedInfo,
      rawText,
      candidateWords,
    };
  } catch (err) {
    console.error('OCR recognition error', err);
    return {
      extractedInfo: { mustEatDishes: [], avoidDishes: [] },
      rawText: '',
      candidateWords: [],
    };
  }
}
