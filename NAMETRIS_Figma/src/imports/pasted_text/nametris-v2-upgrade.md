Upgrade the existing NAMETRIS Version 2 prototype in place.

Do not rebuild it from scratch, reset the project, or replace the current modern-retro visual direction. Preserve the working welcome screen, dynamic A–Z name stencil, Tetris board, ghost piece, next-piece preview, keyboard controls, credits, timer, pause, and stencil-stamping behavior.

First inspect the current files and state model. Then implement the following missing features incrementally. Keep the preview working after each major change.

CORE COMPLETION LOOP

Replace the current immediate win at 80% with the intended push-your-luck system:

- At exact completion of 80% or higher, do not pause or end the game.
- Do not open a modal or steal keyboard focus.
- Display a noticeable but non-blocking celebration.
- Reveal a “FINISH NAME · NN%” button.
- Gameplay must continue automatically if the player does nothing.
- The player may click the finish button at any point from 80–99%.
- If the player continues but the Tetris board tops out before finishing, the run is lost.
- At exact 100%, automatically finish after a short celebration.
- Show a visible 80% marker on the stencil progress indicator.
- Change the supporting text from “WIN AT 80%” to language explaining that 80% unlocks finishing while 100% earns a perfect result.

TETRIS ENGINE UPGRADES

Improve the existing Tetris implementation without adding piece hold:

- Replace independent random pieces with a deterministic seven-bag generator.
- Support all seven standard pieces.
- Keep clockwise rotation on X or Up Arrow.
- Add counter-clockwise rotation on Z.
- Add basic wall kicks so rotations near walls work naturally.
- Add a short lock delay with a reset cap to prevent indefinite stalling.
- Keep soft drop, hard drop, ghost position, next-piece preview, collision, line clearing, and top-out.
- Increase the level every 10 cleared rows.
- Increase gravity speed by level while preserving a playable minimum interval.
- Replace the fixed 800ms setInterval loop with one accumulated game clock using requestAnimationFrame or another single controlled timing mechanism.
- Do not rerender the whole application on every animation frame.

SCORING

Replace the simple scoring with:

- One cleared row: 100 × current level
- Two rows together: 300 × current level
- Three rows together: 700 × current level
- Four rows together: 1500 × current level
- Soft drop: 1 point per manually dropped cell
- Hard drop: 2 points per dropped cell
- Stencil placement: no direct score

Display the current level in the HUD.

Keep scoring and gravity values in centralized configuration constants so they can be tuned easily.

CREDITS AND ROUTING

Preserve the revised routing behavior:

- Every cleared row earns one credit.
- Multi-row clears earn one credit per cleared row.
- The active piece may be routed at any time before it locks.
- N must work globally while gameplay is active, even when a gameplay button has pointer focus.
- Routing pauses board gravity and enters stencil-placement mode.
- The exact active piece, including its type, moves into the stencil.
- Active playtime continues during stencil placement.
- Canceling with Escape returns the exact piece to its previous board position and rotation.
- Canceling never spends a credit.
- A successful stencil placement spends exactly one credit.
- Pressing N without a credit produces a short visual hint.
- Do not introduce a timed routing window or confirmation dialog.

STENCIL PLACEMENT

Keep the lightweight clipped-stamping system instead of requiring all four cells to fit inside a letter:

- Stencil pieces have no gravity.
- Arrow keys or WASD move in four directions.
- X rotates clockwise.
- Z rotates counter-clockwise.
- Enter or Space locks the piece.
- Escape cancels.
- Preview only the currently empty letter cells that would be retained.
- Cells outside the letter, in letter holes, beyond the mask, or over filled cells are clipped.
- A placement is valid only when it adds at least one new letter cell.
- Invalid placement must not spend a credit.
- Once placed, stencil cells cannot be removed.
- Scale the complete name so every valid 2–10-letter composition remains visible without horizontal page scrolling.

FIRST-RUN GUIDANCE

Add lightweight contextual guidance:

- Explain that clearing rows earns credits.
- When the first credit is earned, briefly highlight the N route action.
- On the first stencil placement, show its movement, rotation, placement, and cancel controls.
- Pause gameplay only while a reading overlay is visible.
- Never repeat a dismissed hint during the same run.
- Add a compact Help button that pauses gameplay and displays both control sets.

PERFORMANCE METRICS

Track these locally for the final player title:

- Completion percentage
- Final score
- Active playtime
- Rows cleared
- Level
- Number of four-row clears
- Routing attempts
- Successful stencil placements
- Canceled placements
- Distinct piece types placed in the stencil
- Maximum board-stack height

Calculate:

secondsPerStencilPiece =
activeSeconds / max(successfulStencilPlacements, 1)

scorePerClearedLine =
score / max(rowsCleared, 1)

placementEfficiency =
successfulStencilPlacements / max(routingAttempts, 1)

PLAYER TITLES

Give every successful player exactly one positive, quirky title.

For 80–99%, evaluate in this order:

1. STENCIL SORCERER
   Completion is at least 95%.

2. TURBO TYPESETTER
   secondsPerStencilPiece is 15 or less.

3. LINE-DANCE LEGEND
   The player cleared four rows together at least once, or scorePerClearedLine is at least 450.

4. SHAPE WHISPERER
   placementEfficiency is at least 0.8 and at least six different piece types were placed in the stencil.

5. BLOCK-POET
   Positive fallback for every other 80–99% result.

For exactly 100%, only use these three exclusive titles:

6. THE ONE-HUNDRED WONDER
   secondsPerStencilPiece is 13 or less.

7. PIXEL-PERFECT NAME ALCHEMIST
   scorePerClearedLine is at least 550.

8. CROWNED BLOCKSMITH
   Prestigious fallback for every other perfect result.

Perfect titles must be evaluated before regular titles. Keep all thresholds in centralized configuration.

SUCCESS RESULT EXPERIENCE

Replace the basic success modal with a dedicated reward screen.

Create a premium personalized reward card inspired behaviorally by the Unlumen UI Tilt Card:

https://ui.unlumen.com/components/tilt-card

Do not copy external source unless its license is clearly compatible. Recreate the behavior independently if needed.

Inside the card, include only:

- Small NAMETRIS brand label
- The player’s completed block-built name
- Their quirky main title
- Final score
- Active playtime
- Completion badge:
  - “NAME COMPLETE · NN%” for 80–99%
  - “PERFECT · 100%” for perfect results

Card interaction:

- Add subtle spring-based 3D tilt following pointer position.
- Add a moving clipped shine highlight following hover.
- Return smoothly to rest on pointer leave.
- Keep all text readable during tilt.
- The static card must remain attractive without hover.
- Avoid continuous idle animation.
- Respect prefers-reduced-motion by disabling tilt and moving shine.
- Use transforms and opacity-friendly animation.
- Do not use CSS or SVG gradients; create shine using translucent clipped solid-color layers.

Place all actions outside the card:

- PLAY AGAIN — restart with the same name
- TRY ANOTHER NAME — return to name entry
- DOWNLOAD CARD
- COPY RESULT
- SHARE, when supported

LOCAL DOWNLOAD AND SHARING

- Generate the reward export entirely in the browser.
- Prefer a deterministic SVG assembled from final result data.
- The exported card must not contain buttons or hover state.
- Do not use a screenshot service or remote image-generation API.
- Download only after the player clicks Download.
- Copy Result should copy a short local text summary.
- Share should use navigator.share only after a player click.
- If sharing is unavailable, fall back to copying the result.
- Never upload the player’s name.

LOSS RESULT

Keep the loss result visually simpler than the success reward.

Show:

- GAME OVER
- Block-built name
- Completion percentage
- Score
- Rows
- Level
- Playtime
- PLAY AGAIN
- TRY ANOTHER NAME

Do not award one of the eight success titles after a loss.

PRIVACY

Preserve the privacy promise:

- Keep the name in memory only.
- Do not place it in localStorage, sessionStorage, IndexedDB, cookies, URLs, console logs, analytics, error payloads, or automatic network requests.
- Render the name as data/text, never raw HTML.
- Sharing and downloading must always be initiated by the player.
- Do not add accounts, analytics, telemetry, or backend services.

ACCESSIBILITY AND GAME SAFETY

- Use real buttons and form labels.
- Provide visible keyboard focus states.
- Associate validation errors with the name input.
- Add a restrained aria-live region for rows cleared, credits earned, 80% availability, victory, and loss.
- Do not communicate valid and invalid stencil placement through color alone.
- Prevent gameplay keys from scrolling the browser while gameplay is active.
- Release held-key state when the window loses focus.
- Automatically pause when the tab becomes hidden.
- Require explicit input before resuming after returning to the tab.
- Respect prefers-reduced-motion.
- Maintain readable contrast.

DESKTOP VIEWPORT

The entire game must fit in the available desktop preview without page scrolling.

- Support viewports down to approximately 900 × 600.
- Scale board-cell size from available viewport height.
- Keep all 20 Tetris rows visible.
- Treat visibility of the bottom rows as the highest priority.
- Keep both boards, essential HUD information, and controls accessible.
- Maintain the current side-by-side desktop composition.
- Do not add a mobile layout or touch controls.

CODE ORGANIZATION

The current App.tsx is approximately 1100 lines. Refactor it without changing working behavior.

Separate at minimum:

- Tetris engine and piece definitions
- Seven-bag generator
- Scoring and title configuration
- Bitmap alphabet and stencil utilities
- Welcome screen
- Gameplay screen
- Tetris board
- Name stencil
- HUD
- Reward card
- Success and loss result views
- Local export/share utilities

Keep gameplay rules in plain functions rather than visual components. Avoid one giant component or one giant state object when smaller domain modules are practical.

DO NOT ADD

- Mobile support
- Touch controls
- Piece hold
- Audio or music
- Accounts
- Backend
- Leaderboards
- Multiplayer
- Saved games
- Name persistence
- Analytics
- International alphabets
- Spaces, numbers, punctuation, or accented characters

FINAL VERIFICATION

Before declaring the upgrade complete, verify all of these flows in the preview:

1. Empty name starts with HARSH.
2. Valid 2–10-letter uppercase names work.
3. Tetris uses a seven-bag and all seven pieces behave correctly.
4. Scoring, rows, level, gravity, timer, ghost, and next preview update correctly.
5. Every cleared row awards one credit.
6. N routes the current piece until lock.
7. Cancel restores the exact piece and preserves the credit.
8. Valid stencil placement clips unused cells and spends one credit.
9. Invalid placement spends nothing.
10. Reaching 80% reveals Finish without interrupting play.
11. Ignoring Finish continues gameplay automatically.
12. Finishing at 80–99% creates a regular-title reward.
13. Topping out after 80% but before finishing still loses.
14. Reaching 100% auto-finishes with one of only three perfect titles.
15. Reward tilt, shine, and reduced-motion behavior work.
16. Download, copy, and share remain local and user-initiated.
17. Restart resets every gameplay metric and state.
18. Both boards and the bottom Tetris rows remain visible without scrolling.
19. No runtime or build errors remain.

Work on the existing project rather than producing another high-level plan only. Make the changes incrementally, preserve working behavior, and prioritize a complete reliable game loop over decorative additions.