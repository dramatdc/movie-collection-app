const SOUND_KEY = "pref-sound-enabled";
const HAPTICS_KEY = "pref-haptics-enabled";

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

export { SOUND_KEY, HAPTICS_KEY };
