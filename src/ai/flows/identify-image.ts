'use server';

/**
 * @fileOverview An AI-powered tool that identifies the content of an image.
 *
 * - identifyImage - A function that handles the image identification process.
 * - IdentifyImageInput - The input type for the identifyImage function.
 * - IdentifyImageOutput - The return type for the identifyImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IdentifyImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyImageInput = z.infer<typeof IdentifyImageInputSchema>;

const IdentifyImageOutputSchema = z.object({
  description: z.string().describe('A brief description of the image content.'),
  tags: z.array(z.string()).describe('Two relevant keywords for the image.'),
});
export type IdentifyImageOutput = z.infer<typeof IdentifyImageOutputSchema>;

export async function identifyImage(
  input: IdentifyImageInput
): Promise<IdentifyImageOutput> {
  return identifyImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyImagePrompt',
  input: { schema: IdentifyImageInputSchema },
  output: { schema: IdentifyImageOutputSchema },
  prompt: `You are an expert image analyst. Analyze the following image and provide a concise one-sentence description and two relevant one-word tags.

Image: {{media url=imageDataUri}}`,
});

const identifyImageFlow = ai.defineFlow(
  {
    name: 'identifyImageFlow',
    inputSchema: IdentifyImageInputSchema,
    outputSchema: IdentifyImageOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
