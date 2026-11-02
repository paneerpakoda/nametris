import { useEffect, useState, useSyncExternalStore } from "react";

import { prefersReducedMotion } from "../gameplay/motion";

export const juicePreferenceKey = "nametris.juice";

export interface JuicePreferences {
  readonly muted: boolean;
  readonly volume: number;
  readonly reducedMotion: boolean;
  readonly moveSounds: boolean;
}

export const defaultJuicePreferences: JuicePreferences = {
  muted: false,
  volume: 0.5,
  reducedMotion: false,
  moveSounds: false,
};

const listeners = new Set<() => void>();
let memory: JuicePreferences = defaultJuicePreferences;
let storageDisabled = false;

function browserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function samePreferences(left: JuicePreferences, right: JuicePreferences): boolean {
  return (
    left.muted === right.muted &&
    left.volume === right.volume &&
    left.reducedMotion === right.reducedMotion &&
    left.moveSounds === right.moveSounds
  );
}

export function sanitizeJuicePreferences(
  value: Partial<JuicePreferences> | null,
): JuicePreferences {
  const volume =
    typeof value?.volume === "number" && Number.isFinite(value.volume)
      ? Math.min(1, Math.max(0, value.volume))
      : defaultJuicePreferences.volume;

  return {
    muted: value?.muted === true,
    volume,
    reducedMotion: value?.reducedMotion === true,
    moveSounds: value?.moveSounds === true,
  };
}

function parseStored(raw: string): JuicePreferences {
  const parsed: unknown = JSON.parse(raw);
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ...defaultJuicePreferences };
  }
  return sanitizeJuicePreferences(parsed as Partial<JuicePreferences>);
}

export function readJuicePreferences(
  store: Storage | null = browserStorage(),
): JuicePreferences {
  if (store === null) {
    return { ...defaultJuicePreferences };
  }

  try {
    const raw = store.getItem(juicePreferenceKey);
    return raw === null ? { ...defaultJuicePreferences } : parseStored(raw);
  } catch {
    return { ...defaultJuicePreferences };
  }
}

export function writeJuicePreferences(
  preferences: JuicePreferences,
  store: Storage | null = browserStorage(),
): boolean {
  if (store === null) {
    return false;
  }

  try {
    store.setItem(
      juicePreferenceKey,
      JSON.stringify(sanitizeJuicePreferences(preferences)),
    );
    return true;
  } catch {
    return false;
  }
}

function syncFromStorage(): void {
  if (storageDisabled) {
    return;
  }

  const store = browserStorage();
  if (store === null) {
    storageDisabled = true;
    return;
  }

  try {
    const raw = store.getItem(juicePreferenceKey);
    const next = raw === null ? { ...defaultJuicePreferences } : parseStored(raw);
    if (!samePreferences(memory, next)) {
      memory = next;
    }
  } catch {
    storageDisabled = true;
  }
}

export function getJuicePreferences(): JuicePreferences {
  syncFromStorage();
  return memory;
}

export function resetJuicePreferenceMemory(): void {
  memory = { ...defaultJuicePreferences };
  storageDisabled = false;
  syncFromStorage();
}

export function updateJuicePreferences(patch: Partial<JuicePreferences>): void {
  syncFromStorage();
  memory = sanitizeJuicePreferences({ ...memory, ...patch });
  if (!storageDisabled && !writeJuicePreferences(memory)) {
    storageDisabled = true;
  }
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeJuicePreferences(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useJuicePreferences(): JuicePreferences {
  return useSyncExternalStore(
    subscribeJuicePreferences,
    getJuicePreferences,
    getJuicePreferences,
  );
}

export function useReducedMotion(): boolean {
  const preferences = useJuicePreferences();
  const [mediaReduced, setMediaReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setMediaReduced(query.matches);
    onChange();
    if (typeof query.addEventListener !== "function") {
      return;
    }
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return preferences.reducedMotion || mediaReduced;
}
