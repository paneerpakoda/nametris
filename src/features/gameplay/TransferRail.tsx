import { ArrowRight } from "lucide-react";

import { maximumTransferCount } from "../../game/config/gameplay";
import type { PieceType } from "../../game/model/types";
import { PiecePreview } from "./BoardGrid";

interface TransferRailProps {
  readonly nextPiece: PieceType;
  readonly transferCount: number;
  readonly onTouchSend?: () => void;
  readonly fillingFrom?: number | null;
  readonly counterTick?: boolean;
}

export function TransferRail({
  nextPiece,
  transferCount,
  onTouchSend,
  fillingFrom = null,
  counterTick = false,
}: TransferRailProps) {
  const isFull = transferCount >= maximumTransferCount;

  return (
    <aside className="transfer-rail" aria-label="Name pieces and next piece">
      <div className="transfer-arrows" aria-label={`${transferCount} name pieces`}>
        {Array.from({ length: maximumTransferCount }, (_, index) => (
          <span
            className={
              fillingFrom !== null && index >= fillingFrom && index < transferCount
                ? "transfer-arrow is-filling"
                : "transfer-arrow"
            }
            data-testid="transfer-arrow"
            data-status={index < transferCount ? "stored" : "empty"}
            key={index}
            aria-hidden="true"
          >
            <ArrowRight aria-hidden="true" />
          </span>
        ))}
      </div>

      {onTouchSend !== undefined && (
        <button
          type="button"
          className="touch-only touch-send"
          aria-label="Touch send"
          onPointerDown={(event) => {
            event.preventDefault();
            onTouchSend();
          }}
          onContextMenu={(event) => event.preventDefault()}
        >
          Send
        </button>
      )}

      <div
        className={`rail-transfer-metric${isFull ? " is-transfer-full" : ""}${
          counterTick ? " is-ticking" : ""
        }`}
        data-testid="transfer-metric"
        data-status={isFull ? "full" : "available"}
        aria-label={`Name pieces: ${transferCount} of ${maximumTransferCount}${
          isFull ? ". Send one." : ""
        }`}
      >
        <span>NAME PIECES</span>
        <strong data-testid="transfers">
          {transferCount} <small>/ {maximumTransferCount}</small>
        </strong>
        {isFull && <em className="transfer-full-label">FULL</em>}
      </div>

      <div className="rail-next-piece">
        <span>NEXT</span>
        <PiecePreview type={nextPiece} />
      </div>
    </aside>
  );
}
