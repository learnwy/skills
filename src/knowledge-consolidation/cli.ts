#!/usr/bin/env node
import { dispatch } from '../shared/cli.js';
import { command as path } from './cmd/path.js';

dispatch({
  name: 'knowledge-consolidation',
  commands: { path },
});
