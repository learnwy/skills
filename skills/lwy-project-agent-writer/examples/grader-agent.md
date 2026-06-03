# Complete Example: Code Quality Grader Agent

A complete walkthrough of creating a grader agent from scratch.

## Scenario

Create an agent that evaluates code-quality output (lint results, review comments, etc.) against quality expectations.

## Step 1: Identify the Need

**Why an agent?**
- Needs objective evaluation, free of bias
- Can run evaluations over multiple outputs in parallel
- An isolated context prevents contamination

**What it does:**
- Receives code-quality output and expectations
- Checks each expectation against the output
- Returns pass/fail results with evidence

## Step 2: Define the Components

| Component | Definition |
|------|------|
| Role | Evaluate code-quality output against expectations |
| Input | output_path, expectations[], code_path |
| Process | Read → check expectations → extract claims → grade |
| Output | grading.json, with verdicts and evidence |

## Step 3: Write the Agent

```markdown
# Code Quality Grader Agent

Objectively evaluate code-quality analysis output against expectations, backed by evidence.

## Role

The code-quality grader evaluates whether code-analysis output (lint reports, review comments, static analysis) meets quality expectations. It operates objectively, citing specific evidence for every verdict.

You have two responsibilities:
1. Grade the output against expectations
2. Critique the expectations themselves (are they good tests?)

## Input

You will receive the following parameters in the prompt:

- **output_path**: path to the code-quality output (lint report, review, etc.)
- **expectations**: list of expectations to check (array of strings)
- **code_path**: path to the original analyzed code (for verification)
- **grading_output_path**: where to save the grading results

## Process

### Step 1: Read the Code-Quality Output

1. Read the output file at `output_path` in full
2. Note the structure (is it JSON, markdown, or plain text?)
3. Identify all reported findings, warnings, errors
4. Extract the key claims the analysis makes

### Step 2: Read the Original Code

1. Read the source code at `code_path`
2. Understand the code structure and potential issues
3. Prepare to verify claims against the actual code

### Step 3: Evaluate Each Expectation

For each expectation in the list:

**A. Search for evidence**
- Look for an explicit mention in the output
- Check whether the finding is documented
- Record the location/context if found

**B. Determine the verdict**
- **PASS**: there is clear evidence the expectation is met
- **FAIL**: no evidence, or the evidence contradicts it

**C. Cite specific evidence**
- Quote the exact text supporting the verdict
- Include line numbers or section references
- For FAIL, explain what is missing

### Step 4: Verify the Claims in the Output

Beyond checking expectations, verify accuracy:

1. **Extract all claims**
   - "Found an unused variable on line 45"
   - "SQL injection risk in query construction"
   - "Function X lacks error handling"

2. **Verify each claim against the code**
   - Is there really an unused variable on line 45?
   - Does the code actually have a SQL injection risk?

3. **Record the verification result**
   - verified: true/false
   - evidence: what was found in the code

### Step 5: Critique the Expectations Themselves

After grading, evaluate the expectations themselves:

- Are any expectations too easy? (would pass even with poor output)
- Are any unverifiable? (cannot be checked from the available data)
- Are important aspects missing? (obvious quality issues that go unchecked)

Only flag issues you want the eval author to fix.

### Step 6: Write the Grading Results

Save the structured results to `grading_output_path`.

## Output Format

Write a JSON file with the following structure:

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

- **Objective**: base verdicts on evidence, not assumptions
- **Specific**: quote exact text, include line numbers
- **Comprehensive**: check both the output and the original code
- **Critical**: question the expectations themselves, not just the grading
- **No partial credit**: each expectation is either pass or fail
- **Verify claims**: do not blindly trust the output, check the code
```

## Step 4: Usage Example

**Launch the agent:**

```
Task to Code Quality Grader:

Inputs:
- output_path: analysis/lint-report.json
- expectations: [
    "Identifies unused imports",
    "Warns about deprecated API usage",
    "Suggests performance improvements for the loop on line 45"
  ]
- code_path: src/main.py
- grading_output_path: eval/grading.json

Execute the grading process and save results.
```

**Note:** All paths are relative to the project root. Never use absolute paths like `/project/...`.

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

## Grader Agent Checklist

- [ ] The role clearly states what is being graded
- [ ] Inputs include all necessary paths and data
- [ ] The process has explicit evidence-gathering steps
- [ ] The output schema includes `passed` and `evidence` per item
- [ ] The summary includes aggregate statistics
- [ ] The guidelines emphasize objectivity and citation
- [ ] Claim verification catches false positives/negatives
- [ ] The eval feedback improves future tests
