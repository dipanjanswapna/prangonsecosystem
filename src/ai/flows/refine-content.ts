'use server';

/**
 * @fileOverview An AI agent that refines existing blog posts or articles for clarity, grammar, and tone.
 *
 * - refineContent - A function that handles the content refinement process.
 * - RefineContentInput - The input type for the refineContent function.
 * - RefineContentOutput - The return type for the refineContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineContentInputSchema = z.object({
  content: z.string().describe('The existing blog post or article content to be refined.'),
  tone: z.string().optional().describe('The desired tone for the refined content (e.g., professional, casual, motivational).'),
});
export type RefineContentInput = z.infer<typeof RefineContentInputSchema>;

const RefineContentOutputSchema = z.object({
  refinedContent: z.string().describe('The refined blog post or article content.'),
});
export type RefineContentOutput = z.infer<typeof RefineContentOutputSchema>;

export async function refineContent(input: RefineContentInput): Promise<RefineContentOutput> {
  return refineContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineContentPrompt',
  input: {schema: RefineContentInputSchema},
  output: {schema: RefineContentOutputSchema},
  prompt: `You are an expert content editor specializing in refining blog posts and articles for clarity, grammar, and tone.

You will receive an existing blog post or article and refine it for clarity, grammar, and overall readability. You will also adjust the tone of the content if specified.

Existing Content: {{{content}}}

Desired Tone (if specified): {{{tone}}}

Refined Content:`, // Ensure the prompt ends with "Refined Content:"
});

const refineContentFlow = ai.defineFlow(
  {
    name: 'refineContentFlow',
    inputSchema: RefineContentInputSchema,
    outputSchema: RefineContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
