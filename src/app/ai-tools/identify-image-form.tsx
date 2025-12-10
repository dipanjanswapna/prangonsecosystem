'use client';

import { identifyImage } from '@/ai/flows/identify-image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Bot, ImageDown, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export function IdentifyImageForm() {
  const { toast } = useToast();
  const [result, setResult] = useState<{
    description: string;
    tags: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dataUri, setDataUri] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(URL.createObjectURL(file));
        setDataUri(result);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  async function onSubmit() {
    if (!dataUri) {
      toast({
        variant: 'destructive',
        title: 'No image selected.',
        description: 'Please upload an image to identify.',
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const output = await identifyImage({ imageDataUri: dataUri });
      setResult(output);
    } catch (error) {
      console.error('Error identifying image:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred.',
        description: 'Failed to identify image. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Identify Image</CardTitle>
        <CardDescription>
          Upload an image and let AI identify its content, providing a
          description and tags.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="w-full aspect-video border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={handleUploadClick}
        >
          {preview ? (
            <Image
              src={preview}
              alt="Image preview"
              width={400}
              height={225}
              className="object-contain max-h-full max-w-full"
            />
          ) : (
            <div className="text-center">
              <ImageDown className="mx-auto h-12 w-12" />
              <p>Click to upload an image</p>
            </div>
          )}
        </div>
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/gif"
        />
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4">
        <Button onClick={onSubmit} disabled={isLoading || !preview}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Bot className="mr-2 h-4 w-4" />
          )}
          Identify Image
        </Button>
        {result && (
          <div className="mt-4 p-4 border rounded-md bg-muted/50 space-y-4">
            <div>
              <h3 className="font-headline text-lg mb-1">
                AI Description:
              </h3>
              <p className="text-sm">{result.description}</p>
            </div>
            <div>
              <h3 className="font-headline text-lg mb-2">Suggested Tags:</h3>
              <div className="flex gap-2">
                {result.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
