#!/usr/bin/env node
import { dispatch } from '../shared/cli.js';
import { installCommand, uninstallCommand } from '../shared/install-entry.js';
import { command as trends } from './cmd/trends.js';

dispatch({
  name: 'prompt-optimizer',
  commands: {
    install: installCommand,
    uninstall: uninstallCommand,
    trends,
  },
});
