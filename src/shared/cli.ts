export interface Command {
  description: string;
  run: (args: string[]) => void | Promise<void>;
}

export interface DispatchOptions {
  name: string;
  commands: Record<string, Command>;
}

function showHelp(opts: DispatchOptions): void {
  const names = Object.keys(opts.commands);
  const width = Math.max(...names.map((n) => n.length), 12);
  console.log(`Usage: node cli.cjs <subcommand> [args...]\n`);
  console.log(`Subcommands:`);
  for (const n of names) {
    console.log(`  ${n.padEnd(width + 2)}${opts.commands[n].description}`);
  }
  console.log(`\nUse "node cli.cjs <subcommand> --help" for subcommand-specific options.`);
}

export function dispatch(opts: DispatchOptions): void {
  const args = process.argv.slice(2);
  const sub = args[0];

  if (!sub || sub === '-h' || sub === '--help') {
    showHelp(opts);
    process.exit(sub ? 0 : 1);
  }

  const cmd = opts.commands[sub];
  if (!cmd) {
    console.error(`Unknown subcommand: ${sub}`);
    showHelp(opts);
    process.exit(1);
  }

  Promise.resolve(cmd.run(args.slice(1))).catch((err: Error) => {
    console.error(err.stack || err.message);
    process.exit(1);
  });
}

export interface ParsedArgs {
  positional: string[];
  flags: Record<string, string | boolean>;
}

export function parseArgs(args: string[], aliases: Record<string, string> = {}): ParsedArgs {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next !== undefined && !next.startsWith('-')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else if (arg.startsWith('-') && arg.length > 1) {
      const short = arg.slice(1);
      const key = aliases[short] || short;
      const next = args[i + 1];
      if (next !== undefined && !next.startsWith('-')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  return { positional, flags };
}
