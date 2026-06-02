import { learnwyPath } from '../../learnwy-paths.js';

// The wiki engine is shared by two skins: the public world-wiki (`llm-wiki`)
// and the private alter-ego (`self`). They run the SAME commands/hooks; the only
// differences are the default root (used when no --root/--wiki-root is passed)
// and the branding label prefixed onto hook output.
export const DEFAULT_WIKI_ROOT = learnwyPath('llm-wiki');
export const DEFAULT_SELF_ROOT = '~/.learnwy/ai/private/self';

export interface Skin {
  name: string;
  label: string;
  defaultRoot: string;
}

const WIKI_SKIN: Skin = { name: 'llm-wiki', label: 'llm-wiki', defaultRoot: DEFAULT_WIKI_ROOT };

// Module-level skin context the cli/hook entry binds before dispatching. Each
// skin's cli.cjs / hook .cjs is a separate process, so this single mutable slot
// is process-local and never shared across skins.
let active: Skin = WIKI_SKIN;

export function setSkin(skin: Skin): void {
  active = skin;
}

export function activeSkin(): Skin {
  return active;
}

export function activeDefaultRoot(): string {
  return active.defaultRoot;
}

export function activeLabel(): string {
  return active.label;
}
