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

// Implemented function for sentence assessment using Azure Speech SDK
export async function assessSentencePronunciationAzure(
  text: string,
  audioBase64: string
): Promise<SentencePronunciationResultAzure> {
  if (!text || !audioBase64) {
    throw new Error('Text and audio data are required for sentence assessment');
  }
  // Validate credentials first
  await validateAzureCredentials();

  console.log('[Azure Speech Client] Starting sentence pronunciation assessment for:', text);

  return new Promise(async (resolve, reject) => {
    try {
      const audioData = base64ToWav(audioBase64);
      const region = 'southeastasia'; // Force region
      const speechConfig = SpeechConfig.fromSubscription(SPEECH_KEY, region);
      speechConfig.speechRecognitionLanguage = 'en-US';
      speechConfig.setProperty(speechsdk.PropertyId.SpeechServiceResponse_OutputFormatOption, 'Detailed'); 
      // Setting this property gets us the detailed JSON in the result
      speechConfig.setProperty(speechsdk.PropertyId.SpeechServiceResponse_RequestWordLevelTimestamps, "true");

      // Use Phoneme granularity for detailed word analysis within the sentence
      const pronunciationConfig = new PronunciationAssessmentConfig(
        text,
        PronunciationAssessmentGradingSystem.HundredMark,
        PronunciationAssessmentGranularity.Phoneme, // Use Phoneme for word details
        true // Enable prosody assessment
      );
      pronunciationConfig.enableProsodyAssessment = true;

      const format = speechsdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
      const pushStream = speechsdk.AudioInputStream.createPushStream(format);
      pushStream.write(audioData);
      pushStream.close();

      const audioConfig = AudioConfig.fromStreamInput(pushStream);
      const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
      pronunciationConfig.applyTo(recognizer);

      recognizer.recognized = (s: any, e: any) => {
        if (e.result.reason === ResultReason.RecognizedSpeech) {
          console.log('[Azure Speech Client] Sentence recognized. Processing pronunciation result...');
          const pronunciationResult = PronunciationAssessmentResult.fromResult(e.result);
          const resultJsonString = e.result.properties.getProperty(speechsdk.PropertyId.SpeechServiceResponse_JsonResult);
          
          if (pronunciationResult && resultJsonString) {
            try {
                const resultDetails = JSON.parse(resultJsonString);
                
                // Navigate nested structure to get assessment scores and words
                const assessment = resultDetails?.NBest?.[0]?.PronunciationAssessment;
                
                if (assessment) {
                    const sentenceResult: SentencePronunciationResultAzure = {
                        accuracyScore: assessment.AccuracyScore || 0,
                        fluencyScore: assessment.FluencyScore || 0,
                        completenessScore: assessment.CompletenessScore || 0,
                        pronunciationScore: assessment.PronScore || 0,
                        prosodyScore: assessment.ProsodyScore, // Optional
                        words: (assessment.Words || []).map((word: any) => ({
                            word: word.Word,
                            accuracyScore: word.AccuracyScore || 0,
                            errorType: word.ErrorType || 'None',
                            offset: word.Offset, // In ticks (100 nanoseconds)
                            duration: word.Duration // In ticks
                        }))
                    };
                    console.log('[Azure Speech Client] Sentence assessment successful:', sentenceResult);
                    recognizer.close();
                    resolve(sentenceResult);
                } else {
                     console.error('[Azure Speech Client] Could not find PronunciationAssessment object in JSON result:', resultDetails);
                     reject(new Error('Failed to parse pronunciation assessment details from JSON result.'));
                }
            } catch (jsonError) {
                 console.error('[Azure Speech Client] Error parsing JSON result:', jsonError, resultJsonString);
                 reject(new Error('Failed to parse pronunciation assessment JSON result.'));
            }
          } else {
            console.error('[Azure Speech Client] Pronunciation assessment result or JSON details missing:', { hasResult: !!pronunciationResult, hasJson: !!resultJsonString });
            reject(new Error('Pronunciation assessment result is missing or incomplete.'));
          }
        } else if (e.result.reason === ResultReason.NoMatch) {
           console.warn('[Azure Speech Client] No speech could be recognized for the sentence.');
           reject(new Error('No speech could be recognized.'));
        }
      };

      recognizer.canceled = (s: any, e: any) => {
        console.error(`[Azure Speech Client] Sentence recognition CANCELED: Reason=${e.reason}`);
        if (e.reason === speechsdk.CancellationReason.Error) {
          console.error(`[Azure Speech Client] Cancellation ErrorCode=${e.errorCode}`);
          console.error(`[Azure Speech Client] Cancellation ErrorDetails=${e.errorDetails}`);
        }
        recognizer.close();
        reject(new Error(`Recognition canceled: ${e.reason} ${e.errorDetails || ''}`.trim()));
      };

      recognizer.sessionStopped = (s: any, e: any) => {
        console.log('[Azure Speech Client] Sentence recognition session stopped.');
        recognizer.close();
        // If recognition hasn't resolved/rejected yet, reject here
        // This might happen if the session stops unexpectedly without a 'recognized' or 'canceled' event
        // We might need a flag to track if resolved/rejected already happened.
        // For now, let's assume the other handlers cover most cases.
      };

      console.log('[Azure Speech Client] Starting continuous recognition for sentence...');
      recognizer.startContinuousRecognitionAsync(
        () => { console.log('[Azure Speech Client] Sentence recognition started.'); },
        (err: string) => {
          console.error('[Azure Speech Client] Error starting sentence recognition:', err);
          recognizer.close();
          reject(new Error(`Error starting recognition: ${err}`));
        }
      );

      // Need to manually stop recognition after some time or signal?
      // For now, assume the service detects end-of-speech or times out.
      // Or perhaps `recognizeOnceAsync` is better if we know audio is complete?
      // Let's switch to recognizeOnceAsync as the audio stream is finite.
      /*
      recognizer.recognizeOnceAsync(
          result => {
              // This callback style seems deprecated or less common for pronunciation assessment
              // Stick with event-based for detailed results
          },
          err => {
              console.error(`ERROR: ${err}`);
              recognizer.close();
              reject(new Error(err));
          }
      );*/

    } catch (error: any) {
      console.error('[Azure Speech Client] Error during sentence assessment setup:', error);
      reject(error);
    }
  });
}

/**
 * Converts text to speech using Azure Speech Service.
 * @param text The text to synthesize.
 * @returns A Promise resolving to an ArrayBuffer containing the WAV audio data.
 */
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
