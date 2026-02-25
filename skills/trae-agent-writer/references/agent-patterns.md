# Agent Patterns Reference

Common patterns for creating effective agents.

## Pattern 1: Grader Agent

**Purpose:** Evaluate outputs against expectations with evidence.

**Key Features:**
- List of expectations/assertions
- Pass/fail verdict with evidence
- Aggregate statistics (pass_rate)

**Structure:**

```markdown
## Inputs
- **expectations**: List of assertions to check
- **output_path**: What to evaluate
- **criteria_path**: Evaluation criteria (optional)

## Process
1. Read outputs
2. For each expectation, search for evidence
3. Mark pass/fail with quotes
4. Calculate aggregate stats

## Output Schema
{
  "expectations": [
    {"text": "...", "passed": true, "evidence": "..."}
  ],
  "summary": {"passed": N, "failed": M, "pass_rate": 0.X}
}
```

**When to Use:**
- Automated test validation
- Output quality assessment
- Compliance checking

---

## Pattern 2: Comparator Agent

**Purpose:** Compare two outputs blindly to determine winner.

**Key Features:**
- Blind comparison (A vs B, not knowing source)
- Rubric-based scoring
- Decisive winner selection

**Structure:**

```markdown
## Inputs
- **output_a_path**: First output
- **output_b_path**: Second output
- **eval_prompt**: What was asked
- **expectations**: Optional assertions

## Process
1. Read both outputs without bias
2. Generate evaluation rubric
3. Score each output
4. Determine winner with reasoning

## Output Schema
{
  "winner": "A" | "B" | "TIE",
  "reasoning": "Why A/B won",
  "rubric": {
    "A": {"score": N, "strengths": [], "weaknesses": []},
    "B": {"score": M, "strengths": [], "weaknesses": []}
  }
}
```

**When to Use:**
- A/B testing outputs
- Skill version comparison
- Unbiased quality assessment

---

## Pattern 3: Analyzer Agent

**Purpose:** Extract insights and patterns from data/results.

**Key Features:**
- Freeform observation output
- Pattern identification
- Actionable suggestions

**Structure:**

```markdown
## Inputs
- **data_path**: Data to analyze
- **context_path**: Background information
- **focus_areas**: What to look for (optional)

## Process
1. Read all data
2. Identify patterns
3. Note anomalies
4. Generate insights

## Output Schema
{
  "observations": ["Insight 1", "Insight 2"],
  "patterns": [
    {"pattern": "X", "evidence": "...", "impact": "high|medium|low"}
  ],
  "suggestions": [
    {"category": "...", "suggestion": "...", "priority": "high|medium|low"}
  ]
}
```

**When to Use:**
- Post-mortem analysis
- Performance diagnosis
- Improvement identification

---

## Pattern 4: Transformer Agent

**Purpose:** Convert data from one format/structure to another.

**Key Features:**
- Clear input/output schemas
- Validation of transformation
- Error handling for edge cases

**Structure:**

```markdown
## Inputs
- **input_path**: Source data
- **input_schema**: Expected input format
- **output_schema**: Target format
- **mapping_rules**: Transformation rules (optional)

## Process
1. Read and validate input
2. Apply transformation rules
3. Validate output schema
4. Write transformed data

## Output Schema
{
  "status": "success" | "partial" | "failed",
  "transformed_path": "path/to/output",
  "errors": [],
  "warnings": []
}
```

**When to Use:**
- Data migration
- Format conversion
- Schema mapping

---

## Pattern 5: Researcher Agent

**Purpose:** Gather and synthesize information on a topic.

**Key Features:**
- Search strategy definition
- Source tracking
- Synthesized findings

**Structure:**

```markdown
## Inputs
- **query**: What to research
- **scope**: Boundaries (files, web, etc.)
- **depth**: How deep to go

## Process
1. Define search strategy
2. Execute searches
3. Evaluate sources
4. Synthesize findings

## Output Schema
{
  "findings": [
    {"claim": "...", "sources": ["..."], "confidence": "high|medium|low"}
  ],
  "sources_consulted": ["..."],
  "gaps": ["What couldn't be found"],
  "summary": "Overall synthesis"
}
```

**When to Use:**
- Documentation lookup
- Best practices research
- Competitive analysis

---

## Pattern 6: Validator Agent

**Purpose:** Check correctness against rules/constraints.

**Key Features:**
- Rule definitions
- Violation detection
- Fix suggestions

**Structure:**

```markdown
## Inputs
- **target_path**: What to validate
- **rules**: Validation rules
- **fix_mode**: Whether to suggest fixes

## Process
1. Load validation rules
2. Check each rule against target
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

**When to Use:**
- Schema validation
- Code style checking
- Compliance verification

---

## Choosing the Right Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│ Need to evaluate quality?           → Grader                    │
│ Need unbiased comparison?           → Comparator                │
│ Need to extract insights?           → Analyzer                  │
│ Need to convert formats?            → Transformer               │
│ Need to gather information?         → Researcher                │
│ Need to check correctness?          → Validator                 │
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
1. Researcher gathers requirements
2. Transformer converts to spec format
3. Validator checks spec completeness
4. Grader evaluates final quality
