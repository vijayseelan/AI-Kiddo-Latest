import 'react-native-url-polyfill/auto'; // Required for Supabase
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const CHUNK_SIZE = 1900; // Define chunk size (below 2048 limit)

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const chunkCountStr = await SecureStore.getItemAsync(key);
      if (!chunkCountStr) {
        return null; // Key doesn't exist
      }
      
      // Check if it's chunked data or a regular small item
      if (!chunkCountStr.startsWith('chunked:')) {
        return chunkCountStr; // Not chunked, return directly
      }

      const chunkCount = parseInt(chunkCountStr.substring(8), 10);
      if (isNaN(chunkCount)) {
        console.error(`Invalid chunk count for key: ${key}`);
        await SecureStore.deleteItemAsync(key); // Clean up invalid entry
        return null;
      }

      const chunks: string[] = [];
      for (let i = 0; i < chunkCount; i++) {
        const chunkKey = `${key}_chunk_${i}`;
        const chunk = await SecureStore.getItemAsync(chunkKey);
        if (chunk === null) {
          console.error(`Missing chunk ${i} for key: ${key}`);
          // Attempt to clean up potentially corrupted data
          await ExpoSecureStoreAdapter.removeItem(key); 
          return null;
        }
        chunks.push(chunk);
      }
      return chunks.join('');
    } catch (error) {
      console.error(`Error getting item ${key} from SecureStore:`, error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      const valueSize = new Blob([value]).size;

      if (valueSize < CHUNK_SIZE) {
        // Value is small enough, store directly
        await SecureStore.setItemAsync(key, value);
        return;
      }

      // Value is large, chunk it
      const numChunks = Math.ceil(valueSize / CHUNK_SIZE);
      
      // First, try to remove any old chunks if they exist for this key
      await ExpoSecureStoreAdapter.removeItem(key); 

      // Store the chunk count under the main key
      await SecureStore.setItemAsync(key, `chunked:${numChunks}`);

      // Store each chunk
      for (let i = 0; i < numChunks; i++) {
        const chunkKey = `${key}_chunk_${i}`;
        const chunk = value.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        await SecureStore.setItemAsync(chunkKey, chunk);
      }
    } catch (error) {
      console.error(`Error setting item ${key} in SecureStore:`, error);
      // Attempt cleanup on error during setItem
      try {
         await ExpoSecureStoreAdapter.removeItem(key);
      } catch (cleanupError) {
        console.error(`Error cleaning up ${key} after setItem failure:`, cleanupError);
      }
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      const chunkCountStr = await SecureStore.getItemAsync(key);
      
      // Remove the main key regardless
      await SecureStore.deleteItemAsync(key); 
      
      if (chunkCountStr && chunkCountStr.startsWith('chunked:')) {
         const chunkCount = parseInt(chunkCountStr.substring(8), 10);
         if (!isNaN(chunkCount)) {
           for (let i = 0; i < chunkCount; i++) {
             const chunkKey = `${key}_chunk_${i}`;
             await SecureStore.deleteItemAsync(chunkKey);
           }
         }
      }
    } catch (error) {
       console.error(`Error removing item ${key} from SecureStore:`, error);
    }
  },
};

// !! IMPORTANT: Replace with environment variables in production !!
const supabaseUrl = "https://yhtphaemshcljbzlpuaz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlodHBoYWVtc2hjbGpiemxwdWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NzQ0NjEsImV4cCI6MjA2MDE1MDQ2MX0.R0vTkpKZZfS2nR8MVPmqFRGpRv91QApSja-ai0Ru6vs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, { 
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for React Native
  },
});

export const fetchUserProfiles = async (userId: string) => {
  return supabase
    .from('children')
    .select('*')
    .eq('parent_id', userId);
};

export const getActiveChild = async (parentId: string) => {
  return supabase
    .from('children')
    .select('*')
    .eq('parent_id', parentId)
    .eq('is_active', true)
    .single();
};

export const setActiveChild = async (childId: string, parentId: string) => {
  return supabase.rpc('set_active_child', {
    p_child_id: childId,
    p_parent_id: parentId
  });
};