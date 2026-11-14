import { useEffect, useState } from "react";

import logoUrl from "../../assets/logo-160.png";
import { CabinetShell } from "../../components/CabinetShell";
import { primeAudio } from "../juice/audio";
import { ControlDeck } from "../../components/ControlDeck";
import { clearStoredNameTrimNotice } from "./playerNameStorage";
import { describePlayerName } from "./nameStats";
import {
  lettersOnlyAlert,
  lettersOnlyName,
  nameLengthLimit,
  nameTooLongMessage,
  playerNamePattern,
} from "./nameValidation";
import "../../styles/onboarding.css";

interface WelcomeScreenProps {
  readonly onStart: (name: string) => void;
  readonly initialName?: string;
  readonly initialNameTrimmed?: boolean;
}

export function WelcomeScreen({
  onStart,
  initialName = "",
  initialNameTrimmed = false,
}: WelcomeScreenProps) {
  const [input, setInput] = useState(() => lettersOnlyName(initialName));
  const [ruleAlert, setRuleAlert] = useState<string | null>(() =>
    initialNameTrimmed ? nameTooLongMessage : null,
  );
  const [alertGeneration, setAlertGeneration] = useState(0);
  const stats = describePlayerName(input);

  useEffect(() => {
    if (ruleAlert === null) {
      return;
    }

    const timeout = window.setTimeout(() => {
      clearStoredNameTrimNotice();
      setRuleAlert(null);
    }, 2_000);
    return () => window.clearTimeout(timeout);
  }, [alertGeneration, ruleAlert]);

  function showRuleAlert(message: string) {
    setRuleAlert(message);
    setAlertGeneration((current) => current + 1);
  }

  function handleNameChange(value: string) {
    const letters = value.toUpperCase().replace(/[^A-Z]/g, "");
    const typedNonLetter = /[^A-Za-z]/.test(value);
    const overLimit = letters.length > nameLengthLimit;
    if (overLimit) {
      showRuleAlert(nameTooLongMessage);
    } else if (typedNonLetter) {
      showRuleAlert(lettersOnlyAlert);
    }
    setInput(letters.slice(0, nameLengthLimit));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!playerNamePattern.test(input)) {
      showRuleAlert(lettersOnlyAlert);
      return;
    }

    primeAudio();
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
            <img src={logoUrl} alt="" width={80} height={80} />
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
              onChange={(event) => handleNameChange(event.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-describedby="name-stats"
              aria-invalid={ruleAlert !== null}
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
            {ruleAlert !== null && (
              <p className="field-error" role="alert">
                {ruleAlert}
              </p>
            )}
            <div className="welcome-start-frame">
              <button
                type="submit"
                className="primary-button"
                disabled={input.length < 2}
              >
                <span className="face" aria-hidden="true" />
                <span className="label">Start building</span>
              </button>
            </div>
          </form>
        </section>
      </main>
    </CabinetShell>
  );
}
