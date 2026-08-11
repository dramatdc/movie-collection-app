import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthSplash } from "@/components/auth/AuthSplash";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden px-4">
      <div style={{ animation: "fade-in-up 0.6s ease-out both" }}>
        <AuthSplash />
      </div>
      <div style={{ animation: "fade-in-up 0.6s ease-out 0.1s both" }}>
        <AuthForm mode="login" />
      </div>
      <p
        className="text-sm text-muted"
        style={{ animation: "fade-in-up 0.6s ease-out 0.2s both" }}
      >
        No account?{" "}
        <Link href="/signup" className="text-accent">
          Sign up
        </Link>
      </p>
    </div>
  );
}
