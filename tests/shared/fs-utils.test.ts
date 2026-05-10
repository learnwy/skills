import { describe, it, expect, beforeEach, afterEach } from '@rstest/core';
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { ensureDir, readJsonSafe, writeJson, nowIso } from '../../src/shared/fs-utils.js';

describe('nowIso', () => {
  it('returns a parseable ISO 8601 string', () => {
    const s = nowIso();
    expect(s).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(new Date(s).toISOString()).toBe(s);
  });
});

describe('ensureDir', () => {
  let tmp: string;
  beforeEach(() => { tmp = mkdtempSync(join(tmpdir(), 'fs-')); });
  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it('creates a single missing dir', () => {
    const target = join(tmp, 'a');
    ensureDir(target);
    expect(existsSync(target)).toBe(true);
  });

  it('creates nested dirs recursively', () => {
    const target = join(tmp, 'deep', 'nested', 'path');
    ensureDir(target);
    expect(existsSync(target)).toBe(true);
  });

  it('is a no-op when the dir already exists', () => {
    const target = join(tmp, 'exists');
    ensureDir(target);
    expect(() => ensureDir(target)).not.toThrow();
  });
});

describe('readJsonSafe', () => {
  let tmp: string;
  beforeEach(() => { tmp = mkdtempSync(join(tmpdir(), 'fs-')); });
  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it('returns fallback when file does not exist', () => {
    expect(readJsonSafe(join(tmp, 'nope.json'), { default: 1 })).toEqual({ default: 1 });
  });

  it('returns fallback when file contains invalid JSON', () => {
    const f = join(tmp, 'bad.json');
    writeFileSync(f, 'not json');
    expect(readJsonSafe(f, { fallback: true })).toEqual({ fallback: true });
  });

  it('returns parsed JSON when valid', () => {
    const f = join(tmp, 'good.json');
    writeFileSync(f, JSON.stringify({ a: 1, b: 'two' }));
    expect(readJsonSafe(f, {})).toEqual({ a: 1, b: 'two' });
  });
});

describe('writeJson', () => {
  let tmp: string;
  beforeEach(() => { tmp = mkdtempSync(join(tmpdir(), 'fs-')); });
  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it('writes pretty-printed JSON with trailing newline', () => {
    const f = join(tmp, 'out.json');
    writeJson(f, { x: 1 });
    expect(readFileSync(f, 'utf8')).toBe('{\n  "x": 1\n}\n');
  });

  it('creates missing parent dirs', () => {
    const f = join(tmp, 'a', 'b', 'c.json');
    writeJson(f, { ok: true });
    expect(existsSync(f)).toBe(true);
  });
});
