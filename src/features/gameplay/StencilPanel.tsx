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
    <section className="stencil-panel" aria-labelledby="stencil-title">
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
      >
        <span style={{ width: `${completion.displayPercent}%` }} />
      </div>

      <StencilGrid
        name={state.name}
        stencil={state.stencil}
        activePiece={state.stencilPiece}
      />

      {isPlacing ? (
        <div className="stencil-actions">
          <p>
            Move in four directions. Rotate with X/Z. One credit is spent only on
            lock.
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
            Spend one credit to send the current piece here. Each cleared row earns
            one credit.
          </p>
          <div>
            {state.canFinish && state.phase === "playing" && (
              <button
                type="button"
                className="secondary-button finish-button"
                onClick={onFinish}
              >
                FINISH AT {completion.displayPercent}%
              </button>
            )}
            {state.phase === "playing" && (
              <button
                type="button"
                className="route-button"
                aria-label={`Route ${state.activePiece.type} to stencil using 1 credit`}
                onClick={onRoute}
                disabled={!canRouteActivePiece(state)}
              >
                ROUTE {state.activePiece.type} · 1 CREDIT · N
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
