// noinspection JSUnusedLocalSymbols
'use server';

/**
 * @fileOverview Image analysis AI agent to verify product authenticity and flag potential issues.
 *
 * - analyzeListingImage - A function that handles the image analysis process.
 * - AnalyzeListingImageInput - The input type for the analyzeListingImage function.
 * - AnalyzeListingImageOutput - The return type for the analyzeListingImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeListingImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a listing, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeListingImageInput = z.infer<typeof AnalyzeListingImageInputSchema>;

const AnalyzeListingImageOutputSchema = z.object({
  isAuthentic: z.boolean().describe('Whether or not the listing image is authentic.'),
  issues: z.array(z.string()).describe('An array of potential issues found in the listing image.'),
});
export type AnalyzeListingImageOutput = z.infer<typeof AnalyzeListingImageOutputSchema>;

export async function analyzeListingImage(input: AnalyzeListingImageInput): Promise<AnalyzeListingImageOutput> {
  return analyzeListingImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeListingImagePrompt',
  input: {schema: AnalyzeListingImageInputSchema},
  output: {schema: AnalyzeListingImageOutputSchema},
  prompt: `You are an expert in verifying the authenticity of products from listing images. Analyze the image and identify any potential issues, such as copyright infringement, misleading information, or prohibited items. You will make a determination as to whether the listing image is authentic or not, and list any potential issues.

  Photo: {{media url=photoDataUri}}
  `,
});

const analyzeListingImageFlow = ai.defineFlow(
  {
    name: 'analyzeListingImageFlow',
    inputSchema: AnalyzeListingImageInputSchema,
    outputSchema: AnalyzeListingImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
