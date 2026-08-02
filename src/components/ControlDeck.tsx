import type { BoardPhase } from "../game/engine/session";

interface ControlDeckProps {
  readonly phase?: BoardPhase;
  readonly canRoute?: boolean;
  readonly canLock?: boolean;
  readonly onInput?: (key: string) => void;
}

interface DeckKey {
  readonly key: string;
  readonly legend: string;
  readonly label: string;
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
      { key: "ArrowLeft", legend: "←", label: "Move left" },
      { key: "ArrowRight", legend: "→", label: "Move right" },
    ],
  },
  {
    label: "DROP",
    keys: [{ key: "ArrowDown", legend: "↓", label: "Soft drop" }],
  },
  {
    label: "HARD DROP",
    keys: [{ key: " ", legend: "SPACE", label: "Hard drop", wide: true }],
  },
  {
    label: "ROTATE",
    keys: [
      { key: "z", legend: "Z", label: "Rotate counter-clockwise" },
      { key: "x", legend: "X", label: "Rotate clockwise" },
    ],
  },
  {
    label: "SEND TO NAME",
    keys: [
      {
        key: "Shift",
        legend: "SHIFT",
        label: "Route piece to name",
        wide: true,
      },
    ],
  },
  {
    label: "PAUSE",
    keys: [{ key: "p", legend: "P", label: "Pause game" }],
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
          { key: "ArrowLeft", legend: "←", label: "Move piece left" },
          { key: "ArrowUp", legend: "↑", label: "Move piece up" },
          { key: "ArrowDown", legend: "↓", label: "Move piece down" },
          { key: "ArrowRight", legend: "→", label: "Move piece right" },
        ],
      },
      {
        label: "ROTATE",
        keys: [
          { key: "z", legend: "Z", label: "Rotate piece counter-clockwise" },
          { key: "x", legend: "X", label: "Rotate piece clockwise" },
        ],
      },
      {
        label: "LOCK",
        keys: [
          {
            key: "Enter",
            legend: "ENTER",
            label: "Lock piece",
            disabled: !canLock,
            wide: true,
          },
        ],
      },
      {
        label: "CANCEL",
        keys: [{ key: "Escape", legend: "ESC", label: "Cancel placement" }],
      },
    ];
  }

  return referenceGroups.map((group) =>
    group.label === "SEND TO NAME"
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
                  className={`cabinet-key${deckKey.wide === true ? " is-wide" : ""}`}
                  key={deckKey.key}
                >
                  {deckKey.legend}
                </kbd>
              ) : (
                <button
                  type="button"
                  className={`cabinet-key${deckKey.wide === true ? " is-wide" : ""}`}
                  key={deckKey.key}
                  aria-label={deckKey.label}
                  disabled={deckKey.disabled}
                  onClick={() => onInput(deckKey.key)}
                >
                  {deckKey.legend}
                </button>
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
