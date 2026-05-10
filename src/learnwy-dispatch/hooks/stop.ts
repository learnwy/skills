#!/usr/bin/env node
import { readStdin, injectContext } from '../../shared/hooks-lib.js';
import { scanStop as englishStop } from '../../english-learner/lib/stop-scan.js';
import { scanStop as kcStop, type StopPayload } from '../../knowledge-consolidation/lib/stop-scan.js';

async function main(): Promise<void> {
  const payload = await readStdin();
  const transcript =
    (payload.assistant_message as string | undefined) ||
    (payload.last_response as string | undefined) ||
    (payload.transcript as string | undefined) ||
    '';
  if (!transcript) return;

  const blocks: string[] = [];
  try {
    const a = englishStop(transcript);
    if (a) blocks.push(a);
  } catch {
    /* swallow */
  }
  try {
    const b = kcStop(transcript, payload as StopPayload);
    if (b) blocks.push(b);
  } catch {
    /* swallow */
  }
  if (blocks.length === 0) return;
  injectContext(blocks.join('\n\n'));
}

main().catch(() => process.exit(0));
