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

  return (
    <button
      type="button"
      className="sound-toggle"
      aria-pressed={!preferences.muted}
      aria-keyshortcuts="M"
      aria-label={preferences.muted ? "Unmute sound" : "Mute sound"}
      onClick={toggleMuted}
    >
      {preferences.muted ? "MUTED" : "SOUND"}
    </button>
  );
}

export function PauseSoundSettings() {
  const preferences = useJuicePreferences();

  return (
    <div className="pause-settings">
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
        aria-pressed={preferences.reducedMotion}
        onClick={() => {
          primeAudio();
          updateJuicePreferences({ reducedMotion: !preferences.reducedMotion });
          playSound("ui");
        }}
      >
        Reduced motion
      </button>
      <button
        type="button"
        aria-pressed={preferences.moveSounds}
        onClick={() => {
          primeAudio();
          updateJuicePreferences({ moveSounds: !preferences.moveSounds });
          playSound("ui");
        }}
      >
        Move sounds
      </button>
    </div>
  );
}
