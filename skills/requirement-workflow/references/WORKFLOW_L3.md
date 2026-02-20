# L3: Full Workflow

Complete workflow for complex features and security-sensitive requirements.

## Overview

```
INIT → ANALYZING(ext) → PLANNING(ext) → DESIGNING(ext) → IMPLEMENTING → TESTING → DELIVERING → DONE
```

| Property | Value |
|----------|-------|
| Target Time | > 8 hours (may span multiple days) |
| Outputs | All documents + threat model + approval records |
| Mandatory | Security review, architecture approval |
| Best For | Security features, cross-module refactoring, breaking changes |

## L3 vs L2 Differences

| Stage | L2 | L3 Extended Content |
|-------|----|--------------------|
| ANALYZING | Requirements clarification | + Threat modeling, impact analysis |
| PLANNING | Task planning | + Resource planning, rollback strategy |
| DESIGNING | Technical design | + Architecture review, security review |
| TESTING | Quality checks | + Security testing, penetration testing |
| DELIVERING | Generate report | + Compliance sign-off, approval flow |

## Stages

### Stage 1: INIT → ANALYZING (Extended)

**Trigger:** Workflow initialization complete

**L3 Extended Content:**
1. Standard requirements analysis (same as L2)
2. **Threat Modeling** (STRIDE/DREAD)
3. **Impact Analysis** (which systems/teams affected)
4. **Risk Assessment Matrix**

**Output:**

spec.md (extended):
```markdown
# Requirements: {name}

## Background / Objectives / Scope
{Same as L2}

## Threat Model
| Threat Type | Description | Risk Level | Mitigation |
|-------------|-------------|------------|------------|
| Spoofing | ... | High | ... |
| Tampering | ... | Medium | ... |

## Impact Analysis
- Affected systems: {list}
- Affected teams: {list}
- Data migration required: {yes/no}

## Risk Assessment
| Risk | Probability | Impact | Level | Mitigation |
|------|-------------|--------|-------|------------|
```

**Transition:**
```bash
./scripts/advance-stage.sh -r /project --to ANALYZING
```

### Stage 2: ANALYZING → PLANNING (Extended)

**Trigger:** Requirements analysis and threat modeling complete

**L3 Extended Content:**
1. Standard task planning (same as L2)
2. **Resource Planning** (who needs to participate)
3. **Timeline Estimation**
4. **Dependency Mapping**
5. **Rollback Strategy**

**Output (tasks.md extended):**
```markdown
# Task List

## Resource Requirements
- Development: 2 people
- Security Review: 1 person
- Testing: 1 person

## Timeline
| Phase | Estimated | Owner |
|-------|-----------|-------|
| Design | 2 days | ... |
| Development | 3 days | ... |

## Dependencies
- External: {list}
- Internal: {list}

## Rollback Strategy
1. Detection criteria: {what triggers rollback}
2. Rollback steps: {specific actions}
3. Verification: {how to confirm rollback success}

## Task List
{Detailed tasks}
```

**Transition:**
```bash
./scripts/advance-stage.sh -r /project --to PLANNING
```

### Stage 3: PLANNING → DESIGNING (Extended)

**Trigger:** Planning complete

**L3 Extended Content:**
1. Standard technical design (same as L2)
2. **Architecture Review**
3. **Security Design Review**
4. **Performance Impact Analysis**
5. **Migration Plan** (if applicable)

**Output (design.md extended):**
```markdown
# Technical Design: {name}

## Solution Overview / API Design
{Same as L2}

## Architecture Review
### Security Boundaries
{Trust domain separation}

### Data Flow
{How sensitive data flows}

### Authentication/Authorization
{Access control design}

## Security Controls
| Control | Implementation | Verification |
|---------|----------------|--------------|
| Input validation | ... | ... |
| Encrypted storage | ... | ... |
| Audit logging | ... | ... |

## Performance Impact
- Expected QPS: {value}
- Latency impact: {estimate}
- Resource consumption: {estimate}

## Migration Plan (if applicable)
1. Preparation phase
2. Data migration
3. Cutover verification
4. Rollback plan
```

**Approval Requirements:**
```yaml
required_approvals:
  - role: security_team
    status: pending
  - role: tech_lead  
    status: pending
```

**Transition:**
```bash
./scripts/advance-stage.sh -r /project --to DESIGNING
```

### Stage 4: DESIGNING → IMPLEMENTING

**Trigger:** Design complete **AND** required approvals obtained

**AI Actions:**
1. Confirm all approvals received
2. Execute development tasks per plan
3. Real-time security scanning

**Security Development Requirements:**
- Enable SAST scanning
- Dependency vulnerability check
- Secret leak detection

**Transition:**
```bash
./scripts/advance-stage.sh -r /project --to IMPLEMENTING
```

### Stage 5: IMPLEMENTING → TESTING (Extended)

**Trigger:** Development complete

**L3 Extended Content:**
1. Standard testing (same as L2)
2. **Security Testing**
   - Injection tests (SQL, XSS, CSRF)
   - Authentication bypass tests
   - Privilege escalation tests
3. **Penetration Testing** (assisted)
4. **Performance Testing** (if applicable)

**Output (checklist.md extended):**
```markdown
# Acceptance Checklist

## Functional Verification
{Same as L2}

## Security Verification
- [ ] SAST scan passed
- [ ] DAST scan passed
- [ ] Dependency vulnerability check passed
- [ ] Sensitive data encryption verified
- [ ] Access control tests passed
- [ ] Audit logging verified

## Performance Verification
- [ ] Load testing passed
- [ ] Response time meets target
- [ ] Resource consumption within budget
```

**Transition:**
```bash
./scripts/advance-stage.sh -r /project --to TESTING
```

### Stage 6: TESTING → DELIVERING (Extended)

**Trigger:** All tests (including security tests) passed

**L3 Extended Content:**
1. Generate complete report
2. **Compliance Documentation**
3. **Final Security Sign-off**
4. **Deployment Approval**

**Output:**

artifacts/security_review.md:
```markdown
# Security Review Report

## Review Summary
| Item | Status |
|------|--------|
| Threat modeling | ✅ Complete |
| Security design review | ✅ Passed |
| SAST scan | ✅ No high severity |
| Penetration test | ✅ Passed |

## Issues Found
| Issue | Severity | Status |
|-------|----------|--------|
| {issue_1} | Medium | Fixed |

## Sign-offs
- Security team: _______
- Tech Lead: _______
```

**Transition:**
```bash
./scripts/advance-stage.sh -r /project --to DELIVERING
```

### Stage 7: DELIVERING → DONE

**Trigger:** All sign-offs complete

**AI Actions:**
1. Confirm all approvals
2. Generate final report
3. Archive all documents
4. Mark complete

**Transition:**
```bash
./scripts/advance-stage.sh -r /project --to DONE
```

## Complete Example

### Scenario: Integrate OAuth 2.0 third-party login

```
User: Need to integrate OAuth 2.0 for Google/GitHub login

AI: Security-sensitive feature. Using L3 Full workflow.

📊 Analysis:
- Type: feature
- Level: L3 (Full)
- Security: High
- Impact: Auth system, User module

Initializing workflow...

✅ Workflow: 20240115_001_feature_oauth-integration
📁 .trae/workflow/20240115_001_feature_oauth-integration/

---

[ANALYZING - Extended] Deep requirements analysis

📄 Requirements documented

Threat modeling (STRIDE):
| Threat | Risk | Mitigation |
|--------|------|------------|
| Spoofing | High | Validate OAuth state parameter |
| Tampering | Medium | HTTPS + signature verification |
| Repudiation | Low | Audit logging |
| Info Disclosure | High | Minimal permission scope |
| DoS | Medium | Rate limiting |
| Elevation | High | Strict permission mapping |

Impact analysis:
- Affected systems: Auth Service, User Service, Frontend
- Coordination needed: Backend team, Security team

Advancing to PLANNING...

---

[PLANNING - Extended] Resource and timeline planning

📋 Task planning:
- Design phase: 2 days
- Development phase: 3 days
- Testing phase: 2 days
- Approval: 1 day

Rollback strategy:
- Trigger: Auth failure rate > 1%
- Method: Feature flag disable
- Verification: Original login works

Advancing to DESIGNING...

---

[DESIGNING - Extended] Architecture and security design

📄 design.md created:

Security design:
- OAuth State: encrypted random + timestamp
- Token storage: encrypted in HttpOnly Cookie
- Scope: minimal permissions (email, profile)
- Account binding: requires existing account verification

🔒 Approvals required:
- [ ] Security team review
- [ ] Tech Lead approval

Awaiting approvals...

User: Security team and Tech Lead both approved

AI: Approvals recorded, advancing to implementation...

---

[IMPLEMENTING] Coding

Security scanning enabled:
- ✅ SAST scanner injected
- ✅ Dependency vulnerability detection enabled
- ✅ Secret leak detection enabled

Executing development tasks...
(detailed task execution)

Advancing to TESTING...

---

[TESTING - Extended] Security testing

Standard testing:
- ✅ Unit tests passed
- ✅ Integration tests passed

Security testing:
- ✅ OAuth State validation test
- ✅ CSRF protection test
- ✅ Token security test
- ✅ Privilege escalation test
- ✅ SAST scan no high severity
- ✅ Dependency vulnerability check passed

Advancing to DELIVERING...

---

[DELIVERING - Extended] Compliance sign-off

Generating security review report...

📄 artifacts/security_review.md created

Final sign-offs:
- ✅ Security team: Signed
- ✅ Tech Lead: Signed

Advancing to DONE...

---

[DONE] Workflow complete

✅ OAuth 2.0 integration complete!

📊 Final report:
- Files added: 12
- Files modified: 8
- Security review: Passed
- Test coverage: 82%
- Duration: 5 days

📁 Artifacts:
- spec.md (with threat model)
- design.md (with security design)
- security_review.md
- report.md
```

## Required Approvals

L3 mandatory approval points:

| Stage | Approver | Content |
|-------|----------|---------|
| After DESIGNING | Security team | Security design review |
| After DESIGNING | Tech Lead | Architecture review |
| Before DELIVERING | Security team | Security testing sign-off |
| Before DELIVERING | Product/Compliance | Launch approval (if needed) |

## Quality Gate

L3 complete quality checks:

```yaml
quality_gate:
  lint: required
  type_check: required
  unit_tests: required
  coverage_threshold: 80%
  integration_tests: required
  sast_scan: required
  dependency_scan: required
  security_tests: required
```

## Available Hooks

L3 all hooks:

```
pre_stage_{STAGE}         # Before entering stage
post_stage_{STAGE}        # After completing stage
pre_task_{task_id}        # Before executing task
post_task_{task_id}       # After completing task
quality_gate              # During quality checks
security_review           # During security review
architecture_review       # During architecture review
pre_delivery              # Before delivery
on_blocked                # When blocked
on_error                  # On error
on_approval_required      # When approval needed
```

## Skill Injection

L3 recommended/required skills:

```yaml
hooks:
  post_stage_ANALYZING:
    - skill: threat-modeler
      required: true
      config:
        frameworks: ["STRIDE", "DREAD"]

  post_stage_DESIGNING:
    - skill: security-reviewer
      required: true
      config:
        checks: ["authentication", "authorization", "encryption"]

  pre_stage_IMPLEMENTING:
    - skill: sast-scanner
      required: true
      config:
        rules: ["security"]

  post_stage_IMPLEMENTING:
    - skill: dependency-scanner
      required: true
      config:
        check_vulnerabilities: true

  pre_stage_TESTING:
    - skill: security-test-runner
      required: true
      config:
        types: ["injection", "xss", "csrf"]

  pre_stage_DELIVERING:
    - skill: compliance-checker
      required: true
```

## Blocked Handling

L3 special blocking scenarios:

| Block Reason | Resolution |
|--------------|------------|
| Security review failed | Fix issues and re-review |
| High severity vulnerability found | Stop development, fix immediately |
| Approval timeout | Notify stakeholders, wait or escalate |
| Penetration test found issues | Document and fix, then retest |
