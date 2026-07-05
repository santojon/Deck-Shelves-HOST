# Release Notes

User-facing notes for each release. Entries here are extracted verbatim into the
GitHub Release body at tag time.

## [Unreleased]

## [1.1.0] - 2026-07-05

- **First cut of the host contract.** `@deck-shelves/host` is the `HostApi`
  types both host adapters (Decky + the standalone Shelves Loader) and the Deck
  Shelves bundle build against — a single source of truth replacing the two
  divergent copies that live in the plugin and the loader today. **Types only**;
  the injected host runtime (Steam UI + QAM tab) lives in the Shelves Loader.
- Still to do: reconcile the `ShelfSource` / rich `platform` types against the
  plugin's `src/types.ts`, and extract this package into its own repository +
  submodule.
