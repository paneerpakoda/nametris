import { useState } from "react";

import { NametrisMark } from "../../components/NametrisMark";
import { validatePlayerName } from "./nameValidation";
import "../../styles/onboarding.css";

interface WelcomeScreenProps {
  readonly onStart: (name: string) => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validatePlayerName(input);

    if (!result.valid) {
      setError(result.message);
      return;
    }

    setError(null);
    onStart(result.name);
  }

  return (
    <main className="welcome-shell">
      <section className="welcome-layout" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <div className="welcome-brand-mark">
            <NametrisMark />
          </div>
          <p className="eyebrow">A TWO-BOARD BLOCK GAME</p>
          <h1 id="welcome-title">NAMETRIS</h1>
          <p className="premise">
            Clear lines on the left. Spend earned pieces to build your name on the
            right.
          </p>
          <ol className="premise-steps">
            <li>
              <strong>Clear</strong>
              <span>Every completed row earns one transfer.</span>
            </li>
            <li>
              <strong>Route</strong>
              <span>Send an eligible spawned piece into your stencil.</span>
            </li>
            <li>
              <strong>Risk</strong>
              <span>Finish safely at 80%, or push for a perfect name.</span>
            </li>
          </ol>
        </div>

        <form className="welcome-form" onSubmit={handleSubmit} noValidate>
          <p className="form-index">PERSONALIZE / 01</p>
          <label htmlFor="player-name">Your name (optional)</label>
          <input
            id="player-name"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              if (error !== null) {
                setError(null);
              }
            }}
            placeholder="HARSH"
            autoComplete="off"
            spellCheck={false}
            aria-describedby="name-help name-privacy"
            aria-invalid={error !== null}
            aria-errormessage={error === null ? undefined : "name-error"}
          />
          <p id="name-help" className="field-help">
            2–10 English letters. Leave blank to play as HARSH.
          </p>
          {error !== null && (
            <p id="name-error" className="field-error" role="alert">
              <span aria-hidden="true" /> {error}
            </p>
          )}
          <p id="name-privacy" className="privacy-note">
            <span aria-hidden="true">◆</span> Your name stays on this device.
          </p>
          <button type="submit" className="primary-button">
            Start building
          </button>
          <details className="controls-summary">
            <summary>View keyboard controls</summary>
            <p>
              Arrow keys move. Space hard-drops. X and Z rotate. N routes an eligible
              piece to your name.
            </p>
          </details>
        </form>
      </section>
    </main>
  );
}
