import { useMemo, type CSSProperties } from "react";

import { FREEZE_BUDGET_MS, routeZoneVisibleRows } from "../../game/config/gameplay";
import { HIDDEN_BOARD_ROWS, VISIBLE_BOARD_HEIGHT } from "../../game/engine/board";
import { getPieceCells } from "../../game/engine/pieces";
import type { ActivePiece, Board, PieceType } from "../../game/model/types";

interface BoardGridProps {
  readonly board: Board;
  readonly activePiece: ActivePiece;
  readonly ghostPiece: ActivePiece;
  readonly slowZoneActive?: boolean;
  readonly freezeRemaining?: number | null;
}

function cellKey(row: number, column: number): string {
  return `${row}:${column}`;
}

export function BoardGrid({
  board,
  activePiece,
  ghostPiece,
  slowZoneActive = false,
  freezeRemaining = null,
}: BoardGridProps) {
  const activeCells = useMemo(
    () =>
      new Set(
        getPieceCells(activePiece).map(({ row, column }) => cellKey(row, column)),
      ),
    [activePiece],
  );
  const ghostCells = useMemo(
    () =>
      new Set(getPieceCells(ghostPiece).map(({ row, column }) => cellKey(row, column))),
    [ghostPiece],
  );
  const boardStyle = {
    "--route-zone-end": `${(routeZoneVisibleRows / VISIBLE_BOARD_HEIGHT) * 100}%`,
  } as CSSProperties;

  return (
    <div className="board-frame">
      <span
        className={`transfer-route-zone${slowZoneActive ? " is-slow-zone" : ""}`}
        data-testid="route-zone-label"
        aria-hidden="true"
      >
        <strong>{slowZoneActive ? "SLOW ZONE" : "SEND ZONE"}</strong>
        <small>
          {slowZoneActive
            ? "FULL BANK · 50%"
            : `TOP ${routeZoneVisibleRows} ROWS · SHIFT`}
        </small>
      </span>
      <div
        className={`board-grid${slowZoneActive ? " is-slow-zone" : ""}`}
        data-slow-zone={slowZoneActive || undefined}
        style={boardStyle}
        role="grid"
        aria-label="Normal Tetris board"
        aria-rowcount={VISIBLE_BOARD_HEIGHT}
        aria-colcount={10}
      >
        <span className="transfer-route-deadline" aria-hidden="true">
          <small>SEND LINE</small>
        </span>
        {freezeRemaining !== null && (
          <div
            className="freeze-budget"
            role="meter"
            aria-label="Think time"
            aria-valuemin={0}
            aria-valuemax={FREEZE_BUDGET_MS}
            aria-valuenow={Math.max(0, freezeRemaining)}
            style={{
              top: `calc(${Math.max(0, activePiece.row - HIDDEN_BOARD_ROWS)} * var(--board-cell))`,
            }}
          >
            <span
              style={{
                width: `${Math.max(0, Math.min(100, (freezeRemaining / FREEZE_BUDGET_MS) * 100))}%`,
              }}
            />
          </div>
        )}
        {board.slice(HIDDEN_BOARD_ROWS).map((row, visibleRow) =>
          row.map((lockedPiece, column) => {
            const boardRow = visibleRow + HIDDEN_BOARD_ROWS;
            const key = cellKey(boardRow, column);
            const isActive = activeCells.has(key);
            const isGhost = lockedPiece === null && !isActive && ghostCells.has(key);
            const pieceType = isActive ? activePiece.type : lockedPiece;

            return (
              <span
                key={key}
                role="gridcell"
                aria-label={`Row ${visibleRow + 1}, column ${column + 1}, ${
                  pieceType ?? (isGhost ? "ghost" : "empty")
                }`}
                className={`board-cell${isGhost ? " is-ghost" : ""}`}
                data-piece={pieceType ?? undefined}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}

export function PiecePreview({ type }: { readonly type: PieceType }) {
  const piece = { type, row: 0, column: 0, rotation: 0 as const };
  const occupied = new Set(
    getPieceCells(piece).map(({ row, column }) => cellKey(row, column)),
  );

  return (
    <div className="piece-preview" role="img" aria-label={`Next piece: ${type}`}>
      {Array.from({ length: 16 }, (_, index) => {
        const row = Math.floor(index / 4);
        const column = index % 4;
        return (
          <span
            key={cellKey(row, column)}
            className="preview-cell"
            data-piece={occupied.has(cellKey(row, column)) ? type : undefined}
          />
        );
      })}
    </div>
  );
}
