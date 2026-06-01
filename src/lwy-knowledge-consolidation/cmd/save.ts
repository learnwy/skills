import * as fs from 'node:fs';
import type { Command } from '../../shared/cli.js';
import { AI_TYPE_MAP, VALID_TYPES, buildPath } from '../lib/path-builder.js';

function showHelp(): void {
  console.log(`Usage: cli.cjs save -r <root> -a <ai> -t <type> -n <name> --title T --summary S --details D --takeaways K [--context C] [--related R]

Atomically write a structured knowledge document. Removes the prior 3-step dance
(path → template fill → validate) — one call, validated.

Arguments:
  -r, --root        Project root (required)
  -a, --ai-type     AI/LLM type: ${Object.keys(AI_TYPE_MAP).join(', ')}
  -t, --type        Knowledge type: ${VALID_TYPES.join(', ')}
  -n, --name        Filename slug (kebab-case)
      --title       Document title (the H1)
      --summary     2-3 sentence self-contained summary
      --details     The technical body (Markdown)
      --takeaways   Newline-separated bullets (we add the "- " prefix)
      --background  One-line problem context (optional)
      --context     One-line metadata: project / component / version (optional)
      --related     Related links / files / issues (optional)
  -h, --help        Show help

Note: \\n in --summary / --background / --details / --takeaways / --related is
expanded to a real newline for shell ergonomics.
`);
}

interface SaveArgs {
  root: string;
  aiType: string;
  type: string;
  name: string;
  title: string;
  summary: string;
  background: string;
  details: string;
  takeaways: string;
  context: string;
  related: string;
}

function expandEscapes(s: string): string {
  return s.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
}

function parse(rawArgs: string[]): SaveArgs {
  const a: SaveArgs = {
    root: '', aiType: '', type: '', name: '',
    title: '', summary: '', background: '', details: '', takeaways: '',
    context: '', related: '',
  };
  for (let i = 0; i < rawArgs.length; i++) {
    switch (rawArgs[i]) {
      case '-r': case '--root': a.root = rawArgs[++i] || ''; break;
      case '-a': case '--ai-type': a.aiType = rawArgs[++i] || ''; break;
      case '-t': case '--type': a.type = rawArgs[++i] || ''; break;
      case '-n': case '--name': a.name = rawArgs[++i] || ''; break;
      case '--title': a.title = rawArgs[++i] || ''; break;
      case '--summary': a.summary = expandEscapes(rawArgs[++i] || ''); break;
      case '--background': a.background = expandEscapes(rawArgs[++i] || ''); break;
      case '--details': a.details = expandEscapes(rawArgs[++i] || ''); break;
      case '--takeaways': a.takeaways = expandEscapes(rawArgs[++i] || ''); break;
      case '--context': a.context = rawArgs[++i] || ''; break;
      case '--related': a.related = expandEscapes(rawArgs[++i] || ''); break;
      case '-h': case '--help': showHelp(); process.exit(0);
      default:
        process.stderr.write(`Error: Unknown option: ${rawArgs[i]}\n`);
        showHelp();
        process.exit(1);
    }
  }
  return a;
}

function formatTakeaways(raw: string): string {
  if (!raw) return '- ';
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => (l.startsWith('-') || l.startsWith('*') ? l : `- ${l}`))
    .join('\n');
}

function isoDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function render(a: SaveArgs): string {
  return `# ${a.title}

> **Type:** ${a.type}
> **Date:** ${isoDate()}
> **Context:** ${a.context || '(unspecified)'}

## Summary

${a.summary}

## Background

${a.background || '_(none provided)_'}

## Details

${a.details}

## Key Takeaways

${formatTakeaways(a.takeaways)}

## Related

${a.related || '_(none)_'}
`;
}

function run(rawArgs: string[]): void {
  const args = parse(rawArgs);
  const required: (keyof SaveArgs)[] = ['root', 'aiType', 'type', 'name', 'title', 'summary', 'details', 'takeaways'];
  const missing = required.filter((k) => !args[k]);
  if (missing.length) {
    process.stderr.write(`Error: missing required: ${missing.join(', ')}\n`);
    showHelp();
    process.exit(1);
  }
  try {
    const resolved = buildPath(args);
    fs.writeFileSync(resolved.outputPath, render(args));
    process.stdout.write(resolved.outputPath + '\n');
  } catch (err) {
    process.stderr.write(`Error: ${(err as Error).message}\n`);
    process.exit(1);
  }
}

export const command: Command = {
  description: 'Atomically write a structured knowledge document (path + template in one call)',
  run,
};
