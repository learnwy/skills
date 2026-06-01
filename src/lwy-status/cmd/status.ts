import type { Command } from '../../shared/cli.js';
import { parseArgs } from '../../shared/cli.js';
import { buildDigest, formatHuman, formatCompact } from '../lib/digest.js';

export const command: Command = {
  description: 'Print a one-screen digest of all ~/.learnwy/ subsystems',
  run: (args) => {
    const { flags } = parseArgs(args);
    const d = buildDigest();
    if (flags.json) {
      console.log(JSON.stringify(d, null, 2));
    } else if (flags.compact) {
      console.log(formatCompact(d));
    } else {
      console.log(formatHuman(d));
    }
  },
};
