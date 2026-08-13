import Image from "next/image";

export function SplashScreen({ fadingOut = false }: { fadingOut?: boolean }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-canvas transition-opacity duration-300 ease-out"
      style={{ opacity: fadingOut ? 0 : 1 }}
    >
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden
          className="absolute h-64 w-64 rounded-full bg-accent blur-3xl"
          style={{ animation: "glow-pulse 2.4s ease-in-out infinite" }}
        />
        <Image
          src="/brand/lockup.png"
          alt="Hardcopy"
          width={2699}
          height={1217}
          priority
          className="relative h-24 w-auto sm:h-28"
          style={{ animation: "splash-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}
        />
      </div>
    </div>
  );
}
