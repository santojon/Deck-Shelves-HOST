# Changelog

All notable technical changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.1] - 2026-09-16

### Added

- **Cooperative ownership handshake.** New `HostOwnerKind`, the
  `INJECTED_HOST_GLOBAL` / `FORCE_OWNER_GLOBAL` / `OWNER_GLOBAL` renderer-global
  name constants, and `getInjectedHost()` / `readForcedOwner()` / `readOwner()`
  / `isForcedOwner()` helpers. Lets a host claim a bundle's renderer *alongside*
  a loader rather than instead of it: the loader keeps owning the renderer and
  its other plugins, while the bundle specifically binds to the injected host
  (`getInjectedHost()`, waiting for it to appear if the loader booted the
  bundle first). Owner values are opaque, host-chosen strings — the contract
  never hard-codes any host's or loader's name; only the injected host stamps
  the forced-owner claim, so presence (not the label's value) is what a bundle
  keys on.

## [1.3.0] - 2026-09-14

### Added

- **`HostApi.React` / `HostApi.ReactDOM` / `HostApi.jsx`.** Optional, additive
  handles to the host's React stack, so a bundle's `react` / `react-dom` /
  `jsx-runtime` shims can resolve React from the host (`__SHELVES_HOST__`) instead
  of from loader-published globals — the path a *sole* host (no loader present)
  needs, since no loader is there to publish them. Typed `unknown` and cast at the
  call site, as with `HostUi`. A loader-backed host may omit them and let the
  bundle fall back to the loader's own React globals.
- **`HostApi.updates` (`HostUpdates`).** Optional, additive self-install
  surface: `canSelfInstall()` tells the bundle whether this host can obtain and
  apply an update itself (drives its update button: "Install" vs "Download"),
  and `applyUpdate({ version, assetUrl?, assetName? })` does the actual
  obtain-and-swap, expected to reload once done. A host without this surface
  simply omits it — the bundle falls back to its existing manual-download flow.

## [1.2.0] - 2026-08-23

### Added

- **Coexistence QAM surface.** A host with a native QAM tab may expose its panel
  registration independently of the full `HostApi`, via `window.__SHELVES_QAM__`
  (a `HostQam`). A bundle can register into it to populate that host's tab even
  when the host is NOT the one it selected — i.e. when another loader owns the
  home and `__SHELVES_HOST__` is intentionally left unset so host selection is not
  disturbed. The surface takes no part in host selection. A companion
  `window.__SHELVES_QAM_PENDING__` (`QamPanel[]`) makes registration
  order-independent: a bundle that boots first pushes its panels there and the
  host drains them on install.
- **`QamPanel.content`.** Alongside the framework-agnostic `render(container)`, a
  React-based host may accept a React node (or a zero-arg factory) via an optional
  `content` (typed `unknown`, cast at the call site as with `HostUi`) — rendered
  in the host's own React tree, so the bundle's context providers reach the panel.
  Provide exactly one of `render` / `content`.
- **`QamPanel.icon` and `QamPanel.render` are now optional.** A host with a
  first-class, always-present tab uses its own icon when a panel omits one;
  `render` is optional because `content` is the alternative.

Additive only — no breaking change; hosts and the bundle feature-detect
(`window.__SHELVES_QAM__?.…`, `panel.content ?? panel.render`).

## [1.1.1] - 2026-07-25

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
