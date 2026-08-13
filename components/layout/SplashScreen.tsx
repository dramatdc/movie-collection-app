export function SplashScreen({ fadingOut = false }: { fadingOut?: boolean }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-canvas transition-opacity duration-300 ease-out"
      style={{ opacity: fadingOut ? 0 : 1 }}
    >
      <video
        src="/brand/splash.mp4"
        autoPlay
        muted
        playsInline
        className="h-full w-full max-w-md object-contain"
      />
    </div>
  );
}
