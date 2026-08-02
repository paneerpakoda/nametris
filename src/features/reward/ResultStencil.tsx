import type { CSSProperties } from "react";

import type { FinalStencilSnapshot } from "../../game/engine/result";

interface ResultStencilProps {
  readonly name: string;
  readonly displayPercent: number;
  readonly stencil: FinalStencilSnapshot;
  readonly className?: string;
}

export function ResultStencil({
  name,
  displayPercent,
  stencil,
  className,
}: ResultStencilProps) {
  const filled = new Map(stencil.filledCells);
  const mask = new Set(stencil.mask);
  const gap = 2;
  const maximumWidth = 620;
  const maximumHeight = 98;
  const cellSize = Math.max(
    3,
    Math.min(
      14,
      (maximumWidth - (stencil.columns - 1) * gap) / stencil.columns,
      (maximumHeight - (stencil.rows - 1) * gap) / stencil.rows,
    ),
  );
  const style = {
    "--result-columns": stencil.columns,
    "--result-rows": stencil.rows,
    "--result-cell-size": `${cellSize.toFixed(2)}px`,
  } as CSSProperties;

  return (
    <div
      className={`result-stencil${className === undefined ? "" : ` ${className}`}`}
      style={style}
      role="img"
      aria-label={`${name} block composition at ${displayPercent}%`}
    >
      {Array.from({ length: stencil.rows * stencil.columns }, (_, index) => {
        const row = Math.floor(index / stencil.columns);
        const column = index % stencil.columns;
        const key = `${row}:${column}`;
        const piece = filled.get(key);
        return (
          <span
            key={key}
            data-mask={mask.has(key) || undefined}
            data-piece={piece}
            data-filled={piece !== undefined || undefined}
          />
        );
      })}
    </div>
  );
}
