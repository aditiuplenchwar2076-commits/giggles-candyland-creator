// Baby Transformation Service for Giggles' Candyland
// Calls the backend serverless AI endpoint (/api/transform-baby) to generate
// a genuine AI baby portrait using Google Gemini Vision + Google Imagen 3.

const DEFAULT_TRANSFORM_PROMPT = 
  "Transform the person in the provided photograph into an extremely adorable, extra-chubby baby version of the SAME person. " +
  "Preserve their recognizable identity and natural skin tone. Give them enormous sparkling eyes, round rosy cheeks, soft pink blush, " +
  "a tiny nose, a small cute mouth, a round forehead, a tiny chin, and irresistibly plump baby proportions. " +
  "Remove all facial hair completely, including moustache, beard, and stubble. Replace the adult hairstyle with very sparse, fine, short baby hair. " +
  "If glasses are present, preserve them where possible and fit them naturally to the baby face. " +
  "Use soft pastel-pink lighting and a gentle, dreamy Candyland aesthetic. Make the transformation anatomically coherent and high quality, " +
  "with realistic facial details and a cute stylized finish. Preserve the person's identity while clearly transforming their facial proportions into those of a baby. " +
  "Do not return a generic baby, a collage, or a simple filtered adult face. Return one finished, edited image.";

/**
 * Gets the saved Gemini API key from localStorage if present
 */
export function getStoredGeminiKey() {
  try {
    return localStorage.getItem('giggles_gemini_api_key') || '';
  } catch {
    return '';
  }
}

/**
 * Stores the Gemini API key in localStorage
 */
export function storeGeminiKey(key) {
  try {
    if (key) {
      localStorage.setItem('giggles_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('giggles_gemini_api_key');
    }
  } catch (err) {
    console.warn('Could not store Gemini API key in localStorage:', err);
  }
}

/**
 * Sends the user photograph to the backend AI transformation endpoint.
 *
 * @param {string} imageSrc - Base64 data URL of the uploaded portrait (JPEG, PNG, WEBP)
 * @param {object} options - Optional configuration { prompt, apiKey, onProgress }
 * @returns {Promise<{ success: boolean, dataUrl: string, provider: string, prompt: string }>}
 */
export async function transformToBabyPortrait(imageSrc, options = {}) {
  const { prompt = DEFAULT_TRANSFORM_PROMPT, apiKey, onProgress } = options;
  const activeKey = apiKey || getStoredGeminiKey();

  if (onProgress) {
    onProgress({ step: 1, text: 'Sending portrait to Giggles AI Studio...' });
  }

  let response;
  try {
    response = await fetch('/api/transform-baby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(activeKey ? { 'x-gemini-api-key': activeKey } : {}),
      },
      body: JSON.stringify({
        image: imageSrc,
        prompt: prompt,
        apiKey: activeKey || undefined,
        options: {
          style: '3D',
        },
      }),
    });
  } catch (netErr) {
    throw new Error(
      `Network error connecting to Giggles AI Studio: ${netErr.message}. Please check your connection and try again.`
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    const errorMsg = data.message || data.error || `Server returned error (${response.status} ${response.statusText})`;
    const error = new Error(errorMsg);
    error.code = data.code || 'GENERATION_FAILED';
    error.provider = data.provider;
    error.supportedProviders = data.supportedProviders;
    throw error;
  }

  if (!data.resultImage) {
    throw new Error('AI studio responded successfully but returned an empty image payload.');
  }

  if (onProgress) {
    onProgress({ step: 5, text: 'Baby portrait generation complete! ✨' });
  }

  return {
    success: true,
    dataUrl: data.resultImage,
    provider: data.provider || 'gemini',
    prompt: data.prompt || prompt,
  };
}
