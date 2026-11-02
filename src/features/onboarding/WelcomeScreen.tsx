import { useEffect, useState } from "react";

import { CabinetShell } from "../../components/CabinetShell";
import { ControlDeck } from "../../components/ControlDeck";
import { NametrisMark } from "../../components/NametrisMark";
import { describePlayerName } from "./nameStats";
import { lettersOnlyName, nameLengthLimit, nameRuleMessage } from "./nameValidation";
import "../../styles/onboarding.css";

interface WelcomeScreenProps {
  readonly onStart: (name: string) => void;
  readonly initialName?: string;
}

export function WelcomeScreen({ onStart, initialName = "" }: WelcomeScreenProps) {
  const [input, setInput] = useState(() => lettersOnlyName(initialName));
  const [ruleAlert, setRuleAlert] = useState(false);
  const stats = describePlayerName(input);

  useEffect(() => {
    if (!ruleAlert) {
      return;
    }

    const timeout = window.setTimeout(() => setRuleAlert(false), 2_000);
    return () => window.clearTimeout(timeout);
  }, [ruleAlert]);

  function handleNameChange(value: string) {
    const stripped = lettersOnlyName(value);
    const typedNonLetter = /[^A-Za-z]/.test(value);
    const overLimit = value.replace(/[^A-Za-z]/g, "").length > nameLengthLimit;
    if (typedNonLetter || overLimit) {
      setRuleAlert(true);
    }
    setInput(stripped);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[A-Z]{2,10}$/.test(input)) {
      setRuleAlert(true);
      return;
    }

    onStart(input);
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
            <label htmlFor="player-name">Your name</label>
            <input
              id="player-name"
              value={input}
              maxLength={nameLengthLimit}
              onChange={(event) => handleNameChange(event.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-describedby="name-stats name-privacy"
              aria-invalid={ruleAlert}
            />
            <div id="name-stats" className="name-stats">
              {stats !== null && (
                <>
                  <p>
                    {stats.name} - {stats.cells} cells - {stats.band}
                  </p>
                  <p>needs at least about {stats.minimumLines} lines</p>
                </>
              )}
            </div>
            {ruleAlert && (
              <p className="field-error" role="alert">
                <span aria-hidden="true" /> {nameRuleMessage}
              </p>
            )}
            <p id="name-privacy" className="privacy-note">
              <span aria-hidden="true">◆</span> Your name stays on this device.
            </p>
            <div className="welcome-start-frame">
              <button
                type="submit"
                className="primary-button"
                disabled={input.length < 2}
              >
                Start building
              </button>
            </div>
          </form>
        </section>
      </main>
    </CabinetShell>
  );
}
