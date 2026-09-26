# Release Notes

User-facing notes for each release. Entries here are extracted verbatim into the
GitHub Release body at tag time.

## [Unreleased]

## [1.4.0] - 2026-09-26

- **Clean hot-swap teardown.** A host can now call `teardown()` to dispose a
  bundle instance itself before swapping a new one in, instead of leaving that
  entirely up to the bundle's own convention — closes the class of bug where
  two instances of the same bundle end up alive at once after an in-place
  update.
- **Host handshake.** A bundle can now ask its host who it is, which contract
  version it implements, and what it supports, in one call (`handshake()`)
  instead of checking each capability separately.

## [1.3.2] - 2026-09-22

- **Version-aware ownership tracking.** The renderer-ownership handshake
  between a bundle and its host now also carries a version identity, making
  it possible to tell mismatched host/bundle versions apart.

## [1.3.1] - 2026-09-16

- **Cooperative ownership.** A host can now claim a bundle's renderer
  alongside a loader instead of only in its place — the loader keeps its
  other plugins running as usual, while a bundle that opts in binds
  specifically to that host.

## [1.3.0] - 2026-09-14

- **React stack on the host.** A host can now expose its React / ReactDOM /
  jsx-runtime (`HostApi.React` / `ReactDOM` / `jsx`), so a bundle running under a
  *sole* host (no loader present) resolves React from the host instead of from
  loader-published globals. Optional and feature-detected — a loader-backed host
  omits them and the bundle uses the loader's own React globals.
- **Self-install updates.** A host can now tell the bundle it can obtain and
  apply its own updates (`HostApi.updates`), so the bundle's update button reads
  "Install" instead of "Download" and hands the update off directly. Optional —
  a host without this just gets the existing manual-download flow.

## [1.2.0] - 2026-08-23

- **Coexistence-friendly QAM.** A host can surface its own Quick Access tab even
  when it isn't the host a bundle selected (another loader owns the home): the
  bundle registers into `window.__SHELVES_QAM__`, a host-selection-neutral surface,
  with an order-independent pending queue (`__SHELVES_QAM_PENDING__`). React-based
  hosts can also hand a panel a React node (`QamPanel.content`) instead of an
  imperative `render`, and a panel may omit its icon to fall back to the host's own
  tab icon. Additive — hosts and the bundle feature-detect.

## [1.1.0] - 2026-07-05

- **First cut of the host contract.** `@deck-shelves/host` is the `HostApi`
  types both host adapters (one adapter per host) and the Deck
  Shelves bundle build against — a single source of truth replacing the two
  divergent copies that live in the plugin and the loader today. **Types only**;
  the injected host runtime (Steam UI + QAM tab) lives in each host's own project.
- Still to do: reconcile the `ShelfSource` / rich `platform` types against the
  plugin's `src/types.ts`, and extract this package into its own repository +
  submodule.
