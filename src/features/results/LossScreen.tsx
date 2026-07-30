import type { LossResult } from "../../game/engine/result";
import { formatActiveTime } from "../reward/exportCard";
import "../../styles/reward.css";

interface LossScreenProps {
  readonly result: LossResult;
  readonly onPlayAgain: () => void;
  readonly onNewName: () => void;
}

export function LossScreen({ result, onPlayAgain, onNewName }: LossScreenProps) {
  return (
    <main className="result-shell loss-shell">
      <div className="loss-card">
        <p className="eyebrow">RUN OVER</p>
        <h1>STACK OVERFLOW</h1>
        <p className="loss-message">
          The stack reached the top before you claimed the name. The stencil still
          reached:
        </p>
        <strong className="loss-progress">{result.displayPercent}%</strong>
        <dl className="loss-metrics">
          <div>
            <dt>Score</dt>
            <dd>{result.score.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Active time</dt>
            <dd>{formatActiveTime(result.activeMilliseconds)}</dd>
          </div>
          <div>
            <dt>Lines</dt>
            <dd>{result.linesCleared}</dd>
          </div>
        </dl>
        <div className="loss-actions">
          <button type="button" className="primary-button" onClick={onPlayAgain}>
            Play again
          </button>
          <button type="button" className="secondary-button" onClick={onNewName}>
            Try another name
          </button>
        </div>
      </div>
    </main>
  );
}
