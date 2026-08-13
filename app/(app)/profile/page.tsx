"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/lib/hooks/useAuth";
import { useMovies } from "@/lib/hooks/useMovies";
import { signOut } from "@/lib/firebase/auth";
import { deleteAccount } from "@/lib/firebase/account";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import {
  isSoundEnabled,
  setSoundEnabled,
  isHapticsEnabled,
  setHapticsEnabled,
} from "@/lib/preferences";
import { useConfirm } from "@/components/ui/ConfirmDialog";

export default function ProfilePage() {
  const { user } = useAuth();
  const { movies } = useMovies();
  const router = useRouter();
  const confirmDialog = useConfirm();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [hapticsOn, setHapticsOn] = useState(true);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
    setHapticsOn(isHapticsEnabled());
  }, []);

  async function handleDeleteAccount() {
    if (!user) return;
    const confirmed = await confirmDialog({
      title: "Delete your account?",
      message:
        "This permanently removes your collection, wishlist, and lists. This can't be undone.",
      confirmLabel: "Delete account",
      tone: "danger",
    });
    if (!confirmed) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount(user.uid);
      router.replace("/login");
    } catch (err) {
      if (err instanceof FirebaseError && err.code === "auth/requires-recent-login") {
        setDeleteError(
          "For security, deleting your account requires a recent sign-in. Sign out, sign back in, then try again."
        );
      } else {
        setDeleteError("Something went wrong deleting your account. Try again.");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Profile</h1>
        <p className="text-sm text-muted">{user?.email}</p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4 text-sm shadow-lg shadow-black/40">
        <p className="text-neutral-300">{movies.length} movies in your collection</p>
      </div>

      <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface px-4 shadow-lg shadow-black/40">
        <ToggleSwitch
          label="Sound effects"
          description="The chime when a movie is added or removed"
          checked={soundOn}
          onChange={(value) => {
            setSoundOn(value);
            setSoundEnabled(value);
          }}
        />
        <ToggleSwitch
          label="Haptic feedback"
          description="Vibration when scanning or using the randomizer"
          checked={hapticsOn}
          onChange={(value) => {
            setHapticsOn(value);
            setHapticsEnabled(value);
          }}
        />
      </div>

      <button
        type="button"
        onClick={async () => {
          await signOut();
          router.replace("/login");
        }}
        className="w-fit rounded border border-border px-3 py-1.5 text-sm text-neutral-300 hover:bg-surface"
      >
        Sign out
      </button>

      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <div className="flex gap-4 text-sm">
          <Link href="/terms" className="text-accent">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-accent">
            Privacy Policy
          </Link>
        </div>

        {deleteError && <p className="text-sm text-red-400">{deleteError}</p>}

        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="w-fit rounded border border-red-800 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950 disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Delete my account"}
        </button>
      </div>

      <p className="text-xs leading-relaxed text-muted">
        This app uses TMDB and the TMDB APIs but is not endorsed, certified,
        or otherwise approved by TMDB.
      </p>
    </div>
  );
}
