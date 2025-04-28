const REPLICATE_API_KEY = process.env.EXPO_PUBLIC_REPLICATE_API_KEY;
const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

interface GeneratedImage {
  url: string;
  error?: string;
}

export const generateImage = async (prompt: string): Promise<GeneratedImage> => {
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
        // Using the Stable Diffusion model
        version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
        input: {
          prompt: `A children's book style illustration of ${prompt}, cute, colorful, safe for kids`,
          negative_prompt: "scary, violent, inappropriate, realistic, photographic",
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 50,
          guidance_scale: 7.5,
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
        if (finalPrediction.output && finalPrediction.output.length > 0) {
          const imageUrl = finalPrediction.output[0];
          console.log('[ImageGen] Final Image URL:', imageUrl);
          return {
            url: imageUrl,
          };
        } else {
          console.error('[ImageGen] Replicate prediction succeeded but no output URL found.', finalPrediction);
          throw new Error('Image generation succeeded but no image URL was found.');
        }
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

    // Ensure output exists and has at least one item
    if (!finalPrediction.output || finalPrediction.output.length === 0) {
        console.error('Replicate prediction succeeded but returned no output:', finalPrediction);
        throw new Error('Image generation succeeded but no image URL was found.');
    }

    // Return the first generated image URL
    return {
      url: finalPrediction.output[0],
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
