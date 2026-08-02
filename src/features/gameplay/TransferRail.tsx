import { maximumTransferCount } from "../../game/config/gameplay";
import type { PieceType } from "../../game/model/types";
import { PiecePreview } from "./BoardGrid";

interface TransferRailProps {
  readonly nextPiece: PieceType;
  readonly transferCount: number;
}

export function TransferRail({ nextPiece, transferCount }: TransferRailProps) {
  const isFull = transferCount >= maximumTransferCount;

  return (
    <aside className="transfer-rail" aria-label="Transfer bank and next piece">
      <div className="transfer-arrows" aria-label={`${transferCount} transfers stored`}>
        {Array.from({ length: maximumTransferCount }, (_, index) => (
          <span
            className="transfer-arrow"
            data-testid="transfer-arrow"
            data-status={index < transferCount ? "stored" : "empty"}
            key={index}
            aria-hidden="true"
          >
            ➜
          </span>
        ))}
      </div>

      <div
        className={`rail-transfer-metric${isFull ? " is-transfer-full" : ""}`}
        data-testid="transfer-metric"
        data-status={isFull ? "full" : "available"}
        aria-label={`Transfers: ${transferCount} of ${maximumTransferCount}${
          isFull ? ". Bank full; route a piece." : ""
        }`}
      >
        <span>TRANSFERS</span>
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
