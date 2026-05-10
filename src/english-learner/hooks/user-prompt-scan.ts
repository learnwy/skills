#!/usr/bin/env node
import { readStdin, injectContext } from '../../shared/hooks-lib.js';
import { scanPrompt } from '../lib/prompt-scan.js';

async function main(): Promise<void> {
  const payload = await readStdin();
  const message = (payload.user_message || payload.prompt || '') as string;
  const out = scanPrompt(message);
  if (out) injectContext(out);
}

main().catch(() => process.exit(0));
