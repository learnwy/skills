#!/usr/bin/env node
import { readStdin, injectContext } from '../../shared/hooks-lib.js';
import { scanPrompt as englishScan } from '../../english-learner/lib/prompt-scan.js';
import { scanPrompt as wikiScan } from '../../llm-wiki/lib/prompt-scan.js';
import { scanPrompt as optimizerScan } from '../../prompt-optimizer/lib/prompt-scan.js';

type Scanner = (message: string) => string | null;

const SCANNERS: { name: string; scan: Scanner }[] = [
  { name: 'english-learner', scan: englishScan },
  { name: 'llm-wiki', scan: wikiScan },
  { name: 'prompt-optimizer', scan: optimizerScan },
];

async function main(): Promise<void> {
  const payload = await readStdin();
  const message = (payload.user_message || payload.prompt || '') as string;
  if (!message) return;

  const blocks: string[] = [];
  for (const { scan } of SCANNERS) {
    try {
      const out = scan(message);
      if (out) blocks.push(out);
    } catch {
      /* one bad scanner must not poison the others */
    }
  }
  if (blocks.length === 0) return;
  injectContext(blocks.join('\n\n'));
}

main().catch(() => process.exit(0));
