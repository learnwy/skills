# Level Selection Guide

How to determine which workflow level to use for a requirement.

## Quick Decision Tree

```
Is the requirement clear with small scope?
├── Yes → Does it involve security/payment/auth?
│         ├── Yes → L3
│         └── No  → L1
└── No  → Is it cross-module or has breaking changes?
          ├── Yes → L3
          └── No  → L2
```

## Selection Criteria

### L1: Quick

**Select when ALL of the following are true:**
- [ ] Affects ≤ 3 files
- [ ] Involves only 1 module
- [ ] Risk level: Low
- [ ] No external dependency changes
- [ ] No design document needed
- [ ] Estimated time < 1 hour

**Typical Scenarios:**
- Bug fixes (root cause is clear)
- UI tweaks
- Configuration changes
- Documentation updates
- Single-file refactoring

### L2: Standard

**Select when MOST of the following are true:**
- [ ] Affects 4-15 files
- [ ] Involves 1-3 modules
- [ ] Risk level: Medium
- [ ] May have external dependencies
- [ ] Requires simple design
- [ ] Estimated time 1-8 hours

**Typical Scenarios:**
- New feature development
- API additions/modifications
- Component refactoring
- Cross-file changes (scope is clear)

### L3: Full

**Select when ANY of the following are true:**
- [ ] Affects > 15 files
- [ ] Involves > 3 modules
- [ ] Risk level: High
- [ ] Has breaking changes
- [ ] Security-sensitive feature
- [ ] Requires complex architecture design
- [ ] Estimated time > 8 hours

**Typical Scenarios:**
- Security/authentication features
- Payment/transaction features
- System architecture changes
- Cross-module refactoring
- Data migrations
- Compliance-required features

## Scoring Algorithm

```
Scoring:

File count:        ≤3=0, 4-15=1, >15=2
Module count:      1=0, 2-3=1, >3=2
Risk level:        Low=0, Medium=1, High=2
Breaking changes:  No=0, Yes=2
External deps:     None=0, Few=1, Many=2

Total:
  0-2  → L1
  3-6  → L2
  7+   → L3
```

## Override Rules

Even if scoring suggests a lower level, **force upgrade** for:

| Condition | Minimum Level |
|-----------|---------------|
| User authentication involved | ≥ L2 |
| Payment/financial involved | L3 |
| Personal data (GDPR) involved | L3 |
| Compliance audit required | L3 |
| Team policy requires | Per policy |

## Examples

### Example 1: Fix button style

```
- Files affected: 1 CSS file
- Module: UI component
- Risk: Low
→ Level: L1
```

### Example 2: Add user avatar upload

```
- Files affected: ~10
- Modules: User, Storage
- Risk: Medium
- Requires API and storage design
→ Level: L2
```

### Example 3: Integrate third-party payment

```
- Files affected: 20+
- Modules: Payment, Order, User, Notification
- Risk: High (financial)
- Requires security review
→ Level: L3
```

## Manual Override

Users can manually specify level:

```bash
./scripts/init-workflow.sh -r /project -n "simple-fix" -t bugfix -l L3
```

Recorded in workflow.yaml:

```yaml
level: L3
level_override_reason: "Team policy requires L3 for all API changes"
```
