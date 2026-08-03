import { NameGrid, retainedCells } from "../game/alphabet";
import { getPieceSquares } from "../game/engine";
import { Piece } from "../game/pieces";

const BLOCK_SHADOW = "inset 2px 2px 0 rgba(255,255,255,0.35), inset -2px -2px 0 rgba(0,0,0,0.4)";

export function NameStencil({
  grid,
  placementPiece,
  isPlacementMode,
  flashInvalid,
  cellSize,
}: {
  grid: NameGrid;
  placementPiece: Piece | null;
  isPlacementMode: boolean;
  flashInvalid: boolean;
  cellSize: number;
}) {
  const validFill = new Set<string>();
  const clippedFill = new Set<string>();

  if (placementPiece && isPlacementMode) {
    const retained = new Set(retainedCells(grid, placementPiece).map((p) => `${p.r},${p.c}`));
    getPieceSquares(placementPiece).forEach(({ r, c }) => {
      const key = `${r},${c}`;
      if (retained.has(key)) validFill.add(key);
      else clippedFill.add(key);
    });
  }

  const hasValid = validFill.size > 0;

  return (
    <div
      role="img"
      aria-label={
        isPlacementMode
          ? hasValid
            ? "Valid placement preview"
            : "No new letter cells — move the piece"
          : undefined
      }
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${grid.cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${grid.rows}, ${cellSize}px)`,
        gap: 1,
        padding: 4,
        background: "#0d0d08",
        border: isPlacementMode
          ? `2px solid ${hasValid ? "#f5c546" : "#d94f3a"}`
          : "1px solid #402c14",
        borderRadius: 6,
        transition: "border-color 0.15s",
      }}
    >
      {Array.from({ length: grid.rows }, (_, r) =>
        Array.from({ length: grid.cols }, (_, c) => {
          const key = `${r},${c}`;
          const isLetter = grid.cells[r][c];
          const isFilled = grid.filled[r][c];
          const isValid = validFill.has(key);
          const isClipped = clippedFill.has(key);

          let bg = "transparent";
          let border = "none";
          let shadow = "";
          let glyph = "";

          if (isFilled) {
            const hue = ((r * grid.cols + c) * 47) % 360;
            bg = `hsl(${hue}, 80%, 55%)`;
            shadow = BLOCK_SHADOW;
          } else if (isValid) {
            bg = "rgba(245,197,70,0.85)";
            shadow = BLOCK_SHADOW;
            glyph = "+";
          } else if (isClipped && isPlacementMode) {
            bg = "rgba(217,79,58,0.2)";
            border = "1px solid rgba(217,79,58,0.5)";
            glyph = "×";
          } else if (isLetter) {
            border = "1px solid rgba(219,197,165,0.25)";
            bg = "rgba(219,197,165,0.06)";
          }

          return (
            <div
              key={key}
              style={{
                width: cellSize - 1,
                height: cellSize - 1,
                background: bg,
                border,
                boxShadow: shadow,
                boxSizing: "border-box",
                opacity: flashInvalid && isClipped ? 0.35 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: Math.max(8, cellSize - 6),
                lineHeight: 1,
                color: isValid ? "#4d3907" : "rgba(217,79,58,0.9)",
                fontFamily: "'PP NeueBit', 'Pixelify Sans', monospace",
                fontWeight: 700,
              }}
            >
              {glyph}
            </div>
          );
        })
      )}
    </div>
  );
}
