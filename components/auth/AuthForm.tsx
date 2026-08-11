"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { signIn, signUp } from "@/lib/firebase/auth";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === "signup" && !acceptedTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.replace("/library");
    } catch (err) {
      const message =
        err instanceof FirebaseError ? friendlyAuthError(err.code) : "Something went wrong.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-3 rounded-lg border border-border bg-surface p-6 shadow-xl shadow-black/40"
    >
      <h1 className="text-lg font-semibold">
        {mode === "login" ? "Sign in" : "Create your account"}
      </h1>
      <input
        type="email"
        required
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded border border-border bg-canvas px-3 py-2 text-sm focus:border-accent focus:outline-none"
      />
      <input
        type="password"
        required
        minLength={6}
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded border border-border bg-canvas px-3 py-2 text-sm focus:border-accent focus:outline-none"
      />
      {mode === "signup" && (
        <label className="flex items-start gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-accent"
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" target="_blank" className="text-accent">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" target="_blank" className="text-accent">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={submitting || (mode === "signup" && !acceptedTerms)}
        className="mt-1 rounded bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-60"
      >
        {submitting ? "Please wait..." : mode === "login" ? "Sign in" : "Sign up"}
      </button>
    </form>
  );
}

function friendlyAuthError(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "An account with that email already exists.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/configuration-not-found":
      return "Email/Password sign-in isn't enabled for this Firebase project yet — enable it in Firebase console under Authentication > Sign-in method.";
    default:
      return "Something went wrong. Try again.";
  }
}
