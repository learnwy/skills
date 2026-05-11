import { describe, it, expect, beforeEach, afterEach } from '@rstest/core';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  migrateLegacyTraeLayout,
  workflowBase,
  activePointerFile,
} from '../../src/requirement-workflow/lib/state.js';

describe('migrateLegacyTraeLayout', () => {
  let tmp: string;

  beforeEach(() => { tmp = mkdtempSync(join(tmpdir(), 'rw-mig-')); });
  afterEach(() => { rmSync(tmp, { recursive: true, force: true }); });

  it('moves .trae/workflow → .agents/workflow when only legacy dir exists', () => {
    const legacyDir = join(tmp, '.trae', 'workflow', '20260101_001_foo');
    mkdirSync(legacyDir, { recursive: true });
    writeFileSync(join(legacyDir, 'state.json'), '{"id":"20260101_001_foo"}');

    const result = migrateLegacyTraeLayout(tmp);

    expect(result.migrated).toBe(true);
    expect(existsSync(join(tmp, '.trae', 'workflow'))).toBe(false);
    expect(existsSync(join(workflowBase(tmp), '20260101_001_foo', 'state.json'))).toBe(true);
  });

  it('rewrites legacy active_workflow pointer to .agents/ path', () => {
    const legacyDir = join(tmp, '.trae', 'workflow', '20260101_001_bar');
    mkdirSync(legacyDir, { recursive: true });
    writeFileSync(join(legacyDir, 'state.json'), '{}');
    writeFileSync(join(tmp, '.trae', 'active_workflow'), legacyDir);

    migrateLegacyTraeLayout(tmp);

    expect(existsSync(join(tmp, '.trae', 'active_workflow'))).toBe(false);
    const pointer = readFileSync(activePointerFile(tmp), 'utf8').trim();
    expect(pointer).toBe(join(workflowBase(tmp), '20260101_001_bar'));
    expect(pointer.includes('.trae/workflow')).toBe(false);
  });

  it('is a no-op when nothing legacy exists', () => {
    const result = migrateLegacyTraeLayout(tmp);
    expect(result.migrated).toBe(false);
    expect(existsSync(join(tmp, '.agents'))).toBe(false);
  });

  it('does not clobber an existing .agents/workflow dir', () => {
    mkdirSync(join(tmp, '.trae', 'workflow', 'legacy-id'), { recursive: true });
    mkdirSync(join(tmp, '.agents', 'workflow', 'modern-id'), { recursive: true });

    const result = migrateLegacyTraeLayout(tmp);

    expect(result.migrated).toBe(false);
    expect(existsSync(join(tmp, '.trae', 'workflow', 'legacy-id'))).toBe(true);
    expect(existsSync(join(tmp, '.agents', 'workflow', 'modern-id'))).toBe(true);
  });
});
