import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthSplash } from "@/components/auth/AuthSplash";

export default function SignupPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden px-4">
      <div style={{ animation: "fade-in-up 0.6s ease-out both" }}>
        <AuthSplash />
      </div>
      <div style={{ animation: "fade-in-up 0.6s ease-out 0.1s both" }}>
        <AuthForm mode="signup" />
      </div>
      <p
        className="text-sm text-muted"
        style={{ animation: "fade-in-up 0.6s ease-out 0.2s both" }}
      >
        Already have an account?{" "}
        <Link href="/login" className="text-accent">
          Sign in
        </Link>
      </p>
    </div>
  );
}
