import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
      <AuthForm mode="signup" />
      <p className="text-sm text-neutral-400">
        Already have an account?{" "}
        <Link href="/login" className="text-emerald-400">
          Sign in
        </Link>
      </p>
    </div>
  );
}
