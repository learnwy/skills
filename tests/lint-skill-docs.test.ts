import { describe, it, expect, beforeEach, afterEach } from '@rstest/core';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const LINTER = resolve('scripts/lint-skill-docs.mjs');

let repo = '';

function makeSkill(skillName: string, mdBody: string, cliBody: string) {
  mkdirSync(join(repo, 'skills', skillName), { recursive: true });
  mkdirSync(join(repo, 'src', skillName), { recursive: true });
  writeFileSync(join(repo, 'skills', skillName, 'SKILL.md'), mdBody);
  writeFileSync(join(repo, 'src', skillName, 'cli.ts'), cliBody);
}

beforeEach(() => {
  repo = mkdtempSync(join(tmpdir(), 'lint-test-'));
  mkdirSync(join(repo, 'skills'));
  mkdirSync(join(repo, 'src'));
});

afterEach(() => {
  rmSync(repo, { recursive: true, force: true });
});

function runLinter() {
  return spawnSync('node', [LINTER, '--repo-root', repo], { encoding: 'utf8' });
}

describe('lint-skill-docs', () => {
  it('passes when SKILL.md mentions only declared subcommands', () => {
    makeSkill(
      'good',
      '# Good\nRun `cli.cjs hello` and `cli.cjs world`.',
      `dispatch({ name: 'good', commands: { hello, world } });`,
    );
    const r = runLinter();
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/OK/);
  });

  it('fails when SKILL.md mentions an undeclared subcommand', () => {
    makeSkill(
      'bad',
      '# Bad\nRun `cli.cjs frobnicate` for magic.',
      `dispatch({ name: 'bad', commands: { hello } });`,
    );
    const r = runLinter();
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/frobnicate/);
    expect(r.stderr).toMatch(/declared: hello/);
  });

  it('skips skills with no cli.ts', () => {
    mkdirSync(join(repo, 'skills', 'docs-only'), { recursive: true });
    writeFileSync(join(repo, 'skills', 'docs-only', 'SKILL.md'), '# Docs\nRun `cli.cjs anything`.');
    const r = runLinter();
    expect(r.status).toBe(0);
  });

  it('treats install/uninstall as known shared even if not in commands map literal', () => {
    makeSkill(
      'shared',
      '# Shared\nRun `cli.cjs install` and `cli.cjs uninstall`.',
      `import { installCommand, uninstallCommand } from '../shared/install-entry.js';
       dispatch({ name: 'shared', commands: { install: installCommand, uninstall: uninstallCommand } });`,
    );
    const r = runLinter();
    expect(r.status).toBe(0);
  });

  it('handles quoted command keys like \'link-wiki\'', () => {
    makeSkill(
      'quoted',
      '# Q\nRun `cli.cjs link-wiki` to fuse data.',
      `dispatch({ name: 'quoted', commands: { 'link-wiki': linkWiki } });`,
    );
    const r = runLinter();
    expect(r.status).toBe(0);
  });
});
