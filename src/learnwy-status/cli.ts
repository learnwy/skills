#!/usr/bin/env node
import { dispatch } from '../shared/cli.js';
import { installCommand, uninstallCommand } from '../shared/install-entry.js';
import { command as status } from './cmd/status.js';

dispatch({
  name: 'learnwy-status',
  commands: {
    status,
    install: installCommand,
    uninstall: uninstallCommand,
  },
});
