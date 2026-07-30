# Implementation Plan: Nametris Desktop MVP

Status: Approved by the product owner on 30 July 2026.

Source specification: [`docs/specs/nametris-game-spec.md`](../specs/nametris-game-spec.md)

## Overview

Build Nametris as a desktop-only React application with a deterministic TypeScript gameplay core, a two-board keyboard interface, exact-cover-validated name glyphs, uninterrupted 80% completion, automatic perfect completion, and a locally generated animated reward. Work proceeds in tested vertical slices so a small normal-board game is playable before the full stencil and reward flows are added.

## Architecture Decisions

- Keep collision, scoring, transfers, stencil legality, completion, titles, and state transitions in pure TypeScript modules. Inject randomness and time.
- Use React only for orchestration, rendering, focus, input adaptation, and browser APIs.
- Render the normal board and stencil as semantic DOM/CSS grids.
- Keep the player name in React memory only and pass it to local export/share code only after a user action.
- Use deterministic seeds and narrow test hooks for browser tests; exclude those hooks from normal production behavior.
- Verify current stable package APIs and reference licensing from primary sources before installation or adaptation.

## Dependency Order

```text
approved spec
  -> verified toolchain and scaffold
  -> tetromino geometry
  -> board engine and playable board slice
  -> tileable glyph system
  -> stencil placement and session routing
  -> completion, loss, metrics, and titles
  -> onboarding and complete gameplay UI
  -> reward, local export, and sharing
  -> integration coverage
  -> browser QA and final review
```

## Task List

### Phase 1: Repository and Toolchain

#### Task 1: Establish the repository and dependency manifest

**Description:** Initialize Git, verify stable package versions and reference licensing from primary sources, and define the approved npm dependencies without removing `docs/`.

**Acceptance criteria:**

- [ ] Git tracks the existing documentation and ignores generated artifacts.
- [ ] `package.json` uses verified stable versions of the approved stack.
- [ ] No reference source is copied unless its license and required notice are recorded.

**Verification:**

- [ ] `git status --short` lists only intentional project files.
- [ ] `npm install` produces a lockfile with no unresolved dependency errors.

**Dependencies:** Approved specification.

**Files likely touched:** `.gitignore`, `package.json`, `package-lock.json`, `docs/specs/nametris-game-spec.md`

**Estimated scope:** Medium

#### Task 2: Configure strict development tooling

**Description:** Configure strict TypeScript, Vite, Vitest, ESLint flat config, Prettier, Tailwind, and the required npm scripts.

**Acceptance criteria:**

- [ ] Every command required by the specification exists.
- [ ] TypeScript uses strict mode and tests run in a browser-like environment.
- [ ] `npm run check` composes typecheck, lint, formatting, unit tests, and build.

**Verification:**

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run format:check`

**Dependencies:** Task 1

**Files likely touched:** `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `eslint.config.js`, `.prettierrc.json`

**Estimated scope:** Medium

#### Task 3: Create the tested application shell

**Description:** Add the minimal React entry point, global design tokens, test setup, and a desktop shell while preserving all documentation.

**Acceptance criteria:**

- [ ] The welcome shell renders at the supported minimum viewport.
- [ ] Global styling exposes accessible modern-retro tokens.
- [ ] A smoke test proves the app mounts.

**Verification:**

- [ ] `npm run test -- --run`
- [ ] `npm run build`
- [ ] Manual check at `1180 × 720`

**Dependencies:** Task 2

**Files likely touched:** `index.html`, `src/main.tsx`, `src/app/App.tsx`, `src/styles/globals.css`, `src/test/setup.ts`

**Estimated scope:** Medium

### Checkpoint 1: Foundation

- [ ] `npm run check` passes.
- [ ] `docs/` remains intact.
- [ ] The production bundle starts locally with no console errors.

### Phase 2: Deterministic Gameplay Core

#### Task 4: Define tetromino geometry and collision

**Description:** Model immutable game types, all seven tetromino rotations, board bounds, collision, and legal movement with tests written first.

**Acceptance criteria:**

- [ ] All seven pieces expose correct four-cell rotations.
- [ ] Collision and movement behave deterministically at walls, floor, and occupied cells.
- [ ] Engine code contains no browser or React dependencies.

**Verification:**

- [ ] `npm run test -- --run src/game/engine/collision.test.ts`
- [ ] `npm run typecheck`

**Dependencies:** Task 3

**Files likely touched:** `src/game/model/types.ts`, `src/game/engine/pieces.ts`, `src/game/engine/collision.ts`, `src/game/engine/collision.test.ts`

**Estimated scope:** Medium

#### Task 5: Add rotation and wall kicks

**Description:** Implement clockwise and counter-clockwise rotations with the approved practical SRS wall-kick subset.

**Acceptance criteria:**

- [ ] Rotations succeed in open space and use deterministic kicks near boundaries.
- [ ] Illegal rotations leave state unchanged.
- [ ] I, O, and JLSTZ behavior has explicit boundary coverage.

**Verification:**

- [ ] `npm run test -- --run src/game/engine/rotation.test.ts`
- [ ] `npm run typecheck`

**Dependencies:** Task 4

**Files likely touched:** `src/game/engine/rotation.ts`, `src/game/engine/rotation.test.ts`, `src/game/engine/pieces.ts`

**Estimated scope:** Small

#### Task 6: Implement bag, board locking, scoring, and transfers

**Description:** Add injected seven-bag generation plus piece locking, line clearing, score, level, and one-transfer-per-row rules.

**Acceptance criteria:**

- [ ] Seeded bags are repeatable and each bag contains all seven pieces.
- [ ] Locks clear all full rows and award the configured score and transfer count.
- [ ] One-, two-, three-, and four-line boundaries are covered.

**Verification:**

- [ ] `npm run test -- --run src/game/engine/bag.test.ts src/game/engine/board.test.ts`
- [ ] Engine branch coverage report meets the interim 90% target for implemented modules.

**Dependencies:** Tasks 4–5

**Files likely touched:** `src/game/engine/bag.ts`, `src/game/engine/bag.test.ts`, `src/game/engine/board.ts`, `src/game/engine/board.test.ts`, `src/game/config/scoring.ts`

**Estimated scope:** Medium

#### Task 7: Deliver the playable normal-board slice

**Description:** Connect the pure board engine to one clock, keyboard input, ghost projection, next preview, lock delay, pause, and top-out in a minimal UI.

**Acceptance criteria:**

- [ ] A seeded game can be played entirely by keyboard.
- [ ] Gravity, drops, ghost, line clears, next piece, pause, and top-out are visible.
- [ ] Hidden tabs pause automatically and require explicit resume.

**Verification:**

- [ ] Focused runtime and component tests pass.
- [ ] Manual browser play confirms handled keys do not scroll the page.
- [ ] `npm run check`

**Dependencies:** Task 6

**Files likely touched:** `src/game/engine/session.ts`, `src/game/runtime/clock.ts`, `src/game/runtime/input.ts`, `src/features/gameplay/GameplayScreen.tsx`, `src/features/gameplay/BoardGrid.tsx`

**Estimated scope:** Medium

### Checkpoint 2: Playable Board

- [ ] `npm run check` passes.
- [ ] A normal Tetris run is playable from spawn through line clear and loss.
- [ ] Deterministic seed replay produces the same piece sequence.

### Phase 3: Name-Building Core

#### Task 8: Author and validate tileable glyphs

**Description:** Create a legible A–Z block-glyph alphabet and an exact-cover solver that proves each glyph can be tiled by supported tetrominoes.

**Acceptance criteria:**

- [ ] Every glyph has a fill count divisible by four and an exact-cover solution.
- [ ] Representative 2-, 5-, and 10-letter masks validate.
- [ ] Maintained fixtures make glyph legibility changes reviewable.

**Verification:**

- [ ] `npm run test -- --run src/game/glyphs`
- [ ] `npm run test:coverage` reports at least 90% branch coverage for glyph logic.

**Dependencies:** Tasks 4–6

**Files likely touched:** `src/game/glyphs/alphabet.ts`, `src/game/glyphs/exactCover.ts`, `src/game/glyphs/alphabet.test.ts`, `src/test/fixtures/glyphSnapshots.ts`

**Estimated scope:** Medium

#### Task 9: Implement stencil placement rules

**Description:** Add mask composition, four-direction movement, rotation, placement preview, legal lock, invalid lock rejection, and completion calculation.

**Acceptance criteria:**

- [ ] A piece locks only when all four cells are unoccupied fillable cells.
- [ ] Invalid placement never changes filled cells.
- [ ] Completion uses exact ratios and floors display percentages.

**Verification:**

- [ ] `npm run test -- --run src/game/engine/stencil.test.ts`
- [ ] Boundary tests cover immediately below, at, and above 80%, plus exact 100%.

**Dependencies:** Task 8

**Files likely touched:** `src/game/engine/stencil.ts`, `src/game/engine/stencil.test.ts`, `src/game/model/types.ts`

**Estimated scope:** Small

#### Task 10: Integrate routing and completion state

**Description:** Extend the session reducer with spawn-zone eligibility, stencil mode, cancel semantics, transfer spending, uninterrupted finish availability, auto-perfect completion, and loss risk.

**Acceptance criteria:**

- [ ] Cancel returns the exact piece to spawn and preserves its transfer.
- [ ] Legal lock spends exactly one transfer and advances to the next piece.
- [ ] 80% remains active play, 100% auto-finishes, and top-out before claiming 80–99% loses.

**Verification:**

- [ ] `npm run test -- --run src/game/engine/session.test.ts`
- [ ] State-transition coverage meets the 90% engine branch target.

**Dependencies:** Tasks 7 and 9

**Files likely touched:** `src/game/engine/session.ts`, `src/game/engine/session.test.ts`, `src/game/model/types.ts`, `src/game/config/controls.ts`

**Estimated scope:** Medium

#### Task 11: Add metrics, active time, and deterministic titles

**Description:** Capture local normalized performance metrics, exclude paused/hidden time, and select exactly one title using the approved stable priorities.

**Acceptance criteria:**

- [ ] Active time excludes explicit pause, help, and hidden-tab time.
- [ ] Every title and threshold boundary has a unit test.
- [ ] Perfect results can select only the three perfect titles.

**Verification:**

- [ ] `npm run test -- --run src/game/engine/titles.test.ts src/game/runtime/clock.test.ts`
- [ ] Title and timer branch coverage is at least 90%.

**Dependencies:** Task 10

**Files likely touched:** `src/game/config/titles.ts`, `src/game/engine/titles.ts`, `src/game/engine/titles.test.ts`, `src/game/runtime/clock.ts`, `src/game/runtime/clock.test.ts`

**Estimated scope:** Medium

### Checkpoint 3: Complete Rules

- [ ] `npm run check` passes.
- [ ] All 26 glyphs are exactly tileable.
- [ ] Reducer tests prove transfer, 80%, 100%, and top-out semantics.

### Phase 4: Complete Product Experience

#### Task 12: Build private, accessible onboarding

**Description:** Implement name entry, `HARSH` fallback, allowlist validation, privacy messaging, controls help, and in-memory session creation.

**Acceptance criteria:**

- [ ] Empty input starts `HARSH`; valid names normalize to uppercase.
- [ ] Invalid names produce an associated accessible inline error.
- [ ] The name is absent from URLs, storage, logs, and automatic requests.

**Verification:**

- [ ] Focused React Testing Library onboarding tests pass.
- [ ] Manual storage, URL, console, and network inspection passes.

**Dependencies:** Task 3

**Files likely touched:** `src/features/onboarding/WelcomeScreen.tsx`, `src/features/onboarding/nameValidation.ts`, `src/features/onboarding/WelcomeScreen.test.tsx`, `src/app/App.tsx`

**Estimated scope:** Medium

#### Task 13: Build the full two-board gameplay interface

**Description:** Present both boards, metrics, previews, contextual routing, stencil controls, first-run guidance, finish action, pause/help, and restrained live announcements.

**Acceptance criteria:**

- [ ] Board/name routing is understandable and fully keyboard-operable.
- [ ] The finish action appears at exact 80% without modal, focus theft, or pause.
- [ ] Validity and essential status use text/icon differences as well as color.

**Verification:**

- [ ] Focused gameplay integration tests pass.
- [ ] Manual check at minimum viewport and 200% zoom.
- [ ] `npm run check`

**Dependencies:** Tasks 10–12

**Files likely touched:** `src/features/gameplay/GameplayScreen.tsx`, `src/features/gameplay/StencilGrid.tsx`, `src/features/gameplay/GameMetrics.tsx`, `src/features/gameplay/Guidance.tsx`, `src/styles/tokens.css`

**Estimated scope:** Medium

#### Task 14: Build successful and loss result flows

**Description:** Freeze final metrics, render distinct success/loss views, support replay and new-name actions, and keep all reward controls outside the card.

**Acceptance criteria:**

- [ ] Success freezes score, completion, title, and active playtime.
- [ ] Loss never receives a success title.
- [ ] Replay preserves the name only in memory; new-name returns to onboarding.

**Verification:**

- [ ] Focused result-flow integration tests pass.
- [ ] Manual replay/new-name checks confirm no browser persistence.

**Dependencies:** Tasks 11 and 13

**Files likely touched:** `src/features/reward/ResultScreen.tsx`, `src/features/reward/LossScreen.tsx`, `src/features/reward/ResultScreen.test.tsx`, `src/app/App.tsx`

**Estimated scope:** Medium

#### Task 15: Add the premium reward and local actions

**Description:** Implement subtle spring tilt and radial shine, reduced-motion behavior, deterministic local SVG download, clipboard summary, and user-triggered share fallback.

**Acceptance criteria:**

- [ ] Card content and all outside actions match the specification.
- [ ] Reduced motion removes moving tilt/shine while preserving the design.
- [ ] Export, copy, and share preparation remain local and user-initiated.

**Verification:**

- [ ] Reward interaction, DOM-boundary, and reduced-motion tests pass.
- [ ] Downloaded SVG opens and matches frozen result data.
- [ ] Network inspection shows no reward action sends the name remotely.

**Dependencies:** Task 14

**Files likely touched:** `src/features/reward/RewardCard.tsx`, `src/features/reward/RewardCard.test.tsx`, `src/features/reward/exportCard.ts`, `src/features/reward/localActions.ts`, `src/styles/reward.css`

**Estimated scope:** Medium

### Checkpoint 4: Feature Complete

- [ ] `npm run check` passes.
- [ ] Production JavaScript remains under the 250 KB gzip target or any regression is investigated.
- [ ] All specification acceptance criteria have an automated or recorded manual verification.

### Phase 5: Browser QA and Handoff

#### Task 16: Add deterministic integration and privacy coverage

**Description:** Complete component-level flows for transfer routing, cancel/lock, 80% continuation, 100% completion, rewards, accessibility, and privacy guardrails.

**Acceptance criteria:**

- [ ] Every specified integration scenario has a stable test.
- [ ] Tests assert reward controls remain outside the card.
- [ ] Privacy tests fail if the name reaches storage, URL, logging, or request construction.

**Verification:**

- [ ] `npm run test:coverage`
- [ ] `npm run check`

**Dependencies:** Tasks 12–15

**Files likely touched:** `src/features/gameplay/GameplayScreen.test.tsx`, `src/features/reward/ResultScreen.test.tsx`, `src/test/fixtures/sessionFixtures.ts`, `src/test/privacy.test.ts`

**Estimated scope:** Medium

#### Task 17: Exercise critical flows in a real desktop browser

**Description:** Add deterministic Playwright flows and manually exercise the supported desktop experience, including keyboard input, completion risk, reduced motion, reward hover, and download.

**Acceptance criteria:**

- [ ] Automated flows cover route/cancel/lock, 80% continuation, 100% auto-finish, top-out after 80%, and local download.
- [ ] No observed request contains a custom test name.
- [ ] Chrome desktop QA passes at `1180 × 720`, including full keyboard operation.

**Verification:**

- [ ] `npm run test:e2e`
- [ ] Browser console and network panels remain clean.
- [ ] Record results for supported-browser limitations, if any.

**Dependencies:** Task 16

**Files likely touched:** `playwright.config.ts`, `e2e/gameplay.spec.ts`, `e2e/privacy.spec.ts`, `src/game/runtime/testHooks.ts`

**Estimated scope:** Medium

#### Task 18: Perform final quality review and handoff

**Description:** Review implementation against the approved specification across correctness, simplicity, accessibility, privacy, performance, and maintainability; fix actionable issues and report exact evidence.

**Acceptance criteria:**

- [ ] Every acceptance criterion is satisfied or explicitly documented as a limitation.
- [ ] No high-priority review finding remains open.
- [ ] Development and verification commands are accurate in the repository.

**Verification:**

- [ ] `npm run check`
- [ ] `npm run test:coverage`
- [ ] `npm run test:e2e`
- [ ] Final manual reward, reduced-motion, download, and privacy checks pass.

**Dependencies:** Task 17

**Files likely touched:** `README.md`, `docs/plans/nametris-implementation-plan.md`, and focused source/test files identified by review

**Estimated scope:** Medium

### Checkpoint 5: MVP Complete

- [ ] Unit, integration, lint, typecheck, formatting, build, and browser tests pass.
- [ ] Engine, glyph, and title branch coverage is at least 90%.
- [ ] Exact commands and results, bundle size, browser QA, and remaining limitations are ready for handoff.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Legible glyphs cannot all be exactly tiled | High | Build the solver and all 26 glyphs before the full stencil UI; fail tests on any invalid glyph. |
| Spawn-zone routing feels too brief | Medium | Instrument only in-memory test metrics and usability-test the approved window before changing rules. |
| Clock/input behavior becomes nondeterministic | High | Keep reducer transitions pure; inject clock ticks, seeds, and visibility events. |
| Name leaks through browser APIs or diagnostics | High | Keep it memory-only; add request, storage, URL, logging, and export-focused tests. |
| Reward tooling inflates the bundle | Medium | Prefer hand-built deterministic SVG and browser APIs; measure gzip output before adding tooling. |
| Grid layout fails for ten-letter names or zoom | Medium | Establish glyph dimensions early and test 2-, 5-, and 10-letter masks at minimum viewport and 200% zoom. |
| Browser automation cannot efficiently reach rare states | Medium | Expose narrow deterministic fixture hooks available only in test mode. |

## Approval Gate

Implementation, Git initialization, scaffolding, and dependency installation begin only after the product owner approves this plan. The already approved runtime stack includes React, React DOM, Motion, and the Tailwind integration; no additional runtime dependency will be added without separate approval.
