import type { Command } from '../../shared/cli.js';
import { AI_TYPE_MAP, VALID_TYPES, buildPath } from '../lib/path-builder.js';

function showHelp(): void {
  console.log(`Usage: cli.cjs path -r <project_root> -a <ai_type> -t <type> -n <filename>

Generate a unique date-sequenced knowledge document path.

Arguments:
  -r, --root      Project root directory (required)
  -a, --ai-type   AI/LLM type: ${Object.keys(AI_TYPE_MAP).join(', ')}
  -t, --type      Knowledge type: ${VALID_TYPES.join(', ')}
                  (For architecture / pattern / api / reference, use llm-wiki instead.)
  -n, --name      Filename (without extension, kebab-case)
  -h, --help      Show this help message

Output: prints the resolved path to stdout (the directory is created if missing).
`);
}

function run(rawArgs: string[]): void {
  const args = { root: '', aiType: '', type: '', name: '' };
  for (let i = 0; i < rawArgs.length; i++) {
    switch (rawArgs[i]) {
      case '-r': case '--root': args.root = rawArgs[++i] || ''; break;
      case '-a': case '--ai-type': args.aiType = rawArgs[++i] || ''; break;
      case '-t': case '--type': args.type = rawArgs[++i] || ''; break;
      case '-n': case '--name': args.name = rawArgs[++i] || ''; break;
      case '-h': case '--help': showHelp(); process.exit(0);
      default:
        process.stderr.write(`Error: Unknown option: ${rawArgs[i]}\n`);
        showHelp();
        process.exit(1);
    }
  }
  if (!args.root || !args.aiType || !args.type || !args.name) {
    process.stderr.write('Error: --root, --ai-type, --type, --name are all required\n');
    showHelp();
    process.exit(1);
  }
  try {
    const resolved = buildPath(args);
    process.stdout.write(resolved.outputPath + '\n');
  } catch (err) {
    process.stderr.write(`Error: ${(err as Error).message}\n`);
    process.exit(1);
  }
}

export const command: Command = {
  description: 'Generate a unique date-sequenced knowledge document path',
  run,
};
