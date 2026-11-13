# Nametris Design System

Status: Shipping visual contract.

This is the Warm Ivory cabinet and Signal Red CRT. The game is a personal arcade machine: warm plastic in the room, a dark screen, and a name built out of familiar pieces. New UI uses these tokens. A new hex in a feature file is not a design decision.

## 1. Where the system lives

| File | Job |
| --- | --- |
| `src/styles/tokens.css` | Values the browser uses |
| `src/design/tokenContract.ts` | Approved values |
| `src/design/tokens.test.ts` | Fails if those two files disagree |
| `src/design/tokens.ts` | The same values for SVG export and motion code |
| `docs/design/design-system.md` | Roles, materials, and rules |
| `design.html` | Catalog of the foundations, components, and patterns. Dev server: `/design.html`. GitHub Pages: `/nametris/design.html`. |

Screen CSS may keep a historical literal until that rule is edited. When a rule is edited, replace a literal that already has a token. Do not add a third name for a color this document already names.

`--violet` and `--lime` are retired aliases. `--violet` is not the T piece. `--lime` is gold, not the S piece. New UI uses the names in this document.

## 2. Character

Nametris should feel like a cabinet you could stand in front of, not like a website wearing a pixel font.

- The room and the shell are warm ivory plastic.
- The screen is near-black, with phosphor red, amber, and route blue as the only signals.
- The player's name is the trophy. Display type is reserved for the name, the title, and the one primary action.
- UI copy is Space Mono, short, and mostly uppercase labels.
- One primary action per screen. Everything else is a key, a text button, or a quiet metric.
- Piece color helps the eye. Piece shape carries the meaning. Stencil legality uses a hatch, not a second red.
- Motion is short and causal. The reward card may tilt. The board may not idle-animate.

PP NeueBit is the display face. Space Mono is the UI face. Do not introduce a third family. The exported card uses Space Mono because the bitmap face is not embedded in the SVG.

## 3. Materials

Five materials. A control belongs to one of them.

### Stage

The page behind the machine. `--color-stage` (`#161714`) with a soft warm glow at the top of `.cabinet-stage`. It is not a second screen.

### Cabinet

Ivory plastic. `--color-ivory-400` fades into `--color-ivory-500`. Ink on the plastic is `--color-ink` (`#49341c`). Borders and highlights are `--color-ivory-300`. Text on plastic is 12px Space Mono, weight 700, uppercase, tracking `0.08em`.

### Bezel and keys

The bezel is a metal lip around the glass. Keys are dark keycaps (`--fill-keycap`, `--fill-keycap-face`) with a 7px radius (`--radius-medium`) and a 2px drop (`--color-key-shadow`). A key press travels in `--duration-press` (80ms) and brightens in `--duration-key` (120ms).

### CRT

The playfield, welcome, help, and results all sit on `--color-crt` (`#080b09`). Body text is `--color-ivory-100`. Secondary text is `--color-muted`. Scanlines, the RGB mask, and the vignette are part of `.cabinet-screen` and stay off on the compact layout.

### Phosphor

Red, amber, and route blue are light emitted by the screen. They label, warn, and direct. They are not plastic colors. Filled buttons use `--color-button`, which is paint, not phosphor.

## 4. Color

Contrast below is the pair against `--color-crt` unless another surface is named. Body text needs 4.5:1. Large display type and non-text UI need 3:1.

### Ivory and ink

| Token | Value | Use |
| --- | --- | --- |
| `--color-ivory-50` | `#fff8e9` | Text on the primary button, welcome focus ring |
| `--color-ivory-100` | `#fff5dc` | CRT text. 18.2:1 on the screen |
| `--color-ivory-200` | `#fff4df` | Line-clear sweep |
| `--color-ivory-300` | `#ffedcb` | Cabinet edge and highlight |
| `--color-ivory-400` | `#f0d3a7` | Cabinet face |
| `--color-ivory-500` | `#d6b88c` | Cabinet shade |
| `--color-cream` | `#ede6d3` | Exported name |
| `--color-muted` | `#c7baa1` | Secondary CRT text. 10.3:1 |
| `--color-muted-dim` | `#958a76` | Exported metric labels |
| `--color-ink` | `#49341c` | Text on ivory. 8.1:1 on `--color-ivory-400` |
| `--color-name` | `#ffffff` | Letters typed into the name field |

### Gold and amber

Display titles use `--fill-display-gold` and `--shadow-display-gold`, not a flat fill. The gradient runs `--color-gold-50` → `--color-gold-200` → `--color-gold-500`. Apply it with the `.type-gold` class or those two variables plus background clipping.

| Token | Value | Use |
| --- | --- | --- |
| `--color-gold-400` | `#f5c546` | Flat gold when a gradient cannot be used |
| `--color-amber` | `#ffc45d` | Warnings, full transfer bank, finish chrome. 12.5:1 |
| `--color-amber-deep` | `#e6b422` | Win plaque fill. Plaque ink is `--color-plaque-ink` (`#24180a`), 9.0:1 |
| `--color-focus` | `#ffd85c` | Focus ring on CRT. 14.3:1 |
| `--color-title` | `#f3a232` | Title line in the exported SVG, where the gold gradient is not used |
| `--color-finish` | `#fff4d6` | Finish-prompt copy |

### Signal reds

These reds are not interchangeable.

| Token | Value | Job |
| --- | --- | --- |
| `--color-phosphor` | `#ff6b54` | CRT text, open stencil, small screen accents. 7.1:1. Alias `--phosphor-red` |
| `--color-signal` | `#f04434` | Reward grid and the exported card frame |
| `--color-signal-hot` | `#ec4b37` | Gameplay hairlines. Frame, border, fill, and soft variants are the alpha tokens beside it |
| `--color-button` | `#b93a28` | Primary filled action. Ivory text is 5.4:1. Hover is `--color-button-hover` (`#c4402c`), 4.8:1 |
| `--color-danger-solid` | `#9d2418` | "Too high" tag |
| `--color-ember` | `#b51c1c` | Welcome glow. Alpha steps are `--color-ember-22`, `40`, `70`, and `80` |
| `--color-ember-shadow` | `#893128` | The hard drop under gold type |
| `--color-welcome` | `#e56d59` | Welcome supporting copy. 6.3:1 |
| `--color-welcome-deep` | `#d4523d` | Name-field underline and the start-button frame |
| `--color-error` | `#ff9d8e` | Field error. 9.9:1. The message also uses a `!` prefix |
| `--color-disabled-label` | `#a89a90` | Disabled welcome label |

Disabled welcome plastic uses `--color-button-disabled` for the frame and `--color-button-disabled-well` for the face. In-play disabled buttons are different: grayscale `0.75` and opacity `0.4`. Do not mix those two disabled treatments.

### Route blue

| Token | Value | Use |
| --- | --- | --- |
| `--color-route` | `#57b1ff` | The route deadline and route prompts. 8.6:1. Alias `--route-blue` |
| `--color-route-deep` | `#145d9e` | Route label chip. `--color-route-ink` on it is 6.4:1 |
| `--color-mark-glow` | `#3b82f6` | Only the welcome mark's outer glow |

Route blue means "send this piece to the name." Do not use it for focus, success, or links.

### Pieces

| Piece | Token | Value | On CRT |
| --- | --- | --- | --- |
| I | `--color-piece-i` | `#36cdd7` | 10.2:1 |
| O | `--color-piece-o` | `#f0c92e` | 12.3:1 |
| T | `--color-piece-t` | `#a65bd5` | 4.8:1 |
| S | `--color-piece-s` | `#46bf68` | 8.4:1 |
| Z | `--color-piece-z` | `#e85555` | 5.5:1 |
| J | `--color-piece-j` | `#377bd7` | 4.7:1 |
| L | `--color-piece-l` | `#ed762d` | 6.8:1 |

Blocks use `[data-piece="I"]` through `[data-piece="L"]`. T and J are graphic fills. Do not set small text in those two colors.

The brand mark uses a different quartet: `--color-mark-lime`, `--color-mark-red`, `--color-mark-yellow`, `--color-mark-blue`. The mark is a lockup. Do not recolor it to match the live pieces.

The exported card uses `pieceFill` from `src/design/tokens.ts`, so a downloaded name uses the same seven fills as the board.

## 5. Boards

### Playfield

| Token | Use |
| --- | --- |
| `--color-screen` | Well behind the grid |
| `--color-board-well` | Empty cell |
| `--color-board-line` | Cell grid |
| `--color-signal-hot-frame` | Frame around the board |
| `--color-stencil-edge` | Border of a filled mino |
| `--color-ghost` / `--color-ghost-border` | Ghost landing. Dashed, so it is not only a tint |
| `--color-danger-edge` | Top-out warning inset |

### Stencil

| `data-status` | Look | Meaning |
| --- | --- | --- |
| `void` | Hidden | Not part of the letter |
| `open` | Phosphor outline, `--color-stencil-open` fill | Still needs a block |
| `filled` | Piece fill plus `--color-stencil-edge` | Locked in the name |
| `preview-valid` | Same edge, brighter | This block will stay |
| `preview-lost` | Dashed `--color-lost` and a `--color-lost-90` hatch | This block will not stay |

Lost cells must keep the hatch. Color alone is not the legality cue.

## 6. Type

| Role | Face | Size | Line height | Case |
| --- | --- | --- | --- | --- |
| Wordmark and result name | `--font-display` | Fluid, from the screen CSS | 0.9 | Uppercase as typed |
| Overlay title | `--font-display` | `3.125rem` | 1.05 | Uppercase |
| Primary button | `--font-display` | 20px, or the welcome fluid size | 1 | Uppercase |
| Key legend | `--font-display` | 17px | 1 | As printed on the key |
| Body | `--font-ui` | 16px | 1.5–1.6 | Sentence case |
| Eyebrow, metric label, plaque | `--font-ui` | 12px, weight 700 | 1 | Uppercase, tracking `0.04em`–`0.08em` |
| Name field | `--font-display` | Fluid, at least 40px | 1 | Uppercase |

Space Mono is monospace, so scores, timers, and percents stay tabular without a separate figure style. Do not set display type below 20px. Do not set UI body below 16px. 12px is for labels that sit on a control, not for instructions.

Gold type is always clipped to the gradient. In forced colors, the global rule drops the gradient and uses `CanvasText`.

## 7. Space, cabinet, and breakpoints

New layout uses this scale. Existing clamps can stay until that layout is rebuilt.

| Token | Value |
| --- | --- |
| `--space-2xs` | 2px |
| `--space-xs` | 4px |
| `--space-sm` | 8px |
| `--space-md` | 12px |
| `--space-lg` | 16px |
| `--space-xl` | 24px |
| `--space-2xl` | 32px |
| `--space-3xl` | 48px |

The cabinet is at most `--cabinet-max` (1920px). The board cell is `--cell`: at least 14px, at most 36px, sized from the remaining viewport after `--chrome` and `--side`. Below 700px wide, `--chrome-compact` (374px) and `--side-compact` (96px) take over and the plastic shell is removed.

CSS media queries cannot read custom properties. These literals must stay equal to the tokens:

| Token | Value | Where it is repeated |
| --- | --- | --- |
| `--breakpoint-compact` | 699px | `globals.css`, `cabinet.css`, `gameplay.css` |
| `--breakpoint-console` | 1099px | `cabinet.css` hides the speakers and power lamp |
| `--breakpoint-short` | 800px | Short desktop cabinets in `cabinet.css`, `gameplay.css`, and `reward.css` |
| `--breakpoint-design-width` | 1180px | Minimum supported width. Not a media query |
| `--breakpoint-design-height` | 720px | Minimum supported height. Not a media query |

The product is desktop-first. The compact rules keep the screen usable when the cabinet chrome cannot fit. They are not a separate mobile visual language.

## 8. Shape, elevation, and focus

| Token | Value | Use |
| --- | --- | --- |
| `--radius-cell` | 2px | Minos and the mark |
| `--radius-hint` | 4px | Keyboard hint and metric |
| `--radius-control` | 6px | Help dialog |
| `--radius-medium` | 7px | Cabinet keys |
| `--radius-button` | 8px | Buttons and the name field |
| `--radius-card` | 10px | Reward card |
| `--radius-large` | 14px | Larger panels |
| `--radius-bezel` | 16px | Glass and bezel |
| `--radius-console` | 22px | Control deck |

Shadows:

- `--shadow-block` sits under mark cells.
- `--shadow-glow` is the only soft red halo for chrome.
- `--button-primary-inset` is the lit plastic face. `--button-primary-inset-pressed` swaps the light to the bottom edge.
- `--button-primary-glow` is the welcome button's ember halo.
- `--shadow-display-gold` is the title. `--shadow-display-gold-compact` is the small wordmark on the card. `--shadow-display-finish` is the finish prompt only.

Focus rings:

| Surface | Ring | Width | Offset |
| --- | --- | --- | --- |
| CRT controls | `--color-focus` | `--focus-width` (3px) | `--focus-offset` (3px) |
| Playfield | `--color-focus` | `--focus-width-field` (2px) | `--focus-offset` |
| Welcome field and start | `--color-ivory-50` | `--focus-width` | `--focus-offset`, or `--focus-offset-tight` (2px) on the start button |
| Cabinet keys | `--color-focus-ink` | `--focus-width` | `--focus-offset` |

Every control keeps a ring. Do not remove an outline to make a surface look cleaner.

## 9. Motion and depth

Durations are the motion scale. JavaScript reads them through `ms()` in `src/design/tokens.ts`. CSS animations use the variables.

| Token | Time | Use |
| --- | --- | --- |
| `--duration-instant` | 30ms | Grey-in |
| `--duration-press` | 80ms | Key travel |
| `--duration-lock` | 80ms | Soft-lock flash |
| `--duration-bump` | 90ms | Hard-drop bump |
| `--duration-trail` | 120ms | Hard-drop trail |
| `--duration-key` | 120ms | Key brighten |
| `--duration-flash` | 150ms | Empty-send flash, and the one reduced-motion color flash |
| `--duration-shine` | 160ms | Reward shine opacity |
| `--duration-pop` | 180ms | Score, name pop, edge, token, dust |
| `--duration-tick` | 200ms | Arrow fill, counter tick |
| `--duration-sweep` | 220ms | Cleared-row sweep |
| `--duration-flight` | 250ms | Piece fly, kept flare, speck |
| `--duration-letter` | 300ms | Letter flash, danger entrance |
| `--duration-level` | 400ms | Level ripple, marker pop |
| `--duration-grey` | 600ms | How long a greyed stack stays up |
| `--duration-word` | 700ms | Clear word |
| `--duration-clear` | 900ms | Line-clear receipt |
| `--duration-clear-reduced` | 1200ms | Line-clear receipt when motion is reduced |
| `--duration-pulse` | 1500ms | Danger pulse, long speck |
| `--duration-shift` | 1600ms | Shift-ready glow |
| `--duration-bank` | 1800ms | Full transfer bank |

Easing tokens are `--ease-out`, `--ease-in`, `--ease-linear`, `--ease-in-out`, and `--ease-press`. Entrances use ease-out. Exits and flights use ease-in.

The reward card spring is stiffness `230`, damping `24`, at most `7` degrees, perspective `900`. Keyboard focus flattens the card. `prefers-reduced-motion` and the app's reduced-motion setting remove the tilt and keep the card readable.

Reduced motion collapses animation duration to a single frame, then restores one `--duration-flash` color flash so a clear is still visible. Do not add a looping animation without a reduced-motion stop.

Depth inside a board uses `--z-raised` (1) through `--z-burst` (7). Screen layers are `--z-crt` (20), `--z-dialog` (30), and `--z-modal` (40). `--z-below` (-1) is only for a shine or keycap face painted behind its parent. A new overlay uses `--z-dialog` or `--z-modal`. It does not invent 50.

## 10. Components

### Primary button

Class: `.primary-button`.

Resting fill `--color-button`, label `--color-ivory-50` or the welcome gradient `--fill-button-label`, inset `--button-primary-inset`. Hover `--color-button-hover`. Press translates 2px and uses `--button-primary-inset-pressed`. The welcome button's face also carries `--button-primary-glow`. One primary button is the page action. A second filled button on the same surface has to be a real second decision, such as play again beside try another name, and the layout makes the first one dominant.

### Secondary and route

`.secondary-button` is a phosphor hairline: `--color-signal-hot-border` on `--color-signal-hot-fill`. `.route-button` uses the primary plastic treatment because routing is the meaningful choice.

### Name field

Label above the field. Placeholder is the default name, not the only label. Typed text is `--color-name` on `--color-field`. The underline is `--color-welcome-deep`. An invalid value turns that underline `--color-phosphor` and shows `--color-error` under the field. Focus is the ivory ring.

### Cabinet key

`.cabinet-key`. Dark keycap, display-face legend, ink focus ring. Disabled keys desaturate to `0.35` and drop to opacity `0.42`.

### Metric

`.metric`. Label upstairs, value downstairs, hairline `--color-signal-hot-soft`, fill `--color-metric-fill`. The value uses `--font-ui`.

### Help

`.help-dialog` on `--color-dialog` with a phosphor border and `--radius-control`. Titles use gold type. The dialog is `--z-dialog` and must close from the keyboard.

### Reward card

`.reward-card`. Phosphor frame, scanline fill, shine on `--z-below`. The badge text changes with the percent: `NAME COMPLETE · NN%` or `PERFECT · 100%`. Actions sit outside the card. The SVG export reads the same piece, plastic, signal, cream, and title tokens.

### Mark

`.nametris-mark`. Four cells, `--shadow-block`, the mark quartet. Compact mode is the card lockup. Do not rebuild the mark out of live piece colors.

## 11. Screens

### Welcome

Centered column on the CRT. Order: mark, gold wordmark, premise, name field, privacy line, one start button. The start label names the name that will be used. The mark glow is `--color-mark-glow` and stays on that image.

### Play

Board on the left, stencil on the right, metrics and the next piece in the chrome around them. Route blue appears only when a transfer can be spent. At 80% the finish action appears without a modal. At 100% the run ends itself after the completion motion.

### Pause, help, finish

Pause and help are `--z-dialog`. The finish prompt is `--z-modal` and may use `--shadow-display-finish`. Gameplay pauses underneath. Closing the surface returns focus to the game.

### Result

Gold heading, plaque, card, then actions. Loss shows progress without a success title. Both results use the CRT and the same type roles.

## 12. Voice

- Labels are short and uppercase: `SCORE`, `LINES`, `TRANSFERS`.
- The name is never described as a form field in the headline. The headline is the game.
- Success titles are flattering. Loss does not borrow them.
- Errors say what to fix. The name rule is `2–10 letters · A–Z only`.
- The privacy line stays exact: `Your name stays on this device.`
- Do not put the name in a URL, a log, or the exported filename's metadata beyond the card the player asked to save.

## 13. Accessibility

- Text pairs in the tables above meet WCAG AA. Re-check a pair before putting text on a new surface.
- Focus is always visible, using the ring for that material.
- The stencil's lost state has a hatch. The ghost has a dashed edge. Errors have text.
- `prefers-reduced-motion` is honored in CSS and in the reward spring. The app also mirrors that choice onto `.is-reduced-motion`.
- Buttons are buttons. The name error is tied to the field. Line clears, transfers, the 80% finish, completion, and loss are announced in the existing live region.
- Do not convey the route, the finish, or a lost block by color alone.

## 14. Changing the system

1. Change the value in `src/styles/tokens.css`.
2. Change the same entry in `src/design/tokenContract.ts`.
3. If a screen still paints the old literal, point it at the token.
4. Run `src/design/tokens.test.ts`.

A new role gets a new token with a job written into this document. It does not get a one-off hex. Palette primitives start with `--color-`. Motion starts with `--duration-`, `--ease-`, or `--spring-`. Depth starts with `--z-`.

If this document and the token files disagree, the token files win, and this document should be corrected in the same change.
