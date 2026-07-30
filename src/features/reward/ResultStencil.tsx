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
  const style = {
    "--result-columns": stencil.columns,
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
