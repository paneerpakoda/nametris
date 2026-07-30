# Nametris Usability Revision Plan

Status: Completed on 30 July 2026 from direct product-owner playtest feedback.

Source: [`docs/specs/nametris-game-spec.md`](../specs/nametris-game-spec.md)

## Objective

Remove routing friction, make stencil completion forgiving and visually
legible, keep the entire two-board game visible in smaller desktop browser
panels, and replace decorative gradients with deliberate flat surfaces.

## Tasks

- [x] Make `N` a run-level shortcut and keep credit-based routing available
      until the normal-board piece locks.
  - Verify with reducer, input, component, and real-browser regression tests.
- [x] Replace exact-cover-constrained glyphs with a conventional 5 × 7 alphabet
      and retain only new stencil cells when a routed piece locks.
  - Verify edge clipping, overlap clipping, zero-contribution rejection, exact
    completion thresholds, alphabet snapshots, and 2/5/10-letter masks.
- [x] Rebuild gameplay sizing around available viewport height and keep the
      complete board and controls visible at 900 × 600 and 1180 × 720.
  - Verify zero document overflow and viewport visibility in Chromium.
- [x] Remove all CSS and exported-SVG gradients while preserving contrast,
      hierarchy, focus visibility, reduced motion, and reward polish.
  - Verify source search, component tests, screenshots, and production console.
- [x] Run the complete quality gate and record exact results.
  - Verify `npm run check`, `npm run test:coverage`, `npm run test:e2e`, and a
    production browser audit.

## Boundaries

- Keep one credit per cleared row and spend one credit only on a stencil lock
  that adds at least one new cell.
- Cancel returns the exact routed piece and spends nothing.
- Keep the name memory-only and out of automatic requests, URLs, storage, and
  logs.
- Do not add runtime dependencies.
- Keep the experience desktop-only.

## Completion Evidence

- `npm run check` passed: strict types, lint, formatting, 23 test files with
  165 tests, and the production build.
- Coverage passed at 98.46% statements, 94.55% branches, 100% functions, and
  98.38% lines.
- Eight Chromium end-to-end flows passed, including routing from a focused
  header control, clipped stencil placement, and zero-overflow layouts at
  900 × 600 and 1180 × 720.
- The production audit observed no console warnings or errors, failed requests,
  fixture hook, document scrolling, or viewport overflow at 900 × 600.
- Production source and exported reward SVGs contain no gradients.
