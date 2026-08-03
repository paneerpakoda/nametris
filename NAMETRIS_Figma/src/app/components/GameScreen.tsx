import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  BOARD_COLS,
  BOARD_ROWS,
  SCORING,
  FINISH_THRESHOLD,
  gravityInterval,
  levelForRows,
  LOCK_DELAY_MS,
  LOCK_RESET_CAP,
} from "../game/config";
import {
  Board,
  emptyBoard,
  isValidPosition,
  lockPiece,
  clearLines,
  getGhostPiece,
  stackHeight,
  tryRotate,
} from "../game/engine";
import {
  Piece,
  PieceType,
  Bag,
  createBag,
  nextType,
  spawnPiece,
  rotateCW,
  rotateCCW,
} from "../game/pieces";
import { NameGrid, buildNameGrid, calcCompletion, retainedCells } from "../game/alphabet";
import { Metrics } from "../game/metrics";
import { TetrisBoard } from "./TetrisBoard";
import { NameStencil } from "./NameStencil";
import { Hud } from "./Hud";
import { SuccessResult } from "./SuccessResult";
import { LossResult } from "./LossResult";
import { HelpOverlay } from "./HelpOverlay";
import { KeyboardBar } from "./KeyCap";

const PIXEL = { fontFamily: "'PP NeueBit', 'Pixelify Sans', 'Press Start 2P', monospace" };
const BODY = { fontFamily: "'Space Mono', 'Courier New', monospace" };

type Phase = "playing" | "paused" | "name-placement" | "won" | "lost";

interface GameState {
  board: Board;
  piece: Piece | null;
  nextPiece: Piece;
  nameGrid: NameGrid;
  score: number;
  rowsCleared: number;
  level: number;
  credits: number;
  phase: Phase;
  placementPiece: Piece | null;
  savedPiece: Piece | null;
  flashNoCredit: boolean;
  flashInvalid: boolean;
  elapsedMs: number;
  perfectPending: boolean;
  tetrisCount: number;
  routingAttempts: number;
  successfulPlacements: number;
  canceledPlacements: number;
  placedTypes: PieceType[];
  maxStackHeight: number;
  announcement: string;
}
function initState(name: string, bag: Bag): GameState {
  return {
    board: emptyBoard(),
    piece: spawnPiece(nextType(bag)),
    nextPiece: spawnPiece(nextType(bag)),
    nameGrid: buildNameGrid(name),
    score: 0,
    rowsCleared: 0,
    level: 1,
    credits: 0,
    phase: "playing",
    placementPiece: null,
    savedPiece: null,
    flashNoCredit: false,
    flashInvalid: false,
    elapsedMs: 0,
    perfectPending: false,
    tetrisCount: 0,
    routingAttempts: 0,
    successfulPlacements: 0,
    canceledPlacements: 0,
    placedTypes: [],
    maxStackHeight: 0,
    announcement: "",
  };
}

function useViewport(cols: number) {
  const [dims, setDims] = useState({ boardCell: 26, stencilCell: 14 });
  useEffect(() => {
    const compute = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      // Keep all 20 Tetris rows visible; bottom row is highest priority.
      const availH = vh - 56 /* header */ - 120 /* keyboard bar */ - 64 /* padding */;
      const boardCell = Math.max(12, Math.min(28, Math.floor(availH / BOARD_ROWS)));
      const boardW = BOARD_COLS * boardCell;
      const availW = vw - boardW - 150 /* hud */ - 120 /* gaps */;
      const stencilCell = Math.max(5, Math.min(16, Math.floor(availW / Math.max(cols, 1))));
      setDims({ boardCell, stencilCell });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [cols]);
  return dims;
}

// Parchment panel wrapper
function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[10px] ${className}`}
      style={{
        background: "#dbc5a5",
        border: "1px solid #402c14",
        boxShadow: "inset 0 0 2px #f8e4c6",
      }}
    >
      {children}
    </div>
  );
}

// Small action button (header)
function HeaderBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-1.5 rounded-[6px] text-[#4d3907] transition-all hover:brightness-110 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-[#f5c546]"
      style={{
        ...PIXEL,
        fontSize: 11,
        background: "#f5c546",
        border: "1px solid #4d3907",
        boxShadow: "0px 2px 4px rgba(64,44,20,0.2), inset 0px 0px 1px rgba(244,244,244,0.5)",
      }}
    >
      {children}
    </button>
  );
}

export function GameScreen({
  name,
  onTryName,
}: {
  name: string;
  onTryName: () => void;
}) {
  const bagRef = useRef<Bag>(createBag());
  const [gs, setGs] = useState<GameState>(() => initState(name, bagRef.current));
  const stateRef = useRef(gs);
  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef(false);
  const [highlightRoute, setHighlightRoute] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const creditHintDone = useRef(false);
  const finishCelebrated = useRef(false);

  helpRef.current = helpOpen;

  const gravAccum = useRef(0);
  const lockTimer = useRef(0);
  const lockResets = useRef(0);
  const lastFrame = useRef(0);

  const commit = useCallback((next: GameState) => {
    stateRef.current = next;
    setGs(next);
  }, []);

  const beginPiece = useCallback(() => {
    gravAccum.current = 0;
    lockTimer.current = 0;
    lockResets.current = 0;
  }, []);

  const draw = useCallback((): Piece => spawnPiece(nextType(bagRef.current)), []);

  const { boardCell, stencilCell } = useViewport(gs.nameGrid.cols);

  const applyLock = useCallback((prev: GameState, fresh: Piece, dropScore: number): GameState => {
    const locked = lockPiece(prev.board, prev.piece!);
    const { board: cleared, cleared: n } = clearLines(locked);
    const lineScore = n > 0 ? (SCORING.lineClear[n] ?? 0) * prev.level : 0;
    const newRows = prev.rowsCleared + n;
    const base: GameState = {
      ...prev,
      board: cleared,
      score: prev.score + lineScore + dropScore,
      rowsCleared: newRows,
      level: levelForRows(newRows),
      credits: prev.credits + n,
      tetrisCount: prev.tetrisCount + (n === 4 ? 1 : 0),
      maxStackHeight: Math.max(prev.maxStackHeight, stackHeight(cleared)),
      announcement: n > 0 ? `${n} row${n > 1 ? "s" : ""} cleared, +${n} credit${n > 1 ? "s" : ""}` : prev.announcement,
    };
    const topOut = cleared[0].some((c) => c !== null);
    const newActive = prev.nextPiece;
    if (topOut || !isValidPosition(cleared, newActive)) {
      return { ...base, piece: null, phase: "lost", announcement: "Topped out — game over" };
    }
    return { ...base, piece: newActive, nextPiece: fresh };
  }, []);

  // rAF game loop
  useEffect(() => {
    let raf = 0;
    lastFrame.current = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = now - lastFrame.current;
      lastFrame.current = now;
      const st = stateRef.current;
      const running = st.phase === "playing" && !helpRef.current && !st.perfectPending;
      if (!running || !st.piece) return;

      const resting = !isValidPosition(st.board, { ...st.piece, y: st.piece.y + 1 });
      if (resting) {
        lockTimer.current += dt;
        if (lockTimer.current >= LOCK_DELAY_MS) {
          commit(applyLock(st, draw(), 0));
          beginPiece();
        }
      } else {
        gravAccum.current += dt;
        if (gravAccum.current >= gravityInterval(st.level)) {
          gravAccum.current = 0;
          commit({ ...st, piece: { ...st.piece, y: st.piece.y + 1 } });
        }
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [applyLock, beginPiece, commit, draw]);

  // Active-time clock ~4Hz
  useEffect(() => {
    let last = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const delta = now - last;
      last = now;
      const st = stateRef.current;
      const active =
        (st.phase === "playing" || st.phase === "name-placement") &&
        !helpRef.current &&
        !st.perfectPending;
      if (active) commit({ ...st, elapsedMs: st.elapsedMs + delta });
    }, 250);
    return () => clearInterval(id);
  }, [commit]);

  // Auto-finish at 100%
  useEffect(() => {
    if (!gs.perfectPending) return;
    const t = setTimeout(() => commit({ ...stateRef.current, phase: "won", perfectPending: false }), 1300);
    return () => clearTimeout(t);
  }, [gs.perfectPending, commit]);

  // First-credit route highlight
  useEffect(() => {
    if (gs.credits > 0 && !creditHintDone.current) {
      creditHintDone.current = true;
      setHighlightRoute(true);
      const t = setTimeout(() => setHighlightRoute(false), 4000);
      return () => clearTimeout(t);
    }
  }, [gs.credits]);

  const completion = useMemo(() => calcCompletion(gs.nameGrid), [gs.nameGrid]);
  const finishAvailable = completion >= FINISH_THRESHOLD && (gs.phase === "playing" || gs.phase === "name-placement");

  useEffect(() => {
    if (completion >= FINISH_THRESHOLD && completion < 100 && !finishCelebrated.current) {
      finishCelebrated.current = true;
      setShowCelebration(true);
      const t = setTimeout(() => setShowCelebration(false), 2600);
      return () => clearTimeout(t);
    }
  }, [completion]);

  // Auto-pause on tab hide
  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        const st = stateRef.current;
        if (st.phase === "playing") commit({ ...st, phase: "paused" });
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [commit]);

  // Keyboard
  useEffect(() => {
    const gameplayKeys = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Spacebar"]);

    const resetLockOnMove = (st: GameState, piece: Piece) => {
      if (!isValidPosition(st.board, { ...piece, y: piece.y + 1 }) && lockResets.current < LOCK_RESET_CAP) {
        lockResets.current++;
        lockTimer.current = 0;
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      const st = stateRef.current;
      const key = e.key;
      if ((st.phase === "playing" || st.phase === "name-placement") && gameplayKeys.has(key)) {
        e.preventDefault();
      }
      if (helpRef.current) return;

      if (st.phase === "name-placement" && st.placementPiece) {
        const pp = st.placementPiece;
        if (key === "Escape") {
          commit({
            ...st,
            phase: "playing",
            placementPiece: null,
            savedPiece: null,
            piece: st.savedPiece,
            canceledPlacements: st.canceledPlacements + 1,
            announcement: "Placement canceled, credit kept",
          });
          beginPiece();
          return;
        }
        if (key === "ArrowLeft" || key === "a" || key === "A") return commit({ ...st, placementPiece: { ...pp, x: pp.x - 1 } });
        if (key === "ArrowRight" || key === "d" || key === "D") return commit({ ...st, placementPiece: { ...pp, x: pp.x + 1 } });
        if (key === "ArrowDown" || key === "s" || key === "S") return commit({ ...st, placementPiece: { ...pp, y: pp.y + 1 } });
        if (key === "ArrowUp" || key === "w" || key === "W") return commit({ ...st, placementPiece: { ...pp, y: pp.y - 1 } });
        if (key === "x" || key === "X") return commit({ ...st, placementPiece: { ...pp, shape: rotateCW(pp.shape) } });
        if (key === "z" || key === "Z") return commit({ ...st, placementPiece: { ...pp, shape: rotateCCW(pp.shape) } });
        if (key === "Enter" || key === " ") {
          const retained = retainedCells(st.nameGrid, pp);
          if (retained.length === 0) return commit({ ...st, flashInvalid: true });
          const newFilled = st.nameGrid.filled.map((row) => [...row]);
          retained.forEach(({ r, c }) => { newFilled[r][c] = true; });
          const newGrid: NameGrid = { ...st.nameGrid, filled: newFilled };
          const comp = calcCompletion(newGrid);
          const placedTypes = st.placedTypes.includes(pp.type) ? st.placedTypes : [...st.placedTypes, pp.type];
          const newActive = st.nextPiece;
          const canPlace = isValidPosition(st.board, newActive);
          const perfect = comp >= 100;
          const phase: Phase = perfect ? "playing" : canPlace ? "playing" : "lost";
          commit({
            ...st,
            nameGrid: newGrid,
            credits: st.credits - 1,
            successfulPlacements: st.successfulPlacements + 1,
            placedTypes,
            placementPiece: null,
            savedPiece: null,
            phase,
            piece: canPlace ? newActive : null,
            nextPiece: draw(),
            perfectPending: perfect,
            announcement: perfect ? "Perfect, 100 percent" : comp >= FINISH_THRESHOLD ? `Finish available at ${comp} percent` : `Placed, ${comp} percent complete`,
          });
          beginPiece();
          return;
        }
        return;
      }

      if (st.phase === "playing" && st.piece) {
        const piece = st.piece;
        if (key === "p" || key === "P") return commit({ ...st, phase: "paused" });
        if (key === "n" || key === "N") {
          if (st.credits <= 0) return commit({ ...st, flashNoCredit: true });
          const pp: Piece = { ...piece, x: Math.floor((st.nameGrid.cols - piece.shape[0].length) / 2), y: 0 };
          return commit({ ...st, phase: "name-placement", placementPiece: pp, savedPiece: piece, routingAttempts: st.routingAttempts + 1 });
        }
        if (key === "ArrowLeft" || key === "a" || key === "A") {
          const moved = { ...piece, x: piece.x - 1 };
          if (isValidPosition(st.board, moved)) { resetLockOnMove(st, moved); return commit({ ...st, piece: moved }); }
          return;
        }
        if (key === "ArrowRight" || key === "d" || key === "D") {
          const moved = { ...piece, x: piece.x + 1 };
          if (isValidPosition(st.board, moved)) { resetLockOnMove(st, moved); return commit({ ...st, piece: moved }); }
          return;
        }
        if (key === "ArrowDown" || key === "s" || key === "S") {
          const moved = { ...piece, y: piece.y + 1 };
          if (isValidPosition(st.board, moved)) { gravAccum.current = 0; return commit({ ...st, piece: moved, score: st.score + SCORING.softDropPerCell }); }
          return;
        }
        if (key === "ArrowUp" || key === "x" || key === "X") {
          const rotated = tryRotate(st.board, piece, "cw");
          if (rotated) { resetLockOnMove(st, rotated); return commit({ ...st, piece: rotated }); }
          return;
        }
        if (key === "z" || key === "Z") {
          const rotated = tryRotate(st.board, piece, "ccw");
          if (rotated) { resetLockOnMove(st, rotated); return commit({ ...st, piece: rotated }); }
          return;
        }
        if (key === " ") {
          let dropped = { ...piece };
          let dist = 0;
          while (isValidPosition(st.board, { ...dropped, y: dropped.y + 1 })) { dropped = { ...dropped, y: dropped.y + 1 }; dist++; }
          commit(applyLock({ ...st, piece: dropped }, draw(), dist * SCORING.hardDropPerCell));
          beginPiece();
          return;
        }
      }

      if (st.phase === "paused" && (key === "p" || key === "P")) {
        return commit({ ...st, phase: "playing" });
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [applyLock, beginPiece, commit, draw]);

  useEffect(() => {
    if (!gs.flashNoCredit) return;
    const t = setTimeout(() => commit({ ...stateRef.current, flashNoCredit: false }), 600);
    return () => clearTimeout(t);
  }, [gs.flashNoCredit, commit]);

  useEffect(() => {
    if (!gs.flashInvalid) return;
    const t = setTimeout(() => commit({ ...stateRef.current, flashInvalid: false }), 600);
    return () => clearTimeout(t);
  }, [gs.flashInvalid, commit]);

  const handleRestart = useCallback(() => {
    bagRef.current = createBag();
    creditHintDone.current = false;
    finishCelebrated.current = false;
    setHighlightRoute(false);
    setShowCelebration(false);
    setHelpOpen(false);
    beginPiece();
    commit(initState(name, bagRef.current));
  }, [name, beginPiece, commit]);

  const handleFinish = useCallback(() => {
    commit({ ...stateRef.current, phase: "won" });
  }, [commit]);

  const togglePause = () => {
    const st = stateRef.current;
    if (st.phase === "playing") commit({ ...st, phase: "paused" });
    else if (st.phase === "paused") commit({ ...st, phase: "playing" });
  };

  const ghost = gs.piece && gs.phase === "playing" ? getGhostPiece(gs.board, gs.piece) : null;

  const metrics: Metrics = {
    completion,
    score: gs.score,
    activeMs: gs.elapsedMs,
    rowsCleared: gs.rowsCleared,
    level: gs.level,
    tetrisCount: gs.tetrisCount,
    routingAttempts: gs.routingAttempts,
    successfulPlacements: gs.successfulPlacements,
    canceledPlacements: gs.canceledPlacements,
    placedTypes: gs.placedTypes,
    maxStackHeight: gs.maxStackHeight,
  };

  const compPct = completion;
  const compColor = compPct >= 80 ? "#f5c546" : compPct >= 50 ? "#e8a020" : "#ede6d3";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#131813", userSelect: "none" }}>
      {/* SR announcer */}
      <div aria-live="polite" className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        {gs.announcement}
      </div>

      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ background: "#1a1c15", borderBottom: "1px solid #402c14" }}
      >
        <span style={{ ...PIXEL, fontSize: 18, color: "#f5c546", letterSpacing: 2 }}>NAMETRIS</span>
        <div className="flex gap-2">
          <HeaderBtn onClick={togglePause}>{gs.phase === "paused" ? "RESUME" : "PAUSE"}</HeaderBtn>
          <HeaderBtn onClick={handleRestart}>RESTART</HeaderBtn>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-start justify-center gap-6 pt-4 pb-4 px-6 overflow-hidden">
        {/* Tetris + HUD */}
        <div className="flex gap-4 items-start shrink-0">
          <div className="relative">
            <TetrisBoard board={gs.board} piece={gs.phase === "playing" ? gs.piece : null} ghost={ghost} cellSize={boardCell} />
            {gs.phase === "paused" && (
              <div className="absolute inset-0 flex items-center justify-center rounded" style={{ background: "rgba(19,24,19,0.8)" }}>
                <span style={{ ...PIXEL, fontSize: 20, color: "#f5c546" }}>PAUSED</span>
              </div>
            )}
            {gs.phase === "name-placement" && (
              <div className="absolute inset-0 flex items-center justify-center rounded" style={{ background: "rgba(19,24,19,0.7)" }}>
                <span style={{ ...PIXEL, fontSize: 16, color: "#f5c546" }}>ROUTING</span>
              </div>
            )}
          </div>
          <Hud
            score={gs.score}
            rows={gs.rowsCleared}
            level={gs.level}
            credits={gs.credits}
            elapsedMs={gs.elapsedMs}
            nextPiece={gs.nextPiece}
            flashNoCredit={gs.flashNoCredit}
            highlightRoute={highlightRoute}
            onHelp={() => setHelpOpen(true)}
          />
        </div>

        {/* Name stencil */}
        <div className="flex flex-col items-center gap-3 pt-1">
          <p style={{ ...PIXEL, fontSize: 11, color: "#f5c546", letterSpacing: 3 }}>{name}</p>

          <NameStencil
            grid={gs.nameGrid}
            placementPiece={gs.placementPiece}
            isPlacementMode={gs.phase === "name-placement"}
            flashInvalid={gs.flashInvalid}
            cellSize={stencilCell}
          />

          {/* Completion % */}
          <div className="text-center">
            <p style={{ ...PIXEL, fontSize: 22, color: compColor }}>{compPct}%</p>
            <p style={{ ...BODY, fontSize: 10, color: "#8a6a3a", letterSpacing: "0.12em", textTransform: "uppercase" }}>Filled</p>
          </div>

          {/* Progress bar with 80% marker */}
          <div className="relative" style={{ width: Math.max(160, gs.nameGrid.cols * stencilCell) }}>
            <div className="w-full rounded-full overflow-hidden" style={{ height: 7, background: "rgba(64,44,20,0.4)" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${compPct}%`,
                  background: compPct >= 80 ? "#f5c546" : compPct >= 50 ? "#e8a020" : "#dbc5a5",
                }}
              />
            </div>
            {/* 80% marker */}
            <div aria-hidden style={{ position: "absolute", top: -3, bottom: -3, left: "80%", width: 2, background: "#f5c546", opacity: 0.8 }} />
            <span style={{ ...BODY, position: "absolute", fontSize: 9, color: "#f5c546", left: "80%", top: 9, transform: "translateX(-50%)" }}>
              80
            </span>
          </div>

          <p style={{ ...BODY, fontSize: 10, color: "#8a6a3a", letterSpacing: "0.1em", textAlign: "center", maxWidth: 200, lineHeight: 1.6 }}>
            80% UNLOCKS FINISH · 100% IS PERFECT
          </p>

          {/* Finish button */}
          {finishAvailable && (
            <button
              onClick={handleFinish}
              className="relative rounded-[8px] overflow-hidden px-5 py-3 active:scale-[0.97] transition-transform outline-none focus-visible:ring-2 focus-visible:ring-[#402c14]"
              style={{
                background: "#f5c546",
                border: "1px solid #4d3907",
                boxShadow: "0 0 20px rgba(245,197,70,0.45), 0px 2px 8px rgba(64,44,20,0.2), inset 0 0 2px rgba(244,244,244,0.5)",
              }}
            >
              <span style={{ ...PIXEL, fontSize: 13, color: "#4d3907" }}>
                FINISH NAME · {compPct}%
              </span>
            </button>
          )}

          {showCelebration && (
            <p className="animate-bounce" style={{ ...PIXEL, fontSize: 12, color: "#f5c546" }}>
              FINISH UNLOCKED!
            </p>
          )}
          {gs.perfectPending && (
            <p className="animate-pulse" style={{ ...PIXEL, fontSize: 16, color: "#f5c546" }}>
              PERFECT!
            </p>
          )}

          {/* Placement mode controls */}
          {gs.phase === "name-placement" && (
            <Panel className="p-3 mt-1">
              <p style={{ ...PIXEL, fontSize: 9, color: "#402c14", letterSpacing: 2, textAlign: "center", marginBottom: 8 }}>
                PLACEMENT MODE
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1" style={BODY}>
                {[["Arrows/WASD", "Move"], ["X / Z", "Rotate"], ["Enter/Space", "Place"], ["Escape", "Cancel"]].map(([k, v]) => (
                  <div key={k} className="flex gap-1.5 text-xs">
                    <span className="font-semibold" style={{ color: "#392409" }}>{k}</span>
                    <span style={{ color: "#6a5030" }}>{v}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </main>



      {helpOpen && <HelpOverlay onClose={() => setHelpOpen(false)} />}
      {gs.phase === "won" && (
        <SuccessResult name={name} grid={gs.nameGrid} metrics={metrics} onPlayAgain={handleRestart} onTryName={onTryName} />
      )}
      {gs.phase === "lost" && (
        <LossResult name={name} completion={compPct} score={gs.score} rows={gs.rowsCleared} level={gs.level} timeMs={gs.elapsedMs} onPlayAgain={handleRestart} onTryName={onTryName} />
      )}
    </div>
  );
}
