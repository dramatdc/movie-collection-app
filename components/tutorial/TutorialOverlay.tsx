"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTutorial } from "@/lib/tutorial/TutorialContext";

const SPOTLIGHT_PADDING = 8;
const CARD_MAX_WIDTH = 380;
const CARD_MARGIN = 16;
// A plain 16px margin sits right against a phone's status bar / notch when a
// tall target (like "your collection", which can start near the very top of
// the viewport once scrolled) pushes the card into the fallback top-clamp
// branch below. This keeps it clear of that area on every step, not just
// that one.
const CARD_TOP_SAFE_MARGIN = 56;
const FALLBACK_CARD_HEIGHT = 190;
const SCROLL_BLOCK_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
]);

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
  const { active, step, stepIndex, totalSteps, actionDone, next, back, skip } = useTutorial();
  const pathname = usePathname();
  const router = useRouter();
  const [rect, setRect] = useState<Rect | null>(null);
  const [ready, setReady] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(FALLBACK_CARD_HEIGHT);

  // Each step change: navigate to its route if we're not already there, then
  // poll for its target element (it may not exist yet — the route's data
  // might still be loading) before measuring and revealing the spotlight.
  useEffect(() => {
    if (!active || !step) {
      // Critical: without this, dismissing the tour while a step's target
      // was already `ready` never flips it back to false, so the scroll
      // lock and position-poll effects below (keyed on `ready`) never
      // re-run their cleanup — the wheel/touch/keydown blockers stay
      // attached to the window forever, breaking scroll app-wide until a
      // full reload.
      setReady(false);
      return;
    }
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
      // "start" rather than "center" — for a tall target (the collection
      // section can be much taller than the viewport), centering tries to
      // put its midpoint on screen, which can mean scrolling well past its
      // top edge in one jump. Aligning to the top is a shorter, less jarring
      // scroll and also keeps the target's actual top edge (where the info
      // card anchors) predictable.
      el.scrollIntoView({ behavior: "smooth", block: "start" });
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
        setRect((prev) =>
          prev && prev.top === r.top && prev.left === r.left && prev.width === r.width && prev.height === r.height
            ? prev
            : { top: r.top, left: r.left, width: r.width, height: r.height }
        );
      }
    }
    window.addEventListener("scroll", recompute, true);
    window.addEventListener("resize", recompute);
    // The scroll/resize listeners miss some causes of drift — e.g. the
    // browser's own smooth-scroll animation still settling after the
    // initial measurement, or anything else that repositions the page
    // without firing a native scroll event. A cheap poll catches those too,
    // so the spotlight can't end up permanently stuck covering the exact
    // control a step is asking the user to press.
    const pollId = setInterval(recompute, 200);
    return () => {
      window.removeEventListener("scroll", recompute, true);
      window.removeEventListener("resize", recompute);
      clearInterval(pollId);
    };
  }, [ready, step]);

  // Scrolling while a step is showing moves the page out from under the
  // spotlight's measured coordinates — the highlight and the real element
  // can drift out of sync (and stop matching up at all with a fast scroll),
  // which risks covering the very control a step is asking the user to
  // press. The one scroll that should still happen (bringing a new target
  // into view) is triggered programmatically above, before this locks in.
  useEffect(() => {
    if (!ready) return;

    function blockDefault(e: Event) {
      e.preventDefault();
    }
    function blockKeys(e: KeyboardEvent) {
      if (SCROLL_BLOCK_KEYS.has(e.key)) e.preventDefault();
    }

    window.addEventListener("wheel", blockDefault, { passive: false });
    window.addEventListener("touchmove", blockDefault, { passive: false });
    window.addEventListener("keydown", blockKeys);
    return () => {
      window.removeEventListener("wheel", blockDefault);
      window.removeEventListener("touchmove", blockDefault);
      window.removeEventListener("keydown", blockKeys);
    };
  }, [ready]);

  // Measured on every render rather than assumed — a fixed height estimate
  // could be shorter than the real card (longer body copy, no Next button
  // to show a hint instead, narrower viewports wrapping to more lines),
  // which let the card overlap and cover the very control a step was
  // asking the user to press.
  // Deliberately runs every render (not just when cardHeight changes) so a
  // step change or viewport resize re-measures; the equality check above
  // prevents any update loop.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const measured = cardRef.current?.getBoundingClientRect().height;
    if (measured && measured !== cardHeight) {
      setCardHeight(measured);
    }
  });

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

  const roomAbove = highlight ? highlight.top : 0;
  const roomBelow = highlight ? vh - (highlight.top + highlight.height) : 0;
  let cardTop: number | null = null;
  if (highlight) {
    if (step.preferAbove && roomAbove > cardHeight + 24) {
      // For a target near the top of a section (like the view toggle), the
      // content it's demonstrating continues below it — placing the card
      // below would sit right on top of exactly what the step wants shown.
      cardTop = highlight.top - cardHeight - 16;
    } else if (roomBelow > cardHeight + 24) {
      cardTop = highlight.top + highlight.height + 16;
    } else {
      cardTop = highlight.top - cardHeight - 16;
    }
    // Applied after picking a branch, not just in the fallback one — any of
    // the above can still land close to the top edge (a short highlight near
    // the top of a tall scrolled section, a small viewport), and the card
    // shouldn't clip under the status bar / notch in any of those cases.
    cardTop = Math.max(CARD_TOP_SAFE_MARGIN, cardTop);
  }

  return (
    <div
      className="fixed inset-0 z-[100] pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-label="App tour"
    >
      {/* The container itself is click-through by default — otherwise, even
          the "hole" over the highlighted target has nothing painted there to
          hit-test against, so the full-viewport container catches the click
          instead of letting it reach the real button underneath. Each piece
          that should actually block or receive clicks opts back in below. */}
      {highlight ? (
        <>
          {/* No transition on these — a smooth glide sounds nice, but while
              a poll or scroll correction is repositioning them mid-animation
              their painted position can drift away from where React thinks
              the highlight is, and hit-testing (elementFromPoint / a real
              click) follows the painted position. Snapping instantly keeps
              the "hole" always exactly matching the real target's hitbox. */}
          <div
            className="pointer-events-auto absolute bg-black/75"
            style={{ top: 0, left: 0, right: 0, height: highlight.top }}
          />
          <div
            className={`pointer-events-auto absolute ${step.revealBelow ? "" : "bg-black/75"}`}
            style={{ top: highlight.top + highlight.height, left: 0, right: 0, bottom: 0 }}
          />
          <div
            className="pointer-events-auto absolute bg-black/75"
            style={{ top: highlight.top, left: 0, width: highlight.left, height: highlight.height }}
          />
          <div
            className="pointer-events-auto absolute bg-black/75"
            style={{
              top: highlight.top,
              left: highlight.left + highlight.width,
              right: 0,
              height: highlight.height,
            }}
          />
          <div
            className="pointer-events-none absolute rounded-xl"
            style={{
              top: highlight.top,
              left: highlight.left,
              width: highlight.width,
              height: highlight.height,
              boxShadow: "0 0 0 2px var(--color-accent), 0 0 0 6px rgba(0,149,213,0.25)",
            }}
          />
          {step.interactive === false && (
            // Some steps are purely explaining a feature rather than
            // inviting the user to try it right now — the highlight still
            // shows where it is, but stays non-interactive so nothing gets
            // typed or clicked into the real page underneath by accident.
            <div
              className="pointer-events-auto absolute"
              style={{
                top: highlight.top,
                left: highlight.left,
                width: highlight.width,
                height: highlight.height,
              }}
            />
          )}
        </>
      ) : (
        <div className="pointer-events-auto absolute inset-0 bg-black/75" />
      )}

      <div
        ref={cardRef}
        className="pointer-events-auto absolute flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-2xl shadow-black/60"
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
          {step.requireAction && !actionDone ? (
            <p className="text-xs italic text-muted">Tap the highlighted button to continue</p>
          ) : (
            <button
              type="button"
              onClick={next}
              className="rounded bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
            >
              {stepIndex === totalSteps - 1 ? "Done" : "Next"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
