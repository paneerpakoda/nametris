import { useEffect, useState } from "react";

import { GameplayScreen } from "../features/gameplay/GameplayScreen";
import { HowItWorks } from "../features/onboarding/HowItWorks";
import {
  hasSeenHowItWorks,
  markHowItWorksSeen,
} from "../features/onboarding/howItWorksStorage";
import {
  readStoredPlayerName,
  storePlayerName,
} from "../features/onboarding/playerNameStorage";
import { useReducedMotion } from "../features/juice/preferences";
import { WelcomeScreen } from "../features/onboarding/WelcomeScreen";
import { LossScreen } from "../features/results/LossScreen";
import { SuccessScreen } from "../features/results/SuccessScreen";
import type { LossResult, RunResult } from "../game/engine/result";
import { createRunSeed } from "../game/runtime/seed";

interface AppProps {
  readonly initialOutcome?: RunResult | LossResult;
}

export function App({ initialOutcome }: AppProps) {
  const [sessionName, setSessionName] = useState<string | null>(
    initialOutcome?.name ?? null,
  );
  const [outcome, setOutcome] = useState<RunResult | LossResult | null>(
    initialOutcome ?? null,
  );
  const [runNumber, setRunNumber] = useState(0);
  const [seed, setSeed] = useState(() => createRunSeed(window.location.search));
  const [showIntro, setShowIntro] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    document.documentElement.classList.toggle("is-reduced-motion", reducedMotion);
    return () => document.documentElement.classList.remove("is-reduced-motion");
  }, [reducedMotion]);

  function nextSeed() {
    setSeed(createRunSeed(window.location.search));
    setRunNumber((current) => current + 1);
  }

  function playAgain() {
    nextSeed();
    setOutcome(null);
  }

  function tryAnotherName() {
    setOutcome(null);
    setSessionName(null);
  }

  if (outcome?.outcome === "won") {
    return (
      <SuccessScreen
        result={outcome}
        onPlayAgain={playAgain}
        onNewName={tryAnotherName}
      />
    );
  }

  if (outcome?.outcome === "lost") {
    return (
      <LossScreen result={outcome} onPlayAgain={playAgain} onNewName={tryAnotherName} />
    );
  }

  if (sessionName !== null && showIntro) {
    return (
      <HowItWorks
        onDone={() => {
          markHowItWorksSeen();
          setShowIntro(false);
        }}
      />
    );
  }

  if (sessionName !== null) {
    return (
      <GameplayScreen
        key={runNumber}
        name={sessionName}
        seed={seed}
        onWon={setOutcome}
        onLost={setOutcome}
        onRestart={nextSeed}
        onNewName={() => setSessionName(null)}
      />
    );
  }

  return (
    <WelcomeScreen
      initialName={readStoredPlayerName()}
      onStart={(name) => {
        storePlayerName(name);
        setOutcome(null);
        setSessionName(name);
        setShowIntro(!hasSeenHowItWorks());
      }}
    />
  );
}
