import * as fs from 'node:fs';
import * as path from 'node:path';
import { spawn } from 'node:child_process';
import { DATA_ROOT } from '../../shared/db.js';
import { collectReportData } from '../lib/report-data.js';
import { renderReport } from '../lib/report-html.js';
import type { Command } from '../../shared/cli.js';

interface Flags {
  output: string;
  open: boolean;
  json: boolean;
}

function parseFlags(args: string[]): Flags {
  let output = path.join(DATA_ROOT, 'report.html');
  let open = false;
  let json = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--output' || a === '-o') {
      output = args[++i] || output;
    } else if (a === '--open') {
      open = true;
    } else if (a === '--json') {
      json = true;
    }
  }
  return { output, open, json };
}

function openInBrowser(file: string): void {
  let bin: string;
  let argv: string[];
  if (process.platform === 'darwin') {
    bin = 'open';
    argv = [file];
  } else if (process.platform === 'win32') {
    bin = 'cmd';
    argv = ['/c', 'start', '""', file];
  } else {
    bin = 'xdg-open';
    argv = [file];
  }
  try {
    const child = spawn(bin, argv, { detached: true, stdio: 'ignore' });
    child.unref();
  } catch {
    /* best-effort */
  }
}

export const command: Command = {
  description: 'Generate a self-contained HTML report (vocabulary, mastery, corrections, activity)',
  run: (args) => {
    const flags = parseFlags(args);
    const data = collectReportData();
    const html = renderReport(data);

    fs.mkdirSync(path.dirname(flags.output), { recursive: true });
    fs.writeFileSync(flags.output, html);

    let jsonPath: string | null = null;
    if (flags.json) {
      jsonPath = flags.output + '.json';
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    }

    if (flags.open) openInBrowser(flags.output);

    console.log(JSON.stringify({
      status: 'ok',
      output: flags.output,
      bytes: fs.statSync(flags.output).size,
      json: jsonPath,
      opened: flags.open,
      sections: {
        words: data.all_words.length,
        phrases: data.all_phrases.length,
        due: data.due_words.length + data.due_phrases.length,
        corrections: data.top_corrections.length,
        activity_days: data.activity.length,
        words_truncated: data.words_truncated,
        phrases_truncated: data.phrases_truncated,
      },
    }, null, 2));
  },
};
