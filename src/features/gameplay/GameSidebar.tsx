import type { BoardSession } from "../../game/engine/session";
import { formatActiveTime } from "../../game/runtime/clock";
import { StencilPanel } from "./StencilPanel";
import type { NameFly } from "./StencilGrid";

interface GameSidebarProps {
  readonly state: BoardSession;
  readonly onRoute: () => void;
  readonly onStencilLock: () => void;
  readonly onStencilCancel: () => void;
  readonly onFinish: () => void;
  readonly onHelp: () => void;
  readonly emptySendNotice?: boolean;
  readonly emptySendFlash?: boolean;
  readonly scorePop?: boolean;
  readonly popKeys?: ReadonlySet<string>;
  readonly markerPop?: boolean;
  readonly fly?: NameFly | null;
  readonly brightLetters?: ReadonlySet<number>;
  readonly flashLetters?: ReadonlySet<number>;
  readonly reducedMotion?: boolean;
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
  scorePop = false,
  popKeys,
  markerPop = false,
  fly = null,
  brightLetters,
  flashLetters,
  reducedMotion = false,
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
        popKeys={popKeys}
        markerPop={markerPop}
        fly={fly}
        brightLetters={brightLetters}
        flashLetters={flashLetters}
        reducedMotion={reducedMotion}
      />

      <section className="metric-strip" aria-label="Game metrics">
        <Metric label="Score" value={state.score} testId="score" pop={scorePop} />
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
  readonly pop?: boolean;
}

function Metric({ label, value, testId, pop = false }: MetricProps) {
  return (
    <div className={pop ? "metric is-score-pop" : "metric"}>
      <span>{label}</span>
      <strong data-testid={testId}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </strong>
    </div>
  );
}
