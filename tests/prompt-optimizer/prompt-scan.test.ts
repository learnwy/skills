import { describe, it, expect, beforeEach, afterEach } from '@rstest/core';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { scanPrompt } from '../../src/lwy-prompt-optimizer/lib/prompt-scan.js';
import { eventsFile } from '../../src/lwy-prompt-optimizer/lib/events.js';

let dir = '';
const ENV_KEY = 'LEARNWY_PROMPT_OPTIMIZER_ROOT';

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'po-test-'));
  process.env[ENV_KEY] = dir;
});

afterEach(() => {
  delete process.env[ENV_KEY];
  rmSync(dir, { recursive: true, force: true });
});

describe('prompt-optimizer scanPrompt', () => {
  it('returns light-mode block on bare conversational text', () => {
    const out = scanPrompt('hey, can you help me think about this design?');
    expect(out).not.toBeNull();
    expect(out!).toMatch(/Light mode/);
    expect(out!).toMatch(/already clear, no rewrite needed/);
  });

  it('returns null on too-short input', () => {
    expect(scanPrompt('hi')).toBeNull();
  });

  it('returns block + writes event on explicit "optimize my prompt" trigger', () => {
    const out = scanPrompt('please optimize my prompt: write good code');
    expect(out).not.toBeNull();
    expect(out!).toMatch(/prompt-optimizer hook/);

    const f = eventsFile();
    expect(existsSync(f)).toBe(true);
    const lines = readFileSync(f, 'utf8').trim().split('\n');
    expect(lines.length).toBe(1);
    const event = JSON.parse(lines[0]);
    expect(event.trigger).toBe('explicit');
    expect(typeof event.length).toBe('number');
  });

  it('returns block on long structured prompt with shape markers', () => {
    const text = [
      'You are a senior reviewer.',
      'Your task is to evaluate the following submissions.',
      'Instructions:',
      '- Read carefully',
      '- Score each',
      '',
      'Output format: a markdown table.',
    ].join('\n').repeat(20);
    const out = scanPrompt(text);
    expect(out).not.toBeNull();
    expect(out!).toMatch(/prompt-optimizer hook/);
  });

  it('returns null on non-prose', () => {
    expect(scanPrompt('const x = 1; const y = 2; const z = 3;')).toBeNull();
  });

  it('records distinct trigger types', () => {
    scanPrompt('please rewrite my prompt for clarity');
    const explicit = JSON.parse(readFileSync(eventsFile(), 'utf8').trim().split('\n')[0]);
    expect(explicit.trigger).toBe('explicit');
  });
});
