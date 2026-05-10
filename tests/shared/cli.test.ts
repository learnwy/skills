import { describe, it, expect } from '@rstest/core';
import { dispatch, parseArgs, type Command } from '../../src/shared/cli.js';

describe('parseArgs', () => {
  it('separates positional args and long flags', () => {
    const r = parseArgs(['init', '--name', 'foo', '--dry-run']);
    expect(r.positional).toEqual(['init']);
    expect(r.flags).toEqual({ name: 'foo', 'dry-run': true });
  });

  it('expands short aliases', () => {
    const r = parseArgs(['-r', '/tmp', '-n', 'x'], { r: 'root', n: 'name' });
    expect(r.flags).toEqual({ root: '/tmp', name: 'x' });
  });

  it('treats trailing short flag without value as boolean', () => {
    const r = parseArgs(['-v']);
    expect(r.flags).toEqual({ v: true });
  });

  it('treats --flag followed by another flag as boolean', () => {
    const r = parseArgs(['--verbose', '--quiet']);
    expect(r.flags).toEqual({ verbose: true, quiet: true });
  });
});

describe('dispatch', () => {
  function fakeCmd(side: { ran?: string; args?: string[] }): Command {
    return {
      description: 'test',
      run: (args) => {
        side.ran = 'yes';
        side.args = args;
      },
    };
  }

  it('routes to the named subcommand and forwards args', () => {
    const side: { ran?: string; args?: string[] } = {};
    const oldArgv = process.argv;
    process.argv = ['node', 'cli.cjs', 'init', '--name', 'foo'];
    try {
      dispatch({ name: 'test', commands: { init: fakeCmd(side) } });
    } finally {
      process.argv = oldArgv;
    }
    expect(side.ran).toBe('yes');
    expect(side.args).toEqual(['--name', 'foo']);
  });

  it('exits 1 on unknown subcommand', () => {
    const oldArgv = process.argv;
    const oldExit = process.exit;
    let exitCode: number | undefined;
    process.argv = ['node', 'cli.cjs', 'mystery'];
    process.exit = ((code?: number) => {
      exitCode = code;
      throw new Error('__exit');
    }) as never;
    try {
      try {
        dispatch({ name: 'test', commands: { init: fakeCmd({}) } });
      } catch (e) {
        if ((e as Error).message !== '__exit') throw e;
      }
    } finally {
      process.argv = oldArgv;
      process.exit = oldExit;
    }
    expect(exitCode).toBe(1);
  });
});
