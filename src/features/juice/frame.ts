import { useEffect, useRef, useState } from "react";

import { HIDDEN_BOARD_ROWS } from "../../game/engine/board";
import { canRouteActivePiece, type BoardSession } from "../../game/engine/session";
import type { Board } from "../../game/model/types";
import { useReducedMotion } from "./preferences";

export function stackNearDeadline(board: Board): boolean {
  const limit = HIDDEN_BOARD_ROWS + 3;
  for (let row = 0; row < limit; row += 1) {
    const line = board[row];
    if (line?.some((cell) => cell !== null)) {
      return true;
    }
  }
  return false;
}

export interface JuiceFrame {
  readonly countdown: string | null;
  readonly shiftGlow: boolean;
  readonly danger: boolean;
  readonly levelUp: number | null;
  readonly fillingFrom: number | null;
  readonly counterTick: boolean;
  readonly markerPop: boolean;
  readonly reduced: boolean;
}

export function useJuiceFrame(state: BoardSession): JuiceFrame {
  const reduced = useReducedMotion();
  const reducedAtStart = useRef<boolean | null>(null);
  if (reducedAtStart.current === null) {
    reducedAtStart.current = reduced;
  }
  const previous = useRef(state);
  const cueTimers = useRef<number[]>([]);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [shiftGlow, setShiftGlow] = useState(false);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [fillingFrom, setFillingFrom] = useState<number | null>(null);
  const [counterTick, setCounterTick] = useState(false);
  const [markerPop, setMarkerPop] = useState(false);
  const ready = canRouteActivePiece(state);

  useEffect(() => {
    const timers = cueTimers.current;
    return () => {
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  useEffect(() => {
    if (reducedAtStart.current === true) {
      const show = window.setTimeout(() => setCountdown("Ready"), 0);
      const hide = window.setTimeout(() => setCountdown(null), 800);
      return () => {
        window.clearTimeout(show);
        window.clearTimeout(hide);
      };
    }

    const steps = ["3", "2", "1"];
    let index = 0;
    const show = window.setTimeout(() => setCountdown("3"), 0);
    const timer = window.setInterval(() => {
      index += 1;
      const step = steps[index];
      if (step === undefined) {
        setCountdown(null);
        window.clearInterval(timer);
        return;
      }
      setCountdown(step);
    }, 400);
    return () => {
      window.clearTimeout(show);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      const timeout = window.setTimeout(() => setShiftGlow(false), 0);
      return () => window.clearTimeout(timeout);
    }
    const show = window.setTimeout(() => setShiftGlow(true), 0);
    const hide = window.setTimeout(() => setShiftGlow(false), 5_000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [ready]);

  useEffect(() => {
    const prior = previous.current;
    previous.current = state;
    const timers = cueTimers.current;
    if (state.level > prior.level) {
      const level = state.level;
      timers.push(window.setTimeout(() => setLevelUp(level), 0));
      timers.push(window.setTimeout(() => setLevelUp(null), 400));
    }
    if (state.transferCount > prior.transferCount && !reduced) {
      const from = prior.transferCount;
      timers.push(window.setTimeout(() => setFillingFrom(from), 0));
      timers.push(window.setTimeout(() => setCounterTick(true), 0));
      timers.push(
        window.setTimeout(() => {
          setFillingFrom(null);
          setCounterTick(false);
        }, 200),
      );
    }
    if (state.canFinish && !prior.canFinish && !reduced) {
      timers.push(window.setTimeout(() => setMarkerPop(true), 0));
      timers.push(window.setTimeout(() => setMarkerPop(false), 400));
    }
  }, [reduced, state]);

  return {
    countdown,
    shiftGlow,
    danger: stackNearDeadline(state.board),
    levelUp,
    fillingFrom,
    counterTick,
    markerPop,
    reduced,
  };
}
