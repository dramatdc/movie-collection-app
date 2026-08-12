let bloop: HTMLAudioElement | null = null;
let unlocked = false;

function getBloop(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!bloop) {
    bloop = new Audio("/sounds/bloop.mp3");
    bloop.preload = "auto";
    bloop.volume = 0.6;
  }
  return bloop;
}

// Mobile browsers block audio playback that isn't a direct result of a user
// gesture — a scan resolving asynchronously (or even a click handler after
// an `await`) doesn't count. Playing (and immediately resetting) the audio
// element on the very first tap anywhere "unlocks" it for programmatic
// play() calls for the rest of the session.
function attemptUnlock() {
  const el = getBloop();
  if (!el) return;
  el.play()
    .then(() => {
      el.pause();
      el.currentTime = 0;
      unlocked = true;
    })
    .catch(() => {
      // still locked — try again on the next tap
      window.addEventListener("pointerdown", attemptUnlock, { once: true });
    });
}

if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", attemptUnlock, { once: true });
}

// Fallback synthesized tone, used only if the audio file itself fails to
// load (e.g. blocked request) — keeps the chime working either way.
function playSynthesizedChime() {
  const Ctor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return;
  const ctx = new Ctor();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(740, now);
  osc.frequency.exponentialRampToValueAtTime(988, now + 0.09);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.25);
}

export function playAddedChime() {
  const el = getBloop();
  if (!el) return;
  el.currentTime = 0;
  el.play().catch(() => {
    if (!unlocked) return; // most likely just still locked; nothing to do
    playSynthesizedChime();
  });
}
