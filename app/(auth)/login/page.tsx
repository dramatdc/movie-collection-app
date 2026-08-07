import Link from "next/link";
import Image from "next/image";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
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
      <AuthForm mode="login" />
      <p className="text-sm text-muted">
        No account?{" "}
        <Link href="/signup" className="text-accent">
          Sign up
        </Link>
      </p>
    </div>
  );
}
