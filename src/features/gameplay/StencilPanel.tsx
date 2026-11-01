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
  readonly emptySendNotice?: boolean;
  readonly emptySendFlash?: boolean;
  readonly popKeys?: ReadonlySet<string>;
}

export function StencilPanel({
  state,
  onRoute,
  onLock,
  onCancel,
  onFinish,
  emptySendNotice = false,
  emptySendFlash = false,
  popKeys,
}: StencilPanelProps) {
  const completion = getStencilCompletion(state.stencil);
  const isPlacing = state.phase === "placing-stencil";
  const projection =
    state.stencilPiece === null
      ? null
      : getStencilPieceProjection(state.stencil, state.stencilPiece);
  const keptCellCount = projection?.keptCellKeys.size ?? 0;
  const lostCellCount = projection?.trimmedCellKeys.size ?? 0;
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
                : "NAME OUTLINE"}
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
          <strong>NAME PIECES FULL · SEND ONE</strong>
          <span>Extra line clears cannot add name pieces.</span>
        </div>
      )}

      <StencilGrid
        name={state.name}
        stencil={state.stencil}
        activePiece={state.stencilPiece}
        popKeys={popKeys}
      />

      {isPlacing ? (
        <div className="stencil-actions">
          <div className="placement-guidance" aria-live="polite">
            <p>{`${keptCellCount} kept, ${lostCellCount} lost`}</p>
            <small>Parts outside the outline are lost.</small>
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
              LOCK · ENTER
            </button>
          </div>
        </div>
      ) : (
        <div className="stencil-actions">
          <p>
            Send a name piece while any part of it is still above the send line. You can
            hold up to {maximumTransferCount}. Finish at 80%.
          </p>
          {emptySendNotice && (
            <p
              className={
                emptySendFlash ? "empty-send-notice is-flash" : "empty-send-notice"
              }
              data-testid="empty-send-notice"
            >
              No name pieces yet. Clear a row first.
            </p>
          )}
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
                aria-label={
                  state.transferCount === 0
                    ? "Clear a row first"
                    : canRoute
                      ? `Send ${state.activePiece.type}`
                      : "Past the send line"
                }
                onClick={onRoute}
                disabled={state.transferCount > 0 && !canRoute}
              >
                {state.transferCount === 0
                  ? "Clear a row first"
                  : canRoute
                    ? "SEND · SHIFT"
                    : "PAST THE SEND LINE"}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
