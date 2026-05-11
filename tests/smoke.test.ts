import { describe, it, expect } from '@rstest/core';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { tmpdir } from 'node:os';

const SKILLS = 'skills';

function listSkillDirs(): string[] {
  return readdirSync(SKILLS).filter((n) => statSync(join(SKILLS, n)).isDirectory());
}

describe('SKILL.md script references', () => {
  for (const name of listSkillDirs()) {
    const md = join(SKILLS, name, 'SKILL.md');
    if (!existsSync(md)) continue;
    it(`${name}: every scripts/ reference resolves`, () => {
      const text = readFileSync(md, 'utf8');
      const refs = new Set<string>();
      for (const m of text.matchAll(/scripts\/[\w./-]+\.(?:cjs|mjs|js)/g)) refs.add(m[0]);
      for (const ref of refs) {
        expect(existsSync(join(SKILLS, name, ref)), `missing: ${ref}`).toBe(true);
      }
    });
  }
});

describe('hooks.json command paths', () => {
  for (const name of listSkillDirs()) {
    const hj = join(SKILLS, name, 'hooks.json');
    if (!existsSync(hj)) continue;
    it(`${name}: every hook command points to a bundled .cjs`, () => {
      const cfg = JSON.parse(readFileSync(hj, 'utf8'));
      for (const groups of Object.values(cfg.hooks || {}) as Array<Array<{ hooks: Array<{ command: string }> }>>) {
        for (const g of groups) {
          for (const hk of g.hooks || []) {
            const m = hk.command.match(/node ~\/\.agents\/(skills\/.+\.cjs)/);
            expect(m, `unparseable: ${hk.command}`).not.toBeNull();
            expect(existsSync(m![1]), `missing: ${m![1]}`).toBe(true);
          }
        }
      }
    });
  }
});

describe('cli.cjs --help loads cleanly', () => {
  for (const name of listSkillDirs()) {
    const cli = join(SKILLS, name, 'scripts', 'cli.cjs');
    if (!existsSync(cli)) continue;
    it(`${name}: --help exits 0 with subcommand list`, () => {
      const r = spawnSync('node', [cli, '--help'], { encoding: 'utf8' });
      expect(r.status).toBe(0);
      expect(r.stdout).toMatch(/Subcommands:/);
    });
  }
});

describe('hooks accept stdin payloads', () => {
  const cases: Array<[string, string, Record<string, unknown>]> = [
    ['english-learner', 'user-prompt-scan', { user_message: 'I think this thing maybe could be improved' }],
    ['english-learner', 'stop-response-scan', { transcript: 'a'.repeat(200) + ' ephemeral magnificent quintessential' }],
    ['llm-wiki', 'auto-query', { user_message: 'tell me about react performance optimization' }],
    ['llm-wiki', 'session-context', {}],
    ['prompt-optimizer', 'user-prompt-scan', { user_message: 'optimize my prompt: write good code' }],
  ];
  for (const [skill, hook, payload] of cases) {
    it(`${skill}/${hook} exits 0`, () => {
      const r = spawnSync('node', [join(SKILLS, skill, 'scripts', 'hooks', `${hook}.cjs`)], {
        input: JSON.stringify(payload), encoding: 'utf8',
      });
      expect(r.status).toBe(0);
    });
  }
});

describe('generators write to disk', () => {
  it('knowledge-consolidation path → emits a file path', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'smoke-'));
    const r = spawnSync('node', [
      join(SKILLS, 'knowledge-consolidation', 'scripts', 'cli.cjs'),
      'path', '-r', tmp, '-a', 'trae', '-t', 'debug', '-n', 'test',
    ], { encoding: 'utf8' });
    expect(r.status).toBe(0);
    expect(r.stdout.trim()).toMatch(/\.trae\/knowledges\/\d{8}_\d{3}_debug_test\.md$/);
  });

  it('project-skill-writer init --name → writes SKILL.md', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'smoke-'));
    const r = spawnSync('node', [
      join(SKILLS, 'project-skill-writer', 'scripts', 'cli.cjs'),
      'init', '--skill-dir', join(SKILLS, 'project-skill-writer'),
      '--name', 'foo-bar', '--output-root', join(tmp, 'skills'),
    ], { encoding: 'utf8' });
    expect(r.status).toBe(0);
    expect(existsSync(join(tmp, 'skills', 'foo-bar', 'SKILL.md'))).toBe(true);
  });

  it('project-rules-writer init → writes rule .md', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'smoke-'));
    const r = spawnSync('node', [
      join(SKILLS, 'project-rules-writer', 'scripts', 'cli.cjs'),
      'init', '--skill-dir', join(SKILLS, 'project-rules-writer'),
      '--name', 'no-foo', '--mode', 'always', '--output-dir', join(tmp, 'rules'),
    ], { encoding: 'utf8' });
    expect(r.status).toBe(0);
    expect(existsSync(join(tmp, 'rules', 'no-foo.md'))).toBe(true);
  });
});

describe('requirement-workflow lifecycle', () => {
  it('init → status → advance --auto round-trip', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'smoke-'));
    mkdirSync(tmp, { recursive: true });
    const cli = join(SKILLS, 'requirement-workflow', 'scripts', 'cli.cjs');

    const init = spawnSync('node', [cli, 'init', '-r', tmp, '-n', 'add-login', '-t', 'feature', '-s', 'small'], { encoding: 'utf8' });
    expect(init.status).toBe(0);

    const status = spawnSync('node', [cli, 'status', '-r', tmp], { encoding: 'utf8' });
    expect(status.status).toBe(0);
    expect(status.stdout).toMatch(/INIT|IMPLEMENTING/);

    const adv = spawnSync('node', [cli, 'advance', '-r', tmp, '--auto'], { encoding: 'utf8' });
    expect(adv.status).toBe(0);
  });
});

describe('every bundled .cjs has a matching .ts source', () => {
  it('no orphan bundles', () => {
    function* walk(dir: string): Generator<string> {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) yield* walk(p);
        else if (e.name.endsWith('.cjs') || e.name.endsWith('.mjs')) yield p;
      }
    }
    const orphans: string[] = [];
    for (const cjs of walk('skills')) {
      const m = cjs.match(/^skills\/([^/]+)\/scripts\/(.+)\.cjs$/);
      if (!m) continue;
      const [, skill, rest] = m;
      const ts = join('src', skill, rest + '.ts');
      if (!existsSync(ts)) orphans.push(`${cjs} → no ${ts}`);
    }
    expect(orphans).toEqual([]);
  });
});
