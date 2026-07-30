import { useEffect, useMemo, useReducer, useRef } from "react";

import { createPieceQueue, createSeededRandom } from "../../game/engine/bag";
import {
  createGameSession,
  getGhostPiece,
  reduceBoardSession,
} from "../../game/engine/session";
import { getNormalBoardAction } from "../../game/runtime/input";
import { BoardGrid, PiecePreview } from "./BoardGrid";
import { GameSidebar } from "./GameSidebar";
import "../../styles/gameplay.css";

interface GameplayScreenProps {
  readonly seed?: number;
  readonly name?: string;
}

const clockResolutionMilliseconds = 50;

export function GameplayScreen({
  seed = 20_260_730,
  name = "HARSH",
}: GameplayScreenProps) {
  const queue = useMemo(() => createPieceQueue(createSeededRandom(seed), 100), [seed]);
  const [state, dispatch] = useReducer(reduceBoardSession, queue, (pieces) =>
    createGameSession(name, pieces),
  );
  const gameRef = useRef<HTMLDivElement>(null);
  const ghostPiece = getGhostPiece(state.board, state.activePiece);

  useEffect(() => {
    gameRef.current?.focus();
  }, []);

  useEffect(() => {
    if (state.phase !== "playing") {
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
    const action = getNormalBoardAction(event.key, state.phase);

    if (action === null) {
      return;
    }

    if (
      event.repeat &&
      ["hard-drop", "rotate", "pause", "resume"].includes(action.type)
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
        {state.phase !== "paused" && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => dispatch({ type: "pause", reason: "player" })}
            disabled={state.phase === "lost"}
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
          score={state.score}
          linesCleared={state.linesCleared}
          level={state.level}
          transferCount={state.transferCount}
        />

        {state.phase === "paused" && (
          <div className="game-overlay" role="status">
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
          <div className="game-overlay" role="status">
            <p className="eyebrow">STACK OVERFLOW</p>
            <h2>Run over</h2>
            <p>Final score: {state.score.toLocaleString()}</p>
          </div>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        Score {state.score}. Lines {state.linesCleared}. Transfers {state.transferCount}
        .
      </p>
    </main>
  );
}
