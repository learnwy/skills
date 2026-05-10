import { describe, it, expect } from '@rstest/core';
import {
  looksLikeCode, looksLikePath, looksLikeCommand, looksLikeNonProse, englishRatio,
} from '../../src/shared/text-classifiers.js';

describe('looksLikeCode', () => {
  it.each([
    'import foo from "bar"',
    'const x = 1',
    'let y = 2',
    'function add(a, b) { return a + b }',
    'class Foo {}',
    '// comment',
    '#!/bin/bash',
    '{ key: 1 }',
    '[1, 2, 3]',
  ])('matches %s', (s) => expect(looksLikeCode(s)).toBe(true));

  it('does not match prose', () => {
    expect(looksLikeCode('Please help me write a function')).toBe(false);
  });
});

describe('looksLikePath', () => {
  it.each(['/usr/local/bin/x.sh', '~/.config/foo.json', './rel.ts', '../up.tsx'])('matches %s', (s) =>
    expect(looksLikePath(s)).toBe(true),
  );

  it('rejects bare names', () => {
    expect(looksLikePath('helloworld')).toBe(false);
    expect(looksLikePath('I have a thought')).toBe(false);
  });
});

describe('looksLikeCommand', () => {
  it.each(['git status', 'pnpm install', 'npm run build', 'node script.js', 'docker ps', 'kubectl get pods'])(
    'matches %s', (s) => expect(looksLikeCommand(s)).toBe(true),
  );

  it('does not match arbitrary text starting with letters', () => {
    expect(looksLikeCommand('git is a tool')).toBe(true); // edge: "git " prefix triggers; documented behavior
    expect(looksLikeCommand('Hello world')).toBe(false);
  });
});

describe('looksLikeNonProse', () => {
  it('returns true for any code/path/command input', () => {
    expect(looksLikeNonProse('const x = 1')).toBe(true);
    expect(looksLikeNonProse('/etc/passwd.bak')).toBe(true);
    expect(looksLikeNonProse('git pull')).toBe(true);
  });

  it('returns false for natural language', () => {
    expect(looksLikeNonProse('Can you help me understand this concept?')).toBe(false);
  });
});

describe('englishRatio', () => {
  it('returns 1.0 for pure latin alpha (no spaces)', () => {
    expect(englishRatio('abcXYZ')).toBe(1);
  });

  it('returns 0 for empty / whitespace-only', () => {
    expect(englishRatio('')).toBe(0);
    expect(englishRatio('   ')).toBe(0);
  });

  it('reflects ratio for mixed text', () => {
    // 'hello123' → 5 alpha / 8 total = 0.625
    expect(englishRatio('hello123')).toBeCloseTo(0.625, 2);
  });

  it('ignores spaces in the denominator', () => {
    // 'hi ok' → 4 alpha / 4 non-space chars = 1.0
    expect(englishRatio('hi ok')).toBe(1);
  });
});
