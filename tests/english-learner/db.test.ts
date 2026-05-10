import { describe, it, expect } from '@rstest/core';
import {
  rowToWord, rowToPhrase, intervalDaysForMastery, nextReviewAt,
  type WordRow, type PhraseRow,
} from '../../src/shared/db.js';

describe('rowToWord', () => {
  it('returns null for undefined row', () => {
    expect(rowToWord(undefined)).toBeNull();
  });

  it('parses inner JSON and exposes flat shape', () => {
    const row: WordRow = {
      word: 'run',
      data: JSON.stringify({
        definitions: [{ pos: 'v.', meaning: 'move quickly', examples: ['I run.'] }],
        phonetic: '/rʌn/',
        synonyms: ['sprint'],
        antonyms: ['walk'],
      }),
      mastery: 40,
      lookup_count: 5,
      created_at: '2026-01-01',
      updated_at: '2026-01-02',
      last_lookup: '2026-01-03',
      next_review_at: null,
    };
    const w = rowToWord(row);
    expect(w?.word).toBe('run');
    expect(w?.definitions).toHaveLength(1);
    expect(w?.phonetic).toBe('/rʌn/');
    expect(w?.synonyms).toEqual(['sprint']);
    expect(w?.mastery).toBe(40);
    expect(w?.last_lookup).toBe('2026-01-03');
  });

  it('omits last_lookup when null', () => {
    const row: WordRow = {
      word: 'a', data: '{}', mastery: 0, lookup_count: 0,
      created_at: '', updated_at: '', last_lookup: null, next_review_at: null,
    };
    const w = rowToWord(row);
    expect(w).not.toHaveProperty('last_lookup');
  });

  it('defaults missing inner fields to empty values', () => {
    const row: WordRow = {
      word: 'x', data: '{}', mastery: 0, lookup_count: 0,
      created_at: '', updated_at: '', last_lookup: null, next_review_at: null,
    };
    const w = rowToWord(row);
    expect(w?.definitions).toEqual([]);
    expect(w?.phonetic).toBe('');
    expect(w?.synonyms).toEqual([]);
    expect(w?.antonyms).toEqual([]);
  });
});

describe('rowToPhrase', () => {
  it('returns null for undefined row', () => {
    expect(rowToPhrase(undefined)).toBeNull();
  });

  it('parses inner JSON', () => {
    const row: PhraseRow = {
      phrase: 'break the ice',
      data: JSON.stringify({
        definition: 'start a conversation',
        phonetic: '',
        literal: 'literally',
        examples: ['ex1'],
      }),
      mastery: 10,
      lookup_count: 1,
      created_at: '',
      updated_at: '',
      last_lookup: null,
      next_review_at: null,
    };
    const p = rowToPhrase(row);
    expect(p?.definition).toBe('start a conversation');
    expect(p?.literal).toBe('literally');
    expect(p?.examples).toEqual(['ex1']);
  });
});

describe('intervalDaysForMastery', () => {
  it.each([
    [0, 1],
    [9, 1],
    [10, 3],
    [29, 3],
    [30, 7],
    [49, 7],
    [50, 14],
    [69, 14],
    [70, 30],
    [89, 30],
    [90, 90],
    [100, 90],
  ])('mastery %d → %d days', (mastery, expected) => {
    expect(intervalDaysForMastery(mastery)).toBe(expected);
  });
});

describe('nextReviewAt', () => {
  it('returns ISO timestamp interval days in the future', () => {
    const from = new Date('2026-05-10T00:00:00.000Z');
    const next = nextReviewAt(0, from);
    expect(next).toBe('2026-05-11T00:00:00.000Z');
  });

  it('high mastery yields long interval', () => {
    const from = new Date('2026-05-10T00:00:00.000Z');
    const next = nextReviewAt(95, from);
    expect(next).toBe('2026-08-08T00:00:00.000Z');
  });

  it('uses now() when no fromDate is provided', () => {
    const before = Date.now();
    const got = Date.parse(nextReviewAt(0));
    const after = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    expect(got - before).toBeGreaterThanOrEqual(oneDay - 1000);
    expect(got - after).toBeLessThanOrEqual(oneDay + 1000);
  });
});
