# Contributing to @deck-shelves/host

Thank you for your interest in contributing! This guide covers the development
setup, coding conventions, and how to submit changes.

This package holds the **host contract** (the `HostApi` types) and the
**injectable host runtime** for [Deck Shelves](https://github.com/santojon/Deck-Shelves).
Issues with the **plugin itself** belong in the plugin repo, not here.

## Prerequisites

- **Node.js** 20 or later
- **pnpm** 10 or later (`corepack enable` will provision the pinned version)

## Supported platforms

The dev / build / test flows are pure Node and run on **Linux, macOS, and
Windows**.

| Workflow                                       | Linux | macOS | Windows |
|------------------------------------------------|:-----:|:-----:|:-------:|
| `pnpm install`                                 |  ✅   |  ✅   |   ✅    |
| `pnpm run build`                               |  ✅   |  ✅   |   ✅    |
| `pnpm run typecheck`                           |  ✅   |  ✅   |   ✅    |
| `pnpm run test`                                |  ✅   |  ✅   |   ✅    |
| `pnpm run lint`                                |  ✅   |  ✅   |   ✅    |
| `pnpm run check` (typecheck + lint + test)     |  ✅   |  ✅   |   ✅    |

## Getting Started

1. Fork and clone the repository.
2. Install dependencies:

   ```bash
   corepack enable
   pnpm install
   ```

3. Run the full local check:

   ```bash
   pnpm run check
   ```

## Project Structure

```
src/contract/index.ts       Public entry: HOST_API_VERSION + HostApi types
src/contract/index.test.ts  Vitest suite for the contract shape
tsup.config.ts              Dual ESM + CJS + .d.ts build config
eslint.config.js            Lint rules (flat config)
vitest.config.ts            Test runner config
.github/workflows/          CI
```

## Code Style

- **Indentation**: 2 spaces
- **Semicolons**: always
- **Quotes**: double quotes for strings
- **Naming**: `camelCase` for variables/functions, `PascalCase` for types
- **TypeScript**: avoid `any` — use proper types or `unknown`
- **Dependencies**: the published contract must stay **dependency-free**
- **Contract**: additive-only after 1.0.0; breaking changes need a major bump
  and coordination with the plugin and the loader
- **Comments**: only where the logic is not self-evident

Run `pnpm run lint:fix` to auto-fix what's fixable.

## Scripts

| Script                  | What it does                                        |
|-------------------------|-----------------------------------------------------|
| `pnpm run build`        | Build the contract into `dist/` (ESM + CJS + .d.ts)  |
| `pnpm run typecheck`    | `tsc --noEmit`                                       |
| `pnpm run lint`         | ESLint over `src/`                                   |
| `pnpm run test`         | Vitest (run mode)                                   |
| `pnpm run check`        | typecheck + lint + test (the pre-PR gate)           |
| `pnpm run release:dry`  | clean → check → build → `pnpm pack --dry-run`       |

## Submitting Changes

1. Branch off `main`.
2. Make your change and add/update tests.
3. Run `pnpm run check` — it must pass.
4. Add entries under `## [Unreleased]` in **both** `CHANGELOG.md` (technical)
   and `RELEASE_NOTES.md` (user-facing).
5. Open a PR. **The PR title must start with a tag** — this drives the automatic
   version bump when the PR merges:

   | Tag             | Bump  | Use for                          |
   |-----------------|-------|----------------------------------|
   | `[FIX]`         | patch | Bug fix                          |
   | `[ENHANCEMENT]` | patch | Small improvement                |
   | `[PERF]`        | patch | Performance improvement          |
   | `[QA]`          | patch | Tests / tooling                  |
   | `[FEATURE]`     | minor | New feature                      |
   | `[CLEANUP]`     | minor | Code cleanup                     |
   | `[REFACTOR]`    | major | Refactor / **breaking change**   |

## Release Flow

Releases follow the same automated flow as the other Deck Shelves packages: a
tagged PR merges to `main`, a bump workflow computes the new version from the PR
title and updates `package.json` + `CHANGELOG.md` + `RELEASE_NOTES.md`, and a
release workflow publishes to npm and cuts a GitHub Release. (The publish
workflows are wired when this package is extracted into its own repository.)
