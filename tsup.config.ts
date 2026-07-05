import { defineConfig } from "tsup";

// The HostApi contract (types) is the package entry point:
//   - ESM → dist/index.js   (package.json "module" / exports.import)
//   - CJS → dist/index.cjs  (package.json "main"   / exports.require)
//   - DTS → dist/index.d.ts
// `src/contract/index.ts` is type-only and gets inlined into the bundle + the
// .d.ts, so consumers get the full contract from a single entry point.
export default defineConfig({
  entry: ["src/contract/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: false,
  clean: true,
  treeshake: true,
  minify: false,
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
});
