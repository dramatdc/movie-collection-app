"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import {
  getShareState,
  enableSharing,
  disableSharing,
  regenerateShareLink,
} from "@/lib/firebase/share";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

export function ShareSection({ user }: { user: User }) {
  const [loading, setLoading] = useState(true);
  const [shareEnabled, setShareEnabled] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerated, setRegenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getShareState(user.uid).then((state) => {
      if (cancelled) return;
      setShareEnabled(state.shareEnabled);
      setShareId(state.shareId);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user.uid]);

  const shareUrl =
    shareId && typeof window !== "undefined" ? `${window.location.origin}/shared/${shareId}` : "";

  async function handleToggle(next: boolean) {
    setBusy(true);
    setRegenerated(false);
    setError(null);
    try {
      if (next) {
        const id = await enableSharing(user.uid, shareId);
        setShareId(id);
        setShareEnabled(true);
      } else {
        await disableSharing(user.uid);
        setShareEnabled(false);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRegenerate() {
    setBusy(true);
    setError(null);
    try {
      const id = await regenerateShareLink(user.uid, shareId);
      setShareId(id);
      setRegenerated(true);
      setTimeout(() => setRegenerated(false), 2500);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-lg shadow-black/40">
      <ToggleSwitch
        label="Share your collection"
        description="Anyone with the link can see what you own — they can't sign in or make changes."
        checked={shareEnabled}
        onChange={handleToggle}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}

      {shareEnabled && shareUrl && (
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
              className="min-w-0 flex-1 truncate rounded border border-border bg-canvas px-3 py-2 text-xs text-muted"
            />
            <button
              type="button"
              onClick={handleCopy}
              disabled={busy}
              className="shrink-0 rounded bg-accent px-3 py-2 text-xs font-medium text-accent-foreground disabled:opacity-60"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={busy}
            className="w-fit text-xs text-muted hover:text-accent disabled:opacity-60"
          >
            {regenerated ? "New link ready — the old one no longer works" : "Generate a new link"}
          </button>
        </div>
      )}
    </div>
  );
}
