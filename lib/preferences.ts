const SOUND_KEY = "pref-sound-enabled";
const HAPTICS_KEY = "pref-haptics-enabled";
const VIEW_MODE_KEY = "pref-collection-view";

function readBool(key: string): boolean {
  if (typeof window === "undefined") return true;
  const raw = localStorage.getItem(key);
  return raw === null ? true : raw === "true";
}

function writeBool(key: string, value: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, String(value));
  window.dispatchEvent(new Event(key));
}

export function isSoundEnabled(): boolean {
  return readBool(SOUND_KEY);
}

export function setSoundEnabled(value: boolean) {
  writeBool(SOUND_KEY, value);
}

export function isHapticsEnabled(): boolean {
  return readBool(HAPTICS_KEY);
}

export function setHapticsEnabled(value: boolean) {
  writeBool(HAPTICS_KEY, value);
}

export type CollectionViewMode = "card" | "list";

export function getCollectionViewMode(): CollectionViewMode {
  if (typeof window === "undefined") return "card";
  return localStorage.getItem(VIEW_MODE_KEY) === "list" ? "list" : "card";
}

export function setCollectionViewMode(value: CollectionViewMode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(VIEW_MODE_KEY, value);
  window.dispatchEvent(new Event(VIEW_MODE_KEY));
}

export { SOUND_KEY, HAPTICS_KEY, VIEW_MODE_KEY };
