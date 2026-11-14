# Round 2 fixes

Work is on `main`. Design-site files that were already dirty were left unstaged.

## Commits

| Part | Commit | What |
| --- | --- | --- |
| A | `959f9ab` | Level-1 gravity is 1500 ms |
| B | `a3246aa` | A top-out after 80% is a win |
| C | `a62df0e` | Names are capped at 5 letters |
| D | `92ad38d` | Stencil timeout, pause cover, floor-kick lock |
| E | `46ed808` | Name outline and a larger board inside the cabinet |
| F | `c383933` | Name-field border and help keyboard |
| G | `a10d78c` | Tutorial on every Start, and reset |
| Check | `1a68985` | Test types so `tsc` passes |
| Check | `7440eb4` | Pause-cover state is cleared in the effect cleanup so lint passes |

## Status

- A done
- B done
- C done
- D done
- E done. Cell size at 1280×800 is 29.9px. See the layout table.
- F done. F2 (no silent trim) was already in the Part C commit.
- G done

## Gravity

`level1GravityMilliseconds` is 1500. Decay stays 0.85. Floor stays 80. `fullBankSlowZoneGravityMultiplier` stays 0.5.

| Level | Interval (ms) |
| ---: | ---: |
| 1 | 1500 |
| 2 | 1275 |
| 3 | 1084 |
| 4 | 921 |
| 5 | 783 |
| 6 | 666 |
| 7 | 566 |
| 8 | 481 |
| 9 | 409 |
| 10 | 347 |
| 15 | 154 |
| 18 | 95 |
| 19+ | 80 |

## Name-length simulation

Copied from the prompt. Not re-run.

| Letters | Name | Cells | Sloppy wins | Sloppy % | Greedy wins | Greedy % | Sloppy median lines to 80% |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 2 | II | 24 | 198/200 | 99.0 | 200/200 | 100 | 9 |
| 2 | MM | 40 | 195/200 | 97.5 | 198/200 | 99.0 | 10 |
| 3 | MAX | 60 | 189/200 | 94.5 | 195/200 | 97.5 | 14 |
| 4 | JAYA | 72 | 185/200 | 92.5 | 191/200 | 95.5 | 16 |
| 4 | MMMM | 80 | 164/200 | 82.0 | 170/200 | 85.0 | 20 |
| 5 | HARSH | 100 | 155/200 | 77.5 | 169/200 | 84.5 | 22 |
| 6 | PANEER | 120 | 133/200 | 66.5 | 153/200 | 76.5 | 26 |
| 7 | PAKORAS | 140 | 120/200 | 60.0 | 141/200 | 70.5 | 30 |
| 8 | NAMETRIS | 148 | 91/200 | 45.5 | 124/200 | 62.0 | 33 |
| 9 | MUMBAIKAR | 172 | 58/200 | 29.0 | 97/200 | 48.5 | 38 |
| 10 | HARSHDEEPS | 200 | 44/200 | 22.0 | 71/200 | 35.5 | 44 |

HARSH is 100 cells. Sloppy 155/200 is 77.5%. Six letters (PANEER, 120 cells) is 66.5%. The cap is 5.

## Layout measurements

No horizontal page scroll at any of these sizes. All 7 name-outline rows were on screen. The board was fully on screen. The cabinet frame, bezel, grilles, POWER lamp, and key panel were not restyled.

| Viewport | Cell px | Board % of viewport | Notes |
| --- | ---: | ---: | --- |
| 1536×864 | 31.5 | 14.9 | 7 rows, none clipped |
| 1440×900 | 32.9 | 16.7 | 7 rows, none clipped |
| 1366×798 | 29.8 | 16.3 | 7 rows, none clipped |
| 1280×800 | 29.9 | 17.5 (25.4% of the CRT screen) | See below |
| 1280×720 | 26.0 | 14.7 | 7 rows, none clipped |
| 1280 at 110% (layout 1164×727) | 26.4 | 16.4 | 7 rows, none clipped |
| 1280 at 150% (layout 853×533) | 4.7 | board fully visible | 7 rows visible. Screen content is 377px tall because the cabinet chrome stays |
| 960×800 | 29.9 | 23.3 | Side by side. Stack starts at 959px |
| 768×1024 | 19.1 | name strip above the board | 7 rows inside the strip. Stats scroll under the name |
| 720×900 | 14.1 | 6.1 | 7 rows, none clipped |
| 480×854 | 21.3 | 22.2 | 7 rows, none clipped |
| 390×844 | 20.9 | 26.5 | 7 rows fit inside the name frame, including HARSH at 29 columns |
| 393×852 loss | — | — | Full card, no page scroll |
| 1280×800 loss | — | — | Full card, no page scroll |

At 1280×800 the CRT content area is about 641px tall. After slimming the in-screen header, the board fit is 611px. The frame border and padding take 12px of that, so the cell is (611 − 12) / 20 = 29.95, measured 29.9. Width would allow about 33px. The cabinet bezel and console were left alone, so 30px does not fit. 29.9 is the largest cell that keeps the 7-row outline on screen.

SEND LINE sits on the right, just under the deadline. TOO HIGH sits in the top-left corner of the red wash. SHIFT sits in the top-right corner. The three labels do not overlap each other. TOO HIGH covers about 3 cells of the top row and SHIFT covers about 2. Those cells are the wash the labels are supposed to sit in.

The loss card at 393×852 shows `STACK OVERFLOW` at 40px, the sentence “The stack reached the top before you claimed the name.”, the percent, the stencil, score, time, lines, level, and both buttons. The buttons are 44px tall. The card does not need an inner scroll. The same sentence is on the in-game “Run over” overlay and on the 1280×800 card (title 50px).

## Contrast

Name field border is `#d4523d` on all four sides (1px top and sides, 2px bottom).

- Against the field `#1a1614`: 4.34:1
- Against the screen `#080b09`: 4.78:1

Think-time seconds are `#ffc45d` on `#060806`: 12.73:1. Reset copy is `#fff5dc` on `#080b09`: 18.21:1.

## What I could not test

- Deploy of `0f50ef5` succeeded. [Run 43615024620](https://github.com/paneerpakoda/nametris/actions/runs/43615024620): build passed `npm run check`, then GitHub Pages deployed. This file's own commit is a record of that run.
- I did not re-run the name-length bot. The table above is the one from the prompt.
- Phone coarse-pointer emulation did not turn on the touch Pause control in this browser. The CSS sets that control to 44×44 when `(hover: none) and (pointer: coarse)` matches.
- Cabinet before/after was compared by eye on the live cabinet with the screen filled. The frame, bezel, grilles, POWER lamp, cream body, and key panel match the existing cabinet. I did not take a masked screenshot pair.

## Deviations from the prompt

- Design-site files were already dirty and were not edited or committed. `DesignSite.tsx` still has an en-dash “2–10 letters” string and imports `nameRuleMessage`, which now says 2-5.
- Docs that described a 10-letter name as valid were updated to 5 (`docs/design/design-system.md`, `docs/design/welcome-screen.md`, `docs/specs/nametris-game-spec.md`, `docs/intent/nametris.md`).
- The privacy test name changed from “Private” to “PRIVY” so the stored value matches the typed name under the 5-letter cap.
- The alphabet composition test uses `II` (24 cells) and `MMMMM` (100 cells, 29 columns) instead of `ABCDEFGHIJ`.
- `validatePlayerName` no longer slices. It trims, uppercases, and tests the raw string. `lettersOnlyName` still slices for the field.
- A stored 6–10 letter name is trimmed to 5 and the notice is kept in `sessionStorage` key `nametris.nameTrimNotice`, because React Strict Mode reads storage twice. Reset also clears that session key. The prompt only required clearing `localStorage` keys that start with `nametris.`.
- Returning to welcome within the 2 second trim alert can show “Maximum 5 letters” again.
- At 1280×800 the cell is 29.9px. The CRT content area cannot hold a 30px cell and the 7-row outline together.
- On desktop widths the “TETRIS BOARD” heading is visually hidden (it stays available to screen readers), and the header mark and sound button are shorter, so the board can use that height. The cabinet chrome breakpoint stays 699px.
- Stacked layout starts at 959px. The name is a strip at most 240px tall (188px when the window is under 640px tall). Stats under the name scroll inside that strip. Stacked name cells are capped at 12px, and at 9px when the window is shorter than 640px, so a 29-column name still fits.
- The stacked board cell floor is 8px, and 4px when the window is under 640px tall, so a short screen does not clip the board. At 150% zoom on 1280×800 the measured cell is 4.7px.
- On stacked windows under 640px tall, the board heading is visually hidden so the fit can use the panel.
- The loss stencil on screens under 480px wide uses equal columns of the card width so a 29-column name does not force the card past the screen.
- TOO HIGH and SHIFT occupy the corner cells of the top wash. They do not overlap each other or SEND LINE.
- `nametris.howItWorksSeen` is still written when the tutorial finishes, so reset can delete it. It no longer decides whether Start shows the tutorial. Every Start shows the three screens. Restart and Play again do not.
- Reset restores sound in memory (on, 50%, unmuted) and notifies the audio engine. It does not reload the page.
- Reset clears the sessionStorage trim notice as well as every `nametris.` localStorage key.
- The floor-kick and stencil-timeout tests needed explicit types so `tsc -b` accepts them. Behaviour is unchanged.
- The pause-cover flag is cleared in the effect cleanup. The cover still appears after 15 seconds and clears as soon as the pause ends.
- The `topout-eighty` browser fixture now wins, because finish is already available. A `topout` fixture with finish unavailable still loses, and the loss cabinet screenshot uses that fixture.
