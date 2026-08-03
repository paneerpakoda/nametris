# NAMETRIS — Implementation Plan

## Context

Build a fully playable desktop web game called NAMETRIS. The core loop: play Tetris on the left board, clear rows to earn transfer credits, spend credits to stamp the current Tetris piece into a block-letter stencil of the player's name on the right. Win when ≥80% of the name stencil is filled; lose when Tetris blocks reach the top.

Prompt source: `src/imports/pasted_text/nametris-game.html`

## Aesthetic

**Stance:** Modern-retro arcade — dark navy background, CRT-adjacent pixel feel, brightly saturated piece colors, minimal glow only on active/winning states.

**Fonts (Google Fonts):**
- `Press Start 2P` — display/headings (pixel font, game titles, HUD labels)
- `Rajdhani` — body/numeric readouts (compact, legible, techy)

**Tokens (theme.css update):**
```
--background: #0d0f1a   (deep navy)
--foreground: #e8eaf0
--card: #161926
--primary: #4ade80       (neon green — win/active)
--accent: #facc15        (yellow — credits/score)
--border: rgba(255,255,255,0.08)
```

## Architecture

All code lives in `src/app/App.tsx` (single file, self-contained).

### State machine
`gamePhase`: `"welcome"` | `"playing"` | `"paused"` | `"name-placement"` | `"won"` | `"lost"`

### Key data structures

```ts
type Cell = null | string          // null = empty, string = piece color
type Board = Cell[][]              // 20 rows × 10 cols

type Piece = {
  shape: number[][]
  color: string
  x: number
  y: number
}

type NameGrid = {
  cells: boolean[][]               // true = this is a "letter cell" (part of the bitmap)
  filled: boolean[][]              // true = filled by a stamp
  cols: number
  rows: number                     // always 7
}
```

### Components (all in App.tsx)

| Component | Responsibility |
|---|---|
| `App` | Top-level state, keyboard handler, game loop (setInterval) |
| `WelcomeScreen` | Name input, start button, controls summary |
| `GameScreen` | Two-column layout: TetrisBoard + NameStencil + GameHUD |
| `TetrisBoard` | Renders 10×20 board + current piece + ghost |
| `NameStencil` | Renders name bitmap grid with filled/empty/preview states |
| `GameHUD` | Score, rows, credits, next piece, timer |
| `ResultOverlay` | Win/lose overlay with stats |

## Implementation Details

### 5×7 Bitmap Alphabet
Define a complete `BITMAP_FONT: Record<string, number[][]>` for A–Z. Each letter is 7 rows × 5 cols of 0/1. Render each character with a 1-pixel gap between letters.

### Tetris Pieces (PIECES constant)
```ts
I: { shape: [[1,1,1,1]], color: "#06b6d4" }
O: { shape: [[1,1],[1,1]], color: "#facc15" }
T: { shape: [[0,1,0],[1,1,1]], color: "#a855f7" }
S: { shape: [[0,1,1],[1,1,0]], color: "#4ade80" }
Z: { shape: [[1,1,0],[0,1,1]], color: "#f87171" }
J: { shape: [[1,0,0],[1,1,1]], color: "#3b82f6" }
L: { shape: [[0,0,1],[1,1,1]], color: "#f97316" }
```

### Game Loop
- `useEffect` with `setInterval` at 800ms tick for piece fall
- Clears interval on pause/name-placement/game-over
- Tab visibility change → auto-pause via `visibilitychange` event

### Transfer / Name-Placement Mode
1. User presses `N` with `credits > 0`
2. Set `gamePhase = "name-placement"`, copy current piece as `placementPiece` (initial position: center-top of name grid)
3. Arrow/WASD move `placementPiece` over the name grid
4. Compute `previewCells`: which piece squares overlap valid (unfilled) letter cells → valid; which are outside → shown as translucent
5. `Enter`/`Space`: if at least one new cell would be filled → apply fill, decrement credit, return to `"playing"` with a new piece spawned
6. `Escape`: cancel, return piece to board as-is, no credit spent

### Scoring & Timer
- `score += 100 * rowsCleared` per lock event
- `timer` tracked via `Date.now()` delta, paused correctly

### Win/Loss
- After each placement: recalculate `completion = filledCells / totalLetterCells * 100`; if ≥ 80 → `gamePhase = "won"`
- After each piece lock: check if any cell in row 0 is occupied → `gamePhase = "lost"`

## Files to Modify

1. **`src/app/App.tsx`** — entire game implementation (replace placeholder)
2. **`src/styles/fonts.css`** — add Google Fonts import for Press Start 2P + Rajdhani
3. **`src/styles/theme.css`** — update `:root` token values for arcade dark theme (preserve `.dark` block and `@theme inline`)

## Visual Layout (1440×900)

```
┌─────────────────────────────────────────────┐
│  NAMETRIS          [Pause] [Restart]         │  ← compact header
├─────────────────────┬───────────────────────┤
│                     │                        │
│   TETRIS BOARD      │   NAME STENCIL         │
│   (10×20, ~300px    │   (bitmap name,        │
│    wide)            │    completion %)        │
│                     │                        │
│   HUD below board:  │                        │
│   Score / Rows /    │                        │
│   Credits / Next    │                        │
│                     │                        │
└─────────────────────┴───────────────────────┘
```

Cell size: 28px. Board = 280×560px. Name stencil cells: 16px each.

## Verification

1. `npm run build` should complete with no TypeScript errors
2. Welcome screen: enter name or leave blank → starts with default HARSH
3. Pieces fall, move (←→), rotate (X/↑), soft drop (↓/S), hard drop (Space)
4. Clear a row → credits counter increments
5. Press N with credit → name-placement mode opens
6. Move piece over name letters → green preview on valid cells, red/translucent outside
7. Press Enter → cells fill, credit decrements, Tetris resumes
8. Press Escape → credit preserved, Tetris resumes unchanged
9. Fill ≥80% → win overlay with stats
10. Stack to top → loss overlay
11. Pause (P) → game freezes, timer stops
12. Restart → full state reset, back to welcome or fresh game
