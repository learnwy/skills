import type { Phase } from '../phases.js';
import type { GateResult, WorkflowState } from '../state.js';
import { nowIso } from '../../../shared/fs-utils.js';
import { gateInit } from './init.js';
import { gateDefining } from './defining.js';
import { gatePlanning } from './planning.js';
import { gateDesigning } from './designing.js';
import { gateImplementing } from './implementing.js';
import { gateTesting } from './testing.js';
import { gateDelivering } from './delivering.js';

const GATES: Record<Phase, ((state: WorkflowState) => string[]) | null> = {
  INIT: gateInit,
  DEFINING: gateDefining,
  PLANNING: gatePlanning,
  DESIGNING: gateDesigning,
  IMPLEMENTING: gateImplementing,
  TESTING: gateTesting,
  DELIVERING: gateDelivering,
  DONE: () => [],
};

export function runGate(state: WorkflowState, phase: Phase): GateResult {
  const fn = GATES[phase];
  const failures = fn ? fn(state) : [];
  return { phase, ok: failures.length === 0, failures, checkedAt: nowIso() };
}
