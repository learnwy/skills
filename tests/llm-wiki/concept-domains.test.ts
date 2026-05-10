import { describe, it, expect } from '@rstest/core';
import { classifyByDiscipline, classifyByFilename } from '../../src/llm-wiki/lib/concept-domains.js';

describe('classifyByDiscipline', () => {
  it('maps frontend signals to "frontend"', () => {
    expect(classifyByDiscipline('Frontend Engineering')).toBe('frontend');
    expect(classifyByDiscipline('React + TypeScript')).toBe('frontend');
  });

  it('maps go-related disciplines to "go"', () => {
    expect(classifyByDiscipline('Go BFF')).toBe('go');
    expect(classifyByDiscipline('Golang services')).toBe('go');
  });

  it('returns "_general" for unknown disciplines', () => {
    expect(classifyByDiscipline('Astrology')).toBe('_general');
  });

  it('is case-insensitive', () => {
    expect(classifyByDiscipline('IOS DEVELOPMENT')).toBe('ios');
  });
});

describe('classifyByFilename', () => {
  it('matches prefix patterns', () => {
    expect(classifyByFilename('react-hooks-deep-dive.md')).toBe('frontend');
    expect(classifyByFilename('android-coroutines.md')).toBe('android');
    expect(classifyByFilename('kotlin-flow.md')).toBe('android');
  });

  it('matches exact slugs', () => {
    expect(classifyByFilename('eudaimonia.md')).toBe('philosophy');
  });

  it('matches infix patterns when listed', () => {
    expect(classifyByFilename('clean-architecture-ios.md')).toBe('ios');
  });

  it('returns null for unmatched filenames', () => {
    expect(classifyByFilename('xyzqwerty.md')).toBeNull();
  });
});
