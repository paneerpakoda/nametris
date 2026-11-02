import { useEffect, useMemo, useReducer, useRef, useState } from "react";

import { CabinetShell } from "../../components/CabinetShell";
import { ControlDeck } from "../../components/ControlDeck";
import { TouchPad } from "../../components/TouchPad";
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
import { holdAudio, playSound, primeAudio } from "../juice/audio";
import { useJuiceFrame } from "../juice/frame";
import { useJuiceSounds } from "../juice/useJuiceSounds";
import { PauseSoundSettings, SoundButton } from "../juice/JuiceControls";
import { getJuicePreferences, updateJuicePreferences } from "../juice/preferences";
import { HowItWorks } from "../onboarding/HowItWorks";
import { BoardGrid } from "./BoardGrid";
import { GameHelpDialog } from "./GameHelpDialog";
import { GameSidebar } from "./GameSidebar";
import { LineClearFeedback, type LineClearFeedbackEvent } from "./LineClearFeedback";
import {
  addedFilledKeys,
  clearedVisibleRows,
  ghostLocksTooHigh,
  hardDropTrailKeys,
  lineClearReducedMilliseconds,
  lineClearVisibleMilliseconds,
  namePopMilliseconds,
  pieceCellKeys,
  prefersReducedMotion,
  softLockFlashMilliseconds,
  hardDropTrailMilliseconds,
} from "./motion";
import { TransferRail } from "./TransferRail";
import "../../styles/gameplay.css";

interface GameplayScreenProps {
  readonly seed?: number;
  readonly name?: string;
  readonly initialSession?: BoardSession;
  readonly onWon?: (result: RunResult) => void;
  readonly onLost?: (result: LossResult) => void;
  readonly onRestart?: () => void;
  readonly onNewName?: () => void;
}

const clockResolutionMilliseconds = 50;
type HardDropImpact = "idle" | "a" | "b";

interface ClearFx {
  readonly id: number;
  readonly rows: readonly number[];
  readonly scoreDelta: number;
  readonly showToken: boolean;
}

interface CellFlash {
  readonly id: number;
  readonly keys: ReadonlySet<string>;
}

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
  onRestart,
  onNewName,
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
  const [clearFx, setClearFx] = useState<ClearFx | null>(null);
  const [lockFlash, setLockFlash] = useState<CellFlash | null>(null);
  const [dropTrail, setDropTrail] = useState<CellFlash | null>(null);
  const [popKeys, setPopKeys] = useState<ReadonlySet<string>>(() => new Set());
  const motionSnapshot = useRef({
    board: state.board,
    piece: state.activePiece,
    score: state.score,
    queueLength: state.pieceQueue.length,
    filled: new Set(state.stencil.filledCells.keys()),
    linesCleared: state.linesCleared,
    transferCount: state.transferCount,
  });
  const pendingHardDrop = useRef(false);
  const motionId = useRef(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [emptySendId, setEmptySendId] = useState(0);
  const [emptySendFlash, setEmptySendFlash] = useState(false);
  const [finishPromptDismissed, setFinishPromptDismissed] = useState(false);
  const [restartConfirm, setRestartConfirm] = useState(false);
  const pauseResumeRef = useRef<HTMLButtonElement>(null);
  const confirmYesRef = useRef<HTMLButtonElement>(null);
  const pauseMenuRef = useRef<HTMLDivElement>(null);
  const onWindowKeyRef = useRef<(event: KeyboardEvent) => void>(() => undefined);
  const handledKeys = useRef(new WeakSet<Event>());
  const ghostPiece = getGhostPiece(state.board, state.activePiece);
  const tooHigh =
    (state.phase === "playing" || state.phase === "placing-stencil") &&
    ghostLocksTooHigh(ghostPiece);
  const tokenRow =
    clearFx !== null && clearFx.showToken && !prefersReducedMotion()
      ? (clearFx.rows.at(-1) ?? null)
      : null;
  const canRoute = canRouteActivePiece(state);
  const slowZoneActive = state.transferCount >= maximumTransferCount && canRoute;
  const canLock =
    state.stencilPiece !== null &&
    getStencilPieceProjection(state.stencil, state.stencilPiece).keptCellKeys.size > 0;
  const finishPromptOpen =
    state.canFinish &&
    !finishPromptDismissed &&
    (state.phase === "playing" || state.phase === "placing-stencil") &&
    !helpOpen &&
    !howItWorksOpen;

  useEffect(() => {
    gameRef.current?.focus();
  }, []);

  useEffect(() => {
    if (state.phase !== "paused" || helpOpen || howItWorksOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      (restartConfirm ? confirmYesRef : pauseResumeRef).current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [helpOpen, howItWorksOpen, restartConfirm, state.phase]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      onWindowKeyRef.current(event);
    };
    window.addEventListener("keydown", listener, true);
    return () => window.removeEventListener("keydown", listener, true);
  }, []);

  useEffect(() => {
    const runInProgress =
      state.phase === "playing" ||
      state.phase === "placing-stencil" ||
      state.phase === "paused";
    if (!runInProgress) {
      return;
    }

    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [state.phase]);

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
      () => {
        setLineClearFeedback(null);
        setClearFx(null);
      },
      prefersReducedMotion()
        ? lineClearReducedMilliseconds
        : lineClearVisibleMilliseconds,
    );
    return () => window.clearTimeout(timeout);
  }, [lineClearFeedback]);

  useJuiceSounds(state, hardDropImpact, emptySendId);
  const juiceFrame = useJuiceFrame(state);

  useEffect(() => {
    const previous = motionSnapshot.current;
    const hardDrop = pendingHardDrop.current;
    const queueShrunk = state.pieceQueue.length < previous.queueLength;

    if (state.linesCleared > previous.linesCleared) {
      const lockedPiece = hardDrop
        ? getGhostPiece(previous.board, previous.piece)
        : previous.piece;
      motionId.current += 1;
      setClearFx({
        id: motionId.current,
        rows: clearedVisibleRows(previous.board, lockedPiece),
        scoreDelta: state.score - previous.score,
        showToken: state.transferCount > previous.transferCount,
      });
    }

    if (queueShrunk) {
      motionId.current += 1;
      if (hardDrop && !juiceFrame.reduced) {
        const ghost = getGhostPiece(previous.board, previous.piece);
        setDropTrail({
          id: motionId.current,
          keys: new Set(hardDropTrailKeys(previous.piece, ghost.row)),
        });
      } else if (!hardDrop) {
        setLockFlash({
          id: motionId.current,
          keys: new Set(pieceCellKeys(previous.piece)),
        });
      }
    }

    const filled = addedFilledKeys(previous.filled, state.stencil.filledCells);
    if (filled.length > 0) {
      setPopKeys(new Set(filled));
    }

    pendingHardDrop.current = false;
    motionSnapshot.current = {
      board: state.board,
      piece: state.activePiece,
      score: state.score,
      queueLength: state.pieceQueue.length,
      filled: new Set(state.stencil.filledCells.keys()),
      linesCleared: state.linesCleared,
      transferCount: state.transferCount,
    };
  }, [juiceFrame.reduced, state]);

  useEffect(() => {
    if (lockFlash === null) {
      return;
    }
    const timeout = window.setTimeout(
      () => setLockFlash(null),
      softLockFlashMilliseconds,
    );
    return () => window.clearTimeout(timeout);
  }, [lockFlash]);

  useEffect(() => {
    if (dropTrail === null) {
      return;
    }
    const timeout = window.setTimeout(
      () => setDropTrail(null),
      hardDropTrailMilliseconds,
    );
    return () => window.clearTimeout(timeout);
  }, [dropTrail]);

  useEffect(() => {
    if (popKeys.size === 0) {
      return;
    }
    const timeout = window.setTimeout(() => setPopKeys(new Set()), namePopMilliseconds);
    return () => window.clearTimeout(timeout);
  }, [popKeys]);

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
    holdAudio("pause", state.phase === "paused");
    return () => holdAudio("pause", false);
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
      pendingHardDrop.current = true;
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

  function handleWindowKey(event: KeyboardEvent) {
    if (handledKeys.current.has(event)) {
      return;
    }
    handledKeys.current.add(event);

    primeAudio();

    if (
      event.key.toLowerCase() === "m" &&
      !event.repeat &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !(event.target instanceof HTMLTextAreaElement) &&
      !(event.target instanceof HTMLInputElement && event.target.type !== "range")
    ) {
      event.preventDefault();
      event.stopPropagation();
      const muted = getJuicePreferences().muted;
      updateJuicePreferences({ muted: !muted });
      if (muted) {
        playSound("ui");
      }
      return;
    }

    if (helpOpen || howItWorksOpen) {
      return;
    }

    if (restartConfirm) {
      if (event.key === "Escape" || event.key.toLowerCase() === "p") {
        event.preventDefault();
        event.stopPropagation();
        setRestartConfirm(false);
        dispatch({ type: "resume" });
        window.requestAnimationFrame(() => gameRef.current?.focus());
      }
      return;
    }

    if (state.phase === "paused") {
      if (event.key === "Escape" || event.key.toLowerCase() === "p") {
        event.preventDefault();
        event.stopPropagation();
        dispatch({ type: "resume" });
        window.requestAnimationFrame(() => gameRef.current?.focus());
      }
      return;
    }

    if (finishPromptOpen) {
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        dispatch({ type: "finish-run" });
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setFinishPromptDismissed(true);
        return;
      }
      const promptedAction = getGameAction(event.key, state.phase);
      if (promptedAction?.type !== "hard-drop" && promptedAction?.type !== "pause") {
        event.preventDefault();
        return;
      }
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

  useEffect(() => {
    onWindowKeyRef.current = handleWindowKey;
  });

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    handleWindowKey(event.nativeEvent);
  }

  function handleCabinetInput(key: string) {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const action = getGameAction(key, state.phase);
    if (action !== null) {
      performPlayerAction(action);
    }
    window.requestAnimationFrame(() => gameRef.current?.focus());
  }

  function trapPauseTab(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") {
      return;
    }

    const buttons = [
      ...(pauseMenuRef.current?.querySelectorAll<HTMLElement>("button, input") ?? []),
    ];
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (first === undefined || last === undefined) {
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
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
      shiftReady={juiceFrame.shiftGlow}
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
          <div className="game-header-actions">
            {juiceFrame.countdown !== null && (
              <span className="start-count" data-testid="start-count">
                {juiceFrame.countdown}
              </span>
            )}
            <SoundButton />
            <button
              type="button"
              className="touch-only touch-pause"
              aria-label={state.phase === "paused" ? "Touch resume" : "Touch pause"}
              onPointerDown={(event) => {
                event.preventDefault();
                handleCabinetInput("p");
              }}
            >
              {state.phase === "paused" ? "Resume" : "Pause"}
            </button>
          </div>
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
            <div className="board-fit">
              <BoardGrid
                board={state.board}
                activePiece={state.activePiece}
                ghostPiece={ghostPiece}
                slowZoneActive={slowZoneActive}
                freezeRemaining={
                  state.phase === "placing-stencil"
                    ? state.freezeRemainingMilliseconds
                    : null
                }
                clearedRows={clearFx?.rows ?? []}
                clearing={clearFx !== null && clearFx.rows.length > 0}
                lockFlashKeys={lockFlash?.keys}
                lockFlashId={lockFlash?.id}
                trailKeys={dropTrail?.keys}
                trailId={dropTrail?.id}
                tooHigh={tooHigh}
                tokenRow={tokenRow}
                danger={juiceFrame.danger}
                shiftReady={juiceFrame.shiftGlow}
                levelUp={juiceFrame.levelUp}
                reducedMotion={juiceFrame.reduced}
              />
            </div>
            {(lineClearFeedback !== null || clearFx !== null) && (
              <div className="board-feedback">
                {clearFx !== null && (
                  <em className="score-delta" data-testid="score-delta">
                    +{clearFx.scoreDelta}
                  </em>
                )}
                {lineClearFeedback !== null && (
                  <LineClearFeedback
                    key={lineClearFeedback.id}
                    event={lineClearFeedback}
                  />
                )}
              </div>
            )}
          </section>

          <TransferRail
            transferCount={state.transferCount}
            nextPiece={state.nextPiece}
            fillingFrom={juiceFrame.fillingFrom}
            counterTick={juiceFrame.counterTick}
            onTouchSend={() => {
              if (helpOpen || howItWorksOpen || restartConfirm || finishPromptOpen) {
                return;
              }
              handleCabinetInput("Shift");
            }}
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
            scorePop={clearFx !== null}
            popKeys={popKeys}
            markerPop={juiceFrame.markerPop}
          />

          {state.canFinish && state.phase !== "won" && state.phase !== "lost" && (
            <p className="finish-banner" data-testid="finish-banner">
              80%: YOU CAN FINISH
            </p>
          )}

          {finishPromptOpen && (
            <div
              className="finish-prompt"
              role="dialog"
              aria-modal="true"
              aria-labelledby="finish-prompt-title"
            >
              <h2 id="finish-prompt-title">80% reached</h2>
              <div className="overlay-actions">
                <button
                  type="button"
                  className="primary-button compact"
                  onClick={() => dispatch({ type: "finish-run" })}
                >
                  Finish now · Enter
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setFinishPromptDismissed(true)}
                >
                  Play on · Esc
                </button>
              </div>
            </div>
          )}

          {helpOpen && (
            <GameHelpDialog
              onClose={closeHelp}
              onShowHowItWorks={() => {
                setHelpOpen(false);
                setHowItWorksOpen(true);
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
              onKeyDown={trapPauseTab}
            >
              <p className="eyebrow">TAKE A BREATH</p>
              {restartConfirm ? (
                <>
                  <h2 id="pause-dialog-title">End this run and start again?</h2>
                  <div className="overlay-actions" ref={pauseMenuRef}>
                    <button
                      ref={confirmYesRef}
                      type="button"
                      className="primary-button compact"
                      onClick={() => onRestart?.()}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setRestartConfirm(false)}
                    >
                      No
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 id="pause-dialog-title">Game paused</h2>
                  <p>
                    {state.pauseReason === "hidden"
                      ? "The tab was hidden. Resume when you are ready."
                      : "Your stack is waiting."}
                  </p>
                  <p data-testid="run-seed">Seed {seed}</p>
                  <div className="overlay-actions" ref={pauseMenuRef}>
                    <button
                      ref={pauseResumeRef}
                      type="button"
                      className="primary-button compact"
                      onClick={() => handleCabinetInput("p")}
                    >
                      Resume game
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setRestartConfirm(true)}
                    >
                      Restart run
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => onNewName?.()}
                    >
                      New name
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={openHelp}
                    >
                      How to play
                    </button>
                    <PauseSoundSettings />
                  </div>
                </>
              )}
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

        <div className="touch-only">
          <TouchPad
            phase={state.phase}
            onInput={(key) => {
              if (helpOpen || howItWorksOpen || restartConfirm || finishPromptOpen) {
                return;
              }
              handleCabinetInput(key);
            }}
          />
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>
      </main>
    </CabinetShell>
  );
}
