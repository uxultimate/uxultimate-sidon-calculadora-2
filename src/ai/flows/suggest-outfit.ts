'use server';

/**
 * @fileOverview An outfit suggestion AI agent.
 *
 * - suggestOutfit - A function that handles the outfit suggestion process.
 * - SuggestOutfitInput - The input type for the suggestOutfit function.
 * - SuggestOutfitOutput - The return type for the suggestOutfit function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOutfitInputSchema = z.object({
  wardrobe: z.array(
    z.object({
      type: z.string().describe('The type of clothing item (e.g., shirt, pants, shoes).'),
      quantity: z.number().int().positive().describe('The number of items of this type.'),
    })
  ).describe('A list of clothing items in the user wardrobe.'),
  occasion: z.string().optional().describe('The occasion for which to suggest an outfit (e.g., casual, business, formal).'),
});
export type SuggestOutfitInput = z.infer<typeof SuggestOutfitInputSchema>;

const SuggestOutfitOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      description: z.string().describe('A description of the suggested outfit.'),
      items: z.array(
        z.object({
          type: z.string().describe('The type of clothing item.'),
          name: z.string().describe('The suggested item name (e.g., "white button-down shirt").'),
        })
      ).describe('The list of clothing items in the suggested outfit.'),
    })
  ).describe('A list of suggested outfits.'),
});
export type SuggestOutfitOutput = z.infer<typeof SuggestOutfitOutputSchema>;

export async function suggestOutfit(input: SuggestOutfitInput): Promise<SuggestOutfitOutput> {
  return suggestOutfitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOutfitPrompt',
  input: {schema: SuggestOutfitInputSchema},
  output: {schema: SuggestOutfitOutputSchema},
  prompt: `You are a personal stylist who gives suggestions to users on what to wear.  Take into account the clothing in their wardrobe, and the occasion.

  Wardrobe:
  {{#each wardrobe}}
  - {{quantity}} x {{type}}
  {{/each}}

  {{#if occasion}}
  Occasion: {{occasion}}
  {{/if}}

  Suggest some outfits from their wardrobe.
  `,
});

const suggestOutfitFlow = ai.defineFlow(
  {
    name: 'suggestOutfitFlow',
    inputSchema: SuggestOutfitInputSchema,
    outputSchema: SuggestOutfitOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
