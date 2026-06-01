#!/usr/bin/env node
import { readStdin, injectContext } from '../../shared/hooks-lib.js';
import { scanPrompt } from '../lib/prompt-scan.js';
import { DEFAULT_WIKI_ROOT } from '../lib/constants.js';

async function main(): Promise<void> {
  const root = process.argv[2] || DEFAULT_WIKI_ROOT;
  const payload = await readStdin();
  const message = (payload.user_message || payload.prompt || '') as string;
  const out = scanPrompt(message, root);
  if (out) injectContext(out);
}

main().catch(() => process.exit(0));
