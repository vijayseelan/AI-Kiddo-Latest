interface GeneratedContent {
  title: string;
  content: string;
}

const HAIKU_API_KEY = process.env.EXPO_PUBLIC_HAIKU_API_KEY;
const HAIKU_API_URL = 'https://api.anthropic.com/v1/messages';

// Define the content type expected by this service
export type ServiceContentType = "words" | "sentences" | "passage" | "story";

// Renamed function to be more general
export const generateTextContent = async (
  topic: string,
  contentType: ServiceContentType,
  readingLevel: "beginner" | "intermediate" | "advanced"
): Promise<GeneratedContent> => {
  console.log('[AIContent] Generating text content with details:', { topic, contentType, readingLevel });

  if (!HAIKU_API_KEY) {
    console.error('[AIContent] Haiku API Key is missing.');
    console.error('Haiku API key not found');
    return {
        title: topic,
        content: '[Error: API Key Missing]'
    };
    // throw new Error('Haiku API key not found');
  }

  try {
    // Prepare the prompt based on content type and reading level
    let prompt = '';
    let systemPrompt = 'You are a helpful assistant creating educational reading content for children. Respond *only* with the requested content, without any extra explanations, introductions, or formatting beyond the requested items.';

    console.log('[AIContent] System Prompt:', systemPrompt);
    console.log('[AIContent] User Prompt:', prompt);

    switch (contentType) {
      case "words":
        prompt = `Generate a list of 10 vocabulary words related to "${topic}" suitable for a ${readingLevel} reading level. List each word on a new line.`;
        break;
      case "sentences":
        prompt = `Generate 5 simple sentences about "${topic}" suitable for a ${readingLevel} reading level. Each sentence should be on a new line.`;
        break;
      case "passage":
        prompt = `Generate a short reading passage (around 50-100 words) about "${topic}" suitable for a ${readingLevel} reading level.`;
        break;
      case "story":
        prompt = `Write a children's story (around 150-300 words) titled "${topic}" suitable for a ${readingLevel} reading level.`;
        // Add more detailed story prompts based on reading level if needed, similar to previous implementation
        switch (readingLevel) {
            case "beginner": prompt += ' Use simple words and short sentences.'; break;
            case "intermediate": prompt += ' Include some dialogue and descriptive language.'; break;
            case "advanced": prompt += ' Use richer vocabulary and more complex sentences.'; break;
        }
        break;
      default:
        // Fallback or throw error for unknown type
        prompt = `Write a short text about "${topic}".`;
    }

    console.log('[AIContent] Sending request to Haiku API...');

    // Make API call to Anthropic
    const response = await fetch(HAIKU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': `${HAIKU_API_KEY}`, // Anthropic uses x-api-key
        'anthropic-version': '2023-06-01' // Required header
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Specific Haiku model
        system: systemPrompt, // Add system prompt for better control
        messages: [{ role: 'user', content: prompt }], // Use messages array
        max_tokens: 1000, // Adjust based on expected content length?
        temperature: 0.7
      })
    });

    console.log('[AIContent] Haiku API Response Status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text(); // Read error body for more details
      console.error('[AIContent] Haiku API request failed:', response.status, errorBody);
      throw new Error(`Haiku API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    // Extract text from the first content block in the response
    const generatedText = data.content?.[0]?.text?.trim() || '';

    console.log('[AIContent] Received generated text (trimmed, first 100 chars):', generatedText.substring(0, 100));

    return {
      title: topic, // Use the input topic as the title
      content: generatedText // Return the raw generated text for later parsing
    };
  } catch (error) {
    console.error('[AIContent] Error during Haiku API call:', error);
    // Enhanced logging for TypeError
    if (error instanceof TypeError && error.message === 'Network request failed') {
      console.error('Potential Causes: No internet connection, incorrect API endpoint/key, CORS issue, or VPN/Firewall blocking the request.');
    }
    // Fallback with error indication
    return {
      title: topic,
      content: `[Error generating ${contentType}. Please try again.]`
    };
  }
};
