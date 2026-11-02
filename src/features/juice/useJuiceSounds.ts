import { useEffect, useRef } from "react";

import type { BoardSession } from "../../game/engine/session";
import { playSound } from "./audio";
import { deriveJuiceCues } from "./cues";

export function useJuiceSounds(
  state: BoardSession,
  hardDropImpact: string,
  emptySendId: number,
): void {
  const previous = useRef(state);
  const impact = useRef(hardDropImpact);
  const emptyId = useRef(emptySendId);

  useEffect(() => {
    try {
      const cues = deriveJuiceCues(previous.current, state, {
        hardDrop: hardDropImpact !== impact.current,
        emptySend: emptySendId !== emptyId.current,
      });
      for (const name of cues.immediate) {
        playSound(name);
      }
      for (const name of cues.rewards) {
        playSound(name);
      }
    } catch {
      // A missed sound never delays the next piece.
    }
    previous.current = state;
    impact.current = hardDropImpact;
    emptyId.current = emptySendId;
  }, [emptySendId, hardDropImpact, state]);
}
