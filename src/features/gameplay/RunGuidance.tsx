import { useEffect, useState } from "react";

import type { BoardSession } from "../../game/engine/session";

interface RunGuidanceProps {
  readonly state: BoardSession;
  readonly replayKey?: number;
  readonly onDismiss?: () => void;
}

const coachLines = [
  "Fill a row to clear it. Each clear gives you a name piece.",
  "You earned a name piece. Press Shift while the piece is still above the blue line.",
  "Move it onto your name and press Enter. Parts outside the outline are lost. Esc keeps the piece.",
  "Fill 80% of your name to win.",
] as const;

const goalStep = 3;

export function RunGuidance({ state, replayKey = 0, onDismiss }: RunGuidanceProps) {
  const [reached, setReached] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [seenReplay, setSeenReplay] = useState(replayKey);
  const replayChanged = seenReplay !== replayKey;

  if (replayChanged) {
    setSeenReplay(replayKey);
    setReached(0);
    setHidden(false);
  }

  const progress = replayChanged ? 0 : reached;
  const showingHidden = replayChanged ? false : hidden;
  let step = progress;

  if (!showingHidden && progress < goalStep) {
    if (state.phase === "placing-stencil") {
      step = 2;
    } else if (progress >= 2) {
      step = goalStep;
    } else if (state.transferCount > 0 && progress < 1) {
      step = 1;
    }
  }

  if (!replayChanged && !showingHidden && step !== reached) {
    setReached(step);
  }

  useEffect(() => {
    if (showingHidden || step !== goalStep) {
      return;
    }

    const timeout = window.setTimeout(() => setHidden(true), 2_800);
    return () => window.clearTimeout(timeout);
  }, [showingHidden, step]);

  if (showingHidden) {
    return null;
  }

  const line = coachLines[step];
  if (line === undefined) {
    return null;
  }

  return (
    <aside className="run-guidance" aria-label="Current guidance" data-step={step}>
      <span aria-hidden="true">◆</span>
      <p>{line}</p>
      <button
        type="button"
        aria-label="Dismiss guidance"
        onClick={() => {
          setHidden(true);
          onDismiss?.();
        }}
      >
        ×
      </button>
    </aside>
  );
}
