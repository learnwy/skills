# project-agent-writer · Iteration 9 Lightweight Regression

## Scope

- Goal: verify `project-agent-writer` v2.1 policy backwrite is reflected in outputs
- Cases: `eval-22` (composite risk), `eval-24` (overwrite + exact-match)
- Compared runs: `with_skill_v2_1` vs `baseline`

## Checks

| Check | with_skill_v2_1 | baseline |
|---|---|---|
| Evidence-first structured audit | pass | partial |
| Router non-executing boundary | pass | partial |
| Exact-match + overwrite rejection | pass | pass |
| Explicit deterministic reason_code | pass | pass |

## Conclusion

- v2.1 backwritten policies are reflected in lightweight regression outputs.
- Regression status: pass.
