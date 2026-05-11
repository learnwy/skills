import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

export const IDE_MARKER_DIRS = ['.trae', '.claude', '.cursor', '.windsurf'] as const;
export type IdeMarker = (typeof IDE_MARKER_DIRS)[number];

export const AI_TYPE_MAP: Record<string, IdeMarker> = {
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

export function resolveMarker(aiType: string): IdeMarker | null {
  return AI_TYPE_MAP[aiType] ?? null;
}

export function detectIdeMarkers(projectRoot: string): IdeMarker[] {
  const found: IdeMarker[] = [];
  for (const m of IDE_MARKER_DIRS) {
    if (fs.existsSync(path.join(projectRoot, m))) found.push(m);
  }
  return found;
}

export function homeIdeDirs(): string[] {
  const home = os.homedir();
  return ['.trae', '.trae-cn', '.claude', '.cursor'].map((d) => path.join(home, d));
}

export function isInsideHomeIdeDir(absPath: string): string | null {
  for (const d of homeIdeDirs()) {
    if (absPath === d || absPath.startsWith(d + path.sep)) return d;
  }
  return null;
}
