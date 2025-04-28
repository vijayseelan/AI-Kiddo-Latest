import * as FileSystem from 'expo-file-system';

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Using a child-friendly voice ID from ElevenLabs
const CHILD_VOICE_ID = 'piTKgcLEGmPE4e6mEKli'; // Nicole voice - young, friendly, clear

interface VoiceGenerationResult {
  audioUrl?: string;
  error?: string;
}

export const generateVoice = async (text: string): Promise<VoiceGenerationResult> => {
  if (!ELEVENLABS_API_KEY) {
    console.error('[VoiceGen] ElevenLabs API Key is missing.');
    return { error: 'ElevenLabs API key not configured.' };
  }

  console.log(`[VoiceGen] Generating voice for text (first 50 chars): "${text.substring(0, 50)}..."`); // Added log

  try {
    console.log('[VoiceGen] Sending request to ElevenLabs API...'); // Added log
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${CHILD_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
        },
      }),
    });

    console.log('[VoiceGen] ElevenLabs API Response Status:', response.status); // Added log

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[VoiceGen] ElevenLabs API request failed:', response.status, errorBody);
      throw new Error(`ElevenLabs API request failed: ${response.status} ${errorBody}`);
    }

    // --- Blob Handling (Likely Point of Failure in RN) ---
    console.log('[VoiceGen] Receiving audio data as blob...'); // Added log
    const audioBlob = await response.blob();
    console.log(`[VoiceGen] Received blob: Size=${audioBlob.size}, Type=${audioBlob.type}`); // Added log

    // --- Use FileSystem to save blob --- 
    const filename = `audio_${Date.now()}.mp3`;
    // Ensure cacheDirectory ends with a slash if needed, or handle path joining carefully
    const uri = (FileSystem.cacheDirectory || '') + filename;
    
    console.log(`[VoiceGen] Attempting to write blob to filesystem at: ${uri}`);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          // Result is a data URL like 'data:audio/mpeg;base64,SUQzBAg...' 
          const base64Data = (reader.result as string).split(',')[1]; 
          if (!base64Data) {
             console.error('[VoiceGen] Failed to extract Base64 data from FileReader result.');
             return reject({ error: 'Failed to read audio data correctly.'});
          }
          console.log(`[VoiceGen] Read blob as Base64 (length): ${base64Data.length}`);
          
          // Ensure the directory exists (optional but good practice)
          // const dirInfo = await FileSystem.getInfoAsync(FileSystem.cacheDirectory || '');
          // if (!dirInfo.exists) {
          //   await FileSystem.makeDirectoryAsync(FileSystem.cacheDirectory || '', { intermediates: true });
          // }

          await FileSystem.writeAsStringAsync(uri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          console.log(`[VoiceGen] Successfully wrote audio file to: ${uri}`);
          resolve({ audioUrl: uri }); // Return the file URI
        } catch (writeError) {
          console.error('[VoiceGen] Error writing audio blob to filesystem:', writeError);
          reject({ error: 'Failed to save audio file.' });
        }
      };
      reader.onerror = (error) => {
        console.error('[VoiceGen] Error reading audio blob with FileReader:', error);
        reject({ error: 'Failed to read audio data.' });
      };
      // Start reading the blob as a data URL
      reader.readAsDataURL(audioBlob);
    });

  } catch (error: any) {
    console.error('[VoiceGen] Error during voice generation:', error); // Added log
    return {
      error: error.message || 'An unknown error occurred during voice generation.',
    };
  }
};

// Helper function to clean up audio URLs
export const cleanupAudioFile = async (uri: string) => {
  // Check if it's a file URI in the cache directory
  if (uri && uri.startsWith('file://') && uri.includes(FileSystem.cacheDirectory!)) {
    try {
      console.log(`[VoiceGen] Attempting to delete audio file: ${uri}`);
      await FileSystem.deleteAsync(uri, { idempotent: true }); // idempotent avoids error if already deleted
      console.log(`[VoiceGen] Successfully deleted audio file: ${uri}`);
    } catch (error) {
      // Log error but don't crash the app if cleanup fails
      console.error(`[VoiceGen] Error deleting audio file ${uri}:`, error);
    }
  } else if (uri && uri.startsWith('blob:')){
     // Also try to revoke blob URLs if they were somehow created and passed
     try {
        console.log(`[VoiceGen] Attempting to revoke blob URL: ${uri}`);
        URL.revokeObjectURL(uri);
        console.log(`[VoiceGen] Successfully revoked blob URL: ${uri}`);
     } catch (revokeError) {
        console.error(`[VoiceGen] Error revoking blob URL ${uri}:`, revokeError);
     }
  } else {
      console.log(`[VoiceGen] cleanupAudioFile: URI is not a local file or blob URL, skipping cleanup: ${uri}`);
  }
};

// You might also want a function to clean up ALL temp audio files on app start or exit
export const cleanupAllAudioFiles = async () => {
    if (!FileSystem.cacheDirectory) return;
    console.log('[VoiceGen] Cleaning up all temporary audio files...');
    try {
        const files = await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory);
        const audioFiles = files.filter(f => f.startsWith('audio_') && f.endsWith('.mp3'));
        for (const file of audioFiles) {
            const uriToDelete = FileSystem.cacheDirectory + file;
            await cleanupAudioFile(uriToDelete);
        }
        console.log(`[VoiceGen] Finished cleaning up ${audioFiles.length} audio files.`);
    } catch (error) {
        console.error('[VoiceGen] Error cleaning up all audio files:', error);
    }
};
