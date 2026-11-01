import { useEffect, useState } from "react";

import { CabinetShell } from "../../components/CabinetShell";
import { ControlDeck } from "../../components/ControlDeck";
import { KeyHint } from "../../components/KeyHint";

interface HowItWorksProps {
  readonly onDone: () => void;
  readonly overlay?: boolean;
}

const screens = [
  {
    id: "win",
    title: "Fill your name to 80% to win.",
  },
  {
    id: "send",
    title: "Clear a row, then press Shift to stamp a name piece onto your name.",
  },
  {
    id: "keys",
    title: "The keys",
  },
] as const;

const keyRows = [
  { keys: ["←", "→", "A", "D"], label: "Move" },
  { keys: ["↑", "X", "Z"], label: "Rotate" },
  { keys: ["↓", "S"], label: "Soft drop" },
  { keys: ["SPACE"], label: "Hard drop" },
  { keys: ["SHIFT"], label: "Stamp a name piece" },
  { keys: ["P", "ESC"], label: "Pause" },
] as const;

export function HowItWorks({ onDone, overlay = false }: HowItWorksProps) {
  const [index, setIndex] = useState(0);
  const screen = screens[index] ?? screens[0];
  const lastScreen = index === screens.length - 1;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onDone();
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (lastScreen) {
          onDone();
        } else {
          setIndex((current) => Math.min(screens.length - 1, current + 1));
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lastScreen, onDone]);

  const card = (
    <section
      className="how-it-works"
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-it-works-title"
    >
      <p className="panel-kicker">
        HOW IT WORKS · {index + 1} / {screens.length}
      </p>
      <h2 id="how-it-works-title">{screen.title}</h2>
      {screen.id === "keys" && (
        <ul className="how-it-works-keys">
          {keyRows.map((row) => (
            <li key={row.label}>
              <span>
                {row.keys.map((key) => (
                  <KeyHint key={key} wide={key.length > 2}>
                    {key}
                  </KeyHint>
                ))}
              </span>
              {row.label}
            </li>
          ))}
        </ul>
      )}
      <div className="how-it-works-actions">
        <button type="button" className="secondary-button" onClick={onDone}>
          Skip
        </button>
        {lastScreen ? (
          <button type="button" className="primary-button compact" onClick={onDone}>
            Play
          </button>
        ) : (
          <button
            type="button"
            className="primary-button compact"
            onClick={() => setIndex((current) => current + 1)}
          >
            Next
          </button>
        )}
      </div>
    </section>
  );

  if (overlay) {
    return <div className="how-it-works-overlay">{card}</div>;
  }

  return (
    <CabinetShell
      screenLabel="How it works"
      controlDeck={<ControlDeck />}
      screenClassName="welcome-cabinet-screen"
    >
      <main className="how-it-works-page">{card}</main>
    </CabinetShell>
  );
}
