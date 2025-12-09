import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { BlogOutlineForm } from './blog-outline-form';
import { FirstDraftForm } from './first-draft-form';
import { RefineContentForm } from './refine-content-form';

export default function AiToolsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center px-4">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          Content Generation Tools
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          Leverage AI to kickstart your creative process, from outlining ideas to refining your final draft.
        </p>
      </div>
      <Tabs defaultValue="outline" className="w-full max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="draft">First Draft</TabsTrigger>
          <TabsTrigger value="refine">Refine</TabsTrigger>
        </TabsList>
        <TabsContent value="outline" className="mt-6">
          <BlogOutlineForm />
        </TabsContent>
        <TabsContent value="draft" className="mt-6">
          <FirstDraftForm />
        </TabsContent>
        <TabsContent value="refine" className="mt-6">
          <RefineContentForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
