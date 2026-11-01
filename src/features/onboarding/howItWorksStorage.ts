export const howItWorksSeenKey = "nametris.howItWorksSeen";

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function hasSeenHowItWorks(): boolean {
  try {
    return storage()?.getItem(howItWorksSeenKey) === "1";
  } catch {
    return false;
  }
}

export function markHowItWorksSeen(): void {
  try {
    storage()?.setItem(howItWorksSeenKey, "1");
  } catch {
    // The card can show again if this browser will not store the flag.
  }
}
