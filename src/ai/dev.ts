import { config } from 'dotenv';
config();

import '@/ai/flows/generate-blog-outline.ts';
import '@/ai/flows/refine-content.ts';
import '@/ai/flows/generate-first-draft.ts';