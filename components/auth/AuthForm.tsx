"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import {
  signIn,
  signUp,
  signInWithGoogle,
  signInWithApple,
} from "@/lib/firebase/auth";
import { GoogleIcon, AppleIcon, EyeIcon, EyeOffIcon } from "@/lib/icons";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [oauthSubmitting, setOauthSubmitting] = useState<"google" | "apple" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const needsConsent = mode === "signup" && !acceptedTerms;
  const busy = submitting || oauthSubmitting !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (needsConsent) {
      setError("You must agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords don't match.");
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

  async function handleOAuth(provider: "google" | "apple") {
    setError(null);
    if (needsConsent) {
      setError("You must agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
    setOauthSubmitting(provider);
    try {
      if (provider === "google") await signInWithGoogle();
      else await signInWithApple();
      router.replace("/library");
    } catch (err) {
      if (
        err instanceof FirebaseError &&
        (err.code === "auth/popup-closed-by-user" ||
          err.code === "auth/cancelled-popup-request")
      ) {
        // user closed the popup themselves — not an error worth surfacing
      } else {
        const message =
          err instanceof FirebaseError ? friendlyAuthError(err.code) : "Something went wrong.";
        setError(message);
      }
    } finally {
      setOauthSubmitting(null);
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
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          required
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border border-border bg-canvas px-3 py-2 pr-10 text-sm focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted hover:text-accent"
        >
          {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>
      {mode === "signup" && (
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            required
            minLength={6}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded border border-border bg-canvas px-3 py-2 pr-10 text-sm focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted hover:text-accent"
          >
            {showConfirmPassword ? (
              <EyeOffIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
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
        disabled={busy || needsConsent}
        className="mt-1 rounded bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-60"
      >
        {submitting ? "Please wait..." : mode === "login" ? "Sign in" : "Sign up"}
      </button>

      <div className="my-1 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={() => handleOAuth("google")}
        disabled={busy || needsConsent}
        className="flex items-center justify-center gap-2 rounded border border-border bg-white px-3 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 disabled:opacity-60"
      >
        <GoogleIcon className="h-4 w-4" />
        {oauthSubmitting === "google" ? "Please wait..." : "Continue with Google"}
      </button>

      <button
        type="button"
        onClick={() => handleOAuth("apple")}
        disabled={busy || needsConsent}
        className="flex items-center justify-center gap-2 rounded bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-900 disabled:opacity-60"
      >
        <AppleIcon className="h-4 w-4" />
        {oauthSubmitting === "apple" ? "Please wait..." : "Continue with Apple"}
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
    case "auth/operation-not-allowed":
      return "This sign-in method isn't turned on yet — enable it in Firebase console under Authentication > Sign-in method.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup. Allow popups for this site and try again.";
    case "auth/unauthorized-domain":
      return "This domain isn't authorized for sign-in yet in Firebase console.";
    default:
      return "Something went wrong. Try again.";
  }
}
