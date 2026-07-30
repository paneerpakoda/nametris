/// <reference types="vite/client" />

import type { E2EFixtureKind } from "./game/testing/fixtures";

declare global {
  interface Window {
    __NAMETRIS_E2E__?: {
      readonly loadFixture: (kind: E2EFixtureKind) => void;
    };
  }
}

export {};
