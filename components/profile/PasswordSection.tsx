"use client";

import { useState } from "react";
import { FirebaseError } from "firebase/app";
import type { User } from "firebase/auth";
import { changePassword, sendPasswordReset } from "@/lib/firebase/auth";

function friendlyPasswordError(code: string): string {
  switch (code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Current password is incorrect.";
    case "auth/weak-password":
      return "New password should be at least 6 characters.";
    case "auth/requires-recent-login":
      return "For security, this requires a recent sign-in. Sign out, sign back in, then try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again in a bit.";
    default:
      return "Something went wrong. Try again.";
  }
}

export function PasswordSection({ user }: { user: User }) {
  // Google/Apple accounts have no password on file to change.
  const isPasswordAccount = user.providerData.some((p) => p.providerId === "password");

  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!isPasswordAccount) return null;

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }
    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof FirebaseError ? friendlyPasswordError(err.code) : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSendReset() {
    if (!user.email) return;
    setResetSending(true);
    setError(null);
    try {
      await sendPasswordReset(user.email);
      setResetSent(true);
    } catch {
      setError("Couldn't send the reset email. Try again.");
    } finally {
      setResetSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-lg shadow-black/40">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-200">Password</p>
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            setError(null);
          }}
          className="text-sm text-accent hover:underline"
        >
          {open ? "Cancel" : "Change password"}
        </button>
      </div>

      {success && <p className="text-sm text-green-400">Password updated.</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {open && (
        <form onSubmit={handleChangePassword} className="flex flex-col gap-2">
          <input
            type="password"
            required
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="rounded border border-border bg-canvas px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="rounded border border-border bg-canvas px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded border border-border bg-canvas px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={saving}
            className="mt-1 rounded bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save new password"}
          </button>
        </form>
      )}

      <div className="border-t border-border pt-3">
        {resetSent ? (
          <p className="text-sm text-muted">Check {user.email} for a link to reset your password.</p>
        ) : (
          <button
            type="button"
            onClick={handleSendReset}
            disabled={resetSending}
            className="text-sm text-muted hover:text-accent disabled:opacity-60"
          >
            {resetSending ? "Sending..." : "Forgot your password? Email me a reset link"}
          </button>
        )}
      </div>
    </div>
  );
}
