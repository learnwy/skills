import { describe, it, expect, beforeEach, afterEach } from '@rstest/core';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { generateHooksJson, installIdeHooks } from '../../src/requirement-workflow/lib/ide-hooks-installer.js';

describe('generateHooksJson', () => {
  it('emits exactly 3 lifecycle events', () => {
    const j = generateHooksJson('/tmp/x');
    expect(Object.keys(j.hooks).sort()).toEqual(['PostToolUse', 'SessionStart', 'Stop']);
  });

  it('Stop hook has loop_limit set', () => {
    const j = generateHooksJson('/tmp/x');
    const stop = j.hooks.Stop[0] as { loop_limit?: number };
    expect(stop.loop_limit).toBe(3);
  });

  it('PostToolUse only matches Edit|Write', () => {
    const j = generateHooksJson('/tmp/x');
    const pe = j.hooks.PostToolUse[0] as { matcher?: string };
    expect(pe.matcher).toBe('Edit|Write');
  });
});

describe('installIdeHooks', () => {
  let tmp: string;
  beforeEach(() => { tmp = mkdtempSync(join(tmpdir(), 'rw-ide-')); });
  afterEach(() => { rmSync(tmp, { recursive: true, force: true }); });

  it('writes .trae/hooks.json with version + 3 events', () => {
    installIdeHooks(tmp, 'trae');
    const f = join(tmp, '.trae', 'hooks.json');
    expect(existsSync(f)).toBe(true);
    const j = JSON.parse(readFileSync(f, 'utf8'));
    expect(j.version).toBe(1);
    expect(Object.keys(j.hooks).sort()).toEqual(['PostToolUse', 'SessionStart', 'Stop']);
  });

  it('writes .claude/settings.json without overwriting existing keys', () => {
    require('node:fs').mkdirSync(join(tmp, '.claude'));
    require('node:fs').writeFileSync(join(tmp, '.claude', 'settings.json'), JSON.stringify({ theme: 'dark' }));
    installIdeHooks(tmp, 'claude');
    const j = JSON.parse(readFileSync(join(tmp, '.claude', 'settings.json'), 'utf8'));
    expect(j.theme).toBe('dark');
    expect(j.hooks.SessionStart).toBeDefined();
  });

  it('target=both writes both files', () => {
    installIdeHooks(tmp, 'both');
    expect(existsSync(join(tmp, '.trae', 'hooks.json'))).toBe(true);
    expect(existsSync(join(tmp, '.claude', 'settings.json'))).toBe(true);
  });
});
