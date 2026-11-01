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
  readonly emptySendNotice?: boolean;
  readonly emptySendFlash?: boolean;
}

export function GameSidebar({
  state,
  onRoute,
  onStencilLock,
  onStencilCancel,
  onFinish,
  onHelp,
  emptySendNotice = false,
  emptySendFlash = false,
}: GameSidebarProps) {
  return (
    <aside className="game-sidebar">
      <div className="game-sidebar-toolbar">
        <span>LIVE NAME FEED</span>
        <button
          type="button"
          className="help-button"
          aria-label="Open controls help"
          onClick={onHelp}
        >
          ? HELP
        </button>
      </div>

      <StencilPanel
        state={state}
        onRoute={onRoute}
        onLock={onStencilLock}
        onCancel={onStencilCancel}
        onFinish={onFinish}
        emptySendNotice={emptySendNotice}
        emptySendFlash={emptySendFlash}
      />

      <section className="metric-strip" aria-label="Game metrics">
        <Metric label="Score" value={state.score} testId="score" />
        <Metric
          label="Active time"
          value={formatActiveTime(state.activeMilliseconds)}
          testId="active-time"
        />
        <Metric label="Level" value={state.level} />
        <Metric label="Lines" value={state.linesCleared} />
      </section>
    </aside>
  );
}

interface MetricProps {
  readonly label: string;
  readonly value: number | string;
  readonly testId?: string;
}

function Metric({ label, value, testId }: MetricProps) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong data-testid={testId}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </strong>
    </div>
  );
}
