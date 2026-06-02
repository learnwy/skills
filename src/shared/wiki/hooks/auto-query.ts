import { readStdin, injectContext } from '../../hooks-lib.js';
import { scanPrompt } from '../lib/prompt-scan.js';
import { activeDefaultRoot } from '../lib/skin.js';

// Shared auto-query hook impl. `defaultRoot` is the skin's root; a positional
// argv root (process.argv[2]) still overrides it.
export async function autoQuery(defaultRoot: string = activeDefaultRoot()): Promise<void> {
  const root = process.argv[2] || defaultRoot;
  const payload = await readStdin();
  const message = (payload.user_message || payload.prompt || '') as string;
  const out = scanPrompt(message, root);
  if (out) injectContext(out);
}
