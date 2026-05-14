import { useState, useEffect, useMemo, useRef, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
  GraduationCap, TestTubes, ShieldCheck, UserRound,
  Clock, ChevronRight, CheckCircle2, ArrowRight, Sparkles
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  IconBadge,
  Button,
} from "@kura/ui-kit";

/* ============================================================
   Tour definitions — declarative. Each step pins to a real DOM
   node via `data-tour="<id>"`. `nav` is optional and switches
   the app's main view before the step renders (so the spotlight
   target actually exists). Keep step counts low — 3-5 each.
   ============================================================ */
export const TOURS = [
  {
    id: "catalog",
    title: "Explore the lab catalog",
    blurb: "210+ tests, panels, and reflex protocols — searchable, priced, suggestable.",
    eta: "2 min",
    icon: TestTubes,
    steps: [
      {
        target: "nav-catalog",
        nav: "catalog",
        title: "The full lab catalog",
        body: "Every test Kura supports, with pricing, turnaround, and sample requirements. Search or browse by panel.",
        placement: "right",
      },
      {
        target: "catalog-search",
        nav: "catalog",
        title: "Find any test fast",
        body: "Search by name or code (e.g. HBA1C), or narrow by category — diabetes, lipids, renal, and more. Each row shows price, turnaround, and sample.",
        placement: "bottom",
      },
      {
        target: "catalog-favorites",
        nav: "catalog",
        title: "Pin the tests you reach for",
        body: "Favorites sit at the top of Quick order on every patient — one tap to drop into a draft order. Star a row in the list to add it here.",
        placement: "bottom",
      },
      {
        target: "catalog-bundles",
        nav: "catalog",
        title: "Save your recurring test sets",
        body: "Group related tests into a named bundle — a hypertension panel, a pre-op set — and apply the whole thing with one tap from Quick order.",
        placement: "bottom",
      },
    ],
  },
  {
    id: "patient-sokha",
    title: "Meet Sokha — your demo patient",
    blurb: "Walk through a real chart: vitals, lab trends, meds, and the quick-order rail.",
    eta: "3 min",
    icon: UserRound,
    steps: [
      {
        target: "nav-patients",
        nav: "patients",
        title: "Your patient panel",
        body: "Today the panel has one demo patient — Sokha Chann. In production, this is filtered by today's signals (results back, follow-ups due, flagged).",
        placement: "right",
      },
      {
        target: "patient-header",
        action: "open-sokha-chart",
        title: "Sokha's chart at a glance",
        body: "Identity up top, AI recap below — a one-line read on what's going on and the next clinical step. The recap refreshes daily from the longitudinal record.",
        placement: "bottom",
      },
      {
        target: "lab-trends",
        action: "open-sokha-chart",
        title: "Lab history as a trend matrix",
        body: "Every result over time, panel by panel. Out-of-range values are flagged inline; click any cell to expand the value with reference range and prior context.",
        placement: "top",
      },
      {
        target: "quick-order",
        action: "open-sokha-chart",
        title: "Quick-order rail",
        body: "Place a lab order without leaving the chart — your favorites and bundles from the catalog show up here. Most orders take under 30 seconds.",
        placement: "left",
      },
      {
        target: "meds-card",
        action: "open-sokha-chart",
        title: "Medications & diagnoses",
        body: "Sokha's active meds with renal-dose flags from her eGFR. The diagnoses card below holds her ICD-10 problem list — both editable inline.",
        placement: "left",
      },
    ],
  },
  {
    id: "verify",
    title: "Verify your licence",
    blurb: "Unlock real patients, Dx prescriptions, and insurance billing.",
    eta: "5 min",
    icon: ShieldCheck,
    action: "verify",
  },
];

const STORAGE_KEY = "kura.onboarding.v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { dismissedChoice: false, completed: [], skipped: [] };
    const parsed = JSON.parse(raw);
    return {
      dismissedChoice: Boolean(parsed.dismissedChoice),
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      skipped: Array.isArray(parsed.skipped) ? parsed.skipped : [],
    };
  } catch {
    return { dismissedChoice: false, completed: [], skipped: [] };
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

/* ============================================================
   useOnboarding — owns choice-modal visibility, active tour,
   current step index, and persistence.
   ============================================================ */
export function useOnboarding({ enabled = true, onNavigate, onAction } = {}) {
  const [persisted, setPersisted] = useState(loadState);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [activeTourId, setActiveTourId] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const fresh = loadState();
    setPersisted(fresh);
    if (!fresh.dismissedChoice && !choiceOpen && !activeTourId) {
      const t = setTimeout(() => setChoiceOpen(true), 350);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const persist = useCallback((next) => {
    setPersisted(next);
    saveState(next);
  }, []);

  const openChoice = useCallback(() => setChoiceOpen(true), []);
  const closeChoice = useCallback(() => {
    setChoiceOpen(false);
    if (!persisted.dismissedChoice) persist({ ...persisted, dismissedChoice: true });
  }, [persisted, persist]);

  const startTour = useCallback((tourId) => {
    const tour = TOURS.find(t => t.id === tourId);
    if (!tour || !tour.steps) return;
    setChoiceOpen(false);
    if (!persisted.dismissedChoice) persist({ ...persisted, dismissedChoice: true });
    setActiveTourId(tourId);
    setStepIndex(0);
    const first = tour.steps[0];
    if (first?.nav && onNavigate) onNavigate(first.nav);
    if (first?.action && onAction) onAction(first.action);
  }, [persisted, persist, onNavigate, onAction]);

  const exitTour = useCallback(() => {
    setActiveTourId(null);
    setStepIndex(0);
  }, []);

  const skipTour = useCallback(() => {
    if (!activeTourId) return;
    const next = {
      ...persisted,
      skipped: persisted.skipped.includes(activeTourId)
        ? persisted.skipped
        : [...persisted.skipped, activeTourId],
    };
    persist(next);
    exitTour();
  }, [activeTourId, persisted, persist, exitTour]);

  const completeTour = useCallback(() => {
    if (!activeTourId) return;
    const next = {
      ...persisted,
      completed: persisted.completed.includes(activeTourId)
        ? persisted.completed
        : [...persisted.completed, activeTourId],
      skipped: persisted.skipped.filter(id => id !== activeTourId),
    };
    persist(next);
    exitTour();
  }, [activeTourId, persisted, persist, exitTour]);

  const activeTour = useMemo(
    () => TOURS.find(t => t.id === activeTourId) ?? null,
    [activeTourId]
  );

  const nextStep = useCallback(() => {
    if (!activeTour) return;
    if (stepIndex >= activeTour.steps.length - 1) {
      completeTour();
      return;
    }
    const nextIdx = stepIndex + 1;
    const next = activeTour.steps[nextIdx];
    if (next?.nav && onNavigate) onNavigate(next.nav);
    if (next?.action && onAction) onAction(next.action);
    setStepIndex(nextIdx);
  }, [activeTour, stepIndex, completeTour, onNavigate, onAction]);

  const prevStep = useCallback(() => {
    if (!activeTour || stepIndex === 0) return;
    const prevIdx = stepIndex - 1;
    const prev = activeTour.steps[prevIdx];
    if (prev?.nav && onNavigate) onNavigate(prev.nav);
    if (prev?.action && onAction) onAction(prev.action);
    setStepIndex(prevIdx);
  }, [activeTour, stepIndex, onNavigate, onAction]);

  const resetOnboarding = useCallback(() => {
    const fresh = { dismissedChoice: false, completed: [], skipped: [] };
    persist(fresh);
    setActiveTourId(null);
    setStepIndex(0);
    setChoiceOpen(true);
  }, [persist]);

  return {
    choiceOpen,
    openChoice,
    closeChoice,
    activeTour,
    stepIndex,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    exitTour,
    completed: persisted.completed,
    skipped: persisted.skipped,
    dismissedChoice: persisted.dismissedChoice,
    resetOnboarding,
  };
}

/* ============================================================
   OnboardingChoiceModal — kit Dialog with the 3 onboarding paths.
   ============================================================ */
export function OnboardingChoiceModal({ onClose, onStart, onAction, completed, userFullName }) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-[520px] gap-0 p-0">
        <DialogHeader className="px-7 pb-3 pt-8 text-center sm:text-center">
          <span className="mx-auto mb-4 inline-flex">
            <IconBadge tone="brand" size="lg">
              <Sparkles size={22} strokeWidth={1.75} />
            </IconBadge>
          </span>
          <DialogTitle className="text-[20px] font-semibold leading-snug">
            Welcome to Kura{userFullName ? `, ${userFullName.split(" ")[0]}` : ""}
          </DialogTitle>
          <DialogDescription className="mt-1.5 px-2 text-k-body text-[var(--ink-600)]">
            Pick where to start — you can always come back to the rest later.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 pb-5">
          <div className="divide-y divide-[var(--border)] overflow-hidden rounded-[var(--radius)] border border-[var(--border)]">
            <div className="bg-[var(--surface-2)] px-4 py-2.5">
              <div className="text-k-overline uppercase tracking-k-caps text-[var(--ink-500)]">
                You now have unlimited access to:
              </div>
            </div>
            {TOURS.map((tour) => {
              const TourIcon = tour.icon;
              const isDone = completed.includes(tour.id);
              return (
                <button
                  key={tour.id}
                  type="button"
                  onClick={() => tour.action ? onAction?.(tour.action) : onStart(tour.id)}
                  className="group flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[var(--surface-2)]"
                >
                  <IconBadge tone="brand" size="md">
                    <TourIcon size={18} />
                  </IconBadge>
                  <div className="min-w-0 flex-1">
                    <div className="text-k-body font-medium leading-snug text-[var(--ink-900)]">
                      {tour.title}
                    </div>
                    <div className="mt-0.5 truncate text-k-sm leading-snug text-[var(--ink-600)]">
                      {tour.blurb}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-k-xs font-medium text-[var(--success-600)]">
                        <CheckCircle2 size={13} /> Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-k-xs text-[var(--ink-500)]">
                        <Clock size={11} /> {tour.eta}
                      </span>
                    )}
                    <ChevronRight size={15} className="text-[var(--ink-500)] transition group-hover:text-[var(--ink-700)]" />
                  </div>
                </button>
              );
            })}
          </div>

          <Button
            variant="link"
            onClick={onClose}
            className="mt-4 w-full"
          >
            I'll explore on my own
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
   TourSpotlight — dim backdrop + cutout around the target +
   anchored tooltip. Tracks scroll/resize and re-measures.
   ============================================================ */
export function TourSpotlight({ tour, stepIndex, onNext, onPrev, onSkip }) {
  const step = tour.steps[stepIndex];
  const [rect, setRect] = useState(null);

  useLayoutEffect(() => {
    setRect(null);

    let raf;
    let timer;
    let attempts = 0;
    let scrolled = false;

    const commitRect = (node) => {
      const r = node.getBoundingClientRect();
      const top = Math.max(0, r.top);
      const left = Math.max(0, r.left);
      const bottom = Math.min(window.innerHeight, r.bottom);
      const right = Math.min(window.innerWidth, r.right);
      setRect({
        top,
        left,
        width: Math.max(0, right - left),
        height: Math.max(0, bottom - top),
      });
    };

    const measure = () => {
      const node = document.querySelector(`[data-tour="${step.target}"]`);
      if (!node) {
        if (attempts++ < 30) {
          raf = requestAnimationFrame(measure);
        } else {
          setRect(null);
        }
        return;
      }
      const r = node.getBoundingClientRect();
      const inView =
        r.top >= 0 && r.left >= 0 &&
        r.bottom <= window.innerHeight && r.right <= window.innerWidth;
      if (!inView && !scrolled) {
        scrolled = true;
        const blockMode = r.height > window.innerHeight - 120 ? "start" : "center";
        node.scrollIntoView({ block: blockMode, behavior: "smooth" });
        timer = setTimeout(() => {
          const fresh = document.querySelector(`[data-tour="${step.target}"]`);
          if (fresh) commitRect(fresh);
        }, 380);
        return;
      }
      commitRect(node);
    };

    raf = requestAnimationFrame(measure);

    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [step.target, stepIndex]);

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === tour.steps.length - 1;

  return createPortal(
    <>
      {rect ? (
        <div
          aria-hidden
          style={{
            position: "fixed",
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            borderRadius: "var(--radius-lg)",
            boxShadow: "0 0 0 9999px var(--scrim)",
            pointerEvents: "none",
            zIndex: 60,
          }}
        />
      ) : (
        <div
          aria-hidden
          className="fixed inset-0"
          style={{
            background: "var(--scrim)",
            zIndex: 60,
            pointerEvents: "none",
          }}
        />
      )}

      <div
        aria-hidden
        className="fixed inset-0"
        style={{ zIndex: 61, pointerEvents: "auto", background: "transparent" }}
        onClick={(e) => e.stopPropagation()}
      />

      <TourTooltip
        step={step}
        rect={rect}
        tour={tour}
        stepIndex={stepIndex}
        isFirst={isFirst}
        isLast={isLast}
        onNext={onNext}
        onPrev={onPrev}
        onSkip={onSkip}
      />
    </>,
    document.body
  );
}

function TourTooltip({ step, rect, tour, stepIndex, isFirst, isLast, onNext, onPrev, onSkip }) {
  const tooltipRef = useRef(null);
  const [position, setPosition] = useState(null);

  useLayoutEffect(() => {
    if (!tooltipRef.current) return;
    const tw = tooltipRef.current.offsetWidth;
    const th = tooltipRef.current.offsetHeight;
    const gap = 12;
    const margin = 12;

    if (!rect) {
      setPosition({
        top: Math.max(margin, (window.innerHeight - th) / 2),
        left: Math.max(margin, (window.innerWidth - tw) / 2),
      });
      return;
    }

    const placement = step.placement ?? "right";
    const candidates = [];

    const right = {
      top: rect.top + rect.height / 2 - th / 2,
      left: rect.left + rect.width + gap,
      fits: rect.left + rect.width + gap + tw <= window.innerWidth - margin,
    };
    const left = {
      top: rect.top + rect.height / 2 - th / 2,
      left: rect.left - tw - gap,
      fits: rect.left - tw - gap >= margin,
    };
    const bottom = {
      top: rect.top + rect.height + gap,
      left: rect.left + rect.width / 2 - tw / 2,
      fits: rect.top + rect.height + gap + th <= window.innerHeight - margin,
    };
    const top = {
      top: rect.top - th - gap,
      left: rect.left + rect.width / 2 - tw / 2,
      fits: rect.top - th - gap >= margin,
    };

    const map = { right, left, bottom, top };
    candidates.push(map[placement]);
    ["right", "bottom", "left", "top"].forEach(p => {
      if (p !== placement) candidates.push(map[p]);
    });

    const chosen = candidates.find(c => c.fits) ?? candidates[0];
    setPosition({
      top: Math.max(margin, Math.min(chosen.top, window.innerHeight - th - margin)),
      left: Math.max(margin, Math.min(chosen.left, window.innerWidth - tw - margin)),
    });
  }, [rect, step.placement, stepIndex]);

  return (
    <div
      ref={tooltipRef}
      role="dialog"
      aria-label={step.title}
      className="fixed w-[340px] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-lg)]"
      style={{
        zIndex: 62,
        top: position?.top ?? -9999,
        left: position?.left ?? -9999,
        opacity: position ? 1 : 0,
        transition: "top var(--duration-base) var(--easing-standard), left var(--duration-base) var(--easing-standard), opacity var(--duration-fast) ease",
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="text-k-overline uppercase tracking-k-caps text-[var(--brand-700)]">
          {tour.title}
        </div>
        <div className="font-mono text-k-xs text-[var(--ink-500)]">
          {stepIndex + 1} / {tour.steps.length}
        </div>
      </div>

      <h3 className="k-h5 leading-snug">{step.title}</h3>
      <p className="mt-1.5 text-k-body leading-snug text-[var(--ink-600)]">
        {step.body}
      </p>

      <div className="mt-4 flex items-center gap-2">
        <Button variant="link" onClick={onSkip} className="px-0 text-[var(--ink-500)]">
          Skip tour
        </Button>
        <div className="flex-1" />
        {!isFirst && (
          <Button variant="ghost" size="sm" onClick={onPrev}>
            Back
          </Button>
        )}
        <Button size="sm" onClick={onNext}>
          {isLast ? "Finish" : "Next"}
          {!isLast && <ArrowRight size={12} />}
        </Button>
      </div>
    </div>
  );
}

/* ============================================================
   FirstStepsWidget — bottom-right reentry. Shows progress and
   reopens the choice modal. Hides itself once everything done.
   ============================================================ */
export function FirstStepsWidget({ completed, total, onOpen }) {
  if (completed >= total) return null;
  const pct = Math.round((completed / total) * 100);
  return createPortal(
    <button
      type="button"
      onClick={onOpen}
      className="group fixed bottom-5 right-5 z-[40] flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-md)] transition hover:shadow-[var(--shadow-lg)]"
    >
      <IconBadge tone="brand" size="md">
        <GraduationCap size={17} strokeWidth={1.75} />
      </IconBadge>
      <div className="text-left">
        <div className="text-k-body font-medium leading-tight text-[var(--ink-900)]">
          First steps with Kura
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1 w-24 overflow-hidden rounded-full bg-[var(--ink-100)]">
            <div
              className="h-full bg-[var(--brand-500)] transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="font-mono text-k-2xs text-[var(--ink-500)]">
            {completed}/{total}
          </div>
        </div>
      </div>
      <ChevronRight size={14} className="shrink-0 text-[var(--ink-500)] transition group-hover:text-[var(--ink-700)]" />
    </button>,
    document.body
  );
}
