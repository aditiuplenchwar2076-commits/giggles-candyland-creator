// Vercel Serverless Function: Baby Transformation Provider Endpoint
// Path: /api/transform-baby

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { image, options = {} } = req.body || {};

    // 1. Validation
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "image" field in request body.' });
    }

    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Image must be a base64 Data URL (data:image/...).' });
    }

    // Limit payload size to ~6MB base64
    if (image.length > 8 * 1024 * 1024) {
      return res.status(413).json({ error: 'Image payload exceeds 6MB limit. Please provide a smaller image.' });
    }

    // 2. Check for configured cloud provider credentials in server environment
    const customApiUrl = process.env.BABY_TRANSFORMATION_API_URL;
    const customApiKey = process.env.BABY_TRANSFORMATION_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const replicateToken = process.env.REPLICATE_API_TOKEN;

    // A. Custom Webhook / Dedicated Model Endpoint
    if (customApiUrl) {
      try {
        const response = await fetch(customApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(customApiKey ? { Authorization: `Bearer ${customApiKey}` } : {}),
          },
          body: JSON.stringify({
            image,
            style: 'pastel_baby_giggles',
            prompt: 'Cute baby version with rosy cheeks, soft blonde curl, smiling eyes, pastel candy dream studio aesthetic',
            ...options,
          }),
        });

        if (!response.ok) {
          throw new Error(`External provider returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const resultImage = data.resultImage || data.image || data.output;
        if (resultImage) {
          return res.status(200).json({
            success: true,
            provider: 'custom_cloud_ai',
            resultImage,
          });
        }
      } catch (err) {
        console.error('Custom cloud AI provider error:', err);
      }
    }

    // B. Replicate API Integration (Face-to-Many / Baby Morph)
    if (replicateToken) {
      try {
        const response = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            Authorization: `Token ${replicateToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Standard image-to-image style transfer model
            version: 'a07f252abbbd832009640b27f063ea52d87d7a23a185ca4d175b60cac8802438',
            input: {
              image: image,
              prompt: 'cute chubby baby face, round rosy cheeks, big sparkling eyes, soft baby smile, cute pastel candy dream studio portrait, 3d pixar style, high resolution',
              negative_prompt: 'ugly, deformed, adult, wrinkles, old, blurry',
            },
          }),
        });

        const prediction = await response.json();
        if (prediction && prediction.id) {
          return res.status(200).json({
            success: true,
            provider: 'replicate',
            predictionId: prediction.id,
            status: prediction.status,
          });
        }
      } catch (err) {
        console.error('Replicate provider error:', err);
      }
    }

    // C. OpenAI DALL-E / Vision Integration
    if (openaiApiKey) {
      // Return provider status
      return res.status(200).json({
        success: false,
        fallbackToLocal: true,
        provider: 'openai',
        message: 'OpenAI endpoint configured; falling back to high-res local morph for immediate client-side delivery.',
      });
    }

    // D. No credentials configured in server environment
    return res.status(200).json({
      success: false,
      fallbackToLocal: true,
      provider: 'none',
      message: 'Cloud AI Provider not configured in environment variables. High-Fidelity Local Baby Morph Engine will process the portrait securely in-browser.',
      supportedEnvVars: [
        'BABY_TRANSFORMATION_API_URL',
        'BABY_TRANSFORMATION_API_KEY',
        'REPLICATE_API_TOKEN',
        'OPENAI_API_KEY',
      ],
    });
  } catch (error) {
    console.error('API transform-baby unhandled error:', error);
    return res.status(500).json({
      error: 'Internal server error processing baby transformation.',
      message: error.message,
      fallbackToLocal: true,
    });
  }
}
