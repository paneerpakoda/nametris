import { useEffect, useId, useRef, type KeyboardEvent } from "react";

import { KeyHint } from "../../components/KeyHint";

interface GameHelpDialogProps {
  readonly onClose: () => void;
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
  { keys: ["N"], label: "Route before the cyan deadline" },
  { keys: ["P", "ESC"], label: "Pause" },
] as const satisfies readonly HelpControl[];

const stencilControls = [
  { keys: ["ARROWS", "WASD"], label: "Move in four directions" },
  { keys: ["X"], label: "Rotate clockwise" },
  { keys: ["Z"], label: "Rotate counter-clockwise" },
  { keys: ["ENTER", "SPACE"], label: "Lock; outside cells are trimmed" },
  { keys: ["ESC"], label: "Cancel and preserve the transfer" },
] as const satisfies readonly HelpControl[];

export function GameHelpDialog({ onClose }: GameHelpDialogProps) {
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
          Clear full rows to earn transfers, then press N before a piece crosses the
          cyan route deadline. In the stencil, any part outside an open NAME cell is
          trimmed. At 80% you may finish safely; 100% earns a perfect result.
        </p>

        <div className="help-columns">
          <HelpSection title="Tetris board" controls={boardControls} />
          <HelpSection title="Name stencil" controls={stencilControls} />
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
