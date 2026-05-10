import { join } from 'node:path';
import { homedir } from 'node:os';

export const WIKI_ROOT = process.env.LLM_WIKI_ROOT || join(homedir(), '.learnwy', 'llm-wiki');
export const WIKI_DIR = join(WIKI_ROOT, 'wiki');
export const RAW_DIR = join(WIKI_ROOT, 'raw');

export interface PageType {
  type: string;
  label: string;
}

export const PAGE_TYPES: PageType[] = [
  { type: 'summaries', label: 'Summaries' },
  { type: 'concepts', label: 'Concepts' },
  { type: 'entities', label: 'Entities' },
  { type: 'comparisons', label: 'Comparisons' },
  { type: 'snippets', label: 'Snippets' },
  { type: 'troubleshooting', label: 'Troubleshooting' },
  { type: 'decisions', label: 'Decisions' },
  { type: 'cheatsheets', label: 'Cheatsheets' },
];

export const PAGE_DIRS: string[] = PAGE_TYPES.map((p) => p.type);

export const RAW_SUBDIRS: string[] = [
  'books', 'articles', 'papers', 'notes', 'podcasts',
  'transcripts', 'snippets', 'troubleshooting', 'specs', 'decisions',
];
