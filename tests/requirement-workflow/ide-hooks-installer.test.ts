import { describe, it, expect, beforeEach, afterEach } from '@rstest/core';
import { mkdtempSync, rmSync, readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { generateHooksJson, installIdeHooks } from '../../src/requirement-workflow/lib/ide-hooks-installer.js';

describe('generateHooksJson', () => {
  it('emits SessionStart and Stop events only', () => {
    const j = generateHooksJson('/tmp/x');
    expect(Object.keys(j.hooks).sort()).toEqual(['SessionStart', 'Stop']);
  });

  it('Stop hook has loop_limit set', () => {
    const j = generateHooksJson('/tmp/x');
    const stop = j.hooks.Stop[0] as { loop_limit?: number };
    expect(stop.loop_limit).toBe(3);
  });

  it('SessionStart references the active workflow + brief path', () => {
    const j = generateHooksJson('/tmp/x');
    const ss = j.hooks.SessionStart[0] as { hooks: { command: string }[] };
    const cmd = ss.hooks[0].command;
    expect(cmd).toContain('active_workflow');
    expect(cmd).toContain('briefs/');
  });
});

describe('installIdeHooks', () => {
  let tmp: string;
  beforeEach(() => { tmp = mkdtempSync(join(tmpdir(), 'rw-ide-')); });
  afterEach(() => { rmSync(tmp, { recursive: true, force: true }); });

  it('writes .trae/hooks.json with version + 2 events', () => {
    installIdeHooks(tmp, 'trae');
    const f = join(tmp, '.trae', 'hooks.json');
    expect(existsSync(f)).toBe(true);
    const j = JSON.parse(readFileSync(f, 'utf8'));
    expect(j.version).toBe(1);
    expect(Object.keys(j.hooks).sort()).toEqual(['SessionStart', 'Stop']);
  });

  it('writes .claude/settings.json without overwriting existing keys', () => {
    mkdirSync(join(tmp, '.claude'));
    writeFileSync(join(tmp, '.claude', 'settings.json'), JSON.stringify({ theme: 'dark' }));
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
