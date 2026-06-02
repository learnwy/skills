import { describe, it, expect } from '@rstest/core';
import { hasTitle } from '../../src/shared/wiki/cmd/lint.js';

describe('hasTitle', () => {
  it('detects an H1 on line 1', () => {
    expect(hasTitle('# Zhang San\n\nbody')).toBe(true);
  });

  it('detects an H1 after YAML frontmatter', () => {
    expect(hasTitle('---\nname: x\ntype: people\n---\n\n# 侯宇\n')).toBe(true);
  });

  it('returns false when there is no H1', () => {
    expect(hasTitle('---\nname: x\n---\n\njust body, no heading')).toBe(false);
  });

  it('returns false for an empty file', () => {
    expect(hasTitle('')).toBe(false);
  });
});
