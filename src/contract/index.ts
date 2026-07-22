/**
 * @deck-shelves/host — HostApi contract (v1.1.0).
 *
 * The single source of truth for the boundary between a *host* and the Deck
 * Shelves bundle. Every host ships its own adapter (one per host), and every
 * adapter fulfils this shape, so the bundle's call sites depend only on it
 * and never on a specific host's UI library directly.
 *
 * Additive-only after 1.0.0. `qam` was added in 1.1.0 as an optional, additive
 * namespace (implemented by hosts that render their own Quick Access panels).
 *
 * Dependency-free by design (mirrors `@deck-shelves/api`): supporting data
 * types are inlined. Members annotated "reconciled in Batch 5" are placeholders
 * that get tightened against the plugin's `src/types.ts` / `runtime/platform.ts`
 * when the contract formally supersedes the two divergent in-repo copies.
 */

export const HOST_API_VERSION = "1.1.0" as const;

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

// ── QAM (Quick Access Menu) — added 1.1.0, optional/additive ────────────────

/** A dedicated panel + icon shown in the Steam Quick Access Menu. */
export interface QamPanel {
  /** Stable id — re-registering with the same id replaces the panel. */
  id: string;
  /** Label / accessible name. */
  title: string;
  /** Inline SVG markup (or a `data:` URI) used as the icon. */
  icon: string;
  /** Render into the host-owned container; return an optional cleanup fn. */
  render(container: HTMLElement): void | (() => void);
}

export interface HostQam {
  /** Register a QAM panel; returns an unregister function. */
  registerPanel(panel: QamPanel): () => void;
}

/**
 * What the host process provides to the Deck Shelves bundle. The bundle receives
 * this at startup as `window.__SHELVES_HOST__` and uses it to register itself,
 * invoke host methods, add routes, render Steam-native UI, and — where the
 * host supports it — add Quick Access Menu panels.
 */
export interface HostApi {
  readonly version: typeof HOST_API_VERSION;
  readonly lifecycle: HostLifecycle;
  readonly rpc: HostRpc;
  readonly ui: HostUi;
  readonly routes: HostRoutes;
  readonly notifications?: HostNotifications;
  readonly platform: PlatformApi;
  /** Optional so hosts without a QAM surface still satisfy the shape. */
  readonly qam?: HostQam;
}

/** Shape of the runtime global the host installs in the renderer. */
export type ShelvesHostGlobal = HostApi;

declare global {
  // eslint-disable-next-line no-var
  interface Window {
    __SHELVES_HOST__?: ShelvesHostGlobal;
  }
}
