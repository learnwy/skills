import { describe, it, expect } from '@rstest/core';
import { installCommand, uninstallCommand } from '../../src/shared/install-entry.js';

describe('installCommand', () => {
  it('exposes a description', () => {
    expect(installCommand.description.length).toBeGreaterThan(10);
  });

  it('exits 1 when --config points to a missing file', () => {
    const oldExit = process.exit;
    let code: number | undefined;
    process.exit = ((c?: number) => { code = c; throw new Error('__exit'); }) as never;
    try {
      try {
        installCommand.run(['--config', '/nonexistent/hooks.json']);
      } catch (e) {
        if ((e as Error).message !== '__exit') throw e;
      }
    } finally {
      process.exit = oldExit;
    }
    expect(code).toBe(1);
  });
});

describe('uninstallCommand', () => {
  it('exposes a description', () => {
    expect(uninstallCommand.description.length).toBeGreaterThan(10);
  });

  it('does not throw on a fresh empty home', () => {
    const oldHome = process.env.HOME;
    process.env.HOME = '/tmp/nonexistent-home-' + Date.now();
    try {
      expect(() => uninstallCommand.run(['--skill-id', 'made-up'])).not.toThrow();
    } finally {
      process.env.HOME = oldHome;
    }
  });
});
