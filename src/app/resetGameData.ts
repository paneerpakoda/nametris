import { restoreDefaultJuicePreferences } from "../features/juice/preferences";
import { clearStoredNameTrimNotice } from "../features/onboarding/playerNameStorage";

const storagePrefix = "nametris.";

export function resetAllGameData(): void {
  try {
    const keys: string[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(storagePrefix)) {
        keys.push(key);
      }
    }
    for (const key of keys) {
      localStorage.removeItem(key);
    }
  } catch {
    // A blocked store still leaves the in-memory game on the welcome screen.
  }

  clearStoredNameTrimNotice();
  restoreDefaultJuicePreferences();
}
