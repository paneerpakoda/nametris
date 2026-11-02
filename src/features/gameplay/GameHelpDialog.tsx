import { useEffect, useId, useRef, type KeyboardEvent } from "react";

import { KeyHint } from "../../components/KeyHint";

interface GameHelpDialogProps {
  readonly onClose: () => void;
  readonly onShowHowItWorks?: () => void;
  readonly onShowHints?: () => void;
}

interface HelpControl {
  readonly keys: readonly string[];
  readonly label: string;
}

const boardControls = [
  { keys: ["←", "→", "A", "D"], label: "Move left or right" },
  { keys: ["↓", "S"], label: "Soft drop" },
  { keys: ["SPACE"], label: "Hard drop" },
  { keys: ["↑", "X"], label: "Rotate clockwise" },
  { keys: ["Z"], label: "Rotate counter-clockwise" },
  { keys: ["SHIFT"], label: "Send a name piece before the send line" },
  { keys: ["P", "ESC"], label: "Pause" },
] as const satisfies readonly HelpControl[];

const stencilControls = [
  { keys: ["ARROWS", "WASD"], label: "Move in four directions" },
  { keys: ["X"], label: "Rotate clockwise" },
  { keys: ["Z"], label: "Rotate counter-clockwise" },
  { keys: ["ENTER", "SPACE"], label: "Lock; parts outside the outline are lost" },
  { keys: ["ESC"], label: "Cancel and keep the name piece" },
] as const satisfies readonly HelpControl[];

export function GameHelpDialog({
  onClose,
  onShowHowItWorks,
  onShowHints,
}: GameHelpDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    } else if (event.key === "Tab") {
      event.preventDefault();
      closeRef.current?.focus();
    }
  }

  return (
    <div
      className="help-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onKeyDown={handleKeyDown}
    >
      <section className="help-dialog">
        <p className="panel-kicker">QUICK REFERENCE</p>
        <h2 id={titleId}>How to play Nametris</h2>
        <p id={descriptionId} className="help-intro">
          Clear a full row to earn a name piece. You can hold up to three. Press Shift
          to send one onto your name while it is still above the send line. Parts
          outside the outline are lost. At 80% you may finish; 100% finishes on its own.
        </p>

        <div className="help-columns">
          <HelpSection title="Tetris board" controls={boardControls} />
          <HelpSection title="Your name" controls={stencilControls} />
        </div>

        <div className="help-extra">
          {onShowHowItWorks !== undefined && (
            <button
              type="button"
              className="secondary-button"
              onClick={onShowHowItWorks}
            >
              How it works
            </button>
          )}
          {onShowHints !== undefined && (
            <button type="button" className="secondary-button" onClick={onShowHints}>
              Show hints
            </button>
          )}
        </div>

        <button
          ref={closeRef}
          type="button"
          className="primary-button help-resume"
          onClick={onClose}
        >
          Resume game
        </button>
      </section>
    </div>
  );
}

function HelpSection({
  title,
  controls,
}: {
  readonly title: string;
  readonly controls: readonly HelpControl[];
}) {
  return (
    <section className="help-section">
      <h3>{title}</h3>
      <dl className="help-controls">
        {controls.map((control) => (
          <div key={control.label}>
            <dt className="help-keys">
              {control.keys.map((key) => (
                <KeyHint key={key} wide={key.length > 2}>
                  {key}
                </KeyHint>
              ))}
            </dt>
            <dd>{control.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
