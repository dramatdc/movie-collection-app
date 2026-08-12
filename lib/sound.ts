let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  return audioCtx;
}

// Browsers only let audio start from a trusted user gesture — resuming the
// context on the very first tap anywhere means it's already running by the
// time an async moment (a barcode scan resolving, with no fresh gesture of
// its own) wants to play a sound.
function primeOnFirstTap() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}
if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", primeOnFirstTap, { once: true });
}

// A soft, synthesized two-tone "bloop" — no audio asset needed, and it
// keeps things quiet/non-intrusive by design (short, low gain).
export function playAddedChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

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
