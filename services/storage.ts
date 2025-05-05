import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and anon key are required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// The bucket is already created in Supabase, so we don't need to check or create it
const BUCKET_NAME = 'generated-image';

// Function to get bucket info - useful for debugging
async function getBucketInfo() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucket = buckets?.find(b => b.name === BUCKET_NAME);
    console.log('Bucket info:', bucket);
    return bucket;
  } catch (error) {
    console.error('Error getting bucket info:', error);
    return null;
  }
}

interface UploadImageOptions {
  userId?: string;
  contentId?: string;
  imageIndex?: number;
}

export const uploadImageFromUrl = async (imageUrl: string, options: UploadImageOptions = {}): Promise<string> => {
  try {
    // Fetch the image from the URL
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Convert blob to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data.split(',')[1]); // Remove data URL prefix
      };
    });
    reader.readAsDataURL(blob);
    const base64Data = await base64Promise;

    // Generate a unique filename and path
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    
    // Construct the file path
    let filePath = '';
    if (options.userId) {
      filePath += `${options.userId}/`;
      if (options.contentId) {
        filePath += `${options.contentId}/`;
      }
    }
    filePath += `${timestamp}-${randomString}.png`;

    // Upload the base64 data to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, decode(base64Data), {
        contentType: 'image/png',
        cacheControl: '3600',
      });

    if (error) {
      throw error;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Helper function to decode base64 to Uint8Array
function decode(base64: string): Uint8Array {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.charCodeAt(0));
}
