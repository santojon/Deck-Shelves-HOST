# @deck-shelves/host

The **host contract** for [Deck Shelves](https://github.com/santojon/Deck-Shelves) —
the `HostApi` types that both host implementations and the bundle build against.

It is the boundary between a *host* and the Deck Shelves bundle:

- the plugin's **Decky** adapter (`runtime/host/decky.ts`), and
- the standalone adapter (`runtime/host/standalone.ts`),
which wraps the loader-injected `window.__SHELVES_HOST__` runtime.

Both fulfil the same contract, so the bundle's call sites never depend on a
specific host.

> **Types only.** The standalone host *runtime* — the injected
> `window.__SHELVES_HOST__` that locates Steam's UI components and adds the
> Quick Access Menu tab — lives in the **Shelves Loader**, not here. This
> package is just the interface both sides agree on.

It is **not** `@deck-shelves/api` — that package is the public *extension* API
consumed by third-party plugins (`window.deckShelves`). This one is the
host↔bundle contract, a different audience.

## What's inside

| Path | What it is |
|---|---|
| `src/contract/` | **`HostApi` types** (`HOST_API_VERSION`, `lifecycle`, `rpc`, `ui`, `routes`, `notifications`, `platform`, optional `qam`). The single source of truth both hosts and the bundle build against. |

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
