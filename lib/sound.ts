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
    ctx.resume().catch(() => {
      window.addEventListener("pointerdown", primeOnFirstTap, { once: true });
    });
  }
}
if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", primeOnFirstTap, { once: true });
}

interface ChimePreset {
  startFreq: number;
  endFreq: number;
  rampTime: number;
  peakGain: number;
  attackTime: number;
  decayTime: number;
  stopTime: number;
}

// Rising, bright tone for additions; falling, slightly softer tone for
// removals — distinct enough to tell apart without looking at the screen.
const ADD_PRESET: ChimePreset = {
  startFreq: 740,
  endFreq: 988,
  rampTime: 0.09,
  peakGain: 0.18,
  attackTime: 0.015,
  decayTime: 0.22,
  stopTime: 0.25,
};

const REMOVE_PRESET: ChimePreset = {
  startFreq: 640,
  endFreq: 420,
  rampTime: 0.1,
  peakGain: 0.16,
  attackTime: 0.015,
  decayTime: 0.2,
  stopTime: 0.22,
};

function playTone(preset: ChimePreset) {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Scheduling on a still-suspended context is unreliable across browsers —
  // wait for resume() to actually resolve before building/starting the
  // oscillator, so the sound doesn't silently drop.
  const start = () => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(preset.startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(preset.endFreq, now + preset.rampTime);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(preset.peakGain, now + preset.attackTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + preset.decayTime);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + preset.stopTime);
  };

  if (ctx.state === "suspended") {
    ctx.resume().then(start).catch(() => {});
  } else {
    start();
  }
}

export function playAddedChime() {
  playTone(ADD_PRESET);
}

export function playRemovedChime() {
  playTone(REMOVE_PRESET);
}
