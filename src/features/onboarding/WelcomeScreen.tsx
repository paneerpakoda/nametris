import { useState } from "react";

import { CabinetShell } from "../../components/CabinetShell";
import { ControlDeck } from "../../components/ControlDeck";
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
    <CabinetShell
      screenLabel="Welcome display"
      controlDeck={<ControlDeck />}
      screenClassName="welcome-cabinet-screen"
    >
      <main className="welcome-screen" aria-labelledby="welcome-title">
        <section className="welcome-layout">
          <div className="welcome-brand-mark">
            <NametrisMark />
          </div>
          <h1 id="welcome-title">NAMETRIS</h1>
          <p className="welcome-tagline">
            CLEAR LINES. <span>BUILD YOUR NAME!</span>
          </p>

          <form className="welcome-form" onSubmit={handleSubmit} noValidate>
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
            <div className="welcome-start-frame">
              <button type="submit" className="primary-button">
                Start building
              </button>
            </div>
          </form>
        </section>
      </main>
    </CabinetShell>
  );
}
