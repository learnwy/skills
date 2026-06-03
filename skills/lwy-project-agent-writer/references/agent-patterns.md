# Agent Patterns Reference

Common patterns for creating effective agents.

## Pattern 1: Grader Agent

**Purpose:** Evaluate output against expectations, backed by evidence.

**Core characteristics:**
- A list of expectations/assertions
- Pass/fail verdicts with evidence
- Aggregate statistics (pass_rate)

**Structure:**

```markdown
## Input
- **expectations**: list of assertions to check
- **output_path**: the content to evaluate
- **criteria_path**: evaluation criteria (optional)

## Process
1. Read the output
2. Search for evidence for each expectation
3. Mark pass/fail with citations
4. Compute aggregate statistics

## Output Schema
{
  "expectations": [
    {"text": "...", "passed": true, "evidence": "..."}
  ],
  "summary": {"passed": N, "failed": M, "pass_rate": 0.X}
}
```

**Use cases:**
- Automated test validation
- Output quality evaluation
- Compliance checks

---

## Pattern 2: Comparator Agent

**Purpose:** Blindly compare two outputs to determine a winner.

**Core characteristics:**
- Blind comparison (A vs B, source unknown)
- Rubric-based scoring
- Decisive winner selection

**Structure:**

```markdown
## Input
- **output_a_path**: the first output
- **output_b_path**: the second output
- **eval_prompt**: what the original request was
- **expectations**: optional assertions

## Process
1. Read both outputs without bias
2. Generate evaluation criteria
3. Score each output
4. Determine the winner and explain why

## Output Schema
{
  "winner": "A" | "B" | "TIE",
  "reasoning": "why A/B won",
  "rubric": {
    "A": {"score": N, "strengths": [], "weaknesses": []},
    "B": {"score": M, "strengths": [], "weaknesses": []}
  }
}
```

**Use cases:**
- A/B testing outputs
- Skill version comparison
- Unbiased quality evaluation

---

## Pattern 3: Analyzer Agent

**Purpose:** Extract insights and patterns from data/results.

**Core characteristics:**
- Free-form observation output
- Pattern recognition
- Actionable recommendations

**Structure:**

```markdown
## Input
- **data_path**: the data to analyze
- **context_path**: background information
- **focus_areas**: areas of focus (optional)

## Process
1. Read all data
2. Identify patterns
3. Flag anomalies
4. Generate insights

## Output Schema
{
  "observations": ["insight 1", "insight 2"],
  "patterns": [
    {"pattern": "X", "evidence": "...", "impact": "high|medium|low"}
  ],
  "suggestions": [
    {"category": "...", "suggestion": "...", "priority": "high|medium|low"}
  ]
}
```

**Use cases:**
- Post-mortem analysis
- Performance diagnostics
- Improvement identification

---

## Pattern 4: Transformer Agent

**Purpose:** Convert data from one format/structure to another.

**Core characteristics:**
- Clear input/output schema
- Transformation validation
- Error handling for edge cases

**Structure:**

```markdown
## Input
- **input_path**: source data
- **input_schema**: expected input format
- **output_schema**: target format
- **mapping_rules**: transformation rules (optional)

## Process
1. Read and validate input
2. Apply transformation rules
3. Validate the output schema
4. Write the transformed data

## Output Schema
{
  "status": "success" | "partial" | "failed",
  "transformed_path": "path/to/output",
  "errors": [],
  "warnings": []
}
```

**Use cases:**
- Data migration
- Format conversion
- Schema mapping

---

## Pattern 5: Researcher Agent

**Purpose:** Gather and synthesize information on a topic.

**Core characteristics:**
- Search strategy definition
- Source tracking
- Synthesized findings

**Structure:**

```markdown
## Input
- **query**: what to research
- **scope**: boundaries (files, web, etc.)
- **depth**: how deep to go

## Process
1. Define the search strategy
2. Execute the search
3. Evaluate sources
4. Synthesize findings

## Output Schema
{
  "findings": [
    {"claim": "...", "sources": ["..."], "confidence": "high|medium|low"}
  ],
  "sources_consulted": ["..."],
  "gaps": ["what was not found"],
  "summary": "overall synthesis"
}
```

**Use cases:**
- Doc lookup
- Best-practice research
- Competitive analysis

---

## Pattern 6: Validator Agent

**Purpose:** Check correctness against rules/constraints.

**Core characteristics:**
- Rule definition
- Violation detection
- Fix suggestions

**Structure:**

```markdown
## Input
- **target_path**: what to validate
- **rules**: validation rules
- **fix_mode**: whether to suggest fixes

## Process
1. Load validation rules
2. Check each rule against the target
3. Record violations
4. Suggest fixes (if enabled)

## Output Schema
{
  "valid": true | false,
  "violations": [
    {"rule": "...", "location": "...", "message": "...", "fix": "..."}
  ],
  "summary": {
    "rules_checked": N,
    "violations": M,
    "fixable": K
  }
}
```

**Use cases:**
- Schema validation
- Code-style checking
- Compliance validation

---

## Choosing the Right Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│ Need to evaluate quality?       → Grader                         │
│ Need an unbiased comparison?    → Comparator                     │
│ Need to extract insights?       → Analyzer                       │
│ Need to convert formats?        → Transformer                    │
│ Need to gather information?     → Researcher                     │
│ Need to check correctness?      → Validator                      │
└─────────────────────────────────────────────────────────────────┘
```

## Composing Agents

Agents can be orchestrated together:

```
┌───────────┐     ┌────────────┐     ┌──────────┐
│ Researcher│────▶│ Transformer│────▶│ Validator│
└───────────┘     └────────────┘     └──────────┘
      │                                    │
      └────────────────────────────────────┘
                       │
                       ▼
                ┌───────────┐
                │  Grader   │
                └───────────┘
```

**Example workflow:**
1. The researcher gathers requirements
2. The transformer converts them into spec format
3. The validator checks the spec for completeness
4. The grader evaluates the final quality
