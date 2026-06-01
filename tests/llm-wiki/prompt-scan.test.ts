import { describe, it, expect, beforeEach, afterEach } from '@rstest/core';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { scanPrompt } from '../../src/lwy-llm-wiki/lib/prompt-scan.js';

const TOPICS = [
  'react-performance',
  'frontend-engineering-react',
  'software-engineering-design-patterns',
  'philosophy-stoicism',
];

let wikiRoot = '';

beforeEach(() => {
  wikiRoot = mkdtempSync(join(tmpdir(), 'llmwiki-test-'));
  mkdirSync(join(wikiRoot, 'wiki'), { recursive: true });
  writeFileSync(join(wikiRoot, 'wiki', 'topics.txt'), TOPICS.join('\n'));
});

afterEach(() => {
  rmSync(wikiRoot, { recursive: true, force: true });
});

describe('llm-wiki scanPrompt', () => {
  it('returns null for short messages', () => {
    expect(scanPrompt('short', wikiRoot)).toBeNull();
  });

  it('returns null when topics.txt is missing', () => {
    const empty = mkdtempSync(join(tmpdir(), 'llmwiki-empty-'));
    expect(scanPrompt('please tell me about react performance', empty)).toBeNull();
    rmSync(empty, { recursive: true, force: true });
  });

  it('matches topics that contain a 4+ char word from the message', () => {
    const out = scanPrompt('please tell me about react performance optimization', wikiRoot);
    expect(out).not.toBeNull();
    expect(out!).toMatch(/Relevant wiki topics found/);
    expect(out!).toMatch(/react/);
  });

  it('returns null when no words match any topic', () => {
    const out = scanPrompt('what is the velocity of an unladen swallow', wikiRoot);
    expect(out).toBeNull();
  });

  it('skips non-prose code-shaped input', () => {
    expect(scanPrompt('const react = require("react"); module.exports = {};', wikiRoot)).toBeNull();
  });
});
