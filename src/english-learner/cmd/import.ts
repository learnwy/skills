import { type Command } from '../../shared/cli.js';
import { runImport, type ImportOptions } from '../lib/import-engine.js';
import { type SourceType } from '../lib/lexicon-parsers.js';

export const command: Command = {
  description: 'Import vocabulary from LEXICON.md files in a directory',
  run(args: string[]) {
    const dir = args.find(a => !a.startsWith('-'));
    if (!dir) {
      console.error('Usage: import <dir> [options]');
      process.exit(1);
    }

    const options: ImportOptions = {
      type: (getFlag(args, '--type') as SourceType | 'auto') || 'auto',
      dryRun: args.includes('--dry-run'),
      force: args.includes('--force'),
      since: getFlag(args, '--since'),
      verbose: args.includes('--verbose'),
    };

    try {
      const result = runImport(dir, options);
      if (options.dryRun) {
        console.log('🔍 Dry run results:');
      } else {
        console.log('✅ Import complete:');
      }
      console.log(JSON.stringify(result, null, 2));
    } catch (err: unknown) {
      console.error(`❌ ${(err as Error).message}`);
      process.exit(1);
    }
  },
};

function getFlag(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined;
}
