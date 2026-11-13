import { Copy, Download, Share2, Type } from "lucide-react";
import { useEffect, useState } from "react";

import { CabinetShell } from "../../components/CabinetShell";
import { ControlDeck } from "../../components/ControlDeck";
import type { RunResult } from "../../game/engine/result";
import { ParticleField } from "../juice/ParticleField";
import { emitConfetti } from "../juice/particles";
import { useReducedMotion } from "../juice/preferences";
import { RewardCard } from "../reward/RewardCard";
import { copyResult, downloadRewardCard, shareResult } from "../reward/localActions";
import "../../styles/reward.css";

interface SuccessScreenProps {
  readonly result: RunResult;
  readonly onPlayAgain: () => void;
  readonly onNewName: () => void;
}

export function SuccessScreen({ result, onPlayAgain, onNewName }: SuccessScreenProps) {
  const reduced = useReducedMotion();
  const [actionStatus, setActionStatus] = useState("");

  useEffect(() => {
    if (reduced) {
      return;
    }
    try {
      emitConfetti();
    } catch {
      // Confetti must not block the win screen.
    }
  }, [reduced]);

  async function handleCopy() {
    try {
      await copyResult(result);
      setActionStatus("Result copied locally.");
    } catch {
      setActionStatus("Clipboard access is unavailable.");
    }
  }

  async function handleShare() {
    try {
      const method = await shareResult(result);
      setActionStatus(
        method === "shared"
          ? "Share sheet opened."
          : "Sharing is unavailable, so the result was copied locally.",
      );
    } catch {
      setActionStatus("Sharing and clipboard access are unavailable.");
    }
  }

  return (
    <CabinetShell
      screenLabel="Success display"
      screenClassName="result-crt-screen"
      controlDeck={<ControlDeck />}
    >
      <main className="result-shell result-shell-success">
        {reduced ? (
          <p className="win-plaque" data-testid="win-plaque">
            {result.name}
          </p>
        ) : (
          <ParticleField />
        )}
        <div className="result-heading">
          <h1>YOU BUILT IT.</h1>
        </div>
        <RewardCard result={result} />
        <div className="result-actions" aria-label="Result actions">
          <button type="button" className="primary-button" onClick={onPlayAgain}>
            Play again
          </button>
          <button type="button" className="secondary-button" onClick={onNewName}>
            <Type aria-hidden="true" />
            Try another name
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              downloadRewardCard(result);
              setActionStatus("Card downloaded locally.");
            }}
          >
            <Download aria-hidden="true" />
            Download card
          </button>
          <button type="button" className="secondary-button" onClick={handleCopy}>
            <Copy aria-hidden="true" />
            Copy result
          </button>
          <button type="button" className="secondary-button" onClick={handleShare}>
            <Share2 aria-hidden="true" />
            Share
          </button>
        </div>
        <p className="result-status" aria-live="polite">
          {actionStatus}
        </p>
      </main>
    </CabinetShell>
  );
}
