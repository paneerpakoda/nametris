import { useEffect, useMemo, useReducer, useRef, useState } from "react";

import { CabinetShell } from "../../components/CabinetShell";
import { ControlDeck } from "../../components/ControlDeck";
import { NametrisMark } from "../../components/NametrisMark";
import { maximumTransferCount } from "../../game/config/gameplay";
import { createPieceQueue, createSeededRandom } from "../../game/engine/bag";
import {
  canRouteActivePiece,
  createGameSession,
  getGhostPiece,
  reduceBoardSession,
  type BoardAction,
  type BoardSession,
} from "../../game/engine/session";
import { getStencilPieceProjection } from "../../game/engine/stencil";
import { getGameAction } from "../../game/runtime/input";
import { createE2EFixture, type E2EFixtureKind } from "../../game/testing/fixtures";
import {
  createLossResult,
  createRunResult,
  type LossResult,
  type RunResult,
} from "../../game/engine/result";
import { HowItWorks } from "../onboarding/HowItWorks";
import { BoardGrid } from "./BoardGrid";
import { GameHelpDialog } from "./GameHelpDialog";
import { GameSidebar } from "./GameSidebar";
import type { LineClearFeedbackEvent } from "./LineClearFeedback";
import { RunGuidance } from "./RunGuidance";
import { TransferRail } from "./TransferRail";
import "../../styles/gameplay.css";

interface GameplayScreenProps {
  readonly seed?: number;
  readonly name?: string;
  readonly initialSession?: BoardSession;
  readonly onWon?: (result: RunResult) => void;
  readonly onLost?: (result: LossResult) => void;
}

const clockResolutionMilliseconds = 50;
const lineClearFeedbackDurationMilliseconds = 3_500;
type HardDropImpact = "idle" | "a" | "b";

type GameplayAction =
  | BoardAction
  | {
      readonly type: "load-e2e-fixture";
      readonly kind: E2EFixtureKind;
    };

function reduceGameplaySession(
  state: BoardSession,
  action: GameplayAction,
): BoardSession {
  if (
    import.meta.env.VITE_NAMETRIS_E2E === "true" &&
    action.type === "load-e2e-fixture"
  ) {
    return createE2EFixture(state, action.kind);
  }
  return action.type === "load-e2e-fixture" ? state : reduceBoardSession(state, action);
}

export function GameplayScreen({
  seed = 20_260_730,
  name = "HARSH",
  initialSession,
  onWon,
  onLost,
}: GameplayScreenProps) {
  const queue = useMemo(() => createPieceQueue(createSeededRandom(seed), 100), [seed]);
  const startingSession = useMemo(
    () => initialSession ?? createGameSession(name, queue),
    [initialSession, name, queue],
  );
  const [state, dispatch] = useReducer(reduceGameplaySession, startingSession);
  const gameRef = useRef<HTMLDivElement>(null);
  const reportedOutcomeRef = useRef<"won" | "lost" | null>(null);
  const previousAnnouncementState = useRef({
    linesCleared: state.linesCleared,
    transferCount: state.transferCount,
    canFinish: false,
    phase: "playing" as BoardSession["phase"],
  });
  const [announcement, setAnnouncement] = useState("");
  const [lineClearFeedback, setLineClearFeedback] =
    useState<LineClearFeedbackEvent | null>(null);
  const lineClearFeedbackSequenceRef = useRef(0);
  const [hardDropImpact, setHardDropImpact] = useState<HardDropImpact>("idle");
  const [helpOpen, setHelpOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [coachReplay, setCoachReplay] = useState(0);
  const [emptySendId, setEmptySendId] = useState(0);
  const [emptySendFlash, setEmptySendFlash] = useState(false);
  const pauseResumeRef = useRef<HTMLButtonElement>(null);
  const ghostPiece = getGhostPiece(state.board, state.activePiece);
  const canRoute = canRouteActivePiece(state);
  const slowZoneActive = state.transferCount >= maximumTransferCount && canRoute;
  const canLock =
    state.stencilPiece !== null &&
    getStencilPieceProjection(state.stencil, state.stencilPiece).keptCellKeys.size > 0;

  useEffect(() => {
    gameRef.current?.focus();
  }, []);

  useEffect(() => {
    if (state.phase !== "paused" || helpOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => pauseResumeRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [helpOpen, state.phase]);

  useEffect(() => {
    if (import.meta.env.VITE_NAMETRIS_E2E !== "true") {
      return;
    }
    const api = {
      loadFixture: (kind: E2EFixtureKind) =>
        dispatch({ type: "load-e2e-fixture", kind }),
    };
    window.__NAMETRIS_E2E__ = api;
    return () => {
      if (window.__NAMETRIS_E2E__ === api) {
        delete window.__NAMETRIS_E2E__;
      }
    };
  }, []);

  useEffect(() => {
    if (state.phase === "won" && reportedOutcomeRef.current !== "won") {
      reportedOutcomeRef.current = "won";
      onWon?.(createRunResult(state));
    }
    if (state.phase === "lost" && reportedOutcomeRef.current !== "lost") {
      reportedOutcomeRef.current = "lost";
      onLost?.(createLossResult(state));
    }
  }, [onLost, onWon, state]);

  useEffect(() => {
    const previous = previousAnnouncementState.current;
    if (state.linesCleared > previous.linesCleared) {
      const count = state.linesCleared - previous.linesCleared;
      const transfersStored = state.transferCount - previous.transferCount;
      const transfersWasted = Math.max(0, count - transfersStored);

      lineClearFeedbackSequenceRef.current += 1;
      setLineClearFeedback({
        id: lineClearFeedbackSequenceRef.current,
        linesCleared: count,
        transfersStored,
        transfersWasted,
        bankCount: state.transferCount,
      });

      const pieceWord = (amount: number) =>
        amount === 1 ? "name piece" : "name pieces";

      if (transfersWasted > 0) {
        const linePhrase = `${count} ${count === 1 ? "line" : "lines"} cleared.`;
        const wastedPhrase = `${transfersWasted} ${pieceWord(transfersWasted)} lost`;

        if (transfersStored > 0) {
          setAnnouncement(
            `${linePhrase} ${transfersStored} ${pieceWord(
              transfersStored,
            )} earned and stored. ${wastedPhrase} because you already have ${maximumTransferCount}. Use Shift before your next clear.`,
          );
        } else {
          setAnnouncement(
            `${linePhrase} ${wastedPhrase} because you already have ${maximumTransferCount}. Use Shift before your next clear.`,
          );
        }
      } else {
        const fullBankPrompt =
          state.transferCount === maximumTransferCount
            ? ` You have ${maximumTransferCount} name pieces. Use Shift before clearing more.`
            : "";
        setAnnouncement(
          `${count} ${count === 1 ? "line" : "lines"} cleared. ${transfersStored} ${pieceWord(
            transfersStored,
          )} earned.${fullBankPrompt}`,
        );
      }
    } else if (state.canFinish && !previous.canFinish) {
      setAnnouncement(
        `Name reached ${Math.floor(
          (state.stencil.filledCells.size / state.stencil.mask.size) * 100,
        )} percent. Finish is available; play continues.`,
      );
    } else if (state.phase === "won" && previous.phase !== "won") {
      setAnnouncement("Name complete. Run won.");
    } else if (state.phase === "lost" && previous.phase !== "lost") {
      setAnnouncement("The stack topped out. Run lost.");
    }
    previousAnnouncementState.current = {
      linesCleared: state.linesCleared,
      transferCount: state.transferCount,
      canFinish: state.canFinish,
      phase: state.phase,
    };
  }, [
    state.canFinish,
    state.linesCleared,
    state.phase,
    state.stencil,
    state.transferCount,
  ]);

  useEffect(() => {
    if (lineClearFeedback === null) {
      return;
    }

    const timeout = window.setTimeout(
      () => setLineClearFeedback(null),
      lineClearFeedbackDurationMilliseconds,
    );
    return () => window.clearTimeout(timeout);
  }, [lineClearFeedback]);

  useEffect(() => {
    if (state.phase !== "playing" && state.phase !== "placing-stencil") {
      return;
    }

    let previousTime = performance.now();
    const interval = window.setInterval(() => {
      const currentTime = performance.now();
      dispatch({
        type: "tick",
        elapsedMilliseconds: currentTime - previousTime,
      });
      previousTime = currentTime;
    }, clockResolutionMilliseconds);

    return () => window.clearInterval(interval);
  }, [state.phase]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        dispatch({ type: "pause", reason: "hidden" });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  function performPlayerAction(action: BoardAction, isRepeat = false) {
    if (
      isRepeat &&
      [
        "hard-drop",
        "rotate",
        "pause",
        "resume",
        "route-to-stencil",
        "stencil-lock",
        "stencil-cancel",
        "stencil-rotate",
      ].includes(action.type)
    ) {
      return;
    }

    if (action.type === "hard-drop") {
      setHardDropImpact((current) => (current === "a" ? "b" : "a"));
    }
    if (action.type === "route-to-stencil" && state.transferCount === 0) {
      setEmptySendId((current) => current + 1);
      setEmptySendFlash(
        !(
          typeof window.matchMedia === "function" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ),
      );
      setAnnouncement("No name pieces yet. Clear a row first.");
    }
    dispatch(action);
  }

  useEffect(() => {
    if (emptySendId === 0) {
      return;
    }

    const flashTimer = window.setTimeout(() => setEmptySendFlash(false), 150);
    const hideTimer = window.setTimeout(() => setEmptySendId(0), 1_500);
    return () => {
      window.clearTimeout(flashTimer);
      window.clearTimeout(hideTimer);
    };
  }, [emptySendId]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (helpOpen || howItWorksOpen) {
      return;
    }

    const action = getGameAction(event.key, state.phase);

    if (action === null) {
      return;
    }

    event.preventDefault();
    performPlayerAction(action, event.repeat);
    if (action.type === "resume") {
      window.requestAnimationFrame(() => gameRef.current?.focus());
    }
  }

  function handleCabinetInput(key: string) {
    const action = getGameAction(key, state.phase);
    if (action !== null) {
      performPlayerAction(action);
    }
    window.requestAnimationFrame(() => gameRef.current?.focus());
  }

  function openHelp() {
    dispatch({ type: "pause", reason: "player" });
    setHelpOpen(true);
  }

  function closeHelp() {
    setHelpOpen(false);
    dispatch({ type: "resume" });
    window.requestAnimationFrame(() => gameRef.current?.focus());
  }

  const controlDeck = (
    <ControlDeck
      phase={state.phase}
      canRoute={state.transferCount === 0 || canRoute}
      canLock={canLock}
      onInput={helpOpen ? undefined : handleCabinetInput}
    />
  );

  return (
    <CabinetShell
      screenLabel="Gameplay display"
      controlDeck={controlDeck}
      screenClassName="game-cabinet-screen"
    >
      <main className="game-shell">
        <header className="game-header">
          <div className="game-title-lockup">
            <NametrisMark compact />
            <h1>NAMETRIS</h1>
          </div>
          <RunGuidance
            state={state}
            replayKey={coachReplay}
            onDismiss={() =>
              window.requestAnimationFrame(() => gameRef.current?.focus())
            }
          />
          <span className="game-mode-label">
            {state.phase === "placing-stencil" ? "YOUR NAME" : "CLEAR / BUILD"}
          </span>
        </header>

        <div
          ref={gameRef}
          className={
            hardDropImpact === "idle"
              ? "game-surface"
              : `game-surface is-hard-drop-impact-${hardDropImpact}`
          }
          data-impact={hardDropImpact}
          role="application"
          aria-label="Nametris game"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <section className="board-panel" aria-labelledby="normal-board-title">
            <div className="panel-heading">
              <p className="panel-kicker">01 / CLEAR LINES</p>
              <h2 id="normal-board-title">TETRIS BOARD</h2>
            </div>
            <BoardGrid
              board={state.board}
              activePiece={state.activePiece}
              ghostPiece={ghostPiece}
              slowZoneActive={slowZoneActive}
            />
          </section>

          <TransferRail
            transferCount={state.transferCount}
            nextPiece={state.nextPiece}
            feedback={lineClearFeedback}
          />

          <GameSidebar
            state={state}
            onRoute={() => handleCabinetInput("Shift")}
            onStencilLock={() => handleCabinetInput("Enter")}
            onStencilCancel={() => handleCabinetInput("Escape")}
            onFinish={() => performPlayerAction({ type: "finish-run" })}
            onHelp={openHelp}
            emptySendNotice={emptySendId !== 0}
            emptySendFlash={emptySendFlash}
          />

          {helpOpen && (
            <GameHelpDialog
              onClose={closeHelp}
              onShowHowItWorks={() => {
                setHelpOpen(false);
                setHowItWorksOpen(true);
              }}
              onShowHints={() => {
                setCoachReplay((current) => current + 1);
                closeHelp();
              }}
            />
          )}

          {howItWorksOpen && (
            <HowItWorks
              overlay
              onDone={() => {
                setHowItWorksOpen(false);
                dispatch({ type: "resume" });
                window.requestAnimationFrame(() => gameRef.current?.focus());
              }}
            />
          )}

          {state.phase === "paused" && !helpOpen && !howItWorksOpen && (
            <div
              className="game-overlay"
              role="dialog"
              aria-modal="true"
              aria-labelledby="pause-dialog-title"
              onKeyDown={(event) => {
                if (event.key === "Tab") {
                  event.preventDefault();
                  event.stopPropagation();
                  pauseResumeRef.current?.focus();
                }
              }}
            >
              <p className="eyebrow">TAKE A BREATH</p>
              <h2 id="pause-dialog-title">Game paused</h2>
              <p>
                {state.pauseReason === "hidden"
                  ? "The tab was hidden. Resume when you are ready."
                  : "Your stack is waiting."}
              </p>
              <button
                ref={pauseResumeRef}
                type="button"
                className="primary-button compact"
                onClick={() => handleCabinetInput("p")}
              >
                Resume game
              </button>
            </div>
          )}

          {state.phase === "lost" && (
            <div className="game-overlay" role="alert">
              <p className="eyebrow">STACK OVERFLOW</p>
              <h2>Run over</h2>
              <p>Final score: {state.score.toLocaleString()}</p>
            </div>
          )}
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>
      </main>
    </CabinetShell>
  );
}
