import type { BoardSession } from "../../game/engine/session";
import { formatActiveTime } from "../../game/runtime/clock";
import { StencilPanel } from "./StencilPanel";

interface GameSidebarProps {
  readonly state: BoardSession;
  readonly onRoute: () => void;
  readonly onStencilLock: () => void;
  readonly onStencilCancel: () => void;
  readonly onFinish: () => void;
}

export function GameSidebar({
  state,
  onRoute,
  onStencilLock,
  onStencilCancel,
  onFinish,
}: GameSidebarProps) {
  return (
    <aside className="game-sidebar">
      <section className="metric-strip" aria-label="Game metrics">
        <Metric label="Score" value={state.score} testId="score" />
        <Metric label="Lines" value={state.linesCleared} />
        <Metric label="Level" value={state.level} />
        <Metric
          label="Transfers"
          value={state.transferCount}
          testId="transfers"
          accent
        />
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
        <h2 id="controls-title">CONTROLS</h2>
        <dl>
          <div>
            <dt>Move</dt>
            <dd>← → / A D</dd>
          </div>
          <div>
            <dt>Soft drop</dt>
            <dd>↓ / S</dd>
          </div>
          <div>
            <dt>Hard drop</dt>
            <dd>SPACE</dd>
          </div>
          <div>
            <dt>Rotate</dt>
            <dd>↑ / X / Z</dd>
          </div>
          <div>
            <dt>Route</dt>
            <dd>N</dd>
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
