#!/usr/bin/env node
import { dispatch } from '../shared/cli.js';
import { installCommand, uninstallCommand } from '../shared/install-entry.js';
import { command as lint } from './cmd/lint.js';
import { command as generateIndex } from './cmd/generate-index.js';
import { command as generateTopics } from './cmd/generate-topics.js';
import { command as reorganize } from './cmd/reorganize.js';
import { command as freshnessCheck } from './cmd/freshness-check.js';
import { command as stats } from './cmd/stats.js';

dispatch({
  name: 'llm-wiki',
  commands: {
    lint,
    'generate-index': generateIndex,
    'generate-topics': generateTopics,
    reorganize,
    'freshness-check': freshnessCheck,
    stats,
    install: installCommand,
    uninstall: uninstallCommand,
  },
});
