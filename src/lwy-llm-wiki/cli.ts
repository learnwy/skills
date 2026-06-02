#!/usr/bin/env node
import { runWikiCli } from '../shared/wiki/engine.js';
import { DEFAULT_WIKI_ROOT } from '../shared/wiki/lib/skin.js';

runWikiCli({ name: 'llm-wiki', label: 'llm-wiki', defaultRoot: DEFAULT_WIKI_ROOT });
