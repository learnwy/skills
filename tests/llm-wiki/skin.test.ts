import { describe, it, expect, afterEach } from '@rstest/core';
import { rootFromFlags, resolveWikiPaths } from '../../src/shared/wiki/lib/constants.js';
import {
  setSkin,
  DEFAULT_WIKI_ROOT,
  DEFAULT_SELF_ROOT,
} from '../../src/shared/wiki/lib/skin.js';

const WIKI = { name: 'llm-wiki', label: 'llm-wiki', defaultRoot: DEFAULT_WIKI_ROOT };
const SELF = { name: 'self', label: 'self', defaultRoot: DEFAULT_SELF_ROOT };

afterEach(() => setSkin(WIKI));

describe('per-skin default root injection', () => {
  it('wiki skin resolves the wiki default root with no --root', () => {
    setSkin(WIKI);
    expect(rootFromFlags({})).toBe(DEFAULT_WIKI_ROOT);
  });

  it('self skin resolves the private self root with no --root', () => {
    setSkin(SELF);
    expect(rootFromFlags({})).toBe(DEFAULT_SELF_ROOT);
    expect(DEFAULT_SELF_ROOT).toBe('~/.learnwy/ai/private/self');
  });

  it('--root overrides the self skin default', () => {
    setSkin(SELF);
    expect(rootFromFlags({ root: '/tmp/custom' })).toBe('/tmp/custom');
    expect(rootFromFlags({ 'wiki-root': '/tmp/wr' })).toBe('/tmp/wr');
  });

  it('resolveWikiPaths threads the active skin default into wiki/raw dirs', () => {
    setSkin(SELF);
    const p = resolveWikiPaths({});
    expect(p.root).toMatch(/ai\/private\/self$/);
    expect(p.wikiDir).toMatch(/ai\/private\/self\/wiki$/);
    expect(resolveWikiPaths({ root: '/tmp/x' }).root).toBe('/tmp/x');
  });
});
