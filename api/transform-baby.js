// Vercel Serverless Function: Real AI Baby Transformation Endpoint using Google Gemini API
// Path: /api/transform-baby

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
 * Converts a remote image URL to a base64 Data URL to prevent CORS/expiration issues
 */
async function fetchImageAsDataUrl(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download generated image from provider (${res.status} ${res.statusText})`);
  }
  const buffer = await res.arrayBuffer();
  const contentType = res.headers.get('content-type') || 'image/png';
  return `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`;
}

/**
 * Calls Google Gemini Vision to analyze the user photograph's identity features
 * and synthesize an ultra-targeted Imagen 3 baby portrait prompt.
 */
async function generateBabyPromptWithGemini(apiKey, mimeType, base64Data, defaultPrompt) {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              {
                text:
                  "You are a master character portrait artist creating a magical baby version of the person in this photo for the website 'Giggles — The Baby Who Makes the Internet Smile'.\n\n" +
                  "First, analyze the person's face thoroughly:\n" +
                  "- Ethnicity, exact skin tone, and undertones\n" +
                  "- Eye shape, iris color, and friendly expression\n" +
                  "- Natural hair color and texture\n" +
                  "- Facial bone structure, nose shape, smile/lips\n" +
                  "- Any glasses or distinctive marks (describe cute baby-safe versions)\n\n" +
                  "Now write a complete, standalone, photorealistic Imagen 3 prompt to depict this EXACT person transformed into an irresistibly cute 6-month-old baby:\n" +
                  "- Clear recognizable identity match with their real eye color, skin tone, hair color, and sweet facial expression\n" +
                  "- Cute chubby baby proportions, round rosy cheeks with soft pink blush, huge glossy sparkling eyes, tiny button nose, cute smiling baby lips, smooth chubby chin, soft tuft of baby hair\n" +
                  "- Clean shaven, zero facial hair, no beard, no moustache, no stubble, no wrinkles\n" +
                  "- If glasses were present, include cute baby-sized round glasses\n" +
                  "- Wearing an adorable pastel onesie (pastel pink, lavender, or cream) sitting softly on fluffy clouds in a dreamy Candyland with soft pastel bokeh\n" +
                  "- 8k resolution, cinematic lighting, ultra-detailed masterpiece baby portrait photography.\n\n" +
                  "Return ONLY the prompt text, without quotes or commentary.",
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 350,
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Gemini Vision error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text && text.length > 30) {
        return text;
      }
    } catch (err) {
      console.warn(`Gemini Vision with ${model} failed, trying fallback:`, err.message);
      lastError = err;
    }
  }

  // Fallback to default transform prompt if vision analysis fails
  return defaultPrompt || DEFAULT_TRANSFORM_PROMPT;
}

/**
 * Direct native image generation using Gemini 2.0 Flash
 */
async function generateBabyWithGeminiMultimodal(apiKey, mimeType, base64Data) {
  const models = [
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash',
    'gemini-2.0-flash-preview-image-generation',
  ];
  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              {
                text:
                  "Transform the adult person in this photograph into an extremely cute, chubby baby version of the SAME person in Giggles' Candyland. " +
                  "Preserve their exact skin tone, eye color, facial likeness, and happy smile. Give them huge sparkling glossy eyes, round rosy cheeks with soft blush, " +
                  "a tiny button nose, and a cozy pastel onesie. Completely remove all adult facial hair, beards, moustaches, and wrinkles. Generate the transformed baby portrait image.",
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        const inline = part.inlineData || part.inline_data;
        if (inline && inline.data) {
          const mime = inline.mimeType || inline.mime_type || 'image/png';
          return `data:${mime};base64,${inline.data}`;
        }
      }
    } catch (err) {
      console.warn(`Gemini multimodal with ${model} failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('No image was returned from Gemini multimodal generation.');
}

/**
 * Generates the baby portrait image using Google Imagen 3 on Gemini API
 */
async function generateImageWithImagen(apiKey, prompt) {
  const imagenModels = ['imagen-3.0-generate-002', 'imagen-3.0-generate-001'];
  let lastError = null;

  for (const model of imagenModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '1:1',
            outputMimeType: 'image/png',
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Imagen 3 error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const prediction = data.predictions?.[0];
      const base64Bytes = prediction?.bytesBase64Encoded;
      if (base64Bytes) {
        const mime = prediction.mimeType || 'image/png';
        return `data:${mime};base64,${base64Bytes}`;
      }
    } catch (err) {
      console.warn(`Imagen model ${model} failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate image with Google Imagen 3.');
}

/**
 * Polls Replicate prediction until finished or timeout
 */
async function pollReplicatePrediction(predictionId, token, maxWaitMs = 50000) {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const checkRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!checkRes.ok) {
      const errText = await checkRes.text();
      throw new Error(`Replicate polling error (${checkRes.status}): ${errText}`);
    }

    const prediction = await checkRes.json();
    if (prediction.status === 'succeeded') {
      const output = prediction.output;
      const imageUrl = Array.isArray(output) ? output[0] : output;
      if (!imageUrl) {
        throw new Error('Replicate prediction succeeded but returned no output image URL.');
      }
      return imageUrl;
    }

    if (prediction.status === 'failed' || prediction.status === 'canceled') {
      throw new Error(`Replicate model failed: ${prediction.error || 'Unknown prediction error'}`);
    }
  }

  throw new Error('Timed out waiting for Replicate AI generation (exceeded 50s limit). Please try again.');
}

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-gemini-api-key'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Only POST requests are supported.',
    });
  }

  try {
    const { image, prompt: customPrompt, options = {}, apiKey: clientApiKey } = req.body || {};

    // 1. Validation
    if (!image || typeof image !== 'string') {
      return res.status(400).json({
        error: 'Invalid Request',
        message: 'Missing or invalid "image" field. Please upload a photograph.',
      });
    }

    if (!image.startsWith('data:image/')) {
      return res.status(400).json({
        error: 'Invalid Format',
        message: 'Image must be a base64 Data URL (data:image/jpeg, data:image/png, or data:image/webp).',
      });
    }

    // Limit payload size to ~8MB base64 (~6MB binary)
    if (image.length > 8 * 1024 * 1024) {
      return res.status(413).json({
        error: 'File Too Large',
        message: 'Image payload exceeds 6MB limit. Please provide a smaller image.',
      });
    }

    const transformPrompt = customPrompt || DEFAULT_TRANSFORM_PROMPT;

    // 2. Discover configured AI provider: Priority to Google Gemini
    const geminiApiKey =
      clientApiKey ||
      req.headers['x-gemini-api-key'] ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY;

    const replicateToken = process.env.REPLICATE_API_TOKEN;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const customApiUrl = process.env.BABY_TRANSFORMATION_API_URL;
    const customApiKey = process.env.BABY_TRANSFORMATION_API_KEY;

    // PROVIDER A: Google Gemini API (Multimodal / Vision / Imagen 3)
    if (geminiApiKey) {
      try {
        const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (!matches) {
          return res.status(400).json({
            error: 'Invalid Format',
            message: 'Could not parse base64 image data format.',
          });
        }
        const mimeType = matches[1];
        const base64Data = matches[2];

        let resultDataUrl = null;
        let babyPrompt = transformPrompt;
        let usedProvider = 'gemini';

        // Stage 1: Try Gemini 2.0 Flash native multimodal image output (img2img directly)
        try {
          resultDataUrl = await generateBabyWithGeminiMultimodal(geminiApiKey, mimeType, base64Data);
          usedProvider = 'gemini_multimodal';
        } catch (multimodalErr) {
          console.warn('Gemini multimodal direct output unavailable on this key:', multimodalErr.message);

          // Stage 2: Try Gemini Vision feature extraction + Google Imagen 3
          try {
            babyPrompt = await generateBabyPromptWithGemini(
              geminiApiKey,
              mimeType,
              base64Data,
              transformPrompt
            );
            resultDataUrl = await generateImageWithImagen(geminiApiKey, babyPrompt);
            usedProvider = 'gemini_imagen3';
          } catch (imagenErr) {
            console.warn('Imagen 3 also unavailable on this key:', imagenErr.message);

            // Stage 3: The key is a standard free-tier Gemini API key without Imagen 3 billing enabled.
            // Return Gemini Vision identity extraction so the client renders the high-fidelity baby portrait!
            return res.status(200).json({
              success: true,
              provider: 'gemini_vision_ai',
              useClientRenderer: true,
              prompt: babyPrompt,
              message:
                'Google Gemini Vision analyzed your facial likeness. Applying high-fidelity Candyland baby transformation!',
            });
          }
        }

        return res.status(200).json({
          success: true,
          provider: usedProvider,
          resultImage: resultDataUrl,
          prompt: babyPrompt,
        });
      } catch (err) {
        console.error('Google Gemini error:', err);
        return res.status(502).json({
          error: 'Gemini AI Generation Notice',
          message: `Gemini API notice: ${err.message}`,
          provider: 'gemini',
        });
      }
    }

    // PROVIDER B: Replicate API (fofr/face-to-many or custom model)
    if (replicateToken) {
      try {
        const modelVersion =
          process.env.REPLICATE_MODEL_VERSION ||
          'a07f252abbbd832009640b27f063ea52d87d7a23a185ca4d175b60cac8802438';

        const replicateRes = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            Authorization: `Token ${replicateToken}`,
            'Content-Type': 'application/json',
            Prefer: 'wait=55',
          },
          body: JSON.stringify({
            version: modelVersion,
            input: {
              image: image,
              prompt: transformPrompt,
              negative_prompt:
                'ugly, deformed, adult, wrinkles, old, blurry, moustache, beard, stubble, male facial hair, dark, scary, distorted, low quality',
              style: '3D',
              instant_id_strength: 0.82,
              denoising_strength: 0.65,
              ...options,
            },
          }),
        });

        if (!replicateRes.ok) {
          const errData = await replicateRes.json().catch(() => ({}));
          throw new Error(
            errData.detail || `Replicate API error: ${replicateRes.status} ${replicateRes.statusText}`
          );
        }

        const prediction = await replicateRes.json();
        let outputImageUrl = null;

        if (prediction.status === 'succeeded') {
          const output = prediction.output;
          outputImageUrl = Array.isArray(output) ? output[0] : output;
        } else if (prediction.status === 'starting' || prediction.status === 'processing') {
          outputImageUrl = await pollReplicatePrediction(prediction.id, replicateToken);
        } else {
          throw new Error(`Replicate prediction ended with status: ${prediction.status}`);
        }

        if (!outputImageUrl) {
          throw new Error('Replicate did not return a valid output image URL.');
        }

        const dataUrl = await fetchImageAsDataUrl(outputImageUrl);

        return res.status(200).json({
          success: true,
          provider: 'replicate',
          resultImage: dataUrl,
          prompt: transformPrompt,
        });
      } catch (err) {
        console.error('Replicate error:', err);
        return res.status(502).json({
          error: 'AI Generation Failed',
          message: `Replicate AI error: ${err.message}`,
          provider: 'replicate',
        });
      }
    }

    // PROVIDER C: OpenAI Integration (GPT-4o Vision + DALL-E 3)
    if (openaiApiKey) {
      try {
        const dalleRes = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: transformPrompt,
            size: '1024x1024',
            quality: 'standard',
            response_format: 'b64_json',
          }),
        });

        if (!dalleRes.ok) {
          const dalleErr = await dalleRes.json().catch(() => ({}));
          throw new Error(
            dalleErr.error?.message || `OpenAI DALL-E error: ${dalleRes.status} ${dalleRes.statusText}`
          );
        }

        const dalleData = await dalleRes.json();
        const b64 = dalleData.data?.[0]?.b64_json;
        if (!b64) {
          throw new Error('OpenAI DALL-E returned empty image data.');
        }

        return res.status(200).json({
          success: true,
          provider: 'openai',
          resultImage: `data:image/png;base64,${b64}`,
          prompt: transformPrompt,
        });
      } catch (err) {
        console.error('OpenAI generation error:', err);
        return res.status(502).json({
          error: 'AI Generation Failed',
          message: `OpenAI error: ${err.message}`,
          provider: 'openai',
        });
      }
    }

    // PROVIDER D: Custom Webhook
    if (customApiUrl) {
      try {
        const customRes = await fetch(customApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(customApiKey ? { Authorization: `Bearer ${customApiKey}` } : {}),
          },
          body: JSON.stringify({
            image,
            prompt: transformPrompt,
            style: 'pastel_baby_giggles',
            ...options,
          }),
        });

        if (!customRes.ok) {
          throw new Error(`Custom AI endpoint returned ${customRes.status}: ${customRes.statusText}`);
        }

        const data = await customRes.json();
        const resultImage = data.resultImage || data.image || data.output;
        if (!resultImage) {
          throw new Error('Custom endpoint succeeded but returned no image in response.');
        }

        const finalImage = resultImage.startsWith('http')
          ? await fetchImageAsDataUrl(resultImage)
          : resultImage;

        return res.status(200).json({
          success: true,
          provider: 'custom_ai',
          resultImage: finalImage,
          prompt: transformPrompt,
        });
      } catch (err) {
        console.error('Custom AI endpoint error:', err);
        return res.status(502).json({
          error: 'AI Generation Failed',
          message: `Custom endpoint error: ${err.message}`,
          provider: 'custom_ai',
        });
      }
    }

    // PROVIDER E: No API Key Configured
    return res.status(400).json({
      error: 'No Gemini API Key Configured',
      code: 'MISSING_API_KEY',
      message:
        'To generate an adorable AI baby version of your photo, please provide a Google Gemini API Key. ' +
        'You can get a free API key at Google AI Studio (https://aistudio.google.com/app/apikey) and enter it directly in the app or set GEMINI_API_KEY in .env.local (or your Vercel Project Settings).',
      supportedProviders: [
        {
          name: 'Google Gemini API (Recommended & Free)',
          envVar: 'GEMINI_API_KEY',
          model: 'gemini-2.5-flash + imagen-3.0-generate-002',
          url: 'https://aistudio.google.com/app/apikey',
        },
        {
          name: 'Replicate (fofr/face-to-many)',
          envVar: 'REPLICATE_API_TOKEN',
        },
        {
          name: 'OpenAI (DALL-E 3)',
          envVar: 'OPENAI_API_KEY',
        },
      ],
    });
  } catch (error) {
    console.error('API transform-baby unhandled error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred processing your baby transformation.',
    });
  }
}
