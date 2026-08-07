import Link from "next/link";
import Image from "next/image";
import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
      <Image
        src="/brand/lockup.png"
        alt="Hardcopy"
        width={592}
        height={379}
        priority
        className="h-28 w-auto"
      />
      <AuthForm mode="signup" />
      <p className="text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent">
          Sign in
        </Link>
      </p>
    </div>
  );
}
