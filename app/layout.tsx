import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SplashProvider } from "@/components/layout/SplashProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hardcopy",
  description: "Personal movie collection tracker and picker",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hardcopy",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e1e1e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col bg-canvas text-white">
        {/* Hints the browser to fetch the splash video immediately rather
            than only once SplashScreen mounts and its <video> tag is
            discovered — one less thing competing for it to catch up on. */}
        <link rel="preload" href="/brand/splash.mp4" as="video" type="video/mp4" />
        <SplashProvider>{children}</SplashProvider>
      </body>
    </html>
  );
}
