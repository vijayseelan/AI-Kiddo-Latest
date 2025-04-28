import '../lib/crypto-polyfill';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';

const { 
  SpeechConfig, 
  AudioConfig, 
  SpeechRecognizer, 
  PronunciationAssessmentConfig,
  PronunciationAssessmentResult,
  ResultReason,
  SpeechSynthesizer,
  PronunciationAssessmentGradingSystem,
  PronunciationAssessmentGranularity
} = speechsdk;

// Azure Speech Service configuration
const SPEECH_KEY = process.env.EXPO_PUBLIC_AZURE_SPEECH_KEY || '';
const SPEECH_REGION = process.env.EXPO_PUBLIC_AZURE_SPEECH_REGION || 'southeastasia';

// Validate region at startup
console.log('[Azure Speech Client] Initializing with region:', SPEECH_REGION);

export interface PronunciationResult {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  pronunciationScore: number;
  prosodyScore?: number;
  word: string;
}

// Interface for Sentence-level Pronunciation Assessment Results from Azure
export interface WordTimingResult {
  word: string;
  accuracyScore: number;
  errorType: string; // e.g., 'None', 'Mispronunciation', 'Omission', 'Insertion'
  offset?: number; // Offset in ticks (100 nanoseconds)
  duration?: number; // Duration in ticks
}

export interface SentencePronunciationResultAzure {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  pronunciationScore: number;
  prosodyScore?: number;
  words: WordTimingResult[];
}

function base64ToWav(base64Audio: string): ArrayBuffer {
  // Convert base64 to binary
  const binaryString = atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

async function validateAzureCredentials(): Promise<void> {
  if (!SPEECH_KEY || !SPEECH_REGION) {
    throw new Error('Azure Speech credentials not configured');
  }

  try {
    // Test the credentials by attempting to create a synthesizer
    const testConfig = SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);
    const synthesizer = new SpeechSynthesizer(testConfig);
    await new Promise<void>((resolve, reject) => {
      synthesizer.speakTextAsync(
        'test',
        (result: any) => {
          synthesizer.close();
          resolve();
        },
        (error: any) => {
          synthesizer.close();
          reject(new Error(error.message || 'Unknown error during credential validation'));
        }
      );
    });
    return;
  } catch (error: any) {
    console.error('[Azure Speech Client] Credential validation failed:', error);
    throw new Error(`Invalid Azure credentials: ${error.message || 'Unknown error'}`);
  }
}

export async function assessPronunciation(word: string, audioBase64: string): Promise<PronunciationResult> {
  if (!word || !audioBase64) {
    throw new Error('Word and audio data are required');
  }
  // Validate credentials first
  await validateAzureCredentials();
  
  console.log('[Azure Speech Client] Credentials validated successfully');

  console.log('[Azure Speech Client] Starting pronunciation assessment for word:', word);

  try {
    console.log('[Azure Speech Client] Converting audio to WAV format...');
    const audioData = base64ToWav(audioBase64);

    // Force region to be southeastasia
    const region = 'southeastasia';
    console.log('[Azure Speech Client] Creating speech config with:', {
      key: SPEECH_KEY ? '(key present)' : '(no key)',
      configuredRegion: SPEECH_REGION,
      usingRegion: region
    });

    const speechConfig = SpeechConfig.fromSubscription(SPEECH_KEY, region);
    speechConfig.outputFormat = speechsdk.OutputFormat.Detailed;
    speechConfig.speechRecognitionLanguage = 'en-US';
    
    // Enable pronunciation assessment mode with prosody
    speechConfig.setServiceProperty('pronunciation.assessmentKind', 'word', 
      speechsdk.ServicePropertyChannel.UriQueryParameter);
    
    // Enable prosody assessment
    const assessmentConfig = new PronunciationAssessmentConfig(
      word,
      PronunciationAssessmentGradingSystem.HundredMark,
      PronunciationAssessmentGranularity.Word,
      true  // Enable prosody assessment
    );
    assessmentConfig.enableProsodyAssessment = true;

    // Set other properties
    speechConfig.setProperty('SpeechServiceResponse_JsonResult', 'true');
    speechConfig.setProperty('SpeechServiceConnection_ReconnectOnError', 'true');
    speechConfig.setProperty('SpeechServiceConnection_InitialSilenceTimeoutMs', '5000');
    speechConfig.setProperty('SpeechServiceConnection_EndSilenceTimeoutMs', '5000');
    speechConfig.setProperty('SpeechServiceConnection_LogLevel', '4');
    speechConfig.enableAudioLogging();
    
    console.log('[Azure Speech Client] Speech config created with:', {
      hasKey: !!SPEECH_KEY,
      language: 'en-US',
      region: region
    });
    
    // Create push stream
    const format = speechsdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
    const pushStream = speechsdk.AudioInputStream.createPushStream(format);

    console.log('[Azure Speech Client] Writing audio data to stream...', {
      audioDataLength: audioData.byteLength,
      format: {
        samplesPerSec: 16000,
        bitsPerSample: 16,
        channels: 1
      }
    });

    pushStream.write(audioData);
    pushStream.close();
    
    // Create audio config from push stream
    const audioConfig = AudioConfig.fromStreamInput(pushStream);
    
    // Create pronunciation assessment config with more detailed settings
    const pronunciationConfig = new PronunciationAssessmentConfig(
      word,
      PronunciationAssessmentGradingSystem.HundredMark,
      PronunciationAssessmentGranularity.Word,
      true
    );
    pronunciationConfig.enableProsodyAssessment = true;

    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
    assessmentConfig.applyTo(recognizer);

    let retryCount = 0;
    const maxRetries = 3;

    const attemptRecognition = async (): Promise<PronunciationResult> => {
      return new Promise((resolve, reject) => {
        recognizer.recognized = (s: any, e: any) => {
          console.log('[Azure Speech Client] Recognition event:', {
            resultId: e.result.resultId,
            text: e.result.text,
            reason: e.result.reason,
            duration: e.result.duration,
            offset: e.result.offset
          });
        };

        recognizer.canceled = (s: any, e: any) => {
          console.error('[Azure Speech Client] Recognition canceled:', {
            reason: e.reason,
            errorCode: e.errorCode,
            errorDetails: e.errorDetails
          });

          if (retryCount < maxRetries && (e.reason === speechsdk.CancellationReason.Error || e.errorCode === 4)) {
            console.log(`[Azure Speech Client] Retrying recognition (attempt ${retryCount + 1}/${maxRetries})...`);
            retryCount++;
            recognizer.close();
            setTimeout(() => {
              attemptRecognition().then(resolve).catch(reject);
            }, 1000 * retryCount); // Exponential backoff
          } else {
            recognizer.close();
            reject(new Error(`Recognition canceled: ${e.errorDetails}`));
          }
        };

        recognizer.recognizeOnceAsync(
          async (result: any) => {
            console.log('[Azure Speech Client] Recognition result:', {
              reason: result.reason,
              text: result.text,
              duration: result.duration,
              resultId: result.resultId,
              properties: result.properties
            });
            
            if (result.reason === ResultReason.RecognizedSpeech) {
              try {
                console.log('[Azure Speech Client] Raw recognition result:', {
                  text: result.text,
                  duration: result.duration,
                  offset: result.offset,
                  properties: result.properties?.toString()
                });
                
                const pronunciationResult = await PronunciationAssessmentResult.fromResult(result);
                console.log('[Azure Speech Client] Pronunciation result:', {
                  accuracyScore: pronunciationResult?.accuracyScore,
                  fluencyScore: pronunciationResult?.fluencyScore,
                  completenessScore: pronunciationResult?.completenessScore,
                  pronunciationScore: pronunciationResult?.pronunciationScore
                });
                
                if (!pronunciationResult) {
                  throw new Error('No pronunciation result available');
                }

                const response: PronunciationResult = {
                  accuracyScore: pronunciationResult.accuracyScore || 0,
                  fluencyScore: pronunciationResult.fluencyScore || 0,
                  completenessScore: pronunciationResult.completenessScore || 0,
                  pronunciationScore: pronunciationResult.pronunciationScore || 0,
                  prosodyScore: pronunciationResult.prosodyScore || 0,
                  word: word
                };

                console.log('[Azure Speech Client] Assessment complete:', response);
                recognizer.close();
                resolve(response);
              } catch (error: any) {
                console.error('[Azure Speech Client] Error processing pronunciation result:', error);
                recognizer.close();
                reject(new Error(`Failed to process pronunciation result: ${error.message}`));
              }
            } else {
              const error = new Error(`Recognition failed: ${result.reason}`);
              console.error('[Azure Speech Client] Recognition failed:', error);
              recognizer.close();
              reject(error);
            }
          },
          (error: any) => {
            console.error('[Azure Speech Client] Error during recognition:', error);
            recognizer.close();
            reject(new Error(error.message || 'Unknown recognition error'));
          }
        );
      });
    };

    const result = await attemptRecognition();
    return result;
  } catch (error: any) {
    console.error('[Azure Speech Client] Error in pronunciation assessment:', error);
    throw new Error(error.message || 'Unknown error in pronunciation assessment');
  }
}

// Placeholder function for sentence assessment (implementation needed)
export async function assessSentencePronunciationAzure(
  text: string,
  audioBase64: string
): Promise<SentencePronunciationResultAzure> {
  console.log('[Azure Speech Client] assessSentencePronunciationAzure called (placeholder)');
  // TODO: Implement actual Azure SDK call for sentence assessment
  // This will involve setting pronunciationAssessmentConfig granularity to Phoneme
  // and processing the detailed result JSON.
  await validateAzureCredentials();
  const audioData = base64ToWav(audioBase64);
  
  // Simulate API call and return mock data matching the Azure structure
  await new Promise(resolve => setTimeout(resolve, 1500));
  const mockWords = text.split(' ').map((word, index) => ({
    word: word,
    accuracyScore: Math.floor(Math.random() * 41) + 60, // 60-100
    errorType: Math.random() > 0.85 ? 'Mispronunciation' : 'None',
    offset: index * 10000000, // Mock offset
    duration: 5000000 + Math.random() * 3000000 // Mock duration
  }));

  return {
    accuracyScore: Math.floor(Math.random() * 31) + 70,
    pronunciationScore: Math.floor(Math.random() * 31) + 70,
    completenessScore: Math.floor(Math.random() * 21) + 80,
    fluencyScore: Math.floor(Math.random() * 31) + 65,
    words: mockWords,
  };
}

export async function textToSpeech(text: string): Promise<ArrayBuffer> {
  if (!SPEECH_KEY || !SPEECH_REGION) {
    throw new Error('Azure Speech credentials not configured');
  }
  type SpeechSynthesisResult = {
    audioData: ArrayBuffer;
  };
  try {
    const speechConfig = SpeechConfig.fromSubscription(SPEECH_KEY!, SPEECH_REGION!);
    speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural';

    const synthesizer = new SpeechSynthesizer(speechConfig);
    
    return new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        (result: SpeechSynthesisResult) => {
          const { audioData } = result;
          synthesizer.close();
          resolve(audioData);
        },
        (error) => {
          synthesizer.close();
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error('Error in text to speech:', error);
    throw error;
  }
}
