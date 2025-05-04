import { supabase } from '@/lib/supabase';
import { Book } from '@/types/book';

export type ReadingLevel = 'beginner' | 'intermediate' | 'advanced';
export type ContentType = 'words' | 'sentences' | 'passage' | 'story'; // Must match database constraints

export interface AIGeneratedContent {
  id?: string;
  title: string;
  type: ContentType;
  reading_level: ReadingLevel;
  image_url?: string;
  audio_url?: string;
  user_id?: string;
  child_id?: string;
  description?: string;
  language?: string;
  age_range?: string;
  is_favorite?: boolean;
}

export interface AIContentItem {
  id?: string;
  content_id: string;
  text: string;
  image_url?: string;
  audio_url?: string;
  display_order: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  earnedAt: string;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  reading_level: ReadingLevel;
  parent_id: string;
  is_active: boolean;
  created_at: string;
  avatar?: string;
  totalBooksRead: number;
  totalMinutesRead: number;
  streakDays: number;
  pronunciationAccuracy: number;
  readingProgress: number;
  badges: Badge[];
}

export async function getActiveChild(parentId: string): Promise<Child | null> {
  // First try to get the active child
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', parentId)
    .eq('is_active', true)
    .maybeSingle(); // Use maybeSingle instead of single to avoid error when no rows found

  if (error) {
    console.error('Error fetching active child:', error);
    return null;
  }

  // If we found an active child, return it
  if (data) {
    return data;
  }
  
  // If no active child found, try to get any child for this parent and set it as active
  const { data: anyChild, error: anyChildError } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', parentId)
    .limit(1)
    .maybeSingle();
    
  if (anyChildError) {
    console.error('Error fetching any child:', anyChildError);
    return null;
  }
  
  // If we found a child, set it as active and return it
  if (anyChild) {
    const { error: updateError } = await supabase
      .from('children')
      .update({ is_active: true })
      .eq('id', anyChild.id);
      
    if (updateError) {
      console.error('Error setting child as active:', updateError);
    }
    
    return anyChild;
  }
  
  // No children found for this parent
  return null;
}

export async function setActiveChild(childId: string, parentId: string): Promise<boolean> {
  try {
    // Begin transaction
    const { error: updateError } = await supabase
      .rpc('set_active_child', {
        p_child_id: childId,
        p_parent_id: parentId
      });

    if (updateError) throw updateError;
    return true;
  } catch (error) {
    console.error('Error setting active child:', error);
    return false;
  }
}

export async function saveAIGeneratedContent(
  content: AIGeneratedContent,
  items: AIContentItem[]
): Promise<{ contentId: string | null; error: Error | null }> {
  try {
    // Insert main content
    const { data: contentData, error: contentError } = await supabase
      .from('ai_generated_contents')
      .insert([content])
      .select('id')
      .single();

    if (contentError) throw contentError;
    
    const contentId = contentData.id;

    // Insert content items with the content_id
    const itemsWithContentId = items.map(item => ({
      ...item,
      content_id: contentId
    }));

    const { error: itemsError } = await supabase
      .from('ai_content_items')
      .insert(itemsWithContentId);

    if (itemsError) throw itemsError;

    return { contentId, error: null };
  } catch (error) {
    console.error('Error saving AI generated content:', error);
    return { contentId: null, error: error as Error };
  }
}

export async function getAIGeneratedContent(contentId: string): Promise<{
  content: AIGeneratedContent | null;
  items: AIContentItem[];
  error: Error | null;
}> {
  try {
    // Fetch main content
    const { data: contentData, error: contentError } = await supabase
      .from('ai_generated_contents')
      .select('*')
      .eq('id', contentId)
      .single();

    if (contentError) throw contentError;

    // Fetch content items
    const { data: itemsData, error: itemsError } = await supabase
      .from('ai_content_items')
      .select('*')
      .eq('content_id', contentId)
      .order('display_order');

    if (itemsError) throw itemsError;

    return {
      content: contentData,
      items: itemsData || [],
      error: null
    };
  } catch (error) {
    console.error('Error fetching AI generated content:', error);
    return {
      content: null,
      items: [],
      error: error as Error
    };
  }
}

// Convert AI content to book format for the reader
export function convertAIContentToBook(content: AIGeneratedContent & { items: AIContentItem[] }): Book {
  return {
    id: content.id || '',
    title: content.title,
    author: 'AI Generated',
    description: content.description || '',
    ageRange: content.age_range,
    readingLevel: content.reading_level,
    isGenerated: true,
    coverUrl: content.items[0]?.image_url,
    content: content.items[0]?.text,
    dateAdded: new Date().toISOString(),
  };
}

export async function getAllAIGeneratedContent(userId: string): Promise<{
  contents: (AIGeneratedContent & { items: AIContentItem[] })[];
  error: Error | null;
}> {
  try {
    // Fetch all content for the user
    const { data: contentsData, error: contentsError } = await supabase
      .from('ai_generated_contents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (contentsError) throw contentsError;

    if (!contentsData || contentsData.length === 0) {
      return { contents: [], error: null };
    }

    // Fetch all items for all content
    const contentIds = contentsData.map(content => content.id);
    const { data: itemsData, error: itemsError } = await supabase
      .from('ai_content_items')
      .select('*')
      .in('content_id', contentIds)
      .order('display_order');

    if (itemsError) throw itemsError;

    // Group items by content_id
    const itemsByContentId = (itemsData || []).reduce((acc, item) => {
      if (!acc[item.content_id]) {
        acc[item.content_id] = [];
      }
      acc[item.content_id].push(item);
      return acc;
    }, {} as Record<string, AIContentItem[]>);

    // Combine content with its items
    const contents = contentsData.map(content => ({
      ...content,
      items: itemsByContentId[content.id] || []
    }));

    return { contents, error: null };
  } catch (error) {
    console.error('Error fetching all AI generated content:', error);
    return {
      contents: [],
      error: error as Error
    };
  }
}
