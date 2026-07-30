interface GameSidebarProps {
  readonly score: number;
  readonly linesCleared: number;
  readonly level: number;
  readonly transferCount: number;
}

export function GameSidebar({
  score,
  linesCleared,
  level,
  transferCount,
}: GameSidebarProps) {
  return (
    <aside className="game-sidebar">
      <section className="metric-strip" aria-label="Game metrics">
        <Metric label="Score" value={score} testId="score" />
        <Metric label="Lines" value={linesCleared} />
        <Metric label="Level" value={level} />
        <Metric label="Transfers" value={transferCount} accent />
      </section>

      <section className="stencil-placeholder">
        <p className="panel-kicker">02 / BUILD YOUR NAME</p>
        <h2>NAME STENCIL</h2>
        <div aria-hidden="true" className="placeholder-grid">
          {Array.from({ length: 32 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
        <p>Clear a row to earn a transfer. The stencil board comes next.</p>
      </section>

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
        </dl>
      </section>
    </aside>
  );
}

interface MetricProps {
  readonly label: string;
  readonly value: number;
  readonly accent?: boolean;
  readonly testId?: string;
}

function Metric({ label, value, accent = false, testId }: MetricProps) {
  return (
    <div className={accent ? "metric is-accent" : "metric"}>
      <span>{label}</span>
      <strong data-testid={testId}>{value.toLocaleString()}</strong>
    </div>
  );
}
