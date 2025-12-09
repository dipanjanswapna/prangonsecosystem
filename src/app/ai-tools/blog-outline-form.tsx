'use client';

import { generateBlogOutline } from '@/ai/flows/generate-blog-outline';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  topic: z.string().min(5, 'Topic must be at least 5 characters.'),
  keywords: z.string().min(3, 'Please provide some keywords.'),
  tone: z.string().min(3, 'Please specify a tone.'),
});

export function BlogOutlineForm() {
  const { toast } = useToast();
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      keywords: '',
      tone: 'Informative',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const output = await generateBlogOutline(values);
      setResult(output.outline);
    } catch (error) {
      console.error('Error generating blog outline:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred.',
        description: 'Failed to generate blog outline. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline">
              Generate Blog Outline
            </CardTitle>
            <CardDescription>
              Provide a topic, keywords, and tone to generate a blog post
              outline.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The Future of AI" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., artificial intelligence, machine learning"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tone</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Persuasive, Humorous" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Bot className="mr-2 h-4 w-4" />
              )}
              Generate Outline
            </Button>
            {result && (
              <div className="mt-4 p-4 border rounded-md bg-muted/50">
                <h3 className="font-headline text-lg mb-2">Generated Outline:</h3>
                <Textarea
                  readOnly
                  value={result}
                  className="w-full h-64 text-sm"
                />
              </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
