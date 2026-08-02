import type { ReactNode } from "react";

import "../styles/cabinet.css";

interface CabinetShellProps {
  readonly children: ReactNode;
  readonly controlDeck: ReactNode;
  readonly screenLabel: string;
  readonly screenClassName?: string;
}

export function CabinetShell({
  children,
  controlDeck,
  screenLabel,
  screenClassName = "",
}: CabinetShellProps) {
  return (
    <div className="cabinet-stage">
      <section className="cabinet-machine" aria-label="Nametris arcade cabinet">
        <div className="cabinet-display-section">
          <span className="cabinet-speaker cabinet-speaker-left" aria-hidden="true" />
          <div className="cabinet-bezel">
            <div
              className={`cabinet-screen ${screenClassName}`.trim()}
              role="region"
              aria-label={screenLabel}
            >
              <div className="cabinet-screen-content">{children}</div>
              <span className="crt-rgb" aria-hidden="true" />
              <span className="crt-scanlines" aria-hidden="true" />
              <span className="crt-vignette" aria-hidden="true" />
            </div>
          </div>
          <span className="cabinet-speaker cabinet-speaker-right" aria-hidden="true" />
        </div>

        <footer className="cabinet-console">
          <div className="cabinet-power" aria-label="Power on">
            <span>POWER</span>
            <i aria-hidden="true" />
          </div>
          <div className="cabinet-control-slot">{controlDeck}</div>
        </footer>
      </section>
    </div>
  );
}
