'use client';

import { refineContent } from '@/ai/flows/refine-content';
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
import { Bot, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  content: z.string().min(10, 'Please provide some content to refine.'),
  tone: z.string().optional(),
});

export function RefineContentForm() {
  const { toast } = useToast();
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      tone: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const output = await refineContent(values);
      setResult(output.refinedContent);
    } catch (error) {
      console.error('Error refining content:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred.',
        description: 'Failed to refine content. Please try again.',
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
            <CardTitle className="font-headline">Refine Content</CardTitle>
            <CardDescription>
              Improve the clarity, grammar, and tone of your writing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content to Refine</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste your blog post or article here..."
                      className="h-48"
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
                  <FormLabel>
                    Desired Tone <span className="text-muted-foreground">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Professional, Casual" {...field} />
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
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Refine Content
            </Button>
            {result && (
              <div className="mt-4 p-4 border rounded-md bg-muted/50">
                <h3 className="font-headline text-lg mb-2">Refined Content:</h3>
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
