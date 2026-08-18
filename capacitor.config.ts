import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hardcopyapp.hardcopy",
  appName: "Hardcopy",
  webDir: "public",
  server: {
    url: "https://movie-collection-app-five.vercel.app",
    androidScheme: "https",
    iosScheme: "https",
  },
  ios: {
    // "always" made WKWebView apply its own automatic safe-area inset on
    // top of the app's CSS already handling safe areas manually via
    // env(safe-area-inset-*) everywhere (header padding, nav padding, the
    // tutorial card's clamp) — double-reserving the space at the bottom
    // edge and exposing a strip of the WebView's own native background
    // (behind the inset web content) that no amount of CSS could ever
    // match, since it isn't part of the page at all. "never" renders truly
    // edge-to-edge and leaves safe-area handling entirely to the CSS that
    // was already written for it.
    contentInset: "never",
    backgroundColor: "#1e1e1e",
  },
  android: {
    backgroundColor: "#1e1e1e",
  },
};

export default config;
