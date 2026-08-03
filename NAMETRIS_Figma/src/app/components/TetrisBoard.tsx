import { BOARD_COLS, BOARD_ROWS } from "../game/config";
import { Board, getPieceSquares } from "../game/engine";
import { Piece } from "../game/pieces";

const BLOCK_SHADOW = "inset 2px 2px 0 rgba(255,255,255,0.35), inset -2px -2px 0 rgba(0,0,0,0.45)";

export function TetrisBoard({
  board,
  piece,
  ghost,
  cellSize,
}: {
  board: Board;
  piece: Piece | null;
  ghost: Piece | null;
  cellSize: number;
}) {
  const activeCells = new Map<string, string>();
  const ghostCells = new Set<string>();

  if (ghost && piece) {
    const pieceKeys = new Set(getPieceSquares(piece).map((p) => `${p.r},${p.c}`));
    getPieceSquares(ghost).forEach(({ r, c }) => {
      if (!pieceKeys.has(`${r},${c}`)) ghostCells.add(`${r},${c}`);
    });
  }
  if (piece) {
    getPieceSquares(piece).forEach(({ r, c }) => activeCells.set(`${r},${c}`, piece.color));
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${BOARD_COLS}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${BOARD_ROWS}, ${cellSize}px)`,
        gap: 1,
        border: "1px solid #402c14",
        background: "#0d0d08",
        padding: 1,
        borderRadius: 4,
      }}
    >
      {Array.from({ length: BOARD_ROWS }, (_, r) =>
        Array.from({ length: BOARD_COLS }, (_, c) => {
          const key = `${r},${c}`;
          const activeColor = activeCells.get(key);
          const isGhost = ghostCells.has(key);
          const boardColor = board[r][c];
          const color = activeColor ?? boardColor;
          return (
            <div
              key={key}
              style={{
                width: cellSize - 1,
                height: cellSize - 1,
                background: color
                  ? color
                  : isGhost
                  ? "rgba(219,197,165,0.07)"
                  : "transparent",
                border: color
                  ? "none"
                  : isGhost
                  ? "1px solid rgba(219,197,165,0.18)"
                  : "1px solid rgba(219,197,165,0.05)",
                boxSizing: "border-box",
                boxShadow: color ? BLOCK_SHADOW : undefined,
              }}
            />
          );
        })
      )}
    </div>
  );
}
