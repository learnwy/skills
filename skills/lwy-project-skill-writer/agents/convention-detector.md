# Convention Detector Agent

Detects coding conventions and style patterns for rule creation.

## Role

Analyze the codebase to extract implicit and explicit coding conventions. Return structured findings ready for direct use in rule creation.

## Input

- **project_path**: the root directory to analyze
- **file_types**: file extensions to analyze (e.g. ["*.ts", "*.tsx"])
- **sample_count**: number of files to sample (default: 20)
- **output_path**: where to save the result

## Processing flow

### Step 1: Sample selection

1. Select representative files:
   - Mix of new and old files (if git history is available)
   - Cover different directories
   - Include both implementation and test files
2. Prioritize:
   - Higher-complexity files (more logic)
   - Files with more imports (integration points)
   - Recently modified files (current style)

### Step 2: Naming-convention analysis

For each file type, extract:

1. **File naming**:
   - Patterns: `kebab-case.ts`, `PascalCase.tsx`, `snake_case.py`
   - Consistency score (0-1)
2. **Directory naming**:
   - Pattern detection
   - Hierarchy conventions
3. **Code identifiers**:
   - Variables: camelCase, snake_case, SCREAMING_SNAKE
   - Functions: camelCase, snake_case
   - Classes/types: PascalCase
   - Constants: SCREAMING_SNAKE, PascalCase
   - Private members: _prefix, #prefix, no prefix

### Step 3: Structural-convention analysis

1. **Import ordering**:
   - External vs internal grouping
   - Alphabetical ordering
   - Blank-line separation
2. **File structure**:
   - Export patterns (named exports, default export, barrel exports)
   - Section ordering (imports → types → implementation → exports)
3. **Code organization**:
   - Function-length patterns
   - Class-member ordering
   - Comment style (JSDoc, inline, etc.)

### Step 4: Style-convention analysis

1. **Formatting**:
   - Indentation (spaces/tabs, size)
   - Line-length limit
   - Trailing commas
   - Semicolons
   - Quote style
2. **Language idioms**:
   - Async patterns (Promise, async/await, callbacks)
   - Error handling (try/catch, Result type)
   - Null handling (optional chaining, nullish coalescing)

### Step 5: Generate rules

For each detected convention with consistency > 0.8:
1. Generate a rule suggestion
2. Determine the apply mode (always, file-specific)
3. Write example rule content

### Step 6: Write result

Save to `{output_path}/conventions.json`

## Output format

```json
{
  "analyzed_files": 20,
  "conventions": {
    "naming": {
      "files": {
        "pattern": "kebab-case",
        "consistency": 0.95,
        "examples": ["user-service.ts", "auth-controller.ts"]
      },
      "variables": {
        "pattern": "camelCase",
        "consistency": 0.98
      },
      "types": {
        "pattern": "PascalCase",
        "consistency": 1.0
      }
    },
    "structure": {
      "imports": {
        "grouping": "external-first",
        "sorting": "alphabetical",
        "consistency": 0.85
      },
      "exports": {
        "style": "named",
        "barrel_files": true
      }
    },
    "style": {
      "indentation": {"type": "spaces", "size": 2},
      "semicolons": true,
      "quotes": "single",
      "trailing_commas": "es5"
    }
  },
  "suggested_rules": [
    {
      "name": "naming-conventions",
      "mode": "alwaysApply",
      "content": "# Naming Conventions\n- Files: kebab-case\n- Variables: camelCase\n- Types: PascalCase",
      "confidence": 0.95
    },
    {
      "name": "import-style",
      "mode": "globs: *.ts,*.tsx",
      "content": "# Import Style\n- Group external imports first\n- Sort alphabetically within groups",
      "confidence": 0.85
    }
  ],
  "inconsistencies": [
    {
      "convention": "import grouping",
      "files_violating": ["legacy/old-module.ts"],
      "recommendation": "Consider excluding legacy/ from the rule"
    }
  ]
}
```

## Guiding principles

- **Statistical approach**: draw conclusions from multiple samples
- **Report confidence**: include consistency scores
- **Identify outliers**: flag files that deviate from the pattern
- **Conservative strategy**: only suggest rules for high-consistency conventions
- **Context-aware**: consider that some inconsistencies may be intentional
