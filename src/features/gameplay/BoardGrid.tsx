import { useLayoutEffect, useMemo, useRef, type CSSProperties } from "react";

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
  readonly clearedRows?: readonly number[];
  readonly clearing?: boolean;
  readonly lockFlashKeys?: ReadonlySet<string>;
  readonly lockFlashId?: number;
  readonly trailKeys?: ReadonlySet<string>;
  readonly trailId?: number;
  readonly tooHigh?: boolean;
  readonly tokenRow?: number | null;
  readonly danger?: boolean;
  readonly shiftReady?: boolean;
  readonly levelUp?: number | null;
  readonly reducedMotion?: boolean;
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
  clearedRows = [],
  clearing = false,
  lockFlashKeys,
  lockFlashId = 0,
  trailKeys,
  trailId = 0,
  tooHigh = false,
  tokenRow = null,
  danger = false,
  shiftReady = false,
  levelUp = null,
  reducedMotion = false,
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
    <div className={`board-frame${clearing ? " is-clear-pulse" : ""}`}>
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
            const lockFlash = lockFlashKeys?.has(key) ?? false;
            const trail = trailKeys?.has(key) ?? false;
            const className = [
              "board-cell",
              isGhost ? "is-ghost" : "",
              lockFlash ? "is-lock-flash color-flash" : "",
              trail ? "is-drop-trail" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <span
                key={
                  lockFlash
                    ? `lock-${lockFlashId}-${key}`
                    : trail
                      ? `trail-${trailId}-${key}`
                      : key
                }
                role="gridcell"
                aria-label={`Row ${visibleRow + 1}, column ${column + 1}, ${
                  pieceType ?? (isGhost ? "ghost" : "empty")
                }`}
                className={className}
                data-piece={pieceType ?? undefined}
              />
            );
          }),
        )}
        {danger && (
          <span
            className={reducedMotion ? "danger-edge is-static" : "danger-edge"}
            data-testid="danger-edge"
            aria-hidden="true"
          />
        )}
        {shiftReady && (
          <span className="shift-ready-tag" data-testid="shift-ready">
            SHIFT
          </span>
        )}
        {levelUp !== null && (
          <>
            <strong className="level-up" data-testid="level-up">
              LEVEL {levelUp}
            </strong>
            {!reducedMotion && <span className="level-ripple" aria-hidden="true" />}
          </>
        )}
        {tooHigh && (
          <>
            <span className="too-high-wash" aria-hidden="true" />
            <span className="too-high-tag" data-testid="too-high">
              TOO HIGH
            </span>
          </>
        )}
        {clearedRows.map((row) => (
          <span
            key={`clear-${row}`}
            className="clear-row color-flash"
            data-testid="cleared-row"
            style={{ top: `calc(${row} * var(--board-cell))` }}
          />
        ))}
        {tokenRow !== null && <NamePieceToken row={tokenRow} />}
      </div>
    </div>
  );
}

function NamePieceToken({ row }: { readonly row: number }) {
  const tokenRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const token = tokenRef.current;
    const target = document.querySelector("[data-testid='transfers']");
    if (token === null || target === null) {
      return;
    }

    const from = token.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    token.style.setProperty(
      "--fly-x",
      `${to.left + to.width / 2 - (from.left + from.width / 2)}px`,
    );
    token.style.setProperty(
      "--fly-y",
      `${to.top + to.height / 2 - (from.top + from.height / 2)}px`,
    );
  }, [row]);

  return (
    <span
      ref={tokenRef}
      className="name-piece-token"
      data-testid="name-piece-token"
      style={{ top: `calc(${row} * var(--board-cell) + var(--board-cell) / 2)` }}
    />
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
