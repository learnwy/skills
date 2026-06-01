import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { ensureDir, nowIso } from './fs-utils.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_RANK: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;
const KEEP_GENERATIONS = 3;

export function logRoot(): string {
  return path.join(os.homedir(), '.learnwy', '.var', 'logs');
}

function envLevel(): LogLevel {
  const raw = (process.env.LEARNWY_LOG_LEVEL || '').toLowerCase();
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') return raw;
  return 'warn';
}

function teeStderr(): boolean {
  return process.env.LEARNWY_LOG_STDERR === '1';
}

function maxBytes(): number {
  const raw = process.env.LEARNWY_LOG_MAX_BYTES;
  if (!raw) return DEFAULT_MAX_BYTES;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_BYTES;
}

function rotateIfNeeded(file: string, threshold: number): void {
  let size = 0;
  try {
    size = fs.statSync(file).size;
  } catch {
    return;
  }
  if (size < threshold) return;
  for (let i = KEEP_GENERATIONS; i >= 1; i--) {
    const src = i === 1 ? file : `${file}.${i - 1}`;
    const dst = `${file}.${i}`;
    try {
      if (fs.existsSync(src)) fs.renameSync(src, dst);
    } catch {
      /* swallow — best-effort rotation */
    }
  }
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
      rotateIfNeeded(file, maxBytes());
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
