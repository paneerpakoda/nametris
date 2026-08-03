import { useState, useId } from "react";
import { sanitizeName } from "../game/alphabet";
import { KeyboardBar } from "./KeyCap";
import imgLogo from "@/imports/MacBookAir3/2f82ed38bd9babd2874d11d8e0723f37e1298b9b.png";

const PIXEL = { fontFamily: "'PP NeueBit', 'Pixelify Sans', 'Press Start 2P', monospace" };
const HELVETICA = { fontFamily: "Helvetica, Arial, sans-serif" };

export function WelcomeScreen({ onStart }: { onStart: (name: string) => void }) {
  const [name, setName] = useState("HARSH");
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const errorId = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(sanitizeName(e.target.value));
    setError(null);
  };

  const handleStart = () => {
    const final = name.trim() || "HARSH";
    if (final.length < 2) {
      setError("Enter at least 2 letters, or leave blank to use HARSH.");
      return;
    }
    onStart(final);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleStart();
  };

  return (
    <div
      className="h-screen overflow-hidden flex flex-col"
      style={{ background: "#131813", userSelect: "none" }}
    >
      {/* Main area */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center pt-[40px] pb-4 px-6">

        {/* Hero: logo + title + tagline */}
        <div className="flex flex-col items-center gap-[16px] mb-0">
          <div className="relative shrink-0 size-[80px]">
            <img
              src={imgLogo}
              alt="NAMETRIS logo"
              className="absolute inset-0 max-w-none object-cover size-full"
            />
          </div>
          <p
            className="text-[#ede6d3] text-center whitespace-nowrap"
            style={{ ...PIXEL, fontSize: 80, lineHeight: "normal" }}
          >
            NAMETRIS
          </p>
          <p
            className="text-[#ede6d3] text-center whitespace-nowrap"
            style={{ ...HELVETICA, fontSize: 24, lineHeight: "normal" }}
          >
            Clear lines. Build your name!
          </p>
        </div>

        {/* Card */}
        <div
          className="relative rounded-[16px] w-full max-w-[509px] flex flex-col gap-[40px] items-center mt-[32px]"
          style={{
            background: "#dbc5a5",
            border: "1px solid #402c14",
            boxShadow: "0px 2px 8px rgba(248,228,198,0.25), inset 0px 0px 2px 0px #f8e4c6",
            paddingTop: 20,
            paddingBottom: 24,
            paddingLeft: 24,
            paddingRight: 24,
          }}
        >
          {/* Description */}
          <div
            className="flex flex-col gap-[6px] items-center text-center text-[#392409] w-full whitespace-nowrap"
            style={{ ...HELVETICA, fontSize: 24, lineHeight: "normal" }}
          >
            <p className="relative shrink-0">Clear a line to earn a transfer.</p>
            <p className="relative shrink-0">Use it to place the next piece in your name.</p>
          </div>

          {/* Input section */}
          <div className="flex flex-col items-start w-full">
            <div className="flex flex-col gap-[12px] items-start w-full">
              {/* Label */}
              <div className="flex items-center justify-center px-[8px] relative shrink-0">
                <label
                  htmlFor={inputId}
                  className="text-[#392409] text-center whitespace-nowrap"
                  style={{ ...HELVETICA, fontSize: 20, lineHeight: "normal" }}
                >
                  Your Name (optional)
                </label>
              </div>

              {/* Input */}
              <div
                className="relative rounded-[8px] shrink-0 w-full"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                  <div className="flex items-center px-[16px] py-[12px] w-full">
                    <input
                      id={inputId}
                      value={name}
                      onChange={handleChange}
                      onKeyDown={handleKey}
                      maxLength={10}
                      placeholder="HARSH"
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? errorId : undefined}
                      className="w-full bg-transparent text-[#131313] placeholder:text-[#131313] placeholder:opacity-40 outline-none tracking-[0.05em]"
                      style={{ ...HELVETICA, fontSize: 24, lineHeight: "normal" }}
                      autoFocus
                    />
                  </div>
                </div>
                <div
                  aria-hidden
                  className="absolute border border-[#dbc5a5] border-solid inset-0 pointer-events-none rounded-[8px]"
                />
              </div>

              {error && (
                <p id={errorId} role="alert" className="text-[#9b2c1a] text-sm" style={HELVETICA}>
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* START button */}
          <button
            onClick={handleStart}
            className="relative rounded-[8px] w-full overflow-hidden active:scale-[0.98] transition-transform outline-none focus-visible:ring-2 focus-visible:ring-[#402c14]"
            style={{
              background: "#f5c546",
              border: "1px solid #4d3907",
              boxShadow: "0px 2px 8px 0px rgba(64,44,20,0.15), inset 0px 0px 2px 2px rgba(244,244,244,0.55)",
            }}
          >
            <div className="flex items-center justify-center px-10 py-5">
              <span
                className="text-[#4d3907] text-center"
                style={{ ...PIXEL, fontSize: 40, lineHeight: 1 }}
              >
                START
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom keyboard reference bar */}
      <KeyboardBar />
    </div>
  );
}
