import type { Command } from '../../shared/cli.js';
import { parseArgs } from '../../shared/cli.js';
import { readEvents, EVENTS_FILE, type PromptEvent } from '../lib/events.js';

interface Aggregate {
  total: number;
  byTrigger: Record<string, number>;
  byDow: Record<string, number>;
  avgLength: number;
  avgLines: number;
  avgShapeMarkers: number;
  recentExcerpts: { ts: string; trigger: string; excerpt: string }[];
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function aggregate(events: PromptEvent[]): Aggregate {
  const byTrigger: Record<string, number> = {};
  const byDow: Record<string, number> = {};
  let lengthSum = 0;
  let linesSum = 0;
  let markersSum = 0;
  for (const e of events) {
    byTrigger[e.trigger] = (byTrigger[e.trigger] || 0) + 1;
    const dow = DOW[new Date(e.ts).getDay()];
    byDow[dow] = (byDow[dow] || 0) + 1;
    lengthSum += e.length;
    linesSum += e.lines;
    markersSum += e.shape_markers;
  }
  const total = events.length;
  const recent = events.slice(-5).reverse().map((e) => ({
    ts: e.ts,
    trigger: e.trigger,
    excerpt: e.excerpt,
  }));
  return {
    total,
    byTrigger,
    byDow,
    avgLength: total ? Math.round(lengthSum / total) : 0,
    avgLines: total ? Math.round(linesSum / total) : 0,
    avgShapeMarkers: total ? Number((markersSum / total).toFixed(1)) : 0,
    recentExcerpts: recent,
  };
}

function formatHuman(days: number, agg: Aggregate): string {
  if (agg.total === 0) {
    return `No prompt-optimizer events recorded in the last ${days} day(s).\nFile: ${EVENTS_FILE}`;
  }
  const lines: string[] = [];
  lines.push(`prompt-optimizer trends — last ${days} day(s)`);
  lines.push('');
  lines.push(`Total triggered: ${agg.total}`);
  lines.push(`Average length: ${agg.avgLength} chars, ${agg.avgLines} lines, ${agg.avgShapeMarkers} shape markers/event`);
  lines.push('');
  lines.push('By trigger:');
  for (const [k, v] of Object.entries(agg.byTrigger).sort((a, b) => b[1] - a[1])) {
    lines.push(`  ${k.padEnd(12)} ${v}`);
  }
  lines.push('');
  lines.push('By day of week:');
  for (const d of DOW) {
    const v = agg.byDow[d] || 0;
    if (v) lines.push(`  ${d}  ${v}`);
  }
  lines.push('');
  lines.push('Recent excerpts:');
  for (const e of agg.recentExcerpts) {
    lines.push(`  [${e.ts.slice(0, 16)}] (${e.trigger}) ${e.excerpt}`);
  }
  return lines.join('\n');
}

export const command: Command = {
  description: 'Aggregate prompt-optimizer trigger events over a time window',
  run: (args) => {
    const { flags } = parseArgs(args);
    const days = flags.days ? Number.parseInt(String(flags.days), 10) : 30;
    if (!Number.isFinite(days) || days <= 0) {
      console.error('--days must be a positive integer');
      process.exit(1);
    }
    const json = flags.json === true;
    const events = readEvents(days * 24 * 60 * 60 * 1000);
    const agg = aggregate(events);
    if (json) {
      console.log(JSON.stringify({ window_days: days, ...agg }, null, 2));
    } else {
      console.log(formatHuman(days, agg));
    }
  },
};
