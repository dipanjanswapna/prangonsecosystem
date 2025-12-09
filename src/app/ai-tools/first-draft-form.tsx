'use client';

import { generateFirstDraft } from '@/ai/flows/generate-first-draft';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  keywords: z.string().min(3, 'Please provide some keywords.'),
  tone: z.string().min(3, 'Please specify a tone.'),
  contentType: z.enum(['blog post', 'social media post']),
});

export function FirstDraftForm() {
  const { toast } = useToast();
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keywords: '',
      tone: 'Informative',
      contentType: 'blog post',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const output = await generateFirstDraft(values);
      setResult(output.firstDraft);
    } catch (error) {
      console.error('Error generating first draft:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred.',
        description: 'Failed to generate first draft. Please try again.',
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
            <CardTitle className="font-headline">Generate First Draft</CardTitle>
            <CardDescription>
              Create a first draft for a blog or social media post.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="contentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a content type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="blog post">Blog Post</SelectItem>
                      <SelectItem value="social media post">
                        Social Media Post
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                      placeholder="e.g., productivity, remote work"
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
                    <Input
                      placeholder="e.g., Motivational, Casual"
                      {...field}
                    />
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
              Generate Draft
            </Button>
            {result && (
              <div className="mt-4 p-4 border rounded-md bg-muted/50">
                <h3 className="font-headline text-lg mb-2">Generated Draft:</h3>
                <Textarea
                  readOnly
                  value={result}
                  className="w-full h-80 text-sm"
                />
              </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
