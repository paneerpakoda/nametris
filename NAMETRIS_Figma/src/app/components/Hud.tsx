import { formatTime } from "../game/format";
import { Piece } from "../game/pieces";
import { NextPiecePreview } from "./NextPiecePreview";

const PIXEL = { fontFamily: "'PP NeueBit', 'Pixelify Sans', 'Press Start 2P', monospace" };
const BODY = { fontFamily: "'Space Mono', 'Courier New', monospace" };

// Parchment stat card
function Stat({ label, children, accent }: { label: string; children: React.ReactNode; accent?: string }) {
  return (
    <div
      className="rounded-[8px] px-3 py-2"
      style={{ background: "#dbc5a5", border: "1px solid #402c14", boxShadow: "inset 0 0 2px #f8e4c6" }}
    >
      <p className="text-[#8a6a3a] uppercase text-[10px] mb-0.5" style={{ ...BODY, letterSpacing: "0.12em" }}>
        {label}
      </p>
      <p className="font-bold text-lg leading-tight" style={{ ...PIXEL, color: accent ?? "#392409" }}>
        {children}
      </p>
    </div>
  );
}

export function Hud({
  score,
  rows,
  level,
  credits,
  elapsedMs,
  nextPiece,
  flashNoCredit,
  highlightRoute,
  onHelp,
}: {
  score: number;
  rows: number;
  level: number;
  credits: number;
  elapsedMs: number;
  nextPiece: Piece | null;
  flashNoCredit: boolean;
  highlightRoute: boolean;
  onHelp: () => void;
}) {
  return (
    <div className="flex flex-col gap-2" style={{ width: 130 }}>
      <Stat label="Score">{score.toLocaleString()}</Stat>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Level">{level}</Stat>
        <Stat label="Rows">{rows}</Stat>
      </div>
      <Stat label="Time">{formatTime(elapsedMs)}</Stat>

      {/* Credits */}
      <div
        className={`rounded-[8px] px-3 py-2 transition-all ${highlightRoute ? "animate-pulse" : ""}`}
        style={{
          background: flashNoCredit ? "#9b2c1a" : credits > 0 ? "#f5c546" : "#dbc5a5",
          border: `1px solid ${flashNoCredit ? "#7a1a0a" : credits > 0 ? "#4d3907" : "#402c14"}`,
          boxShadow: "inset 0 0 2px #f8e4c6",
        }}
      >
        <p
          className="uppercase text-[10px] mb-0.5"
          style={{ ...BODY, letterSpacing: "0.12em", color: flashNoCredit ? "#f8d5d0" : credits > 0 ? "#4d3907" : "#8a6a3a" }}
        >
          Credits
        </p>
        <p
          className="font-bold text-lg leading-tight"
          style={{ ...PIXEL, color: flashNoCredit ? "#fff" : credits > 0 ? "#4d3907" : "#392409" }}
        >
          {credits}
          {flashNoCredit && <span style={{ ...BODY, fontSize: 12 }}> · none!</span>}
        </p>
      </div>

      {/* Next piece */}
      <div
        className="rounded-[8px] px-3 py-2"
        style={{ background: "#dbc5a5", border: "1px solid #402c14", boxShadow: "inset 0 0 2px #f8e4c6" }}
      >
        <p className="text-[#8a6a3a] uppercase text-[10px] mb-2" style={{ ...BODY, letterSpacing: "0.12em" }}>
          Next
        </p>
        <div className="flex items-center justify-center min-h-[46px]">
          <NextPiecePreview piece={nextPiece} />
        </div>
      </div>

      {/* Route hint */}
      <div
        className={`rounded-[8px] px-2 py-1.5 text-center transition-all ${highlightRoute ? "animate-pulse" : ""}`}
        style={{
          background: highlightRoute ? "rgba(245,197,70,0.25)" : "rgba(219,197,165,0.3)",
          border: `1px solid ${highlightRoute ? "#f5c546" : "rgba(64,44,20,0.3)"}`,
        }}
      >
        <p className="text-[10px]" style={{ ...PIXEL, color: highlightRoute ? "#f5c546" : "#8a6a3a" }}>
          [N] = Route
        </p>
      </div>

      {/* Help */}
      <button
        onClick={onHelp}
        className="rounded-[8px] px-2 py-1.5 text-center transition-all hover:brightness-110 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-[#f5c546]"
        style={{ background: "rgba(219,197,165,0.3)", border: "1px solid rgba(64,44,20,0.3)" }}
      >
        <span className="text-[10px]" style={{ ...PIXEL, color: "#8a6a3a" }}>
          ? HELP
        </span>
      </button>
    </div>
  );
}
