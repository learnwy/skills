import { describe, it, expect, beforeEach, afterEach } from '@rstest/core';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createLogger } from '../../src/shared/log.js';

function withEnv(env: Record<string, string | undefined>, fn: () => void): void {
  const old: Record<string, string | undefined> = {};
  for (const k of Object.keys(env)) {
    old[k] = process.env[k];
    if (env[k] === undefined) delete process.env[k];
    else process.env[k] = env[k];
  }
  try { fn(); } finally {
    for (const k of Object.keys(env)) {
      if (old[k] === undefined) delete process.env[k];
      else process.env[k] = old[k];
    }
  }
}

describe('createLogger', () => {
  let tmpHome: string;
  let oldHome: string | undefined;

  beforeEach(() => {
    tmpHome = mkdtempSync(join(tmpdir(), 'log-'));
    oldHome = process.env.HOME;
    process.env.HOME = tmpHome;
  });
  afterEach(() => {
    process.env.HOME = oldHome;
    rmSync(tmpHome, { recursive: true, force: true });
  });

  it('writes warn/error by default; suppresses info/debug', () => {
    withEnv({ LEARNWY_LOG_LEVEL: undefined }, () => {
      // re-import to pick up env? createLogger reads env at call time → need to call after env set.
      const log = createLogger('test-skill');
      log.debug('d');
      log.info('i');
      log.warn('w');
      log.error('e');
    });
    const file = join(tmpHome, '.learnwy', 'logs', 'test-skill.log');
    expect(existsSync(file)).toBe(true);
    const content = readFileSync(file, 'utf8');
    expect(content).not.toMatch(/\[debug\]/);
    expect(content).not.toMatch(/\[info\]/);
    expect(content).toMatch(/\[warn\] test-skill: w/);
    expect(content).toMatch(/\[error\] test-skill: e/);
  });

  it('respects LEARNWY_LOG_LEVEL=debug', () => {
    withEnv({ LEARNWY_LOG_LEVEL: 'debug' }, () => {
      createLogger('verbose-skill').debug('hello-debug');
    });
    const content = readFileSync(join(tmpHome, '.learnwy', 'logs', 'verbose-skill.log'), 'utf8');
    expect(content).toMatch(/\[debug\] verbose-skill: hello-debug/);
  });

  it('error() formats Error objects with stack', () => {
    withEnv({ LEARNWY_LOG_LEVEL: 'error' }, () => {
      createLogger('err-skill').error(new Error('boom'));
    });
    const content = readFileSync(join(tmpHome, '.learnwy', 'logs', 'err-skill.log'), 'utf8');
    expect(content).toMatch(/\[error\] err-skill: boom/);
    expect(content).toMatch(/at /); // stack frame
  });

  it('appends rather than overwrites on subsequent calls', () => {
    withEnv({ LEARNWY_LOG_LEVEL: 'info' }, () => {
      createLogger('append-skill').info('first');
      createLogger('append-skill').info('second');
    });
    const content = readFileSync(join(tmpHome, '.learnwy', 'logs', 'append-skill.log'), 'utf8');
    expect(content.match(/\[info\]/g)?.length).toBe(2);
  });

  it('never throws on disk error', () => {
    process.env.HOME = '/proc/0/should-be-unwritable';
    expect(() => createLogger('test').error('x')).not.toThrow();
  });
});
