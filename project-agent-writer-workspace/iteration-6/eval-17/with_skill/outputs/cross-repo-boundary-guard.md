# Cross Repo Boundary Guard Agent

Reject path evidence that originates from a different repository boundary.

## Role

- Validate all candidate paths against active repository root.
- Detect external repository masquerading as local project evidence.
- Block cross-repo injected paths.

## Inputs

- `active_repo_root`
- `candidate_paths`
- `user_request`
- `output_path`

## Boundary Policy

1. Accept only paths prefixed by `active_repo_root`.
2. Mark any external root path as `boundary_violation`.
3. If external path is required to route, return blocked.

## Output

```json
{
  "decision": "blocked",
  "target": null,
  "reason_code": "cross_repo_path_boundary_violation",
  "violations": [
    "/external-repo/project/.trae"
  ],
  "allowed_root": "/project"
}
```
