# @deck-shelves/host

<div align="center">

<p>
  <img src="assets/logo.svg" alt="@deck-shelves/host" width="352">
</p>

[![CI](https://github.com/santojon/Deck-Shelves-HOST/actions/workflows/ci.yml/badge.svg)](https://github.com/santojon/Deck-Shelves-HOST/actions/workflows/ci.yml)
[![Release](https://github.com/santojon/Deck-Shelves-HOST/actions/workflows/release.yml/badge.svg)](https://github.com/santojon/Deck-Shelves-HOST/actions/workflows/release.yml)
[![npm version](https://img.shields.io/npm/v/@deck-shelves/host?logo=npm&color=cb3837)](https://www.npmjs.com/package/@deck-shelves/host)
[![npm downloads](https://img.shields.io/npm/dt/@deck-shelves/host?label=downloads&logo=npm&color=blue)](https://www.npmjs.com/package/@deck-shelves/host)
[![npm monthly](https://img.shields.io/npm/dm/@deck-shelves/host?label=monthly&logo=npm&color=blue)](https://www.npmjs.com/package/@deck-shelves/host)
[![Tests](https://img.shields.io/badge/tests-7%20passed-brightgreen?logo=vitest&logoColor=white)](src/contract/index.test.ts)
[![Types](https://img.shields.io/npm/types/@deck-shelves/host?logo=typescript&logoColor=white)](src/contract/index.ts)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@deck-shelves/host?label=minzip&color=blue)](https://bundlephobia.com/package/@deck-shelves/host)
[![License](https://img.shields.io/npm/l/@deck-shelves/host?color=blue)](LICENSE)
[![Node](https://img.shields.io/node/v/@deck-shelves/host?logo=node.js&logoColor=white)](package.json)
[![Platform](https://img.shields.io/badge/platform-SteamOS%20%C2%B7%20Linux%20%C2%B7%20macOS%20%C2%B7%20Windows-purple?logo=steamdeck&logoColor=white)](https://github.com/ValveSoftware/SteamOS)
[![Deck Shelves](https://img.shields.io/badge/host-Deck%20Shelves-purple)](https://github.com/santojon/Deck-Shelves)
[![Forks](https://img.shields.io/github/forks/santojon/Deck-Shelves-HOST?style=flat&color=blue)](https://github.com/santojon/Deck-Shelves-HOST/network/members)
[![Clones](https://img.shields.io/endpoint?url=https%3A%2F%2Fsantojon.github.io%2FDeck-Shelves%2Fstats%2Fclones-host.json)](https://github.com/santojon/Deck-Shelves-HOST/graphs/traffic)
[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?logo=github&logoColor=white)](https://github.com/sponsors/santojon)
[![Ko-fi](https://img.shields.io/badge/Support%20me%20on%20Ko--fi-F16061?logo=ko-fi&logoColor=white)](https://ko-fi.com/santojon)

</div>

The **host contract** for [Deck Shelves](https://github.com/santojon/Deck-Shelves) —
the `HostApi` types that both host implementations and the bundle build against.

It is the boundary between a *host* and the Deck Shelves bundle. Each host
ships its own adapter in the plugin — one file per host,
`runtime/host/<host>.ts` — and every adapter fulfils this same contract, so
the bundle's call sites never depend on a specific host and new hosts can be
added without touching the bundle.

> **Types only.** A host's *runtime* — for external hosts, the injected
> `window.__SHELVES_HOST__` that locates Steam's UI components and adds the
> Quick Access Menu tab — lives in that host's own project, not here. This
> package is just the interface both sides agree on.

> **Coexistence.** A host with a native QAM tab may also expose its panel
> registration on `window.__SHELVES_QAM__` (a `HostQam`), independently of the
> full `HostApi` — so a bundle can populate that host's tab even when *another*
> host owns the home (and `__SHELVES_HOST__` is left unset). Both globals are
> declared in the contract.

It is **not** `@deck-shelves/api` — that package is the public *extension* API
consumed by third-party plugins (`window.deckShelves`). This one is the
host↔bundle contract, a different audience.

## What's inside

| Path | What it is |
|---|---|
| `src/contract/` | **`HostApi` types** (`HOST_API_VERSION`, `lifecycle`, `rpc`, `ui`, `routes`, `notifications`, `platform`, optional `React`/`ReactDOM`/`jsx`, `qam`, `mainMenu`, `updates`). The single source of truth both hosts and the bundle build against. |

## Usage

```ts
import { HOST_API_VERSION, type HostApi } from "@deck-shelves/host";
```

## Build

```
pnpm install
pnpm build      # tsup → dist/index.{js,cjs,d.ts}
pnpm check      # typecheck + lint + test
```

## License

[MIT](LICENSE) © [santojon](https://github.com/santojon)
