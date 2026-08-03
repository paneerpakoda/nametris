import { useState } from "react";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { GameScreen } from "./components/GameScreen";

export default function App() {
  const [screen, setScreen] = useState<"welcome" | "game">("welcome");
  const [playerName, setPlayerName] = useState("HARSH");

  const handleStart = (name: string) => {
    setPlayerName(name || "HARSH");
    setScreen("game");
  };

  if (screen === "welcome") {
    return <WelcomeScreen onStart={handleStart} />;
  }

  return (
    <GameScreen
      key={playerName}
      name={playerName}
      onTryName={() => setScreen("welcome")}
    />
  );
}
