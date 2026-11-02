export const playerNameKey = "nametris.playerName";

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readStoredPlayerName(): string {
  try {
    const value = storage()?.getItem(playerNameKey) ?? "";
    return /^[A-Z]{2,10}$/.test(value) ? value : "";
  } catch {
    return "";
  }
}

export function storePlayerName(name: string): void {
  if (!/^[A-Z]{2,10}$/.test(name)) {
    return;
  }

  try {
    storage()?.setItem(playerNameKey, name);
  } catch {
    // The name stays for this visit if the browser will not store it.
  }
}
