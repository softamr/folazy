'use server';
/**
 * @fileOverview An AI agent that recommends similar listings based on viewing history.
 *
 * - getListingRecommendations - A function that handles the listing recommendation process.
 * - ListingRecommendationsInput - The input type for the getListingRecommendations function.
 * - ListingRecommendationsOutput - The return type for the getListingRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ListingRecommendationsInputSchema = z.object({
  viewingHistory: z
    .array(z.string())
    .describe('An array of listing IDs representing the user viewing history.'),
  currentListing: z.string().describe('The ID of the currently viewed listing.'),
});
export type ListingRecommendationsInput = z.infer<typeof ListingRecommendationsInputSchema>;

const ListingRecommendationsOutputSchema = z.object({
  recommendedListings: z
    .array(z.string())
    .describe('An array of listing IDs representing the recommended listings.'),
});
export type ListingRecommendationsOutput = z.infer<typeof ListingRecommendationsOutputSchema>;

export async function getListingRecommendations(input: ListingRecommendationsInput): Promise<ListingRecommendationsOutput> {
  return listingRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'listingRecommendationsPrompt',
  input: {schema: ListingRecommendationsInputSchema},
  output: {schema: ListingRecommendationsOutputSchema},
  prompt: `You are a recommendation engine for an online marketplace.

  Based on the user's viewing history and the current listing they are viewing,
  recommend other listings that they might be interested in.

  Viewing History: {{{viewingHistory}}}
  Current Listing: {{{currentListing}}}

  Return only an array of listing IDs.
  `,
});

const listingRecommendationsFlow = ai.defineFlow(
  {
    name: 'listingRecommendationsFlow',
    inputSchema: ListingRecommendationsInputSchema,
    outputSchema: ListingRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
