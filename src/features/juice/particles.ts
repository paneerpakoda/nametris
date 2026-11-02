const poolSize = 60;

export interface Speck {
  active: boolean;
  kind: "dust" | "confetti";
  x: number;
  y: number;
  driftX: number;
  driftY: number;
  color: string;
}

const pieceColors = [
  "#36cdd7",
  "#f0c92e",
  "#a65bd5",
  "#46bf68",
  "#e85555",
  "#377bd7",
  "#ed762d",
];

const dustColors = ["#c9842a", "#fff4df", "#8d8474"];

const particles: Speck[] = Array.from({ length: poolSize }, () => ({
  active: false,
  kind: "dust" as const,
  x: 0,
  y: 0,
  driftX: 0,
  driftY: 0,
  color: dustColors[0] ?? "#c9842a",
}));

const dustSlots = Array.from({ length: 8 }, () => ({ x: 0, y: 0 }));

let revision = 0;
let cursor = 0;
let dustWave = 0;
let confettiWave = 0;
const listeners = new Set<() => void>();

function publish(): void {
  revision += 1;
  for (const listener of listeners) {
    listener();
  }
}

function take(): Speck {
  const speck = particles[cursor];
  cursor = (cursor + 1) % particles.length;
  if (speck !== undefined) {
    return speck;
  }
  const fallback = particles[0];
  if (fallback === undefined) {
    throw new Error("The speck pool is empty.");
  }
  return fallback;
}

export function particleRevision(): number {
  return revision;
}

export function subscribeParticles(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function readParticles(): readonly Speck[] {
  return particles;
}

export function resetParticles(): void {
  for (const speck of particles) {
    speck.active = false;
  }
  dustWave += 1;
  confettiWave += 1;
  cursor = 0;
  publish();
}

export function emitDust(keys: Iterable<string>, columns: number, rows: number): void {
  let count = 0;
  for (const key of keys) {
    if (count >= dustSlots.length) {
      break;
    }
    const split = key.indexOf(":");
    const row = Number(key.slice(0, split));
    const column = Number(key.slice(split + 1));
    const slot = dustSlots[count];
    if (slot === undefined || columns <= 0 || rows <= 0) {
      continue;
    }
    slot.x = Math.min(100, Math.max(0, ((column + 0.5) / columns) * 100));
    slot.y = Math.min(100, Math.max(0, ((row + 0.5) / rows) * 100));
    count += 1;
  }
  if (count === 0) {
    return;
  }

  const wave = (dustWave += 1);
  for (let index = 0; index < count; index += 1) {
    const slot = dustSlots[index];
    if (slot === undefined) {
      continue;
    }
    const speck = take();
    speck.active = true;
    speck.kind = "dust";
    speck.x = slot.x;
    speck.y = slot.y;
    speck.driftX = (index % 2 === 0 ? 1 : -1) * (8 + index * 3);
    speck.driftY = 10 + (index % 3) * 5;
    speck.color = dustColors[index % dustColors.length] ?? "#c9842a";
  }
  publish();
  window.setTimeout(() => {
    if (wave !== dustWave) {
      return;
    }
    for (const speck of particles) {
      if (speck.kind === "dust") {
        speck.active = false;
      }
    }
    publish();
  }, 250);
}

export function emitConfetti(): void {
  const wave = (confettiWave += 1);
  for (let index = 0; index < particles.length; index += 1) {
    const speck = particles[index];
    if (speck === undefined) {
      continue;
    }
    speck.active = true;
    speck.kind = "confetti";
    speck.x = (index * 17) % 100;
    speck.y = -8;
    speck.driftX = ((index % 7) - 3) * 14;
    speck.driftY = 72 + (index % 5) * 12;
    speck.color = pieceColors[index % pieceColors.length] ?? "#f0c92e";
  }
  publish();
  window.setTimeout(() => {
    if (wave !== confettiWave) {
      return;
    }
    for (const speck of particles) {
      if (speck.kind === "confetti") {
        speck.active = false;
      }
    }
    publish();
  }, 1_500);
}
