#!/usr/bin/env node
import { dispatch } from '../shared/cli.js';
import { command as init } from './cmd/init.js';
import { command as advance } from './cmd/advance.js';
import { command as status } from './cmd/status.js';
import { command as hooks } from './cmd/hooks.js';

dispatch({
  name: 'requirement-workflow',
  commands: {
    init,
    advance,
    status,
    hooks,
  },
});
