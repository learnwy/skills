import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Command } from '../../shared/cli.js';
import { learnwyPath, expandHome } from '../../shared/learnwy-paths.js';
import { sanitizeFilename } from '../lib/path-builder.js';

function showHelp(): void {
  console.log(`Usage: cli.cjs promote -p <kc-doc.md> [--wiki-root DIR]

Promote a project-local knowledge doc into the global llm-wiki ingestion queue.

Arguments:
  -p, --path        Path to the KC doc to promote (required)
      --wiki-root   llm-wiki root (default: ~/.learnwy/llm-wiki)
  -h, --help        Show help

Behaviour:
  - Copies the file into <wiki-root>/raw/notes/<date>-<slug>.md.
  - Prepends a frontmatter pointer back to the original KC doc.
  - No-op (warns and exits 0) if the wiki root is missing — KC has no
    obligation to require llm-wiki.
`);
}

function isoDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function defaultWikiRoot(): string {
  return learnwyPath('llm-wiki');
}

function deriveSlug(filePath: string): string {
  const base = path.basename(filePath, '.md');
  const trimmed = base.replace(/^\d{8}_\d{3}_(?:debug|config|workflow|lesson)_/, '');
  return sanitizeFilename(trimmed) || sanitizeFilename(base) || 'note';
}

function run(rawArgs: string[]): void {
  let docPath = '';
  let wikiRoot = defaultWikiRoot();
  for (let i = 0; i < rawArgs.length; i++) {
    switch (rawArgs[i]) {
      case '-p': case '--path': docPath = rawArgs[++i] || ''; break;
      case '--wiki-root': wikiRoot = expandHome(rawArgs[++i] || ''); break;
      case '-h': case '--help': showHelp(); process.exit(0);
      default:
        process.stderr.write(`Error: Unknown option: ${rawArgs[i]}\n`);
        showHelp();
        process.exit(1);
    }
  }
  if (!docPath) {
    process.stderr.write('Error: --path is required\n');
    showHelp();
    process.exit(1);
  }
  docPath = path.resolve(docPath);
  if (!fs.existsSync(docPath)) {
    process.stderr.write(`Error: file not found: ${docPath}\n`);
    process.exit(1);
  }
  const notesDir = path.join(wikiRoot, 'raw', 'notes');
  if (!fs.existsSync(wikiRoot)) {
    process.stderr.write(`Skip: llm-wiki not initialised at ${wikiRoot}.\n`);
    process.stderr.write('To enable promote, init the wiki first or pass --wiki-root.\n');
    process.exit(0);
  }
  fs.mkdirSync(notesDir, { recursive: true });

  const slug = deriveSlug(docPath);
  const target = path.join(notesDir, `${isoDate()}-${slug}.md`);
  const original = fs.readFileSync(docPath, 'utf8');
  const frontmatter = `<!-- promoted from knowledge-consolidation\n` +
    `source: ${docPath}\n` +
    `promoted_at: ${new Date().toISOString()}\n` +
    `-->\n\n`;
  fs.writeFileSync(target, frontmatter + original);
  process.stdout.write(target + '\n');
}

export const command: Command = {
  description: 'Promote a KC doc into the global llm-wiki raw/notes/ queue',
  run,
};
