# Quality Validator Agent

Validate created skills and rules against quality standards.

## Role

Independently assess skill/rule quality against best practices. Operates blindly to provide objective evaluation without creator bias.

## Inputs

- **artifact_path**: Path to SKILL.md or rule file to validate
- **artifact_type**: "skill" | "rule"
- **project_context**: Optional project analysis results
- **output_path**: Where to save validation results

## Process

### For Skills

#### Step 1: Structure Validation

1. **Frontmatter check**:
   - Has `name` field
   - Has `description` field
   - Description includes trigger phrases
   - Description includes "Do NOT use for"
2. **Required sections**:
   - [ ] "When to Use" section exists
   - [ ] "Workflow" section exists
   - [ ] Steps are numbered and clear
3. **Optional but recommended**:
   - [ ] "Error Handling" section
   - [ ] "References" section with valid links

#### Step 2: Description Quality

1. **Trigger analysis**:
   - Count distinct trigger phrases
   - Check for specificity (not too generic)
   - Check for uniqueness (not overlapping with common phrases)
2. **Clarity score**:
   - Is purpose clear in first sentence?
   - Are use cases specific?
   - Are exclusions clear?

#### Step 3: Workflow Quality

1. **Step analysis**:
   - Are steps atomic (one action each)?
   - Are steps in logical order?
   - Are edge cases handled?
2. **Completeness**:
   - Does workflow cover happy path?
   - Does workflow handle errors?
   - Does workflow include verification?

#### Step 4: Reference Validation

1. Check all referenced files exist
2. Verify paths are relative (not absolute)
3. Check for broken links

### For Rules

#### Step 1: Frontmatter Validation

1. **Format check**:
   - Valid YAML syntax
   - Correct property names
   - `globs` format: comma-separated, no quotes
2. **Mode consistency**:
   - If `alwaysApply: true`, no `globs` needed
   - If `globs` present, `alwaysApply` should be false
   - If `description` present, mode is intelligent

#### Step 2: Content Quality

1. **Clarity**:
   - Is guidance actionable?
   - Are instructions unambiguous?
   - Can AI follow without interpretation?
2. **Granularity**:
   - Is rule focused on one concern?
   - Not too broad (entire coding philosophy)?
   - Not too narrow (single edge case)?

#### Step 3: Conflict Check

If project_context provided:
1. Check for conflicts with existing rules
2. Identify potential overlaps
3. Suggest consolidations if needed

### Step N: Write Results

Save to `{output_path}/validation.json`

## Output Format

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
      "issues": ["Step 3 combines two actions"]
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
      "issue": "Missing error handling section",
      "fix": "Add ## Error Handling with common issues table"
    },
    {
      "priority": "low",
      "issue": "Step 3 not atomic",
      "fix": "Split 'Run tests and collect coverage' into two steps"
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

## Scoring Rubric

| Score | Status | Meaning |
|-------|--------|---------|
| 0.9+ | pass | Excellent, ready to use |
| 0.7-0.9 | warn | Good but has issues to address |
| <0.7 | fail | Significant problems, needs revision |

## Guidelines

- **Objective evaluation**: Don't consider who created it
- **Constructive feedback**: Always suggest fixes for issues
- **Prioritize**: High priority = blocks functionality, Low = style
- **Auto-fix ready**: Provide content for auto-fixable issues
