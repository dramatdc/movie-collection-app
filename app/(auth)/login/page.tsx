import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
      <AuthForm mode="login" />
      <p className="text-sm text-neutral-400">
        No account?{" "}
        <Link href="/signup" className="text-emerald-400">
          Sign up
        </Link>
      </p>
    </div>
  );
}
