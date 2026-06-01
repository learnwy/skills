import { join } from 'node:path';
import { envOr, learnwyPath } from '../../shared/learnwy-paths.js';

export const WIKI_ROOT = envOr('LLM_WIKI_ROOT', learnwyPath('llm-wiki'));
export const WIKI_DIR = join(WIKI_ROOT, 'wiki');
export const RAW_DIR = join(WIKI_ROOT, 'raw');

export interface PageType {
  type: string;
  label: string;
  group: 'entity' | 'source';
}

// Entity-first wiki taxonomy (matches the personal knowledge-base layout).
// Entity-type folders hold one page per real-world thing; source-type folders
// hold one compiled page per ingested source (article / podcast / vlog / Lark thread).
export const PAGE_TYPES: PageType[] = [
  { type: 'people', label: 'People', group: 'entity' },
  { type: 'organizations', label: 'Organizations', group: 'entity' },
  { type: 'places', label: 'Places', group: 'entity' },
  { type: 'products', label: 'Products', group: 'entity' },
  { type: 'events', label: 'Events', group: 'entity' },
  { type: 'concepts', label: 'Concepts', group: 'entity' },
  { type: 'other-entities', label: 'Other Entities', group: 'entity' },
  { type: 'articles', label: 'Articles', group: 'source' },
  { type: 'podcasts', label: 'Podcasts', group: 'source' },
  { type: 'vlogs', label: 'Vlogs', group: 'source' },
  { type: 'diaries', label: 'Diaries', group: 'source' },
  { type: 'threads', label: 'Threads', group: 'source' },
];

export const PAGE_DIRS: string[] = PAGE_TYPES.map((p) => p.type);

// Lifecycle dirs created at init but excluded from indexing / orphan linting.
// `inbox` holds pulled-but-uncompiled drafts; `archived` holds retired pages.
export const LIFECYCLE_DIRS: string[] = ['inbox', 'archived'];

// Dirs where a page having no incoming wikilink is normal (entities are
// referenced from elsewhere but need not be; diaries / threads are chronological).
export const ORPHAN_EXEMPT_DIRS: Set<string> = new Set([
  'people', 'organizations', 'places', 'products', 'events', 'other-entities',
  'diaries', 'threads',
]);

// Raw (immutable) source material, one subdir per source type. `lark` holds
// Lark group/doc pulls; `docs` holds ingested document exports.
export const RAW_SUBDIRS: string[] = [
  'books', 'articles', 'papers', 'notes', 'podcasts', 'vlogs',
  'transcripts', 'snippets', 'specs', 'lark', 'docs',
];
