import { useRef, useState, useCallback } from "react";
import { NameGrid } from "../game/alphabet";
import { formatTime } from "../game/format";

const PIXEL = { fontFamily: "'PP NeueBit', 'Pixelify Sans', 'Press Start 2P', monospace" };
const BODY = { fontFamily: "'Space Mono', 'Courier New', monospace" };

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function MiniName({ grid }: { grid: NameGrid }) {
  const cell = Math.max(3, Math.min(14, Math.floor(380 / grid.cols)));
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${grid.cols}, ${cell}px)`,
        gridTemplateRows: `repeat(${grid.rows}, ${cell}px)`,
        gap: 1,
      }}
    >
      {Array.from({ length: grid.rows }, (_, r) =>
        Array.from({ length: grid.cols }, (_, c) => {
          const filled = grid.cells[r][c] && grid.filled[r][c];
          const hue = ((r * grid.cols + c) * 47) % 360;
          return (
            <div
              key={`${r},${c}`}
              style={{
                width: cell,
                height: cell,
                background: filled ? `hsl(${hue}, 80%, 55%)` : "transparent",
                boxShadow: filled ? "inset 1px 1px 0 rgba(255,255,255,0.35), inset -1px -1px 0 rgba(0,0,0,0.4)" : undefined,
              }}
            />
          );
        })
      )}
    </div>
  );
}

export function RewardCard({
  name,
  grid,
  title,
  score,
  activeMs,
  completion,
  perfect,
}: {
  name: string;
  grid: NameGrid;
  title: string;
  score: number;
  activeMs: number;
  completion: number;
  perfect: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [shine, setShine] = useState({ x: 50, active: false });
  const reduced = prefersReducedMotion();

  const handleMove = useCallback((e: React.PointerEvent) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({ rx: (0.5 - py) * 12, ry: (px - 0.5) * 14 });
    setShine({ x: px * 100, active: true });
  }, [reduced]);

  const handleLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0 });
    setShine((s) => ({ ...s, active: false }));
  }, []);

  const badge = perfect ? "PERFECT · 100%" : `NAME COMPLETE · ${completion}%`;

  return (
    <div style={{ perspective: 1000 }}>
      <div
        ref={ref}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={{
          position: "relative",
          width: 440,
          maxWidth: "85vw",
          borderRadius: 16,
          padding: 32,
          background: "#dbc5a5",
          border: "2px solid #402c14",
          overflow: "hidden",
          transformStyle: "preserve-3d",
          transform: reduced ? undefined : `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5), inset 0 0 2px #f8e4c6",
        }}
      >
        {/* Shine layer — translucent solid-color, no gradient */}
        {!reduced && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "-40%",
              left: `calc(${shine.x}% - 60px)`,
              width: 120,
              height: "180%",
              background: "rgba(255,255,255,0.18)",
              transform: "rotate(18deg)",
              opacity: shine.active ? 1 : 0,
              transition: "opacity 0.3s, left 0.15s linear",
              pointerEvents: "none",
            }}
          />
        )}

        <div style={{ position: "relative" }}>
          <div className="flex items-center justify-between mb-5">
            <span style={{ ...PIXEL, fontSize: 11, color: "#392409", letterSpacing: 3 }}>NAMETRIS</span>
            <span style={{ ...PIXEL, fontSize: 10, color: perfect ? "#9b2c1a" : "#4d3907" }}>{badge}</span>
          </div>

          <div className="flex justify-center mb-6">
            <MiniName grid={grid} />
          </div>

          <p className="text-center mb-1" style={{ ...PIXEL, fontSize: 16, color: "#392409", lineHeight: 1.5 }}>
            {title}
          </p>
          <p className="text-center mb-6" style={{ ...BODY, fontSize: 14, color: "#6a5030" }}>{name}</p>

          <div className="flex justify-center gap-8">
            <div className="text-center">
              <p style={{ ...BODY, fontSize: 11, color: "#8a6a3a", textTransform: "uppercase", letterSpacing: "0.12em" }}>Score</p>
              <p style={{ ...PIXEL, fontSize: 18, color: "#392409" }}>{score.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p style={{ ...BODY, fontSize: 11, color: "#8a6a3a", textTransform: "uppercase", letterSpacing: "0.12em" }}>Time</p>
              <p style={{ ...PIXEL, fontSize: 18, color: "#392409" }}>{formatTime(activeMs)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
