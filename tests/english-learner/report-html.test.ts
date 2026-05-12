import { describe, it, expect } from '@rstest/core';
import { escapeHtml, renderReport } from '../../src/english-learner/lib/report-html.js';
import type { ReportData } from '../../src/english-learner/lib/report-data.js';

const sampleData: ReportData = {
  generated_at: '2026-05-12T12:00:00.000Z',
  stats: {
    total_words: 3,
    total_phrases: 1,
    total_lookups: 7,
    mastered_words: 1,
    learning_words: 1,
    new_words: 1,
  },
  correction_stats: { total: 5, unique_pairs: 3, recent_count: 2 },
  due_words: [
    {
      word: 'standalone',
      definitions: [{ pos: 'adj.', meaning: 'operating independently', examples: [] }],
      phonetic: '/ˈstændəloʊn/',
      synonyms: [],
      antonyms: [],
      mastery: 20,
      lookup_count: 2,
      created_at: '',
      updated_at: '',
    },
  ],
  due_phrases: [],
  all_words: [
    {
      word: '<script>x',
      definitions: [{ pos: '', meaning: '"dangerous" payload', examples: [] }],
      phonetic: '',
      synonyms: [],
      antonyms: [],
      mastery: 0,
      lookup_count: 1,
      created_at: '',
      updated_at: '',
    },
  ],
  all_phrases: [],
  words_truncated: false,
  phrases_truncated: false,
  top_corrections: [
    { original: 'fodler', corrected: 'folder', reason: 'typo', count: 1, last_seen: '2026-05-12' },
  ],
  activity: [
    { day: '2026-05-11', total: 0, by_type: {} },
    { day: '2026-05-12', total: 3, by_type: { lookup: 3 } },
  ],
};

describe('escapeHtml', () => {
  it('escapes the five HTML metacharacters', () => {
    expect(escapeHtml('<a href="x">&\'</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
  });
  it('is idempotent on safe input', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });
});

describe('renderReport', () => {
  const html = renderReport(sampleData);

  it('produces a complete HTML doc', () => {
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toContain('</html>');
    expect(html).toContain('<title>');
  });

  it('embeds the report data as JSON in a script tag', () => {
    expect(html).toContain('<script id="report-data" type="application/json">');
    const match = html.match(/<script id="report-data"[^>]*>([\s\S]*?)<\/script>/);
    expect(match).not.toBeNull();
    const payload = match![1].replace(/\\u003c/g, '<');
    const parsed = JSON.parse(payload);
    expect(parsed.stats.total_words).toBe(3);
    expect(parsed.all_words[0].word).toBe('<script>x');
  });

  it('renders headline counts in the static shell', () => {
    expect(html).toContain('English-Learner Report');
    expect(html).toContain('>3<');
    expect(html).toContain('Total lookups');
    expect(html).toContain('Mastered');
    expect(html).toContain('Learning');
  });

  it('renders all required sections, sidebar nav, and back-to-top', () => {
    expect(html).toContain('id="due-list"');
    expect(html).toContain('id="heatmap"');
    expect(html).toContain('id="words"');
    expect(html).toContain('id="phrases"');
    expect(html).toContain('id="corrections"');
    expect(html).toContain('id="back-to-top"');
    expect(html).toContain('id="global-search"');
    expect(html).toContain('id="shortcuts-modal"');
    expect(html).toContain('class="sidebar"');
  });

  it('renders mastery filter chips with bucket data attributes', () => {
    expect(html).toContain('data-bucket="all"');
    expect(html).toContain('data-bucket="mastered"');
    expect(html).toContain('data-bucket="learning"');
    expect(html).toContain('data-bucket="new"');
  });

  it('renders per-table CSV buttons and row-limit selectors', () => {
    expect(html.match(/class="csv-btn"/g)!.length).toBeGreaterThanOrEqual(3);
    expect(html.match(/class="row-limit"/g)!.length).toBeGreaterThanOrEqual(3);
  });

  it('includes print stylesheet rules', () => {
    expect(html).toContain('@media print');
  });

  it('includes keyboard shortcut help dialog content', () => {
    expect(html).toContain('Keyboard shortcuts');
    expect(html).toContain('Jump to Words');
  });

  it('escapes the embedded JSON to prevent script-tag breakout', () => {
    expect(html).not.toMatch(/<\/script>\s*<script id="report-data"/);
    expect(html.match(/<\/script>/g)!.length).toBe(2);
  });

  it('escapes the title text', () => {
    const obnoxious: ReportData = { ...sampleData, generated_at: '<script>alert(1)</script>' };
    const out = renderReport(obnoxious);
    expect(out).toContain('&lt;script&gt;');
  });

  it('shows truncation warning when words_truncated is true', () => {
    const truncated: ReportData = {
      ...sampleData,
      words_truncated: true,
      stats: { ...sampleData.stats, total_words: 6000 },
    };
    const out = renderReport(truncated);
    expect(out).toContain('not shown');
  });
});
