import type { BoardAction, BoardPhase } from "../engine/session";

export function getGameAction(key: string, phase: BoardPhase): BoardAction | null {
  if (phase === "paused") {
    return key === "Escape" || key.toLowerCase() === "p" || key === "Enter"
      ? { type: "resume" }
      : null;
  }

  if (phase === "placing-stencil") {
    switch (key.toLowerCase()) {
      case "arrowleft":
      case "a":
        return { type: "stencil-move", rowDelta: 0, columnDelta: -1 };
      case "arrowright":
      case "d":
        return { type: "stencil-move", rowDelta: 0, columnDelta: 1 };
      case "arrowup":
      case "w":
        return { type: "stencil-move", rowDelta: -1, columnDelta: 0 };
      case "arrowdown":
      case "s":
        return { type: "stencil-move", rowDelta: 1, columnDelta: 0 };
      case "x":
        return { type: "stencil-rotate", direction: "clockwise" };
      case "z":
        return { type: "stencil-rotate", direction: "counterclockwise" };
      case "enter":
      case " ":
        return { type: "stencil-lock" };
      case "escape":
        return { type: "stencil-cancel" };
      default:
        return null;
    }
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
    case "shift":
      return { type: "route-to-stencil" };
    default:
      return null;
  }
}

export const getNormalBoardAction = getGameAction;
