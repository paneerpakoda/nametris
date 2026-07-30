import { useState } from "react";

import { GameplayScreen } from "../features/gameplay/GameplayScreen";
import { WelcomeScreen } from "../features/onboarding/WelcomeScreen";

export function App() {
  const [sessionName, setSessionName] = useState<string | null>(null);

  if (sessionName !== null) {
    return <GameplayScreen name={sessionName} />;
  }

  return <WelcomeScreen onStart={setSessionName} />;
}
