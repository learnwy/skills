import * as os from 'node:os';
import * as path from 'node:path';

export const LEARNWY_ROOT = path.join(os.homedir(), '.learnwy');

export function learnwyPath(...segments: string[]): string {
  return path.join(LEARNWY_ROOT, ...segments);
}

export function skillRoot(skill: string): string {
  return learnwyPath(skill);
}

export function varRoot(name: string): string {
  return learnwyPath('.var', name);
}

export const PATHS = {
  llmWiki: skillRoot('llm-wiki'),
  promptOptimizer: varRoot('prompt-optimizer'),
  knowledgeConsolidation: varRoot('knowledge-consolidation'),
  learnwyStatus: varRoot('learnwy-status'),
} as const;

export function envOr(envVar: string, fallback: string): string {
  const v = process.env[envVar];
  return v && v.length > 0 ? v : fallback;
}

export function expandHome(p: string): string {
  if (p === '~') return os.homedir();
  if (p.startsWith('~/') || p.startsWith('~\\')) return path.join(os.homedir(), p.slice(2));
  return p;
}
