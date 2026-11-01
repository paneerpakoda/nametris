import { useEffect, useRef } from "react";

import type { BoardPhase } from "../game/engine/session";

interface TouchPadProps {
  readonly phase: BoardPhase;
  readonly onInput: (key: string) => void;
}

interface TouchKey {
  readonly key: string;
  readonly label: string;
  readonly text: string;
  readonly className: string;
}

const repeatDelayMilliseconds = 500;
const repeatIntervalMilliseconds = 33;
const repeatingKeys = new Set(["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"]);

function moveKeys(placing: boolean): readonly TouchKey[] {
  const keys: TouchKey[] = [
    {
      key: "ArrowLeft",
      label: "Touch move left",
      text: "Left",
      className: "touch-key",
    },
    {
      key: "ArrowDown",
      label: "Touch move down",
      text: "Down",
      className: "touch-key",
    },
    {
      key: "ArrowRight",
      label: "Touch move right",
      text: "Right",
      className: "touch-key",
    },
  ];

  if (placing) {
    keys.push({
      key: "ArrowUp",
      label: "Touch move up",
      text: "Up",
      className: "touch-key",
    });
  }

  return keys;
}

function actionKeys(placing: boolean): readonly TouchKey[] {
  if (placing) {
    return [
      {
        key: "Enter",
        label: "Touch lock",
        text: "Lock",
        className: "touch-key is-lock",
      },
      {
        key: "Escape",
        label: "Touch cancel",
        text: "Cancel",
        className: "touch-key is-cancel",
      },
      {
        key: "x",
        label: "Touch rotate clockwise",
        text: "Rotate",
        className: "touch-key is-rotate",
      },
      {
        key: "z",
        label: "Touch rotate counter-clockwise",
        text: "Rotate back",
        className: "touch-key is-rotate",
      },
    ];
  }

  return [
    {
      key: " ",
      label: "Touch hard drop",
      text: "Hard drop",
      className: "touch-key is-hard-drop",
    },
    {
      key: "x",
      label: "Touch rotate clockwise",
      text: "Rotate",
      className: "touch-key is-rotate",
    },
    {
      key: "z",
      label: "Touch rotate counter-clockwise",
      text: "Rotate back",
      className: "touch-key is-rotate",
    },
  ];
}

export function TouchPad({ phase, onInput }: TouchPadProps) {
  const timers = useRef(new Map<string, { delay: number; interval: number }>());
  const placing = phase === "placing-stencil";

  function clearKey(key: string) {
    const timer = timers.current.get(key);
    if (timer === undefined) {
      return;
    }
    window.clearTimeout(timer.delay);
    window.clearInterval(timer.interval);
    timers.current.delete(key);
  }

  useEffect(() => {
    const active = timers.current;
    return () => {
      for (const timer of active.values()) {
        window.clearTimeout(timer.delay);
        window.clearInterval(timer.interval);
      }
      active.clear();
    };
  }, []);

  function startHold(key: string, event: React.PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Some test environments do not implement pointer capture.
    }
    onInput(key);
    if (!repeatingKeys.has(key)) {
      return;
    }

    const delay = window.setTimeout(() => {
      const interval = window.setInterval(
        () => onInput(key),
        repeatIntervalMilliseconds,
      );
      const current = timers.current.get(key);
      if (current === undefined) {
        window.clearInterval(interval);
        return;
      }
      timers.current.set(key, { delay: current.delay, interval });
    }, repeatDelayMilliseconds);
    timers.current.set(key, { delay, interval: 0 });
  }

  return (
    <div className="touch-pad" aria-label="Touch controls">
      <div className="touch-pad-move">
        {moveKeys(placing).map((touchKey) => (
          <button
            key={touchKey.key}
            type="button"
            className={touchKey.className}
            aria-label={touchKey.label}
            onPointerDown={(event) => startHold(touchKey.key, event)}
            onPointerUp={() => clearKey(touchKey.key)}
            onPointerCancel={() => clearKey(touchKey.key)}
            onContextMenu={(event) => event.preventDefault()}
          >
            {touchKey.text}
          </button>
        ))}
      </div>
      <div className="touch-pad-actions">
        {actionKeys(placing).map((touchKey) => (
          <button
            key={touchKey.label}
            type="button"
            className={touchKey.className}
            aria-label={touchKey.label}
            onPointerDown={(event) => startHold(touchKey.key, event)}
            onPointerUp={() => clearKey(touchKey.key)}
            onPointerCancel={() => clearKey(touchKey.key)}
            onContextMenu={(event) => event.preventDefault()}
          >
            {touchKey.text}
          </button>
        ))}
      </div>
    </div>
  );
}
