# Changelog

All notable technical changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-07-05

### Added

- **Initial scaffold** of the host package, incubated inside the Deck Shelves
  monorepo (like `api/` and `deckprobe/`) to later be extracted into its own
  repository.
- **`src/contract/`** — the unified `HostApi` contract (`HOST_API_VERSION`
  `1.1.0`): `lifecycle`, `rpc`, `ui`, `routes`, `notifications`, `platform`, and
  an optional `qam` namespace. Single source of truth consumed by both host
  adapters (Decky + standalone Shelves Loader) and the bundle. Typechecks clean.
- **Governance** — README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, LICENSE, CI,
  and dual ESM/CJS build (`tsup`) matching the other packages.

### Notes

- **Types-only package.** The injectable host *runtime* (`window.__SHELVES_HOST__`
  — Steam UI location + the QAM tab) lives in the Shelves Loader, not here; this
  package is just the contract. (An earlier scaffold carried a runtime seed +
  its own NOTICE; both were removed once the runtime's home was settled as the
  loader.)
