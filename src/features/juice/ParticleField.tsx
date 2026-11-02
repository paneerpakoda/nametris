import { useSyncExternalStore, type CSSProperties } from "react";

import { particleRevision, readParticles, subscribeParticles } from "./particles";

export function ParticleField() {
  const revision = useSyncExternalStore(subscribeParticles, particleRevision);
  const specks = readParticles();
  let active = false;
  for (const speck of specks) {
    if (speck.active) {
      active = true;
      break;
    }
  }
  if (!active) {
    return null;
  }

  return (
    <span className="speck-layer" data-testid="speck-layer" aria-hidden="true">
      {specks.map((speck, index) =>
        speck.active ? (
          <span
            key={`${revision}-${index}`}
            className={
              speck.kind === "confetti" ? "speck is-confetti" : "speck is-dust"
            }
            style={
              {
                left: `${speck.x}%`,
                top: `${speck.y}%`,
                background: speck.color,
                "--drift-x": `${speck.driftX}px`,
                "--drift-y": `${speck.driftY}px`,
              } as CSSProperties
            }
          />
        ) : null,
      )}
    </span>
  );
}
