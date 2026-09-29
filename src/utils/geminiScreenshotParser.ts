import { loadFirebaseModules } from './firebase';

export interface GeminiScreenshotResult {
  name?: string;
  category?: string;
  city?: string;
  address?: string;
  mustEatDishes?: string[];
  confidence: number;
  mode: 'flash-lite' | 'flash-fallback';
  needsReview: boolean;
  reason?: string;
}

const ENDPOINT = import.meta.env.VITE_GEMINI_OCR_API_URL as string | undefined;

function shrinkImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const maxSide = 1800;
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        resolve(dataUrl);
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
}

export type GeminiProgressStatus = 'connecting' | 'analyzing' | 'complete' | 'unavailable';
export type GeminiProgressCallback = (status: GeminiProgressStatus, detail: string) => void;

/** Uses the authenticated backend; when it is not configured or reachable, local OCR remains available. */
export async function parseScreenshotWithGemini(
  imageDataUrl: string,
  ocrText: string,
  onProgress?: GeminiProgressCallback
): Promise<GeminiScreenshotResult | null> {
  if (!ENDPOINT) {
    onProgress?.('unavailable', 'Gemini 服務尚未設定');
    return null;
  }

  try {
    onProgress?.('connecting', '正在連接 Gemini…');
    const fb = await loadFirebaseModules();
    if (!fb) {
      onProgress?.('unavailable', 'Firebase 無法初始化，改用 OCR 結果');
      return null;
    }
    let user = fb.auth.currentUser;
    if (!user && fb.authMod.signInAnonymously) {
      const credential = await fb.authMod.signInAnonymously(fb.auth);
      user = credential.user;
    }
    if (!user) {
      onProgress?.('unavailable', '登入驗證未完成，改用 OCR 結果');
      return null;
    }

    const token = await user.getIdToken();
    const image = await shrinkImage(imageDataUrl);
    onProgress?.('analyzing', 'Gemini 正在核對截圖和 OCR 文字…');
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imageDataUrl: image, ocrText: ocrText.slice(0, 12000) }),
    });
    if (!response.ok) {
      onProgress?.('unavailable', `Gemini 服務回應 ${response.status}，改用 OCR 結果`);
      console.warn('Gemini screenshot service returned', response.status);
      return null;
    }

    const result = await response.json() as GeminiScreenshotResult;
    if (!result || typeof result.confidence !== 'number' || !result.mode) {
      onProgress?.('unavailable', 'Gemini 回傳資料不完整，改用 OCR 結果');
      return null;
    }
    onProgress?.(
      'complete',
      `Gemini ${result.mode === 'flash-fallback' ? '3.8 Flash' : '3.1 Flash-Lite'} 核對完成`
    );
    return result;
  } catch (error) {
    onProgress?.('unavailable', 'Gemini 連線失敗，保留 OCR 結果供你核對');
    console.warn('Gemini screenshot service unavailable; using local OCR', error);
    return null;
  }
}
