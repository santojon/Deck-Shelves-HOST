import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // jsdom gives us a real `window` so the contract's `window.__SHELVES_HOST__`
    // global augmentation and any runtime-facing tests behave like the browser
    // / Steam UI runtime consumers hit.
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
  },
});
