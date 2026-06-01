#!/usr/bin/env node
import { dispatch } from '../shared/cli.js';
import { installCommand, uninstallCommand } from '../shared/install-entry.js';
import { command as init } from './cmd/init.js';
import { command as lint } from './cmd/lint.js';
import { command as generateIndex } from './cmd/generate-index.js';
import { command as generateTopics } from './cmd/generate-topics.js';
import { command as freshnessCheck } from './cmd/freshness-check.js';
import { command as healthCheck } from './cmd/health-check.js';
import { command as stats } from './cmd/stats.js';

dispatch({
  name: 'llm-wiki',
  commands: {
    init,
    lint,
    'generate-index': generateIndex,
    'generate-topics': generateTopics,
    'freshness-check': freshnessCheck,
    'health-check': healthCheck,
    stats,
    install: installCommand,
    uninstall: uninstallCommand,
  },
});
