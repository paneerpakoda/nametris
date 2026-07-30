import {
  getStencilCompletion,
  getStencilPieceProjection,
} from "../../game/engine/stencil";
import { maximumTransferCount } from "../../game/config/gameplay";
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
  const projection =
    state.stencilPiece === null
      ? null
      : getStencilPieceProjection(state.stencil, state.stencilPiece);
  const keptCellCount = projection?.keptCellKeys.size ?? 0;
  const trimmedCellCount = projection?.trimmedCellKeys.size ?? 0;
  const canLock = keptCellCount > 0;
  const canRoute = canRouteActivePiece(state);
  const transferBankIsFull = state.transferCount >= maximumTransferCount;
  const panelClassName = [
    "stencil-panel",
    state.canFinish ? "is-finish-ready" : "",
    transferBankIsFull ? "is-transfer-full" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={panelClassName} aria-labelledby="stencil-title">
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

      {transferBankIsFull && state.phase === "playing" && (
        <div className="transfer-cap-notice" role="note">
          <strong>TRANSFER BANK FULL · ROUTE A PIECE</strong>
          <span>Extra line clears cannot add transfers.</span>
        </div>
      )}

      <StencilGrid
        name={state.name}
        stencil={state.stencil}
        activePiece={state.stencilPiece}
      />

      {isPlacing ? (
        <div className="stencil-actions">
          <div className="placement-guidance" aria-live="polite">
            <p>{`${keptCellCount} ${
              keptCellCount === 1 ? "CELL" : "CELLS"
            } KEPT · ${trimmedCellCount} TRIMMED`}</p>
            <small>Outside or occupied cells disappear when you lock.</small>
          </div>
          <div className="stencil-action-buttons">
            <button type="button" className="secondary-button" onClick={onCancel}>
              CANCEL · ESC
            </button>
            <button
              type="button"
              className="primary-button compact"
              onClick={onLock}
              disabled={!canLock}
            >
              {trimmedCellCount > 0 ? "LOCK & TRIM · ENTER" : "LOCK · ENTER"}
            </button>
          </div>
        </div>
      ) : (
        <div className="stencil-actions">
          <p>
            Spend one transfer while any part of the piece is above the board’s route
            deadline. Bank up to {maximumTransferCount}. Finish unlocks at 80%.
          </p>
          <div className="stencil-action-buttons">
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
                disabled={!canRoute}
              >
                {state.transferCount === 0
                  ? "EARN A TRANSFER"
                  : canRoute
                    ? `ROUTE ${state.activePiece.type} · SHIFT`
                    : "ROUTE WINDOW PASSED"}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
