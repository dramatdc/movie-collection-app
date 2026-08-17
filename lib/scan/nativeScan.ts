import { Capacitor } from "@capacitor/core";

// Only ever meaningfully called from a Capacitor-native build — the
// isNativePlatform() check returns false in any ordinary browser (including
// the deployed web app and installed PWA), so this returns immediately
// there and the dynamic import below never executes, keeping the ML Kit
// plugin's JS out of the web bundle entirely.
//
// Uses the plugin's one-shot scan() (not the older continuous-scan API),
// which opens its own native full-screen scanner UI and resolves directly
// with a result — no transparent-webview/CSS coordination needed, unlike
// the continuous-scan approach.
export async function scanBarcodeNative(): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) return null;

  const { BarcodeScanner, BarcodeFormat } = await import("@capacitor-mlkit/barcode-scanning");

  const { camera } = await BarcodeScanner.checkPermissions();
  if (camera !== "granted" && camera !== "limited") {
    const { camera: requested } = await BarcodeScanner.requestPermissions();
    if (requested !== "granted" && requested !== "limited") return null;
  }

  const { barcodes } = await BarcodeScanner.scan({
    formats: [BarcodeFormat.UpcA, BarcodeFormat.UpcE, BarcodeFormat.Ean13, BarcodeFormat.Ean8],
  });

  return barcodes[0]?.rawValue ?? null;
}
