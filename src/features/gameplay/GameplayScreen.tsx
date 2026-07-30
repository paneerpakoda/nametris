import { useEffect, useMemo, useReducer, useRef, useState } from "react";

import { createPieceQueue, createSeededRandom } from "../../game/engine/bag";
import {
  createGameSession,
  getGhostPiece,
  reduceBoardSession,
  type BoardSession,
} from "../../game/engine/session";
import { getGameAction } from "../../game/runtime/input";
import {
  createLossResult,
  createRunResult,
  type LossResult,
  type RunResult,
} from "../../game/engine/result";
import { BoardGrid, PiecePreview } from "./BoardGrid";
import { GameSidebar } from "./GameSidebar";
import { RunGuidance } from "./RunGuidance";
import "../../styles/gameplay.css";

interface GameplayScreenProps {
  readonly seed?: number;
  readonly name?: string;
  readonly initialSession?: BoardSession;
  readonly onWon?: (result: RunResult) => void;
  readonly onLost?: (result: LossResult) => void;
}

const clockResolutionMilliseconds = 50;

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
  const [state, dispatch] = useReducer(reduceBoardSession, startingSession);
  const gameRef = useRef<HTMLDivElement>(null);
  const reportedOutcomeRef = useRef<"won" | "lost" | null>(null);
  const previousAnnouncementState = useRef({
    linesCleared: state.linesCleared,
    canFinish: false,
    phase: "playing" as BoardSession["phase"],
  });
  const [announcement, setAnnouncement] = useState("");
  const ghostPiece = getGhostPiece(state.board, state.activePiece);

  useEffect(() => {
    gameRef.current?.focus();
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
      setAnnouncement(
        `${count} ${count === 1 ? "line" : "lines"} cleared. ${count} ${
          count === 1 ? "transfer" : "transfers"
        } earned.`,
      );
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
      canFinish: state.canFinish,
      phase: state.phase,
    };
  }, [state.canFinish, state.linesCleared, state.phase, state.stencil]);

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

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const action = getGameAction(event.key, state.phase);

    if (action === null) {
      return;
    }

    if (
      event.repeat &&
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

    event.preventDefault();
    dispatch(action);
  }

  return (
    <main className="game-shell">
      <header className="game-header">
        <div>
          <p className="eyebrow">NAMETRIS</p>
          <h1>BUILD THE NAME</h1>
        </div>
        <RunGuidance
          state={state}
          onDismiss={() => window.requestAnimationFrame(() => gameRef.current?.focus())}
        />
        {state.phase === "playing" && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => dispatch({ type: "pause", reason: "player" })}
            aria-label="Pause game"
          >
            PAUSE
          </button>
        )}
      </header>

      <div
        ref={gameRef}
        className="game-surface"
        role="application"
        aria-label="Nametris game"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <section className="board-panel" aria-labelledby="normal-board-title">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">01 / CLEAR LINES</p>
              <h2 id="normal-board-title">TETRIS BOARD</h2>
            </div>
            <div className="next-piece">
              <span>NEXT</span>
              <PiecePreview type={state.nextPiece} />
            </div>
          </div>
          <BoardGrid
            board={state.board}
            activePiece={state.activePiece}
            ghostPiece={ghostPiece}
          />
        </section>

        <GameSidebar
          state={state}
          onRoute={() => dispatch({ type: "route-to-stencil" })}
          onStencilLock={() => dispatch({ type: "stencil-lock" })}
          onStencilCancel={() => dispatch({ type: "stencil-cancel" })}
          onFinish={() => dispatch({ type: "finish-run" })}
        />

        {state.phase === "paused" && (
          <div className="game-overlay" role="dialog" aria-modal="true">
            <p className="eyebrow">TAKE A BREATH</p>
            <h2>Game paused</h2>
            <p>
              {state.pauseReason === "hidden"
                ? "The tab was hidden. Resume when you are ready."
                : "Your stack is waiting."}
            </p>
            <button
              type="button"
              className="primary-button compact"
              onClick={() => dispatch({ type: "resume" })}
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
  );
}
