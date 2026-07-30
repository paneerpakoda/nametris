import type { BoardAction, BoardPhase } from "../engine/session";

export function getNormalBoardAction(
  key: string,
  phase: BoardPhase,
): BoardAction | null {
  if (phase === "paused") {
    return key === "Escape" || key.toLowerCase() === "p" || key === "Enter"
      ? { type: "resume" }
      : null;
  }

  if (phase !== "playing") {
    return null;
  }

  switch (key.toLowerCase()) {
    case "arrowleft":
    case "a":
      return { type: "move", columnDelta: -1 };
    case "arrowright":
    case "d":
      return { type: "move", columnDelta: 1 };
    case "arrowdown":
    case "s":
      return { type: "soft-drop" };
    case " ":
      return { type: "hard-drop" };
    case "arrowup":
    case "x":
      return { type: "rotate", direction: "clockwise" };
    case "z":
      return { type: "rotate", direction: "counterclockwise" };
    case "p":
    case "escape":
      return { type: "pause", reason: "player" };
    default:
      return null;
  }
}
