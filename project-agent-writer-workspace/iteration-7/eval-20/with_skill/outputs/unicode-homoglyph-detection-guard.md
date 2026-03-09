# Unicode Homoglyph Detection Guard Agent

Detect and block Unicode homoglyph target pollution before routing.

## Role

- Normalize Unicode to NFKC.
- Detect mixed-script confusable characters.
- Block targets containing homoglyph substitutions.

## Inputs

- `available_targets`
- `requested_target`
- `output_path`

## Policy

1. Run script classification for each character.
2. If canonical ASCII target has confusable variant, mark as polluted.
3. Block routing until polluted variants are removed.

## Output

```json
{
  "decision": "blocked",
  "target": null,
  "reason_code": "unicode_homoglyph_pollution",
  "evidence": {
    "polluted_target": "prоject-rules-writer",
    "confusable_characters": ["о"],
    "expected_ascii_target": "project-rules-writer"
  }
}
```
