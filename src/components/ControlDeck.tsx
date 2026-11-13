import { Fragment } from "react";

import type { BoardPhase } from "../game/engine/session";

interface ControlDeckProps {
  readonly phase?: BoardPhase;
  readonly canRoute?: boolean;
  readonly canLock?: boolean;
  readonly onInput?: (key: string) => void;
  readonly shiftReady?: boolean;
}

type KeyGlyph =
  | "left"
  | "right"
  | "up"
  | "down"
  | "hard-drop"
  | "rotate-ccw"
  | "rotate-cw"
  | "send"
  | "pause"
  | "play"
  | "enter"
  | "cancel";

interface DeckKey {
  readonly key: string;
  readonly legend: string;
  readonly label: string;
  readonly icon: KeyGlyph;
  readonly disabled?: boolean;
  readonly wide?: boolean;
}

interface DeckGroup {
  readonly label: string;
  readonly keys: readonly DeckKey[];
}

function CabinetKeyIcon({ glyph }: { readonly glyph: KeyGlyph }) {
  return (
    <svg className="cabinet-key-icon" viewBox="0 0 16 16" aria-hidden="true">
      {glyph === "left" && <ArrowMark direction="left" />}
      {glyph === "right" && <ArrowMark direction="right" />}
      {glyph === "up" && <ArrowMark direction="up" />}
      {glyph === "down" && <ArrowMark direction="down" />}
      {glyph === "hard-drop" && <HardDropMark />}
      {glyph === "rotate-ccw" && <RotateMark clockwise={false} />}
      {glyph === "rotate-cw" && <RotateMark clockwise />}
      {glyph === "send" && <SendMark />}
      {glyph === "pause" && <PauseMark />}
      {glyph === "play" && <PlayMark />}
      {glyph === "enter" && <EnterMark />}
      {glyph === "cancel" && <CancelMark />}
    </svg>
  );
}

function ArrowMark({
  direction,
}: {
  readonly direction: "left" | "right" | "up" | "down";
}) {
  const rotation = { right: 0, down: 90, left: 180, up: 270 }[direction];

  return (
    <g transform={`rotate(${rotation} 8 8)`}>
      <path d="M3.4 8h9" />
      <path d="M8.7 4.5 12.4 8 8.7 11.5" />
    </g>
  );
}

function HardDropMark() {
  return (
    <g>
      <path d="M8 3.1v6.2" />
      <path d="M4.9 6.4 8 9.5l3.1-3.1" />
      <path d="M3.6 12.7h8.8" />
    </g>
  );
}

function RotateMark({ clockwise }: { readonly clockwise: boolean }) {
  return (
    <g transform={clockwise ? undefined : "translate(16 0) scale(-1 1)"}>
      <path d="M4.7 10.8a4.3 4.3 0 1 1 6.6-5.55" />
      <path d="M10.8 2.55 11.3 5.25 8.7 4.25" />
    </g>
  );
}

function SendMark() {
  return <ArrowMark direction="right" />;
}

function PauseMark() {
  return (
    <g>
      <path d="M6 3.6v8.8" />
      <path d="M10 3.6v8.8" />
    </g>
  );
}

function PlayMark() {
  return <path d="M6.2 3.7 12.3 8 6.2 12.3Z" fill="currentColor" stroke="none" />;
}

function EnterMark() {
  return (
    <g>
      <path d="M11.8 3.6V8.4H5.6" />
      <path d="M8.4 5.9 5.6 8.4 8.4 10.9" />
    </g>
  );
}

function CancelMark() {
  return (
    <g>
      <path d="M4.3 4.3 11.7 11.7" />
      <path d="M11.7 4.3 4.3 11.7" />
    </g>
  );
}

const referenceGroups: readonly DeckGroup[] = [
  {
    label: "MOVE",
    keys: [
      { key: "ArrowLeft", legend: "", label: "Move left", icon: "left" },
      { key: "ArrowRight", legend: "", label: "Move right", icon: "right" },
    ],
  },
  {
    label: "DROP",
    keys: [{ key: "ArrowDown", legend: "", label: "Soft drop", icon: "down" }],
  },
  {
    label: "HARD DROP",
    keys: [
      {
        key: " ",
        legend: "SPACE",
        label: "Hard drop",
        icon: "hard-drop",
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
        icon: "rotate-ccw",
      },
      { key: "x", legend: "X", label: "Rotate clockwise", icon: "rotate-cw" },
    ],
  },
  {
    label: "SEND",
    keys: [
      {
        key: "Shift",
        legend: "SHIFT",
        label: "Send",
        icon: "send",
        wide: true,
      },
    ],
  },
  {
    label: "PAUSE",
    keys: [{ key: "p", legend: "P", label: "Pause game", icon: "pause" }],
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
            icon: "play",
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
            icon: "left",
          },
          {
            key: "ArrowUp",
            legend: "",
            label: "Move piece up",
            icon: "up",
          },
          {
            key: "ArrowDown",
            legend: "",
            label: "Move piece down",
            icon: "down",
          },
          {
            key: "ArrowRight",
            legend: "",
            label: "Move piece right",
            icon: "right",
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
            icon: "rotate-ccw",
          },
          {
            key: "x",
            legend: "X",
            label: "Rotate piece clockwise",
            icon: "rotate-cw",
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
            icon: "enter",
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
            icon: "cancel",
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

  const columns =
    groups.length < 2
      ? "max-content"
      : `max-content repeat(${groups.length - 1}, minmax(12px, 1fr) max-content)`;

  return (
    <div
      className="control-deck"
      aria-label="Cabinet controls"
      style={{ gridTemplateColumns: columns }}
    >
      {groups.map((group, index) => (
        <Fragment key={group.label}>
          {index > 0 && <span className="control-divider" aria-hidden="true" />}
          <div className="control-group">
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
                    <CabinetKeyIcon glyph={deckKey.icon} />
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
                    <CabinetKeyIcon glyph={deckKey.icon} />
                    {deckKey.legend !== "" && (
                      <span className="cabinet-key-legend">{deckKey.legend}</span>
                    )}
                  </button>
                ),
              )}
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
