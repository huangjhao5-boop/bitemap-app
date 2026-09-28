import { createWorker } from 'tesseract.js';
import { extractRestaurantInfoFromText, type ExtractedRestaurantInfo } from './videoParser';

export type OcrFailureReason = 'init' | 'timeout' | 'empty' | 'error';

export interface OcrParseResult {
  extractedInfo: ExtractedRestaurantInfo;
  rawText: string;
  candidateWords: string[];
  /** 從截圖文字中抽出的「疑似地址」行（依可信度排序） */
  addressCandidates: string[];
  /** 失敗原因（成功辨識時為 undefined），供 UI 顯示明確提示 */
  failureReason?: OcrFailureReason;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let workerInstance: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let workerPromise: Promise<any> | null = null;

function withTimeout<T>(p: Promise<T>, ms: number, tag: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(tag)), ms);
    p.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}

async function getOcrWorker() {
  if (workerInstance) return workerInstance;
  if (!workerPromise) {
    workerPromise = (async () => {
      // 語言包依序降級：繁中+日+英 → 繁中+英 → 英
      const langSets = ['chi_tra+jpn+eng', 'chi_tra+eng', 'eng'];
      let lastErr: unknown;
      for (const langs of langSets) {
        try {
          const worker = await createWorker(langs);
          workerInstance = worker;
          return worker;
        } catch (err) {
          lastErr = err;
          console.warn(`OCR worker init failed for ${langs}`, err);
        }
      }
      throw lastErr;
    })().catch((err) => {
      workerPromise = null;
      workerInstance = null;
      throw err;
    });
  }
  return workerPromise;
}

/**
 * 影像前處理
 * - 'plain'   ：只縮放（長邊上限 2400；太小的圖放大到長邊 1600），保留彩色，適合手機截圖
 * - 'enhanced'：灰階 + 對比，適合翻拍、招牌、低對比照片（作為第二次嘗試）
 */
export function preprocessImageForOcr(imageSource: string, mode: 'plain' | 'enhanced' = 'plain'): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const MAX_DIM = 2400;
      const MIN_DIM = 1600;
      const longSide = Math.max(img.width, img.height);
      let scale = 1;
      if (longSide > MAX_DIM) scale = MAX_DIM / longSide;
      else if (longSide < MIN_DIM) scale = MIN_DIM / longSide;

      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageSource);
        return;
      }
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      if (mode === 'enhanced') {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const contrast = 40;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        for (let i = 0; i < data.length; i += 4) {
          const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const v = Math.min(255, Math.max(0, factor * (avg - 128) + 128));
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // PNG：避免 JPEG 壓縮在小字邊緣產生雜訊
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(imageSource);
    img.src = imageSource;
  });
}

const CJK = '\\u3040-\\u30ff\\u3400-\\u9fff\\uff00-\\uffef';

/**
 * Tesseract 的中日文輸出常在每個字之間插入空白（「炒 飯 信」），
 * 會讓後續所有 regex 全部失效。這裡先移除 CJK 字元之間的空白。
 */
export function normalizeOcrText(text: string): string {
  return text
    .replace(/\r/g, '')
    .replace(new RegExp(`(?<=[${CJK}])[ \\t\\u3000]+(?=[${CJK}])`, 'g'), '')
    .replace(new RegExp(`(?<=[${CJK}])[ \\t\\u3000]+(?=[0-9０-９])`, 'g'), '')
    .replace(new RegExp(`(?<=[0-9０-９])[ \\t\\u3000]+(?=[${CJK}])`, 'g'), '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

const JP_PREF = '(?:北海道|東京都|京都府|大阪府|青森県|岩手県|宮城県|秋田県|山形県|福島県|茨城県|栃木県|群馬県|埼玉県|千葉県|神奈川県|新潟県|富山県|石川県|福井県|山梨県|長野県|岐阜県|静岡県|愛知県|三重県|滋賀県|兵庫県|奈良県|和歌山県|鳥取県|島根県|岡山県|広島県|山口県|徳島県|香川県|愛媛県|高知県|福岡県|佐賀県|長崎県|熊本県|大分県|宮崎県|鹿児島県|沖縄県)';
const TW_CITY = '(?:台北|新北|桃園|台中|台南|高雄|基隆|新竹|嘉義|苗栗|彰化|南投|雲林|屏東|宜蘭|花蓮|台東|澎湖|金門)';
const JP_ADDR_FULL = new RegExp(`(?:〒?\\s?\\d{3}-?\\d{4}\\s*)?${JP_PREF}[一-龠ぁ-んァ-ヶー]{1,10}?[市区町村郡][^\\n。、,，\\s]{0,40}`);
const JP_ADDR_SHORT = /[一-龠ぁ-んァ-ヶ]{1,8}[市区町村][一-龠ぁ-んァ-ヶー]{0,10}[0-9０-９]+[0-9０-９丁目番地号\-ー−‐－]*/;
const TW_ADDR = new RegExp(`${TW_CITY}[縣市][一-龠]{1,4}[區鄉鎮市][一-龠0-9０-９段巷弄路街道]{1,24}[0-9０-９之\\-]+號[0-9０-９樓Ff\\-]*`);
const TW_ADDR_SHORT = /[一-龠]{1,3}[區鄉鎮][一-龠0-9０-９段巷弄]{0,10}[路街道][一-龠0-9０-９段巷弄]{0,8}[0-9０-９之\-]+號/;
const LABELED_ADDR = /(?:地址|住所|所在地|Address|ADD)[：:\s]*([^\n]{6,60})/i;

/** 由 OCR 文字抽出疑似地址（去重、依可信度排序：有標籤 > 完整格式 > 簡短格式） */
export function extractAddressCandidates(rawText: string): string[] {
  const text = normalizeOcrText(rawText).replace(/臺/g, '台');
  const out: string[] = [];
  const push = (s: string | undefined) => {
    if (!s) return;
    let cleaned = s.trim().replace(/[)）】」』\s]+$/, '');
    // 數字之後緊接的假名/英文多半是黏在一起的下一段文字（例如「12-3ラーメン」）
    cleaned = cleaned.replace(/(?<=[0-9０-９号番地目])[ぁ-んァ-ヶーA-Za-z]+$/, '');
    if (cleaned.length >= 5 && cleaned.length <= 70 && !out.includes(cleaned)) out.push(cleaned);
  };

  const labeled = text.match(LABELED_ADDR);
  push(labeled?.[1]);

  for (const line of text.split('\n')) {
    push(line.match(JP_ADDR_FULL)?.[0]);
    push(line.match(TW_ADDR)?.[0]);
  }
  // 完整格式都找不到時，才退而求其次使用簡短格式（避免把店名黏進地址）
  if (out.length === 0) {
    for (const line of text.split('\n')) {
      push(line.match(JP_ADDR_SHORT)?.[0]);
      push(line.match(TW_ADDR_SHORT)?.[0]);
    }
  }
  // 去除被其他候選完整包含的殘片（例如「北市三重區…」是「新北市三重區…」的一部分）
  const deduped = out.filter((c, i) => !out.some((o, j) => j !== i && o.length > c.length && o.includes(c)));
  return deduped.slice(0, 5);
}

async function recognizeOnce(imageSource: string, mode: 'plain' | 'enhanced'): Promise<string> {
  const processed = await preprocessImageForOcr(imageSource, mode);
  const worker = await getOcrWorker();
  const ret = (await withTimeout(worker.recognize(processed), 40000, 'OCR_TIMEOUT')) as { data?: { text?: string } };
  return normalizeOcrText(ret?.data?.text || '');
}

/**
 * 離線影像文字辨識（全自動本機運行，0 API 費用、0 金鑰）
 * 流程：彩色原圖辨識 →（文字太少才）灰階增強再辨識一次
 */
export async function parseScreenshotWithOcr(imageSource: string): Promise<OcrParseResult> {
  const empty = (failureReason: OcrFailureReason): OcrParseResult => ({
    extractedInfo: { mustEatDishes: [], avoidDishes: [] },
    rawText: '',
    candidateWords: [],
    addressCandidates: [],
    failureReason,
  });

  try {
    // 語言包首次下載可能較久，獨立計時（60 秒），與辨識計時分開
    try {
      await withTimeout(getOcrWorker(), 60000, 'OCR_INIT_TIMEOUT');
    } catch (e) {
      console.warn('OCR init failed', e);
      return empty('init');
    }

    let rawText = await recognizeOnce(imageSource, 'plain');
    if (rawText.replace(/\s/g, '').length < 8) {
      const second = await recognizeOnce(imageSource, 'enhanced');
      if (second.length > rawText.length) rawText = second;
    }

    if (!rawText.replace(/\s/g, '')) return empty('empty');

    const extractedInfo = extractRestaurantInfoFromText(rawText);
    const addressCandidates = extractAddressCandidates(rawText);
    if (!extractedInfo.address && addressCandidates[0]) {
      extractedInfo.address = addressCandidates[0];
    }

    const words: string[] = rawText
      .split(/[\n,，。!！?？\s]+/)
      .map((w) =>
        w.trim().replace(
          /^[^\w\u4e00-\u9fa5\u3040-\u309F\u30A0-\u30FF]+|[^\w\u4e00-\u9fa5\u3040-\u309F\u30A0-\u30FF]+$/g,
          ''
        )
      )
      .filter((w) => w.length >= 2 && w.length <= 25 && !w.startsWith('http') && !/^\d+$/.test(w));

    return {
      extractedInfo,
      rawText,
      candidateWords: Array.from(new Set(words)).slice(0, 20),
      addressCandidates,
    };
  } catch (err) {
    console.warn('OCR processing error', err);
    const timedOut = err instanceof Error && err.message === 'OCR_TIMEOUT';
    // 重置 worker，確保下次可重新初始化
    workerPromise = null;
    if (workerInstance && typeof workerInstance.terminate === 'function') {
      try { workerInstance.terminate(); } catch { /* ignore */ }
    }
    workerInstance = null;
    return empty(timedOut ? 'timeout' : 'error');
  }
}
