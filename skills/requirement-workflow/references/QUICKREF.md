# Quick Reference

## Scripts

```bash
node scripts/init.cjs -r . -n "name" -t bugfix -s small -k normal
node scripts/advance.cjs -r . [--auto]
node scripts/status.cjs -r . [--json]
node scripts/hooks.cjs -r . list
```

## Classification

| Dimension | Options |
|-----------|---------|
| **Type** | bugfix, feature, refactor, tech-debt |
| **Size** | tiny (≤2), small (3-5), medium (6-15), large (>15) |
| **Risk** | normal, elevated, critical |

## Stages

```
INIT → DEFINING → PLANNING → DESIGNING → IMPLEMENTING → TESTING → DELIVERING → DONE
```

## Type × Size → Stages

| Type | Size | Stages |
|------|------|--------|
| bugfix | tiny | INIT→IMPLEMENTING→DONE |
| bugfix | small | INIT→IMPLEMENTING→TESTING→DONE |
| bugfix | medium/large | Full flow |
| feature/refactor/tech-debt | any | Full flow |

## Checkpoints

Checkpoints fire based on risk level:

| Stage | normal | elevated | critical |
|-------|--------|----------|----------|
| DEFINING | - | ✅ | ✅ |
| PLANNING | - | - | ✅ |
| DESIGNING | - | ✅ | ✅ |
| TESTING | ✅ | ✅ | ✅ |

## Quality Gates

| Size | Checks |
|------|--------|
| tiny | Lint |
| small | Lint + manual test |
| medium | Lint + type check + unit tests |
| large | medium + integration tests |
