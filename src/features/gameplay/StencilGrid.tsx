import { useMemo, type CSSProperties } from "react";

import { stencilCellKey } from "../../game/glyphs/alphabet";
import {
  getStencilContributionCells,
  type StencilState,
} from "../../game/engine/stencil";
import type { ActivePiece } from "../../game/model/types";

interface StencilGridProps {
  readonly name: string;
  readonly stencil: StencilState;
  readonly activePiece: ActivePiece | null;
}

export function StencilGrid({ name, stencil, activePiece }: StencilGridProps) {
  const contributionCells = useMemo(
    () =>
      new Set(
        activePiece === null
          ? []
          : getStencilContributionCells(stencil, activePiece).map((cell) =>
              stencilCellKey(cell),
            ),
      ),
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
        aria-label={`Name stencil for ${name}`}
        aria-rowcount={stencil.rows}
        aria-colcount={stencil.columns}
      >
        {Array.from({ length: stencil.rows * stencil.columns }, (_, index) => {
          const row = Math.floor(index / stencil.columns);
          const column = index % stencil.columns;
          const key = stencilCellKey({ row, column });
          const isMaskCell = stencil.mask.has(key);
          const lockedPiece = stencil.filledCells.get(key);
          const isPreview = contributionCells.has(key);
          const status = lockedPiece
            ? "filled"
            : isPreview
              ? "preview-valid"
              : isMaskCell
                ? "open"
                : "void";

          return (
            <span
              key={key}
              role="gridcell"
              aria-label={`Stencil row ${row + 1}, column ${column + 1}, ${status}`}
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
