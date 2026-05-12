import { describe, it, expect } from '@rstest/core';
import { denseActivity, ACTIVITY_DAYS } from '../../src/english-learner/lib/report-data.js';

describe('denseActivity', () => {
  const now = new Date('2026-05-12T12:00:00.000Z');

  it('returns ACTIVITY_DAYS dense buckets ending on today', () => {
    const out = denseActivity([], now);
    expect(out).toHaveLength(ACTIVITY_DAYS);
    expect(out[out.length - 1].day).toBe('2026-05-12');
    expect(out[0].day).toBe('2026-04-13');
    for (const b of out) {
      expect(b.total).toBe(0);
      expect(b.by_type).toEqual({});
    }
  });

  it('aggregates rows into the matching day bucket and sums by type', () => {
    const rows = [
      { day: '2026-05-12', query_type: 'lookup', c: 3 },
      { day: '2026-05-12', query_type: 'review', c: 2 },
      { day: '2026-05-11', query_type: 'lookup', c: 1 },
    ];
    const out = denseActivity(rows, now);
    const today = out.find((b) => b.day === '2026-05-12')!;
    expect(today.total).toBe(5);
    expect(today.by_type).toEqual({ lookup: 3, review: 2 });
    const yesterday = out.find((b) => b.day === '2026-05-11')!;
    expect(yesterday.total).toBe(1);
    expect(yesterday.by_type).toEqual({ lookup: 1 });
  });

  it('drops rows outside the window', () => {
    const rows = [
      { day: '2026-04-12', query_type: 'lookup', c: 99 },
      { day: '2025-01-01', query_type: 'lookup', c: 5 },
    ];
    const out = denseActivity(rows, now);
    const totals = out.reduce((sum, b) => sum + b.total, 0);
    expect(totals).toBe(0);
  });
});
