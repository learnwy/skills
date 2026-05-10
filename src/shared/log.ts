import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { ensureDir, nowIso } from './fs-utils.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_RANK: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

export function logRoot(): string {
  return path.join(os.homedir(), '.learnwy', 'logs');
}

function envLevel(): LogLevel {
  const raw = (process.env.LEARNWY_LOG_LEVEL || '').toLowerCase();
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') return raw;
  return 'warn';
}

function teeStderr(): boolean {
  return process.env.LEARNWY_LOG_STDERR === '1';
}

export interface Logger {
  debug: (msg: string) => void;
  info: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string | Error) => void;
}

export function createLogger(skill: string): Logger {
  function write(level: LogLevel, body: string): void {
    if (LEVEL_RANK[level] < LEVEL_RANK[envLevel()]) return;
    const root = logRoot();
    const file = path.join(root, `${skill}.log`);
    const line = `${nowIso()} [${level}] ${skill}: ${body}\n`;
    try {
      ensureDir(root);
      fs.appendFileSync(file, line);
    } catch {
      /* never break the caller on disk error */
    }
    if (teeStderr()) {
      try { process.stderr.write(line); } catch { /* swallow */ }
    }
  }

  return {
    debug: (msg) => write('debug', msg),
    info: (msg) => write('info', msg),
    warn: (msg) => write('warn', msg),
    error: (msg) => write('error', msg instanceof Error ? `${msg.message}\n${msg.stack || ''}` : msg),
  };
}
