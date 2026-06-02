#!/usr/bin/env node
import { runWikiCli } from '../shared/wiki/engine.js';
import { DEFAULT_SELF_ROOT } from '../shared/wiki/lib/skin.js';

runWikiCli({ name: 'self', label: 'self', defaultRoot: DEFAULT_SELF_ROOT });
