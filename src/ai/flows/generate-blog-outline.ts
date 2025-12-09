'use server';

/**
 * @fileOverview An AI-powered tool that generates blog outlines based on specified keywords, topic, and desired tone.
 *
 * - generateBlogOutline - A function that handles the blog outline generation process.
 * - GenerateBlogOutlineInput - The input type for the generateBlogOutline function.
 * - GenerateBlogOutlineOutput - The return type for the generateBlogOutline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBlogOutlineInputSchema = z.object({
  topic: z.string().describe('The main topic of the blog post.'),
  keywords: z.string().describe('Comma-separated keywords related to the blog post.'),
  tone: z.string().describe('The desired tone of the blog post (e.g., informative, persuasive, humorous).'),
});
export type GenerateBlogOutlineInput = z.infer<typeof GenerateBlogOutlineInputSchema>;

const GenerateBlogOutlineOutputSchema = z.object({
  outline: z.string().describe('The generated blog outline.'),
});
export type GenerateBlogOutlineOutput = z.infer<typeof GenerateBlogOutlineOutputSchema>;

export async function generateBlogOutline(input: GenerateBlogOutlineInput): Promise<GenerateBlogOutlineOutput> {
  return generateBlogOutlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBlogOutlinePrompt',
  input: {schema: GenerateBlogOutlineInputSchema},
  output: {schema: GenerateBlogOutlineOutputSchema},
  prompt: `You are an expert blog outline generator. Generate a detailed and engaging blog outline based on the following information:\n\nTopic: {{{topic}}}\nKeywords: {{{keywords}}}\nTone: {{{tone}}}\n\nOutline:`,
});

const generateBlogOutlineFlow = ai.defineFlow(
  {
    name: 'generateBlogOutlineFlow',
    inputSchema: GenerateBlogOutlineInputSchema,
    outputSchema: GenerateBlogOutlineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
