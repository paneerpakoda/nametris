import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

const browserStorage =
  typeof window.localStorage?.clear === "function" ? window.localStorage : null;

if (browserStorage === null) {
  const entries = new Map<string, string>();
  const memoryStorage = {
    get length() {
      return entries.size;
    },
    clear() {
      entries.clear();
    },
    getItem(key: string) {
      return entries.get(key) ?? null;
    },
    key(index: number) {
      return [...entries.keys()][index] ?? null;
    },
    removeItem(key: string) {
      entries.delete(key);
    },
    setItem(key: string, value: string) {
      entries.set(key, String(value));
    },
  };
  for (const target of [window, globalThis]) {
    try {
      Object.defineProperty(target, "localStorage", {
        configurable: true,
        value: memoryStorage,
      });
    } catch {
      // Node's experimental localStorage can be non-configurable. Tests then
      // use window.localStorage, which is the copy above when the assignment works.
    }
  }
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  if (window.location.pathname !== "/" || window.location.search !== "") {
    window.history.replaceState(null, "", "/");
  }
});
