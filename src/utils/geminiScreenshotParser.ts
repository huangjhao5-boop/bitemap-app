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

/** Uses the authenticated backend; when it is not configured or reachable, local OCR remains available. */
export async function parseScreenshotWithGemini(
  imageDataUrl: string,
  ocrText: string
): Promise<GeminiScreenshotResult | null> {
  if (!ENDPOINT) return null;

  try {
    const fb = await loadFirebaseModules();
    if (!fb) return null;
    let user = fb.auth.currentUser;
    if (!user && fb.authMod.signInAnonymously) {
      const credential = await fb.authMod.signInAnonymously(fb.auth);
      user = credential.user;
    }
    if (!user) return null;

    const token = await user.getIdToken();
    const image = await shrinkImage(imageDataUrl);
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imageDataUrl: image, ocrText: ocrText.slice(0, 12000) }),
    });
    if (!response.ok) {
      console.warn('Gemini screenshot service returned', response.status);
      return null;
    }

    const result = await response.json() as GeminiScreenshotResult;
    if (!result || typeof result.confidence !== 'number' || !result.mode) return null;
    return result;
  } catch (error) {
    console.warn('Gemini screenshot service unavailable; using local OCR', error);
    return null;
  }
}
