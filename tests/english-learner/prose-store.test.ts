import { describe, it, expect, beforeEach } from '@rstest/core';
import { getDb } from '../../src/shared/db.js';
import {
  recordProseInput,
  getProseStats,
  getRecentProse,
} from '../../src/english-learner/lib/prose-store.js';

beforeEach(() => {
  getDb().exec('DELETE FROM prose_log;');
});

describe('prose-store', () => {
  it('records a clean English input', () => {
    const { id } = recordProseInput({
      language: 'en',
      text: 'This is fluent English.',
      had_issues: false,
    });
    expect(id).toBeGreaterThan(0);

    const stats = getProseStats();
    expect(stats.total).toBe(1);
    expect(stats.clean).toBe(1);
    expect(stats.with_issues).toBe(0);
    expect(stats.clean_rate).toBe(1);
  });

  it('records an input with issues', () => {
    recordProseInput({
      language: 'en',
      text: 'this have grammar issue',
      had_issues: true,
      issue_count: 2,
    });

    const stats = getProseStats();
    expect(stats.total).toBe(1);
    expect(stats.clean).toBe(0);
    expect(stats.with_issues).toBe(1);
    expect(stats.clean_rate).toBe(0);
  });

  it('aggregates by language', () => {
    recordProseInput({ language: 'en', text: 'a', had_issues: false });
    recordProseInput({ language: 'en', text: 'b', had_issues: true, issue_count: 1 });
    recordProseInput({ language: 'zh', text: '你好', had_issues: false });
    recordProseInput({ language: 'ja', text: 'こんにちは', had_issues: false });

    const stats = getProseStats();
    expect(stats.total).toBe(4);
    expect(stats.by_language).toHaveLength(3);
    const byLang = Object.fromEntries(stats.by_language.map((b) => [b.language, b]));
    expect(byLang.en.total).toBe(2);
    expect(byLang.en.clean).toBe(1);
    expect(byLang.en.clean_rate).toBe(0.5);
    expect(byLang.zh.total).toBe(1);
    expect(byLang.ja.total).toBe(1);
  });

  it('truncates excerpts to 200 chars', () => {
    const long = 'a'.repeat(500);
    recordProseInput({ language: 'en', text: long, had_issues: false });
    const recent = getRecentProse(1);
    expect(recent[0].excerpt!.length).toBe(200);
  });

  it('returns recent prose entries in DESC order', () => {
    recordProseInput({ language: 'en', text: 'first', had_issues: false });
    recordProseInput({ language: 'en', text: 'second', had_issues: false });
    recordProseInput({ language: 'en', text: 'third', had_issues: false });
    const recent = getRecentProse(2);
    expect(recent).toHaveLength(2);
    expect(recent[0].excerpt).toBe('third');
    expect(recent[1].excerpt).toBe('second');
  });
});
