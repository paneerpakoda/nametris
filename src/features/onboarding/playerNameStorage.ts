import { nameLengthLimit, playerNamePattern } from "./nameValidation";

export const playerNameKey = "nametris.playerName";
const nameTrimNoticeKey = "nametris.nameTrimNotice";

export interface StoredPlayerName {
  readonly name: string;
  readonly trimmed: boolean;
}

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function trimNoticePending(): boolean {
  try {
    return window.sessionStorage.getItem(nameTrimNoticeKey) === "1";
  } catch {
    return false;
  }
}

function markTrimNotice(): void {
  try {
    window.sessionStorage.setItem(nameTrimNoticeKey, "1");
  } catch {
    // The trimmed name is still saved if the notice cannot be stored.
  }
}

export function clearStoredNameTrimNotice(): void {
  try {
    window.sessionStorage.removeItem(nameTrimNoticeKey);
  } catch {
    // The notice can stay until the tab closes.
  }
}

export function readStoredPlayerName(): StoredPlayerName {
  try {
    const value = storage()?.getItem(playerNameKey) ?? "";
    if (playerNamePattern.test(value)) {
      return { name: value, trimmed: trimNoticePending() };
    }

    if (/^[A-Z]+$/.test(value) && value.length > nameLengthLimit) {
      const name = value.slice(0, nameLengthLimit);
      storage()?.setItem(playerNameKey, name);
      markTrimNotice();
      return { name, trimmed: true };
    }

    return { name: "", trimmed: false };
  } catch {
    return { name: "", trimmed: false };
  }
}

export function storePlayerName(name: string): void {
  if (!playerNamePattern.test(name)) {
    return;
  }

  try {
    storage()?.setItem(playerNameKey, name);
  } catch {
    // The name stays for this visit if the browser will not store it.
  }
}
