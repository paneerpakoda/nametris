import { canLockIntoStencil, getStencilCompletion } from "../../game/engine/stencil";
import { canRouteActivePiece, type BoardSession } from "../../game/engine/session";
import { StencilGrid } from "./StencilGrid";

interface StencilPanelProps {
  readonly state: BoardSession;
  readonly onRoute: () => void;
  readonly onLock: () => void;
  readonly onCancel: () => void;
  readonly onFinish: () => void;
}

export function StencilPanel({
  state,
  onRoute,
  onLock,
  onCancel,
  onFinish,
}: StencilPanelProps) {
  const completion = getStencilCompletion(state.stencil);
  const isPlacing = state.phase === "placing-stencil";
  const canLock =
    state.stencilPiece !== null &&
    canLockIntoStencil(state.stencil, state.stencilPiece);

  return (
    <section
      className={state.canFinish ? "stencil-panel is-finish-ready" : "stencil-panel"}
      aria-labelledby="stencil-title"
    >
      <div className="stencil-heading">
        <div>
          <p className="panel-kicker">02 / BUILD YOUR NAME</p>
          <h2 id="stencil-title">
            {state.phase === "won"
              ? "NAME COMPLETE"
              : isPlacing
                ? `PLACE THE ${state.stencilPiece?.type ?? "PIECE"}`
                : "NAME STENCIL"}
          </h2>
          {state.canFinish && state.phase !== "won" && (
            <span className="finish-ready-badge">◆ FINISH UNLOCKED</span>
          )}
        </div>
        <strong className="completion-value">{completion.displayPercent}%</strong>
      </div>

      <div
        className="completion-track"
        role="progressbar"
        aria-label="Name completion"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={completion.displayPercent}
        aria-valuetext={`${completion.displayPercent}% complete. Finish unlocks at 80%.`}
      >
        <span
          className="completion-fill"
          style={{ width: `${completion.displayPercent}%` }}
        />
        <span className="completion-threshold" aria-hidden="true">
          <small>80%</small>
        </span>
      </div>

      <StencilGrid
        name={state.name}
        stencil={state.stencil}
        activePiece={state.stencilPiece}
      />

      {isPlacing ? (
        <div className="stencil-actions">
          <p>
            Move in four directions. Rotate with X/Z. A transfer is spent only on lock.
          </p>
          <div>
            <button type="button" className="secondary-button" onClick={onCancel}>
              CANCEL · ESC
            </button>
            <button
              type="button"
              className="primary-button compact"
              onClick={onLock}
              disabled={!canLock}
            >
              LOCK · ENTER
            </button>
          </div>
        </div>
      ) : (
        <div className="stencil-actions">
          <p>
            Route a spawn-zone piece with one transfer. Finish unlocks at 80%; 100%
            earns a perfect result.
          </p>
          <div>
            {state.canFinish && state.phase === "playing" && (
              <button
                type="button"
                className="secondary-button finish-button"
                onClick={onFinish}
              >
                FINISH NAME · {completion.displayPercent}%
              </button>
            )}
            {state.phase === "playing" && (
              <button
                type="button"
                className="route-button"
                aria-label={`Route ${state.activePiece.type} to stencil`}
                onClick={onRoute}
                disabled={!canRouteActivePiece(state)}
              >
                ROUTE {state.activePiece.type} · N
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
