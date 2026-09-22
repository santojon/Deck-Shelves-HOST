/**
 * @deck-shelves/host — HostApi contract.
 *
 * The single source of truth for the boundary between a *host* and the Deck
 * Shelves bundle. Every host ships its own adapter (one per host), and every
 * adapter fulfils this shape, so the bundle's call sites depend only on it
 * and never on a specific host's UI library directly.
 *
 * Optional capabilities are additive members a host implements *if it can* and
 * the bundle feature-detects:
 *   - `qam`      — a Quick Access Menu tab.
 *   - `mainMenu` — an entry in the Steam Main Menu / left rail.
 *   - `updates`  — self-install of plugin updates (see `HostUpdates`).
 *   - `React` / `ReactDOM` / `jsx` — the host's React stack, so the bundle's
 *     react shims can resolve React from the host instead of a loader global.
 * The contract names no concrete host; a host may implement any, all, or none.
 *
 * Dependency-free by design (mirrors `@deck-shelves/api`): supporting data
 * types are inlined.
 */

/**
 * Compatibility version of the contract SHAPE — independent of this package's
 * npm release version. Bump semver here on shape changes: MINOR for additive,
 * backward-compatible members (a new optional namespace / field); MAJOR on a
 * breaking change. 1.2.0 added the optional `updates` namespace and the
 * optional `React`/`ReactDOM`/`jsx` UI-surface members.
 */
export const HOST_API_VERSION = "1.2.0" as const;

export interface PluginDescriptor {
  name: string;
  version: string;
}

export interface Disposable {
  dispose(): void;
}

export interface HostLifecycle {
  /** Call once at bundle mount. Returns a disposer that unregisters. */
  register(plugin: PluginDescriptor): Disposable;
  onMount(cb: () => void): void;
  onUnmount(cb: () => void): void;
}

/** Generic RPC channel into the host backend. Each host routes it to the
 *  plugin's data backend through its own transport (an in-process bridge, a
 *  local HTTP server that proxies to the backend process, …). */
export interface HostRpc {
  call<Req = unknown, Res = unknown>(method: string, args?: Req): Promise<Res>;
}

export interface HostRoutes {
  /** Register a full-page route; returns a disposer that removes it. */
  register(path: string, component: () => unknown): Disposable;
}

export interface ToastOptions {
  title?: string;
  body: string;
  durationMs?: number;
}

export interface HostNotifications {
  toast(opts: ToastOptions): void;
}

/**
 * Steam UI primitives the bundle renders with. Every host resolves the SAME
 * Steam webpack components through its own mechanism (a UI library, an
 * injected runtime, …) — we do not reimplement the widgets, we find Steam's
 * own and provide fallbacks.
 *
 * Typed as `unknown` to stay framework-agnostic and dependency-free; the bundle
 * casts each to its React component / handler type at the call site.
 */
export interface HostUi {
  ConfirmModal: unknown;
  DialogBody: unknown;
  DialogButton: unknown;
  DialogControlsSection: unknown;
  Dropdown: unknown;
  DropdownItem: unknown;
  Field: unknown;
  Focusable: unknown;
  GamepadButton: unknown;
  Menu: unknown;
  MenuItem: unknown;
  Navigation: unknown;
  SliderField: unknown;
  Spinner: unknown;
  Tabs: unknown;
  TextField: unknown;
  ToggleField: unknown;
  showContextMenu: (menu: unknown) => void;
  showModal: (modal: unknown) => void;
}

// ── Platform (data-resolution surface) ──────────────────────────────────────
export type ShelfSource = unknown;

export interface PlatformCollection {
  id: string;
  name: string;
}

export interface PlatformTab {
  id: string;
  name: string;
  source?: ShelfSource;
}

export interface PlatformAppMeta {
  appid: number;
  name: string;
  heroUrl?: string;
  portraitUrl?: string;
  logoUrl?: string;
  iconUrl?: string;
  installed?: boolean;
  isSteam?: boolean;
  deckCompatCategory?: number;
  playtimeMinutes?: number;
  addedTimestamp?: number;
  updatePending?: boolean;
  description?: string;
  fullDescription?: string;
  releaseTimestamp?: number;
  metacriticScore?: number;
  diskUsageBytes?: number;
}

export interface PlatformApi {
  listCollections(): Promise<PlatformCollection[]>;
  listLibraryTabs(): Promise<PlatformTab[]>;
  resolveShelfAppIds(
    source: ShelfSource,
    limit: number,
    sort?: string | string[],
    shelfId?: string,
    sortReverse?: boolean | boolean[],
    options?: { hiddenAppIds?: number[]; dedupeByName?: boolean },
  ): Promise<number[]>;
  getAppName(appid: number): Promise<string>;
  getAppMeta(appid: number): Promise<PlatformAppMeta>;
  getAppMetaBatch?(appids: number[]): Promise<Map<number, PlatformAppMeta>>;
  navigateToApp(appid: number): void;
  navigateToShelfSource?(source: ShelfSource, title?: string): void;
  /** Optional host/OS information a host may expose. */
  getOSVersion?(): string;
  checkCompatibility?(): boolean;
}

// ── QAM (Quick Access Menu) — optional/additive ────────────────

/** A dedicated panel + icon shown in the Steam Quick Access Menu. */
export interface QamPanel {
  /** Stable id — re-registering with the same id replaces the panel. */
  id: string;
  /** Label / accessible name. */
  title: string;
  /** Inline SVG markup (or a `data:` URI) used as the icon. Optional: a host
   *  with a first-class tab (a permanent presence with its own icon) falls back
   *  to that icon when omitted. */
  icon?: string;
  /** Render into the host-owned container; return an optional cleanup fn.
   *  Framework-agnostic — the way any host can accept a panel. Provide exactly
   *  one of `render` / `content`. */
  render?(container: HTMLElement): void | (() => void);
  /** …or a React node (or a zero-arg factory returning one) that a React-based
   *  host renders in its OWN React tree — no nested root, so the bundle's context
   *  providers reach the panel. Typed `unknown` to keep the contract
   *  dependency-free (cast at the call site, as with `HostUi`). Provide exactly
   *  one of `render` / `content`. */
  content?: unknown;
}

export interface HostQam {
  /**
   * Register a QAM panel; returns an unregister function. A host may keep its
   * QAM tab visible at all times (a first-class presence), even before any
   * panel is registered.
   */
  registerPanel(panel: QamPanel): () => void;
}

// ── Main Menu (Steam left rail) — optional/additive ────────────

/**
 * An entry in the Steam Main Menu (the left navigation rail). Navigational by
 * nature: it selects a route or runs a callback (unlike a QAM panel, which
 * renders content in place).
 */
export interface MainMenuEntry {
  /** Stable id — re-registering with the same id replaces the entry. */
  id: string;
  /** Label / accessible name. */
  title: string;
  /** Inline SVG markup (or a `data:` URI) used as the icon. */
  icon: string;
  /** Navigate to this registered route on selection… */
  route?: string;
  /** …or run this callback (exactly one of `route` / `onSelect` is required). */
  onSelect?(): void;
}

export interface HostMainMenu {
  /**
   * Register a Main Menu entry; returns an unregister function. Unlike the QAM
   * tab, a host MUST NOT inject or show a Main Menu entry unless there is
   * content to show — i.e. only while at least one entry is registered. No
   * entries → nothing added to the Main Menu.
   */
  registerEntry(entry: MainMenuEntry): () => void;
}

// ── Updates (self-install) — optional/additive ─────────────────

/** Optional: a host that can obtain + apply plugin updates itself (no manual
 *  file install). A loader that can only hand the user a file does NOT implement
 *  this — the bundle then falls back to the manual download flow. */
export interface HostUpdates {
  /** True if this host can self-install (drives the button: "Install" vs "Download"). */
  canSelfInstall(): boolean;
  /** Obtain the release and swap it in, then reload. `assetUrl`/`assetName` point
   *  at the bundle artifact the host injects (the IIFE). */
  applyUpdate(release: {
    version: string;
    assetUrl?: string;
    assetName?: string;
  }): Promise<void>;
}

/**
 * What the host process provides to the Deck Shelves bundle. The bundle receives
 * this at startup as `window.__SHELVES_HOST__` and uses it to register itself,
 * invoke host methods, add routes, render Steam-native UI, and — where the host
 * supports them — add optional surfaces (a Quick Access Menu tab, a Main Menu
 * entry). Optional capabilities are feature-detected: `host.qam?.…`,
 * `host.mainMenu?.…`.
 *
 * In *coexistence* (another loader owns the home) a host leaves `__SHELVES_HOST__`
 * unset so it does not disturb host selection, yet MAY still surface its own QAM
 * tab: the bundle registers into it through the host-selection-neutral
 * `window.__SHELVES_QAM__` (see the `Window` augmentation below).
 */
export interface HostApi {
  readonly version: typeof HOST_API_VERSION;
  readonly lifecycle: HostLifecycle;
  readonly rpc: HostRpc;
  readonly ui: HostUi;
  /**
   * Steam's React stack, exposed so a bundle's `react` / `react-dom` /
   * `jsx-runtime` shims can resolve React from the host instead of from
   * loader-published globals — the path a *sole* host (no loader) needs, since
   * no loader is present to publish them. Kept dependency-free: cast to
   * `React` / `ReactDOM` / the jsx-runtime at the call site, as with {@link HostUi}.
   * Optional — a loader-backed host may omit them and let the bundle fall back to
   * the loader's own React globals.
   */
  readonly React?: unknown;
  readonly ReactDOM?: unknown;
  readonly jsx?: unknown;
  readonly routes: HostRoutes;
  readonly notifications?: HostNotifications;
  readonly platform: PlatformApi;
  /** Optional so hosts without a QAM surface still satisfy the shape. */
  readonly qam?: HostQam;
  /** Optional Main Menu (left-rail) surface; present only on hosts that
   *  support it. Injected/shown only while it has content (see `HostMainMenu`). */
  readonly mainMenu?: HostMainMenu;
  /** Optional self-update surface; present only on hosts that can obtain and
   *  apply an update themselves (see `HostUpdates`). */
  readonly updates?: HostUpdates;
}

/* ── Ownership & coexistence handshake ──────────────────────────────────────
   Neutral vocabulary for WHICH host owns the renderer when more than one is
   present. A host stamps these renderer globals; the bundle reads them to select
   its host and to guard single-ownership. Owner values are OPAQUE strings — each
   host names itself and the contract never hard-codes a host's or loader's name.
   Only the injected neutral host both stamps force AND installs its runtime, so
   presence — not any specific name — is what the bundle keys on. */

/** An owner label is an opaque, host-chosen string; the contract never enumerates
    concrete names (that would bake a host/loader identity into the boundary). */
export type HostOwnerKind = string;

/** Renderer global NAMES (augmented on `Window` below). */
export const INJECTED_HOST_GLOBAL = "__SHELVES_HOST__" as const;
export const FORCE_OWNER_GLOBAL = "__SHELVES_FORCE_OWNER__" as const;
export const OWNER_GLOBAL = "__DECK_SHELVES_OWNER__" as const;
export const OWNER_METADATA_GLOBAL = "__DECK_SHELVES_OWNER_META__" as const;

/** Version identity published by the bundle that currently owns the renderer. */
export interface HostOwnerMetadata {
  host: HostOwnerKind;
  dsVersion: string;
}

function ownershipScope(): Record<string, unknown> {
  const g = globalThis as unknown as { window?: Record<string, unknown> } & Record<string, unknown>;
  return (g.window ?? g) as Record<string, unknown>;
}
function readOwnerString(name: string): string | null {
  try {
    const v = ownershipScope()[name];
    return typeof v === "string" && v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

/** The injected host runtime, or null when no neutral host is present. */
export function getInjectedHost(): ShelvesHostGlobal | null {
  try {
    return (ownershipScope()[INJECTED_HOST_GLOBAL] ?? null) as ShelvesHostGlobal | null;
  } catch {
    return null;
  }
}
/** The forced-owner label a host stamped, or null when none. */
export function readForcedOwner(): string | null {
  return readOwnerString(FORCE_OWNER_GLOBAL);
}
/** The renderer's single-owner claim, or null when still unclaimed. */
export function readOwner(): string | null {
  return readOwnerString(OWNER_GLOBAL);
}
/** True when a host stamped a forced-owner claim. Only the injected neutral host
    does this, so `isForcedOwner() && getInjectedHost()` means "the injected host
    was forced to own" (cooperative ownership) without naming any host: the loader
    keeps the renderer + its other plugins, and the bundle binds to the injected
    host — waiting via {@link getInjectedHost} if the loader booted it first. */
export function isForcedOwner(): boolean {
  return readForcedOwner() != null;
}

/** Shape of the runtime global the host installs in the renderer. */
export type ShelvesHostGlobal = HostApi;

declare global {
  // eslint-disable-next-line no-var
  interface Window {
    __SHELVES_HOST__?: ShelvesHostGlobal;
    /**
     * A host's QAM registration surface, exposed independently of the full
     * `HostApi`. A host with a native QAM tab installs this even when it is NOT
     * the bundle's selected host — i.e. in *coexistence*, where another loader
     * owns the home and `__SHELVES_HOST__` is intentionally left unset so host
     * selection is not disturbed. A bundle may register a panel here to populate
     * that host's tab regardless of which host it selected; the surface takes no
     * part in host selection. When the same host also owns the home this is the
     * very same object as `__SHELVES_HOST__.qam`.
     */
    __SHELVES_QAM__?: HostQam;
    /**
     * Panels a bundle registered before `__SHELVES_QAM__` existed. Registration
     * is order-independent: a bundle that boots first may push its panels here,
     * and the host drains and clears this array the moment it installs
     * `__SHELVES_QAM__`. Equivalent to calling `registerPanel` for each.
     */
    __SHELVES_QAM_PENDING__?: QamPanel[];
    /**
     * Tab-ownership handshake. A host stamps this with its owner kind (e.g.
     * `"shelveshub"`) the moment its own Deck Shelves QAM tab is actually
     * inserted into the strip — NOT when `__SHELVES_QAM__` is first created
     * (that happens at boot, before any tab exists). A bundle running under a
     * different loader that also renders its own native tab retracts it once
     * this is set, so exactly one Deck Shelves tab survives and it is the
     * host's. Because it is stamped only on real insertion, a host that never
     * inserts leaves the bundle's own tab in place as the fallback rather than
     * both vanishing. Unset means no host has claimed the tab.
     */
    __SHELVES_QAM_OWNER__?: string;
    /**
     * Forced-owner handshake. A host stamps its own (opaque) owner label here to
     * claim the renderer even alongside a loader (cooperative ownership): the
     * loader keeps owning the renderer and its other plugins, but the bundle binds
     * to the injected host (`__SHELVES_HOST__`) — waiting for it to appear if the
     * loader booted the bundle first — instead of the loader that launched it.
     * Only the injected host stamps this, so presence (not the label's value) is
     * what the bundle keys on.
     */
    __SHELVES_FORCE_OWNER__?: HostOwnerKind;
    /**
     * The renderer's single-owner claim. The first host/bundle to claim writes
     * its kind; a second instance reads it and stands down (no home patch, no
     * settings writes) so there is exactly one injector and one writer.
     */
    __DECK_SHELVES_OWNER__?: HostOwnerKind;
    /** Version identity of the bundle that currently owns the renderer. */
    __DECK_SHELVES_OWNER_META__?: HostOwnerMetadata;
  }
}
