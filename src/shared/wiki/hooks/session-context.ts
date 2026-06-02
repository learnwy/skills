import { readStdin, injectContext } from '../../hooks-lib.js';
import { scanSession } from '../lib/session-scan.js';
import { activeDefaultRoot } from '../lib/skin.js';

// Shared session-context hook impl. `defaultRoot` is the skin's root; a
// positional argv root (process.argv[2]) still overrides it.
export async function sessionContext(defaultRoot: string = activeDefaultRoot()): Promise<void> {
  const root = process.argv[2] || defaultRoot;
  await readStdin();
  const out = scanSession(root);
  if (out) injectContext(out);
}
