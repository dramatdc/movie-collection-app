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
    contentInset: "always",
    backgroundColor: "#1e1e1e",
  },
  android: {
    backgroundColor: "#1e1e1e",
  },
};

export default config;
