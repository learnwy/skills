#!/usr/bin/env node
import { readStdin, injectContext } from '../../shared/hooks-lib.js';
import { scanSession } from '../lib/session-scan.js';
import { DEFAULT_WIKI_ROOT } from '../lib/constants.js';

async function main(): Promise<void> {
  const root = process.argv[2] || DEFAULT_WIKI_ROOT;
  await readStdin();
  const out = scanSession(root);
  if (out) injectContext(out);
}

main().catch(() => process.exit(0));
