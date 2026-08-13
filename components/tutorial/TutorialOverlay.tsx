"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTutorial } from "@/lib/tutorial/TutorialContext";

const SPOTLIGHT_PADDING = 8;
const CARD_MAX_WIDTH = 380;
const CARD_MARGIN = 16;
const ESTIMATED_CARD_HEIGHT = 190;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

// Some targets (e.g. the nav bar) render two responsive variants at once,
// only one of which is actually visible at a given viewport width — find
// the one with real dimensions rather than grabbing whichever is first.
function findVisibleTarget(selector: string): HTMLElement | null {
  const candidates = document.querySelectorAll<HTMLElement>(`[data-tutorial="${selector}"]`);
  for (const el of candidates) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

export function TutorialOverlay() {
  const { active, step, stepIndex, totalSteps, next, back, skip } = useTutorial();
  const pathname = usePathname();
  const router = useRouter();
  const [rect, setRect] = useState<Rect | null>(null);
  const [ready, setReady] = useState(false);

  // Each step change: navigate to its route if we're not already there, then
  // poll for its target element (it may not exist yet — the route's data
  // might still be loading) before measuring and revealing the spotlight.
  useEffect(() => {
    if (!active || !step) return;
    setReady(false);
    setRect(null);

    if (pathname !== step.route) {
      router.push(step.route);
      return;
    }

    if (!step.selector) {
      setReady(true);
      return;
    }

    let cancelled = false;
    const selector = step.selector;

    function measure() {
      const el = findVisibleTarget(selector);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      return true;
    }

    const pollId = setInterval(() => {
      const el = findVisibleTarget(selector);
      if (!el) return;
      clearInterval(pollId);
      clearTimeout(giveUpId);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        if (cancelled) return;
        measure();
        setReady(true);
      }, 400);
    }, 150);

    // If the target never shows up (a failed fetch, an empty section with
    // nothing to measure), fall back to a plain centered card rather than
    // leaving the tour stuck on a blank screen forever.
    const giveUpId = setTimeout(() => {
      clearInterval(pollId);
      if (!cancelled) setReady(true);
    }, 4000);

    return () => {
      cancelled = true;
      clearInterval(pollId);
      clearTimeout(giveUpId);
    };
  }, [active, step, pathname, router]);

  useEffect(() => {
    if (!ready || !step?.selector) return;
    const selector = step.selector;
    function recompute() {
      const el = findVisibleTarget(selector);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      }
    }
    window.addEventListener("scroll", recompute, true);
    window.addEventListener("resize", recompute);
    return () => {
      window.removeEventListener("scroll", recompute, true);
      window.removeEventListener("resize", recompute);
    };
  }, [ready, step]);

  if (!active || !step || !ready) return null;

  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  const highlight = rect
    ? {
        top: Math.max(0, rect.top - SPOTLIGHT_PADDING),
        left: Math.max(0, rect.left - SPOTLIGHT_PADDING),
        width: rect.width + SPOTLIGHT_PADDING * 2,
        height: rect.height + SPOTLIGHT_PADDING * 2,
      }
    : null;

  const roomBelow = highlight ? vh - (highlight.top + highlight.height) : 0;
  const cardTop = highlight
    ? roomBelow > ESTIMATED_CARD_HEIGHT + 24
      ? highlight.top + highlight.height + 16
      : Math.max(CARD_MARGIN, highlight.top - ESTIMATED_CARD_HEIGHT - 16)
    : null;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="App tour">
      {highlight ? (
        <>
          <div
            className="absolute bg-black/75 transition-all duration-300"
            style={{ top: 0, left: 0, right: 0, height: highlight.top }}
          />
          <div
            className="absolute bg-black/75 transition-all duration-300"
            style={{ top: highlight.top + highlight.height, left: 0, right: 0, bottom: 0 }}
          />
          <div
            className="absolute bg-black/75 transition-all duration-300"
            style={{ top: highlight.top, left: 0, width: highlight.left, height: highlight.height }}
          />
          <div
            className="absolute bg-black/75 transition-all duration-300"
            style={{
              top: highlight.top,
              left: highlight.left + highlight.width,
              right: 0,
              height: highlight.height,
            }}
          />
          <div
            className="pointer-events-none absolute rounded-xl transition-all duration-300"
            style={{
              top: highlight.top,
              left: highlight.left,
              width: highlight.width,
              height: highlight.height,
              boxShadow: "0 0 0 2px var(--color-accent), 0 0 0 6px rgba(0,149,213,0.25)",
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-black/75" />
      )}

      <div
        className="absolute flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-2xl shadow-black/60"
        style={{
          left: CARD_MARGIN,
          right: CARD_MARGIN,
          maxWidth: CARD_MAX_WIDTH,
          marginLeft: "auto",
          marginRight: "auto",
          ...(cardTop !== null ? { top: cardTop } : { top: "50%", transform: "translateY(-50%)" }),
        }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted">
            {stepIndex + 1} of {totalSteps}
          </p>
          <button type="button" onClick={skip} className="text-xs text-muted hover:text-accent">
            Skip tour
          </button>
        </div>
        <h3 className="text-base font-semibold">{step.title}</h3>
        <p className="text-sm leading-relaxed text-neutral-300">{step.body}</p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={back}
            disabled={stepIndex === 0}
            className="rounded border border-border px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-accent disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={next}
            className="rounded bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            {stepIndex === totalSteps - 1 ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
