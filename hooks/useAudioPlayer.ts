import { useState, useEffect } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

export const useAudioPlayer = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playAudio = async (audioUrl: string) => {
    console.log(`[useAudioPlayer] playAudio called with URL: ${audioUrl}`);
    try {
      // If we're already playing this audio, just toggle playback
      if (sound && currentAudioUrl === audioUrl) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
          console.log('[useAudioPlayer] Paused existing sound.');
        } else {
          await sound.playAsync();
          setIsPlaying(true);
          console.log('[useAudioPlayer] Resumed existing sound.');
        }
        return;
      }

      // Unload any existing sound
      if (sound) {
        console.log('[useAudioPlayer] Unloading previous sound...');
        await sound.unloadAsync();
        setSound(null);
      }

      // Reset states
      setError(null);
      setLoadingState('loading');
      setCurrentAudioUrl(audioUrl);
      console.log('[useAudioPlayer] Set loading state, currentAudioUrl:', audioUrl);

      // Load the new audio
      console.log('[useAudioPlayer] Calling Audio.Sound.createAsync...');
      const { sound: newSound, status: initialStatus } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        (status: AVPlaybackStatus) => {
          console.log('[useAudioPlayer] Playback Status Update:', JSON.stringify(status, null, 2));
          // Check if the status represents an error first
          if (!status.isLoaded && status.error) {
            console.error(`[useAudioPlayer] Playback Error Callback: ${status.error}`);
            setError(status.error);
            setLoadingState('error');
            setIsPlaying(false);
            if (sound) {
              sound.unloadAsync().catch(e => console.error('[useAudioPlayer] Error unloading after playback error:', e));
            }
            setSound(null);
          } else if (status.isLoaded) {
            setLoadingState('loaded');
            setIsPlaying(status.isPlaying);

            if (status.didJustFinish) {
              console.log('[useAudioPlayer] Playback finished.');
              setIsPlaying(false);
            }
          }
        }
      );

      console.log('[useAudioPlayer] Sound created successfully. Initial Status:', JSON.stringify(initialStatus, null, 2));
      setSound(newSound);
      // Check if the initial status indicates the sound is loaded before accessing isPlaying
      if (initialStatus.isLoaded) {
        setIsPlaying(initialStatus.isPlaying);
        setLoadingState('loaded');
      } else {
        // If not loaded immediately, the status callback will update it, set playing to false initially
        setIsPlaying(false);
        // Check if initial status has an error
        if (initialStatus.error) {
          console.error(`[useAudioPlayer] Initial Playback Error: ${initialStatus.error}`);
          setError(initialStatus.error);
          setLoadingState('error');
        }
        // else, it's likely still loading, which is handled by the callback
      }
    } catch (err: any) {
      console.error('[useAudioPlayer] Error in playAudio function:', err);
      setError(err.message || 'Failed to load or play audio');
      setLoadingState('error');
      setIsPlaying(false);
      setCurrentAudioUrl(null);
      if (sound) {
        await sound.unloadAsync().catch(e => console.error('[useAudioPlayer] Error unloading after create error:', e));
        setSound(null);
      }
    }
  };

  const stopAudio = async () => {
    if (sound) {
      try {
        await sound.pauseAsync();
        setIsPlaying(false);
      } catch (err) {
        console.error('Error stopping audio:', err);
      }
    }
  };

  return {
    playAudio,
    stopAudio,
    isPlaying,
    error,
    loadingState,
    currentAudioUrl
  };
};
