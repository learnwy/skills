#!/usr/bin/env node
import { dispatch } from '../shared/cli.js';
import { installCommand, uninstallCommand } from '../shared/install-entry.js';
import { command as status } from './cmd/status.js';
import { command as doctor } from './cmd/doctor.js';

dispatch({
  name: 'learnwy-status',
  commands: {
    status,
    doctor,
    install: installCommand,
    uninstall: uninstallCommand,
  },
});
