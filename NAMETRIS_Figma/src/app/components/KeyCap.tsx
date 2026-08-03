import svgPaths from "@/imports/MacBookAir3/svg-q2qkjybzwv";

// ─── 3D keyboard key exactly as designed in Figma ────────────────────────────

function KeyStyle() {
  return (
    <div className="absolute contents inset-0">
      <div className="absolute bg-black inset-[3px_0_0_0] rounded-[5px]" />
      <div className="absolute bg-gradient-to-b border border-[#404040] border-solid from-[#404040] from-[10.909%] inset-[0_0_3px_0] rounded-[5px] to-[#222]" />
    </div>
  );
}

export function KeyCap({ label, wide }: { label: string | "up" | "down" | "left" | "right" | "space"; wide?: boolean }) {
  const w = wide ? "w-[80px]" : "w-[58px]";

  const renderLabel = () => {
    if (label === "up")
      return (
        <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[9.018px] left-[calc(50%-0.5px)] top-[calc(50%-0.99px)] w-[8.783px]">
          <svg className="absolute block inset-0 size-full" fill="none" height="9.01758" preserveAspectRatio="none" viewBox="0 0 8.7832 9.01758" width="8.7832">
            <path d={svgPaths.pb38e780} fill="white" />
          </svg>
        </div>
      );
    if (label === "down")
      return (
        <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[9.018px] left-[calc(50%-0.5px)] top-[calc(50%-0.99px)] w-[8.783px]">
          <svg className="absolute block inset-0 size-full" fill="none" height="9.01758" preserveAspectRatio="none" viewBox="0 0 8.7832 9.01758" width="8.7832">
            <path d={svgPaths.p3b5a5800} fill="white" />
          </svg>
        </div>
      );
    if (label === "left")
      return (
        <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[8.783px] left-[calc(50%-0.64px)] top-[calc(50%-0.99px)] w-[9.018px]">
          <svg className="absolute block inset-0 size-full" fill="none" height="8.7832" preserveAspectRatio="none" viewBox="0 0 9.01758 8.7832" width="9.01758">
            <path d={svgPaths.p3154a940} fill="white" />
          </svg>
        </div>
      );
    if (label === "right")
      return (
        <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[8.783px] left-[calc(50%-0.36px)] top-[calc(50%-0.99px)] w-[9.023px]">
          <svg className="absolute block inset-0 size-full" fill="none" height="8.7832" preserveAspectRatio="none" viewBox="0 0 9.02344 8.7832" width="9.02344">
            <path d={svgPaths.p26478380} fill="white" />
          </svg>
        </div>
      );
    if (label === "space")
      return (
        <>
          <div className="absolute h-[2.508px] left-[4.61px] top-[12px] w-[7.116px]">
            <svg className="absolute block inset-0 size-full" fill="none" height="2.508" preserveAspectRatio="none" viewBox="0 0 7.116 2.508" width="7.116">
              <path d={svgPaths.p2001cb80} fill="white" />
            </svg>
          </div>
          <p className="absolute bottom-[21px] font-['Space_Mono',monospace] font-normal leading-normal left-[5px] text-[12px] text-white translate-y-full whitespace-nowrap">
            space
          </p>
        </>
      );
    return (
      <div className="absolute flex flex-col font-['Space_Mono',monospace] font-normal inset-[0_0_2px_0] justify-center leading-[0] text-[27px] text-center text-white uppercase">
        <p className="leading-[normal]">{label}</p>
      </div>
    );
  };

  return (
    <div className={`relative shrink-0 h-[58px] ${w}`}>
      <div className="absolute inset-0 rounded-[10px]">
        <KeyStyle />
      </div>
      {renderLabel()}
    </div>
  );
}

// ─── Full keyboard reference bar (bottom strip) ──────────────────────────────

function KeyGroup({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`content-stretch flex flex-col gap-[12px] items-center relative shrink-0${wide ? " w-full" : ""}`}>
      <p
        className="leading-[normal] text-[#402c14] text-center whitespace-nowrap"
        style={{ fontFamily: "Helvetica, Arial, sans-serif", fontSize: 24 }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

export function KeyboardBar() {
  return (
    <div
      className="relative rounded-tl-[16px] rounded-tr-[16px] w-full shrink-0"
      style={{ background: "#dbc5a5", border: "1px solid #402c14", borderBottom: "none" }}
    >
      <div
        className="absolute inset-0 pointer-events-none rounded-tl-[16px] rounded-tr-[16px]"
        style={{ boxShadow: "inset 0px 0px 2px 4px #f8e4c6" }}
      />

      {/* CONTROLS header */}
      <div
        className="flex items-center justify-center px-[8px] py-[16px] w-full"
        style={{ background: "rgba(0,0,0,0.3)" }}
      >
        <p
          className="text-center text-white tracking-[1px] whitespace-nowrap"
          style={{ fontFamily: "'PP NeueBit', 'Pixelify Sans', 'Press Start 2P', monospace", fontSize: 40, lineHeight: "normal" }}
        >
          CONTROLS
        </p>
      </div>

      {/* Keys */}
      <div className="flex items-center justify-center gap-[43px] overflow-x-auto px-[48px] pb-[24px] flex-wrap">
        <KeyGroup label="Pause">
          <KeyCap label="P" />
        </KeyGroup>
        <KeyGroup label="Restart">
          <KeyCap label="R" />
        </KeyGroup>
        <KeyGroup label="Send to NAME" wide>
          <div className="content-stretch flex items-center justify-center w-full">
            <KeyCap label="N" />
          </div>
        </KeyGroup>
        <KeyGroup label="Rotate">
          <div className="flex gap-[24px] items-center justify-center">
            <KeyCap label="up" />
            <KeyCap label="Z" />
            <KeyCap label="X" />
          </div>
        </KeyGroup>
        <KeyGroup label="Hard Drop">
          <div className="flex items-center justify-center">
            <KeyCap label="space" wide />
          </div>
        </KeyGroup>
        <KeyGroup label="Drop">
          <div className="flex items-center justify-center">
            <KeyCap label="down" />
          </div>
        </KeyGroup>
        <KeyGroup label="Move">
          <div className="flex gap-[24px] items-center justify-center">
            <KeyCap label="left" />
            <KeyCap label="right" />
          </div>
        </KeyGroup>
      </div>
    </div>
  );
}
