import { Volume2, VolumeX } from "lucide-react";

import {
  getJuicePreferences,
  updateJuicePreferences,
  useJuicePreferences,
} from "./preferences";
import { playSound, primeAudio } from "./audio";

function toggleMuted() {
  const muted = getJuicePreferences().muted;
  primeAudio();
  updateJuicePreferences({ muted: !muted });
  if (muted) {
    playSound("ui");
  }
}

export function SoundButton() {
  const preferences = useJuicePreferences();
  const soundOn = !preferences.muted;

  return (
    <button
      type="button"
      className="sound-toggle"
      aria-pressed={soundOn}
      aria-keyshortcuts="M"
      aria-label={soundOn ? "Sound ON" : "Sound OFF"}
      onClick={toggleMuted}
    >
      {soundOn ? (
        <Volume2 aria-hidden="true" size={14} strokeWidth={2.25} />
      ) : (
        <VolumeX aria-hidden="true" size={14} strokeWidth={2.25} />
      )}
      {soundOn ? "Sound ON" : "Sound OFF"}
    </button>
  );
}

export function PauseSoundSettings() {
  const preferences = useJuicePreferences();

  return (
    <div className="pause-settings">
      <p className="pause-settings-label">AUDIO &amp; MOTION</p>
      <SoundButton />
      <label className="pause-volume" htmlFor="sound-volume">
        Volume
        <input
          id="sound-volume"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={preferences.volume}
          aria-valuetext={`${Math.round(preferences.volume * 100)} percent`}
          onChange={(event) => {
            updateJuicePreferences({ volume: Number(event.target.value) });
          }}
        />
      </label>
      <button
        type="button"
        className="pause-pref-toggle"
        aria-pressed={preferences.reducedMotion}
        onClick={() => {
          primeAudio();
          updateJuicePreferences({ reducedMotion: !preferences.reducedMotion });
          playSound("ui");
        }}
      >
        {preferences.reducedMotion ? "Reduced motion · ON" : "Reduced motion · OFF"}
      </button>
      <button
        type="button"
        className="pause-pref-toggle"
        aria-pressed={preferences.moveSounds}
        onClick={() => {
          primeAudio();
          updateJuicePreferences({ moveSounds: !preferences.moveSounds });
          playSound("ui");
        }}
      >
        {preferences.moveSounds ? "Move sounds · ON" : "Move sounds · OFF"}
      </button>
    </div>
  );
}
