import * as fs from 'node:fs';
import * as path from 'node:path';

export const VALID_TYPES = ['debug', 'config', 'workflow', 'lesson'] as const;
export type KnowledgeType = (typeof VALID_TYPES)[number];

export const AI_TYPE_MAP: Record<string, string> = {
  trae: '.trae',
  'trae-cn': '.trae',
  TraeAI: '.trae',
  TraeCN: '.trae',
  'claude-code': '.claude',
  claude: '.claude',
  ClaudeCode: '.claude',
  cursor: '.cursor',
  Cursor: '.cursor',
  windsurf: '.windsurf',
  Windsurf: '.windsurf',
};

export interface PathInput {
  root: string;
  aiType: string;
  type: string;
  name: string;
}

export interface ResolvedPath {
  knowledgeDir: string;
  outputPath: string;
  date: string;
  seq: string;
  safeName: string;
}

function getToday(): string {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
}

export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-/, '')
    .replace(/-$/, '');
}

function countExisting(dir: string, datePrefix: string): number {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((entry) => {
    if (!entry.startsWith(`${datePrefix}_`)) return false;
    return fs.statSync(path.join(dir, entry)).isFile();
  }).length;
}

export function buildPath(input: PathInput): ResolvedPath {
  if (!input.root) throw new Error('root is required');
  if (!fs.existsSync(input.root) || !fs.statSync(input.root).isDirectory()) {
    throw new Error(`Project root does not exist: ${input.root}`);
  }
  const aiPath = AI_TYPE_MAP[input.aiType];
  if (!aiPath) {
    throw new Error(`Unknown AI type: ${input.aiType}. Supported: ${Object.keys(AI_TYPE_MAP).join(', ')}`);
  }
  if (!(VALID_TYPES as readonly string[]).includes(input.type)) {
    throw new Error(`Unknown knowledge type: ${input.type}. Supported: ${VALID_TYPES.join(', ')}. ` +
      `For architecture / pattern / api / reference, use the llm-wiki skill instead.`);
  }
  if (!input.name) throw new Error('name is required');

  const knowledgeDir = path.join(input.root, aiPath, 'knowledges');
  fs.mkdirSync(knowledgeDir, { recursive: true });

  const date = getToday();
  const seq = String(countExisting(knowledgeDir, date) + 1).padStart(3, '0');
  const safeName = sanitizeFilename(input.name);
  const outputPath = path.join(knowledgeDir, `${date}_${seq}_${input.type}_${safeName}.md`);

  return { knowledgeDir, outputPath, date, seq, safeName };
}
