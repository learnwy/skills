#!/usr/bin/env node
import { readStdin, injectContext } from '../../shared/hooks-lib.js';
import { scanSession as wikiScan } from '../../llm-wiki/lib/session-scan.js';
import { scanSession as englishScan } from '../../english-learner/lib/session-scan.js';
import { scanSession as statusScan } from '../../learnwy-status/lib/session-scan.js';

type Scanner = () => string | null;

const SCANNERS: { name: string; scan: Scanner }[] = [
  { name: 'llm-wiki', scan: wikiScan },
  { name: 'english-learner', scan: englishScan },
  { name: 'learnwy-status', scan: statusScan },
];

async function main(): Promise<void> {
  await readStdin();

  const blocks: string[] = [];
  for (const { scan } of SCANNERS) {
    try {
      const out = scan();
      if (out) blocks.push(out);
    } catch {
      /* one bad scanner must not poison the others */
    }
  }
  if (blocks.length === 0) return;
  injectContext(blocks.join('\n\n'));
}

main().catch(() => process.exit(0));
