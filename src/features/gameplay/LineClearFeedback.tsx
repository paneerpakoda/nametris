import { maximumTransferCount } from "../../game/config/gameplay";

export interface LineClearFeedbackEvent {
  readonly id: number;
  readonly linesCleared: number;
  readonly transfersStored: number;
  readonly transfersWasted: number;
  readonly bankCount: number;
}

interface LineClearFeedbackProps {
  readonly event: LineClearFeedbackEvent;
}

export function LineClearFeedback({ event }: LineClearFeedbackProps) {
  const hasWaste = event.transfersWasted > 0;
  const kind = hasWaste ? "wasted" : "earned";
  const title = hasWaste
    ? `${event.transfersWasted} ${
        event.transfersWasted === 1 ? "TRANSFER" : "TRANSFERS"
      } WASTED`
    : `+${event.transfersStored} ${
        event.transfersStored === 1 ? "TRANSFER" : "TRANSFERS"
      } EARNED`;
  const detail = hasWaste
    ? event.transfersStored > 0
      ? `${event.transfersStored} STORED · BANK HIT ${maximumTransferCount} / ${maximumTransferCount} · USE SHIFT SOONER`
      : "BANK WAS FULL · USE SHIFT BEFORE YOUR NEXT CLEAR"
    : `${event.linesCleared === 1 ? "ROW CLEAR" : `${event.linesCleared} ROWS CLEARED`} · BANK ${
        event.bankCount
      } / ${maximumTransferCount}`;

  return (
    <div
      className="line-clear-feedback"
      data-kind={kind}
      data-testid="line-clear-feedback"
      aria-hidden="true"
    >
      <span className="line-clear-feedback-mark">{hasWaste ? "!" : "+"}</span>
      <span>
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
    </div>
  );
}
