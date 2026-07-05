import { describe, it, expect } from "vitest";
import { HOST_API_VERSION, type HostApi } from "./index";

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
});
