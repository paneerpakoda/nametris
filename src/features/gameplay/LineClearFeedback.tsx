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
  const title = `${event.linesCleared} ${
    event.linesCleared === 1 ? "ROW" : "ROWS"
  } CLEARED`;
  const detail = hasWaste
    ? event.transfersStored > 0
      ? `+${event.transfersStored} BANKED · ${event.transfersWasted} LOST · BANK FULL`
      : `${event.transfersWasted === 1 ? "TRANSFER" : "TRANSFERS"} LOST · BANK FULL · USE SHIFT`
    : `+${event.transfersStored} ${
        event.transfersStored === 1 ? "TRANSFER" : "TRANSFERS"
      } · BANK ${event.bankCount}/${maximumTransferCount}`;

  return (
    <div
      className="line-clear-feedback"
      data-kind={kind}
      data-testid="line-clear-feedback"
      aria-hidden="true"
    >
      <strong>{title}</strong>
      <small>{detail}</small>
    </div>
  );
}
