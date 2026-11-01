import { useMemo, type CSSProperties } from "react";

import { stencilCellKey } from "../../game/glyphs/alphabet";
import {
  getStencilPieceProjection,
  type StencilState,
} from "../../game/engine/stencil";
import { getPieceCells } from "../../game/engine/pieces";
import type { ActivePiece } from "../../game/model/types";

interface StencilGridProps {
  readonly name: string;
  readonly stencil: StencilState;
  readonly activePiece: ActivePiece | null;
}

export function StencilGrid({ name, stencil, activePiece }: StencilGridProps) {
  const activeCells = useMemo(
    () =>
      new Set(
        activePiece === null
          ? []
          : getPieceCells(activePiece).map((cell) => stencilCellKey(cell)),
      ),
    [activePiece],
  );
  const keptCellKeys = useMemo(
    () =>
      activePiece === null
        ? new Set<string>()
        : getStencilPieceProjection(stencil, activePiece).keptCellKeys,
    [activePiece, stencil],
  );
  const style = {
    "--stencil-columns": stencil.columns,
  } as CSSProperties;

  return (
    <div className="stencil-frame">
      <div
        className="stencil-grid"
        style={style}
        role="grid"
        aria-label={`Name outline for ${name}`}
        aria-rowcount={stencil.rows}
        aria-colcount={stencil.columns}
      >
        {Array.from({ length: stencil.rows * stencil.columns }, (_, index) => {
          const row = Math.floor(index / stencil.columns);
          const column = index % stencil.columns;
          const key = stencilCellKey({ row, column });
          const isMaskCell = stencil.mask.has(key);
          const lockedPiece = stencil.filledCells.get(key);
          const isPreview = activeCells.has(key);
          const status = lockedPiece
            ? "filled"
            : isPreview
              ? keptCellKeys.has(key)
                ? "preview-valid"
                : "preview-lost"
              : isMaskCell
                ? "open"
                : "void";

          return (
            <span
              key={key}
              role="gridcell"
              aria-label={`Name outline row ${row + 1}, column ${column + 1}, ${
                status === "preview-lost" ? "lost" : status
              }`}
              className="stencil-cell"
              data-testid="stencil-cell"
              data-status={status}
              data-piece={lockedPiece ?? (isPreview ? activePiece?.type : undefined)}
            />
          );
        })}
      </div>
    </div>
  );
}
