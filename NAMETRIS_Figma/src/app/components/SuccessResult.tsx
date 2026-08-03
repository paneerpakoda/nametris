import { useMemo, useState } from "react";
import { NameGrid } from "../game/alphabet";
import { Metrics, derive } from "../game/metrics";
import { evaluateTitle } from "../game/titles";
import { PERFECT_COMPLETION } from "../game/config";
import { ResultData, downloadCard, copyResult, shareResult, canShare } from "../game/export";
import { RewardCard } from "./RewardCard";

const PIXEL = { fontFamily: "'PP NeueBit', 'Pixelify Sans', 'Press Start 2P', monospace" };
const BODY = { fontFamily: "'Space Mono', 'Courier New', monospace" };

function ActionBtn({
  children,
  onClick,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-3 rounded-[8px] active:scale-[0.98] transition-transform outline-none focus-visible:ring-2 focus-visible:ring-[#402c14]"
      style={
        primary
          ? { background: "#f5c546", border: "1px solid #4d3907", boxShadow: "0px 2px 8px rgba(64,44,20,0.15), inset 0 0 2px rgba(244,244,244,0.5)" }
          : { background: "rgba(219,197,165,0.25)", border: "1px solid #402c14" }
      }
    >
      <span style={{ ...PIXEL, fontSize: 11, color: primary ? "#4d3907" : "#ede6d3" }}>{children}</span>
    </button>
  );
}

export function SuccessResult({
  name,
  grid,
  metrics,
  onPlayAgain,
  onTryName,
}: {
  name: string;
  grid: NameGrid;
  metrics: Metrics;
  onPlayAgain: () => void;
  onTryName: () => void;
}) {
  const derived = useMemo(() => derive(metrics), [metrics]);
  const title = useMemo(() => evaluateTitle(derived), [derived]);
  const perfect = metrics.completion >= PERFECT_COMPLETION;
  const [copied, setCopied] = useState(false);

  const data: ResultData = {
    name,
    grid,
    title: title.name,
    score: metrics.score,
    activeMs: metrics.activeMs,
    completion: metrics.completion,
    perfect,
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 z-50 px-6 overflow-auto py-8" style={{ background: "rgba(19,24,19,0.9)" }}>
      <RewardCard
        name={name}
        grid={grid}
        title={title.name}
        score={metrics.score}
        activeMs={metrics.activeMs}
        completion={metrics.completion}
        perfect={perfect}
      />

      <p className="text-center max-w-sm" style={{ ...BODY, fontSize: 14, color: "#ede6d3", opacity: 0.8 }}>
        {title.blurb}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <ActionBtn primary onClick={onPlayAgain}>PLAY AGAIN</ActionBtn>
        <ActionBtn onClick={onTryName}>TRY ANOTHER NAME</ActionBtn>
        <ActionBtn onClick={() => downloadCard(data)}>DOWNLOAD CARD</ActionBtn>
        <ActionBtn
          onClick={async () => {
            const ok = await copyResult(data);
            if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); }
          }}
        >
          {copied ? "COPIED!" : "COPY RESULT"}
        </ActionBtn>
        {canShare() && <ActionBtn onClick={() => shareResult(data)}>SHARE</ActionBtn>}
      </div>
    </div>
  );
}
