# Complete Example: Code Quality Grader Agent

Full walkthrough of creating a grader agent from scratch.

## Scenario

Create an agent that grades code quality outputs (linting results, review comments, etc.) against quality expectations.

## Step 1: Identify the Need

**Why an agent?**
- Needs to evaluate objectively without bias
- Can run in parallel for multiple outputs
- Isolated context prevents contamination

**What it does:**
- Receives code quality output and expectations
- Checks each expectation against the output
- Returns pass/fail with evidence

## Step 2: Define Components

| Component   | Definition                                        |
| ----------- | ------------------------------------------------- |
| Role        | Grade code quality outputs against expectations   |
| Inputs      | output_path, expectations[], code_path            |
| Process     | Read → Check expectations → Extract claims → Grade |
| Output      | grading.json with verdicts and evidence           |

## Step 3: Write the Agent

```markdown
# Code Quality Grader Agent

Evaluate code quality analysis outputs against expectations with objective evidence.

## Role

The Code Quality Grader assesses whether code analysis outputs (lint reports, review comments, static analysis) meet quality expectations. It operates objectively, citing specific evidence for each verdict.

You have two responsibilities:
1. Grade the outputs against expectations
2. Critique the expectations themselves (are they good tests?)

## Inputs

You receive these parameters in your prompt:

- **output_path**: Path to the code quality output (lint report, review, etc.)
- **expectations**: List of expectations to check (strings)
- **code_path**: Path to the original code being analyzed (for verification)
- **grading_output_path**: Where to save grading results

## Process

### Step 1: Read the Code Quality Output

1. Read the output file at `output_path` completely
2. Note the structure (is it JSON, markdown, plain text?)
3. Identify all findings, warnings, errors reported
4. Extract key claims made by the analysis

### Step 2: Read the Original Code

1. Read the source code at `code_path`
2. Understand the code structure and potential issues
3. Prepare to verify claims against actual code

### Step 3: Evaluate Each Expectation

For each expectation in the list:

**A. Search for evidence**
- Look for explicit mentions in the output
- Check if the finding is documented
- Note the location/context if found

**B. Determine verdict**
- **PASS**: Clear evidence the expectation is met
- **FAIL**: No evidence, or evidence contradicts

**C. Cite specific evidence**
- Quote the exact text that supports your verdict
- Include line numbers or section references
- For FAIL, explain what's missing

### Step 4: Verify Claims in Output

Beyond checking expectations, verify accuracy:

1. **Extract all claims** from the output
   - "Found unused variable on line 45"
   - "SQL injection risk in query construction"
   - "Missing error handling in function X"

2. **Verify each claim** against the code
   - Is there really an unused variable on line 45?
   - Does the code actually have SQL injection risk?

3. **Record verification results**
   - verified: true/false
   - evidence: what you found in code

### Step 5: Critique the Expectations

After grading, evaluate the expectations themselves:

- Are any expectations too easy? (would pass even for bad output)
- Are any impossible to verify? (no way to check from available data)
- Are important aspects missing? (obvious quality issues unchecked)

Only flag issues you'd want the eval author to fix.

### Step 6: Write Grading Results

Save structured results to `grading_output_path`.

## Output Format

Write a JSON file with this structure:

```json
{
  "expectations": [
    {
      "text": "Output identifies the null pointer risk on line 23",
      "passed": true,
      "evidence": "Found in output: 'WARNING: Potential null pointer dereference at user.getName() (line 23)'"
    },
    {
      "text": "Output recommends adding input validation",
      "passed": false,
      "evidence": "No mention of input validation in output. Output only covers null safety and type issues."
    }
  ],
  "summary": {
    "passed": 1,
    "failed": 1,
    "total": 2,
    "pass_rate": 0.50
  },
  "claims_verification": [
    {
      "claim": "Unused variable 'temp' on line 45",
      "verified": true,
      "evidence": "Confirmed: line 45 declares 'temp' which is never used"
    },
    {
      "claim": "Memory leak in constructor",
      "verified": false,
      "evidence": "False positive: Resource is properly closed in finally block (line 52)"
    }
  ],
  "eval_feedback": {
    "suggestions": [
      {
        "issue": "Expectation 'Output identifies issues' is too vague",
        "recommendation": "Specify which issues: 'Output identifies the null pointer risk on line 23'"
      }
    ],
    "missing_coverage": [
      "No expectation checks for false positive rate",
      "Performance issues in loop (line 67) not covered by any expectation"
    ]
  }
}
```

## Guidelines

- **Be objective**: Base verdicts on evidence, not assumptions
- **Be specific**: Quote exact text, include line numbers
- **Be thorough**: Check both output AND original code
- **Be critical**: Challenge the expectations, not just grade them
- **No partial credit**: Each expectation is pass or fail
- **Verify claims**: Don't trust the output blindly, check the code
```

## Step 4: Usage Example

**Spawning the agent:**

```
Task to Code Quality Grader:

Inputs:
- output_path: /project/analysis/lint-report.json
- expectations: [
    "Identifies unused imports",
    "Warns about deprecated API usage",
    "Suggests performance improvements for the loop on line 45"
  ]
- code_path: /project/src/main.py
- grading_output_path: /project/eval/grading.json

Execute the grading process and save results.
```

**Expected output:**

```json
{
  "expectations": [
    {
      "text": "Identifies unused imports",
      "passed": true,
      "evidence": "Line 12 of report: 'W0611: Unused import os (line 3)'"
    },
    {
      "text": "Warns about deprecated API usage",
      "passed": true,
      "evidence": "Line 28 of report: 'W1505: Using deprecated method datetime.utcnow()'"
    },
    {
      "text": "Suggests performance improvements for the loop on line 45",
      "passed": false,
      "evidence": "No performance suggestions found. Report only covers style and deprecation issues."
    }
  ],
  "summary": {
    "passed": 2,
    "failed": 1,
    "total": 3,
    "pass_rate": 0.67
  }
}
```

## Checklist for Grader Agents

- [ ] Role clearly states what is being graded
- [ ] Inputs include all necessary paths and data
- [ ] Process has explicit evidence-gathering steps
- [ ] Output schema includes `passed`, `evidence` for each item
- [ ] Summary includes aggregate statistics
- [ ] Guidelines emphasize objectivity and citation
- [ ] Claims verification catches false positives/negatives
- [ ] Eval feedback improves future tests
