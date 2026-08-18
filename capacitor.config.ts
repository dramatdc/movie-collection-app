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
    // This paints the *native* WKWebView/window background — a completely
    // separate layer from any CSS in the app, used by iOS to fill in behind
    // the web content whenever there's a native-level gap (safe-area
    // insetting, a brief moment before content paints, etc). It was set to
    // --color-canvas (#1e1e1e), not --color-bar (#171717) — a real, visible
    // mismatch in exactly the situation being reported (a strip near the
    // bottom nav not matching its color), and one no web-side CSS change
    // could ever fix since it isn't part of the page. Matching it to the
    // nav's own color directly is the actual fix.
    backgroundColor: "#171717",
  },
  android: {
    backgroundColor: "#171717",
  },
};

export default config;
