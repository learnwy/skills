# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

All project conventions, skill inventory, and development guidelines are maintained in [AGENTS.md](AGENTS.md). Refer to that file for:

- Repository structure and current skills inventory
- Skill specification (directory layout, frontmatter, progressive disclosure)
- Development guidelines (creating skills, code style, testing)
- Common workflows (methodology analysis, knowledge management, project extensions)

## Quick Reference

- **13 skills** in `skills/` directory, each with a `SKILL.md`
- **10 universal agents** in `agents/` directory
- **No comments** in code unless explicitly requested
- **English** for all skill documents
- **Package manager**: pnpm (`pnpm install`, `pnpm run check`, `pnpm run release`)
- **Scripts**: TypeScript in `src/<skill>/{cli,cmd/,lib/,hooks/}`, bundled to CJS in `skills/<skill>/scripts/{cli.cjs, hooks/<event>.cjs}` via rslib's auto-scanner
