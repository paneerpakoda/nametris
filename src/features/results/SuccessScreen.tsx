import { useState } from "react";

import type { RunResult } from "../../game/engine/result";
import { RewardCard } from "../reward/RewardCard";
import { copyResult, downloadRewardCard, shareResult } from "../reward/localActions";
import "../../styles/reward.css";

interface SuccessScreenProps {
  readonly result: RunResult;
  readonly onPlayAgain: () => void;
  readonly onNewName: () => void;
}

export function SuccessScreen({ result, onPlayAgain, onNewName }: SuccessScreenProps) {
  const [actionStatus, setActionStatus] = useState("");

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
    <main className="result-shell result-shell-success">
      <div className="result-heading">
        <p className="eyebrow">RUN COMPLETE</p>
        <h1>YOU BUILT IT.</h1>
      </div>
      <RewardCard result={result} />
      <div className="result-actions" aria-label="Result actions">
        <button type="button" className="primary-button" onClick={onPlayAgain}>
          Play again
        </button>
        <button type="button" className="secondary-button" onClick={onNewName}>
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
          Download card
        </button>
        <button type="button" className="secondary-button" onClick={handleCopy}>
          Copy result
        </button>
        <button type="button" className="secondary-button" onClick={handleShare}>
          Share
        </button>
      </div>
      <p className="result-status" aria-live="polite">
        {actionStatus}
      </p>
    </main>
  );
}
