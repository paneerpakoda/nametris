import { Piece } from "../game/pieces";

export function NextPiecePreview({ piece, size = 18 }: { piece: Piece | null; size?: number }) {
  if (!piece) return null;
  const rows = piece.shape.length;
  const cols = piece.shape[0].length;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${size}px)`,
        gridTemplateRows: `repeat(${rows}, ${size}px)`,
        gap: 1,
      }}
    >
      {piece.shape.map((row, r) =>
        row.map((v, c) => (
          <div
            key={`${r},${c}`}
            style={{
              width: size - 1,
              height: size - 1,
              background: v ? piece.color : "transparent",
              border: v ? "none" : "1px solid rgba(64,44,20,0.15)",
              boxShadow: v ? "inset 2px 2px 0 rgba(255,255,255,0.35), inset -2px -2px 0 rgba(0,0,0,0.4)" : "none",
            }}
          />
        ))
      )}
    </div>
  );
}
