import { describe, it, expect } from "vitest";
import { HOST_API_VERSION, type HostApi, type QamPanel } from "./index";

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
});
