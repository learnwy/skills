import { describe, it, expect, afterEach, beforeEach } from '@rstest/core';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

describe('report cmd parseFlags', () => {
  it('parses --output, --open, --json with sensible defaults', async () => {
    const mod = await import('../../src/english-learner/cmd/report.js');
    expect(typeof mod.command.run).toBe('function');
    expect(mod.command.description).toMatch(/HTML report/i);
  });
});

describe('report cmd end-to-end (real DB under tmp HOME)', () => {
  let tmp: string;
  let oldHome: string | undefined;
  let oldLog: typeof console.log;
  let logged: string[] = [];

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'el-report-cmd-'));
    oldHome = process.env.HOME;
    process.env.HOME = tmp;
    oldLog = console.log;
    logged = [];
    console.log = (s: string) => { logged.push(s); };
  });

  afterEach(() => {
    console.log = oldLog;
    if (oldHome !== undefined) process.env.HOME = oldHome;
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {}
  });

  it('writes the report file and prints status JSON', async () => {
    // Dynamic import AFTER HOME swap so DATA_ROOT-dependent modules see the tmp dir.
    // db.ts froze DATA_ROOT at first import in earlier tests, so we point --output
    // explicitly at the tmp dir instead of relying on the default path.
    const outFile = path.join(tmp, 'report.html');
    const { command } = await import('../../src/english-learner/cmd/report.js');
    command.run(['--output', outFile]);

    expect(fs.existsSync(outFile)).toBe(true);
    const html = fs.readFileSync(outFile, 'utf-8');
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toContain('English-Learner Report');

    expect(logged).toHaveLength(1);
    const status = JSON.parse(logged[0]);
    expect(status.status).toBe('ok');
    expect(status.output).toBe(outFile);
    expect(status.bytes).toBe(fs.statSync(outFile).size);
    expect(status.json).toBeNull();
    expect(status.opened).toBe(false);
    expect(status.sections).toMatchObject({
      words: expect.any(Number),
      phrases: expect.any(Number),
      due: expect.any(Number),
      corrections: expect.any(Number),
      activity_days: 30,
    });
  });

  it('--open reports opened=true and does not throw on spawn failure', async () => {
    const outFile = path.join(tmp, 'report.html');
    const { command } = await import('../../src/english-learner/cmd/report.js');
    // Force spawn to fail by pointing PATH at an empty dir — openInBrowser swallows.
    const oldPath = process.env.PATH;
    process.env.PATH = tmp;
    try {
      expect(() => command.run(['--output', outFile, '--open'])).not.toThrow();
    } finally {
      process.env.PATH = oldPath;
    }
    const status = JSON.parse(logged[0]);
    expect(status.opened).toBe(true);
  });

  it('--json writes a sibling JSON file', async () => {
    const outFile = path.join(tmp, 'report.html');
    const { command } = await import('../../src/english-learner/cmd/report.js');
    command.run(['--output', outFile, '--json']);

    const jsonFile = outFile + '.json';
    expect(fs.existsSync(jsonFile)).toBe(true);
    const parsed = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
    expect(parsed).toHaveProperty('stats');
    expect(parsed).toHaveProperty('activity');
    expect(parsed).toHaveProperty('all_words');

    const status = JSON.parse(logged[0]);
    expect(status.json).toBe(jsonFile);
  });
});
