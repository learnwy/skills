import * as os from 'node:os';
import * as path from 'node:path';

export const LEARNWY_ROOT = path.join(os.homedir(), '.learnwy');

export function learnwyPath(...segments: string[]): string {
  return path.join(LEARNWY_ROOT, ...segments);
}

export function skillRoot(skill: string): string {
  return learnwyPath(skill);
}

export const PATHS = {
  englishLearner: skillRoot('english-learner'),
  llmWiki: skillRoot('llm-wiki'),
  promptOptimizer: skillRoot('prompt-optimizer'),
  knowledgeConsolidation: skillRoot('knowledge-consolidation'),
  learnwyStatus: skillRoot('learnwy-status'),
} as const;

export function envOr(envVar: string, fallback: string): string {
  const v = process.env[envVar];
  return v && v.length > 0 ? v : fallback;
}
