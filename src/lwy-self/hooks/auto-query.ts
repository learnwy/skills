#!/usr/bin/env node
import { autoQuery } from '../../shared/wiki/hooks/auto-query.js';
import { setSkin } from '../../shared/wiki/lib/skin.js';
import { DEFAULT_SELF_ROOT } from '../../shared/wiki/lib/skin.js';

setSkin({ name: 'self', label: 'self', defaultRoot: DEFAULT_SELF_ROOT });
autoQuery(DEFAULT_SELF_ROOT).catch(() => process.exit(0));
