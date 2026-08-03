import { KeyCap } from "./KeyCap";

const PIXEL = { fontFamily: "'PP NeueBit', 'Pixelify Sans', 'Press Start 2P', monospace" };
const BODY = { fontFamily: "'Space Mono', 'Courier New', monospace" };

const PLAY_CONTROLS: [string, string, string][] = [
  ["left", "Move left", ""],
  ["right", "Move right", ""],
  ["down", "Soft drop", ""],
  ["up", "Rotate CW", ""],
  ["Z", "Rotate CCW", ""],
  ["space", "Hard drop", ""],
  ["N", "Route to name", ""],
  ["P", "Pause", ""],
];

const PLACE_CONTROLS: [string, string][] = [
  ["Arrows / WASD", "Move piece"],
  ["X / ↑", "Rotate CW"],
  ["Z", "Rotate CCW"],
  ["Enter / Space", "Place"],
  ["Escape", "Cancel (keeps credit)"],
];

export function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-6" style={{ background: "rgba(19,24,19,0.88)" }}>
      <div
        className="rounded-[16px] p-8 w-full max-w-2xl"
        style={{ background: "#dbc5a5", border: "1px solid #402c14", boxShadow: "inset 0 0 2px #f8e4c6, 0 8px 32px rgba(0,0,0,0.5)" }}
      >
        <h2 style={{ ...PIXEL, fontSize: 22, color: "#392409", marginBottom: 8 }}>HOW TO PLAY</h2>
        <p className="mb-6" style={{ ...BODY, fontSize: 13, color: "#6a5030", lineHeight: 1.8 }}>
          Clear rows to earn transfer credits, then press N to route a piece into your name stencil.
          Reach 80% to unlock finishing; 100% earns a perfect result.
        </p>

        <div className="grid grid-cols-2 gap-8 mb-7">
          {/* Gameplay keys */}
          <div>
            <p className="mb-3" style={{ ...PIXEL, fontSize: 10, color: "#402c14", letterSpacing: 2, textTransform: "uppercase" }}>
              Gameplay
            </p>
            <div className="flex flex-wrap gap-3">
              {PLAY_CONTROLS.map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <KeyCap label={key as any} />
                  <span style={{ ...BODY, fontSize: 11, color: "#392409" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Placement keys */}
          <div>
            <p className="mb-3" style={{ ...PIXEL, fontSize: 10, color: "#402c14", letterSpacing: 2, textTransform: "uppercase" }}>
              Name Placement
            </p>
            <div className="flex flex-col gap-2">
              {PLACE_CONTROLS.map(([key, label]) => (
                <div key={key} className="flex gap-3 text-sm">
                  <span className="font-semibold w-36 shrink-0" style={{ ...BODY, fontSize: 11, color: "#392409" }}>{key}</span>
                  <span style={{ ...BODY, fontSize: 11, color: "#6a5030" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-[8px] active:scale-[0.98] transition-transform outline-none focus-visible:ring-2 focus-visible:ring-[#402c14]"
          style={{
            background: "#f5c546",
            border: "1px solid #4d3907",
            boxShadow: "0px 2px 8px rgba(64,44,20,0.15), inset 0 0 2px rgba(244,244,244,0.5)",
          }}
        >
          <span style={{ ...PIXEL, fontSize: 18, color: "#4d3907" }}>RESUME</span>
        </button>
      </div>
    </div>
  );
}
