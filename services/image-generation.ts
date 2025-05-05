const REPLICATE_API_KEY = process.env.EXPO_PUBLIC_REPLICATE_API_KEY;
const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

import { uploadImageFromUrl } from './storage';

interface GeneratedImage {
  url: string;
  error?: string;
}

interface GenerateImageOptions {
  userId?: string;
  contentId?: string;
  imageIndex?: number;
}

export const generateImage = async (prompt: string, options: GenerateImageOptions = {}): Promise<GeneratedImage> => {
  if (!REPLICATE_API_KEY) {
    throw new Error('Replicate API key not found');
  }

  try {
    console.log('[ImageGen] Generating image with prompt:', prompt);

    // Start the image generation
    const response = await fetch(REPLICATE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Using Ideogram V2A Turbo model for claymorphism-styled images
        version: "ideogram-ai/ideogram-v2a-turbo",
        input: {
          prompt: `A claymorphism style illustration of ${prompt}, soft rounded shapes, pastel colors, subtle shadows, 3D clay-like appearance, smooth edges, child-friendly, playful, colorful, safe for kids`,
          negative_prompt: "scary, violent, inappropriate, realistic, photographic, sharp edges, flat design, 2D, dark colors, complex textures",
          aspect_ratio: "1:1", // Square aspect ratio for consistent display
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`);
    }

    const prediction = await response.json();

    // --- Polling Logic Start ---
    let finalPrediction = null;
    const pollStartTime = Date.now();
    const pollTimeout = 60000; // 60 seconds timeout

    while (Date.now() - pollStartTime < pollTimeout) {
      console.log('[ImageGen] Polling Replicate for image result...');
      const resultResponse = await fetch(prediction.urls.get, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!resultResponse.ok) {
        console.error(`Polling failed with status: ${resultResponse.status}`);
        // Wait before retrying on server error, otherwise break
        if (resultResponse.status >= 500) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retrying server errors
          continue;
        }
        throw new Error(`Failed to poll generation result: ${resultResponse.statusText}`);
      }

      finalPrediction = await resultResponse.json();

      if (finalPrediction.status === 'succeeded') {
        console.log('[ImageGen] Replicate prediction succeeded.');
        console.log('[ImageGen] Output type:', typeof finalPrediction.output);
        
        // Handle different output formats based on the model
        if (finalPrediction.output) {
          let imageUrl;
          
          // For Ideogram V2A Turbo model, the output is a single string URL
          if (typeof finalPrediction.output === 'string' && finalPrediction.output.startsWith('http')) {
            imageUrl = finalPrediction.output;
            console.log('[ImageGen] Ideogram model output detected');
          } 
          // For Stable Diffusion and other models, output is an array of URLs
          else if (Array.isArray(finalPrediction.output) && finalPrediction.output.length > 0) {
            const replicateUrl = finalPrediction.output[0];
            console.log('[ImageGen] Image generation successful on Replicate:', replicateUrl);
            
            // Upload to Supabase storage with folder structure
            const storedUrl = await uploadImageFromUrl(replicateUrl, {
              userId: options.userId,
              contentId: options.contentId,
              imageIndex: options.imageIndex
            });
            console.log('[ImageGen] Image uploaded to Supabase:', storedUrl);
            
            return { url: storedUrl };
          }
          
          if (imageUrl) {
            // Upload to Supabase storage
            const storedUrl = await uploadImageFromUrl(imageUrl);
            console.log('[ImageGen] Image uploaded to Supabase:', storedUrl);
            
            return {
              url: storedUrl,
            };
          }
        }
        
        // If we get here, we couldn't extract a valid URL
        console.error('[ImageGen] Replicate prediction succeeded but no output URL found.', finalPrediction);
        throw new Error('Image generation succeeded but no image URL was found.');
      } else if (finalPrediction.status === 'failed' || finalPrediction.status === 'canceled') {
        console.error('Replicate prediction failed or canceled:', finalPrediction.error);
        throw new Error(`Image generation failed: ${finalPrediction.error || 'Unknown reason'}`);
      }

      // Wait before polling again if still processing
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
    }
    // --- Polling Logic End ---

    if (!finalPrediction || finalPrediction.status !== 'succeeded') {
      if (Date.now() - pollStartTime >= pollTimeout) {
          throw new Error('Image generation timed out after 60 seconds.');
      } else {
          throw new Error('Image generation did not succeed.');
      }
    }

    // This code is unreachable since we already handle all successful cases above
    // and return or throw errors appropriately
    
    // Add a default return to satisfy TypeScript
    return {
      url: '',
      error: 'Image generation did not complete successfully.'
    };
  } catch (error) {
    console.error('Image generation error:', error);
    // Log specific error message if available
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image. Please try again.';
    return {
      url: '', // Return empty string for URL on error
      error: errorMessage,
    };
  }
};
