import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useRef, type CSSProperties, type PointerEvent } from "react";

import { NametrisMark } from "../../components/NametrisMark";
import type { RunResult } from "../../game/engine/result";
import { formatActiveTime } from "./exportCard";
import { ResultStencil } from "./ResultStencil";

interface RewardCardProps {
  readonly result: RunResult;
  readonly reducedMotion?: boolean;
}

export function RewardCard({ result, reducedMotion }: RewardCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = reducedMotion ?? prefersReducedMotion ?? false;
  const cardRef = useRef<HTMLElement>(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 230, damping: 24 });
  const rotateY = useSpring(tiltY, { stiffness: 230, damping: 24 });
  const badge =
    result.displayPercent === 100
      ? "PERFECT · 100%"
      : `NAME COMPLETE · ${result.displayPercent}%`;
  const cardStyle = {
    rotateX,
    rotateY,
    transformPerspective: 900,
    "--shine-x": "50%",
    "--shine-y": "50%",
  } as CSSProperties;

  function resetCard() {
    tiltX.set(0);
    tiltY.set(0);
    cardRef.current?.style.setProperty("--shine-x", "50%");
    cardRef.current?.style.setProperty("--shine-y", "50%");
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (shouldReduceMotion || document.activeElement === cardRef.current) {
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0) {
      return;
    }
    const horizontal = (event.clientX - bounds.left) / bounds.width;
    const vertical = (event.clientY - bounds.top) / bounds.height;
    tiltX.set((0.5 - vertical) * 7);
    tiltY.set((horizontal - 0.5) * 7);
    event.currentTarget.style.setProperty("--shine-x", `${horizontal * 100}%`);
    event.currentTarget.style.setProperty("--shine-y", `${vertical * 100}%`);
  }

  return (
    <motion.article
      ref={cardRef}
      className="reward-card"
      role="article"
      aria-label="Nametris reward card"
      tabIndex={0}
      data-motion={shouldReduceMotion ? "static" : "interactive"}
      style={cardStyle}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetCard}
      onFocus={resetCard}
    >
      <div className="reward-shine" aria-hidden="true" />
      <div className="reward-brand-lockup">
        <NametrisMark compact />
        <p className="reward-brand">NAMETRIS</p>
      </div>
      <h2>{result.name}</h2>
      <ResultStencil
        name={result.name}
        displayPercent={result.displayPercent}
        stencil={result.stencil}
      />
      <p className="reward-title">{result.title}</p>
      <p className="reward-badge">{badge}</p>
      <dl className="reward-metrics">
        <div>
          <dt>Score</dt>
          <dd>{result.score.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Active time</dt>
          <dd>{formatActiveTime(result.activeMilliseconds)}</dd>
        </div>
      </dl>
    </motion.article>
  );
}
