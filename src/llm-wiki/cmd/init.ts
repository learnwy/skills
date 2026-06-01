import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  WIKI_ROOT, WIKI_DIR, RAW_DIR, PAGE_DIRS, LIFECYCLE_DIRS, RAW_SUBDIRS,
} from '../lib/index.js';
import type { Command } from '../../shared/cli.js';

const SCHEMA = `# LLM Wiki — Schema

Entity-first personal knowledge base. The LLM compiles \`raw/\` source material
into linked pages under \`wiki/\`; \`raw/\` is immutable (read-only to the LLM).

## Layout

- \`raw/\` — immutable source material (one subdir per source type, incl. \`lark/\`)
- \`wiki/\` — compiled pages, one folder per entity / source type
  - Entity types: people, organizations, places, products, events, concepts, other-entities
  - Source types: articles, podcasts, vlogs, diaries, threads
  - Lifecycle: inbox (uncompiled drafts), archived (retired)
- \`wiki/index.md\` — auto-generated master index
- \`wiki/topics.txt\` — auto-generated keyword list for auto-query
- \`log.md\` — append-only audit log

## Conventions

- Each page starts with a \`# Title\` H1.
- Cross-link with \`[[folder/slug]]\` wikilinks (cap ~5 per page; overflow → "See also").
- Entity slugs are kebab-case (\`zhang-san\`, \`toko-standalone\`).
- Source pages carry \`**Source**:\`, \`**Ingested**:\`, optional \`**Last verified**:\`.
`;

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

async function ensureFile(path: string, content: string): Promise<void> {
  if (!existsSync(path)) await writeFile(path, content);
}

async function init(): Promise<void> {
  await ensureDir(WIKI_ROOT);
  await ensureDir(WIKI_DIR);
  await ensureDir(RAW_DIR);

  for (const sub of RAW_SUBDIRS) await ensureDir(join(RAW_DIR, sub));
  for (const dir of [...PAGE_DIRS, ...LIFECYCLE_DIRS]) await ensureDir(join(WIKI_DIR, dir));

  await ensureFile(join(WIKI_ROOT, 'CLAUDE.md'), SCHEMA);
  await ensureFile(join(WIKI_ROOT, 'log.md'), '# Wiki Log\n\n');
  await ensureFile(
    join(WIKI_DIR, 'index.md'),
    '# Knowledge Base Index\n\n> Run `cli.cjs generate-index` to populate.\n',
  );
  await ensureFile(join(WIKI_DIR, 'topics.txt'), '');

  // Touch CLAUDE.md so re-init reports cleanly even when present.
  await readFile(join(WIKI_ROOT, 'CLAUDE.md'), 'utf-8');

  console.log(`Initialized llm-wiki at ${WIKI_ROOT}`);
  console.log(`  raw/    ${RAW_SUBDIRS.length} source subdirs`);
  console.log(`  wiki/   ${PAGE_DIRS.length} page dirs + ${LIFECYCLE_DIRS.length} lifecycle dirs`);
}

export const command: Command = {
  description: 'Scaffold the wiki root (raw/ + wiki/ folders, schema, index, log)',
  run: () => init(),
};
