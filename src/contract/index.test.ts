import { describe, it, expect } from "vitest";
import { HOST_API_VERSION, OWNER_METADATA_GLOBAL, COOP_DEFER_GLOBAL, COOP_HOST_BUNDLE_BOOTED_GLOBAL, COOP_OFFER_KEY, compareVersions, offeredBundle, shouldDeferToHost, type HostApi, type QamPanel, type HostUpdates, type MainMenuEntry, type HostOwnerMetadata, type HostHandshake } from "./index";

describe("HostApi contract", () => {
  it("exposes a semver HOST_API_VERSION", () => {
    expect(HOST_API_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("is structurally satisfiable with the required namespaces", () => {
    // A minimal stand-in proves the required members are the ones we expect;
    // if a required namespace is added/removed this stops type-checking.
    const stub: HostApi = {
      version: HOST_API_VERSION,
      lifecycle: {
        register: () => ({ dispose() {} }),
        onMount() {},
        onUnmount() {},
      },
      rpc: { call: async () => undefined as never },
      ui: {} as HostApi["ui"],
      routes: { register: () => ({ dispose() {} }) },
      platform: {
        listCollections: async () => [],
        listLibraryTabs: async () => [],
        resolveShelfAppIds: async () => [],
        getAppName: async () => "",
        getAppMeta: async () => ({ appid: 0, name: "" }),
        navigateToApp() {},
      },
    };
    expect(stub.version).toBe(HOST_API_VERSION);
    expect(typeof stub.rpc.call).toBe("function");
  });

  it("accepts a QamPanel as either render() or React content, with an optional icon", () => {
    const viaRender: QamPanel = {
      id: "p",
      title: "Panel",
      render: (c: HTMLElement) => {
        void c;
        return () => {};
      },
    };
    const viaContent: QamPanel = {
      id: "p",
      title: "Panel",
      // A React node / factory — kept dependency-free here (cast at the call site).
      content: (() => null) as unknown,
    };
    expect(viaRender.id).toBe("p");
    // `icon` is optional: a first-class host tab supplies its own.
    expect(viaRender.icon).toBeUndefined();
    expect(typeof viaContent.content).toBe("function");
  });

  it("declares host-selection-neutral coexistence globals typed by the contract", () => {
    // Type-level: __SHELVES_QAM__ is a HostQam, __SHELVES_QAM_PENDING__ a QamPanel[].
    const w = {} as Window & typeof globalThis;
    w.__SHELVES_QAM__ = { registerPanel: () => () => {} };
    w.__SHELVES_QAM_PENDING__ = [{ id: "p", title: "Panel", content: null as unknown }];
    expect(typeof w.__SHELVES_QAM__.registerPanel).toBe("function");
    expect(w.__SHELVES_QAM_PENDING__).toHaveLength(1);
  });

  it("accepts an optional React stack for sole-host bundles", () => {
    // A sole host (no loader) exposes Steam's React stack so the bundle's
    // react / react-dom / jsx-runtime shims resolve React from __SHELVES_HOST__
    // rather than from loader-published globals. Kept dependency-free (unknown).
    const withReact: Pick<HostApi, "React" | "ReactDOM" | "jsx"> = {
      React: {} as unknown,
      ReactDOM: {} as unknown,
      jsx: {} as unknown,
    };
    expect(withReact.React).toBeDefined();
    // All three are optional — a loader-backed host omits them and the bundle
    // falls back to the loader's own React globals.
    const withoutReact: Pick<HostApi, "React"> = {};
    expect(withoutReact.React).toBeUndefined();
  });

  it("accepts an optional self-install HostUpdates surface", async () => {
    const updates: HostUpdates = {
      canSelfInstall: () => true,
      applyUpdate: async (release) => { void release; },
    };
    expect(updates.canSelfInstall()).toBe(true);
    await expect(updates.applyUpdate({ version: "1.2.3" })).resolves.toBeUndefined();
    // A host without this surface simply omits it — `updates` is optional.
    const withoutUpdates: Pick<HostApi, "updates"> = {};
    expect(withoutUpdates.updates).toBeUndefined();
  });

  it("accepts an optional Main Menu surface, entries requiring id/title/icon", () => {
    const entry: MainMenuEntry = { id: "e", title: "Entry", icon: "<svg/>", route: "/deck-shelves/about" };
    expect(entry.route).toBe("/deck-shelves/about");
    // onSelect is the alternative to route — exactly one is expected, not enforced
    // at the type level (documented, not structurally required either/or).
    const viaCallback: MainMenuEntry = { id: "e2", title: "Entry 2", icon: "<svg/>", onSelect: () => {} };
    expect(typeof viaCallback.onSelect).toBe("function");
  });

  it("defines the version-aware renderer ownership metadata", () => {
    const metadata: HostOwnerMetadata = { host: "shelveshub", dsVersion: "3.3.0" };
    expect(OWNER_METADATA_GLOBAL).toBe("__DECK_SHELVES_OWNER_META__");
    expect(metadata).toEqual({ host: "shelveshub", dsVersion: "3.3.0" });
  });
});

describe("cooperative bundle hand-over", () => {
  const handshake = (capabilities: Record<string, boolean>, bundleVersion?: string): HostHandshake => ({
    hostKind: "host", hostVersion: "0.6.0", hostApiVersion: HOST_API_VERSION, capabilities, bundleVersion,
  });

  it("names the renderer globals and the offer key", () => {
    expect(COOP_DEFER_GLOBAL).toBe("__DECK_SHELVES_DEFER_TO_HOST__");
    expect(COOP_HOST_BUNDLE_BOOTED_GLOBAL).toBe("__DECK_SHELVES_HOST_BUNDLE_BOOTED__");
    expect(COOP_OFFER_KEY).toBe("shelveshub-coop-bundle");
  });

  it("compares numeric versions, ignoring a v prefix and pre-release tails", () => {
    expect(compareVersions("v3.4.0", "3.4.0")).toBe(0);
    expect(compareVersions("3.4.1", "3.4.0")).toBeGreaterThan(0);
    expect(compareVersions("3.3.9", "3.4.0")).toBeLessThan(0);
    expect(compareVersions("3.4.0-beta.1", "3.4.0")).toBe(0);
  });

  it("offers a bundle only with the capability and a version, and defers only under force for a newer-or-equal one", () => {
    expect(offeredBundle(handshake({ coopBundle: true }, "v3.4.0"))).toBe("v3.4.0");
    expect(offeredBundle(handshake({ coopBundle: false }, "v3.4.0"))).toBeNull();
    expect(offeredBundle(handshake({ coopBundle: true }))).toBeNull();
    expect(offeredBundle(null)).toBeNull();
    const hs = handshake({ coopBundle: true }, "v3.4.0");
    expect(shouldDeferToHost({ forced: true, handshake: hs, ownVersion: "3.4.0" })).toBe(true);
    expect(shouldDeferToHost({ forced: true, handshake: hs, ownVersion: "3.3.0" })).toBe(true);
    expect(shouldDeferToHost({ forced: true, handshake: hs, ownVersion: "3.5.0" })).toBe(false);
    expect(shouldDeferToHost({ forced: false, handshake: hs, ownVersion: "3.4.0" })).toBe(false);
    expect(shouldDeferToHost({ forced: true, handshake: null, ownVersion: "3.4.0" })).toBe(false);
  });
});
