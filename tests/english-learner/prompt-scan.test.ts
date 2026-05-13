import { describe, it, expect } from '@rstest/core';
import { scanPrompt } from '../../src/english-learner/lib/prompt-scan.js';
import { scanStop } from '../../src/english-learner/lib/stop-scan.js';

describe('english-learner scanPrompt', () => {
  it('returns ENGLISH block for clean English', () => {
    const out = scanPrompt('Could you help me refactor this function for clarity?');
    expect(out).not.toBeNull();
    expect(out!).toMatch(/wrote in English/);
    expect(out!).toMatch(/💡 English Tip/);
  });

  it('returns CHINESE block for clean Chinese learn-intent', () => {
    const out = scanPrompt('帮我把这段中文翻译成英文，并解释其中的语法');
    expect(out).not.toBeNull();
    expect(out!).toMatch(/wrote in Chinese/);
    expect(out!).toMatch(/中译英/);
  });

  it('returns null for code-shaped non-prose', () => {
    expect(scanPrompt('const x = 1; function f() { return x + 2 }')).toBeNull();
  });

  it('returns null for very short input', () => {
    expect(scanPrompt('hi')).toBeNull();
  });

  it('returns null for explicit Skill invocation prefix', () => {
    expect(scanPrompt('Use Skill: project-rules-writer with args')).toBeNull();
  });

  it('skips Chinese branch when message looks like coding context', () => {
    expect(scanPrompt('请帮我修复这个 bug，重构这段代码')).toBeNull();
  });

  it('skips Chinese branch for very long messages (likely task body, not learning)', () => {
    const long = '请帮我'.repeat(200);
    expect(scanPrompt(long)).toBeNull();
  });

  it('returns OTHER block for Japanese input', () => {
    const out = scanPrompt('こんにちは、今日の天気はとても良いですね');
    expect(out).not.toBeNull();
    expect(out!).toMatch(/language other than English or Chinese/);
    expect(out!).toMatch(/Translate & Learn/);
  });

  it('returns OTHER block for Korean input', () => {
    const out = scanPrompt('안녕하세요 오늘 날씨가 정말 좋네요');
    expect(out).not.toBeNull();
    expect(out!).toMatch(/Translate & Learn/);
  });

  it('reminder text tells the AI to call vocab record-input', () => {
    const out = scanPrompt('Could you help me refactor this function for clarity?');
    expect(out!).toMatch(/vocab record-input/);
    expect(out!).toMatch(/had_issues/);
  });
});

describe('english-learner scanStop', () => {
  it('returns null for short transcripts', () => {
    expect(scanStop('short')).toBeNull();
  });

  it('returns null when transcript looks like english-learner own output', () => {
    const t = 'a'.repeat(300) + ' english-learner hook ran';
    expect(scanStop(t)).toBeNull();
  });

  it('returns block when ≥5 long words appear in a substantive transcript', () => {
    const t =
      'The application demonstrates remarkable resilience across heterogeneous environments. ' +
      'Engineers iterating quickly often encounter unanticipated regressions during deployment. ' +
      'Comprehensive observability empowers efficient remediation. Sophisticated tooling matters.';
    const out = scanStop(t);
    expect(out).not.toBeNull();
    expect(out!).toMatch(/english-learner stop hook/);
    expect(out!).toMatch(/initial candidates:/);
  });

  it('returns null when fewer than 5 distinct long words', () => {
    const t = 'aaaaa '.repeat(80);
    expect(scanStop(t)).toBeNull();
  });
});
