#!/usr/bin/env node
import { autoQuery } from '../../shared/wiki/hooks/auto-query.js';
import { setSkin } from '../../shared/wiki/lib/skin.js';
import { DEFAULT_WIKI_ROOT } from '../../shared/wiki/lib/skin.js';

setSkin({ name: 'llm-wiki', label: 'llm-wiki', defaultRoot: DEFAULT_WIKI_ROOT });
autoQuery(DEFAULT_WIKI_ROOT).catch(() => process.exit(0));
