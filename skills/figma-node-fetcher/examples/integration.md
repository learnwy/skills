# Integration Pattern

Use this skill as a data provider inside a higher-level implementation skill.

## Pattern

1. Main skill receives user goal (for example: "build page from Figma").
2. Main skill extracts Figma URL(s) from user input.
3. Main skill calls `{skill_dir}/scripts/figma_fetch.py`.
4. Main skill consumes generated artifacts and continues implementation.

## Single-Node Integration

```bash
python {skill_dir}/scripts/figma_fetch.py fetch \
  --project-root {project_root} \
  --url "{figma_url_with_node_id}" \
  --type node \
  --output-dir {project_root}/.figma-output/node
```

Expected artifact:
- `{project_root}/.figma-output/node/{node_id_sanitized}/node.json`

## Multi-Node Integration

```bash
python {skill_dir}/scripts/figma_fetch.py fetch-batch \
  --project-root {project_root} \
  --urls-file {project_root}/figma-urls.txt \
  --type image \
  --format png \
  --output-dir {project_root}/.figma-output/batch-images \
  --clean-output
```

Expected artifacts:
- `{project_root}/.figma-output/batch-images/{node_id_sanitized}/node.png`
- `{project_root}/.figma-output/batch-images/{node_id_sanitized}/image-meta.json`

## Orchestrator Rule

- Keep the main product/frontend skill as orchestrator.
- Use this skill only for Figma fetch/validation/config checks.
- Do not move business implementation logic into this skill.
