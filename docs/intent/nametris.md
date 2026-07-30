# Nametris — Confirmed Product Intent

Status: Revised from direct product-owner playtest feedback on 30 July 2026.

## Outcome

Build a desktop React game that combines recognizable Tetris play with a second, personalized objective: use earned Tetris pieces to fill a stencil of the player's name.

## User

Casual desktop-browser players who already understand the basic idea of Tetris and want a quick, personal challenge rather than a deep competitive game.

## Why This Should Exist

The name stencil turns a familiar game into something personal. A successful run should leave the player with a visually desirable keepsake, creating a reason to replay and aim for a perfect result.

## Core Gameplay

- At the beginning, the player may enter a name.
- If they skip name entry, the default name is `HARSH`.
- The first release accepts 2–10 English letters and renders them as uppercase block lettering.
- Normal Tetris runs on one side of the screen; the name stencil is shown on the other.
- A cleared row earns one credit. The player may spend a credit to route the
  current normal-board piece into the name at any time before it locks.
- The `N` route shortcut works throughout the active run without requiring
  pointer focus on the route button.
- When routed to the name, normal Tetris pauses while the player moves and rotates the piece in the stencil.
- Only currently empty cells inside the stencil are retained when the piece
  locks. Cells outside the letter or over already filled cells are clipped.
- A stencil lock is legal when it adds at least one new letter cell.
- Before locking the piece into the stencil, the player may cancel and return it to the normal board without spending the credit.

## Completion and Risk

- Filling at least 80% of the stencil completes the minimum requirement.
- Reaching 80% must not pause the game or require an action to continue.
- At 80%, a finish option becomes available while play continues automatically.
- The player may finish safely at any point from 80–99%, or keep playing toward 100%.
- Continuing is a push-your-luck choice: if the normal board tops out before the player finishes, the run is lost.
- A 100% fill is a perfect result.
- A typical successful run for the default five-letter name should take approximately 3–5 minutes.

## Reward

A successful player receives a personalized reward card inspired by the motion and shine of Unlumen UI's Tilt Card.

The card contains:

- The block-built name
- One main quirky player title
- Score
- Completion badge
- Playtime

There are eight positive, performance-based player titles:

- Five titles for successful 80–99% runs
- Three exclusive titles for 100% runs

Replay, new-name, download, and share controls belong outside the card.

## Privacy

- Entering a name is optional.
- The entered name remains on the player's device.
- No account, backend, analytics event, log, or automatic network request may contain the name.
- Downloading or sharing a card is always initiated by the player.

## Success

The first version succeeds when:

- A player can understand the two-board relationship through the interface and lightweight guidance.
- A player can complete a personalized name during a short session.
- Reaching 80% feels achievable.
- Continuing toward 100% feels tempting and risky.
- The animated reward card feels special enough that the player wants to replay or share it.

## Binding Constraint

The first release is desktop-only. Both boards and their controls must remain
fully visible within the current desktop viewport, with the bottom of the
normal board treated as the highest-priority content.

## Out of Scope

- Mobile and touch controls
- Accounts, cloud saves, or leaderboards
- Backend storage
- Sending player names to analytics or remote services
- Spaces, numbers, punctuation, accented characters, or non-English alphabets
- Multiplayer

## References

- Tetris gameplay/code reference: <https://github.com/chvin/react-tetris>
- Reward-card interaction reference: <https://ui.unlumen.com/components/tilt-card>
