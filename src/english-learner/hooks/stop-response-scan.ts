#!/usr/bin/env node
import { readStdin, injectContext } from '../../shared/hooks-lib.js';
import { scanStop } from '../lib/stop-scan.js';

async function main(): Promise<void> {
  const payload = await readStdin();
  const transcript =
    (payload.assistant_message as string | undefined) ||
    (payload.last_response as string | undefined) ||
    (payload.transcript as string | undefined) ||
    '';
  const out = scanStop(transcript);
  if (out) injectContext(out);
}

main().catch(() => process.exit(0));
