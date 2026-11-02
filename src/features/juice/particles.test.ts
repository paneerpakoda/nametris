import { afterEach, describe, expect, it } from "vitest";

import { emitConfetti, emitDust, readParticles, resetParticles } from "./particles";

afterEach(() => {
  resetParticles();
});

describe("particle pool", () => {
  it("keeps at most sixty specks and reuses them", () => {
    emitConfetti();
    expect(readParticles()).toHaveLength(60);
    expect(readParticles().filter((speck) => speck.active)).toHaveLength(60);

    emitConfetti();
    expect(readParticles()).toHaveLength(60);

    emitDust(["0:0", "1:1", "2:2"], 10, 7);
    expect(readParticles()).toHaveLength(60);
    expect(
      readParticles().filter((speck) => speck.active && speck.kind === "dust"),
    ).toHaveLength(3);
  });
});
