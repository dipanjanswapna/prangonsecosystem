'use server';

/**
 * @fileOverview A content generation tool that helps Dipanjan generate first drafts of blog posts and social media content.
 *
 * - generateFirstDraft - A function that handles the content generation process.
 * - GenerateFirstDraftInput - The input type for the generateFirstDraft function.
 * - GenerateFirstDraftOutput - The return type for the generateFirstDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFirstDraftInputSchema = z.object({
  keywords: z.string().describe('Keywords to guide content generation.'),
  tone: z.string().describe('The desired tone of the content (e.g., informative, motivational, casual).'),
  contentType: z.enum(['blog post', 'social media post']).describe('The type of content to generate.'),
});
export type GenerateFirstDraftInput = z.infer<typeof GenerateFirstDraftInputSchema>;

const GenerateFirstDraftOutputSchema = z.object({
  firstDraft: z.string().describe('The generated first draft of the content.'),
});
export type GenerateFirstDraftOutput = z.infer<typeof GenerateFirstDraftOutputSchema>;

export async function generateFirstDraft(input: GenerateFirstDraftInput): Promise<GenerateFirstDraftOutput> {
  return generateFirstDraftFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFirstDraftPrompt',
  input: {schema: GenerateFirstDraftInputSchema},
  output: {schema: GenerateFirstDraftOutputSchema},
  prompt: `You are a content creation assistant for Dipanjan.
  Based on the provided keywords and desired tone, generate a first draft for a {{{contentType}}}.

  Keywords: {{{keywords}}}
  Tone: {{{tone}}}

  Draft:
  `,
});

const generateFirstDraftFlow = ai.defineFlow(
  {
    name: 'generateFirstDraftFlow',
    inputSchema: GenerateFirstDraftInputSchema,
    outputSchema: GenerateFirstDraftOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
