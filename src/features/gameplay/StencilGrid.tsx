import { useMemo, type CSSProperties } from "react";

import { glyphColumns, glyphSpacing, stencilCellKey } from "../../game/glyphs/alphabet";
import {
  getStencilPieceProjection,
  type StencilState,
} from "../../game/engine/stencil";
import { getPieceCells } from "../../game/engine/pieces";
import type { ActivePiece } from "../../game/model/types";
import { ParticleField } from "../juice/ParticleField";

export interface NameFly {
  readonly id: number;
  readonly piece: ActivePiece;
  readonly kept: ReadonlySet<string>;
  readonly lost: ReadonlySet<string>;
}

interface StencilGridProps {
  readonly name: string;
  readonly stencil: StencilState;
  readonly activePiece: ActivePiece | null;
  readonly popKeys?: ReadonlySet<string>;
  readonly fly?: NameFly | null;
  readonly brightLetters?: ReadonlySet<number>;
  readonly flashLetters?: ReadonlySet<number>;
  readonly reducedMotion?: boolean;
}

export function StencilGrid({
  name,
  stencil,
  activePiece,
  popKeys,
  fly = null,
  brightLetters,
  flashLetters,
  reducedMotion = false,
}: StencilGridProps) {
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
          const letterSpan = glyphColumns + glyphSpacing;
          const letterIndex = Math.floor(column / letterSpan);
          const inLetter = isMaskCell && column % letterSpan < glyphColumns;
          const letterDone = inLetter && (brightLetters?.has(letterIndex) ?? false);
          const letterFlash =
            letterDone && !reducedMotion && (flashLetters?.has(letterIndex) ?? false);
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
              className={[
                "stencil-cell",
                popKeys?.has(key) ? "is-pop color-flash" : "",
                letterDone ? "is-letter-done" : "",
                letterFlash ? "is-letter-flash" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              data-testid="stencil-cell"
              data-pop={popKeys?.has(key) ? "new" : undefined}
              data-status={status}
              data-piece={lockedPiece ?? (isPreview ? activePiece?.type : undefined)}
            />
          );
        })}
        {fly !== null && !reducedMotion && (
          <div className="piece-fly" data-testid="piece-fly" aria-hidden="true">
            {getPieceCells(fly.piece).map((cell) => {
              const key = stencilCellKey(cell);
              return (
                <span
                  key={`${fly.id}-${key}`}
                  className={
                    fly.kept.has(key) ? "fly-cell is-kept" : "fly-cell is-lost"
                  }
                  data-piece={fly.piece.type}
                  style={{ gridRow: cell.row + 1, gridColumn: cell.column + 1 }}
                />
              );
            })}
          </div>
        )}
        <ParticleField />
      </div>
    </div>
  );
}
