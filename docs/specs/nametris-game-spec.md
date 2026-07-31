# Spec: Nametris Desktop Game

Status: Approved by the product owner on 30 July 2026.

Source of truth for confirmed product intent: [`docs/intent/nametris.md`](../intent/nametris.md)

## Approved Implementation Assumptions

The product intent is confirmed. The product owner approved the following implementation defaults on 30 July 2026:

1. Use React 19.x, TypeScript 5.x in strict mode, and the current stable Vite release.
2. Use Tailwind CSS 4.x for styling and Motion 12.x for spring tilt and hover animation.
3. Use React context plus `useReducer` for session orchestration; keep all gameplay rules in pure TypeScript modules rather than Redux.
4. Render both boards as semantic DOM/CSS grids rather than `<canvas>`.
5. Use the modern seven-bag piece generator and a practical subset of Super Rotation System wall kicks.
6. Award one transfer per cleared line, so a two-, three-, or four-line clear earns two, three, or four transfers.
7. Let the player route a piece while any part remains above a visible deadline after the top seven board rows. Pressing the route control pauses gravity and enters stencil-placement mode.
8. Use free four-direction grid movement without gravity in the stencil.
9. Automatically finish the run at 100%.
10. Do not include piece hold, audio, a leaderboard, or saved game restoration in the first release.
11. Keep the entered name in memory only. Do not persist it to `localStorage` in the first release.
12. Use a replaceable modern-retro visual token set until a specific art direction is approved.

These defaults are binding for the first implementation unless changed through an approved spec update.

## Objective

Create a polished desktop-browser game in which classic Tetris play powers a second name-building board. The player clears lines to earn transfer credits, selectively routes newly spawned pieces into a block-letter stencil, and chooses whether to secure success after 80% or risk continuing toward a perfect 100%.

The experience is for casual players and should:

- Feel recognizable as Tetris without copying the obsolete architecture of the reference implementation.
- Explain its unique transfer mechanic with minimal interruption.
- Make a five-letter run take roughly 3–5 minutes after the player understands the controls.
- End with a shiny, personalized, locally generated reward card.

## Product Principles

1. **Familiar first:** normal-board movement should feel immediately recognizable.
2. **One meaningful choice:** every usable spawned piece asks, “board or name?”
3. **Personal, not invasive:** personalization comes from the stencil and card; the name never leaves the device.
4. **Forgiving at 80, aspirational at 100:** minimum completion is accessible while perfection remains difficult.
5. **Reward the player positively:** every successful title should feel flattering, never like a consolation prize.
6. **Deterministic rules:** the same state and input must always produce the same engine result, enabling reliable tests.

## Supported Platform

- Desktop browsers only.
- Target the latest two stable releases of Chrome, Edge, Firefox, and Safari.
- Minimum viewport target: 1180 × 720 CSS pixels.
- Keyboard is the primary input.
- Mouse is used for menus, buttons, and reward-card hover.
- Mobile layouts and touch controls are explicitly out of scope.

## Player Journey

### 1. Welcome and name entry

Show:

- Game title and one-sentence premise
- Optional name input
- `HARSH` as the visible default
- Privacy text: “Your name stays on this device.”
- Start button
- Controls/help entry point

Input rules:

- Trim leading and trailing whitespace.
- Convert valid input to uppercase.
- Accept only `A`–`Z`.
- Accept 2–10 letters.
- Starting with an empty input uses `HARSH`.
- Invalid non-empty input shows an inline, accessible error and does not start.
- Never include the entered value in a URL, log statement, analytics payload, error-reporting context, or network request.

### 2. First-run guidance

Use lightweight contextual hints instead of a long tutorial:

1. Point out that line clears earn transfers.
2. When the first transfer is earned, highlight the route-to-name control.
3. On the player's first stencil entry, show move, rotate, lock, and cancel controls.
4. Never show the same hint again during the current run.
5. Hints may be dismissed and must pause gameplay when they require reading.

### 3. Active game

The game screen contains:

- Normal Tetris board on the left
- Name stencil on the right
- Current score
- Lines cleared
- Level
- Available transfers
- Stencil completion percentage
- Active playtime
- Next-piece preview
- Controls/help and pause controls
- A contextual route-to-name prompt when routing is allowed
- A finish button that appears only at 80% or higher

### 4. Successful finish

- At 80–99%, the player explicitly chooses the visible finish button.
- Reaching 80% does not open a modal, pause gameplay, steal focus, or require confirmation to continue.
- At 100%, the run finishes automatically after a short completion animation.
- Freeze the final score, playtime, completion, and performance metrics.
- Generate the reward title and card locally.

### 5. Loss

- The run is lost when a new normal-board piece cannot spawn or when a locked piece occupies the top-out region.
- Topping out after reaching 80% still loses the run if the player did not finish.
- The loss screen shows progress, score, and playtime without issuing one of the eight success titles.
- Provide replay and new-name buttons.

### 6. Reward

Show the animated reward card centered in a dedicated result view. Place all action buttons outside the card.

Actions:

- `Play again` — same name
- `Try another name` — return to name entry
- `Download card` — create a local PNG or SVG download
- `Copy result` — copy a short text summary without contacting a server
- `Share` — use the browser share API only when available and only after a user click; otherwise copy locally

## Gameplay State Model

```text
WELCOME
  -> PLAYING_BOARD
       -> PAUSED
       -> PLACING_STENCIL
            -> PLAYING_BOARD (cancel: transfer preserved, same piece)
            -> PLAYING_BOARD (lock: transfer spent, next piece spawns)
       -> READY_TO_FINISH (80–99%; gameplay remains active)
       -> WON (finish click or automatic 100%)
       -> LOST (top-out before finish)
  -> RESULT
```

`READY_TO_FINISH` is a capability flag layered onto active play, not a blocking screen.

## Normal Tetris Rules

### Board and pieces

- Board: 10 columns × 20 visible rows with hidden spawn rows as required by rotation logic.
- Pieces: `I`, `O`, `T`, `S`, `Z`, `J`, and `L`.
- Piece source: deterministic seven-bag generator with injectable seeded random source for tests.
- Show the next piece.
- No piece hold in version one.
- Show a ghost landing position.

### Movement

- Horizontal movement
- Soft drop
- Hard drop
- Give each hard drop a subtle, brief gameplay-surface shake; remove the motion when reduced motion is requested.
- Clockwise and counter-clockwise rotation
- Wall kicks sufficient for expected modern Tetris behavior
- Lock delay with reset cap to prevent indefinite stalling

### Line clearing and level

- Lock valid pieces into the board.
- Clear every full row after lock.
- Add one transfer for each row cleared.
- Increase level every ten cleared rows.
- Increase gravity by level while preserving a playable minimum interval.
- Pause automatically when the document becomes hidden; resume only after explicit player input.

### Proposed scoring

- One line: `100 × level`
- Two lines: `300 × level`
- Three lines: `700 × level`
- Four lines: `1500 × level`
- Soft drop: 1 point per manually dropped cell
- Hard drop: 2 points per dropped cell
- Successful stencil lock: no direct score; the transferred piece is already valuable

Scoring constants must live in one configuration module and be easy to tune after playtesting.

## Transfer Economy

- A run begins with zero transfers.
- Each cleared row adds one transfer.
- Transfers accumulate up to a bank limit of three.
- At `3 / 3`, highlight the transfer metric and NAME panel with a persistent prompt to route a piece.
- Additional cleared rows still score and count normally but cannot add transfers while the bank is full.
- Show concise arcade-style feedback over the lower board for transfers earned on a clear and transfers lost because the bank had no room.
- Routing a piece is allowed only when at least one transfer is available.
- Routing must be an affirmative action; ordinary Tetris play continues without a board/name confirmation dialog.
- When routed, the exact spawned piece type moves to stencil-placement mode.
- The normal board and gravity pause during stencil placement.
- Active playtime continues during stencil placement but excludes explicit pause/help time and hidden-tab time.
- A successful stencil lock spends exactly one transfer.
- Canceling returns the same piece type to its normal spawn state and spends nothing.
- The board does not advance to the next piece until the routed piece is locked into the stencil.
- A lock is available whenever at least one piece cell overlaps an open stencil cell. Cells outside the mask or over filled cells are trimmed.
- A lock that would add no new stencil cells is rejected and spends nothing.

### Routing window

Shade the top seven visible board rows and draw a labeled route-deadline line beneath them. The route control remains available while any part of the active piece is above that line. Once the whole piece crosses it, the piece is committed to the normal board.

This gives the player several visible gravity steps to make the decision and makes the remaining window spatially predictable at every level.

## Stencil Rules

### Mask

- Render the complete uppercase name as a grid mask.
- A mask cell is either outside the stencil, empty and fillable, or filled.
- Keep visible spacing between letters while presenting the name as one composition.
- Scale cell size to fit 2–10 letters in the available desktop area.
- Never allow horizontal page scrolling during play.

### Tileability requirement

Every supported name must be capable of reaching exactly 100%.

To guarantee this:

- Author a custom `A`–`Z` block-glyph set whose fillable cells are exact-cover tileable by the supported pieces.
- Keep each individual glyph tileable so concatenating valid glyphs remains tileable.
- Make each glyph's fillable cell count divisible by four.
- Add an exact-cover/backtracking validator used in tests or build tooling.
- Fail tests if any glyph is not tileable.
- Do not ship a glyph merely because it visually resembles a letter; 100% must be mechanically possible.

Visual legibility and tileability are both acceptance requirements.

### Piece placement

- Stencil pieces have no gravity.
- Allow movement up, down, left, and right.
- Allow clockwise and counter-clockwise rotation.
- Keep piece cells that overlap open fillable stencil cells.
- Trim piece cells that lie outside the mask or overlap already-filled cells.
- Show kept and trimmed cells as distinct previews and state both counts before lock.
- Enable lock when at least one new stencil cell will be filled.
- Reject a zero-progress lock and do not spend a transfer.
- Canceling is always available before lock.
- Once locked, a stencil piece cannot be removed in version one.

### Completion

```ts
completion = filledStencilCells / totalFillableStencilCells;
displayPercent = Math.floor(completion * 100);
```

- Unlock finish when the exact ratio is at least `0.8`; do not rely on rounded display text.
- Keep play uninterrupted at 80%.
- Show an unobtrusive celebratory state and enable the finish button.
- Automatically finalize at an exact ratio of `1`.

## Keyboard Controls

Proposed defaults:

### Normal board

- `ArrowLeft` / `A`: move left
- `ArrowRight` / `D`: move right
- `ArrowDown` / `S`: soft drop
- `Space`: hard drop
- `ArrowUp` / `X`: rotate clockwise
- `Z`: rotate counter-clockwise
- `Shift`: route eligible piece to the name
- `P` / `Escape`: pause

### Stencil

- Arrow keys / `WASD`: move in four directions
- `X`: rotate clockwise
- `Z`: rotate counter-clockwise
- `Enter` / `Space`: lock
- `Escape`: cancel and return to board

Requirements:

- Prevent browser scrolling for handled game keys only while game focus is active.
- Do not trigger actions from repeated keydown events where repetition is inappropriate.
- Release held-input state on blur and visibility change.
- Display controls in the interface and help panel.
- Keep buttons operable by keyboard even though gameplay itself is keyboard-first.

## Performance Metrics

Capture locally for title selection:

- Completion ratio
- Final score
- Active playtime
- Lines cleared
- Level
- Number of four-line clears
- Routed attempts
- Successful stencil locks
- Canceled routes
- Distinct piece types locked into the stencil
- Maximum normal-board stack height
- Stencil cells filled

Do not persist these with the player's name or send them remotely.

## Eight Quirky Player Titles

All titles are positive. Selection is deterministic and uses normalized performance metrics so longer names are not inherently penalized.

Initial normalized metrics:

```ts
secondsPerStencilPiece =
  activeSeconds / Math.max(successfulStencilLocks, 1);

scorePerClearedLine =
  score / Math.max(linesCleared, 1);

placementEfficiency =
  successfulStencilLocks / Math.max(routedAttempts, 1);
```

### Successful 80–99% titles

Evaluate in this stable priority order:

1. **Stencil Sorcerer** — completion is at least 95%.
2. **Turbo Typesetter** — `secondsPerStencilPiece <= 15`.
3. **Line-Dance Legend** — at least one four-line clear or `scorePerClearedLine >= 450`.
4. **Shape Whisperer** — `placementEfficiency >= 0.8` and at least six distinct piece types were locked into the stencil.
5. **Block-Poet** — warm, prestigious fallback for every other successful 80–99% run.

### Exclusive 100% titles

Evaluate in this stable priority order:

6. **The One-Hundred Wonder** — `secondsPerStencilPiece <= 13`.
7. **Pixel-Perfect Name Alchemist** — `scorePerClearedLine >= 550`.
8. **Crowned Blocksmith** — prestigious fallback for every other perfect run.

### Selection requirements

- Evaluate perfect-title rules before non-perfect rules.
- Define pace as active seconds per stencil cell or per required routed piece, not raw run time.
- Define score performance relative to lines and/or name size, not raw score alone.
- Keep threshold constants in one configuration module.
- Use the stable priority order above when multiple specialist rules qualify.
- Add unit tests for every title and all boundary values.
- Treat the numerical thresholds above as initial tuning values. Change them only through an approved spec update informed by playtesting.

## Reward Card

### Content inside the card

- Small `NAMETRIS` eyebrow/brand
- Player's completed block-name composition
- Main quirky title
- Final score
- Active playtime
- Badge:
  - `NAME COMPLETE · NN%` for 80–99%
  - `PERFECT · 100%` for perfect runs

Do not put replay, download, copy, share, or new-name buttons inside the card.

### Interaction

Use the Unlumen UI Tilt Card as an interaction reference:

- Spring-based 3D tilt follows pointer position.
- Radial shine follows hover.
- Motion returns smoothly to rest on pointer leave.
- Tilt remains subtle enough to keep text readable.
- The card is fully readable and attractive without hover.
- Disable pointer tilt for keyboard focus.
- Respect `prefers-reduced-motion` by removing tilt and moving shine while retaining a static premium finish.
- Avoid continuous idle animation that consumes resources or distracts from the result.

### Local export

- Generate the export locally.
- Prefer a deterministic SVG export assembled from final result data; rasterize locally only when PNG is required.
- Do not call a screenshot or image-generation service.
- Omit interactive hover state from the exported artifact.
- Use the same content and visual tokens as the on-screen card.

## Visual and Interaction Design

Proposed direction until separately approved:

- Modern-retro arcade character without imitating the visual design of the reference repo
- Dark neutral background
- Bright but accessible piece colors
- High-contrast stencil outline
- Subtle grid texture
- Premium holographic reward surface
- Clear typography outside the block-letter name

Use design tokens for:

- Background and surface colors
- Seven piece colors
- Stencil empty/filled/invalid states
- Spacing
- Grid cell size
- Border radii
- Shadows and glow
- Motion duration and spring settings
- Z-index layers

Do not make the reward card's shine or gameplay state depend on color alone.

## Accessibility

- Provide visible focus states for every control.
- Use real buttons and labels.
- Associate validation errors with the name input.
- Announce line clears, transfers earned, 80% availability, successful completion, and loss through a restrained `aria-live` region.
- Provide text/icon differences in addition to color for valid and invalid stencil placement.
- Respect `prefers-reduced-motion`.
- Pause on hidden-tab state and never surprise the player with background game-over.
- Maintain at least WCAG AA contrast for text and essential controls.
- Keep the core experience usable at 200% browser zoom within the supported desktop viewport.

## Privacy and Security

- Keep the name in React memory for the active session only.
- Do not write the name to `localStorage`, `sessionStorage`, IndexedDB, cookies, URLs, service-worker caches, console logs, telemetry, or error-reporting metadata.
- Do not add analytics or remote error reporting without explicit approval and a privacy review.
- Validate by allowlist (`A`–`Z`, length 2–10), not by attempting to remove unsafe characters.
- Render player input as text/data, never as HTML.
- Keep export generation local.
- Audit third-party components before installation.

## Architecture

### Design

Use a deterministic functional core with a thin React UI:

- Pure engine modules own board rules, collision, rotation, line clearing, scoring, stencil legality, completion, title selection, and state transitions.
- React owns rendering, input adaptation, timing orchestration, focus, and menus.
- Randomness and time are injected into pure logic.
- Do not put game rules in components or CSS classes.
- Avoid one giant context that rerenders both grids on every unrelated UI change; split state selectors or isolate fast-changing render surfaces.

### Proposed project structure

```text
docs/
  intent/nametris.md
  specs/nametris-game-spec.md
src/
  app/
    App.tsx
    routes.ts
  components/
    Button.tsx
    Dialog.tsx
    Metric.tsx
  features/
    onboarding/
    gameplay/
    reward/
  game/
    config/
      controls.ts
      scoring.ts
      titles.ts
    engine/
      bag.ts
      board.ts
      collision.ts
      rotation.ts
      scoring.ts
      stencil.ts
      titles.ts
      session.ts
    glyphs/
      alphabet.ts
      exactCover.ts
    model/
      types.ts
    runtime/
      clock.ts
      input.ts
  styles/
    tokens.css
    globals.css
  test/
    fixtures/
e2e/
  gameplay.spec.ts
public/
```

Keep tests beside pure modules as `*.test.ts`; use `e2e/` only for browser flows.

### Core model sketch

```ts
export type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export interface Cell {
  readonly row: number;
  readonly column: number;
}

export interface RunResult {
  readonly name: string;
  readonly completion: number;
  readonly score: number;
  readonly activeMilliseconds: number;
  readonly title: PlayerTitle;
}

export function canLockIntoStencil(
  mask: ReadonlySet<string>,
  filled: ReadonlySet<string>,
  pieceCells: readonly Cell[],
): boolean {
  return pieceCells.every((cell) => {
    const key = `${cell.row}:${cell.column}`;
    return mask.has(key) && !filled.has(key);
  });
}
```

Conventions:

- Prefer domain names (`transferCount`, `stencilMask`) over generic names (`data`, `items`).
- Use immutable inputs and return new state.
- Model impossible states with discriminated unions where practical.
- No non-null assertions in engine code.
- Keep tuning values in typed configuration.
- Use named exports for engine modules.
- Components use PascalCase; functions and variables use camelCase; constants use camelCase unless truly global.

## Tech Stack

Proposed version families:

- React 19.x
- React DOM 19.x
- TypeScript 5.x with `strict: true`
- Vite, current stable release at scaffold time
- Tailwind CSS 4.x
- Motion 12.x
- Vitest, current stable release
- React Testing Library, current stable release
- Playwright, current stable release
- ESLint 9.x with flat configuration
- Prettier 3.x

Use exact versions in the lockfile once the project is scaffolded.

Do not use the reference repo's React 15, Redux 3, Immutable 3, or Webpack 1 dependencies.

## Commands

The implementation must define and maintain these scripts:

```bash
npm run dev
npm run build
npm run preview
npm run typecheck
npm run lint
npm run format:check
npm run test -- --run
npm run test:coverage
npm run test:e2e
npm run check
```

`npm run check` must run type checking, linting, formatting validation, unit tests, and a production build. Browser tests may remain a separate command if CI/runtime cost warrants it.

The repository currently contains documentation but no application scaffold. Do not allow a scaffolding command to erase `docs/`. Generate a Vite scaffold in a temporary directory and copy only required scaffold files, or create the small scaffold explicitly.

## Testing Strategy

### Unit tests

Use Vitest for:

- Seven-bag determinism and distribution
- Piece collision and legal movement
- Rotation and wall-kick boundaries
- Piece lock and line clearing
- Transfer awards for one through four lines
- Score and level boundaries
- Stencil legal/illegal placement
- Cancel preserving a transfer and piece type
- Lock consuming one transfer
- Exact completion threshold at 80%
- Automatic perfect completion at 100%
- Every player-title rule and tie-break
- Active timer excluding pause/hidden-tab time

### Glyph validation

- Validate all 26 glyphs with the exact-cover solver.
- Assert each glyph has a fill count divisible by four.
- Assert each glyph is legible in a maintained snapshot fixture.
- Test representative 2-, 5-, and 10-letter combined masks.

### Integration tests

Use React Testing Library for:

- Empty input starts `HARSH`.
- Invalid names are rejected accessibly.
- First line clear reveals/increments transfer UI.
- Spawned piece routes to stencil.
- Cancel returns the same piece without spending a transfer.
- Successful stencil lock spends one transfer.
- Reaching 80% enables finish without interrupting controls.
- Reward buttons remain outside the card.
- Reduced-motion mode disables moving card effects.

### End-to-end tests

Use Playwright with deterministic test hooks/seeds for:

- Start with `HARSH`, earn transfer, route, place, and return to board.
- Complete a fixture stencil to 80%, continue without interaction, then finish.
- Complete a fixture to 100% and auto-finish.
- Reach 80%, continue, top out, and lose.
- Download a reward artifact locally.
- Verify no request includes the entered name.
- Full keyboard operation of menus and game controls.

### Coverage

- Require at least 90% branch coverage for `src/game/engine`, `src/game/glyphs`, and title selection.
- No blanket global coverage target for visual components.
- A failing test may not be removed or weakened without explaining the changed requirement.

## Performance

- Maintain smooth input and rendering at 60 frames per second on a typical supported desktop.
- Do not rerender the full application on every animation frame.
- Use one game clock and accumulated elapsed time; do not create independent uncontrolled timers for each feature.
- Keep pointer-card effects on transform/opacity-friendly properties.
- Stop game and hover animation work when the page is hidden.
- Target production JavaScript under 250 KB gzip before optional export tooling; investigate regressions rather than silently raising the target.

## Reference Use and Licensing

### `chvin/react-tetris`

- Reference: <https://github.com/chvin/react-tetris>
- License declared in its package manifest: Apache-2.0.
- Useful concepts: matrix composition, collision/lock flow, line-clear scoring, keyboard timing, visibility pause, and local state restoration.
- Its dependency stack is obsolete and must not be used as the project foundation.
- Prefer an original typed implementation based on game rules.
- If any source is copied or closely adapted, preserve required Apache-2.0 notices and document the adapted file.

### Unlumen UI Tilt Card

- Reference: <https://ui.unlumen.com/components/tilt-card>
- Useful concepts: spring tilt, radial hover shine, and premium card composition.
- Verify the component/source license before copying code.
- If licensing is unclear, independently implement the interaction from the behavioral description rather than copying source.

## Boundaries

### Always do

- Read the confirmed intent and this spec before changing behavior.
- Update the spec before implementing changed requirements.
- Keep the gameplay engine deterministic and independently testable.
- Run `npm run check` before declaring an implementation task complete.
- Validate every supported glyph is 100% tileable.
- Keep the player's name on-device and out of logs.
- Respect reduced motion and keyboard accessibility.
- Preserve existing documentation during scaffolding.

### Ask first

- Add a runtime dependency.
- Change the transfer economy, completion threshold, scoring, or title rules.
- Persist the player's name or add any telemetry.
- Add audio, mobile support, piece hold, save/resume, a backend, accounts, or leaderboards.
- Copy source from either reference instead of implementing original code.
- Change supported browsers or minimum viewport.
- Raise performance budgets or lower engine coverage requirements.

### Never do

- Upload, log, or automatically share the player's name.
- Put the name in a URL or remote error payload.
- Use `dangerouslySetInnerHTML` for player content.
- Replace the modern stack with the reference repo's obsolete dependencies.
- Consume a transfer for an invalid or canceled stencil placement.
- Make 100% mathematically impossible for a supported name.
- Interrupt gameplay with a modal at 80%.
- Put reward action buttons inside the card.
- Remove failing tests merely to obtain a green build.
- Delete `docs/` while scaffolding.

## Acceptance Criteria

### Setup

- A modern React/TypeScript project builds and runs using the documented commands.
- `npm run check` succeeds.
- Both reference URLs and any adapted-code notices are documented.

### Name and privacy

- Empty input starts a run with `HARSH`.
- Valid 2–10-character `A`–`Z` names start successfully and render uppercase.
- Invalid names show an accessible inline error.
- No network request, storage entry, URL, or log contains the name.

### Normal board

- All seven pieces move, rotate, soft-drop, hard-drop, lock, clear lines, and top out correctly.
- Piece generation uses a tested seven-bag.
- Score, level, next preview, ghost, and line count update correctly.

### Transfers and stencil

- Every cleared row awards one transfer.
- A piece can be routed while any part is above the visible seven-row deadline.
- Normal-board gravity pauses during stencil placement.
- Stencil locks keep open-mask cells, trim the rest, and spend one transfer.
- Zero-progress locks spend nothing.
- Cancel returns the same piece to the board and spends nothing.
- Every valid 2–10-letter name is capable of reaching 100%.

### Completion

- Exact 80% completion enables a finish action without pausing or interrupting play.
- The player may keep playing toward 100% without another action.
- Finishing at 80–99% succeeds.
- Topping out before finishing loses, even after 80%.
- Exact 100% auto-finishes.

### Reward

- Successful results receive exactly one of eight deterministic positive titles.
- Only the three perfect titles can appear at 100%.
- The card includes block name, main title, score, badge, and active playtime.
- Replay, new-name, download, copy, and share actions remain outside the card.
- Pointer hover produces subtle spring tilt and shine.
- Reduced-motion mode presents a static premium card.
- Export is generated locally and contains no interactive controls.

### Experience

- The default-name run is playtestable in approximately 3–5 minutes after onboarding.
- The transfer choice and 80% push-your-luck decision are understandable through the interface.
- No essential gameplay or reward information depends on color or motion alone.

## Non-Goals for Version One

- Mobile or touch support
- Authentication or user profiles
- Cloud saves, leaderboards, or multiplayer
- Backend APIs
- Name persistence
- Analytics or remote error reporting
- Internationalized name glyphs
- Spaces, punctuation, numbers, or accents
- Piece hold
- Audio/music
- Full game-state restoration after refresh

## Approved Review Decisions

The product owner confirmed all six proposed defaults on 30 July 2026:

1. Use the proposed modern tech stack and functional-core state approach, with exact stable dependency versions verified at scaffold time.
2. Use the proposed spawn-zone routing window and validate its usability during browser playtesting.
3. Automatically finish the run at exact 100% stencil completion.
4. Use the five regular and three exclusive perfect player-title names defined in this spec.
5. Use the modern-retro placeholder art direction.
6. Keep audio and name persistence out of scope.
