import { describe, it, expect, beforeEach, afterEach } from '@rstest/core';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  enableCodexHooksFeatureToml,
  installHooks,
  uninstallHooks,
  type HooksConfig,
} from '../../src/shared/hooks-lib.js';

const cfg: HooksConfig = {
  version: 1,
  hooks: {
    UserPromptSubmit: [
      { hooks: [{ type: 'command', command: 'node ~/.agents/skills/test-skill/scripts/hooks/scan.cjs', timeout: 5 }] },
    ],
  },
};

describe('installHooks (global scope)', () => {
  let tmp: string;
  let oldHome: string | undefined;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), 'hooks-lib-'));
    oldHome = process.env.HOME;
    process.env.HOME = tmp;
  });
  afterEach(() => {
    process.env.HOME = oldHome;
    rmSync(tmp, { recursive: true, force: true });
  });

  it('writes ~/.claude/settings.json with hooks key only (nested)', () => {
    installHooks(cfg, { target: 'claude', scope: 'global' });
    const f = join(tmp, '.claude', 'settings.json');
    expect(existsSync(f)).toBe(true);
    const j = JSON.parse(readFileSync(f, 'utf8'));
    expect(j.hooks.UserPromptSubmit).toHaveLength(1);
    expect(j.version).toBeUndefined();
  });

  it('writes ~/.trae/hooks.json with version field (standalone)', () => {
    installHooks(cfg, { target: 'trae', scope: 'global' });
    const j = JSON.parse(readFileSync(join(tmp, '.trae', 'hooks.json'), 'utf8'));
    expect(j.version).toBe(1);
    expect(j.hooks.UserPromptSubmit).toHaveLength(1);
  });

  it('is idempotent — second install does not duplicate the same group', () => {
    installHooks(cfg, { target: 'trae', scope: 'global' });
    installHooks(cfg, { target: 'trae', scope: 'global' });
    const j = JSON.parse(readFileSync(join(tmp, '.trae', 'hooks.json'), 'utf8'));
    expect(j.hooks.UserPromptSubmit).toHaveLength(1);
  });

  it('preserves unrelated keys in existing settings.json', () => {
    const claudeFile = join(tmp, '.claude', 'settings.json');
    require('node:fs').mkdirSync(join(tmp, '.claude'));
    require('node:fs').writeFileSync(claudeFile, JSON.stringify({ theme: 'dark', model: 'opus' }));
    installHooks(cfg, { target: 'claude', scope: 'global' });
    const j = JSON.parse(readFileSync(claudeFile, 'utf8'));
    expect(j.theme).toBe('dark');
    expect(j.model).toBe('opus');
    expect(j.hooks.UserPromptSubmit).toHaveLength(1);
  });

  it('writes Codex hooks and enables the canonical hooks feature', () => {
    installHooks(cfg, { target: 'codex', scope: 'global' });
    const hooks = JSON.parse(readFileSync(join(tmp, '.codex', 'hooks.json'), 'utf8'));
    const configToml = readFileSync(join(tmp, '.codex', 'config.toml'), 'utf8');
    expect(hooks.hooks.UserPromptSubmit).toHaveLength(1);
    expect(configToml).toContain('[features]');
    expect(configToml).toContain('hooks = true');
    expect(configToml).not.toContain('codex_hooks');
  });
});

describe('enableCodexHooksFeatureToml', () => {
  it('creates a features table when missing', () => {
    expect(enableCodexHooksFeatureToml('model = "gpt-5"\n')).toBe('model = "gpt-5"\n\n[features]\nhooks = true\n');
  });

  it('updates hooks and removes deprecated codex_hooks in the features table', () => {
    const out = enableCodexHooksFeatureToml('[features]\ncodex_hooks = true\nhooks = false\n[profiles.default]\nmodel = "gpt-5"\n');
    expect(out).toBe('[features]\nhooks = true\n[profiles.default]\nmodel = "gpt-5"\n');
  });
});

describe('uninstallHooks', () => {
  let tmp: string;
  let oldHome: string | undefined;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), 'hooks-lib-'));
    oldHome = process.env.HOME;
    process.env.HOME = tmp;
  });
  afterEach(() => {
    process.env.HOME = oldHome;
    rmSync(tmp, { recursive: true, force: true });
  });

  it('removes only entries whose command contains the skill id', () => {
    installHooks(cfg, { target: 'claude', scope: 'global' });
    installHooks(
      { hooks: { UserPromptSubmit: [{ hooks: [{ type: 'command', command: 'node ~/.agents/skills/other-skill/scripts/hooks/scan.cjs' }] }] } },
      { target: 'claude', scope: 'global' },
    );
    uninstallHooks('test-skill', { target: 'claude', scope: 'global' });
    const j = JSON.parse(readFileSync(join(tmp, '.claude', 'settings.json'), 'utf8'));
    const remaining = j.hooks.UserPromptSubmit;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].hooks[0].command).toContain('other-skill');
  });

  it('drops the event key entirely when no entries remain', () => {
    installHooks(cfg, { target: 'claude', scope: 'global' });
    uninstallHooks('test-skill', { target: 'claude', scope: 'global' });
    const j = JSON.parse(readFileSync(join(tmp, '.claude', 'settings.json'), 'utf8'));
    expect(j.hooks.UserPromptSubmit).toBeUndefined();
  });

  it('is a no-op when target file does not exist', () => {
    expect(() => uninstallHooks('test-skill', { target: 'claude', scope: 'global' })).not.toThrow();
  });
});
