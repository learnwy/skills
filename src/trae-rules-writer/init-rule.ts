#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';

interface Args {
  skillDir?: string;
  name?: string;
  mode: 'always' | 'file' | 'intelligent' | 'manual';
  description: string;
  globs: string;
  outputDir: string;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { mode: 'intelligent', description: '', globs: '', outputDir: '.trae/rules' };
  const required = new Set(['skillDir', 'name']);
  const modeChoices = ['always', 'file', 'intelligent', 'manual'] as const;
  const keyMap: Record<string, keyof Args> = {
    '--skill-dir': 'skillDir',
    '--name': 'name',
    '--mode': 'mode',
    '--description': 'description',
    '--globs': 'globs',
    '--output-dir': 'outputDir',
  };

  for (let i = 0; i < argv.length; i++) {
    const key = keyMap[argv[i]];
    if (key) {
      const val = argv[++i];
      if (val === undefined) {
        console.error(`Missing value for ${argv[i - 1]}`);
        process.exit(1);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (args as any)[key] = val;
    }
  }

  for (const r of required) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(args as any)[r]) {
      console.error(`Missing required argument: --${r.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
      process.exit(1);
    }
  }

  if (!(modeChoices as readonly string[]).includes(args.mode)) {
    console.error(`Invalid mode "${args.mode}". Choose from: ${modeChoices.join(', ')}`);
    process.exit(1);
  }

  return args;
}

function defaultValues(name: string, mode: string, description: string, globs: string): Record<string, string> {
  const alwaysApply = mode === 'always' ? 'true' : 'false';
  if (mode === 'file' && !globs) globs = '*.md';
  if (mode === 'intelligent' || mode === 'manual') globs = '';
  return {
    DESCRIPTION: description || `Rule for ${name}`,
    GLOBS: globs,
    ALWAYS_APPLY: alwaysApply,
    RULE_TITLE: name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    OVERVIEW: 'Define concise, actionable behavior constraints for AI.',
    GUIDELINES: '- Keep rules explicit\n- Use project-relative paths\n- Avoid conflicting instructions',
    LANG: 'markdown',
    GOOD_EXAMPLE: '# Good\nUse clear, direct guidance.',
    BAD_EXAMPLE: '# Bad\nUse vague or contradictory guidance.',
    EXCEPTIONS: '- Keep API fields and file paths unchanged when needed.',
  };
}

function render(template: string, mapping: Record<string, string>): string {
  let out = template;
  for (const [k, v] of Object.entries(mapping)) {
    out = out.split(`{{${k}}}`).join(v);
  }
  return out;
}

function cleanupFrontmatter(text: string): string {
  const lines = text.split('\n');
  if (lines.length >= 4 && lines[0].trim() === '---') {
    if (lines[2].trim() === 'globs:') {
      lines.splice(2, 1);
    }
  }
  return lines.join('\n').trimEnd() + '\n';
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));

  const skillDir = path.resolve(args.skillDir!);
  const templatePath = path.join(skillDir, 'assets', 'rule.md.template');
  const outDir = path.resolve(args.outputDir);
  const outFile = path.join(outDir, `${args.name}.md`);

  const tpl = fs.readFileSync(templatePath, 'utf-8');
  const mapping = defaultValues(args.name!, args.mode, args.description, args.globs);
  let content = render(tpl, mapping);
  content = cleanupFrontmatter(content);

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, content, 'utf-8');
  console.log(outFile);
}

main();
