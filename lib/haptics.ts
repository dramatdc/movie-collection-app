import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { isHapticsEnabled } from "@/lib/preferences";

// Haptics.impact() uses the native Taptic/vibration engine when wrapped as
// a native app, falls back to the Vibration API on Android web, and is a
// silent no-op on iOS Safari (which has no web vibration API at all) —
// the try/catch is just a safety net for any other unsupported browser.
export async function hapticImpact(style: ImpactStyle = ImpactStyle.Light) {
  if (!isHapticsEnabled()) return;
  try {
    await Haptics.impact({ style });
  } catch {
    // haptics unsupported here — nothing to do
  }
}
