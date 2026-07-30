import { useEffect, useRef, useState } from "react";

import type { BoardSession } from "../../game/engine/session";

type GuidanceKind = "line-clear" | "transfer" | "stencil";

interface RunGuidanceProps {
  readonly state: BoardSession;
  readonly onDismiss?: () => void;
}

const guidanceCopy: Readonly<
  Record<GuidanceKind, { readonly title: string; readonly detail: string }>
> = {
  "line-clear": {
    title: "CLEAR LINES → EARN TRANSFERS",
    detail: "Every completed row earns one piece route.",
  },
  transfer: {
    title: "TRANSFER READY → ROUTE WITH N",
    detail: "Route while the active piece is still in the spawn zone.",
  },
  stencil: {
    title: "STENCIL MODE → PLACE, LOCK, OR CANCEL",
    detail: "Arrows/WASD move, X/Z rotate, Enter locks, Escape cancels.",
  },
};

export function RunGuidance({ state, onDismiss }: RunGuidanceProps) {
  const shown = useRef(new Set<GuidanceKind>());
  const [visibleHint, setVisibleHint] = useState<GuidanceKind | null>(null);

  useEffect(() => {
    let nextHint: GuidanceKind | null = null;
    if (state.phase === "placing-stencil") {
      nextHint = "stencil";
    } else if (state.transferCount > 0 && state.successfulStencilLocks === 0) {
      nextHint = "transfer";
    } else if (state.linesCleared === 0) {
      nextHint = "line-clear";
    }

    if (nextHint !== null && !shown.current.has(nextHint)) {
      shown.current.add(nextHint);
      setVisibleHint(nextHint);
    }
  }, [
    state.linesCleared,
    state.phase,
    state.successfulStencilLocks,
    state.transferCount,
  ]);

  if (visibleHint === null) {
    return null;
  }

  const copy = guidanceCopy[visibleHint];
  return (
    <aside className="run-guidance" aria-label="Current guidance">
      <span aria-hidden="true">◆</span>
      <div>
        <strong>{copy.title}</strong>
        <small>{copy.detail}</small>
      </div>
      <button
        type="button"
        aria-label="Dismiss guidance"
        onClick={() => {
          setVisibleHint(null);
          onDismiss?.();
        }}
      >
        ×
      </button>
    </aside>
  );
}
