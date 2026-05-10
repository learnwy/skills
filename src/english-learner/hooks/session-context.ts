#!/usr/bin/env node
import { readStdin, injectContext } from '../../shared/hooks-lib.js';
import { scanSession } from '../lib/session-scan.js';

async function main(): Promise<void> {
  await readStdin();
  const out = scanSession();
  if (out) injectContext(out);
}

main().catch(() => process.exit(0));
