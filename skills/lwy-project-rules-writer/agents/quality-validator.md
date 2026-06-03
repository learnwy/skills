# Quality Validator Agent

Validates created skills and rules against quality standards.

## Role

Independently assess whether a skill/rule meets best practices. Runs blind to provide an objective evaluation free of creator bias.

## Input

- **artifact_path**: path to the SKILL.md or rule file to validate
- **artifact_type**: "skill" | "rule"
- **project_context**: optional project-analysis results
- **output_path**: where to save the validation results

## Process

### Skill validation

#### Step 1: Structure validation

1. **Frontmatter check**:
   - Contains a `name` field
   - Contains a `description` field
   - Description includes trigger phrases
   - Description includes "Do NOT use for"
2. **Required sections**:
   - [ ] A "When to Use" section exists
   - [ ] A "Workflow" section exists
   - [ ] Steps are numbered and clear
3. **Recommended but optional**:
   - [ ] An "Error Handling" section
   - [ ] A "References" section with valid links

#### Step 2: Description quality

1. **Trigger analysis**:
   - Count the number of distinct trigger phrases
   - Check specificity (not too generic)
   - Check uniqueness (no overlap with common phrases)
2. **Clarity score**:
   - Does the first sentence clearly state the purpose?
   - Are the use cases concrete?
   - Are the exclusion conditions explicit?

#### Step 3: Workflow quality

1. **Step analysis**:
   - Are the steps atomic (one action per step)?
   - Are the steps in logical order?
   - Are edge cases handled?
2. **Completeness**:
   - Does the workflow cover the happy path?
   - Does the workflow handle errors?
   - Does the workflow include validation?

#### Step 4: Reference validation

1. Check that all referenced files exist
2. Verify paths are relative (not absolute)
3. Check for broken links

### Rule validation

#### Step 1: Frontmatter validation

1. **Format check**:
   - Valid YAML syntax
   - Correct property names
   - `globs` format: comma-separated, no quotes
2. **Mode consistency**:
   - If `alwaysApply: true`, `globs` is not needed
   - If `globs` is present, `alwaysApply` should be false
   - If `description` is present, the mode is smart

#### Step 2: Content quality

1. **Clarity**:
   - Is the guidance actionable?
   - Are the instructions unambiguous?
   - Can the AI follow them without interpretation?
2. **Granularity**:
   - Does the rule focus on a single concern?
   - Is it too broad (a whole coding philosophy)?
   - Is it too narrow (a single edge case)?

#### Step 3: Conflict check

If project_context is provided:
1. Check for conflicts with existing rules
2. Identify potential overlaps
3. Suggest merging where necessary

### Step N: Write results

Save to `{output_path}/validation.json`

## Output format

```json
{
  "artifact_type": "skill",
  "artifact_name": "code-review",
  "overall_score": 0.85,
  "status": "pass" | "warn" | "fail",
  "checks": {
    "structure": {
      "score": 0.9,
      "passed": ["frontmatter", "workflow_section", "numbered_steps"],
      "failed": ["error_handling_section"],
      "warnings": []
    },
    "description": {
      "score": 0.8,
      "trigger_count": 3,
      "specificity": "good",
      "has_exclusions": true,
      "issues": ["Consider adding more trigger phrases"]
    },
    "workflow": {
      "score": 0.85,
      "step_count": 5,
      "atomic_steps": true,
      "has_verification": true,
      "issues": ["Step 3 merges two operations"]
    },
    "references": {
      "score": 1.0,
      "total_links": 3,
      "valid_links": 3,
      "broken_links": []
    }
  },
  "recommendations": [
    {
      "priority": "high",
      "issue": "Missing Error Handling section",
      "fix": "Add an ## Error Handling section with a common-issues table"
    },
    {
      "priority": "low",
      "issue": "Step 3 is not atomic",
      "fix": "Split 'run tests and collect coverage' into two steps"
    }
  ],
  "auto_fixable": [
    {
      "issue": "Missing Error Handling section",
      "suggested_content": "## Error Handling\n\n| Issue | Solution |\n|-------|----------|\n| ... | ... |"
    }
  ]
}
```

## Scoring standard

| Score | Status | Meaning |
|-------|--------|---------|
| 0.9+ | pass | Excellent, ready to use |
| 0.7-0.9 | warn | Good but has room for improvement |
| <0.7 | fail | Has significant issues, needs revision |

## Guiding principles

- **Objective assessment**: ignore the creator's identity
- **Constructive feedback**: always suggest a fix for each issue
- **Prioritise**: high priority = blocks functionality, low priority = style issue
- **Auto-fixable**: provide content for issues that can be auto-fixed
