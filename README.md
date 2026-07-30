# Nametris

Nametris is a desktop block game: clear rows on a normal Tetris board, earn one
transfer per cleared row, and route eligible spawned pieces into a stencil of
your name. Claim a safe result from 80–99%, or keep playing and risk the run for
a perfect 100% reward.

The product intent, binding game rules, and approved implementation sequence
live in:

- [`docs/intent/nametris.md`](docs/intent/nametris.md)
- [`docs/specs/nametris-game-spec.md`](docs/specs/nametris-game-spec.md)
- [`docs/plans/nametris-implementation-plan.md`](docs/plans/nametris-implementation-plan.md)

## Run locally

Use Node `22.22.2+`, Node `24.15.0+`, or Node `26+`.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The supported minimum desktop viewport is
1180 × 720 CSS pixels.

For the real-browser suite, install the matching Chromium build once:

```sh
npx playwright install chromium
npm run test:e2e
```

## Controls

| Action                   | Board                        | Stencil                       |
| ------------------------ | ---------------------------- | ----------------------------- |
| Move                     | Arrow Left/Right or `A`/`D`  | Arrow keys or `W`/`A`/`S`/`D` |
| Soft drop                | Arrow Down or `S`            | —                             |
| Hard drop / lock         | Space                        | Enter or Space                |
| Rotate clockwise         | Arrow Up or `X`              | `X`                           |
| Rotate counter-clockwise | `Z`                          | `Z`                           |
| Route / cancel           | `N`                          | Escape                        |
| Pause / resume           | `P`, Escape, or Pause button | `P` or Pause button           |

Routing is available only while a spawned piece overlaps the hidden spawn rows
and at least one transfer is available. Canceling preserves both the exact
piece and its transfer; a legal stencil lock spends one transfer.

## Verification

```sh
npm run check
npm run test:coverage
npm run test:e2e
```

`npm run check` runs strict TypeScript, ESLint, formatting checks, all unit and
component tests, and a production build. The gameplay engine is deterministic:
random piece order and elapsed time enter through injected sources.

## Architecture

- `src/game/engine/` contains pure reducers and rules for collision, rotation,
  board locking, stencil placement, completion, result snapshots, and titles.
- `src/game/glyphs/` contains the custom A–Z alphabet and exact-cover validator.
- `src/features/` adapts the engine to React, keyboard input, local browser
  actions, and semantic DOM/CSS grids.
- `src/game/testing/fixtures.ts` exposes deterministic rare states only when
  Vite is started with the E2E environment flag. The production bundle does not
  expose the browser fixture API.

## Privacy

The optional 2–10 letter name is normalized to uppercase and kept only in React
memory. Nametris has no backend, analytics, saved session, or automatic request
containing the name. Download, clipboard, and native share actions run locally
and only after a player click; shared text contains no URL.

The project was inspired by the references recorded in the intent document.
No source code or assets were copied from either reference.
