import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/game/engine/**/*.ts",
        "src/game/glyphs/**/*.ts",
        "src/game/config/titles.ts",
      ],
      thresholds: {
        "src/game/engine/**/*.ts": { branches: 90 },
        "src/game/glyphs/**/*.ts": { branches: 90 },
        "src/game/{engine/config}/titles.ts": { branches: 90 },
      },
    },
  },
});
