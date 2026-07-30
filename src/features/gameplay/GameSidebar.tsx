import { KeyHint } from "../../components/KeyHint";
import { maximumTransferCount } from "../../game/config/gameplay";
import type { BoardSession } from "../../game/engine/session";
import { formatActiveTime } from "../../game/runtime/clock";
import { StencilPanel } from "./StencilPanel";

interface GameSidebarProps {
  readonly state: BoardSession;
  readonly onRoute: () => void;
  readonly onStencilLock: () => void;
  readonly onStencilCancel: () => void;
  readonly onFinish: () => void;
  readonly onHelp: () => void;
}

export function GameSidebar({
  state,
  onRoute,
  onStencilLock,
  onStencilCancel,
  onFinish,
  onHelp,
}: GameSidebarProps) {
  return (
    <aside className="game-sidebar">
      <section className="metric-strip" aria-label="Game metrics">
        <Metric label="Score" value={state.score} testId="score" />
        <Metric label="Lines" value={state.linesCleared} />
        <Metric label="Level" value={state.level} />
        <TransferMetric value={state.transferCount} />
        <Metric
          label="Active"
          value={formatActiveTime(state.activeMilliseconds)}
          testId="active-time"
        />
      </section>

      <StencilPanel
        state={state}
        onRoute={onRoute}
        onLock={onStencilLock}
        onCancel={onStencilCancel}
        onFinish={onFinish}
      />

      <section className="controls-card" aria-labelledby="controls-title">
        <div className="controls-card-heading">
          <h2 id="controls-title">CONTROLS</h2>
          <button
            type="button"
            className="help-button"
            aria-label="Open controls help"
            onClick={onHelp}
          >
            ? HELP
          </button>
        </div>
        <dl>
          <div>
            <dt>Move</dt>
            <dd className="key-hints">
              <KeyHint>←</KeyHint>
              <KeyHint>→</KeyHint>
              <span>or</span>
              <KeyHint>A</KeyHint>
              <KeyHint>D</KeyHint>
            </dd>
          </div>
          <div>
            <dt>Soft drop</dt>
            <dd className="key-hints">
              <KeyHint>↓</KeyHint>
              <span>or</span>
              <KeyHint>S</KeyHint>
            </dd>
          </div>
          <div>
            <dt>Hard drop</dt>
            <dd className="key-hints">
              <KeyHint wide>SPACE</KeyHint>
            </dd>
          </div>
          <div>
            <dt>Rotate</dt>
            <dd className="key-hints">
              <KeyHint>↑</KeyHint>
              <KeyHint>X</KeyHint>
              <KeyHint>Z</KeyHint>
            </dd>
          </div>
          <div>
            <dt>Route</dt>
            <dd className="key-hints">
              <KeyHint wide>SHIFT</KeyHint>
            </dd>
          </div>
        </dl>
      </section>
    </aside>
  );
}

interface MetricProps {
  readonly label: string;
  readonly value: number | string;
  readonly accent?: boolean;
  readonly testId?: string;
}

function Metric({ label, value, accent = false, testId }: MetricProps) {
  return (
    <div className={accent ? "metric is-accent" : "metric"}>
      <span>{label}</span>
      <strong data-testid={testId}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </strong>
    </div>
  );
}

function TransferMetric({ value }: { readonly value: number }) {
  const isFull = value >= maximumTransferCount;

  return (
    <div
      className={
        isFull ? "metric transfer-metric is-transfer-full" : "metric transfer-metric"
      }
      data-testid="transfer-metric"
      data-status={isFull ? "full" : "available"}
      aria-label={`Transfers: ${value} of ${maximumTransferCount}${
        isFull ? ". Bank full; route a piece." : ""
      }`}
    >
      <span>
        Transfers
        {isFull && <em className="transfer-full-label">FULL</em>}
      </span>
      <strong data-testid="transfers">
        {value} <small>/ {maximumTransferCount}</small>
      </strong>
    </div>
  );
}
