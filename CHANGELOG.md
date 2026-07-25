# Changelog

All notable technical changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **`mainMenu` capability** — a new optional, additive `HostApi.mainMenu`
  namespace (`registerEntry({ id, title, icon, route | onSelect })`) for hosts
  that can place an entry in the Steam Main Menu (left rail). Navigational,
  mirroring `qam`. Unlike the QAM tab, a host must show a Main Menu entry only
  while it has content (at least one registered entry).
- Clarified that the `qam` tab may be a first-class, always-present surface,
  whereas `mainMenu` is content-conditional.

Additive only — no breaking change; hosts and the bundle feature-detect
(`host.qam?.…`, `host.mainMenu?.…`).

## [1.1.0] - 2026-07-05

### Added

- **Initial scaffold** of the host package, incubated inside the Deck Shelves
  monorepo (like `api/` and `deckprobe/`) to later be extracted into its own
  repository.
- **`src/contract/`** — the unified `HostApi` contract (`HOST_API_VERSION`
  `1.1.0`): `lifecycle`, `rpc`, `ui`, `routes`, `notifications`, `platform`, and
  an optional `qam` namespace. Single source of truth consumed by both host
  adapters (one adapter per host) and the bundle. Typechecks clean.
- **Governance** — README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, LICENSE, CI,
  and dual ESM/CJS build (`tsup`) matching the other packages.

### Notes

- **Types-only package.** The injectable host *runtime* (`window.__SHELVES_HOST__`
  — Steam UI location + the QAM tab) lives in each host's own project, not here; this
  package is just the contract. (An earlier scaffold carried a runtime seed +
  its own NOTICE; both were removed once the runtime's home was settled as the
  loader.)
