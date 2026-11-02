import type { AudioNodeLike, AudioBufferLike, SoundContext } from "./graph";
import type { SoundName } from "./mixer";

export interface RenderRequest {
  readonly name: SoundName;
  readonly when: number;
  readonly pitch: number;
  readonly duration: number;
}

export interface RenderHandle {
  stop: () => void;
}

export function renderSound(
  context: SoundContext,
  destination: AudioNodeLike,
  request: RenderRequest,
  noise: AudioBufferLike | null,
  onEnded: () => void,
): RenderHandle {
  void noise;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(440 * request.pitch, request.when);
  gain.gain.setValueAtTime(0.05, request.when);
  oscillator.connect(gain);
  gain.connect(destination);

  let closed = false;
  const close = () => {
    if (closed) {
      return;
    }
    closed = true;
    try {
      oscillator.disconnect();
      gain.disconnect();
    } catch {
      // A node that already ended can refuse a second disconnect.
    }
    onEnded();
  };

  oscillator.onended = close;
  oscillator.start(request.when);
  oscillator.stop(request.when + request.duration / 1000);
  return { stop: close };
}
