'use server';

import { suggestOutfit, type SuggestOutfitInput } from '@/ai/flows/suggest-outfit';

export async function getSuggestionsAction(input: SuggestOutfitInput) {
  try {
    if (input.wardrobe.length === 0) {
      return { success: false, error: 'Your wardrobe is empty. Please add some items to get suggestions.' };
    }
    const result = await suggestOutfit(input);
    if (!result || !result.suggestions || result.suggestions.length === 0) {
        return { success: false, error: 'We couldn\'t generate any suggestions with your current wardrobe. Try adding more variety!' };
    }
    return { success: true, data: result };
  } catch (e) {
    console.error(e);
    // Provide a user-friendly error message
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return { success: false, error: `Failed to get suggestions: ${errorMessage}. Please try again later.` };
  }
}
