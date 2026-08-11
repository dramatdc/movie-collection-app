import Image from "next/image";

export function AuthSplash() {
  return (
    <div className="relative flex items-center justify-center py-2">
      <div
        aria-hidden
        className="absolute h-56 w-56 rounded-full bg-accent blur-3xl"
        style={{ animation: "glow-pulse 4s ease-in-out infinite" }}
      />
      <Image
        src="/brand/lockup.png"
        alt="Hardcopy"
        width={2699}
        height={1217}
        priority
        className="relative h-32 w-auto"
        style={{ animation: "float 5s ease-in-out infinite" }}
      />
    </div>
  );
}
