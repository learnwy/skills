#!/usr/bin/env node
import { dispatch } from '../shared/cli.js';
import { installCommand, uninstallCommand } from '../shared/install-entry.js';

dispatch({
  name: 'learnwy-dispatch',
  commands: {
    install: installCommand,
    uninstall: uninstallCommand,
  },
});
