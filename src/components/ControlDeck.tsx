import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronsDown,
  CornerDownLeft,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Send,
  X,
  type LucideIcon,
} from "lucide-react";

import type { BoardPhase } from "../game/engine/session";

interface ControlDeckProps {
  readonly phase?: BoardPhase;
  readonly canRoute?: boolean;
  readonly canLock?: boolean;
  readonly onInput?: (key: string) => void;
  readonly shiftReady?: boolean;
}

interface DeckKey {
  readonly key: string;
  readonly legend: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly disabled?: boolean;
  readonly wide?: boolean;
}

interface DeckGroup {
  readonly label: string;
  readonly keys: readonly DeckKey[];
}

const referenceGroups: readonly DeckGroup[] = [
  {
    label: "MOVE",
    keys: [
      { key: "ArrowLeft", legend: "", label: "Move left", icon: ArrowLeft },
      { key: "ArrowRight", legend: "", label: "Move right", icon: ArrowRight },
    ],
  },
  {
    label: "DROP",
    keys: [{ key: "ArrowDown", legend: "", label: "Soft drop", icon: ArrowDown }],
  },
  {
    label: "HARD DROP",
    keys: [
      {
        key: " ",
        legend: "SPACE",
        label: "Hard drop",
        icon: ChevronsDown,
        wide: true,
      },
    ],
  },
  {
    label: "ROTATE",
    keys: [
      {
        key: "z",
        legend: "Z",
        label: "Rotate counter-clockwise",
        icon: RotateCcw,
      },
      { key: "x", legend: "X", label: "Rotate clockwise", icon: RotateCw },
    ],
  },
  {
    label: "SEND",
    keys: [
      {
        key: "Shift",
        legend: "SHIFT",
        label: "Send",
        icon: Send,
        wide: true,
      },
    ],
  },
  {
    label: "PAUSE",
    keys: [{ key: "p", legend: "P", label: "Pause game", icon: Pause }],
  },
];

function getInteractiveGroups(
  phase: BoardPhase,
  canRoute: boolean,
  canLock: boolean,
): readonly DeckGroup[] {
  if (phase === "paused") {
    return [
      {
        label: "RESUME",
        keys: [
          {
            key: "p",
            legend: "P",
            label: "Resume using cabinet key",
            icon: Play,
          },
        ],
      },
    ];
  }

  if (phase === "placing-stencil") {
    return [
      {
        label: "MOVE PIECE",
        keys: [
          {
            key: "ArrowLeft",
            legend: "",
            label: "Move piece left",
            icon: ArrowLeft,
          },
          {
            key: "ArrowUp",
            legend: "",
            label: "Move piece up",
            icon: ArrowUp,
          },
          {
            key: "ArrowDown",
            legend: "",
            label: "Move piece down",
            icon: ArrowDown,
          },
          {
            key: "ArrowRight",
            legend: "",
            label: "Move piece right",
            icon: ArrowRight,
          },
        ],
      },
      {
        label: "ROTATE",
        keys: [
          {
            key: "z",
            legend: "Z",
            label: "Rotate piece counter-clockwise",
            icon: RotateCcw,
          },
          {
            key: "x",
            legend: "X",
            label: "Rotate piece clockwise",
            icon: RotateCw,
          },
        ],
      },
      {
        label: "LOCK",
        keys: [
          {
            key: "Enter",
            legend: "ENTER",
            label: "Lock piece",
            icon: CornerDownLeft,
            disabled: !canLock,
            wide: true,
          },
        ],
      },
      {
        label: "CANCEL",
        keys: [
          {
            key: "Escape",
            legend: "ESC",
            label: "Cancel placement",
            icon: X,
          },
        ],
      },
    ];
  }

  return referenceGroups.map((group) =>
    group.label === "SEND"
      ? {
          ...group,
          keys: group.keys.map((key) => ({ ...key, disabled: !canRoute })),
        }
      : group,
  );
}

export function ControlDeck({
  phase,
  canRoute = false,
  canLock = false,
  onInput,
  shiftReady = false,
}: ControlDeckProps) {
  const groups =
    phase === undefined
      ? referenceGroups
      : getInteractiveGroups(phase, canRoute, canLock);

  return (
    <div className="control-deck" aria-label="Cabinet controls">
      {groups.map((group) => (
        <div className="control-group" key={group.label}>
          <span className="control-group-label">{group.label}</span>
          <div className="control-group-keys">
            {group.keys.map((deckKey) =>
              onInput === undefined ? (
                <kbd
                  className={`cabinet-key${deckKey.wide === true ? " is-wide" : ""}${
                    shiftReady && deckKey.key === "Shift" ? " is-shift-ready" : ""
                  }`}
                  key={deckKey.key}
                >
                  <deckKey.icon className="cabinet-key-icon" aria-hidden="true" />
                  {deckKey.legend !== "" && (
                    <span className="cabinet-key-legend">{deckKey.legend}</span>
                  )}
                </kbd>
              ) : (
                <button
                  type="button"
                  className={`cabinet-key${deckKey.wide === true ? " is-wide" : ""}${
                    shiftReady && deckKey.key === "Shift" ? " is-shift-ready" : ""
                  }`}
                  key={deckKey.key}
                  aria-label={deckKey.label}
                  disabled={deckKey.disabled}
                  onClick={(event) => {
                    event.currentTarget.blur();
                    onInput(deckKey.key);
                  }}
                >
                  <deckKey.icon className="cabinet-key-icon" aria-hidden="true" />
                  {deckKey.legend !== "" && (
                    <span className="cabinet-key-legend">{deckKey.legend}</span>
                  )}
                </button>
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
