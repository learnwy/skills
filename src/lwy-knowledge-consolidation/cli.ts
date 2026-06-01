#!/usr/bin/env node
import { dispatch } from '../shared/cli.js';
import { installCommand, uninstallCommand } from '../shared/install-entry.js';
import { command as path } from './cmd/path.js';
import { command as save } from './cmd/save.js';
import { command as promote } from './cmd/promote.js';

dispatch({
  name: 'knowledge-consolidation',
  commands: {
    path,
    save,
    promote,
    install: installCommand,
    uninstall: uninstallCommand,
  },
});
