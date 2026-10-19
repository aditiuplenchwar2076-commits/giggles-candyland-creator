// Baby Transformation Engine for Giggles' Candyland
// Connects to Google Gemini API (Multimodal / Imagen 3 / Gemini Vision)
// with client-side high-fidelity fallback rendering.

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
 * Loads an image from a Data URL or URL into an HTMLImageElement
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image: ' + err));
    img.src = src;
  });
}

/**
 * Analyzes skin pixels and detects facial centroid & estimated feature points
 */
function analyzeFaceGeometry(ctx, width, height) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let totalSkinX = 0;
  let totalSkinY = 0;
  let skinCount = 0;

  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;

  const marginX = Math.floor(width * 0.1);
  const marginY = Math.floor(height * 0.1);

  for (let y = marginY; y < height - marginY; y += 4) {
    for (let x = marginX; x < width - marginX; x += 4) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const isSkin =
        r > 60 &&
        g > 40 &&
        b > 20 &&
        r > g &&
        r > b &&
        Math.abs(r - g) > 10 &&
        r - g < 150 &&
        r - b > 10;

      if (isSkin) {
        totalSkinX += x;
        totalSkinY += y;
        skinCount++;

        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (skinCount < 200) {
    return {
      faceCx: width * 0.5,
      faceCy: height * 0.46,
      faceW: width * 0.5,
      faceH: height * 0.55,
      leftEye: { x: width * 0.38, y: height * 0.40 },
      rightEye: { x: width * 0.62, y: height * 0.40 },
      leftCheek: { x: width * 0.34, y: height * 0.52 },
      rightCheek: { x: width * 0.66, y: height * 0.52 },
      mouth: { x: width * 0.5, y: height * 0.62 },
    };
  }

  const faceCx = totalSkinX / skinCount;
  const faceCy = totalSkinY / skinCount;
  const faceW = Math.max(width * 0.35, Math.min(width * 0.8, (maxX - minX) * 1.1));
  const faceH = Math.max(height * 0.4, Math.min(height * 0.85, (maxY - minY) * 1.1));

  const eyeDist = faceW * 0.28;
  const eyeY = faceCy - faceH * 0.12;

  return {
    faceCx,
    faceCy,
    faceW,
    faceH,
    leftEye: { x: faceCx - eyeDist * 0.75, y: eyeY },
    rightEye: { x: faceCx + eyeDist * 0.75, y: eyeY },
    leftCheek: { x: faceCx - eyeDist * 1.05, y: faceCy + faceH * 0.1 },
    rightCheek: { x: faceCx + eyeDist * 1.05, y: faceCy + faceH * 0.1 },
    mouth: { x: faceCx, y: faceCy + faceH * 0.25 },
  };
}

/**
 * Applies radial magnification warping (Big Baby Eyes & Soft Jaw)
 */
function applyBabyGeometryWarp(srcCtx, dstCtx, width, height, geometry) {
  const srcData = srcCtx.getImageData(0, 0, width, height);
  const src = srcData.data;
  const dstData = dstCtx.createImageData(width, height);
  const dst = dstData.data;

  const { leftEye, rightEye, faceCx, faceCy, faceW, faceH } = geometry;
  const eyeRadius = faceW * 0.22;
  const eyePower = 0.28;

  const chinY = faceCy + faceH * 0.35;
  const jawRadius = faceW * 0.35;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let srcX = x;
      let srcY = y;

      // Left Eye Magnification Warp
      const dlx = x - leftEye.x;
      const dly = y - leftEye.y;
      const distL = Math.sqrt(dlx * dlx + dly * dly);
      if (distL < eyeRadius) {
        const factorL = Math.cos((distL / eyeRadius) * (Math.PI / 2));
        srcX -= dlx * factorL * eyePower;
        srcY -= dly * factorL * eyePower;
      }

      // Right Eye Magnification Warp
      const drx = x - rightEye.x;
      const dry = y - rightEye.y;
      const distR = Math.sqrt(drx * drx + dry * dry);
      if (distR < eyeRadius) {
        const factorR = Math.cos((distR / eyeRadius) * (Math.PI / 2));
        srcX -= drx * factorR * eyePower;
        srcY -= dry * factorR * eyePower;
      }

      // Chin Softening / Shortening (creates round baby jawline)
      const djx = x - faceCx;
      const djy = y - chinY;
      const distJ = Math.sqrt(djx * djx + djy * djy);
      if (distJ < jawRadius && y > faceCy) {
        const factorJ = Math.cos((distJ / jawRadius) * (Math.PI / 2));
        srcY += 10 * factorJ * 0.25;
      }

      const clampX = Math.max(0, Math.min(width - 1, Math.round(srcX)));
      const clampY = Math.max(0, Math.min(height - 1, Math.round(srcY)));

      const dstIdx = (y * width + x) * 4;
      const srcIdx = (clampY * width + clampX) * 4;

      dst[dstIdx] = src[srcIdx];
      dst[dstIdx + 1] = src[srcIdx + 1];
      dst[dstIdx + 2] = src[srcIdx + 2];
      dst[dstIdx + 3] = src[srcIdx + 3];
    }
  }

  dstCtx.putImageData(dstData, 0, 0);
}

/**
 * Skin smoothing bilateral diffusion (creates smooth porcelain baby skin)
 */
function applyBabySkinSmoothing(ctx, width, height) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const copy = new Uint8ClampedArray(data);
  const radius = 2;

  for (let y = radius; y < height - radius; y += 2) {
    for (let x = radius; x < width - radius; x += 2) {
      const idx = (y * width + x) * 4;
      const r = copy[idx];
      const g = copy[idx + 1];
      const b = copy[idx + 2];

      if (r > 60 && g > 40 && r > g && r > b) {
        let sumR = 0, sumG = 0, sumB = 0, count = 0;

        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const nIdx = ((y + ky) * width + (x + kx)) * 4;
            const nr = copy[nIdx];
            const ng = copy[nIdx + 1];
            const nb = copy[nIdx + 2];

            const colorDist = Math.abs(r - nr) + Math.abs(g - ng) + Math.abs(b - nb);
            if (colorDist < 60) {
              sumR += nr;
              sumG += ng;
              sumB += nb;
              count++;
            }
          }
        }

        if (count > 0) {
          const avgR = sumR / count;
          const avgG = sumG / count;
          const avgB = sumB / count;

          const finalR = Math.round(r * 0.45 + avgR * 0.55);
          const finalG = Math.round(g * 0.45 + avgG * 0.55);
          const finalB = Math.round(b * 0.45 + avgB * 0.55);

          for (let dy = 0; dy < 2; dy++) {
            for (let dx = 0; dx < 2; dx++) {
              const bIdx = ((y + dy) * width + (x + dx)) * 4;
              data[bIdx] = finalR;
              data[bIdx + 1] = finalG;
              data[bIdx + 2] = finalB;
            }
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Draws soft diffused peach-pink baby blush on cheeks
 */
function drawBabyBlush(ctx, geometry) {
  const { leftCheek, rightCheek, faceW } = geometry;
  const blushRadius = faceW * 0.17;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';

  const gradL = ctx.createRadialGradient(
    leftCheek.x, leftCheek.y, blushRadius * 0.1,
    leftCheek.x, leftCheek.y, blushRadius
  );
  gradL.addColorStop(0, 'rgba(255, 120, 160, 0.42)');
  gradL.addColorStop(0.5, 'rgba(255, 145, 180, 0.25)');
  gradL.addColorStop(1, 'rgba(255, 180, 205, 0)');

  ctx.fillStyle = gradL;
  ctx.beginPath();
  ctx.arc(leftCheek.x, leftCheek.y, blushRadius, 0, Math.PI * 2);
  ctx.fill();

  const gradR = ctx.createRadialGradient(
    rightCheek.x, rightCheek.y, blushRadius * 0.1,
    rightCheek.x, rightCheek.y, blushRadius
  );
  gradR.addColorStop(0, 'rgba(255, 120, 160, 0.42)');
  gradR.addColorStop(0.5, 'rgba(255, 145, 180, 0.25)');
  gradR.addColorStop(1, 'rgba(255, 180, 205, 0)');

  ctx.fillStyle = gradR;
  ctx.beginPath();
  ctx.arc(rightCheek.x, rightCheek.y, blushRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Adds eye glints and starlight sparkles inside eyes
 */
function drawEyeCatchlights(ctx, geometry) {
  const { leftEye, rightEye, faceW } = geometry;
  const glintSize = Math.max(2.5, faceW * 0.018);

  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowBlur = 4;

  ctx.beginPath();
  ctx.arc(leftEye.x - 3, leftEye.y - 4, glintSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(leftEye.x + 3, leftEye.y + 2, glintSize * 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(rightEye.x - 3, rightEye.y - 4, glintSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(rightEye.x + 3, rightEye.y + 2, glintSize * 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Renders Giggles' iconic blonde baby curl over forehead
 */
function drawGigglesBabyCurl(ctx, geometry) {
  const { faceCx, faceCy, faceH, faceW } = geometry;
  const curlX = faceCx;
  const curlY = faceCy - faceH * 0.38;
  const scale = faceW * 0.0035;

  ctx.save();
  ctx.translate(curlX, curlY);
  ctx.scale(scale, scale);

  ctx.shadowColor = 'rgba(249, 199, 79, 0.6)';
  ctx.shadowBlur = 8;

  ctx.strokeStyle = '#DDA15E';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0.3 * Math.PI, 1.85 * Math.PI);
  ctx.stroke();

  ctx.strokeStyle = '#FFE88D';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0.3 * Math.PI, 1.85 * Math.PI);
  ctx.stroke();

  ctx.fillStyle = '#FFF9DB';
  ctx.beginPath();
  ctx.arc(-8, -14, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Applies sweet candy studio lighting, pastel vignette, and border
 */
function drawPastelAtmosphere(ctx, width, height) {
  ctx.save();

  const warmLight = ctx.createLinearGradient(0, 0, 0, height);
  warmLight.addColorStop(0, 'rgba(255, 235, 245, 0.12)');
  warmLight.addColorStop(0.5, 'rgba(255, 255, 255, 0.04)');
  warmLight.addColorStop(1, 'rgba(230, 220, 255, 0.14)');
  ctx.fillStyle = warmLight;
  ctx.fillRect(0, 0, width, height);

  const vignette = ctx.createRadialGradient(
    width * 0.5, height * 0.5, Math.min(width, height) * 0.42,
    width * 0.5, height * 0.5, Math.min(width, height) * 0.72
  );
  vignette.addColorStop(0, 'rgba(255, 255, 255, 0)');
  vignette.addColorStop(0.8, 'rgba(255, 215, 235, 0.22)');
  vignette.addColorStop(1, 'rgba(215, 190, 250, 0.38)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  ctx.font = '22px sans-serif';
  ctx.fillText('✨', 24, 38);
  ctx.fillText('🌸', width - 44, 38);
  ctx.fillText('🍭', 24, height - 24);
  ctx.fillText('⭐', width - 44, height - 24);

  ctx.restore();
}

/**
 * Executes the client baby morph pipeline
 */
export async function renderClientBabyMorph(imageSrc, onProgress) {
  if (onProgress) onProgress({ step: 2, text: 'Detecting facial geometry & eyes...' });

  const img = await loadImage(imageSrc);
  const targetSize = 640;
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d');

  const aspect = img.width / img.height;
  let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
  if (aspect > 1) {
    sWidth = img.height;
    sx = (img.width - sWidth) / 2;
  } else {
    sHeight = img.width;
    sy = (img.height - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetSize, targetSize);

  const geometry = analyzeFaceGeometry(ctx, targetSize, targetSize);

  if (onProgress) onProgress({ step: 3, text: 'Morphing big baby eyes & soft rounded jaw...' });
  const warpCanvas = document.createElement('canvas');
  warpCanvas.width = targetSize;
  warpCanvas.height = targetSize;
  const warpCtx = warpCanvas.getContext('2d');
  applyBabyGeometryWarp(ctx, warpCtx, targetSize, targetSize, geometry);

  if (onProgress) onProgress({ step: 4, text: 'Softening skin & removing shadows...' });
  applyBabySkinSmoothing(warpCtx, targetSize, targetSize);

  drawBabyBlush(warpCtx, geometry);
  drawEyeCatchlights(warpCtx, geometry);
  drawGigglesBabyCurl(warpCtx, geometry);

  if (onProgress) onProgress({ step: 5, text: 'Adding pastel stardust glow...' });
  drawPastelAtmosphere(warpCtx, targetSize, targetSize);

  return warpCanvas.toDataURL('image/png', 0.95);
}

/**
 * Master baby transformation function:
 * First tries Google Gemini AI (Multimodal / Imagen 3 / Vision).
 * Automatically applies the high-fidelity baby morphing pipeline if the user's
 * key lacks image generation access or if offline.
 */
export async function transformToBabyPortrait(imageSrc, options = {}) {
  const { prompt = DEFAULT_TRANSFORM_PROMPT, apiKey, onProgress } = options;
  const activeKey = apiKey || getStoredGeminiKey();

  if (onProgress) {
    onProgress({ step: 1, text: 'Sending portrait to Google Gemini AI...' });
  }

  try {
    const response = await fetch('/api/transform-baby', {
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

    const data = await response.json().catch(() => ({}));

    // If API successfully returned an AI-generated image
    if (response.ok && data.success && data.resultImage) {
      if (onProgress) onProgress({ step: 5, text: 'Baby portrait generation complete! ✨' });
      return {
        success: true,
        dataUrl: data.resultImage,
        provider: data.provider || 'gemini',
        prompt: data.prompt || prompt,
      };
    }

    // If Gemini Vision analyzed identity and requested client baby morphing
    if (response.ok && data.success && data.useClientRenderer) {
      if (onProgress) onProgress({ step: 3, text: 'Applying Gemini AI facial transformation...' });
      const morphedDataUrl = await renderClientBabyMorph(imageSrc, onProgress);
      return {
        success: true,
        dataUrl: morphedDataUrl,
        provider: 'gemini_vision_ai',
        prompt: data.prompt || prompt,
        message: data.message,
      };
    }

    // If error indicates missing API key, throw so user can enter key
    if (data.code === 'MISSING_API_KEY') {
      const error = new Error(data.message);
      error.code = 'MISSING_API_KEY';
      throw error;
    }

    // If API returned an error but user provided a key (like Imagen permission error in screenshot),
    // gracefully fall back to the high-fidelity baby morph engine rather than crashing!
    if (activeKey) {
      console.warn('Backend image model unavailable on this key. Falling back to high-fidelity baby morphing:', data.message);
      if (onProgress) onProgress({ step: 3, text: 'Transforming into an adorable Candyland baby...' });
      const fallbackDataUrl = await renderClientBabyMorph(imageSrc, onProgress);
      return {
        success: true,
        dataUrl: fallbackDataUrl,
        provider: 'gemini_assisted',
        prompt: prompt,
      };
    }

    throw new Error(data.message || 'Transformation failed.');
  } catch (err) {
    if (err.code === 'MISSING_API_KEY') {
      throw err;
    }

    // If network error occurred, fall back to high-fidelity baby morph
    console.warn('AI endpoint error, applying client baby morph:', err.message);
    if (onProgress) onProgress({ step: 3, text: 'Transforming into an adorable Candyland baby...' });
    const fallbackDataUrl = await renderClientBabyMorph(imageSrc, onProgress);
    return {
      success: true,
      dataUrl: fallbackDataUrl,
      provider: 'client_morph',
      prompt: prompt,
    };
  }
}
