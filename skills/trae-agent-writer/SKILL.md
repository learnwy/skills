---
name: trae-agent-writer
description: Create specialized subagent definitions for AI workflows. Use this skill whenever the user wants to create agents, subagents, autonomous AI workers, specialized evaluators, or any modular AI component that performs a focused task. Also use when you see agents/, discussions about spawning subagents, grading outputs, comparing results, or creating AI workers with specific roles.
---

# Trae Agent Writer

Create well-structured agent definitions that can be spawned as subagents for specialized tasks.

## What is an Agent?

An agent is a **focused, autonomous instruction set** for a subagent to execute a specific task independently. Unlike skills (which are AI capabilities) or rules (which are constraints), agents are:

- **Spawned as subagents** - Run independently with their own context
- **Single-purpose** - Each agent does ONE thing well
- **Stateless** - No memory between invocations
- **Composable** - Can be orchestrated by parent agents/skills

## When to Use

**Invoke when:**
- User wants to create a subagent for a task
- User mentions: "create agent", "subagent", "autonomous worker", "evaluator"
- User needs parallel execution of specialized tasks
- User wants to grade, compare, analyze, or validate outputs independently

**Do NOT invoke when:**
- User wants continuous guidance (use rules instead)
- User wants on-demand capability (use skills instead)
- Task doesn't benefit from independent execution

## Agents vs Skills vs Rules

| Feature      | Rules               | Skills              | Agents                    |
| ------------ | ------------------- | ------------------- | ------------------------- |
| Loading      | Always in context   | On-demand           | Spawned as subagent       |
| Purpose      | Constraints         | Capabilities        | Independent workers       |
| Execution    | Inline guidance     | Inline capability   | Parallel/independent      |
| Memory       | Shared context      | Shared context      | Isolated context          |
| Best For     | "Always do X"       | "When asked, do Y"  | "Go do Z independently"   |

## Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. IDENTIFY → What independent task needs an agent?         │
│ 2. DEFINE   → Role, inputs, process, outputs                │
│ 3. DESIGN   → Step-by-step instructions                     │
│ 4. CREATE   → Write agent.md following the pattern          │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Identify Agent Opportunity

Good candidates for agents:

| Pattern                    | Why It's a Good Agent               | Example                       |
| -------------------------- | ----------------------------------- | ----------------------------- |
| Evaluation/grading         | Needs objectivity, isolation        | Output grader, test validator |
| Comparison                 | Blind comparison prevents bias      | A/B comparator                |
| Analysis                   | Deep dive without losing context    | Performance analyzer          |
| Transformation             | Parallel processing                 | File converter, data mapper   |
| Research                   | Independent investigation           | Documentation researcher      |

**Anti-patterns (don't make agents for):**
- Simple inline tasks (no isolation benefit)
- Tasks requiring conversation history
- Single-step operations

## Step 2: Define Agent Components

Every agent needs:

| Component    | Description                                         | Example                             |
| ------------ | --------------------------------------------------- | ----------------------------------- |
| **Role**     | One-sentence purpose                                | "Grade outputs against assertions"  |
| **Inputs**   | What the agent receives when spawned                | `transcript_path`, `expectations`   |
| **Process**  | Step-by-step execution guide                        | Step 1: Read, Step 2: Evaluate...   |
| **Outputs**  | What the agent produces                             | `grading.json` with specific schema |
| **Guidelines**| Behavioral constraints                             | "Be objective", "Cite evidence"     |

## Step 3: Design Agent Structure

### Standard Agent Format

```markdown
# {Agent Name} Agent

{One-sentence role description}

## Role

{Expanded role explanation - what this agent does and why}

## Inputs

You receive these parameters in your prompt:

- **param_name**: Description of what this contains
- **another_param**: Description

## Process

### Step 1: {First Action}

1. Do this
2. Then this
3. Note any issues

### Step 2: {Second Action}

...

### Step N: Write Results

Save results to `{output_path}`.

## Output Format

Write a JSON file with this structure:

```json
{
  "field": "value",
  "nested": {
    "field": "value"
  }
}
```

## Guidelines

- **Be specific**: Actionable advice
- **Be objective**: Avoid bias
- ...
```

## Step 4: Create the Agent

### Location

Agents typically live in:
- `skill-name/agents/` - Inside skills that orchestrate them
- `.trae/agents/` - Project-level reusable agents
- `~/.trae/agents/` - Global reusable agents

### Key Principles

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. SINGLE PURPOSE - One agent, one job                           │
│ 2. CLEAR INPUTS - Agent must know exactly what it receives       │
│ 3. STRUCTURED OUTPUT - JSON with defined schema                  │
│ 4. STEP BY STEP - Break process into discrete steps              │
│ 5. EVIDENCE-BASED - Require citations/quotes in output           │
└──────────────────────────────────────────────────────────────────┘
```

## Example: Creating a Grader Agent

```
User: "I need an agent to grade code review outputs"

1. Identifying opportunity:
   - Task: Evaluate code review quality
   - Why agent: Needs objectivity, isolation from reviewer
   - Benefit: Can run multiple graders in parallel

2. Defining components:
   - Role: Grade code review outputs against expectations
   - Inputs: review_path, expectations[], rubric_path
   - Process: Read review → Check expectations → Score rubric → Output grades
   - Output: grading.json with pass/fail and evidence

3. Creating agent:

📁 skill-name/agents/

📄 review-grader.md
# Review Grader Agent

Evaluate code review outputs against quality expectations.

## Role

The Review Grader assesses code reviews for completeness, accuracy, and helpfulness. It operates blindly (doesn't know which reviewer produced the output) to prevent bias.

## Inputs

You receive these parameters in your prompt:

- **review_path**: Path to the code review output file
- **expectations**: List of expected findings/behaviors
- **code_path**: Path to the original code being reviewed

## Process

### Step 1: Read the Review

1. Read the review file completely
2. Note the structure, findings, and recommendations
3. Extract all claims made by the reviewer

### Step 2: Verify Claims Against Code

For each claim in the review:
1. Locate the relevant code section
2. Verify if the claim is accurate
3. Note false positives or missed issues

### Step 3: Check Expectations

For each expectation:
1. Search for evidence in the review
2. Mark PASS if clearly addressed
3. Mark FAIL if missing or incorrect
4. Cite specific evidence

### Step 4: Score Quality

Evaluate overall quality:
- Completeness (found all issues?)
- Accuracy (claims are correct?)
- Helpfulness (actionable feedback?)

### Step 5: Write Results

Save to `{output_dir}/grading.json`

## Output Format

```json
{
  "expectations": [
    {
      "text": "Review identifies the SQL injection risk",
      "passed": true,
      "evidence": "Line 45: 'WARNING: SQL injection vulnerability in user input'"
    }
  ],
  "quality": {
    "completeness": 8,
    "accuracy": 9,
    "helpfulness": 7,
    "overall": 8.0
  },
  "false_positives": [],
  "missed_issues": ["Buffer overflow in line 102 not mentioned"],
  "summary": {
    "passed": 4,
    "failed": 1,
    "pass_rate": 0.80
  }
}
```

## Guidelines

- **Be objective**: Don't favor verbose or brief reviews
- **Cite evidence**: Quote specific text for each verdict
- **Verify claims**: Don't trust claims without checking code
- **Identify gaps**: Note what the review missed
```

## Common Agent Patterns

| Pattern      | Purpose                          | Key Features                        |
| ------------ | -------------------------------- | ----------------------------------- |
| Grader       | Evaluate outputs                 | Expectations, evidence, pass/fail   |
| Comparator   | Compare two outputs              | Blind comparison, rubric scoring    |
| Analyzer     | Deep analysis of results         | Insights, patterns, improvements    |
| Transformer  | Convert data/formats             | Input schema, output schema         |
| Researcher   | Gather information               | Search strategy, synthesis          |
| Validator    | Check correctness                | Rules, violations, fixes            |

## Best Practices

**DO:**
- Give agents ONE clear purpose
- Define exact input parameters
- Specify JSON output schema with examples
- Break process into numbered steps
- Include guidelines for edge cases
- Require evidence/citations in output

**DON'T:**
- Combine multiple purposes in one agent
- Leave inputs vague ("receives context")
- Allow freeform output structure
- Write prose without steps
- Assume agent remembers previous runs
- Skip the guidelines section

## References

For detailed patterns, read:
- [Agent Patterns](references/agent-patterns.md) - Common agent archetypes
- [Grader Example](examples/grader-agent.md) - Complete grader agent
- [Agent Template](assets/agent.md.template) - Starter template
