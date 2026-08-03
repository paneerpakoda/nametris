import { formatTime } from "../game/format";

const PIXEL = { fontFamily: "'PP NeueBit', 'Pixelify Sans', 'Press Start 2P', monospace" };
const BODY = { fontFamily: "'Space Mono', 'Courier New', monospace" };

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between px-4 py-2.5 rounded-[6px]" style={{ background: "rgba(64,44,20,0.12)" }}>
      <span style={{ ...BODY, fontSize: 13, color: "#6a5030", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      <span style={{ ...PIXEL, fontSize: 16, color: "#392409" }}>{value}</span>
    </div>
  );
}

function ActionBtn({ children, onClick, primary }: { children: React.ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-4 rounded-[8px] active:scale-[0.98] transition-transform outline-none focus-visible:ring-2 focus-visible:ring-[#402c14]"
      style={
        primary
          ? { background: "#f5c546", border: "1px solid #4d3907", boxShadow: "0px 2px 8px rgba(64,44,20,0.15), inset 0 0 2px rgba(244,244,244,0.5)" }
          : { background: "rgba(64,44,20,0.15)", border: "1px solid #402c14" }
      }
    >
      <span style={{ ...PIXEL, fontSize: 12, color: primary ? "#4d3907" : "#392409" }}>{children}</span>
    </button>
  );
}

export function LossResult({
  name,
  completion,
  score,
  rows,
  level,
  timeMs,
  onPlayAgain,
  onTryName,
}: {
  name: string;
  completion: number;
  score: number;
  rows: number;
  level: number;
  timeMs: number;
  onPlayAgain: () => void;
  onTryName: () => void;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-6" style={{ background: "rgba(19,24,19,0.88)" }}>
      <div
        className="flex flex-col items-center gap-6 rounded-[16px] p-10 w-full max-w-md"
        style={{ background: "#dbc5a5", border: "1px solid #402c14", boxShadow: "inset 0 0 2px #f8e4c6, 0 8px 32px rgba(0,0,0,0.5)" }}
      >
        <h2 style={{ ...PIXEL, fontSize: 28, color: "#9b2c1a", lineHeight: 1.3 }}>GAME OVER</h2>

        <p style={{ ...PIXEL, fontSize: 14, color: "#f5c546", letterSpacing: 3 }}>{name}</p>

        <div className="flex flex-col gap-2 w-full">
          <StatRow label="Completion" value={`${completion}%`} />
          <StatRow label="Score" value={score.toLocaleString()} />
          <StatRow label="Rows Cleared" value={rows} />
          <StatRow label="Level" value={level} />
          <StatRow label="Playtime" value={formatTime(timeMs)} />
        </div>

        <div className="flex gap-3 w-full">
          <ActionBtn primary onClick={onPlayAgain}>PLAY AGAIN</ActionBtn>
          <ActionBtn onClick={onTryName}>TRY ANOTHER NAME</ActionBtn>
        </div>
      </div>
    </div>
  );
}
