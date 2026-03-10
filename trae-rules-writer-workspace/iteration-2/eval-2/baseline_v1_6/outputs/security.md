---
description: Security guidelines - password protection and input validation
alwaysApply: true
---

# Security Rules

## Password Protection
- Never log passwords, API keys, tokens, or secrets
- Use placeholder values like `***` or `[REDACTED]` for sensitive data

## Input Validation
- Validate input at entry points (API endpoints, form handlers)
- Reject invalid input early with clear error messages

## Secrets Management
- Store secrets in environment variables, never hardcode
- Use .env files with .gitignore

## Error Handling
- Never expose stack traces in production errors
