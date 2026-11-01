import { ArrowRight } from "lucide-react";

import { maximumTransferCount } from "../../game/config/gameplay";
import type { PieceType } from "../../game/model/types";
import { PiecePreview } from "./BoardGrid";
import { LineClearFeedback, type LineClearFeedbackEvent } from "./LineClearFeedback";

interface TransferRailProps {
  readonly nextPiece: PieceType;
  readonly transferCount: number;
  readonly feedback?: LineClearFeedbackEvent | null;
}

export function TransferRail({
  nextPiece,
  transferCount,
  feedback = null,
}: TransferRailProps) {
  const isFull = transferCount >= maximumTransferCount;

  return (
    <aside className="transfer-rail" aria-label="Name pieces and next piece">
      <div className="transfer-arrows" aria-label={`${transferCount} name pieces`}>
        {Array.from({ length: maximumTransferCount }, (_, index) => (
          <span
            className="transfer-arrow"
            data-testid="transfer-arrow"
            data-status={index < transferCount ? "stored" : "empty"}
            key={index}
            aria-hidden="true"
          >
            <ArrowRight aria-hidden="true" />
          </span>
        ))}
      </div>

      <div className="rail-feedback-slot" aria-hidden="true">
        {feedback && <LineClearFeedback key={feedback.id} event={feedback} />}
      </div>

      <div
        className={`rail-transfer-metric${isFull ? " is-transfer-full" : ""}`}
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
