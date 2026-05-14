import React, { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Users, FlaskConical, Video, ClipboardList, TrendingUp,
  Search, Bell, ChevronRight, ChevronDown, ChevronUp, ChevronLeft, Plus,
  CheckCircle2, AlertTriangle, Clock, MapPin, Motorbike, Syringe, TestTubes,
  Stethoscope, Calendar, FileText, Sparkles, Star,
  ShieldCheck, CreditCard, Globe, X, Filter, MoreHorizontal,
  Phone, Activity, Pill, Send, ArrowRight, ArrowLeft, Banknote, Inbox,
  Zap, Building2, Lock, MessageCircle, Mail, Droplet,
  LayoutDashboard, ShoppingCart, PersonStanding, Cross,
  ScanLine, Printer, Undo2, Package, QrCode, HelpCircle, ExternalLink,
  Mic, List, ListOrdered, RotateCw, Bold, Italic, Underline, Strikethrough,
  ListChecks, Pencil, Copy, Trash2, PanelLeft, Settings, LogOut,
  UserPlus, Sun, Moon, Monitor, SlidersHorizontal, Languages
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, ReferenceLine, ReferenceArea, Tooltip, ComposedChart, Area, useXAxisScale, useYAxisScale } from "recharts";
import JsBarcode from "jsbarcode";
import { QRCodeSVG } from "qrcode.react";
import "barcode-detector/side-effects"; // polyfills window.BarcodeDetector on Linux Chrome / Firefox
import { openDocumentPdf } from "./pdfGenerators";
import { useAuth, LoginPage, WorkspaceOnboardingPage, MemberKycPage, PIERRE_EMAIL } from "./Auth";
import {
  useOnboarding,
  OnboardingChoiceModal,
  TourSpotlight,
  FirstStepsWidget,
  TOURS,
} from "./Onboarding";
import { SigningSettingsView } from "./Signing";
import {
  AppHeader,
  AppSidebar,
  SidebarNavItem,
  Kbd,
  Button,
  IconBadge,
  StatusPill,
  Banner,
  Icon as KitIcon,
} from "@kura/ui-kit";

/* ============================================================
   External Doctor Platform — Prototype
   Built from: "External Doctor Platform — Architecture & Value Surfaces"
   IA: Patients · Orders · Telehealth · Care Plans · Performance
   Tier model: T0 Explorer / T1 Verified clinician / T2 Billing-enabled
   ============================================================ */

/* ---------- Theme (kit-aware) ----------
   The legacy bespoke color tokens, font imports, and utility classes have
   moved to src/index.css which now consumes the Kura UI kit's tokens and
   bridges the doctor app's legacy class names (jade/ink/surface/line/…) onto
   them. This component now only injects runtime animations + visual effects
   that aren't part of the kit. */
const Theme = () => (
  <style>{`
    button { font-family: inherit; }
    button:focus-visible {
      outline: 2px solid var(--brand-500);
      outline-offset: 2px;
      border-radius: 4px;
    }

    /* Tab underline */
    .tab-underline { position: relative; }
    .tab-underline.active::after {
      content: ""; position: absolute; left: 0; right: 0; bottom: -1px;
      height: 2px; background: var(--brand-500);
    }

    /* Subtle dot grain on auth canvas */
    .grain::before {
      content: "";
      position: fixed; inset: 0;
      pointer-events: none;
      background-image: radial-gradient(rgba(11, 20, 36, 0.022) 1px, transparent 1px);
      background-size: 3px 3px;
      mix-blend-mode: multiply;
      z-index: 0;
    }

    /* Pulse — gentle "breath" rather than a flicker. Longer cycle + smaller
       opacity drop reads as alive without strobing on screen recordings. */
    @keyframes softPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.75; } }
    .pulse-dot { animation: softPulse 3.2s ease-in-out infinite; }

    /* Recording waveform — pure CSS so React state updates don't fight the
       height transitions. Each bar gets its own animation-delay inline. */
    @keyframes waveBar {
      0%, 100% { transform: scaleY(0.35); }
      50%      { transform: scaleY(1); }
    }
    .wave-bar { animation: waveBar 1s ease-in-out infinite; transform-origin: center; }

    @keyframes inlineExpand {
      0%   { opacity: 0; max-height: 0; }
      30%  { opacity: 0; max-height: 60px; }
      100% { opacity: 1; max-height: 640px; }
    }
    @keyframes inlineCollapse {
      0%   { opacity: 1; max-height: 640px; }
      70%  { opacity: 0; max-height: 60px; }
      100% { opacity: 0; max-height: 0; }
    }
    .inline-expand-anim {
      animation: inlineExpand 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
      overflow: hidden;
    }
    .inline-collapse-anim {
      animation: inlineCollapse 320ms cubic-bezier(0.7, 0, 0.84, 0) both;
      overflow: hidden;
    }

    @keyframes toastPop {
      from { opacity: 0; transform: translateY(8px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .toast-pop { animation: toastPop 220ms cubic-bezier(0.16, 1, 0.3, 1) both; }

    /* Sidebar collapse / expand. Width uses a spring-out easing (the same
       curve the toast and inline-expand animations use) so the rail glides
       to its new size. Labels fade asymmetrically: quick on collapse so they
       disappear before the rail finishes shrinking, and delayed on expand so
       they appear after the rail has opened up. */
    .sidenav-aside { transition: width 360ms cubic-bezier(0.16, 1, 0.3, 1); }
    .sidenav-toggle { transition: right 360ms cubic-bezier(0.16, 1, 0.3, 1); }
    .sidenav-fade { transition: opacity 240ms cubic-bezier(0.16, 1, 0.3, 1) 160ms; }
    .sidenav-fade.is-collapsed { transition: opacity 140ms ease-out 0ms; opacity: 0; }
    @media (prefers-reduced-motion: reduce) {
      .sidenav-aside, .sidenav-toggle, .sidenav-fade { transition: none !important; }
    }

    @keyframes scanLineSweep {
      0%, 100% { transform: translateY(-40px); }
      50%      { transform: translateY(40px); }
    }
    .scan-line { animation: scanLineSweep 1.8s ease-in-out infinite; }
  `}</style>
);

/* ============================================================
   LAB UNIT SYSTEM — global doctor preference (US ↔ SI)
   - Mock data is canonical (US) — convert at render time
   - Module-level pub/sub store + localStorage persistence
   - Used by LabValueChip, LabTrendTable, TrendModal, ProfileSheet
   ============================================================ */
const _unitStore = {
  v: (() => {
    try { return localStorage.getItem("kura.labUnits") || "us"; } catch { return "us"; }
  })(),
  subs: new Set(),
  set(next) {
    if (next !== "us" && next !== "si") return;
    this.v = next;
    try { localStorage.setItem("kura.labUnits", next); } catch (e) { /* ignore */ }
    this.subs.forEach(fn => fn(next));
  },
  sub(fn) { this.subs.add(fn); return () => this.subs.delete(fn); },
};
function useLabUnits() {
  const [s, setS] = useState(_unitStore.v);
  useEffect(() => _unitStore.sub(setS), []);
  return [s, (v) => _unitStore.set(v)];
}

/* Doctor-tier store — in-memory only (resets on reload by design). Three states:
   - explorer: just signed up, no license verified, no e-signature.
       Can browse catalog/patients but can't place real orders or generate
       legal Dx prescriptions (no proof they're a registered KH doctor).
   - verified: MoH license verified. Can place lab orders, view PHI, write
       notes — but legal Dx PDFs need an e-signature too.
   - done: licensed + e-signature + bank details on file. Full access. */
const _doctorTierStore = {
  v: "verified",
  subs: new Set(),
  set(next) {
    if (!["explorer", "verified", "done"].includes(next)) return;
    this.v = next;
    this.subs.forEach(fn => fn(next));
  },
  sub(fn) { this.subs.add(fn); return () => this.subs.delete(fn); },
};
function useDoctorTier() {
  const [s, setS] = useState(_doctorTierStore.v);
  useEffect(() => _doctorTierStore.sub(setS), []);
  return [s, (v) => _doctorTierStore.set(v)];
}

// Pre-launch demo gate. Only Pierre's account renders the populated cabinet
// (1.2k patients, 12 bookings, full lists). Every other account — Explorer,
// verified-demo, or a real magic-link sign-in — sees the lean first-run state
// (1 seed patient, 0 bookings) regardless of tier. Tier still gates features;
// this only gates mock data quantity so demo accounts don't look like Pierre's.
function isPierreAccount(auth) {
  return (auth?.session?.email || "").toLowerCase() === PIERRE_EMAIL;
}
const TIER_META = {
  explorer: { label: "Explorer",  short: "Explorer", icon: Search,     accent: "text-ink-3",  bg: "bg-line-2",     desc: "Browsing only — no license on file" },
  verified: { label: "Verified",  short: "Verified", icon: ShieldCheck,accent: "text-jade-2", bg: "bg-jade-soft",  desc: "MoH license verified · can order labs" },
  done:     { label: "Done",      short: "Done",     icon: CheckCircle2, accent: "text-jade",   bg: "bg-jade-soft",  desc: "License + e-signature + payouts — full access" },
};

/* Global persistent banner shown across every page when the doctor is in
   Explorer tier. Stakes the entire UI — until they start eKYC, every view
   reminds them they're in browse-only mode. */
function ExplorerBanner({ onStartVerification }) {
  const [tier] = useDoctorTier();
  if (tier !== "explorer") return null;
  return (
    <div className="bg-amber-soft px-8 py-2.5 flex items-center gap-3 flex-wrap sticky top-14 z-20">
      <div className="w-7 h-7 rounded-md bg-amber text-white flex items-center justify-center shrink-0">
        <ShieldCheck size={13} />
      </div>
      <div className="flex-1 min-w-[260px]">
        <div className="text-[12.5px] text-ink font-medium leading-tight">Explorer mode</div>
        <div className="text-[11px] text-ink-2 leading-snug">
          Verify your MoH license to unlock real patients, bookings, Dx prescriptions and insurance billing.
        </div>
      </div>
      <button
        onClick={onStartVerification}
        className="text-[11.5px] bg-jade text-white px-3 py-1.5 rounded-md font-medium hover:opacity-90 inline-flex items-center gap-1.5 shrink-0"
      >
        <ShieldCheck size={11} /> Start verification · eKYC <ArrowRight size={11} />
      </button>
    </div>
  );
}

/* Per-section empty state used when the doctor is in Explorer tier and the
   section needs real PHI / orders / pickups to be useful. Doesn't lie about
   why nothing's there — it's a verification gate. */
// Module-level callback lets any ExplorerEmptyState anywhere in the tree
// launch the eKYC modal without having to thread `onStartVerification` as a
// prop through every list view. App registers the real callback on mount.
let _startVerificationCallback = null;
function triggerStartVerification() { _startVerificationCallback?.(); }

function ExplorerEmptyState({ icon: Icon, title, body, onStartVerification }) {
  const onClick = onStartVerification ?? triggerStartVerification;
  return (
    <div className="px-8 py-16 max-w-[640px] mx-auto text-center">
      <div className="w-14 h-14 rounded-full bg-amber-soft text-amber flex items-center justify-center mx-auto mb-4">
        {Icon ? <Icon size={22} /> : <Lock size={22} />}
      </div>
      <h2 className="font-display text-[22px] font-medium leading-tight mb-2">{title}</h2>
      <p className="text-[13px] text-ink-2 leading-relaxed mb-5 max-w-[440px] mx-auto">{body}</p>
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1.5 bg-jade text-white text-[12.5px] px-4 py-2 rounded-md font-medium hover:opacity-90"
      >
        <ShieldCheck size={12} /> Start verification · eKYC <ArrowRight size={11} />
      </button>
      <div className="text-[10.5px] text-ink-3 mt-3">Most clinicians get verified the same day.</div>
    </div>
  );
}

// Single numeric conversion. Mock data is US-canonical; this maps to SI.
// Returns { v, u } so call sites get the converted unit too.
function convertLabNumber(num, unit, name, system) {
  if (system !== "si" || num == null || isNaN(num)) return { v: num, u: unit };
  const n = (name || "").toLowerCase();
  if (unit === "%" && n.includes("hba1c")) {
    return { v: Math.round((num - 2.15) * 10.929), u: "mmol/mol" };
  }
  if (unit === "mg/dL") {
    if (n.includes("glucose") || n.includes("fpg")) {
      return { v: Math.round(num * 0.0555 * 10) / 10, u: "mmol/L" };
    }
    if (n.includes("triglycer")) {
      return { v: Math.round(num * 0.0113 * 100) / 100, u: "mmol/L" };
    }
    if (n.includes("ldl") || n.includes("hdl") || n.includes("chol")) {
      return { v: Math.round(num * 0.0259 * 100) / 100, u: "mmol/L" };
    }
    if (n.includes("creatinine")) {
      return { v: Math.round(num * 88.4), u: "µmol/L" };
    }
  }
  if (unit === "mg/g" && n.includes("microalb")) {
    return { v: Math.round(num * 0.113 * 10) / 10, u: "mg/mmol" };
  }
  return { v: num, u: unit };
}

// Format a display string (handles BP "146/92" by leaving it alone).
function formatLabValue(value, unit, name, system) {
  if (value == null) return { value, unit };
  const s = String(value);
  if (s.includes("/")) return { value: s, unit }; // BP — same in both systems
  // Semi-quantitative ("1+", "2+") or text ("Trace", "Negative", "Positive", "Yellow"):
  // pass through unchanged — parseFloat would silently strip the suffix.
  if (/[+a-zA-Z]/.test(s)) return { value: s, unit };
  const num = parseFloat(s);
  if (isNaN(num)) return { value: s, unit };
  const { v, u } = convertLabNumber(num, unit, name, system);
  return { value: String(v), unit: u };
}

// Convert reference range strings: "< 100", "≥ 95", "70–100", "0.7–1.2".
// BP-style "< 130/80" passes through unchanged (mmHg same in SI).
function formatLabRef(ref, unit, name, system) {
  if (system !== "si" || !ref || ref === "—") return { ref, unit };
  if (ref.includes("/")) return { ref, unit };
  const cmp = ref.match(/^\s*(≤|≥|<|>)\s*(\d+\.?\d*)\s*$/);
  if (cmp) {
    const { v, u } = convertLabNumber(parseFloat(cmp[2]), unit, name, system);
    return { ref: `${cmp[1]} ${v}`, unit: u };
  }
  const range = ref.match(/^\s*(\d+\.?\d*)\s*[–-]\s*(\d+\.?\d*)\s*$/);
  if (range) {
    const a = convertLabNumber(parseFloat(range[1]), unit, name, system);
    const b = convertLabNumber(parseFloat(range[2]), unit, name, system);
    return { ref: `${a.v}–${b.v}`, unit: a.u };
  }
  return { ref, unit };
}

/* ---------- Demo data ---------- */
/* Patient-facing mobile booking page — rendered when ?bookingDemo=XYZ is
   present. Mimics what a patient sees on their Android after the booking SMS
   + Telegram message lands. Tiny demo strip at the top of the screen lets
   stakeholders cycle between the three states the same URL can resolve to:
   walk-in window (not collected · now), scheduled (not collected · future),
   collected (sample drawn, awaiting results).
   Kept self-contained on purpose — no shared chrome with the doctor app. */
function MobileBookingPage({ code }) {
  const [state, setState] = useState("walk-in"); // 'walk-in' | 'scheduled' | 'collected'

  // Walk-in only: where the patient is in the location-permission flow.
  // 'asking' on first load → 'granted' after share → 'denied' after refusal.
  // The 'denied' view applies a confirmshame-style dark pattern to nudge them
  // back toward sharing (real product trade-off worth being honest about).
  const [gpsState, setGpsState] = useState("asking"); // 'asking' | 'granted' | 'denied'

  const patientFirstName = "Sokha";
  const doctorName = "Dr. Sopheak Chann";
  const tests = ["HbA1c", "Lipid panel", "Microalbumin"];

  // Full PSC network — shown when patient refuses location sharing.
  const allPscs = [
    { name: "Kura PSC · BKK1",      address: "55 St. 178, Phnom Penh" },
    { name: "Kura PSC · Boeung Keng Kang 3", address: "112 St. 63, Phnom Penh" },
    { name: "Kura PSC · Chamkar Mon", address: "240 Norodom Blvd, Phnom Penh" },
    { name: "Kura PSC · Daun Penh",  address: "18 St. 240, Phnom Penh" },
    { name: "Kura PSC · Russian Market", address: "440 St. 163, Phnom Penh" },
    { name: "Kura PSC · Toul Kork",  address: "70 St. 528, Phnom Penh" },
    { name: "Kura PSC · Sen Sok",    address: "1B St. 1986, Phnom Penh" },
    { name: "Kura PSC · Tuol Tompoung", address: "92 St. 432, Phnom Penh" },
    { name: "Kura PSC · Mean Chey",  address: "215 Veng Sreng Blvd, Phnom Penh" },
    { name: "Kura PSC · Olympic",    address: "28 St. 286, Phnom Penh" },
    { name: "Kura PSC · Phsar Thmey", address: "11 St. 130, Phnom Penh" },
    { name: "Kura PSC · Wat Phnom",  address: "166 St. 92, Phnom Penh" },
  ];

  const requestGps = () => {
    if (!navigator.geolocation) { setGpsState("denied"); return; }
    navigator.geolocation.getCurrentPosition(
      () => setGpsState("granted"),
      () => setGpsState("denied"),
      { timeout: 8000, maximumAge: 60000 }
    );
  };
  const psc = { name: "Kura PSC · BKK1", address: "55 St. 178, Phnom Penh", phone: "+855 23 ••• 4471", hours: "Mon–Sat · 7:00 – 17:00" };
  const scheduled = { dayLabel: "Mon, 12 May", time: "09:30" };
  const drawnAt = "today · 14:18";

  // Real Google Maps directions URL — uses the device's "Current Location"
  // as origin (Maps prompts if needed) and the PSC address as destination.
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${encodeURIComponent(psc.address)}&travelmode=driving`;

  // QR payload: opaque token URL the receiving Kura PSC can scan to pull up
  // the booking. In production this would be a JWT; for the proto the booking
  // code is enough to identify the order.
  const qrPayload = `https://kura.med/booking?token=${encodeURIComponent(code)}`;

  const stateMeta = {
    "walk-in":   { label: "Not collected · walk in",  tone: "amber",  icon: PersonStanding },
    "scheduled": { label: "Scheduled appointment",    tone: "plum",   icon: Calendar },
    "collected": { label: "Sample collected",         tone: "jade",   icon: CheckCircle2 },
  }[state];
  const Icon = stateMeta.icon;
  const toneClasses = {
    amber: { card: "border-amber bg-amber-soft",     text: "text-amber",   dot: "bg-amber" },
    plum:  { card: "border-plum bg-line-2",          text: "text-plum",    dot: "bg-plum" },
    jade:  { card: "border-jade bg-jade-soft",       text: "text-jade-2",  dot: "bg-jade-2" },
  }[stateMeta.tone];

  return (
    <div className="min-h-screen bg-bg text-ink font-sans">
      {/* Phone status bar */}
      <div className="bg-ink text-bg/90 text-[11px] font-mono px-4 py-1 flex items-center justify-between">
        <span>9:41</span>
        <span className="flex items-center gap-1.5">
          <span>4G</span>
          <span>•••</span>
          <span>87%</span>
        </span>
      </div>

      {/* Demo state strip — prototype-only */}
      <div className="bg-amber-soft border-b border-amber/40 px-3 py-2">
        <div className="text-[9.5px] uppercase tracking-[0.16em] text-amber font-semibold mb-1.5 flex items-center gap-1.5">
          <Sparkles size={9} /> Prototype · demo state
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: "walk-in",   label: "Walk in" },
            { id: "scheduled", label: "Scheduled" },
            { id: "collected", label: "Collected" },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setState(s.id)}
              className={`text-[10.5px] py-1 rounded border transition ${
                state === s.id
                  ? "bg-ink text-bg border-ink font-medium"
                  : "bg-surface border-line text-ink-2 hover:border-ink"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* App-style header */}
      <header className="bg-jade text-white px-4 py-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-md bg-white/15 flex items-center justify-center">
          <FlaskConical size={15} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-medium leading-tight">Kura · Phnom Penh</div>
          <div className="text-[10.5px] text-white/70 leading-tight">Your lab order</div>
        </div>
      </header>

      {/* Boarding-pass-style ticket — info stub on top, QR scan section below,
          dashed perforation between. Transparent QR so the tinted card flows
          through; ticket-notch cutouts on the sides for the "tear here" feel. */}
      <div className="px-4 pt-4">
        <div className={`relative rounded-xl border-2 ${toneClasses.card} text-center overflow-hidden`}>
          {/* Info stub */}
          <div className="px-4 pt-5 pb-4">
            <div className="text-[9.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1">Booking code</div>
            <div className="font-display font-mono text-[34px] font-medium tracking-[0.18em] text-ink leading-none mb-2.5">{code}</div>
            <div className={`text-[11.5px] inline-flex items-center gap-1.5 ${toneClasses.text} font-medium`}>
              <Icon size={12} /> {stateMeta.label}
            </div>
          </div>

          {state !== "collected" && (
            <>
              {/* Perforation: side notches + dashed line */}
              <div className="relative h-3">
                <div className={`absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-bg border-2 ${toneClasses.card.split(" ")[0]}`} />
                <div className={`absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-bg border-2 ${toneClasses.card.split(" ")[0]}`} />
                <div className="absolute left-4 right-4 top-1/2 -translate-y-px border-t border-dashed border-ink-3/40" />
              </div>

              {/* Scan stub */}
              <div className="px-4 pt-3 pb-4">
                <div className="text-[9.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-2.5">Show this at reception</div>
                <div className="flex items-center justify-center">
                  <QRCodeSVG
                    value={qrPayload}
                    size={210}
                    level="M"
                    bgColor="transparent"
                    fgColor="#15201A"
                  />
                </div>
                <div className="text-[10px] text-ink-3 text-center mt-2.5 font-mono break-all">
                  kura.med/booking?token={code}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hi {firstName} */}
      <div className="px-4 pt-4">
        <div className="text-[15px] font-medium">Hi {patientFirstName} 👋</div>
        <p className="text-[12.5px] text-ink-2 mt-1 leading-relaxed">
          {state === "walk-in" && (
            <><span className="font-medium text-ink">{doctorName}</span> ordered lab tests. Walk into the nearest Kura collection point at your convenience to get your sample drawn — just show the code above at reception.</>
          )}
          {state === "scheduled" && (
            <><span className="font-medium text-ink">{doctorName}</span> ordered lab tests. Your appointment is scheduled — please arrive 5 minutes early and show this code at reception.</>
          )}
          {state === "collected" && (
            <><span className="font-medium text-ink">{doctorName}</span> ordered lab tests. Your sample has been collected — we'll send your results here as soon as they're ready (usually the same day).</>
          )}
        </p>
      </div>

      {/* State-specific main card */}
      {/* WALK-IN · gps-asking — initial state: persuade-with-jade CTA + tiny
          confirmshame-y skip link. Real browser prompt fires on tap. */}
      {state === "walk-in" && gpsState === "asking" && (
        <div className="px-4 pt-4">
          <div className="bg-surface border border-line rounded-xl px-4 py-5 text-center">
            <div className="w-12 h-12 rounded-full bg-jade-soft text-jade-2 flex items-center justify-center mx-auto mb-3">
              <MapPin size={20} />
            </div>
            <div className="font-display text-[16px] font-medium mb-1">Find your nearest Kura PSC</div>
            <p className="text-[12px] text-ink-2 leading-relaxed mb-4 max-w-[280px] mx-auto">
              We'll match you to the closest collection point — saves you a tuk-tuk fare and shows you the right hours.
            </p>
            <button
              onClick={requestGps}
              className="w-full text-[13px] bg-jade text-white py-2.5 rounded-md font-semibold hover:opacity-90 inline-flex items-center justify-center gap-1.5"
            >
              <MapPin size={13} /> Share location · find nearest
            </button>
            <button
              onClick={() => setGpsState("denied")}
              className="text-[10.5px] text-ink-3 hover:text-ink mt-3 underline-offset-2 hover:underline"
            >
              I'd rather walk further
            </button>
          </div>
        </div>
      )}

      {/* WALK-IN · gps-granted — current behaviour: one specific nearest PSC */}
      {state === "walk-in" && gpsState === "granted" && (
        <div className="px-4 pt-4">
          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-line-2 bg-jade-soft/40">
              <div className="text-[9.5px] uppercase tracking-[0.16em] text-jade-2 font-semibold inline-flex items-center gap-1"><CheckCircle2 size={10} /> Nearest to you</div>
              <div className="text-[14px] font-medium mt-0.5">{psc.name}</div>
            </div>
            <ul className="divide-y divide-line-2 text-[12.5px]">
              <li className="px-4 py-2.5 flex items-start gap-2"><MapPin size={12} className="text-ink-3 mt-0.5 shrink-0" /><span className="text-ink-2 flex-1">{psc.address}<div className="text-[10.5px] text-jade-2 font-mono">1.2 km · 4 min by tuk-tuk</div></span></li>
              <li className="px-4 py-2.5 flex items-center gap-2"><Clock size={12} className="text-ink-3 shrink-0" /><span className="text-ink-2 flex-1">{psc.hours}</span><span className="text-[10.5px] text-jade-2 font-medium">Open now</span></li>
              <li className="px-4 py-2.5 flex items-center gap-2"><Phone size={12} className="text-ink-3 shrink-0" /><span className="text-ink-2 font-mono flex-1">{psc.phone}</span></li>
            </ul>
            <div className="px-3 py-2.5 border-t border-line-2 grid grid-cols-2 gap-1.5">
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="text-[12px] bg-jade text-white py-2 rounded-md font-medium inline-flex items-center justify-center gap-1.5 hover:opacity-90">
                <MapPin size={11} /> Directions
              </a>
              <a href={`tel:${psc.phone.replace(/[^0-9+]/g, "")}`} className="text-[12px] bg-surface text-ink-2 border border-line py-2 rounded-md font-medium inline-flex items-center justify-center gap-1.5 hover:border-ink">
                <Phone size={11} /> Call PSC
              </a>
            </div>
          </div>
        </div>
      )}

      {/* WALK-IN · gps-denied — dark-pattern fallback: confirmshame banner +
          deliberately friction-y full alphabetical list with no distances.
          A persistent jade nudge at top tries to recover the share. */}
      {state === "walk-in" && gpsState === "denied" && (
        <div className="px-4 pt-4 space-y-3">
          {/* Persuasive nudge — visually dominant */}
          <button
            onClick={requestGps}
            className="w-full bg-jade text-white rounded-xl px-4 py-3 flex items-center gap-3 hover:opacity-90 text-left"
          >
            <MapPin size={18} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-semibold leading-tight">Share location to find the closest one</div>
              <div className="text-[10.5px] text-white/70 leading-tight mt-0.5">One tap · no account · saves you walking</div>
            </div>
            <ArrowRight size={14} className="shrink-0" />
          </button>

          {/* Confirmshame banner */}
          <div className="bg-amber-soft border border-amber rounded-md px-3 py-2 text-[11.5px] text-ink-2 leading-snug">
            <span className="font-medium text-amber inline-flex items-center gap-1"><AlertTriangle size={11} /> Location declined.</span>{" "}
            You'll need to pick a PSC yourself from the list below — distances and open-now status are <span className="font-medium">hidden</span> until you share location.
          </div>

          {/* All PSCs — alphabetised, friction-y, no helpful info */}
          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-line-2 flex items-center justify-between">
              <div className="text-[9.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold">All Kura PSCs · Phnom Penh</div>
              <span className="text-[10.5px] font-mono text-ink-3">{allPscs.length}</span>
            </div>
            <ul className="divide-y divide-line-2 max-h-[260px] overflow-y-auto">
              {[...allPscs].sort((a, b) => a.name.localeCompare(b.name)).map(p => (
                <li key={p.name} className="px-4 py-2 text-[12px]">
                  <div className="text-ink-2 font-medium">{p.name}</div>
                  <div className="text-[10.5px] text-ink-3 truncate">{p.address}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {state === "scheduled" && (
        <div className="px-4 pt-4">
          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-line-2 bg-plum/10">
              <div className="text-[9.5px] uppercase tracking-[0.16em] text-plum font-semibold">Your appointment</div>
              <div className="font-display text-[20px] font-medium mt-0.5">{scheduled.dayLabel}</div>
              <div className="text-[14px] text-ink-2">{scheduled.time}</div>
            </div>
            <ul className="divide-y divide-line-2 text-[12.5px]">
              <li className="px-4 py-2.5 flex items-start gap-2"><MapPin size={12} className="text-ink-3 mt-0.5 shrink-0" /><span className="text-ink-2 flex-1">{psc.name}<div className="text-[10.5px] text-ink-3">{psc.address}</div></span></li>
              <li className="px-4 py-2.5 flex items-center gap-2"><FileText size={12} className="text-ink-3 shrink-0" /><span className="text-ink-2 flex-1">Bring an ID and your phone with this code</span></li>
            </ul>
            <div className="px-3 py-2.5 border-t border-line-2 grid grid-cols-2 gap-1.5">
              <button className="text-[12px] bg-jade text-white py-2 rounded-md font-medium inline-flex items-center justify-center gap-1.5 hover:opacity-90">
                <Calendar size={11} /> Add to calendar
              </button>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] bg-surface text-ink-2 border border-line py-2 rounded-md font-medium inline-flex items-center justify-center gap-1.5 hover:border-ink"
              >
                <MapPin size={11} /> Directions
              </a>
            </div>
          </div>
        </div>
      )}

      {state === "collected" && (
        <div className="px-4 pt-4">
          <div className="bg-surface border border-jade rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-line-2 bg-jade-soft/60">
              <div className="text-[9.5px] uppercase tracking-[0.16em] text-jade-2 font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={10} /> Sample collected
              </div>
              <div className="text-[12px] text-ink-2 mt-0.5">at {psc.name} · <span className="font-mono">{drawnAt}</span></div>
            </div>
            <ol className="px-4 py-3 space-y-2.5 text-[12px]">
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-jade-2 text-white flex items-center justify-center shrink-0"><CheckCircle2 size={10} /></div>
                <div className="flex-1"><div className="font-medium">Sample drawn</div><div className="text-[10.5px] text-ink-3 font-mono">{drawnAt}</div></div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-amber text-white flex items-center justify-center shrink-0 animate-pulse"><Clock size={10} /></div>
                <div className="flex-1"><div className="font-medium text-ink-2">Lab processing</div><div className="text-[10.5px] text-ink-3">In progress · ETA today, 17:00</div></div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-line-2 text-ink-3 flex items-center justify-center shrink-0"><FileText size={10} /></div>
                <div className="flex-1"><div className="text-ink-3">Results delivered</div><div className="text-[10.5px] text-ink-3">We'll notify you on this number</div></div>
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* Prep instructions (when not yet collected) — surfaced before tests so
          the patient knows what to do before walking in */}
      {state !== "collected" && (
        <div className="px-4 pt-4">
          <div className="bg-amber-soft border border-amber rounded-xl px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertTriangle size={12} className="text-amber" />
              <div className="text-[11px] uppercase tracking-[0.14em] text-amber font-semibold">Before you come</div>
            </div>
            <ul className="text-[12px] text-ink-2 space-y-1 leading-snug">
              <li className="flex items-start gap-1.5"><span className="text-ink-3 mt-1.5 w-1 h-1 rounded-full bg-ink-3 shrink-0" /> Fast 9–12 hours (water is OK) — required for lipid panel.</li>
              <li className="flex items-start gap-1.5"><span className="text-ink-3 mt-1.5 w-1 h-1 rounded-full bg-ink-3 shrink-0" /> Bring an ID and this booking code.</li>
              <li className="flex items-start gap-1.5"><span className="text-ink-3 mt-1.5 w-1 h-1 rounded-full bg-ink-3 shrink-0" /> Stay hydrated — easier blood draw.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tests in this booking */}
      <div className="px-4 pt-4">
        <div className="bg-surface border border-line rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-line-2 flex items-center justify-between">
            <div className="text-[9.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold">Tests in your order</div>
            <span className="text-[10.5px] font-mono text-ink-3">{tests.length}</span>
          </div>
          <ul className="divide-y divide-line-2">
            {tests.map(t => (
              <li key={t} className="px-4 py-2.5 flex items-center gap-2 text-[12.5px]">
                <TestTubes size={12} className="text-jade-2 shrink-0" />
                <span className="text-ink-2 flex-1">{t}</span>
                {state === "collected" && <span className="text-[10px] text-amber bg-amber-soft px-1.5 py-0.5 rounded font-medium">Processing</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Dx prescription — official PDF, e-signed by the prescribing doctor.
          Same regulatory-grade document on every state — Cambodia MoH wants
          a paper trail for any test order. Opens in a new tab with print/save. */}
      <div className="px-4 pt-4">
        <a
          href={`${window.location.pathname}?prescription=${encodeURIComponent(code)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-surface border border-line rounded-xl px-4 py-3 hover:border-ink transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-line-2 text-ink-2 flex items-center justify-center shrink-0">
              <FileText size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-medium text-ink leading-tight">Download Dx prescription</div>
              <div className="text-[10.5px] text-ink-3 leading-tight mt-0.5">Legal PDF · e-signed by {doctorName}</div>
            </div>
            <ExternalLink size={13} className="text-ink-3 group-hover:text-ink shrink-0" />
          </div>
        </a>
      </div>

      {/* Footer */}
      <div className="px-4 pt-4 pb-8">
        <div className="text-[10.5px] text-ink-3 text-center leading-snug">
          Sent to <span className="font-mono">+855 12 ••• 4471</span> · code valid 7 days<br />
          Questions? <span className="text-jade-2 font-medium">Reply to this Telegram chat</span>.
        </div>
      </div>
    </div>
  );
}

/* Shown instead of the real Dx prescription when the doctor is still in
   Explorer tier. We're firm: no license → no legal Dx. But we leave a clean
   path forward so the doctor can verify and unlock. */
function PrescriptionGate({ code, kind = "Dx" }) {
  const isRx = kind === "Rx";
  return (
    <div className="min-h-screen bg-line-2 font-sans py-12 px-4 flex items-start justify-center">
      <div className="max-w-[560px] w-full bg-surface border border-line rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-line-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-amber-soft text-amber flex items-center justify-center"><Lock size={18} /></div>
          <div className="flex-1">
            <h1 className="font-display text-[18px] font-medium leading-tight">{isRx ? "Rx prescription not available" : "Dx prescription not available"}</h1>
            <div className="text-[11px] text-ink-3 mt-0.5 font-mono">{isRx ? "Rx ref" : "Booking ref"} · {code}</div>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-ink-3 bg-line-2 px-2 py-0.5 rounded">Explorer tier</span>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-[13px] text-ink-2 leading-relaxed">
            You're free to <span className="font-medium text-ink">browse the full lab catalog</span> and explore the platform as much as you want. But generating a <span className="font-medium text-ink">legally binding {isRx ? "medication" : "diagnostic"} prescription</span> in the Kingdom of Cambodia requires us to verify you're a registered MoH-licensed clinician.
          </p>
          <div className="rounded-lg border border-line bg-surface-2/40 p-4">
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-2">What we need from you</div>
            <ul className="space-y-2 text-[12.5px]">
              <li className="flex items-start gap-2"><ShieldCheck size={13} className="text-jade-2 mt-0.5 shrink-0" /><span><span className="font-medium">MoH license number</span> + a photo of the front side · verified within 24h</span></li>
              <li className="flex items-start gap-2"><FileText size={13} className="text-jade-2 mt-0.5 shrink-0" /><span>National ID match against the MoH registry</span></li>
              <li className="flex items-start gap-2"><MapPin size={13} className="text-jade-2 mt-0.5 shrink-0" /><span>Practice address (cabinet) for the letterhead</span></li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => window.close()} className="text-[12px] py-2 rounded-md border border-line text-ink-2 hover:border-ink">Back to catalog</button>
            <button className="text-[12px] py-2 rounded-md bg-jade text-white font-medium hover:opacity-90 inline-flex items-center justify-center gap-1.5">
              <ShieldCheck size={12} /> Verify my license
            </button>
          </div>
          <div className="text-[10.5px] text-ink-3 leading-snug text-center pt-1">
            Most clinicians get verified the same day. This protects the patient — and you — from being held liable for a misuse of the system.
          </div>
        </div>
      </div>
    </div>
  );
}

/* Patient-facing prescription page — opens at ?prescription=<code>. Renders
   an A4-letter-styled diagnostic prescription so the patient (or the PSC, or
   an insurer auditor) can print or save-as-PDF a legally binding doc.
   E-signature block is rendered inline so the doc looks executed even when
   it lives only as a HTML/PDF render. */
function PrescriptionPage({ code }) {
  const [tier] = useDoctorTier();

  // Explorer doctors cannot generate legal Dx — show the gate page instead.
  if (tier === "explorer") {
    return <PrescriptionGate code={code} />;
  }

  const today = "9 May 2026";
  const doctor = {
    name: "Dr. Sopheak Chann",
    title: "Médecin Généraliste · General Practitioner",
    license: "MoH-CB / MPC-2014-3287",
    cabinet: "Cabinet Médical Chann · BKK1",
    address: "12 St. 308, Boeung Keng Kang 1, Phnom Penh",
    phone: "+855 23 222 4471",
    email: "dr.sopheak@kura.med",
  };
  const patient = { name: "Sokha Chann", khmer: "ឆាន សុខា", age: 54, sex: "Female", mrn: "P-9134" };
  // ICD-10 codes — Cambodia MoH requires diagnostic codes on every Dx
  // prescription so insurers and the audit trail can reconcile. These mirror
  // Sokha's active problem list on her patient chart.
  const diagnoses = [
    { code: "E11.65", label: "Type 2 diabetes mellitus with hyperglycemia" },
    { code: "E78.5",  label: "Hyperlipidemia, unspecified" },
    { code: "I10",    label: "Essential (primary) hypertension" },
  ];
  const indication = "T2DM follow-up · uncontrolled glycemia (HbA1c 8.4% prior) · dyslipidemia surveillance";
  const tests = [
    { name: "HbA1c (Glycated hemoglobin)",    code: "HBA1C", sample: "EDTA whole blood · 3 mL", prep: "No fasting required" },
    { name: "Lipid panel (TC + LDL + HDL + TG)", code: "LIPID", sample: "Serum · 3 mL",         prep: "9–12h fasting recommended" },
    { name: "Microalbumin (urine spot)",      code: "UACR",  sample: "Urine · 10 mL",           prep: "First-morning preferred" },
  ];

  return (
    <div className="min-h-screen bg-line-2 font-sans py-8 px-4 print:bg-white print:py-0 print:px-0">
      {/* Toolbar — hidden on print */}
      <div className="max-w-[820px] mx-auto mb-4 flex items-center justify-between print:hidden">
        <div className="text-[12.5px] text-ink-2">
          <span className="text-ink-3">Diagnostic prescription · </span>
          <span className="font-mono">{code}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.close()}
            className="text-[11.5px] px-3 py-1.5 rounded-md border border-line bg-surface text-ink-2 hover:border-ink"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="text-[12px] px-3 py-1.5 rounded-md bg-jade text-white font-medium hover:opacity-90 inline-flex items-center gap-1.5"
          >
            <Printer size={12} /> Download · Print to PDF
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="max-w-[820px] mx-auto bg-surface border border-line rounded-sm shadow-md p-12 print:shadow-none print:border-0 print:p-10">
        {/* Letterhead */}
        <div className="flex items-start justify-between gap-6 pb-5 border-b border-ink/15">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-md bg-jade text-white flex items-center justify-center">
              <Stethoscope size={22} />
            </div>
            <div>
              <div className="font-display text-[20px] font-medium leading-tight">{doctor.name}</div>
              <div className="text-[11.5px] text-ink-2">{doctor.title}</div>
              <div className="text-[10.5px] text-ink-3 font-mono mt-0.5">License {doctor.license}</div>
            </div>
          </div>
          <div className="text-right text-[10.5px] text-ink-3 leading-snug">
            <div className="text-[11.5px] text-ink-2 font-medium">{doctor.cabinet}</div>
            <div>{doctor.address}</div>
            <div className="font-mono">{doctor.phone}</div>
            <div className="font-mono">{doctor.email}</div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-6">
          <div className="text-[10px] uppercase tracking-[0.3em] text-ink-3 font-semibold mb-1">Prescription · Ordonnance</div>
          <h1 className="font-display text-[24px] font-medium leading-none">Diagnostic Laboratory Tests</h1>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-3 gap-4 text-[11.5px] text-ink-2 mb-5 pb-5 border-b border-line-2">
          <div>
            <div className="text-[9.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-0.5">Prescribed on</div>
            <div className="font-medium">{today}</div>
          </div>
          <div>
            <div className="text-[9.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-0.5">Booking ref</div>
            <div className="font-mono">{code}</div>
          </div>
          <div>
            <div className="text-[9.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-0.5">Validity</div>
            <div>30 days from date of issue</div>
          </div>
        </div>

        {/* Patient */}
        <div className="mb-5">
          <div className="text-[9.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1.5">Patient</div>
          <div className="flex items-baseline gap-4 flex-wrap">
            <div className="font-display text-[18px] font-medium">{patient.name}</div>
            <div className="text-[11.5px] text-ink-2">{patient.khmer} · {patient.age}{patient.sex === "Female" ? "F" : "M"}</div>
            <div className="text-[10.5px] text-ink-3 font-mono ml-auto">MRN {patient.mrn}</div>
          </div>
        </div>

        {/* Diagnoses · ICD-10 — auto-attached from the patient's active
            problem list. Required by Cambodia MoH on every Dx prescription. */}
        <div className="mb-4">
          <div className="text-[9.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1.5">Diagnoses · ICD-10</div>
          <ul className="space-y-1">
            {diagnoses.map(d => (
              <li key={d.code} className="flex items-baseline gap-2 text-[11.5px] leading-snug">
                <span className="font-mono text-[10.5px] text-plum bg-line-2 px-1.5 py-0.5 rounded shrink-0">{d.code}</span>
                <span className="text-ink-2">{d.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Clinical indication */}
        <div className="mb-5 rounded-md border border-line-2 bg-surface-2/50 px-4 py-3">
          <div className="text-[9.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1">Clinical indication</div>
          <div className="text-[12px] text-ink-2">{indication}</div>
        </div>

        {/* Tests prescribed */}
        <div className="mb-6">
          <div className="text-[9.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-2">Tests prescribed</div>
          <table className="w-full text-[11.5px]">
            <thead>
              <tr className="border-b border-ink/15 text-[9.5px] uppercase tracking-wider text-ink-3 font-semibold">
                <th className="text-left py-1.5 w-8">#</th>
                <th className="text-left py-1.5">Test</th>
                <th className="text-left py-1.5">Code</th>
                <th className="text-left py-1.5">Sample</th>
                <th className="text-left py-1.5">Prep</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t, i) => (
                <tr key={t.code} className="border-b border-line-2">
                  <td className="py-2 font-mono text-ink-3">{i + 1}.</td>
                  <td className="py-2 font-medium text-ink">{t.name}</td>
                  <td className="py-2 font-mono text-ink-2">{t.code}</td>
                  <td className="py-2 text-ink-2">{t.sample}</td>
                  <td className="py-2 text-ink-2">{t.prep}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Instructions */}
        <div className="text-[10.5px] text-ink-3 leading-snug mb-8">
          Present this prescription with valid ID at any Kura partner collection point (PSC) or partner laboratory in the Kingdom of Cambodia. The tests above are clinically indicated and authorized by the prescribing physician below. Reimbursement may apply depending on insurance coverage. Results will be returned to the prescribing physician.
        </div>

        {/* Signature — full e-signature at 'done' tier; license-only stamp at
            'verified' (signature image not yet uploaded). */}
        <div className="grid grid-cols-2 gap-8 items-end pt-4 border-t border-line-2">
          <div>
            <div className="text-[9.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-2">Authentication</div>
            <div className="text-[10.5px] text-ink-2 leading-snug">
              {tier === "done"
                ? <>This document was electronically signed under <span className="font-mono">eSign-MoH/CB-2024</span> and stamped with the doctor's verified license. Verify authenticity at <span className="font-mono text-jade-2">kura.med/verify/{code}</span>.</>
                : <>License verified by MoH-CB · <span className="font-medium text-amber">signature image not yet on file</span>. The document is legally valid because of the license stamp; the doctor can add a wet-ink or e-signature later. Verify at <span className="font-mono text-jade-2">kura.med/verify/{code}</span>.</>
              }
            </div>
          </div>
          <div className="text-right">
            {tier === "done" ? (
              <div className="font-display italic text-[28px] text-jade leading-none mb-1 select-none" style={{ fontFamily: "Fraunces, serif", transform: "rotate(-2deg)" }}>
                Sopheak Chann
              </div>
            ) : (
              <div className="h-[40px] mb-1 flex items-end justify-end">
                <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-amber bg-amber-soft border border-amber/40 px-2 py-1 rounded">
                  <Lock size={11} /> Signature not on file
                </div>
              </div>
            )}
            <div className="h-px bg-ink/40 mb-1.5" />
            <div className="text-[11px] font-medium text-ink leading-tight">{doctor.name}</div>
            <div className="text-[10px] text-ink-3 font-mono">{doctor.license}</div>
            <div className={`inline-flex items-center gap-1 mt-1.5 text-[9.5px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
              tier === "done" ? "text-jade-2 bg-jade-soft" : "text-amber bg-amber-soft"
            }`}>
              {tier === "done" ? <><ShieldCheck size={10} /> e-signed · {today}</> : <><ShieldCheck size={10} /> License-stamped · {today}</>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-3 border-t border-line-2 flex items-center justify-between text-[9.5px] text-ink-3">
          <span>Kura Health Cambodia · Page 1 of 1</span>
          <span className="font-mono">Document ID: kura-rx-{code}-001</span>
        </div>
      </div>
    </div>
  );
}

/* Patient-facing medication prescription — opens at ?rx=<code>. Mirrors the
   diagnostic prescription page (PrescriptionPage) but for prescribed meds:
   the patient walks into any pharmacy with this PDF and the pharmacist fills
   the items. Reads the prescribed list from localStorage["kura.rx.<code>"]
   so the prescribing tab can pass the actual meds across without exposing
   them in the URL bar. */
function RxPrescriptionPage({ code }) {
  const [tier] = useDoctorTier();
  if (tier === "explorer") return <PrescriptionGate code={code} kind="Rx" />;

  const today = "9 May 2026";
  const doctor = {
    name: "Dr. Sopheak Chann",
    title: "Médecin Généraliste · General Practitioner",
    license: "MoH-CB / MPC-2014-3287",
    cabinet: "Cabinet Médical Chann · BKK1",
    address: "12 St. 308, Boeung Keng Kang 1, Phnom Penh",
    phone: "+855 23 222 4471",
    email: "dr.sopheak@kura.med",
  };
  const patient = { name: "Sokha Chann", khmer: "ឆាន សុខា", age: 54, sex: "Female", mrn: "P-9134", weight: "82.4 kg", allergies: "NKDA" };

  // Fallback demo items so opening the URL directly still renders something
  // believable. The prescribing tab writes the real payload before opening.
  const payload = useMemo(() => {
    try {
      const raw = localStorage.getItem(`kura.rx.${code}`);
      if (raw) return JSON.parse(raw);
    } catch { /* localStorage unavailable / parse error → fallback */ }
    return {
      issuedAt: Date.now(),
      items: [
        { drug: "Empagliflozin", strength: "10 mg", freq: "OD", class: "SGLT2i", notes: "" },
        { drug: "Lisinopril",    strength: "10 mg", freq: "OD", class: "ACE inhibitor", notes: "" },
        { drug: "Atorvastatin",  strength: "40 mg", freq: "OD", class: "High-intensity statin", notes: "Take at bedtime." },
      ],
    };
  }, [code]);

  // Standard sig templates by frequency — what the pharmacist reads off the
  // label when dispensing. Defensive: if the freq is unknown, fall back to OD.
  const sigFor = (freq) => ({
    OD:  "Take 1 tablet by mouth once daily",
    BID: "Take 1 tablet by mouth twice daily",
    TID: "Take 1 tablet by mouth three times daily",
    QID: "Take 1 tablet by mouth four times daily",
    PRN: "Take 1 tablet by mouth as needed",
  })[freq] || "Take 1 tablet by mouth once daily";

  // Quantity = days supply × doses per day. Defaults to 90 days supply per item.
  const dosesPerDay = (freq) => ({ OD: 1, BID: 2, TID: 3, QID: 4, PRN: 1 })[freq] || 1;
  const daysSupply  = 90;
  const qtyFor = (freq) => `${daysSupply * dosesPerDay(freq)} tablets`;

  return (
    <div className="min-h-screen bg-line-2 font-sans py-8 px-4 print:bg-white print:py-0 print:px-0">
      {/* Toolbar — hidden on print */}
      <div className="max-w-[820px] mx-auto mb-4 flex items-center justify-between print:hidden">
        <div className="text-[12.5px] text-ink-2">
          <span className="text-ink-3">Medication prescription · </span>
          <span className="font-mono">{code}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.close()}
            className="text-[11.5px] px-3 py-1.5 rounded-md border border-line bg-surface text-ink-2 hover:border-ink"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="text-[12px] px-3 py-1.5 rounded-md bg-jade text-white font-medium hover:opacity-90 inline-flex items-center gap-1.5"
          >
            <Printer size={12} /> Download · Print to PDF
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="max-w-[820px] mx-auto bg-surface border border-line rounded-sm shadow-md p-12 print:shadow-none print:border-0 print:p-10">
        {/* Letterhead */}
        <div className="flex items-start justify-between gap-6 pb-5 border-b border-ink/15">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-md bg-jade text-white flex items-center justify-center">
              <Stethoscope size={22} />
            </div>
            <div>
              <div className="font-display text-[20px] font-medium leading-tight">{doctor.name}</div>
              <div className="text-[11.5px] text-ink-2">{doctor.title}</div>
              <div className="text-[10.5px] text-ink-3 font-mono mt-0.5">License {doctor.license}</div>
            </div>
          </div>
          <div className="text-right text-[10.5px] text-ink-3 leading-snug">
            <div className="text-[11.5px] text-ink-2 font-medium">{doctor.cabinet}</div>
            <div>{doctor.address}</div>
            <div className="font-mono">{doctor.phone}</div>
            <div className="font-mono">{doctor.email}</div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-6">
          <div className="text-[10px] uppercase tracking-[0.3em] text-ink-3 font-semibold mb-1">Prescription · Ordonnance</div>
          <h1 className="font-display text-[24px] font-medium leading-none">Medication Order</h1>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-3 gap-4 text-[11.5px] text-ink-2 mb-5 pb-5 border-b border-line-2">
          <div>
            <div className="text-[9.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-0.5">Prescribed on</div>
            <div className="font-medium">{today}</div>
          </div>
          <div>
            <div className="text-[9.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-0.5">Rx ref</div>
            <div className="font-mono">{code}</div>
          </div>
          <div>
            <div className="text-[9.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-0.5">Validity</div>
            <div>30 days from date of issue</div>
          </div>
        </div>

        {/* Patient */}
        <div className="mb-5">
          <div className="text-[9.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1.5">Patient</div>
          <div className="flex items-baseline gap-4 flex-wrap">
            <div className="font-display text-[18px] font-medium">{patient.name}</div>
            <div className="text-[11.5px] text-ink-2">{patient.khmer} · {patient.age}{patient.sex === "Female" ? "F" : "M"}</div>
            <div className="text-[11.5px] text-ink-2">{patient.weight}</div>
            <div className="text-[10.5px] text-ink-3 font-mono ml-auto">MRN {patient.mrn}</div>
          </div>
          <div className="text-[10.5px] text-ink-3 mt-1">Allergies: <span className="font-mono text-ink-2">{patient.allergies}</span></div>
        </div>

        {/* Rx items */}
        <div className="mb-6">
          <div className="text-[9.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-2">℞ Items prescribed</div>
          <ol className="space-y-3">
            {payload.items.map((m, i) => (
              <li key={i} className="border border-line-2 rounded-md p-3">
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <div className="font-display text-[14.5px] font-medium leading-tight">
                    <span className="text-ink-3 font-mono text-[11.5px] mr-1.5">{i + 1}.</span>
                    {m.drug} <span className="font-mono text-[12px] text-ink-2">{m.strength}</span>
                  </div>
                  <div className="text-[10.5px] text-ink-3 font-mono">{m.class}</div>
                </div>
                <div className="grid grid-cols-4 gap-3 text-[10.5px] text-ink-2 mt-2 pt-2 border-t border-line-2/60">
                  <div>
                    <div className="text-[8.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-0.5">Route</div>
                    <div className="font-mono">PO</div>
                  </div>
                  <div>
                    <div className="text-[8.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-0.5">Frequency</div>
                    <div className="font-mono">{m.freq}</div>
                  </div>
                  <div>
                    <div className="text-[8.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-0.5">Quantity</div>
                    <div className="font-mono">{qtyFor(m.freq)}</div>
                  </div>
                  <div>
                    <div className="text-[8.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-0.5">Refills</div>
                    <div className="font-mono">0</div>
                  </div>
                </div>
                <div className="text-[11px] text-ink-2 mt-2 pt-2 border-t border-line-2/60 leading-snug">
                  <span className="text-[8.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mr-1">Sig</span>
                  {sigFor(m.freq)}{m.notes ? ` · ${m.notes}` : ""}
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Pharmacist notes */}
        <div className="mb-6 rounded-md border border-line-2 bg-surface-2/40 p-3 text-[10.5px] text-ink-2 leading-snug">
          <div className="text-[9.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1">Notes to pharmacist</div>
          <div>
            Substitute generics where bioequivalent. Patient is a known T2DM with eGFR borderline — review renal dose adjustments. Counsel on lifestyle: Mediterranean diet, ≥150 min/week moderate aerobic activity. Schedule follow-up in 90 days.
          </div>
        </div>

        {/* Signature */}
        <div className="mt-8 pt-5 border-t border-line-2 flex items-end justify-between gap-6">
          <div>
            <div className="text-[9.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-3">Electronically signed by</div>
            <div className="font-display italic text-[20px] text-ink mb-1 leading-none">{doctor.name.replace(/^Dr\.\s+/, "")}</div>
            <div className="text-[10.5px] text-ink-2">{doctor.name}, MD</div>
            <div className="text-[10px] text-ink-3 font-mono">License {doctor.license} · {today}</div>
          </div>
          <div className="w-20 h-20 rounded-full border-2 border-jade text-jade-2 flex flex-col items-center justify-center text-center shrink-0">
            <Stethoscope size={20} />
            <div className="text-[7.5px] uppercase tracking-wider font-semibold leading-none mt-0.5">MoH<br/>verified</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-3 border-t border-line-2 flex items-center justify-between text-[9.5px] text-ink-3">
          <span>Kura Health Cambodia · Page 1 of 1</span>
          <span className="font-mono">Document ID: kura-rx-{code}-001</span>
        </div>
      </div>
    </div>
  );
}

/* Open the patient-facing mobile booking page in a small phone-sized window.
   This mimics what a Cambodian patient sees on their Android after the booking
   code arrives via Telegram. 430×932 ≈ iPhone 14 Pro / mid-tier Android. */
function openMobileBooking(code) {
  if (!code) return;
  const url = new URL(window.location.href);
  url.search = `?bookingDemo=${encodeURIComponent(code)}`;
  url.hash = "";
  window.open(
    url.toString(),
    `kura-booking-${code}`,
    "width=430,height=932,noopener,resizable=yes,scrollbars=yes"
  );
}

/* Open a patient chart in a new tab via localStorage bridge. The fresh tab
   reads the payload on mount and lands on the patient's chart. Bookings and
   pickups intentionally have no detail page — both surface inline. */
function openEntityInNewTab(kind, entity) {
  if (kind !== "patient" || !entity) return;
  try { localStorage.setItem("kura.openPatient", JSON.stringify(entity)); } catch { /* ignore */ }
  window.open(window.location.href, "_blank", "noopener");
}

const TODAY = "Saturday, 9 May 2026";

const todaySignals = [
  {
    kind: "results",
    icon: <Sparkles size={16} />,
    accent: "jade",
    label: "5 new results",
    sub: "3 within range · 2 flagged",
    detail: "Sokha C., Bora P. flagged",
  },
  {
    kind: "off-target",
    icon: <Activity size={16} />,
    accent: "amber",
    label: "8 patients off-target",
    sub: "HbA1c, LDL trending up",
    detail: "Diabetic & lipid cohorts",
  },
  {
    kind: "pickup",
    icon: <Motorbike size={16} />,
    accent: "terracotta",
    label: "Pickup at 16:40",
    sub: "8 tubes queued for courier",
    detail: "Sopheap T. · KH-3401",
  },
  {
    kind: "claims",
    icon: <CreditCard size={16} />,
    accent: "plum",
    label: "2 claim updates",
    sub: "1 paid · 1 needs info",
    detail: "Forte EmCare",
  },
  {
    kind: "follow-ups",
    icon: <Calendar size={16} />,
    accent: "ink",
    label: "12 due for follow-up",
    sub: "Care plan cadence",
    detail: "Schedule labs",
  },
  {
    kind: "referrals",
    icon: <Send size={16} />,
    accent: "plum",
    label: "2 referrals incoming",
    sub: "From Dr. Lim · Dr. Kosal",
    detail: "Accept and book",
    cta: true,
    ctaLabel: "Open referrals",
  },
];

const patients = [
  {
    id: "P-9134",
    name: "Sokha Chann",
    khmer: "ឆាន សុខា",
    age: 54, sex: "M",
    tags: ["off-target", "T2DM"],
    lastSeen: "12 days ago",
    bridge: "T1",
    insurance: "Forte",
    flag: "critical",
    flagText: "HbA1c 9.4% · trending up 2 quarters",
    summary: "T2DM 6y, on metformin + gliclazide. LDL elevated. Adherence concerns.",
    nextStep: "Add SGLT2i; repeat HbA1c in 90d",
    trend: [
      { q: "Q1·25", v: 7.8 }, { q: "Q2·25", v: 8.1 }, { q: "Q3·25", v: 8.4 },
      { q: "Q4·25", v: 8.9 }, { q: "Q1·26", v: 9.4 },
    ],
    metric: "HbA1c (%)",
    target: 7.0,
    flowsheet: [
      { label: "HbA1c", value: "9.4 %", ref: "≤ 7.0", flag: "high" },
      { label: "Fasting glucose", value: "148 mg/dL", ref: "70–100", flag: "high" },
      { label: "LDL-C", value: "162 mg/dL", ref: "< 100", flag: "high" },
      { label: "HDL-C", value: "38 mg/dL", ref: "> 40", flag: "low" },
      { label: "Triglycerides", value: "210 mg/dL", ref: "< 150", flag: "high" },
      { label: "Creatinine", value: "0.94 mg/dL", ref: "0.7–1.2", flag: "ok" },
      { label: "eGFR", value: "92", ref: "> 60", flag: "ok" },
      { label: "ALT", value: "44 U/L", ref: "< 40", flag: "high" },
    ],
    plan: {
      title: "T2DM follow-up — quarterly",
      items: [
        { label: "HbA1c + lipid panel + LFT", due: "in 12 weeks", kind: "lab" },
        { label: "Metformin 1000mg BID", due: "ongoing", kind: "rx" },
        { label: "Gliclazide MR 60mg OD", due: "ongoing", kind: "rx" },
        { label: "Add SGLT2i — empagliflozin 10mg", due: "start now", kind: "rx-new" },
        { label: "Telehealth review", due: "in 4 weeks", kind: "tele" },
      ],
    },
  },
  {
    id: "P-8821",
    name: "Bora Pich",
    khmer: "ពេជ្រ បូរ៉ា",
    age: 47, sex: "F",
    tags: ["off-target", "lipids"],
    lastSeen: "5 days ago",
    bridge: "T1",
    insurance: "Forte",
    flag: "warning",
    flagText: "LDL 178 — uptrending despite statin",
    summary: "FH suspected. Atorva 20mg, partial response.",
    nextStep: "Up-titrate; consider lipoprotein(a)",
    trend: [
      { q: "Q1·25", v: 165 }, { q: "Q2·25", v: 158 }, { q: "Q3·25", v: 162 },
      { q: "Q4·25", v: 170 }, { q: "Q1·26", v: 178 },
    ],
    metric: "LDL-C (mg/dL)", target: 100,
  },
  {
    id: "P-9402",
    name: "Sreypov Lim",
    khmer: "លឹម ស្រីពៅ",
    age: 31, sex: "F",
    tags: ["new-result"],
    lastSeen: "today",
    bridge: "T1",
    insurance: "Self-pay",
    flag: "ok",
    flagText: "All within range",
    summary: "Annual screen. Healthy. Booked through your directory profile.",
    nextStep: "Routine 12-month follow-up",
    metric: "—", target: 0,
  },
  {
    id: "P-7715",
    name: "Vibol Heng",
    khmer: "ហេង វិបុល",
    age: 62, sex: "M",
    tags: ["overdue", "HTN", "T2DM"],
    lastSeen: "94 days ago",
    bridge: "T1",
    insurance: "National SS",
    flag: "warning",
    flagText: "Overdue for HbA1c by 4 weeks",
    summary: "HTN + T2DM. Last A1c 7.6.",
    nextStep: "Recall for labs; verify NSS coverage",
    metric: "—", target: 0,
  },
  {
    id: "P-8104",
    name: "Sokunthea Ouk",
    khmer: "អ៊ូក សុគន្ធា",
    age: 38, sex: "F",
    tags: ["unreliable"],
    lastSeen: "210 days ago",
    bridge: "T2",
    insurance: "Forte",
    flag: "muted",
    flagText: "Identity match low confidence",
    summary: "Bridged via napkin intake. Phone unreachable last 2 attempts.",
    nextStep: "Verify identity at next visit",
    metric: "—", target: 0,
  },
  {
    id: "P-9012",
    name: "Chanthou Sok",
    khmer: "សុខ ច័ន្ទថូ",
    age: 29, sex: "F",
    tags: ["no-show"],
    lastSeen: "31 days ago",
    bridge: "T1",
    insurance: "Self-pay",
    flag: "muted",
    flagText: "Missed last 2 HBC bookings",
    summary: "Anemia workup pending. Lives in Toul Kork.",
    nextStep: "Offer phlebotomist dispatch",
    metric: "—", target: 0,
  },
  {
    id: "P-4421",
    name: "Channary Sok",
    khmer: "សុខ ច័ន្ទណារី",
    age: 47, sex: "F",
    tags: ["new-result"],
    lastSeen: "2 hours ago",
    bridge: "T1",
    insurance: "Forte",
    flag: "warning",
    flagText: "TSH 0.01 — severely suppressed (reflex pending)",
    summary: "Routine thyroid panel returned with severely suppressed TSH. Reflex FT3 + FT4 staged on the held sample.",
    nextStep: "Approve reflex panel · payment via Telegram",
    metric: "TSH (mIU/L)",
    target: 4.5,
    trend: [
      { q: "Q3·24", v: 2.1 }, { q: "Q1·25", v: 1.4 }, { q: "Q2·25", v: 0.6 }, { q: "Q4·25", v: 0.18 }, { q: "Q1·26", v: 0.01 },
    ],
    flowsheet: [
      { label: "TSH",  value: "0.01 mIU/L", ref: "0.5–4.5", flag: "high" },
      { label: "BP",   value: "118/74",     ref: "< 130/80", flag: "ok" },
      { label: "Heart rate", value: "98 bpm", ref: "60–100",  flag: "ok" },
      { label: "Weight", value: "56.2 kg",  ref: "—",       flag: "ok" },
    ],
    plan: {
      title: "Thyroid workup",
      items: [
        { label: "Reflex FT3 + FT4 (sample on hold)", due: "today", kind: "lab" },
        { label: "Endocrinology referral if reflex confirms", due: "after reflex", kind: "refer" },
      ],
    },
  },
];

const filterChips = [
  { id: "all", label: "All", count: 184 },
  { id: "off-target", label: "Off-target", count: 8, accent: "amber" },
  { id: "overdue", label: "Overdue", count: 14, accent: "amber" },
  { id: "unreliable", label: "Unreliable", count: 6, accent: "ink-3" },
  { id: "no-show", label: "No-show", count: 4, accent: "ink-3" },
];

/* ---------- Top-level App ---------- */
export default function App() {
  // Patient-facing mobile booking preview — when the URL has ?bookingDemo=XYZ
  // we short-circuit the whole app and render the phone-sized booking page only.
  // This lets the doctor right-click "open mobile preview" and see what the
  // patient actually receives without ever leaving the prototype.
  const bookingDemoCode = useMemo(() => {
    try { return new URL(window.location.href).searchParams.get("bookingDemo"); }
    catch { return null; }
  }, []);
  const prescriptionCode = useMemo(() => {
    try { return new URL(window.location.href).searchParams.get("prescription"); }
    catch { return null; }
  }, []);
  const rxCode = useMemo(() => {
    try { return new URL(window.location.href).searchParams.get("rx"); }
    catch { return null; }
  }, []);
  if (prescriptionCode) {
    return (
      <>
        <Theme />
        <PrescriptionPage code={prescriptionCode} />
      </>
    );
  }
  if (rxCode) {
    return (
      <>
        <Theme />
        <RxPrescriptionPage code={rxCode} />
      </>
    );
  }
  if (bookingDemoCode) {
    return (
      <>
        <Theme />
        <MobileBookingPage code={bookingDemoCode} />
      </>
    );
  }

  // Session / workspace / KYC. Hook runs every render so order stays stable;
  // the actual gate happens just before the main return below.
  const auth = useAuth();

  const [nav, setNav] = useState("patients");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("P-9134");
  const [patientDetailMode, setPatientDetailMode] = useState(false);
  const [chip, setChip] = useState("all");
  const [showProfile, setShowProfile] = useState(false);
  const [orderPrefill, setOrderPrefill] = useState(null); // { patientId, step, key } when Quick order is invoked
  const [showNewPatient, setShowNewPatient] = useState(false);
  // Booking detail page (/booking/:id) is intentionally killed — bookings live
  // inline only. The Edit pencil opens a focused modal; the cancel/resend are
  // confirm-modal flows; everything else (results, history) is inline.
  // Pickup detail page also killed — courier status surfaces inline in the
  // Bookings ETA column ("Rider arriving · Sok S.") and there's no separate
  // Pickups tab. Sub-detail isn't a destination worth navigating to.
  const [toast, setToast] = useState(null); // { id, message, sub, kind }

  const showToast = (message, opts = {}) => {
    const id = Date.now();
    setToast({ id, message, sub: opts.sub, kind: opts.kind ?? "success" });
    setTimeout(() => setToast(t => (t?.id === id ? null : t)), 4500);
  };

  const [showEkyc, setShowEkyc] = useState(false);
  // Auto-popup on landing for Explorer-tier users — stakes the verification
  // gate in their face the moment they enter the app. Dismissal is in-memory
  // only: a fresh page load re-prompts (matches Doctolib's behavior). The
  // tier check is in the render guard so this only fires once auth settles.
  const [showEkycLanding, setShowEkycLanding] = useState(true);

  // Cross-tab bridge — opens a patient chart in a new tab. (Booking and
  // pickup detail pages no longer exist — both surface inline.)
  useEffect(() => {
    try {
      const rawPt = localStorage.getItem("kura.openPatient");
      if (rawPt) {
        localStorage.removeItem("kura.openPatient");
        const patient = JSON.parse(rawPt);
        if (patient && patient.id) {
          setSelectedPatientId(patient.id);
          setPatientDetailMode(true);
          setNav("patients");
        }
      }
    } catch { /* ignore */ }
  }, []);

  const handleOrderPlaced = (order) => {
    // Toast only — keep the doctor in patient context. The QuickOrderPanel
    // shows route-specific success state inline. Doctor can navigate to
    // Orders later if they want to drill into the detail view.
    showToast(`Order placed for ${order.patient}`, { sub: `${order.id} · ${order.tests.length} test${order.tests.length === 1 ? "" : "s"} · $${order.total.toFixed(2)}` });
  };

  // At Explorer tier the doctor sees only one demo patient — Sokha — so the
  // app feels populated enough to explore but no real PHI is exposed and the
  // verification gate has teeth.
  const [tier, setTier] = useDoctorTier();
  // Tier mirrors auth state across three levels:
  //   T0 explorer — no KYC. Browsing mode only.
  //   T2 verified — KYC verified, no bank/signature. Real orders + Dx work,
  //                 but insurance billing is locked.
  //   T3 done     — KYC verified + billing on file. Full access.
  useEffect(() => {
    if (auth.kyc?.status === "verified") {
      setTier(auth.billing?.enabled ? "done" : "verified");
    } else {
      setTier("explorer");
    }
    // setTier is a stable module-level setter; safe to omit from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.kyc?.status, auth.billing?.enabled]);

  // Wire the module-level verification trigger so deeply-nested
  // ExplorerEmptyState components can launch the eKYC modal without prop
  // drilling. Registered for the lifetime of App.
  useEffect(() => {
    _startVerificationCallback = () => setShowEkyc(true);
    return () => { _startVerificationCallback = null; };
  }, []);
  const effectivePatients = useMemo(
    () => isPierreAccount(auth) ? patients : patients.filter(p => p.id === "P-9134"),
    [auth?.session?.email]
  );
  const selectedPatient = effectivePatients.find(p => p.id === selectedPatientId) ?? effectivePatients[0];
  const visiblePatients = useMemo(() => {
    if (chip === "all") return effectivePatients;
    return effectivePatients.filter(p => p.tags.includes(chip));
  }, [chip, effectivePatients]);

  // Reset detail mode when navigating away
  const handleSetNav = (newNav) => {
    setPatientDetailMode(false);
    // Clicking a top-level nav item always returns to that section's default
    // list view — never lands on a sub-detail that was open before.
    setNav(newNav);
  };

  // Open a patient's chart from anywhere — sets the id, switches to detail mode,
  // and navigates to the Patients view so the chart actually renders.
  const openPatientChart = (id) => {
    setSelectedPatientId(id);
    setPatientDetailMode(true);
    setNav("patients");
  };

  // Quick order: jump from patient context into the Orders flow at Step 2
  const handleQuickOrder = (patientId) => {
    setOrderPrefill({ patientId, step: 2, key: Date.now() });
    setPatientDetailMode(false);
    setNav("orders");
  };

  // Onboarding tours — Doctolib-style: a welcome chooser, spotlight tours,
  // and a bottom-right "First steps" reentry widget. Defers to the eKYC
  // landing prompt: while that's up, the choice modal stays suspended.
  const onboardingActive = !!auth.session && !(tier === "explorer" && showEkycLanding && !showEkyc);
  const onboarding = useOnboarding({
    enabled: onboardingActive,
    onNavigate: handleSetNav,
    onAction: (action) => {
      if (action === "open-sokha-chart") {
        setSelectedPatientId("P-9134");
        setPatientDetailMode(true);
        setNav("patients");
      } else if (action === "verify") {
        setShowEkyc(true);
      }
    },
  });

  // Auth gate: only the magic link gates entry. Workspace is auto-seeded on
  // sign-in (browser defaults) and KYC is deferred — new users land in the
  // app as Explorers and complete verification later via the in-app banner.
  if (!auth.session) {
    return (
      <>
        <Theme />
        <LoginPage onSignIn={auth.signIn} />
      </>
    );
  }

  return (
    <div className="min-h-screen grain bg-bg relative">
      <Theme />

      <TopBar onOrderLabs={() => handleSetNav("orders-legacy")} />

      <div className="flex relative z-10" style={{ minHeight: "calc(100vh - 56px)" }}>
        <SideNav nav={nav} setNav={handleSetNav} collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed(c => !c)} auth={auth} onStartVerification={() => setShowEkyc(true)} />

        <main className="flex-1 min-w-0">
          <ExplorerBanner onStartVerification={() => setShowEkyc(true)} />
          {nav === "inbox" && (
            <PatientsView
              patients={visiblePatients}
              chip={chip} setChip={setChip}
              selected={selectedPatient}
              onSelectPatient={setSelectedPatientId}
              detailMode={patientDetailMode}
              onOpenDetail={() => setPatientDetailMode(true)}
              onCloseDetail={() => setPatientDetailMode(false)}
              onQuickOrder={handleQuickOrder}
              onOrderPlaced={handleOrderPlaced}
              userFullName={auth.kyc?.fullName}
            />
          )}
          {nav === "patients" && (
            <PatientsListView
              patients={effectivePatients}
              detailMode={patientDetailMode}
              selected={selectedPatient}
              onOpenChart={openPatientChart}
              onCloseDetail={() => setPatientDetailMode(false)}
              onQuickOrder={handleQuickOrder}
              onNewPatient={() => setShowNewPatient(true)}
              onOrderPlaced={handleOrderPlaced}
            />
          )}
          {nav === "orders" && (
            <OrdersListView onNewOrder={() => handleSetNav("orders-legacy")} onStartVerification={() => setShowEkyc(true)} onToast={showToast} />
          )}
          {nav === "orders-legacy" && <OrdersView prefill={orderPrefill} />}
          {nav === "referrals" && <ReferralsView onToast={showToast} />}
          {nav === "supplies" && <SuppliesSoonView />}
          {nav === "dispensary" && <DispensaryView />}
          {nav === "tasks" && <TasksView />}
          {nav === "calendar" && <CalendarView />}
          {nav === "catalog" && <LabCatalogView onOpenPatientChart={openPatientChart} onStartVerification={() => setShowEkyc(true)} />}
          {nav === "telehealth" && <TelehealthView />}
          {nav === "careplans" && <CarePlansView />}
          {nav === "pharma" && <PharmaCallsView />}
          {nav === "performance" && <PerformanceView />}
          {nav === "members" && <MembersView />}
          {nav === "directory" && <DirectoryView />}
          {nav === "signing" && (
            <SigningSettingsView
              workspace={auth.workspace}
              doctor={{
                name: auth.kyc?.fullName ?? "Dr. Sopheak Chann",
                license: auth.kyc?.license ?? "KH-MoH-04471",
                country: auth.workspace?.country ?? "KH",
              }}
            />
          )}
          {nav === "billing" && <BillingView />}
        </main>
      </div>

      {showProfile && <ProfileSheet onClose={() => setShowProfile(false)} />}
      {showNewPatient && (
        <NewPatientModal
          onClose={() => setShowNewPatient(false)}
          onConfirmPatient={(kid, name) => {
            // Prototype: route to Sokha's chart since the demo registry's
            // entries aren't full patient records. Real impl would resolve kid → patient row.
            const masked = name?.split(" ").map(w => w.length <= 2 ? w : w[0] + "•".repeat(w.length - 2) + w[w.length - 1]).join(" ");
            showToast(`Patient added to your panel`, { sub: `${masked ?? kid} · opening chart…` });
            setSelectedPatientId("P-9134");
            setPatientDetailMode(true);
            setNav("patients");
          }}
        />
      )}
      {tier === "explorer" && showEkycLanding && !showEkyc && (
        <EkycLandingPrompt
          onClose={() => setShowEkycLanding(false)}
          onStart={() => { setShowEkycLanding(false); setShowEkyc(true); }}
        />
      )}
      {showEkyc && <EkycFlowModal onClose={() => setShowEkyc(false)} onComplete={() => { auth.completeKyc({ status: "verified", verifiedViaInAppEkyc: true }); setShowEkyc(false); showToast("Welcome aboard, Dr. Sopheak", { sub: "You're now a Verified clinician — real orders and Dx prescriptions are unlocked." }); }} />}

      {/* Doctolib-style onboarding: welcome chooser, spotlight tour, first-steps widget */}
      {onboarding.choiceOpen && !showEkyc && !showEkycLanding && (
        <OnboardingChoiceModal
          onClose={onboarding.closeChoice}
          onStart={onboarding.startTour}
          onAction={(name) => {
            if (name === "verify") {
              onboarding.closeChoice();
              setShowEkyc(true);
            }
          }}
          completed={[
            ...onboarding.completed,
            // The verify entry is an action, not a tour — mark it done when
            // KYC has actually cleared so the row gets the "Done" pill.
            ...(auth.kyc?.status === "verified" ? ["verify"] : []),
          ]}
          userFullName={auth.kyc?.fullName}
        />
      )}
      {onboarding.activeTour && (
        <TourSpotlight
          tour={onboarding.activeTour}
          stepIndex={onboarding.stepIndex}
          onNext={onboarding.nextStep}
          onPrev={onboarding.prevStep}
          onSkip={onboarding.skipTour}
        />
      )}
      {onboardingActive && !onboarding.activeTour && !onboarding.choiceOpen && !showEkyc && !showEkycLanding && (
        <FirstStepsWidget
          completed={onboarding.completed.length}
          total={TOURS.length}
          onOpen={onboarding.openChoice}
        />
      )}

      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  const isSuccess = toast.kind === "success";
  const Icon = isSuccess ? CheckCircle2 : Bell;
  return (
    <div className="fixed bottom-6 right-6 z-50 toast-pop">
      <div className={`flex max-w-sm items-start gap-3 rounded-[var(--radius-lg)] border bg-[var(--surface)] py-2.5 pl-3 pr-2 shadow-[var(--shadow-lg)] ${
        isSuccess ? "border-[var(--success-500)]" : "border-[var(--border)]"
      }`}>
        <Icon size={16} className={`mt-0.5 shrink-0 ${isSuccess ? "text-[var(--success-600)]" : "text-[var(--ink-600)]"}`} />
        <div className="min-w-0 flex-1">
          <div className="text-k-body font-medium leading-tight text-[var(--ink-900)]">{toast.message}</div>
          {toast.sub && (
            <div className="mt-0.5 truncate font-mono text-k-2xs text-[var(--ink-500)]">{toast.sub}</div>
          )}
        </div>
        <Button variant="ghost" size="icon-xs" onClick={onDismiss} aria-label="Dismiss" className="-mr-0.5 shrink-0">
          <X size={14} />
        </Button>
      </div>
    </div>
  );
}

/* ---------- Top bar ---------- */
function TopBar({ onOrderLabs }) {
  return (
    <AppHeader
      leading={
        <div className="flex w-60 shrink-0 items-center gap-2.5">
          <IconBadge tone="brand" size="md" className="size-7 rounded-[var(--radius-sm)] [&>svg]:size-[15px]">
            <Stethoscope size={15} />
          </IconBadge>
          <div className="leading-tight">
            <div className="text-[17px] font-semibold tracking-tight text-[var(--ink-900)]">Kura</div>
            <div className="-mt-0.5 text-k-overline uppercase tracking-k-caps text-[var(--ink-500)]">For doctors</div>
          </div>
        </div>
      }
      center={
        <div className="relative w-full max-w-2xl">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-500)]" />
          <input
            type="text"
            placeholder="Search patients, orders, tests, care plans…"
            className="h-9 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)] pl-9 pr-20 text-sm placeholder:text-[var(--ink-500)] focus:border-[var(--border-focus)] focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <Kbd className="absolute right-3 top-1/2 -translate-y-1/2">⌘K</Kbd>
        </div>
      }
      right={
        <>
          <Button data-tour="topbar-order-labs" onClick={onOrderLabs} size="sm">
            <Plus size={14} /> New order
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Notifications" className="relative">
            <Bell size={17} />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[var(--danger-500)] pulse-dot" />
          </Button>
        </>
      }
    />
  );
}

/* ---------- Side nav ---------- */
function SideNav({ nav, setNav, collapsed, onToggleCollapsed, auth, onStartVerification }) {
  const isPierre = isPierreAccount(auth);
  const [tier] = useDoctorTier();
  const isExplorer = tier === "explorer";
  const [moreOpen, setMoreOpen] = useState(false);

  // Primary nav: daily destinations only
  const primary = [
    { id: "patients", label: "Patients",  icon: Users,      badge: isPierre ? "1.2k" : null },
    { id: "orders",   label: "Bookings",  icon: Calendar,   badge: isPierre ? "12"   : null },
    { id: "catalog",  label: "Lab tests", icon: TestTubes,  badge: null },
  ];

  // Secondary: kept discoverable but quieter. No per-row locks.
  // Auto-promote a tool to primary by moving it into `primary` above.
  const more = [
    { id: "inbox",       label: "Inbox",       icon: Inbox },
    { id: "calendar",    label: "Calendar",    icon: Calendar },
    { id: "tasks",       label: "Tasks",       icon: ListChecks },
    { id: "telehealth",  label: "Telehealth",  icon: Video },
    { id: "careplans",   label: "Care plans",  icon: ClipboardList },
    { id: "dispensary",  label: "Dispensary",  icon: Pill },
    { id: "supplies",    label: "Supplies",    icon: Package },
    { id: "pharma",      label: "Pharma calls",icon: Building2 },
    { id: "performance", label: "Dashboard",   icon: LayoutDashboard },
    { id: "billing",     label: "Billing",     icon: Banknote },
  ];

  return (
    <AppSidebar
      collapsed={collapsed}
      onCollapsedChange={onToggleCollapsed}
      className="sticky top-16 h-[calc(100vh-4rem)] self-start"
      footer={<UserMenuWidget auth={auth} onNavigate={setNav} collapsed={collapsed} />}
    >
      <ul className="space-y-0.5">
        {primary.map(it => (
          <li key={it.id} data-tour={`nav-${it.id}`}>
            <SidebarNavItem
              icon={<it.icon size={15} />}
              label={it.label}
              active={nav === it.id}
              onClick={() => setNav(it.id)}
              trailing={renderBadge(it, nav === it.id)}
            />
          </li>
        ))}
      </ul>

      {/* More tools — expandable secondary group. Quieter chrome than primary. */}
      {!collapsed && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setMoreOpen(o => !o)}
            aria-expanded={moreOpen}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-k-sm text-[var(--ink-600)] hover:text-[var(--ink-900)] hover:bg-[var(--surface-2)] transition"
          >
            <ChevronRight
              size={13}
              className={`transition-transform shrink-0 ${moreOpen ? "rotate-90" : ""}`}
            />
            <span className="flex-1">More tools</span>
            <span className="text-k-xs text-[var(--ink-500)] font-mono">{more.length}</span>
          </button>

          {moreOpen && (
            <div className="mt-1 pl-3">
              {isExplorer && (
                <button
                  type="button"
                  onClick={() => onStartVerification?.()}
                  className="mb-2 w-full text-left rounded-[var(--radius-sm)] bg-[var(--brand-50)] px-2.5 py-1.5 text-k-xs leading-snug text-[var(--brand-800)] hover:bg-[var(--brand-100)] transition"
                >
                  Verify your license to use all tools.
                </button>
              )}
              <ul className="space-y-0">
                {more.map(it => (
                  <li key={it.id} data-tour={`nav-${it.id}`}>
                    <button
                      type="button"
                      onClick={() => setNav(it.id)}
                      className={`group flex w-full items-center gap-2 px-2 py-1.5 rounded-md text-left text-k-sm transition ${
                        nav === it.id
                          ? "bg-[var(--brand-50)] text-[var(--brand-800)]"
                          : "text-[var(--ink-600)] hover:text-[var(--ink-900)] hover:bg-[var(--surface-2)]"
                      }`}
                    >
                      <it.icon size={13} className="shrink-0 opacity-80" />
                      <span className="flex-1 truncate">{it.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </AppSidebar>
  );
}

function renderBadge(item, active) {
  if (!item.badge) return null;
  return (
    <span className={`font-mono text-[10px] ${active ? "text-[var(--brand-700)]/70" : "text-[var(--ink-500)]"}`}>
      {item.badge}
    </span>
  );
}

/* Bottom-left user widget — avatar + name + menu. Opens a popup with the
   current workspace, settings shortcuts, language, help, and sign out. */
function UserMenuWidget({ auth, collapsed, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const ref = useRef(null);
  const go = (id) => { setOpen(false); onNavigate?.(id); };
  const openPrefs = () => { setOpen(false); setPrefsOpen(true); };

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  const email = auth?.session?.email ?? "";
  const fullName = auth?.kyc?.fullName;
  const displayName = fullName || (email ? email.split("@")[0] : "Account");
  const subtitle = auth?.workspace?.name ?? "—";
  const initials = ((fullName || email || "?")
    .replace(/^Dr\.?\s+/i, "")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join("")
    .toUpperCase()) || "?";

  const fadeClass = `sidenav-fade${collapsed ? " is-collapsed" : ""}`;

  return (
    <div className="relative border-t border-line shrink-0" ref={ref}>
      {/* Fixed-width inner wrapper clipped by the overflow-hidden aside. This
          matches the trick used by SideNav so the avatar sits in a stable
          column whether the rail is wide or narrow. */}
      <div className="py-2.5" style={{ width: 240 }}>
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center h-10 rounded-md hover:bg-surface-2 transition-colors px-2"
          title={collapsed ? `${displayName} · ${subtitle}` : undefined}
          aria-label="Account menu"
        >
          <span className="w-10 flex items-center justify-center shrink-0">
            <span className="w-8 h-8 rounded-md bg-jade text-white flex items-center justify-center text-[11.5px] font-semibold">
              {initials}
            </span>
          </span>
          <span className={`flex-1 flex items-center gap-2.5 min-w-0 pr-2 ${fadeClass}`}>
            <span className="flex-1 min-w-0 text-left">
              <span className="block text-[12.5px] font-medium text-ink truncate">{displayName}</span>
              <span className="block text-[10.5px] text-ink-3 truncate">{subtitle}</span>
            </span>
            <ChevronUp size={14} className={`text-ink-3 transition shrink-0 ${open ? "rotate-180" : ""}`} />
          </span>
        </button>
      </div>

      {open && (
        <div
          style={collapsed ? { position: "fixed", left: 64, bottom: 16, width: 260 } : undefined}
          className={`z-40 bg-surface border border-line rounded-lg shadow-[0_10px_24px_-12px_rgba(21,32,26,0.18)] overflow-hidden ${
            collapsed ? "" : "absolute left-2 right-2 bottom-[calc(100%-4px)]"
          }`}
        >
          <div className="px-3.5 pt-3 pb-2 text-[11px] text-ink-3 truncate">{email}</div>

          <div className="px-1.5 pb-1.5">
            <div className="px-2.5 py-2 rounded-md flex items-center gap-2.5 bg-surface-2/60">
              <div className="w-7 h-7 rounded-md bg-jade-soft text-jade-2 flex items-center justify-center shrink-0">
                <Building2 size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium text-ink truncate">{subtitle}</div>
                <div className="text-[10.5px] text-ink-3 truncate">
                  {auth?.workspace?.specialty ?? "—"}
                  {auth?.workspace?.country ? ` · ${auth.workspace.country}` : ""}
                </div>
              </div>
              <CheckCircle2 size={14} className="text-jade-2 shrink-0" />
            </div>
          </div>

          <div className="h-px bg-line" />
          <div className="py-1">
            <UserMenuRow icon={<Users size={13} />}              label="Members" onClick={() => go("members")} />
            <UserMenuRow icon={<Globe size={13} />}              label="Public profile" onClick={() => go("directory")} />
            <UserMenuRow icon={<ShieldCheck size={13} />}        label="Signature" onClick={() => go("signing")} />
            <UserMenuRow icon={<Banknote size={13} />}           label="Billing" onClick={() => go("billing")} />
            <UserMenuRow icon={<Send size={13} />}               label="Refer Kura" onClick={() => go("referrals")} />
          </div>
          <div className="h-px bg-line" />
          <div className="py-1">
            <UserMenuRow icon={<SlidersHorizontal size={13} />}  label="Preferences" onClick={openPrefs} />
            <UserMenuRow icon={<Settings size={13} />}           label="Account settings" />
            <UserMenuRow icon={<Building2 size={13} />}          label="Organization settings" />
            <UserMenuRow icon={<HelpCircle size={13} />}         label="Get help" />
          </div>
          <div className="h-px bg-line" />
          <div className="py-1">
            <UserMenuRow icon={<LogOut size={13} />} label="Sign out" onClick={auth?.signOut} />
          </div>
        </div>
      )}

      {prefsOpen && <PreferencesModal onClose={() => setPrefsOpen(false)} />}
    </div>
  );
}

function UserMenuRow({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-surface-2 transition text-left"
    >
      <span className="text-ink-3 shrink-0">{icon}</span>
      <span className="flex-1 text-[12.5px] text-ink">{label}</span>
    </button>
  );
}

/* ============================================================
   Preferences — per-user UI preferences saved on this device.
   Proto only: state persists but doesn't yet drive theme/unit
   formatting throughout the app. Surface kept compact so all
   choices are visible at a glance without scrolling.
   ============================================================ */
const PREFS_STORAGE_KEY = "kura.preferences.v1";
const DEFAULT_PREFS = { theme: "system", units: "US", language: "en" };

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return {
      theme: ["light", "dark", "system"].includes(parsed.theme) ? parsed.theme : DEFAULT_PREFS.theme,
      units: ["US", "SI"].includes(parsed.units) ? parsed.units : DEFAULT_PREFS.units,
      language: ["en", "km"].includes(parsed.language) ? parsed.language : DEFAULT_PREFS.language,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function PreferencesModal({ onClose }) {
  const [prefs, setPrefs] = useState(loadPrefs);

  const update = (patch) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    try { localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const themeOptions = [
    { id: "light",  label: "Light",  icon: Sun,     caption: "Always bright" },
    { id: "dark",   label: "Dark",   icon: Moon,    caption: "Always dim" },
    { id: "system", label: "System", icon: Monitor, caption: "Match device" },
  ];

  const unitOptions = [
    { id: "SI", label: "SI units",     caption: "mmol/L · µmol/L" },
    { id: "US", label: "Conventional", caption: "mg/dL · mEq/L" },
  ];

  const languageOptions = [
    { id: "en", label: "English",     caption: "Full UI translation" },
    { id: "km", label: "ភាសាខ្មែរ",       caption: "Khmer · partial · clinical terms stay in English" },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-bg border border-line rounded-xl shadow-xl w-full max-w-[540px] overflow-hidden">
        <div className="px-5 py-4 border-b border-line-2 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-jade-soft text-jade-2 flex items-center justify-center">
            <SlidersHorizontal size={15} />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-[15px] font-medium leading-tight">Preferences</h3>
            <div className="text-[10.5px] text-ink-3 uppercase tracking-[0.14em] font-semibold">Just for you · saved on this device</div>
          </div>
          <button onClick={onClose} className="text-ink-3 hover:text-ink" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5 max-h-[70vh] overflow-y-auto">
          <PrefSection title="Appearance" hint="Switch the interface to match your room — or let it follow your device.">
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map(opt => {
                const Icon = opt.icon;
                return (
                  <PrefCard
                    key={opt.id}
                    selected={prefs.theme === opt.id}
                    onClick={() => update({ theme: opt.id })}
                  >
                    <Icon size={15} className={prefs.theme === opt.id ? "text-jade-2" : "text-ink-3"} />
                    <div className="text-[12px] font-medium mt-1.5">{opt.label}</div>
                    <div className="text-[10px] text-ink-3 mt-0.5">{opt.caption}</div>
                  </PrefCard>
                );
              })}
            </div>
          </PrefSection>

          <PrefSection title="Lab units" hint="How lab results display — e.g. glucose as 5.5 mmol/L or 100 mg/dL. Converted on display only.">
            <div className="grid grid-cols-2 gap-2">
              {unitOptions.map(opt => (
                <PrefCard
                  key={opt.id}
                  selected={prefs.units === opt.id}
                  onClick={() => update({ units: opt.id })}
                >
                  <FlaskConical size={15} className={prefs.units === opt.id ? "text-jade-2" : "text-ink-3"} />
                  <div className="text-[12px] font-medium mt-1.5">{opt.label}</div>
                  <div className="text-[10px] text-ink-3 mt-0.5 font-mono">{opt.caption}</div>
                </PrefCard>
              ))}
            </div>
          </PrefSection>

          <PrefSection title="Language" hint="Khmer is in progress — drug names, units and lab codes always stay in English.">
            <div className="grid grid-cols-2 gap-2">
              {languageOptions.map(opt => (
                <PrefCard
                  key={opt.id}
                  selected={prefs.language === opt.id}
                  onClick={() => update({ language: opt.id })}
                >
                  <Languages size={15} className={prefs.language === opt.id ? "text-jade-2" : "text-ink-3"} />
                  <div className="text-[12px] font-medium mt-1.5">{opt.label}</div>
                  <div className="text-[10px] text-ink-3 mt-0.5 leading-snug">{opt.caption}</div>
                </PrefCard>
              ))}
            </div>
          </PrefSection>
        </div>

        <div className="px-5 py-3 border-t border-line-2 bg-surface-2/30 flex items-center justify-between">
          <div className="text-[10.5px] text-ink-3">Changes save automatically.</div>
          <button onClick={onClose} className="text-[12.5px] py-2 px-4 rounded-md bg-jade text-white hover:opacity-90 font-medium">
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function PrefSection({ title, hint, children }) {
  return (
    <div>
      <div className="mb-2">
        <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold">{title}</div>
        <div className="text-[11px] text-ink-3 leading-snug mt-0.5">{hint}</div>
      </div>
      {children}
    </div>
  );
}

function PrefCard({ selected, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`px-3 py-3 rounded-lg border text-left transition flex flex-col min-h-[78px] ${
        selected
          ? "border-jade bg-jade-soft/40 text-ink ring-1 ring-jade/30"
          : "border-line bg-surface text-ink-2 hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

/* Kura PSC locations — so doctors know where to send patients */
function KuraLocationsPanel() {
  const [open, setOpen] = useState(false);
  const locations = [
    { name: "BKK1",        area: "Phnom Penh · Boeung Keng Kang 1",   distance: "1.2 km",  hours: "Mon–Sat 7am–6pm" },
    { name: "Tuol Kork",   area: "Phnom Penh · Tuol Kork",            distance: "4.8 km",  hours: "Mon–Sat 7am–6pm" },
    { name: "Chamkar Mon", area: "Phnom Penh · Chamkar Mon",          distance: "2.1 km",  hours: "Mon–Sat 7am–6pm" },
    { name: "Siem Reap",   area: "Siem Reap · Wat Bo",                distance: "314 km",  hours: "Mon–Sat 7am–6pm" },
    { name: "Battambang",  area: "Battambang · central",              distance: "291 km",  hours: "Mon–Sat 8am–5pm" },
    { name: "Sihanoukville", area: "Preah Sihanouk · downtown",       distance: "230 km",  hours: "Mon–Sat 8am–5pm" },
    { name: "Kampong Cham", area: "Kampong Cham · provincial",         distance: "124 km", hours: "Mon–Fri 8am–5pm" },
    { name: "Kampot",      area: "Kampot · town center",              distance: "148 km",  hours: "Mon–Fri 8am–5pm" },
    { name: "Takeo",       area: "Takeo · Doun Kaev",                 distance: "78 km",   hours: "Mon–Fri 8am–5pm" },
    { name: "Pursat",      area: "Pursat · provincial",                distance: "189 km", hours: "Mon–Fri 8am–5pm" },
  ];
  const visible = open ? locations : locations.slice(0, 4);
  return (
    <>
      <div className="hairline mx-3 my-5" />
      <div className="flex items-center justify-between px-3 mb-2">
        <span className="text-[10px] uppercase tracking-[0.18em] text-ink-3">Kura locations</span>
        <span className="text-[10px] text-ink-3 font-mono">{locations.length}</span>
      </div>
      <ul className="space-y-0.5 mb-2">
        {visible.map(l => (
          <li key={l.name}>
            <button className="w-full flex items-start gap-2.5 px-3 py-1.5 rounded-md hover:bg-surface-2 text-left group" title={`${l.area} · ${l.hours}`}>
              <MapPin size={12} className="text-jade-2 mt-0.5 shrink-0" />
              <span className="flex-1 min-w-0">
                <span className="block text-[12px] text-ink-2 truncate">{l.name}</span>
                <span className="block text-[10px] text-ink-3 truncate">{l.distance} · {l.area.split(" · ")[0]}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-3 py-1.5 text-[11px] text-ink-3 hover:text-ink inline-flex items-center justify-center gap-1"
      >
        {open ? "Show less" : `Show all ${locations.length}`} {open ? <ChevronDown size={11} className="rotate-180" /> : <ChevronDown size={11} />}
      </button>
    </>
  );
}

/* ============================================================
   PATIENTS VIEW
   ============================================================ */
function PatientsView({ patients, chip, setChip, selected, onSelectPatient, detailMode, onOpenDetail, onCloseDetail, onQuickOrder, onOrderPlaced, onViewOrder, userFullName }) {
  const [view, setView] = useState("cohort");

  // Full-width treatment workspace mode
  if (detailMode && selected) {
    return <PatientDetailFull patient={selected} onBack={onCloseDetail} onQuickOrder={onQuickOrder} onOrderPlaced={onOrderPlaced} onViewOrder={onViewOrder} />;
  }

  // "Dr. Sopheak Chann" → "Dr. Chann"; "Pierre Tison" → "Pierre"; null → null.
  const greetingName = (() => {
    if (!userFullName) return null;
    const m = userFullName.match(/^(Dr\.?)\s+\S+\s+(.+)$/);
    if (m) return `${m[1]} ${m[2]}`;
    return userFullName.split(/\s+/)[0];
  })();
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-3 mb-1">{TODAY}</div>
          <h1 className="font-display text-[34px] font-medium leading-none">
            {greetingName ? `${timeGreeting}, ${greetingName}.` : `${timeGreeting}.`}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-ink-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-jade-2 pulse-dot" />
            All 184 bridged patients in view
          </span>
        </div>
      </div>

      {/* Today strip */}
      <TodayStrip />

      {/* View toggle */}
      <div className="mt-8 mb-3 flex items-center">
        <div className="flex items-center gap-1 p-1 bg-line-2 rounded-lg">
          <button
            onClick={() => setView("cohort")}
            className={`text-[12.5px] px-3 py-1.5 rounded-md transition inline-flex items-center gap-1.5 ${
              view === "cohort" ? "bg-surface text-ink shadow-sm font-medium" : "text-ink-3 hover:text-ink"
            }`}
          >
            Your panel
            <span className="font-mono text-[10px] text-ink-3">184</span>
          </button>
          <button
            onClick={() => setView("referrals")}
            className={`text-[12.5px] px-3 py-1.5 rounded-md transition inline-flex items-center gap-1.5 ${
              view === "referrals" ? "bg-surface text-ink shadow-sm font-medium" : "text-ink-3 hover:text-ink"
            }`}
          >
            Referrals
            <span className="font-mono text-[10px] text-plum bg-line-2 rounded px-1">2</span>
          </button>
        </div>
      </div>

      {view === "cohort" && (
        <>
          {/* Filter chips */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {filterChips.map(c => {
              const active = chip === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setChip(c.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] border transition ${
                    active
                      ? "bg-jade text-white border-ink"
                      : "bg-surface border-line text-ink-2 hover:border-ink"
                  }`}
                >
                  {c.label}
                  <span className={`font-mono text-[10px] ${active ? "text-white/70" : "text-ink-3"}`}>
                    {c.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Cohort — full-width focused list. Row click opens the chart in full detail. */}
          <CohortTable
            patients={patients}
            selectedId={selected?.id}
            onSelect={(id) => { onSelectPatient(id); onOpenDetail && onOpenDetail(); }}
          />
        </>
      )}

      {view === "referrals" && <ReferralsPanel />}
    </div>
  );
}

function TodayStrip() {
  const [tier] = useDoctorTier();
  // Explorer mode: no real queue yet — render a quiet onboarding card instead
  // of the populated six-card strip.
  if (tier === "explorer") {
    return (
      <div data-tour="today-strip" className="bg-surface border border-line rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-line-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber" />
            <h3 className="font-display text-[15px] font-medium">Today</h3>
            <span className="text-[11px] text-ink-3">— nothing here yet</span>
          </div>
        </div>
        <div className="px-5 py-7 flex items-start gap-4">
          <div className="w-9 h-9 rounded-md bg-amber-soft text-amber flex items-center justify-center shrink-0">
            <Sparkles size={16} />
          </div>
          <div className="flex-1">
            <div className="text-[13.5px] text-ink mb-1 font-medium">Welcome to Kura.</div>
            <div className="text-[12px] text-ink-2 leading-relaxed max-w-[640px]">
              Your dashboard will surface results back, off-target patients, claims to chase, follow-ups, and referrals — once you have real patients on the platform. We've loaded one demo patient (Sokha Chann) so you can poke around. <button onClick={triggerStartVerification} className="underline underline-offset-2 hover:text-ink">Verify your license</button> to start onboarding your own.
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div data-tour="today-strip" className="bg-surface border border-line rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-line-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-terracotta pulse-dot" />
          <h3 className="font-display text-[15px] font-medium">Today</h3>
          <span className="text-[11px] text-ink-3">— six threads need your attention</span>
        </div>
        <button className="text-[11px] text-ink-3 hover:text-ink">Customize</button>
      </div>
      <div className="grid grid-cols-6 divide-x divide-line-2">
        {todaySignals.map((s, i) => (
          <SignalCard key={i} {...s} />
        ))}
      </div>
    </div>
  );
}

function SignalCard({ icon, accent, label, sub, detail, cta, ctaLabel }) {
  const accentMap = {
    jade: "text-jade-2 bg-jade-soft",
    amber: "text-amber bg-amber-soft",
    terracotta: "text-terracotta bg-terracotta-soft",
    plum: "text-plum bg-line-2",
    ink: "text-ink-2 bg-line-2",
  };
  return (
    <div className="px-5 py-4 hover:bg-surface-2 cursor-pointer group">
      <div className={`w-7 h-7 rounded-md flex items-center justify-center mb-2.5 ${accentMap[accent]}`}>
        {icon}
      </div>
      <div className="text-[14px] font-semibold leading-snug mb-0.5">{label}</div>
      <div className="text-[11.5px] text-ink-2 leading-snug">{sub}</div>
      <div className="text-[10.5px] text-ink-3 mt-0.5">{detail}</div>
      {cta && (
        <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-plum font-medium">
          {ctaLabel || "Open"} <ArrowRight size={10} />
        </div>
      )}
    </div>
  );
}

function CohortTable({ patients, selectedId, onSelect }) {
  return (
    <div data-tour="cohort-table" className="bg-surface border border-line rounded-xl overflow-hidden">
      <div className="grid grid-cols-12 px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] text-ink-3 border-b border-line-2 bg-surface-2">
        <div className="col-span-5">Patient</div>
        <div className="col-span-4">Signal</div>
        <div className="col-span-2 text-right">Last seen</div>
        <div className="col-span-1"></div>
      </div>
      <div>
        {patients.map(p => {
          const active = p.id === selectedId;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`w-full grid grid-cols-12 px-4 py-3 text-left border-b border-line-2 last:border-b-0 transition ${
                active ? "bg-jade-soft" : "hover:bg-surface-2"
              }`}
            >
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                <FlagDot flag={p.flag} />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate">{p.name}</div>
                  <div className="text-[10.5px] text-ink-3 truncate">
                    {p.khmer} · {p.age}{p.sex} · <span className="font-mono">{p.id}</span>
                  </div>
                </div>
              </div>
              <div className="col-span-4 min-w-0">
                <div className="text-[11.5px] text-ink truncate">{p.flagText}</div>
                <div className="flex gap-1 mt-1">
                  {p.tags.slice(0, 2).map(t => (
                    <span key={t} className="text-[9.5px] uppercase tracking-wide text-ink-3 border border-line rounded px-1 py-px">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="col-span-2 text-right text-[11px] text-ink-2 self-center font-mono">
                {p.lastSeen}
              </div>
              <div className="col-span-1 self-center text-right">
                <ChevronRight size={14} className={active ? "text-jade" : "text-ink-3"} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FlagDot({ flag }) {
  const map = {
    critical: "bg-crimson",
    warning: "bg-amber",
    ok: "bg-jade-2",
    muted: "bg-line",
  };
  return <span className={`w-2 h-2 rounded-full shrink-0 ${map[flag] || "bg-line"}`} />;
}

function PatientDetail({ patient, onOpenFullChart }) {
  const [tab, setTab] = useState("flowsheet");

  return (
    <div className="bg-surface border border-line rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-line-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-ink-3 mb-1 flex items-center gap-2">
              <span className="font-mono">{patient.id}</span>
              <span>·</span>
              <span className="text-jade-2 inline-flex items-center gap-1">
                <ShieldCheck size={10} /> Bridge: {patient.bridge}
              </span>
              <span>·</span>
              <span>{patient.insurance}</span>
            </div>
            <h2 className="font-display text-[26px] leading-tight font-medium">{patient.name}</h2>
            <div className="text-[12px] text-ink-3 mt-0.5">
              {patient.khmer} · {patient.age} {patient.sex === "M" ? "♂" : "♀"} · last seen {patient.lastSeen}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="inline-flex items-center gap-1 text-[11.5px] px-2.5 py-1.5 rounded-md border border-line hover:border-ink">
              <Phone size={11} /> Call
            </button>
            <button className="inline-flex items-center gap-1 text-[11.5px] px-2.5 py-1.5 rounded-md border border-line hover:border-ink">
              <Send size={11} /> Telegram
            </button>
            <button onClick={onOpenFullChart} className="inline-flex items-center gap-1 text-[11.5px] px-2.5 py-1.5 rounded-md bg-jade text-white hover:opacity-90">
              Open chart <ArrowRight size={11} />
            </button>
          </div>
        </div>

        {/* AI recap */}
        <div className="mt-4 flex gap-3 p-3.5 rounded-lg bg-jade-soft border border-jade-soft">
          <div className="w-7 h-7 rounded-md bg-jade text-white flex items-center justify-center shrink-0">
            <Sparkles size={13} />
          </div>
          <div className="text-[12.5px] leading-relaxed text-ink">
            <span className="text-jade font-semibold">AI recap.</span>{" "}
            {patient.summary}{" "}
            <span className="text-jade-2 font-medium">Next step:</span> {patient.nextStep}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-5 px-5 border-b border-line-2 text-[12.5px]">
        {["flowsheet", "trend", "care plan", "notes", "claims"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`tab-underline py-2.5 capitalize ${tab === t ? "active text-ink font-medium" : "text-ink-3 hover:text-ink"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {tab === "flowsheet" && patient.flowsheet && <Flowsheet rows={patient.flowsheet} />}
        {tab === "flowsheet" && !patient.flowsheet && <EmptyTab text="No flowsheet for this patient yet." />}
        {tab === "trend" && patient.trend && <Trend trend={patient.trend} metric={patient.metric} target={patient.target} />}
        {tab === "trend" && !patient.trend && <EmptyTab text="Trend will appear once 2+ results are in." />}
        {tab === "care plan" && patient.plan && <CarePlanInline plan={patient.plan} />}
        {tab === "care plan" && !patient.plan && <EmptyTab text="No active care plan. Author one from a template." />}
        {tab === "notes" && <EmptyTab text="No notes yet. Telehealth voice notes will appear here." />}
        {tab === "claims" && <EmptyTab text="No claims for this patient." />}
      </div>
    </div>
  );
}

function Flowsheet({ rows }) {
  const flagMap = {
    high: { color: "text-crimson", bg: "bg-crimson-soft", arrow: "↑" },
    low:  { color: "text-amber",   bg: "bg-amber-soft",   arrow: "↓" },
    ok:   { color: "text-jade-2",  bg: "bg-jade-soft",    arrow: "—" },
  };
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
      {rows.map((r, i) => {
        const m = flagMap[r.flag];
        return (
          <div key={i} className="flex items-center justify-between py-1.5 border-b border-line-2 last:border-b-0">
            <div className="text-[12.5px] text-ink-2">{r.label}</div>
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] text-ink-3 font-mono">{r.ref}</span>
              <span className={`inline-flex items-center gap-1 text-[12px] font-mono font-medium px-2 py-0.5 rounded ${m.bg} ${m.color}`}>
                <span className="font-sans">{m.arrow}</span>{r.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Trend({ trend, metric, target }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3">Trend · 5 quarters</div>
          <div className="font-display text-[18px] font-medium">{metric}</div>
        </div>
        <div className="text-[10.5px] text-ink-3 font-mono">target ≤ {target}</div>
      </div>
      <div style={{ height: 180 }} className="-mx-2">
        <ResponsiveContainer>
          <LineChart data={trend} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <XAxis dataKey="q" stroke="#7C857F" fontSize={10} tickLine={false} axisLine={{ stroke: "#E5DFD3" }} />
            <YAxis stroke="#7C857F" fontSize={10} tickLine={false} axisLine={false} width={30} />
            <Tooltip
              contentStyle={{ background: "white", border: "1px solid #E5DFD3", borderRadius: 6, fontSize: 11 }}
              labelStyle={{ color: "#15201A", fontWeight: 600 }}
            />
            <ReferenceLine y={target} stroke="#1F4D3F" strokeDasharray="3 3" strokeOpacity={0.6} />
            <Line type="monotone" dataKey="v" stroke="#C25E3F" strokeWidth={2.2} dot={{ fill: "#C25E3F", r: 3.5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11.5px] text-ink-3 mt-2">
        Dashed line shows the clinical target. Trend has been climbing for 4 consecutive quarters.
      </p>
    </div>
  );
}

function CarePlanInline({ plan }) {
  const kindMap = {
    lab:    { icon: <FlaskConical size={11} />, label: "Lab",         tone: "text-jade-2 bg-jade-soft" },
    rx:     { icon: <Pill size={11} />,         label: "Rx · ongoing", tone: "text-ink-2 bg-line-2" },
    "rx-new": { icon: <Pill size={11} />,       label: "Rx · new",     tone: "text-terracotta bg-terracotta-soft" },
    tele:   { icon: <Video size={11} />,        label: "Telehealth",   tone: "text-plum bg-line-2" },
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3">Active care plan</div>
          <div className="font-display text-[18px] font-medium">{plan.title}</div>
        </div>
        <button className="text-[11.5px] text-jade-2 hover:underline inline-flex items-center gap-1">
          Edit plan <ArrowRight size={11} />
        </button>
      </div>
      <ul className="space-y-1.5">
        {plan.items.map((it, i) => {
          const k = kindMap[it.kind];
          return (
            <li key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-line-2 bg-surface-2">
              <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded ${k.tone}`}>
                {k.icon} {k.label}
              </span>
              <span className="text-[12.5px] flex-1">{it.label}</span>
              <span className="text-[11px] text-ink-3 font-mono">{it.due}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EmptyTab({ text }) {
  return (
    <div className="text-center py-8 text-[12.5px] text-ink-3 border border-dashed border-line rounded-lg">
      {text}
    </div>
  );
}

/* ============================================================
   REFERRALS PANEL — incoming + outgoing + feedback letter cycle
   Per architecture spec §3 ("Referrals & feedback letters") — v1 surface.
   ============================================================ */
function ReferralsPanel() {
  const [tab, setTab] = useState("incoming"); // "incoming" | "outgoing"

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 mb-4">
        <button
          onClick={() => setTab("incoming")}
          className={`text-[12.5px] px-3 py-1.5 rounded-md transition inline-flex items-center gap-1.5 ${
            tab === "incoming" ? "bg-jade text-white" : "text-ink-2 hover:bg-surface-2"
          }`}
        >
          Incoming
          <span className={`font-mono text-[10px] rounded px-1 ${
            tab === "incoming" ? "bg-white/15" : "text-plum bg-line-2"
          }`}>2</span>
        </button>
        <button
          onClick={() => setTab("outgoing")}
          className={`text-[12.5px] px-3 py-1.5 rounded-md transition inline-flex items-center gap-1.5 ${
            tab === "outgoing" ? "bg-jade text-white" : "text-ink-2 hover:bg-surface-2"
          }`}
        >
          Outgoing
          <span className={`font-mono text-[10px] rounded px-1 ${
            tab === "outgoing" ? "bg-white/15" : "text-ink-3 bg-line-2"
          }`}>3</span>
        </button>

        <div className="ml-auto">
          <button className="inline-flex items-center gap-1.5 bg-jade text-white rounded-lg px-3 py-1.5 text-[12px] font-medium hover:opacity-90">
            <Plus size={12} /> New referral
          </button>
        </div>
      </div>

      {tab === "incoming" && (
        <div className="space-y-3">
          <IncomingReferral
            from="Dr. Sokha Lim"
            cabinet="BKK2 · GP"
            patient="Dara Heng"
            khmer="ហេង ដារា"
            age={58}
            sex="M"
            reason="Suspected dyslipidemia — patient reports family hx CAD; LDL 168 on baseline."
            tags={["lipids", "FH suspected"]}
            received="3 hours ago"
            attachments={["Lipid panel · 2026-04-28", "BP log · 14d"]}
            network="in"
          />
          <IncomingReferral
            from="Dr. Kosal Pou"
            cabinet="BKK3 · GP"
            patient="Bopha Yim"
            khmer="យឹម បុប្ផា"
            age={47}
            sex="F"
            reason="Wants endo opinion on Hashimoto's — TSH 8.4, anti-TPO positive. Stable on 50mcg levothyroxine but symptomatic."
            tags={["thyroid", "second opinion"]}
            received="yesterday"
            attachments={["TSH + Free T4 · 2026-05-01", "Anti-TPO · 2026-05-01"]}
            network="in"
          />
        </div>
      )}

      {tab === "outgoing" && (
        <div className="space-y-3">
          <OutgoingReferral
            to="Dr. Phally Tep"
            specialty="Endocrinology · BKK1"
            patient="Sokha Chann"
            reason="A1c 9.4 trending up over 4 quarters despite metformin + gliclazide. Considering SGLT2i; want endo input on regimen."
            status="awaiting"
            sent="2 days ago"
            network="in"
          />
          <OutgoingReferral
            to="Dr. Vichea Sok"
            specialty="Cardiology · Khema Clinic"
            patient="Bora Pich"
            reason="LDL 178 on atorva 20 with no response. Considering lipoprotein(a). Out-of-network — PDF export only, no feedback letter."
            status="sent"
            sent="5 days ago"
            network="out"
          />
          <OutgoingReferral
            to="Dr. Sothy Ros"
            specialty="Nephrology · PP General"
            patient="Vibol Heng"
            reason="eGFR 58, declining over 12 months. HTN+T2DM. Want CKD staging and ARB optimization."
            status="feedback"
            sent="3 weeks ago"
            network="in"
            feedback={{
              author: "Dr. Sothy Ros",
              date: "2026-04-22",
              assessment: "CKD stage 3a, likely diabetic + hypertensive nephropathy.",
              recommendations: "Switch to losartan 100mg. Add SGLT2i (empagliflozin 10mg) — renal protective. Repeat BMP + UACR in 12 weeks. Avoid NSAIDs.",
              followUp: "Refer back if eGFR <45 or proteinuria worsens.",
            }}
          />
        </div>
      )}
    </div>
  );
}

function IncomingReferral({ from, cabinet, patient, khmer, age, sex, reason, tags, received, attachments, network }) {
  return (
    <div className="bg-surface border border-line rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-plum/15 text-plum flex items-center justify-center">
            <Send size={15} />
          </div>
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-0.5 flex items-center gap-1.5">
              Incoming · {received}
              {network === "in" && (
                <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-semibold text-jade bg-jade-soft px-1.5 py-0.5 rounded normal-case">
                  In-network
                </span>
              )}
            </div>
            <div className="text-[14px] font-medium leading-tight">From {from}</div>
            <div className="text-[11.5px] text-ink-3">{cabinet}</div>
          </div>
        </div>
      </div>

      {/* Patient block */}
      <div className="rounded-lg bg-surface-2 border border-line-2 p-3 mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="font-display text-[15px] font-medium">{patient}</div>
          <span className="text-[11px] text-ink-3">{khmer} · {age}{sex === "M" ? "♂" : "♀"}</span>
        </div>
        <p className="text-[12px] text-ink-2 leading-snug">{reason}</p>
        <div className="flex gap-1 mt-2">
          {tags.map(t => (
            <span key={t} className="text-[9.5px] uppercase tracking-wide text-ink-3 border border-line rounded px-1.5 py-px">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Attached clinical context */}
      <div className="mb-4">
        <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1.5">Attached clinical context</div>
        <div className="flex flex-wrap gap-1.5">
          {attachments.map(a => (
            <span key={a} className="inline-flex items-center gap-1 text-[11px] bg-surface border border-line rounded px-2 py-1">
              <FileText size={10} className="text-ink-3" /> {a}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="inline-flex items-center gap-1.5 bg-jade text-white rounded-md px-3.5 py-1.5 text-[12px] font-medium hover:bg-jade-2">
          <CheckCircle2 size={12} /> Accept · bridge to your panel
        </button>
        <button className="inline-flex items-center gap-1.5 text-ink-2 border border-line hover:border-ink rounded-md px-3 py-1.5 text-[12px]">
          Decline with reason
        </button>
        <button className="ml-auto text-[11px] text-ink-3 hover:text-ink inline-flex items-center gap-1">
          View full chart <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}

function OutgoingReferral({ to, specialty, patient, reason, status, sent, network, feedback }) {
  const statusMap = {
    drafted:  { label: "Drafted",          tone: "text-ink-3 bg-line-2" },
    sent:     { label: "Sent",             tone: "text-plum bg-line-2" },
    awaiting: { label: "Awaiting feedback", tone: "text-amber bg-amber-soft" },
    feedback: { label: "Feedback received", tone: "text-jade bg-jade-soft" },
  };
  const s = statusMap[status];

  return (
    <div className="bg-surface border border-line rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-jade-soft text-jade flex items-center justify-center">
            <ArrowRight size={15} />
          </div>
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-0.5 flex items-center gap-1.5">
              Outgoing · sent {sent}
              {network === "in" ? (
                <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-semibold text-jade bg-jade-soft px-1.5 py-0.5 rounded normal-case">
                  In-network · feedback letter expected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-semibold text-ink-3 bg-line-2 px-1.5 py-0.5 rounded normal-case">
                  Out-of-network · PDF export only
                </span>
              )}
            </div>
            <div className="text-[14px] font-medium leading-tight">To {to}</div>
            <div className="text-[11.5px] text-ink-3">{specialty}</div>
          </div>
        </div>
        <span className={`text-[10.5px] font-medium px-2 py-1 rounded ${s.tone}`}>{s.label}</span>
      </div>

      <div className="rounded-lg bg-surface-2 border border-line-2 p-3 mb-3">
        <div className="text-[13px] font-medium mb-1">{patient}</div>
        <p className="text-[12px] text-ink-2 leading-snug">{reason}</p>
      </div>

      {/* Feedback letter when received */}
      {feedback && (
        <div className="rounded-lg border-2 border-jade bg-jade-soft p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-jade text-white flex items-center justify-center">
              <FileText size={11} />
            </div>
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-jade font-semibold">
              Feedback letter from {feedback.author}
            </div>
            <span className="text-[10.5px] text-ink-3 font-mono ml-auto">{feedback.date}</span>
          </div>
          <div className="space-y-2 text-[12px] leading-relaxed">
            <div>
              <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3">Assessment</span>
              <p className="text-ink">{feedback.assessment}</p>
            </div>
            <div>
              <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3">Recommendations</span>
              <p className="text-ink">{feedback.recommendations}</p>
            </div>
            <div>
              <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3">Follow-up</span>
              <p className="text-ink">{feedback.followUp}</p>
            </div>
          </div>
          <div className="hairline my-3" />
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1 text-[11px] text-jade-2 hover:underline font-medium">
              <CheckCircle2 size={11} /> Mark read & attach to chart
            </button>
            <button className="ml-auto text-[10.5px] text-ink-3 hover:text-ink">
              Reply to {feedback.author.split(" ")[0]}
            </button>
          </div>
        </div>
      )}

      {!feedback && (
        <div className="flex items-center gap-2 mt-3">
          <button className="inline-flex items-center gap-1.5 text-[11px] text-ink-2 border border-line hover:border-ink rounded-md px-2.5 py-1.5">
            View sent letter
          </button>
          {status === "awaiting" && (
            <button className="text-[11px] text-ink-3 hover:text-ink px-2 py-1.5">
              Nudge {to.split(" ")[1]}
            </button>
          )}
          {network === "out" && (
            <button className="text-[11px] text-ink-3 hover:text-ink px-2 py-1.5 inline-flex items-center gap-1">
              <FileText size={11} /> Export PDF
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ORDERS VIEW — 4-step flow: Patient · Tests · Routing · Confirm
   ============================================================ */
const TEST_CATALOG = {
  hba1c:  { name: "HbA1c",                price: 8,  tat: "1d", category: "Endocrinology" },
  lipid:  { name: "Lipid panel (full)",   price: 14, tat: "1d", category: "Chemistry" },
  lft:    { name: "Liver function (LFT)", price: 12, tat: "1d", category: "Chemistry" },
  creat:  { name: "Creatinine + eGFR",    price: 6,  tat: "1d", category: "Chemistry" },
  tsh:    { name: "TSH + Free T4",        price: 10, tat: "1d", category: "Endocrinology" },
  vitd:   { name: "Vitamin D 25-OH",      price: 18, tat: "2d", category: "Endocrinology" },
  urinr:  { name: "Urine microalbumin",   price: 7,  tat: "1d", category: "Chemistry" },
  hsv:    { name: "HSV-1/2 IgG (ELISA)",  price: 22, tat: "2d", category: "Immunology" },
  cbc:    { name: "Complete blood count", price: 6,  tat: "1d", category: "Hematology" },
  fer:    { name: "Ferritin",             price: 9,  tat: "1d", category: "Hematology" },
};

function OrdersListView({ onNewOrder, onStartVerification, onToast }) {
  const auth = useAuth();
  const [cancelledIds, setCancelledIds] = useState(() => new Set());
  // Non-Pierre accounts always render the empty state — 0 bookings is the
  // pre-launch demo state for every other login.
  if (!isPierreAccount(auth)) {
    return (
      <ExplorerEmptyState
        icon={Calendar}
        title="No bookings yet"
        body="Bookings show up here once you start ordering labs for real patients. You'll need a verified MoH license to create one — that's the only thing standing between you and your first booking."
        onStartVerification={onStartVerification}
      />
    );
  }
  const orders = [
    { id: "KO-9134-4821", patient: "Sokha Chann",   mrn: "P-9134", tests: ["HbA1c", "Microalbumin"],                 route: "In-clinic draw", status: "in-progress",  total: 20.00, when: "today",    flagged: 0 },
    { id: "KO-9134-4604", patient: "Sokha Chann",   mrn: "P-9134", tests: ["Lipid panel", "HbA1c"],                   route: "In-clinic draw", status: "in-progress",  total: 26.00, when: "20m ago", flagged: 0 },
    { id: "KO-7702-9118", patient: "Bora Pich",     mrn: "P-7702", tests: ["Lipid panel"],                            route: "PSC pickup",     status: "in-progress",  total: 18.00, when: "today",    flagged: 1 },
    { id: "KO-4421-3370", patient: "Channary Sok",  mrn: "P-4421", tests: ["CMP", "CBC", "TSH"],                       route: "In-clinic draw", status: "scheduled",    total: 36.00, when: "tomorrow", flagged: 0 },
    { id: "KO-9134-3812", patient: "Sokha Chann",   mrn: "P-9134", tests: ["Lipid panel", "HbA1c"],                    route: "PSC pickup", status: "results-back", total: 26.00, when: "3mo ago",  flagged: 0 },
    { id: "KO-1190-2255", patient: "Dara Heng",     mrn: "P-1190", tests: ["Vit D, 25-OH"],                            route: "PSC pickup", status: "results-back", total: 22.00, when: "5d ago",   flagged: 0 },
    { id: "KO-4421-7220", patient: "Channary Sok",  mrn: "P-4421", tests: ["TSH"],                                     route: "PSC pickup", status: "results-back", total: 5.00,  when: "2h ago",   flagged: 1, reflexCandidate: true },
    { id: "KO-8866-4029", patient: "Sopheap Mao",   mrn: "P-8866", tests: ["Urinalysis", "Microalbumin"],              route: "In-clinic draw", status: "in-progress",  total: 18.00, when: "2d ago",   flagged: 0 },
    { id: "KO-3315-7740", patient: "Naro Phan",     mrn: "P-3315", tests: ["CBC with diff"],                           route: "PSC pickup", status: "scheduled",    total:  9.00, when: "in 2d",    flagged: 0 },
    { id: "KO-7702-8819", patient: "Bora Pich",     mrn: "P-7702", tests: ["HbA1c"],                                   route: "PSC pickup", status: "results-back", total:  8.00, when: "2wk ago",  flagged: 1 },
  ];

  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'today' | 'scheduled' | 'in-progress' | 'awaiting-visit' | 'results-back'
  const [query, setQuery] = useState("");
  const [resendConfirm, setResendConfirm] = useState(null); // { order, code } pending confirmation
  const [cancelConfirm, setCancelConfirm] = useState(null); // { order, code } pending confirmation
  const [editOrder, setEditOrder] = useState(null);          // booking whose tests are being edited inline

  // "Awaiting visit" = PSC pickup booking that's been placed but the patient
  // hasn't shown up at the collection point yet (in-progress + PSC route).
  const isAwaitingVisit = (o) => o.status === "in-progress" && o.route === "PSC pickup";

  const visible = orders.filter(o => {
    if (statusFilter === "today" && o.when !== "today") return false;
    if (statusFilter === "awaiting-visit" && !isAwaitingVisit(o)) return false;
    if (statusFilter !== "all" && statusFilter !== "today" && statusFilter !== "awaiting-visit" && o.status !== statusFilter) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const code = getBookingMeta(o, false).code.toLowerCase();
      const hit = o.patient.toLowerCase().includes(q) || o.mrn.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) || code.includes(q) || o.tests.some(t => t.toLowerCase().includes(q));
      if (!hit) return false;
    }
    return true;
  });

  const statusMeta = {
    "results-back": { label: "Results back", color: "text-jade-2 bg-jade-soft" },
    "in-progress":  { label: "In progress",  color: "text-amber bg-amber-soft" },
    "scheduled":    { label: "Scheduled",    color: "text-ink-2 bg-line-2" },
  };

  const counts = {
    all:             orders.length,
    today:           orders.filter(o => o.when === "today").length,
    "scheduled":     orders.filter(o => o.status === "scheduled").length,
    "in-progress":   orders.filter(o => o.status === "in-progress").length,
    "awaiting-visit":orders.filter(isAwaitingVisit).length,
    "results-back":  orders.filter(o => o.status === "results-back").length,
  };

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-3">Bookings</div>
          <h1 className="font-display text-[30px] font-medium leading-none">Recent bookings</h1>
          <p className="text-[12.5px] text-ink-3 mt-1.5">Track status, sign reports, and re-book.</p>
        </div>
        <button onClick={onNewOrder} className="inline-flex items-center gap-1.5 text-[12px] px-3 py-2 rounded-md bg-jade text-white font-medium hover:opacity-90 shadow-sm">
          <Plus size={13} /> New booking
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3 text-[11.5px] flex-wrap">
        <div className="relative">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by booking code, patient, MRN, or test…"
            className="pl-7 pr-2 py-1.5 rounded-md border border-line bg-surface text-[12px] placeholder:text-ink-3 focus:border-ink focus:outline-none w-80"
          />
        </div>
        <span className="w-px h-3.5 bg-line mx-0.5" />
        <OrdersFilterPill active={statusFilter === "all"}          onClick={() => setStatusFilter("all")}>All · {counts.all}</OrdersFilterPill>
        <OrdersFilterPill active={statusFilter === "today"}        onClick={() => setStatusFilter("today")}>Today · {counts.today}</OrdersFilterPill>
        <OrdersFilterPill active={statusFilter === "scheduled"}    onClick={() => setStatusFilter("scheduled")}>Scheduled · {counts.scheduled}</OrdersFilterPill>
        <OrdersFilterPill active={statusFilter === "in-progress"}     onClick={() => setStatusFilter("in-progress")}>In progress · {counts["in-progress"]}</OrdersFilterPill>
        <OrdersFilterPill active={statusFilter === "awaiting-visit"}  onClick={() => setStatusFilter("awaiting-visit")}>Awaiting visit · {counts["awaiting-visit"]}</OrdersFilterPill>
        <OrdersFilterPill active={statusFilter === "results-back"}    onClick={() => setStatusFilter("results-back")}>Results back · {counts["results-back"]}</OrdersFilterPill>
      </div>

      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-line-2 bg-surface-2/50 text-[10.5px] uppercase tracking-[0.14em] text-ink-3">
              <th className="text-left px-4 py-2.5 font-semibold">Booking</th>
              <th className="text-left px-3 py-2.5 font-semibold">Patient</th>
              <th className="text-left px-3 py-2.5 font-semibold">Tests</th>
              <th className="text-left px-3 py-2.5 font-semibold">Status</th>
              <th className="text-left px-3 py-2.5 font-semibold">ETA</th>
              <th className="text-right px-3 py-2.5 font-semibold">When</th>
              <th className="text-right px-3 py-2.5 font-semibold w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-ink-3 text-[12px]">
                  No bookings match the current filters.
                </td>
              </tr>
            ) : visible.map(o => {
              const isCancelled = cancelledIds.has(o.id);
              const s = isCancelled
                ? { label: "Cancelled", color: "text-ink-3 bg-line-2" }
                : statusMeta[o.status];
              const b = getBookingMeta(o, isCancelled);
              const eta = getOrderEta(o, isCancelled);
              const canCancel = !isCancelled && (o.status === "scheduled" || o.status === "in-progress");
              return (
                <tr key={o.id} className={`border-b border-line-2 last:border-b-0 transition hover:bg-surface-2/50 ${isCancelled ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3 align-middle">
                    <span className={`font-mono text-[11.5px] tracking-[0.06em] ${isCancelled ? "line-through text-ink-3" : "text-ink-2"}`}>{b.code}</span>
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <div className={`font-medium ${isCancelled ? "text-ink-3 line-through" : "text-ink"}`}>{o.patient}</div>
                    <div className="text-[10.5px] text-ink-3 font-mono">{o.mrn}</div>
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <div className="flex flex-wrap gap-1">
                      {o.tests.map(t => (
                        <span key={t} className={`text-[10.5px] px-1.5 py-0.5 rounded bg-line-2 ${isCancelled ? "text-ink-3 line-through" : "text-ink-2"}`}>{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <span className={`text-[10.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${s.color}`}>{s.label}</span>
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <span className={`inline-flex items-center gap-1 text-[11.5px] ${eta.tone}`}>
                      {eta.icon}{eta.text}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right align-middle text-ink-3 text-[11.5px]">{o.when}</td>
                  <td className="px-3 py-3 text-right align-middle">
                    <div className="inline-flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setEditOrder(o)}
                        disabled={isCancelled}
                        title={isCancelled ? "Cancelled bookings can't be edited" : "Add or remove tests"}
                        className="w-7 h-7 rounded-md text-ink-3 hover:text-ink hover:bg-surface-2 disabled:hover:bg-transparent disabled:hover:text-ink-3 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => setResendConfirm({ order: o, code: b.code })}
                        disabled={isCancelled}
                        title={isCancelled ? "Cancelled bookings can't be resent" : "Resend booking slip"}
                        className="w-7 h-7 rounded-md text-ink-3 hover:text-ink hover:bg-surface-2 disabled:hover:bg-transparent disabled:hover:text-ink-3 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
                      >
                        <Send size={12} />
                      </button>
                      <button
                        onClick={() => setCancelConfirm({ order: o, code: b.code })}
                        disabled={!canCancel}
                        title={canCancel ? "Cancel booking" : "Locked — tubes already at lab"}
                        className="w-7 h-7 rounded-md text-ink-3 hover:text-crimson hover:bg-crimson/10 disabled:hover:bg-transparent disabled:hover:text-ink-3 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {resendConfirm && (
        <ResendBookingConfirmModal
          code={resendConfirm.code}
          patientName={resendConfirm.order.patient}
          onCancel={() => setResendConfirm(null)}
          onConfirm={() => {
            onToast && onToast(`Resent ${resendConfirm.code}`, { sub: `${resendConfirm.order.patient} · Telegram + SMS` });
            setResendConfirm(null);
          }}
        />
      )}

      {cancelConfirm && (
        <CancelBookingConfirmModal
          code={cancelConfirm.code}
          order={cancelConfirm.order}
          onCancel={() => setCancelConfirm(null)}
          onConfirm={() => {
            setCancelledIds(prev => { const next = new Set(prev); next.add(cancelConfirm.order.id); return next; });
            onToast && onToast(`Cancelled ${cancelConfirm.code}`, { sub: cancelConfirm.order.patient });
            setCancelConfirm(null);
          }}
        />
      )}

      {editOrder && (
        <EditBookingTestsModal
          order={editOrder}
          onCancel={() => setEditOrder(null)}
          onSave={(nextTests, delta) => {
            const code = getBookingMeta(editOrder, false).code;
            const sub = delta.added.length > 0 && delta.removed.length > 0
              ? `+${delta.added.length} · −${delta.removed.length}`
              : delta.added.length > 0 ? `+${delta.added.length} added`
              : delta.removed.length > 0 ? `−${delta.removed.length} removed`
              : "no changes";
            onToast && onToast(`Updated ${code}`, { sub: `${editOrder.patient} · ${sub}` });
            setEditOrder(null);
          }}
        />
      )}
    </div>
  );
}

/* Friction confirm before re-sending the booking code — the patient just got
   pinged once already; double-pings annoy them and erode Telegram open-rates,
   so make the doctor pause and read who they're about to ping. */
function ResendBookingConfirmModal({ code, patientName, onCancel, onConfirm }) {
  const firstName = (patientName || "the patient").split(" ")[0];
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm" onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} className="bg-bg border border-line rounded-xl shadow-xl w-full max-w-[400px] overflow-hidden">
        <div className="px-5 py-4 border-b border-line-2 bg-jade-soft/40 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-jade text-white flex items-center justify-center"><Send size={15} /></div>
          <div>
            <h3 className="font-display text-[15px] font-medium leading-tight">Resend booking slip?</h3>
            <div className="text-[10.5px] text-ink-3 uppercase tracking-[0.14em] font-semibold">Telegram + SMS</div>
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="text-[12.5px] text-ink-2 leading-relaxed mb-3">
            Re-send the booking code <span className="font-mono text-ink font-medium">{code}</span> to <span className="font-medium text-ink">{firstName}</span>? They'll get the link, QR, and PSC directions again on both channels.
          </p>
          <div className="rounded-md border border-line-2 bg-surface-2/40 px-3 py-2 text-[10.5px] text-ink-3 leading-snug">
            Use sparingly — repeated pings reduce future open-rates on Telegram.
          </div>
        </div>
        <div className="px-5 py-3 border-t border-line-2 bg-surface-2/30 grid grid-cols-2 gap-2">
          <button onClick={onCancel} className="text-[12.5px] py-2 rounded-md border border-line bg-surface text-ink-2 hover:border-ink font-medium">
            Cancel
          </button>
          <button onClick={onConfirm} className="text-[12.5px] py-2 rounded-md bg-jade text-white hover:opacity-90 font-medium inline-flex items-center justify-center gap-1.5">
            <Send size={12} /> Yes, resend
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* Friction confirm before cancelling a booking — cancellation is destructive
   and triggers refunds + a patient notification, so make the doctor pause and
   read who and what they're cancelling. */
function CancelBookingConfirmModal({ code, order, onCancel, onConfirm }) {
  const isPsc = order.route === "PSC pickup";
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm" onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} className="bg-bg border border-line rounded-xl shadow-xl w-full max-w-[420px] overflow-hidden">
        <div className="px-5 py-4 border-b border-line-2 bg-crimson-soft/60 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-crimson text-white flex items-center justify-center"><AlertTriangle size={15} /></div>
          <div>
            <h3 className="font-display text-[15px] font-medium leading-tight">Cancel this booking?</h3>
            <div className="text-[10.5px] text-ink-3 uppercase tracking-[0.14em] font-semibold">This can't be undone</div>
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="text-[12.5px] text-ink-2 leading-relaxed mb-3">
            Cancel <span className="font-mono text-ink font-medium">{code}</span> for <span className="font-medium text-ink">{order.patient}</span>?
          </p>
          <ul className="rounded-md border border-line-2 bg-surface-2/40 px-3 py-2.5 text-[11px] text-ink-2 space-y-1 leading-snug">
            <li className="flex items-start gap-1.5"><span className="text-ink-3 mt-1 w-1 h-1 rounded-full bg-ink-3 shrink-0" /> {order.tests.length} test{order.tests.length === 1 ? "" : "s"} ({order.tests.slice(0, 3).join(", ")}{order.tests.length > 3 ? `, +${order.tests.length - 3}` : ""}) will be voided</li>
            {isPsc
              ? <li className="flex items-start gap-1.5"><span className="text-ink-3 mt-1 w-1 h-1 rounded-full bg-ink-3 shrink-0" /> Patient receives a cancellation notice on Telegram + SMS</li>
              : <li className="flex items-start gap-1.5"><span className="text-ink-3 mt-1 w-1 h-1 rounded-full bg-ink-3 shrink-0" /> Courier dispatch is cancelled for this booking</li>
            }
            <li className="flex items-start gap-1.5"><span className="text-ink-3 mt-1 w-1 h-1 rounded-full bg-ink-3 shrink-0" /> Any cash collected will need to be refunded manually</li>
          </ul>
        </div>
        <div className="px-5 py-3 border-t border-line-2 bg-surface-2/30 grid grid-cols-2 gap-2">
          <button onClick={onCancel} className="text-[12.5px] py-2 rounded-md border border-line bg-surface text-ink-2 hover:border-ink font-medium">
            Keep booking
          </button>
          <button onClick={onConfirm} className="text-[12.5px] py-2 rounded-md bg-crimson text-white hover:opacity-90 font-medium inline-flex items-center justify-center gap-1.5">
            <X size={12} /> Yes, cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* Focused "edit booking tests" modal — keeps the doctor in the bookings list.
   They can add tests by searching the catalog or remove existing ones in
   place, see the new total live, and save in a single click. Replaces the
   old flow that dumped you into a full booking-detail page in edit mode. */
function EditBookingTestsPanel({ order, onCancel, onSave, inline = false }) {
  // Resolve current tests against LAB_CATALOG when we can find a match by
  // name; otherwise fall back to a synthesized object so the row still
  // renders + can still be removed.
  const resolveTest = (name) => {
    const hit = LAB_CATALOG.find(t => t.name === name);
    if (hit) return { code: hit.code, name: hit.name, price: hit.price.usd };
    // Fallback for demo names like "CMP" / "CBC" not in the catalog.
    return { code: name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5) || "GEN", name, price: 0 };
  };

  const initial = useMemo(() => order.tests.map(resolveTest), [order]);
  const [tests, setTests] = useState(initial);
  const [query, setQuery] = useState("");

  const present = (code) => tests.some(t => t.code === code);
  const removeTest = (code) => setTests(prev => prev.filter(t => t.code !== code));
  const addTest = (t) => setTests(prev => prev.some(x => x.code === t.code) ? prev : [...prev, { code: t.code, name: t.name, price: t.price.usd }]);

  const q = query.trim().toLowerCase();
  const matches = q
    ? LAB_CATALOG
        .filter(t => !present(t.code))
        .filter(t => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q))
        .slice(0, 8)
    : [];

  const total = tests.reduce((s, t) => s + t.price, 0);

  // Diff vs initial so the toast can summarise the change
  const initialCodes = new Set(initial.map(t => t.code));
  const currentCodes = new Set(tests.map(t => t.code));
  const added   = tests.filter(t => !initialCodes.has(t.code));
  const removed = initial.filter(t => !currentCodes.has(t.code));
  const dirty   = added.length > 0 || removed.length > 0;

  // Tighter spacing + no jade-soft header when slotted inline under a row.
  const pad         = inline ? "px-3" : "px-5";
  const sectionPadY = inline ? "py-2.5" : "py-3";

  return (
    <div className={inline ? "border-y border-line-2 bg-surface-2/30" : "flex flex-col overflow-hidden h-full"}>
      {!inline && (
        <div className="px-5 py-3.5 border-b border-line-2 bg-jade-soft/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-md bg-jade text-white flex items-center justify-center shrink-0"><Pencil size={14} /></div>
            <div className="min-w-0">
              <h3 className="font-display text-[15px] font-medium leading-tight">Edit tests</h3>
              <div className="text-[10.5px] text-ink-3 font-mono">{getBookingMeta(order, false).code} · {order.patient}</div>
            </div>
          </div>
          <button onClick={onCancel} className="text-ink-3 hover:text-ink p-1 -m-1"><X size={15} /></button>
        </div>
      )}

      {/* Current tests */}
      <div className={`${pad} ${sectionPadY} border-b border-line-2`}>
          <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-2">In this booking</div>
          {tests.length === 0 ? (
            <div className="text-[12px] text-ink-3 italic">No tests in this booking. Add at least one before saving.</div>
          ) : (
            <ul className="space-y-1">
              {tests.map(t => {
                const isNew = added.some(a => a.code === t.code);
                return (
                  <li key={t.code} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border ${isNew ? "border-jade-2 bg-jade-soft/40" : "border-line"}`}>
                    <span className="font-mono text-[10px] text-ink-2 bg-line-2 px-1.5 py-0.5 rounded shrink-0">{t.code}</span>
                    <span className="flex-1 text-[12.5px] text-ink truncate">{t.name}</span>
                    {isNew && (
                      <span className="text-[9.5px] uppercase tracking-wider font-semibold text-jade bg-jade-soft px-1.5 py-0.5 rounded shrink-0">New</span>
                    )}
                    <span className="font-mono text-[11.5px] text-ink-3 shrink-0">{t.price > 0 ? fmtPrice(t.price) : "Pending"}</span>
                    <button onClick={() => removeTest(t.code)} title="Remove" className="text-ink-3 hover:text-crimson p-0.5">
                      <X size={12} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {removed.length > 0 && (
            <div className="text-[10.5px] text-crimson mt-2">
              {removed.length} test{removed.length === 1 ? "" : "s"} marked for removal: {removed.map(r => r.name).join(", ")}
            </div>
          )}
        </div>

      {/* Add tests — searchable catalog picker */}
      <div className={`${pad} ${sectionPadY} ${inline ? "" : "flex-1 min-h-0 flex flex-col overflow-hidden"}`}>
        <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-2">Add a test</div>
        <div className="relative mb-2">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name or code (e.g. HBA1C, lipid…)"
            className="w-full pl-8 pr-3 py-2 rounded-md border border-line bg-surface text-[13px] focus:border-ink focus:outline-none"
          />
        </div>
        <div className={inline ? "" : "flex-1 min-h-0 overflow-y-auto"}>
          {q === "" ? (
            <div className="text-[11px] text-ink-3 italic px-1 py-1">Start typing to find tests in the catalog.</div>
          ) : matches.length === 0 ? (
            <div className="text-[11px] text-ink-3 italic px-1 py-1">No catalog matches for "{query}".</div>
          ) : (
            <ul className="space-y-1">
              {matches.map(t => (
                <li key={t.code}>
                  <button
                    onClick={() => addTest(t)}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-line bg-surface hover:border-jade-2 hover:bg-jade-soft/30 transition"
                  >
                    <span className="font-mono text-[10px] text-ink-2 bg-line-2 px-1.5 py-0.5 rounded shrink-0">{t.code}</span>
                    <span className="flex-1 text-[12.5px] text-ink truncate">{t.name}</span>
                    <span className="font-mono text-[11.5px] text-ink-3 shrink-0">{fmtPrice(t.price.usd)}</span>
                    <Plus size={12} className="text-jade-2 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={`${pad} ${sectionPadY} border-t border-line-2 bg-surface-2/40 flex items-center justify-between gap-3`}>
        <div className="text-[11px] text-ink-3">
          {tests.length} test{tests.length === 1 ? "" : "s"} · <span className="font-mono text-[12px] font-semibold text-ink">{total > 0 ? fmtPrice(total) : "Pending"}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="text-[12px] px-3 py-1.5 rounded-md border border-line bg-surface text-ink-2 hover:border-ink font-medium">
            Cancel
          </button>
          <button
            onClick={() => onSave(tests, { added, removed })}
            disabled={!dirty || tests.length === 0}
            className={`text-[12.5px] px-3.5 py-1.5 rounded-md font-medium inline-flex items-center gap-1.5 transition ${
              dirty && tests.length > 0 ? "bg-jade text-white hover:opacity-90" : "bg-line text-ink-3 cursor-not-allowed"
            }`}
          >
            <CheckCircle2 size={12} /> Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function EditBookingTestsModal({ order, onCancel, onSave }) {
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm" onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} className="bg-bg border border-line rounded-xl shadow-xl w-full max-w-[520px] max-h-[85vh] flex flex-col overflow-hidden">
        <EditBookingTestsPanel order={order} onCancel={onCancel} onSave={onSave} />
      </div>
    </div>,
    document.body
  );
}

// Derive a stable, demo-friendly booking code from the order id.
function getBookingMeta(order, cancelled) {
  const tail = order.id.split("-").pop();
  const code = "FZ" + (tail + "00000").slice(0, 5);
  if (cancelled)                     return { code, status: "Cancelled", tone: "bg-line-2 text-ink-3" };
  if (order.status === "scheduled")  return { code, status: "Confirmed", tone: "bg-jade-soft text-jade-2" };
  if (order.status === "results-back") return { code, status: "Redeemed", tone: "bg-line-2 text-ink-3" };
  return { code, status: "Confirmed", tone: "bg-jade-soft text-jade-2" };
}

// Derive a payment line: PSC route uses Cash/KHQR; clinic draw bills the patient's insurer.
function getPaymentMeta(order, cancelled) {
  const isPsc = order.route === "PSC pickup";
  if (isPsc) {
    const isCash = (order.id.charCodeAt(order.id.length - 1) % 2) === 0;
    const method = isCash ? "Cash" : "KHQR";
    const icon = isCash ? <Banknote size={12} /> : <QrCode size={12} />;
    if (cancelled)                       return { method, icon, status: "Refunded",  tone: "bg-line-2 text-ink-3" };
    if (order.status === "scheduled")    return { method, icon, status: "Pending",   tone: "bg-amber-soft text-amber" };
    return { method, icon, status: "Collected", tone: "bg-jade-soft text-jade-2" };
  }
  const icon = <CreditCard size={12} />;
  if (cancelled)                         return { method: "Insurance · Forte", icon, status: "Voided",  tone: "bg-line-2 text-ink-3" };
  if (order.status === "results-back")   return { method: "Insurance · Forte", icon, status: "Claimed", tone: "bg-jade-soft text-jade-2" };
  return { method: "Insurance · Forte", icon, status: "Pending claim", tone: "bg-amber-soft text-amber" };
}

// Privacy-aware courier state. Production: derived from dispatcher signals.
function getCourierState(order) {
  if (order.route !== "In-clinic draw") return null;
  if (order.status !== "in-progress")   return null;
  // Demo seed: alternate states so the page exercises all three.
  const sum = order.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const m = sum % 3;
  if (m === 0) return "unassigned";
  if (m === 1) return "assigned-elsewhere";
  return "en-route-to-you";
}

// Forward-looking "what happens next" for the bookings list. Folds route into
// the copy (Draw vs Visit; Rider vs Awaiting) so the list view doesn't need a
// separate Route column.
function getOrderEta(order, cancelled) {
  if (cancelled) {
    return { icon: <X size={11} className="text-ink-3" />, text: "Voided", tone: "text-ink-3" };
  }
  if (order.status === "results-back") {
    return { icon: <CheckCircle2 size={11} className="text-jade-2" />, text: "Reported", tone: "text-ink-3" };
  }
  const isClinic = order.route === "In-clinic draw";
  if (order.status === "scheduled") {
    return {
      icon: <Calendar size={11} className="text-ink-3" />,
      text: `${isClinic ? "Draw" : "Visit"} ${order.when}`,
      tone: "text-ink-2",
    };
  }
  // in-progress
  if (isClinic) {
    const freshlyDrawn = order.when === "today" || /m ago$/.test(order.when);
    if (freshlyDrawn) {
      const cs = getCourierState(order);
      if (cs === "en-route-to-you")    return { icon: <Motorbike size={11} className="text-jade-2" />, text: "Rider arriving",  tone: "text-jade-2" };
      if (cs === "assigned-elsewhere") return { icon: <Motorbike size={11} className="text-amber" />,  text: "Rider ~20m",      tone: "text-amber" };
      if (cs === "unassigned")         return { icon: <Clock size={11} className="text-ink-3" />,     text: "Sweep · 14:15",   tone: "text-ink-2" };
    }
    return { icon: <FlaskConical size={11} className="text-ink-3" />, text: "At lab", tone: "text-ink-2" };
  }
  // in-progress · PSC
  return { icon: <PersonStanding size={11} className="text-ink-3" />, text: "Awaiting visit", tone: "text-ink-2" };
}

function EditPolicyTooltip({ paymentSettled, tubesAtLab }) {
  return (
    <div className="relative group inline-block">
      <button
        type="button"
        aria-label="Edit policy"
        className="w-7 h-7 rounded-md border border-line-2 text-ink-3 hover:text-ink hover:border-ink inline-flex items-center justify-center"
      >
        <HelpCircle size={12} />
      </button>
      <div className="absolute right-0 top-full mt-1.5 w-72 bg-jade text-white rounded-md p-3 text-[11px] leading-snug opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-20">
        <div className="font-semibold mb-1.5 text-[11.5px]">Edit policy</div>
        <ul className="space-y-1 text-white/85">
          <li className={tubesAtLab ? "line-through text-white/40" : ""}>
            Add, remove, or duplicate tests until the tubes leave the clinic.
          </li>
          <li className={paymentSettled ? "line-through text-white/40" : ""}>
            Change booking, route, or patient details until payment is collected.
          </li>
          <li className={tubesAtLab ? "line-through text-white/40" : ""}>
            Cancel the whole order while payment is unsettled and tubes haven't reached the lab.
          </li>
          <li className="text-white/85">Once tubes reach the lab, everything is locked — call Kura ops to amend.</li>
        </ul>
      </div>
    </div>
  );
}

function CourierTrackingCard({ state, onCycleState }) {
  // State machine variants. "assigned-elsewhere" intentionally hides the live map
  // so the doctor can't see Sok's prior pickups (privacy / multi-clinic routing).
  const variants = {
    "unassigned": {
      title: "Awaiting dispatch",
      sub: "We'll assign a rider to your clinic within the next pickup window.",
      chip: { label: "PENDING", tone: "bg-amber-soft text-amber" },
      showMap: false,
    },
    "assigned-elsewhere": {
      title: "Rider assigned · finishing another pickup",
      sub: "Sok S. will start heading to your clinic once their current job is done. We'll show the live map then.",
      chip: { label: "ASSIGNED", tone: "bg-amber-soft text-amber" },
      showMap: false,
    },
    "en-route-to-you": {
      title: "Driver's on the way to you",
      sub: "Hand the bagged tubes over and read out the pickup code at the door.",
      chip: { label: "EN ROUTE", tone: "bg-jade-soft text-jade-2" },
      showMap: true,
    },
    "arrived": {
      title: "Rider is at your door",
      sub: "Hand over the tubes and confirm the pickup code with the rider.",
      chip: { label: "ARRIVED", tone: "bg-jade-soft text-jade-2" },
      showMap: true,
    },
  };
  const v = variants[state] ?? variants["unassigned"];

  const order = ["unassigned", "assigned-elsewhere", "en-route-to-you", "arrived"];
  const nextState = () => onCycleState && onCycleState(order[(order.indexOf(state) + 1) % order.length]);

  return (
    <div className="bg-surface border border-line rounded-xl overflow-hidden mb-4 flex items-stretch min-h-[96px]">
      {/* Map thumbnail — left, square */}
      {v.showMap && (
        <div className="relative w-24 shrink-0 bg-bg border-r border-line-2">
          <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
            <g fill="var(--color-line-2)" opacity="0.55">
              <rect x="14" y="14" width="58" height="42" rx="2"/>
              <rect x="84" y="20" width="76" height="38" rx="2"/>
              <rect x="172" y="14" width="52" height="48" rx="2"/>
              <rect x="236" y="22" width="68" height="36" rx="2"/>
              <rect x="316" y="14" width="60" height="44" rx="2"/>
              <rect x="20" y="78" width="50" height="48" rx="2"/>
              <rect x="84" y="82" width="46" height="38" rx="2"/>
              <rect x="142" y="74" width="38" height="56" rx="2"/>
              <rect x="252" y="78" width="52" height="46" rx="2"/>
              <rect x="316" y="84" width="60" height="38" rx="2"/>
              <rect x="18" y="146" width="58" height="42" rx="2"/>
              <rect x="92" y="148" width="44" height="40" rx="2"/>
              <rect x="148" y="142" width="78" height="46" rx="2"/>
              <rect x="238" y="146" width="60" height="42" rx="2"/>
              <rect x="310" y="146" width="66" height="42" rx="2"/>
            </g>
            <g stroke="var(--color-line)" strokeWidth="7">
              <line x1="0" y1="68" x2="400" y2="68"/>
              <line x1="0" y1="138" x2="400" y2="138"/>
              <line x1="78" y1="0" x2="78" y2="200"/>
              <line x1="232" y1="0" x2="232" y2="200"/>
            </g>
            <g stroke="var(--color-surface)" strokeWidth="1" strokeDasharray="3 5">
              <line x1="0" y1="68" x2="400" y2="68"/>
              <line x1="0" y1="138" x2="400" y2="138"/>
              <line x1="78" y1="0" x2="78" y2="200"/>
              <line x1="232" y1="0" x2="232" y2="200"/>
            </g>
            <path d="M 36 180 L 78 180 L 78 138 L 150 138" stroke="var(--color-jade-2)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.25"/>
            <path d="M 150 138 L 232 138 L 232 68 L 308 68" stroke="var(--color-jade-2)" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M 150 138 L 232 138 L 232 68 L 308 68" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.45"/>
            <g transform="translate(308, 68)">
              <circle r="18" fill="var(--color-ink)" />
              <circle r="12" fill="white" />
              <circle r="5" fill="var(--color-ink)" />
            </g>
            <g transform="translate(150, 138)">
              <circle r="24" fill="var(--color-jade-2)" opacity="0.14"/>
              <circle r="16" fill="var(--color-jade-2)" opacity="0.3"/>
              <circle r="10" fill="var(--color-jade-2)"/>
              <circle r="5" fill="white"/>
            </g>
          </svg>
          <div className="absolute top-1.5 left-1.5 bg-surface/95 rounded px-1.5 py-0.5 flex items-center gap-1 shadow-sm">
            <span className="w-1 h-1 rounded-full bg-jade-2 pulse-dot" />
            <span className="text-[9px] font-medium text-ink-2">Live</span>
          </div>
        </div>
      )}

      {/* Info — right-aligned cluster */}
      <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col items-end justify-center gap-1.5">
        <div className="inline-flex items-center gap-2">
          <span className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded shrink-0 ${v.chip.tone}`}>{v.chip.label}</span>
          <span className="text-[12.5px] font-medium text-ink whitespace-nowrap">{v.title}</span>
          {v.showMap && (
            <span className="bg-jade text-white text-[10px] font-medium rounded px-1.5 py-0.5 shrink-0">
              ETA <span className="font-mono">8 min</span>
            </span>
          )}
          {onCycleState && (
            <button
              onClick={nextState}
              className="text-[9px] uppercase tracking-wider text-ink-3 hover:text-ink border border-line-2 hover:border-ink rounded px-1.5 py-0.5 shrink-0"
              title="Cycle state — demo"
            >
              demo
            </button>
          )}
        </div>
        {v.showMap ? (
          <div className="inline-flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-jade-soft text-jade flex items-center justify-center font-medium text-[10px] shrink-0">SK</div>
            <span className="text-[11.5px] text-ink-2 whitespace-nowrap">
              Sok S. <span className="text-ink-3 font-mono text-[10px]">· 1AB-7234</span>
            </span>
            <button className="w-6 h-6 rounded-md border border-line hover:border-ink text-ink-2 inline-flex items-center justify-center shrink-0" title="Message rider">
              <MessageCircle size={11} />
            </button>
            <button className="w-6 h-6 rounded-md border border-line hover:border-ink text-ink-2 inline-flex items-center justify-center shrink-0" title="Call rider">
              <Phone size={11} />
            </button>
          </div>
        ) : (
          <div className="text-[11px] text-ink-3 leading-snug text-right">{v.sub}</div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   REFLEX TESTING — prototype for the auto-secondary-panel flow
   Example: TSH < 0.5 → reflex FT3 + FT4 on the same sample
   ============================================================ */
function ReflexTestingCard({ order, patient, phase: controlledPhase, onPhaseChange }) {
  // Demo state machine. In production this is driven by lab + payment events.
  //   detected → patient-pending → running → completed
  //   (or declined / expired)
  const [localPhase, setLocalPhase] = useState("detected");
  const phase = controlledPhase ?? localPhase;
  const setPhase = (next) => {
    setLocalPhase(next);
    if (onPhaseChange) onPhaseChange(next);
  };
  const [method, setMethod] = useState("khqr-tg"); // khqr-tg | pre-auth | insurance | skip

  const reflexPanel = [
    { code: "FT3", name: "Free T3", value: "6.8", unit: "pg/mL", ref: "2.3–4.2", flag: "high",  price: 7 },
    { code: "FT4", name: "Free T4", value: "2.1", unit: "ng/dL", ref: "0.8–1.8", flag: "high",  price: 7 },
  ];
  const reflexTotal = reflexPanel.reduce((s, t) => s + t.price, 0);

  const methodCopy = {
    "khqr-tg":   { label: "Send KHQR to patient via Telegram", sub: `${patient.name.split(" ")[0]} approves $${reflexTotal} in 1 tap · recommended`, badge: "Recommended", icon: <QrCode size={11}/> },
    "pre-auth":  { label: "Auto-debit · patient pre-authorized at booking", sub: "Stored payment runs the second the result triggers — no notification", badge: "Frictionless", icon: <CheckCircle2 size={11}/> },
    "insurance": { label: "Bill insurance · Forte EmCare", sub: "Auto-claim if reflex is covered for ICD-10 E05.x · no patient charge", badge: "If covered", icon: <CreditCard size={11}/> },
    "skip":      { label: "Skip reflex · schedule a follow-up draw", sub: "Patient comes back for a new sample · loses the convenience window", badge: "Slower", icon: <Calendar size={11}/> },
  };

  const advanceFromDetected = () => {
    if (method === "khqr-tg")   setPhase("patient-pending");
    else if (method === "pre-auth")  setPhase("running");
    else if (method === "insurance") setPhase("running");
    else if (method === "skip") setPhase("declined");
  };

  return (
    <div className="bg-surface border border-jade rounded-xl overflow-hidden">
      {/* Trigger row */}
      <div className="px-4 py-3 border-b border-line-2 bg-jade-soft/40">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={13} className="text-jade-2" />
          <span className="text-[10px] uppercase tracking-[0.18em] text-jade font-semibold">Reflex testing</span>
          <span className="text-[9.5px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-amber-soft text-amber inline-flex items-center gap-1">
            <AlertTriangle size={9}/> Trigger
          </span>
          <span className="text-[11px] text-ink-3 ml-auto">Sample expires <span className="font-mono text-ink-2">in 47h</span></span>
        </div>
        <div className="text-[12.5px] text-ink-2 leading-snug">
          <span className="font-medium text-ink">TSH 0.01 mIU/L</span> · severely suppressed — rules engine suggests FT3 + FT4 on the same sample to differentiate primary vs. central hyperthyroidism. <span className="text-ink-3">No new draw needed.</span>
        </div>
      </div>

      {/* DETECTED — payment selector */}
      {phase === "detected" && (
        <>
          <div className="px-4 py-3 border-b border-line-2">
            <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-2">Proposed panel</div>
            <ul className="space-y-1.5 mb-2">
              {reflexPanel.map(t => (
                <li key={t.code} className="flex items-center gap-3 text-[12.5px]">
                  <div className="w-6 h-6 rounded-md bg-jade-soft text-jade flex items-center justify-center shrink-0">
                    <TestTubes size={11} />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium">{t.name}</span> <span className="text-[10px] text-ink-3 font-mono">{t.code}</span>
                    <span className="text-[10.5px] text-ink-3 ml-2">Ref <span className="font-mono">{t.ref} {t.unit}</span></span>
                  </div>
                  <span className="font-mono text-[12px] text-ink-2 tnum">${t.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between pt-2 border-t border-line-2 text-[12px]">
              <span className="text-ink-3">2 add-on tests · same sample</span>
              <span className="font-mono font-semibold tnum">${reflexTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="px-4 py-3 border-b border-line-2">
            <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-2">How does the patient pay?</div>
            <div className="space-y-1.5">
              {Object.entries(methodCopy).map(([id, m]) => (
                <button
                  key={id}
                  onClick={() => setMethod(id)}
                  className={`w-full text-left rounded-md border p-2.5 transition flex items-start gap-2.5 ${
                    method === id
                      ? (id === "skip" ? "border-line bg-line-2/40" : "border-jade-2 bg-jade-soft/40")
                      : "border-line hover:border-ink"
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full border-2 mt-0.5 shrink-0 transition ${
                    method === id
                      ? (id === "skip"
                          ? "border-ink-3 bg-ink-3 shadow-[inset_0_0_0_2px_var(--color-surface)]"
                          : "border-jade-2 bg-jade-2 shadow-[inset_0_0_0_2px_var(--color-surface)]")
                      : "border-ink-3"
                  }`}/>
                  <div className="flex-1 min-w-0">
                    <div className={`flex items-center gap-1.5 text-[12px] font-medium ${id === "skip" ? "text-ink-2" : "text-ink"}`}>
                      {m.icon} {m.label}
                      <span className="ml-auto text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-line-2 text-ink-3">{m.badge}</span>
                    </div>
                    <div className="text-[10.5px] text-ink-3 mt-0.5 leading-snug">{m.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 py-3 bg-surface-2/30 flex items-center gap-2">
            <span className="text-[11px] text-ink-3 flex-1">Lab holds the sample until you decide — defaults to discard at 48h.</span>
            <button
              onClick={advanceFromDetected}
              className="text-[12px] bg-jade text-white px-3 py-1.5 rounded-md font-medium hover:opacity-90 inline-flex items-center gap-1.5"
            >
              {method === "skip" ? "Skip reflex" : "Approve & request payment"} <ChevronRight size={12}/>
            </button>
          </div>
        </>
      )}

      {/* PATIENT-PENDING — Telegram sent, awaiting approval */}
      {phase === "patient-pending" && (
        <div className="px-4 py-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-jade-soft text-jade flex items-center justify-center shrink-0">
            <Send size={14}/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-medium mb-0.5">KHQR sent to {patient.name.split(" ")[0]} via Telegram · <span className="font-mono">$${reflexTotal.toFixed(2)}</span></div>
            <div className="text-[11px] text-ink-3 leading-snug mb-2">Lab is holding the sample — runs the reflex panel as soon as the patient pays. Auto-cancels at 48h if unpaid.</div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPhase("running")} className="text-[11px] text-jade-2 hover:underline">Patient paid (demo) →</button>
              <span className="text-[10px] text-ink-3 mx-1">·</span>
              <button className="text-[11px] text-ink-3 hover:text-ink">Resend Telegram</button>
              <span className="text-[10px] text-ink-3 mx-1">·</span>
              <button onClick={() => setPhase("declined")} className="text-[11px] text-crimson hover:underline">Cancel reflex</button>
            </div>
          </div>
          <span className="text-[9.5px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-amber-soft text-amber shrink-0">Awaiting</span>
        </div>
      )}

      {/* RUNNING — lab processing the reflex panel */}
      {phase === "running" && (
        <div className="px-4 py-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-jade-soft text-jade flex items-center justify-center shrink-0">
            <FlaskConical size={14}/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-medium mb-0.5">Reflex panel running · FT3 + FT4 · same sample</div>
            <div className="text-[11px] text-ink-3 leading-snug">Results expected within 4h. Payment {method === "pre-auth" ? "auto-debited from stored KHQR" : method === "insurance" ? "claimed against Forte EmCare" : "received via Telegram KHQR"}.</div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => setPhase("completed")} className="text-[10.5px] text-jade-2 hover:underline">Result back (demo) →</button>
          </div>
        </div>
      )}

      {/* COMPLETED — results live in the flowsheet below; this card just confirms + links */}
      {phase === "completed" && (
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-jade-soft text-jade flex items-center justify-center shrink-0">
            <CheckCircle2 size={14}/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-medium leading-tight">Reflex panel complete · paid <span className="font-mono">${reflexTotal.toFixed(2)}</span></div>
            <div className="text-[10.5px] text-ink-3 leading-snug">FT3 + FT4 results landed in Lab history below — suppressed TSH with elevated FT3/FT4 suggests primary hyperthyroidism.</div>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById("lab-history");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="text-[11.5px] bg-jade text-white px-2.5 py-1.5 rounded-md font-medium hover:opacity-90 inline-flex items-center gap-1.5 shrink-0"
          >
            Check results <ArrowRight size={11} />
          </button>
        </div>
      )}

      {/* DECLINED */}
      {phase === "declined" && (
        <div className="px-4 py-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-line-2 text-ink-3 flex items-center justify-center shrink-0">
            <X size={14}/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-medium mb-0.5">Reflex skipped</div>
            <div className="text-[11px] text-ink-3 leading-snug">Sample discarded after 48h. Schedule a follow-up draw if you still want FT3/FT4 — patient will need to come back.</div>
          </div>
          <button onClick={() => setPhase("detected")} className="text-[10.5px] text-ink-3 hover:text-ink underline-offset-2 hover:underline shrink-0">
            Reconsider
          </button>
        </div>
      )}

      {/* Demo cycler */}
      <div className="px-4 py-2 border-t border-line-2 bg-surface-2/40 flex items-center gap-2 text-[10px] text-ink-3">
        <span className="uppercase tracking-wider font-semibold">demo</span>
        <span>state:</span>
        {["detected", "patient-pending", "running", "completed", "declined"].map(s => (
          <button
            key={s}
            onClick={() => setPhase(s)}
            className={`px-1.5 py-0.5 rounded border transition ${phase === s ? "border-ink bg-surface text-ink font-medium" : "border-line-2 hover:border-ink"}`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* Compact "Related" chip bar that appears at the top of every detail view.
   Each chip jumps to the related entity in a new tab via localStorage. */
function RelatedLinkBar({ items }) {
  if (!items || items.length === 0) return null;
  const kindMeta = {
    patient: { icon: Users,    accent: "text-jade-2",     label: "Patient" },
    booking: { icon: Calendar, accent: "text-jade-2",     label: "Booking" },
    pickup:  { icon: Motorbike,accent: "text-jade-2",     label: "Pickup"  },
  };
  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      <span className="text-[10px] uppercase tracking-[0.18em] text-ink-3 font-semibold mr-1">Related</span>
      {items.map((it, i) => {
        const meta = kindMeta[it.kind];
        const Icon = meta.icon;
        return (
          <button
            key={i}
            onClick={() => it.onOpen?.()}
            className="inline-flex items-center gap-2 bg-surface border border-line rounded-md px-2.5 py-1.5 hover:border-ink transition group min-w-0"
            title={`Open ${meta.label.toLowerCase()} in a new tab`}
          >
            <Icon size={13} className={meta.accent} />
            <div className="text-left min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-ink-3 leading-tight">{meta.label}</div>
              <div className="text-[12px] text-ink-2 font-medium leading-tight truncate max-w-[200px]">{it.label}</div>
            </div>
            {it.sub && <span className="text-[10.5px] text-ink-3 font-mono truncate hidden md:inline-block">{it.sub}</span>}
            <ExternalLink size={11} className="text-ink-3 group-hover:text-ink shrink-0" />
          </button>
        );
      })}
    </div>
  );
}

/* Horizontal at-a-glance progress strip that lives in the booking header card.
   Replaces the form-y label/value stack with a visual journey: every step is a
   pill connected by a thin rail, completed steps are jade, current step jade-outline. */
function BookingProgressStrip({ status, flagged }) {
  const stages = [
    { id: "created",   label: "Created" },
    { id: "scheduled", label: "Scheduled" },
    { id: "in-progress", label: "Sample" },
    { id: "results-back", label: "Results" },
    { id: "reported",  label: "Reported" },
  ];
  const order = ["created", "scheduled", "in-progress", "results-back", "reported"];
  const cancelled = status === "cancelled";
  const currentIdx = cancelled ? -1 : (
    status === "scheduled"    ? 1 :
    status === "in-progress"  ? 2 :
    status === "results-back" ? (flagged > 0 ? 3 : 4) :
                                0
  );
  return (
    <div className="flex items-center gap-1">
      {stages.map((st, i) => {
        const done    = !cancelled && i <  currentIdx;
        const current = !cancelled && i === currentIdx;
        const future  = cancelled || i > currentIdx;
        return (
          <React.Fragment key={st.id}>
            <div className="flex items-center gap-1.5">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                done    ? "bg-jade-2 text-white" :
                current ? "bg-surface border-2 border-jade-2 text-jade-2" :
                          "bg-line-2 text-ink-3"
              }`}>
                {done ? <CheckCircle2 size={9} /> : <span className={`w-1 h-1 rounded-full ${current ? "bg-jade-2" : "bg-ink-3"}`} />}
              </div>
              <span className={`text-[10.5px] font-medium uppercase tracking-wider ${
                done    ? "text-jade-2" :
                current ? "text-ink" :
                          "text-ink-3"
              }`}>{st.label}</span>
            </div>
            {i < stages.length - 1 && (
              <div className={`flex-1 h-px ${i < currentIdx ? "bg-jade-2" : "bg-line-2"}`} />
            )}
          </React.Fragment>
        );
      })}
      {cancelled && (
        <span className="ml-2 text-[10.5px] font-medium uppercase tracking-wider text-ink-3">Cancelled</span>
      )}
    </div>
  );
}

function OrderDetailView({ order, onBack, onOpenPatient }) {
  const [editing, setEditing] = useState(false);
  const [tests, setTests] = useState(order.tests);
  const [route, setRoute] = useState(order.route);
  const [cancelled, setCancelled] = useState(false);
  // Demo cycler — lets stakeholders see the three privacy-aware courier states.
  const initialCourier = getCourierState({ ...order });
  const [courierState, setCourierState] = useState(initialCourier);

  const eta = computeOrderETA(cancelled ? "cancelled" : order.status, route);
  const isInClinic = route === "In-clinic draw";
  const isInProgress = order.status === "in-progress" && !cancelled;
  const showCourier = isInClinic && isInProgress && courierState;

  // Demo data derived from the order — in production these come off the order record.
  const booking = getBookingMeta(order, cancelled);
  const payment = getPaymentMeta(order, cancelled);

  // Edit-policy gates — what's still mutable
  const paymentSettled = payment.status === "Collected" || payment.status === "Paid";
  const tubesAtLab = order.status === "results-back";
  const editsLocked = tubesAtLab || cancelled;
  const cancelLocked = tubesAtLab || cancelled || paymentSettled;

  const statusMeta = {
    "results-back": { label: "Results back", color: "text-jade-2 bg-jade-soft", icon: CheckCircle2 },
    "in-progress":  { label: "In progress",  color: "text-amber bg-amber-soft", icon: Clock },
    "scheduled":    { label: "Scheduled",    color: "text-ink-2 bg-line-2",     icon: Calendar },
    "cancelled":    { label: "Cancelled",    color: "text-ink-3 bg-line-2",     icon: X },
  };
  const effectiveStatus = cancelled ? "cancelled" : order.status;
  const s = statusMeta[effectiveStatus];

  const timeline = [
    { label: "Created",         date: order.when === "today" ? "today, 9:14 AM" : `${order.when}, 9:14 AM`, done: true },
    { label: "Scheduled",       date: order.status === "scheduled" ? "tomorrow, 10:00 AM" : "—",            done: order.status !== "scheduled" || true },
    { label: "Sample collected", date: order.status === "results-back" || order.status === "in-progress" ? "today, 10:42 AM" : "—", done: order.status === "results-back" || order.status === "in-progress" },
    { label: "Results back",    date: order.status === "results-back" ? "today, 2:30 PM" : "—",             done: order.status === "results-back" },
    { label: "Reported",        date: order.status === "results-back" && order.flagged === 0 ? "today, 3:01 PM" : "—", done: order.status === "results-back" && order.flagged === 0 },
  ];

  // Mock result values keyed by test name — only render when results back.
  const mockResults = {
    "HbA1c":         { value: "9.4", unit: "%",     ref: "≤ 7.0",   flag: "high" },
    "Microalbumin":  { value: "34",  unit: "mg/g",  ref: "< 30",    flag: "warn" },
    "Lipid panel":   { value: "—",   unit: "",      ref: "see breakdown", flag: null },
    "Vit D, 25-OH":  { value: "22",  unit: "ng/mL", ref: "30–100",  flag: "low" },
    "TSH":           { value: "0.01", unit: "mIU/L", ref: "0.5–4.5", flag: "high" }, // severely suppressed → reflex panel
  };
  const showResults = order.status === "results-back" && !cancelled;

  // Reflex testing — recognise a TSH-suppressed pattern and surface the secondary panel
  const tshReflex = order.reflexCandidate && showResults && tests.includes("TSH")
    && mockResults["TSH"] && Number(mockResults["TSH"].value) < 0.5;

  const toggleTest = (name) => {
    setTests(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]);
  };

  // Related entities — patient always, pickup when one exists for this booking
  const relatedPickup = useMemo(() => PICKUPS.find(p => p.bookingId === order.id), [order.id]);
  const relatedItems = [
    { kind: "patient", label: order.patient, sub: order.mrn, onOpen: () => openEntityInNewTab("patient", { id: order.mrn, name: order.patient }) },
    ...(relatedPickup ? [{
      kind: "pickup",
      label: relatedPickup.id,
      sub: pickupStatusMeta[relatedPickup.status]?.label,
      onOpen: () => openEntityInNewTab("pickup", relatedPickup),
    }] : []),
  ];

  return (
    <div className="px-8 py-6 max-w-[1200px] mx-auto">
      {/* Breadcrumb / back */}
      <div className="flex items-center gap-1 mb-3 text-[12px] text-ink-3">
        <button onClick={onBack} className="inline-flex items-center gap-1 hover:text-ink">
          <ChevronLeft size={13} /> Bookings
        </button>
        <ChevronRight size={11} className="text-ink-3" />
        <span className="font-mono text-ink-2">{booking.code}</span>
      </div>

      {/* Related entities */}
      <RelatedLinkBar items={relatedItems} />

      {/* Header card — booking-first identity */}
      <div className="bg-surface border border-line rounded-xl p-5 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Primary row — code + status pills */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3">Booking</span>
              <h1 className="font-display font-mono text-[22px] font-medium leading-none tracking-[0.08em]">{booking.code}</h1>
              <span className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded inline-flex items-center gap-1 ${s.color}`}>
                <s.icon size={10} /> {s.label}
              </span>
              <span className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded inline-flex items-center gap-1 ${payment.tone}`}>
                {payment.icon} {payment.status}
              </span>
              {order.flagged > 0 && !cancelled && (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-crimson bg-crimson-soft px-1.5 py-0.5 rounded">
                  <AlertTriangle size={10} /> Flagged
                </span>
              )}
            </div>

            {/* Secondary row — patient, route, when, total */}
            <div className="flex items-center gap-3 text-[12px] text-ink-3 flex-wrap">
              <button onClick={() => onOpenPatient && onOpenPatient(order.mrn)} className="inline-flex items-center gap-1 hover:text-ink">
                <Users size={11} /> <span className="text-ink-2 font-medium">{order.patient}</span> · <span className="font-mono">{order.mrn}</span>
              </button>
              <span className="text-ink-3">·</span>
              <span className="inline-flex items-center gap-1">
                {route === "Home draw" ? <Motorbike size={11} /> : <MapPin size={11} />} {route}
              </span>
              <span className="text-ink-3">·</span>
              <span className="inline-flex items-center gap-1"><Clock size={11} /> {order.when}</span>
              <span className="text-ink-3">·</span>
              <span className="inline-flex items-center gap-1"><Banknote size={11} /> {payment.method} <span className="font-mono ml-0.5">${order.total.toFixed(2)}</span></span>
            </div>

            {/* Progress strip — visual booking journey at a glance */}
            <div className="pt-2 mt-1 border-t border-line-2">
              <BookingProgressStrip status={effectiveStatus} flagged={order.flagged} />
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {!cancelled && !editing && (
              <>
                <button
                  onClick={() => !editsLocked && setEditing(true)}
                  disabled={editsLocked}
                  className={`inline-flex items-center gap-1 text-[11.5px] px-2.5 py-1.5 rounded-md border ${editsLocked ? "border-line-2 text-ink-3 cursor-not-allowed" : "border-line hover:border-ink text-ink-2"}`}
                >
                  <FileText size={11} /> Edit
                </button>
                <EditPolicyTooltip paymentSettled={paymentSettled} tubesAtLab={tubesAtLab} />
                <button
                  onClick={() => !cancelLocked && setCancelled(true)}
                  disabled={cancelLocked}
                  className={`inline-flex items-center gap-1 text-[11.5px] px-2.5 py-1.5 rounded-md border ${cancelLocked ? "border-line-2 text-ink-3 cursor-not-allowed" : "border-line text-crimson hover:border-crimson"}`}
                  title={cancelLocked ? (tubesAtLab ? "Tubes at lab — cancel locked" : "Payment collected — cancel locked") : ""}
                >
                  <X size={11} /> Cancel
                </button>
              </>
            )}
            {editing && (
              <>
                <button onClick={() => setEditing(false)} className="inline-flex items-center gap-1 text-[11.5px] px-2.5 py-1.5 rounded-md border border-line hover:border-ink">
                  Cancel
                </button>
                <button onClick={() => setEditing(false)} className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-md bg-jade text-white font-medium hover:opacity-90">
                  <CheckCircle2 size={12} /> Save changes
                </button>
              </>
            )}
            {cancelled && (
              <button onClick={() => setCancelled(false)} className="text-[11px] text-ink-3 hover:text-ink underline-offset-2 hover:underline">
                Restore order
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live tracking — courier map for in-clinic in-progress, else fallback ETA card */}
      {showCourier
        ? <CourierTrackingCard state={courierState} onCycleState={setCourierState} />
        : eta && <LiveETACard eta={eta} />}

      <div className="grid grid-cols-12 gap-4">
        {/* LEFT — tests + status */}
        <div className="col-span-8 space-y-4">
          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line-2">
              <div className="flex items-center gap-2">
                <FlaskConical size={13} className="text-jade-2" />
                <h3 className="font-display text-[15px] font-medium">Tests</h3>
                <span className="text-[10.5px] text-ink-3 font-mono">{tests.length} ordered</span>
              </div>
              {editing && (
                <button className="text-[11px] text-jade-2 font-medium hover:underline inline-flex items-center gap-1">
                  <Plus size={11} /> Add test
                </button>
              )}
            </div>
            {tests.length === 0 ? (
              <div className="px-4 py-8 text-center text-[12px] text-ink-3">All tests removed.</div>
            ) : (
              <ul className="divide-y divide-line-2">
                {tests.map(t => {
                  const result = mockResults[t];
                  return (
                    <li key={t} className="px-4 py-3 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-jade-soft text-jade flex items-center justify-center shrink-0">
                        <TestTubes size={12} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-ink truncate">{t}</div>
                        {result && showResults ? (
                          <div className="text-[11px] text-ink-3 mt-0.5">Ref: <span className="font-mono">{result.ref} {result.unit}</span></div>
                        ) : (
                          <div className="text-[11px] text-ink-3 mt-0.5">Awaiting results</div>
                        )}
                      </div>
                      {showResults && result && result.value !== "—" && (
                        <div className={`font-mono text-[14px] font-semibold tabular-nums ${
                          result.flag === "high" ? "text-crimson" :
                          result.flag === "warn" || result.flag === "low" ? "text-amber" : "text-ink"
                        }`}>
                          {result.value} <span className="text-[10px] text-ink-3 font-normal">{result.unit}</span>
                        </div>
                      )}
                      {editing && (
                        <button onClick={() => toggleTest(t)} className="text-[10.5px] text-crimson hover:underline ml-2">
                          Remove
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Reflex testing — auto-suggested when a flagged primary result triggers a rule */}
          {tshReflex && <ReflexTestingCard order={order} patient={{ name: order.patient, mrn: order.mrn }} />}

          {/* Routing — editable in edit mode */}
          <div className="bg-surface border border-line rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={13} className="text-ink-3" />
              <h3 className="font-display text-[14px] font-medium">Routing</h3>
            </div>
            {editing ? (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "In-clinic draw", icon: <RouteIcon left={<Motorbike size={12} />} right={<TestTubes size={12} />} />,     sub: "Doctor draws · Kura shipper picks up sample" },
                  { id: "PSC pickup",     icon: <RouteIcon left={<PersonStanding size={13} />} right={<FileText size={11} />} />, sub: "Slip + QR sent to patient phone" },
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRoute(r.id)}
                    className={`text-left px-2.5 py-2 rounded-md border transition ${route === r.id ? "border-jade-2 bg-jade-soft" : "border-line hover:border-ink"}`}
                  >
                    <div className={`flex items-center gap-1.5 text-[11.5px] font-medium ${route === r.id ? "text-jade-2" : "text-ink"}`}>
                      {r.icon} {r.id}
                    </div>
                    <div className="text-[10px] text-ink-3 mt-0.5 leading-snug">{r.sub}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-[12px] text-ink-2">
                <span className="font-medium">{route}</span>
                {route === "Home draw"      && <span className="text-ink-3"> · phlebotomist visit · GPS-tracked</span>}
                {route === "PSC pickup"     && <span className="text-ink-3"> · slip + QR sent to patient phone</span>}
                {route === "In-clinic draw" && <span className="text-ink-3"> · doctor draws · Kura shipper pickup</span>}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — timeline + meta */}
        <div className="col-span-4 space-y-4">
          <div className="bg-surface border border-line rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={13} className="text-ink-3" />
              <h3 className="font-display text-[14px] font-medium">Timeline</h3>
            </div>
            <ol className="space-y-2.5">
              {timeline.map((step, i) => (
                <li key={step.label} className="flex items-start gap-2.5">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${step.done ? "bg-jade-2 text-white" : "bg-line text-ink-3"}`}>
                    {step.done ? <CheckCircle2 size={10} /> : <span className="w-1.5 h-1.5 rounded-full bg-ink-3" />}
                  </div>
                  <div className="flex-1">
                    <div className={`text-[12px] ${step.done ? "text-ink font-medium" : "text-ink-3"}`}>{step.label}</div>
                    <div className="text-[10.5px] text-ink-3 font-mono">{step.date}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-surface border border-line rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Banknote size={13} className="text-jade-2" />
              <h3 className="font-display text-[14px] font-medium">Billing</h3>
            </div>
            <div className="space-y-1.5 text-[11.5px]">
              <div className="flex justify-between"><span className="text-ink-2">Tests</span><span className="tnum">{tests.length}</span></div>
              <div className="flex justify-between"><span className="text-ink-2">Total</span><span className="tnum font-mono">${order.total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-ink-2">Insurer</span><span className="text-jade-2">Forte · pending</span></div>
            </div>
          </div>

          {!cancelled && (
            <div className="bg-surface border border-line rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Send size={13} className="text-jade-2" />
                <h3 className="font-display text-[14px] font-medium">Notify patient</h3>
              </div>
              <p className="text-[11.5px] text-ink-2 leading-snug mb-2.5">Re-send the booking code via Telegram if the patient missed it.</p>
              <button className="w-full text-[11.5px] bg-jade text-white px-2.5 py-1.5 rounded-md font-medium hover:opacity-90 inline-flex items-center justify-center gap-1.5">
                <Send size={11} /> Send Telegram reminder
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function computeOrderETA(status, route) {
  // Mock ETAs keyed by status × route. Real impl would derive from
  // scheduled times, courier GPS, lab queue depth, etc.
  if (status === "cancelled") {
    return { label: "Cancelled", value: "Order cancelled", sub: "Use 'Restore order' to revert", kind: "cancelled" };
  }
  if (status === "results-back") {
    return { label: "Results back", value: "2:30 PM today", sub: "Review and notify the patient", kind: "done" };
  }
  if (status === "scheduled") {
    if (route === "In-clinic draw") return { label: "Sample ready in clinic", value: "Awaiting pickup", sub: "Hand to next Kura shipper route or schedule a pickup", kind: "shipper-wait" };
    return { label: "Walk-in window", value: "9:00 AM – 12:00 PM", sub: "Booking code + QR sent to patient via Telegram", kind: "walk-in" };
  }
  if (status === "in-progress") {
    if (route === "In-clinic draw") return { label: "Shipper en route", value: "Pickup ETA 14:30 – 14:50", sub: "Driver Sok S. · 8 min away · GPS-tracked", kind: "shipper" };
    return { label: "Patient checked in", value: "10:42 AM", sub: "Sample drawn at BKK1 · lab ETA today 4:00 PM", kind: "psc" };
  }
  return null;
}

function LiveETACard({ eta }) {
  const palette = {
    "phlebotomist": { bg: "bg-jade-soft/60",    border: "border-jade",       icon: <Motorbike size={18}/>,    iconBg: "bg-jade",       iconColor: "text-white", live: true },
    "shipper":      { bg: "bg-jade-soft/60",    border: "border-jade",       icon: <Motorbike size={18}/>,    iconBg: "bg-jade",       iconColor: "text-white", live: true },
    "shipper-wait": { bg: "bg-amber-soft/60",   border: "border-amber",      icon: <Motorbike size={18}/>,    iconBg: "bg-amber",      iconColor: "text-white", live: false },
    "walk-in":      { bg: "bg-amber-soft/60",   border: "border-amber",      icon: <MapPin size={18}/>,       iconBg: "bg-amber",      iconColor: "text-white", live: false },
    "psc":          { bg: "bg-jade-soft/60",    border: "border-jade",       icon: <CheckCircle2 size={18}/>, iconBg: "bg-jade",       iconColor: "text-white", live: true },
    "lab":          { bg: "bg-jade-soft/60",    border: "border-jade",       icon: <FlaskConical size={18}/>, iconBg: "bg-jade",       iconColor: "text-white", live: true },
    "done":         { bg: "bg-surface-2",       border: "border-line",       icon: <CheckCircle2 size={18}/>, iconBg: "bg-jade-soft",  iconColor: "text-jade-2", live: false },
    "cancelled":    { bg: "bg-surface-2",       border: "border-line",       icon: <X size={18}/>,            iconBg: "bg-line",       iconColor: "text-ink-3",  live: false },
  };
  const p = palette[eta.kind] || palette["done"];
  return (
    <div className={`rounded-xl border ${p.border} ${p.bg} px-4 py-3 mb-4 flex items-center gap-4`}>
      <div className={`w-10 h-10 rounded-lg ${p.iconBg} ${p.iconColor} flex items-center justify-center shrink-0`}>
        {p.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] font-semibold text-ink-2 mb-0.5">
          {p.live && <span className="w-1.5 h-1.5 rounded-full bg-jade-2 pulse-dot" />}
          {p.live ? "Live" : "Status"} · {eta.label}
        </div>
        <div className="font-display text-[20px] font-medium leading-tight text-ink">{eta.value}</div>
        <div className="text-[11.5px] text-ink-2 mt-0.5">{eta.sub}</div>
      </div>
      {p.live && (
        <div className="text-[10px] text-ink-3 font-mono shrink-0 self-start mt-1">updates 30s</div>
      )}
    </div>
  );
}

function RouteIcon({ left, right }) {
  return (
    <span className="inline-flex items-center gap-0.5 shrink-0">
      {left}
      <span className="text-[9px] text-ink-3/70 mx-px">+</span>
      {right}
    </span>
  );
}

function OrdersFilterPill({ active, accent, onClick, children }) {
  const activeColor = accent === "crimson"
    ? "bg-crimson-soft border-crimson text-crimson"
    : "bg-jade-soft border-jade text-jade-2";
  return (
    <button
      onClick={onClick}
      className={
        "px-2.5 py-1 rounded-full border text-[11.5px] transition " +
        (active ? `${activeColor} font-medium` : "bg-surface border-line text-ink-2 hover:border-line-2 hover:text-ink")
      }
    >
      {children}
    </button>
  );
}

function OrdersView({ prefill }) {
  const [step, setStep] = useState(prefill?.step || 1);
  const [route, setRoute] = useState(null);
  const [stat, setStat] = useState(false); // STAT = urgent routing, propagates downstream
  const [selectedPatientId, setSelectedPatientId] = useState(prefill?.patientId || "P-9134");
  const [selectedTests, setSelectedTests] = useState(["hba1c", "lipid", "lft", "creat"]);
  const [showQuickOrderBanner, setShowQuickOrderBanner] = useState(!!prefill);

  // React to prefill changes (when Quick order is invoked while OrdersView already mounted)
  useEffect(() => {
    if (prefill) {
      setSelectedPatientId(prefill.patientId);
      setStep(prefill.step || 2);
      setShowQuickOrderBanner(true);
    }
  }, [prefill?.key]);

  const patient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const total = useMemo(
    () => selectedTests.reduce((s, t) => s + (TEST_CATALOG[t]?.price || 0), 0),
    [selectedTests]
  );

  const titleByStep = {
    1: <>Order labs — <span className="text-jade-2">who's the patient?</span></>,
    2: <>Order labs for <span className="text-jade-2">{patient.name}</span></>,
    3: <>Who draws the blood?</>,
    4: <>Confirm and place order</>,
  };

  // Right rail: context-sensitive per architecture spec §3 (round 3)
  // - No logistics on steps 1+2
  // - Courier card on steps 3+4 only when route === "pickup"
  // - Walk-in on steps 3+4 shows PSC info instead
  const showCourierCard = (step === 3 || step === 4) && route === "pickup";
  const showWalkinCard  = (step === 3 || step === 4) && route === "walkin";

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto">
      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-3 flex items-center gap-2">
        Orders · drafting
        {stat && (
          <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-white bg-crimson px-1.5 py-0.5 rounded">
            <Zap size={9} /> STAT
          </span>
        )}
      </div>
      <h1 className="font-display text-[30px] font-medium leading-none mb-5">{titleByStep[step]}</h1>

      {/* Quick-order context banner — when arriving from a patient chart */}
      {showQuickOrderBanner && (
        <div className="mb-5 rounded-lg border border-jade bg-jade-soft px-4 py-2.5 flex items-center gap-3">
          <Zap size={14} className="text-jade shrink-0" />
          <div className="flex-1 text-[12.5px] text-ink-2">
            <span className="font-medium text-jade">Quick order from chart.</span> Patient already selected — Step 1 (search) skipped. You can change patient by clicking Step 1 above.
          </div>
          <button onClick={() => setShowQuickOrderBanner(false)} className="text-ink-3 hover:text-ink shrink-0">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Step nav — clickable */}
      <div className="flex items-center gap-2 mb-6 text-[12px]">
        <StepNav n="1" label="Patient" step={step} target={1} setStep={setStep} />
        <Bar />
        <StepNav n="2" label="Tests" step={step} target={2} setStep={setStep} />
        <Bar />
        <StepNav n="3" label="Sample routing" step={step} target={3} setStep={setStep} />
        <Bar />
        <StepNav n="4" label="Confirm" step={step} target={4} setStep={setStep} />
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8">
          {step === 1 && (
            <OrderStep1
              selected={selectedPatientId}
              onSelect={setSelectedPatientId}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <OrderStep2
              patient={patient}
              selected={selectedTests}
              onChange={setSelectedTests}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <OrderStep3
              route={route}
              setRoute={setRoute}
              stat={stat}
              setStat={setStat}
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <OrderStep4
              patient={patient}
              tests={selectedTests}
              route={route}
              stat={stat}
              total={total}
              onBack={() => setStep(3)}
            />
          )}
        </div>

        {/* Right rail — context-sensitive per spec */}
        <div className="col-span-4 space-y-4">
          <OrderDraftCard patient={patient} tests={selectedTests} total={total} step={step} stat={stat} route={route} />
          {showCourierCard && <CourierRouteCard stat={stat} />}
          {showWalkinCard  && <WalkinPSCCard stat={stat} />}
        </div>
      </div>
    </div>
  );
}

/* ---------- Step nav ---------- */
function StepNav({ n, label, step, target, setStep }) {
  const done = step > target;
  const current = step === target;
  return (
    <button onClick={() => setStep(target)} className="flex items-center gap-2 hover:opacity-80 transition">
      <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-medium ${
        done ? "bg-jade text-white border-jade" :
        current ? "bg-surface text-jade border-jade ring-jade" :
        "bg-surface text-ink-3 border-line"
      }`}>
        {done ? <CheckCircle2 size={12} /> : n}
      </div>
      <span className={current ? "font-medium" : done ? "text-ink-2" : "text-ink-3"}>{label}</span>
    </button>
  );
}
function Bar() { return <div className="flex-1 h-px bg-line max-w-[60px]" />; }

/* ---------- Step 1 — "Who's the patient?" search-first w/ realtime dedup ----------
   Per architecture spec §3 (round 3+4):
   - Search-first across (a) doctor's panel, (b) Kura-wide patient_identity, (c) "+ Add new"
   - Hard phone match elevates a bridge banner with provenance
   - Soft name match shown as informational, non-blocking
   - "+ Add new patient" inline form with realtime phone dedup as you type
   - T3-cold default with TG-first unlock UX (TG primary, cabinet-capture demoted, skip = deferred)
*/
function OrderStep1({ selected, onSelect, onNext }) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("search"); // "search" | "create"
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [newKhmer, setNewKhmer] = useState("");
  const [unlockPath, setUnlockPath] = useState("tg"); // "tg" | "cabinet" | "skip"

  // Demo: simulated Kura-wide records (outside this doctor's panel)
  const kuraWide = [
    {
      id: "K-44102", name: "Dara Heng", khmer: "ហេង ដារា",
      age: 58, sex: "M", phone: "+855 12 884 419",
      provenance: "In Dr. Lim's panel · BKK2", bridge: "T1",
    },
    {
      id: "K-29871", name: "Sokunthea Phan", khmer: "ផន សុគន្ធា",
      age: 41, sex: "F", phone: "+855 17 552 003",
      provenance: "Last seen at PSC BKK1 · 6 mo ago", bridge: "T2",
    },
  ];

  // Realtime phone dedup — fires when 8+ digits typed in the create form
  const phoneDigits = newPhone.replace(/\D/g, "");
  const phoneHardMatch = phoneDigits.length >= 8
    ? kuraWide.find(p => p.phone.replace(/\D/g, "").endsWith(phoneDigits.slice(-8)))
    : null;

  // Soft name match in create form (illustrative)
  const nameSoftMatch = newName.trim().length >= 3
    ? kuraWide.filter(p => p.name.toLowerCase().includes(newName.trim().toLowerCase()))
    : [];

  // Search results: panel (own) + Kura-wide
  const q = query.trim().toLowerCase();
  const ownPanelHits = q
    ? patients.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.khmer.includes(query.trim()) ||
        p.id.toLowerCase().includes(q))
    : [];
  const kuraWideHits = q
    ? kuraWide.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.phone.replace(/\D/g, "").includes(q.replace(/\D/g, "")))
    : [];

  // Recent patients in own panel (when no query)
  const recent = patients.slice(0, 5);

  if (mode === "create") {
    return (
      <div className="bg-surface border border-line rounded-xl p-5">
        <button
          onClick={() => { setMode("search"); setNewPhone(""); setNewName(""); setNewKhmer(""); }}
          className="text-[12px] text-ink-3 hover:text-ink inline-flex items-center gap-1 mb-3"
        >
          <ChevronLeft size={13} /> Back to search
        </button>
        <h2 className="font-display text-[19px] font-medium mb-1">Add a new patient</h2>
        <p className="text-[12px] text-ink-3 mb-4">
          Phone is captured first — it's the dedup key. We check against Kura-wide records as you type.
        </p>

        {/* Phone — primary dedup key */}
        <div className="mb-3">
          <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1.5">
            Phone <span className="text-terracotta normal-case tracking-normal">· primary dedup key</span>
          </label>
          <div className="relative">
            <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <input
              value={newPhone}
              onChange={e => setNewPhone(e.target.value)}
              placeholder="+855 12 ..."
              className={`w-full bg-surface-2 border rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono focus:outline-none ${
                phoneHardMatch ? "border-amber bg-amber-soft" : "border-line-2 focus:border-jade"
              }`}
            />
          </div>
          {phoneDigits.length > 0 && phoneDigits.length < 8 && (
            <div className="text-[10.5px] text-ink-3 mt-1">
              {8 - phoneDigits.length} more digit{8 - phoneDigits.length === 1 ? "" : "s"} before we check Kura-wide records…
            </div>
          )}
        </div>

        {/* Hard phone match — bridge instead modal-style banner */}
        {phoneHardMatch && (
          <div className="mb-4 rounded-lg border-2 border-amber bg-amber-soft p-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-amber text-white flex items-center justify-center shrink-0">
                <AlertTriangle size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-ink mb-0.5">
                  Hard phone match — this person already exists at Kura
                </div>
                <div className="text-[12.5px] font-medium">{phoneHardMatch.name} · <span className="text-ink-3 font-normal">{phoneHardMatch.khmer}</span></div>
                <div className="text-[11px] text-ink-2 mt-0.5">
                  {phoneHardMatch.provenance} · Bridge tier <span className="font-mono">{phoneHardMatch.bridge}</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => { onSelect(phoneHardMatch.id); setMode("search"); }}
                    className="inline-flex items-center gap-1.5 bg-jade text-white rounded-md px-3 py-1.5 text-[11.5px] font-medium hover:bg-jade-2"
                  >
                    Bridge to your panel <ArrowRight size={11} />
                  </button>
                  <button className="text-[11px] text-ink-3 hover:text-ink px-2 py-1">
                    Override — create new (logged)
                  </button>
                </div>
                <div className="text-[10.5px] text-ink-3 mt-2 leading-snug">
                  Override is doctor-tier only. Reception forwards conflicts to the doctor. All overrides go in the audit trail.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Names */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1.5">Name (Latin)</label>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Dara Heng"
              className="w-full bg-surface-2 border border-line-2 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-jade"
            />
          </div>
          <div>
            <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1.5">Name (Khmer)</label>
            <input
              value={newKhmer}
              onChange={e => setNewKhmer(e.target.value)}
              placeholder="ឧ. ហេង ដារា"
              className="w-full bg-surface-2 border border-line-2 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-jade"
            />
          </div>
        </div>

        {/* Soft name match — informational, non-blocking */}
        {nameSoftMatch.length > 0 && !phoneHardMatch && (
          <div className="mb-4 rounded-lg border border-line bg-surface-2 p-3">
            <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1.5">
              <AlertTriangle size={11} /> Soft name match · informational
            </div>
            <p className="text-[11.5px] text-ink-2 leading-snug mb-2">
              Similar names exist Kura-wide. Verify by phone before creating new — different phones, different people.
            </p>
            {nameSoftMatch.map(p => (
              <div key={p.id} className="flex items-center justify-between text-[11.5px] py-1">
                <div>
                  <span className="font-medium">{p.name}</span>{" "}
                  <span className="text-ink-3">· phone ends {p.phone.slice(-3)}</span>
                </div>
                <span className="text-[10.5px] text-ink-3">{p.provenance}</span>
              </div>
            ))}
          </div>
        )}

        <div className="hairline my-5" />

        {/* T3 cold default + TG-first unlock UX */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] font-semibold text-ink-3 bg-line-2 px-1.5 py-0.5 rounded">
              <Lock size={9} /> T3 · Cold
            </span>
            <span className="text-[11px] text-ink-3">— default tier on cabinet creation. No insurance billing until upgraded.</span>
          </div>
          <p className="text-[11.5px] text-ink-2 mb-3 leading-snug">
            Pick how identity gets verified. <span className="text-jade font-medium">Telegram is the primary path</span> — the patient does the work, not you.
          </p>

          <div className="space-y-2">
            {/* Primary: TG-first */}
            <button
              onClick={() => setUnlockPath("tg")}
              className={`w-full text-left rounded-lg border-2 p-3.5 transition ${
                unlockPath === "tg" ? "border-jade bg-jade-soft" : "border-line bg-surface hover:border-ink"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 ${
                  unlockPath === "tg" ? "bg-ink border-ink" : "border-line"
                }`}>
                  {unlockPath === "tg" && <div className="w-full h-full rounded-full bg-surface scale-50" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-[13.5px] font-semibold inline-flex items-center gap-1.5">
                      <Send size={12} className="text-jade" /> Send Telegram verification
                    </h3>
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-jade bg-surface px-1.5 py-0.5 rounded">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11.5px] text-ink-2 leading-snug">
                    Patient gets a TG link. Phone-confirm self-services <span className="font-mono">T3 → T1</span>. Optional national ID self-capture (selfie + ID photo via TG bot) goes <span className="font-mono">T1 → T2</span>. You don't capture anything.
                  </p>
                </div>
              </div>
            </button>

            {/* Demoted: cabinet-capture */}
            <button
              onClick={() => setUnlockPath("cabinet")}
              className={`w-full text-left rounded-lg border p-3 transition ${
                unlockPath === "cabinet" ? "border-ink bg-surface-2" : "border-line bg-surface hover:border-ink"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-3.5 h-3.5 rounded-full border-2 mt-0.5 shrink-0 ${
                  unlockPath === "cabinet" ? "bg-ink border-ink" : "border-line"
                }`}>
                  {unlockPath === "cabinet" && <div className="w-full h-full rounded-full bg-surface scale-50" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-medium inline-flex items-center gap-1.5">
                    <CreditCard size={11} className="text-ink-3" /> Or — capture national ID at cabinet
                  </div>
                  <p className="text-[11px] text-ink-3 leading-snug mt-0.5">
                    Fallback for digitally-illiterate or older patients who won't follow a TG link. Upgrades <span className="font-mono">T3 → T2</span> directly. Costs your time.
                  </p>
                </div>
              </div>
            </button>

            {/* Tertiary: skip — corrected framing */}
            <button
              onClick={() => setUnlockPath("skip")}
              className={`w-full text-left rounded-lg border p-3 transition ${
                unlockPath === "skip" ? "border-ink bg-surface-2" : "border-line bg-surface hover:border-ink"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-3.5 h-3.5 rounded-full border-2 mt-0.5 shrink-0 ${
                  unlockPath === "skip" ? "bg-ink border-ink" : "border-line"
                }`}>
                  {unlockPath === "skip" && <div className="w-full h-full rounded-full bg-surface scale-50" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-medium text-ink-2">Or — skip for now</div>
                  <p className="text-[11px] text-ink-3 leading-snug mt-0.5">
                    Order proceeds as cash/self-pay. No insurance on this order. Deferred indefinitely — trigger TG later if billing comes up. <span className="italic">Not</span> "patient walks into PSC later."
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="hairline my-5" />
        <div className="flex items-center justify-between">
          <button onClick={() => setMode("search")} className="text-[12px] text-ink-3 hover:text-ink">Cancel</button>
          <button
            onClick={onNext}
            disabled={!newName || phoneDigits.length < 8 || !!phoneHardMatch}
            className="inline-flex items-center gap-1.5 bg-jade text-white rounded-lg px-4 py-2 text-[13px] font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create patient & continue <ArrowRight size={13} />
          </button>
        </div>
      </div>
    );
  }

  // Default: search mode
  return (
    <div className="bg-surface border border-line rounded-xl p-5">
      <h2 className="font-display text-[19px] font-medium mb-1">Who's the patient?</h2>
      <p className="text-[12px] text-ink-3 mb-4">
        Search across Kura-wide records — your panel, other doctors' panels, PSC visits. Hard phone matches surface a bridge action; soft name matches are informational.
      </p>

      {/* Unified search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, phone, ID, or Khmer name…"
          className="w-full bg-surface-2 border border-line-2 rounded-lg pl-9 pr-3 py-2.5 text-sm placeholder:text-ink-3 focus:outline-none focus:border-jade"
        />
      </div>

      {/* Always-available: + Add new patient */}
      <button
        onClick={() => { setMode("create"); setNewName(query); }}
        className="w-full mb-4 text-[12px] text-jade-2 hover:bg-jade-soft inline-flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-jade rounded-lg transition font-medium"
      >
        <Plus size={13} /> Add new patient {query && <span className="text-ink-3 font-normal">— "{query}"</span>}
      </button>

      {/* Section A: own panel */}
      {q && ownPanelHits.length > 0 && (
        <>
          <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-2">Your panel <span className="font-mono">{ownPanelHits.length}</span></div>
          <div className="space-y-1.5 mb-4">
            {ownPanelHits.map(p => (
              <PatientHitRow key={p.id} p={p} selected={selected === p.id} onSelect={onSelect} provenance="In your panel" />
            ))}
          </div>
        </>
      )}

      {/* Section B: Kura-wide (with provenance) */}
      {q && kuraWideHits.length > 0 && (
        <>
          <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-2 flex items-center gap-2">
            Kura-wide records <span className="font-mono">{kuraWideHits.length}</span>
            <span className="text-ink-3 normal-case tracking-normal text-[10px]">— bridge to add to your panel</span>
          </div>
          <div className="space-y-1.5 mb-4">
            {kuraWideHits.map(p => (
              <KuraWideHitRow key={p.id} p={p} />
            ))}
          </div>
        </>
      )}

      {/* When no query — recent patients */}
      {!q && (
        <>
          <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-2">Recent in your panel</div>
          <div className="space-y-1.5 mb-4">
            {recent.map(p => (
              <PatientHitRow key={p.id} p={p} selected={selected === p.id} onSelect={onSelect} provenance="In your panel" />
            ))}
          </div>
        </>
      )}

      {q && ownPanelHits.length === 0 && kuraWideHits.length === 0 && (
        <div className="text-center py-6 text-[12px] text-ink-3 border border-dashed border-line rounded-lg mb-4">
          No matches in your panel or Kura-wide. Add this person as a new patient.
        </div>
      )}

      <div className="hairline my-5" />
      <div className="flex items-center justify-end">
        <button
          onClick={onNext}
          disabled={!selected}
          className="inline-flex items-center gap-1.5 bg-jade text-white rounded-lg px-4 py-2 text-[13px] font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue to tests <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

function PatientHitRow({ p, selected, onSelect, provenance }) {
  return (
    <button
      onClick={() => onSelect(p.id)}
      className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition ${
        selected ? "border-jade bg-jade-soft" : "border-line hover:border-ink"
      }`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-medium text-[11px] shrink-0 ${
        selected ? "bg-jade text-white" : "bg-line-2 text-ink-2"
      }`}>
        {p.name.split(" ").map(n => n[0]).join("")}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium">{p.name}</div>
        <div className="text-[10.5px] text-ink-3 truncate">
          {p.khmer} · {p.age}{p.sex} · <span className="font-mono">{p.id}</span> · {provenance}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[10px] uppercase tracking-[0.14em] text-ink-3">last seen</div>
        <div className="text-[11px] text-ink-2 font-mono">{p.lastSeen}</div>
      </div>
      {selected && <CheckCircle2 size={16} className="text-jade shrink-0" />}
    </button>
  );
}

function KuraWideHitRow({ p }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-line bg-surface-2">
      <div className="w-9 h-9 rounded-full bg-line-2 text-ink-3 flex items-center justify-center font-medium text-[11px] shrink-0">
        {p.name.split(" ").map(n => n[0]).join("")}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium flex items-center gap-2">
          {p.name}
          <span className="text-[9px] uppercase tracking-wider font-semibold text-ink-3 bg-line-2 px-1.5 py-0.5 rounded">
            {p.bridge}
          </span>
        </div>
        <div className="text-[10.5px] text-ink-3 truncate">
          {p.khmer} · {p.age}{p.sex} · <span className="font-mono">{p.phone}</span>
        </div>
        <div className="text-[10px] text-plum mt-0.5">{p.provenance}</div>
      </div>
      <button className="inline-flex items-center gap-1 text-[11px] text-jade-2 px-2.5 py-1.5 rounded-md border border-jade hover:bg-jade-soft font-medium">
        Bridge <ArrowRight size={11} />
      </button>
    </div>
  );
}

/* ---------- Step 2 — test catalog ---------- */
function OrderStep2({ patient, selected, onChange, onBack, onNext }) {
  const suggested = [
    { id: "hba1c", reason: "T2DM follow-up" },
    { id: "lipid", reason: "Lipid trend (last LDL 142)" },
    { id: "lft",   reason: "Statin monitoring" },
    { id: "creat", reason: "Renal screening" },
  ];
  const browse = ["tsh", "vitd", "urinr", "cbc", "fer", "hsv"];

  const toggle = id => {
    if (selected.includes(id)) onChange(selected.filter(x => x !== id));
    else onChange([...selected, id]);
  };

  const categories = ["All", "Chemistry", "Hematology", "Endocrinology", "Immunology", "Microbiology", "Molecular", "Allergy", "Pap", "Urinalysis"];

  return (
    <div className="bg-surface border border-line rounded-xl p-5">
      <h2 className="font-display text-[19px] font-medium mb-1">Pick tests</h2>
      <p className="text-[12px] text-ink-3 mb-4">
        Suggestions reflect {patient.name}'s active care plan and recent trends. Search the full catalog of 380+ tests for anything else.
      </p>

      <div className="relative mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
        <input
          placeholder="Search 380+ tests…"
          className="w-full bg-surface-2 border border-line-2 rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-ink-3 focus:outline-none focus:border-jade"
        />
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={12} className="text-jade-2" />
        <div className="text-[10.5px] uppercase tracking-[0.16em] text-jade-2 font-semibold">
          Suggested for {patient.name}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {suggested.map(s => (
          <TestCard
            key={s.id}
            id={s.id}
            test={TEST_CATALOG[s.id]}
            reason={s.reason}
            selected={selected.includes(s.id)}
            onToggle={() => toggle(s.id)}
            suggested
          />
        ))}
      </div>

      <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-2">Browse catalog</div>
      <div className="flex gap-1 mb-3 flex-wrap">
        {categories.map((c, i) => (
          <button
            key={c}
            className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
              i === 0 ? "bg-jade text-white border-ink" : "bg-surface border-line text-ink-2 hover:border-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {browse.map(id => (
          <TestCard
            key={id}
            id={id}
            test={TEST_CATALOG[id]}
            selected={selected.includes(id)}
            onToggle={() => toggle(id)}
          />
        ))}
      </div>

      <div className="hairline my-5" />
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-[12px] text-ink-3 hover:text-ink">← Back to patient</button>
        <button
          onClick={onNext}
          disabled={selected.length === 0}
          className="inline-flex items-center gap-1.5 bg-jade text-white rounded-lg px-4 py-2 text-[13px] font-medium hover:opacity-90 disabled:opacity-40"
        >
          Continue to routing <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

function TestCard({ test, selected, onToggle, suggested, reason }) {
  return (
    <button
      onClick={onToggle}
      className={`text-left p-3 rounded-lg border transition ${
        selected ? "border-jade bg-jade-soft" : "border-line hover:border-ink"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="text-[13px] font-medium leading-snug">{test.name}</div>
        <div className="font-mono text-[11px] text-ink-2 shrink-0">${test.price}</div>
      </div>
      <div className="flex items-center justify-between text-[10.5px] text-ink-3">
        <span>{test.category} · TAT {test.tat}</span>
        {selected ? <CheckCircle2 size={13} className="text-jade" /> : <Plus size={13} />}
      </div>
      {suggested && reason && (
        <div className="text-[10px] text-jade-2 mt-1.5 inline-flex items-center gap-1">
          <ArrowRight size={9} /> {reason}
        </div>
      )}
    </button>
  );
}

/* ---------- Step 3 — sample routing + STAT toggle ----------
   Per architecture spec §3 (round 3):
   - STAT is a property of the order, not just the routing
   - Toggle on this step with copy that adapts to the chosen route
   - Propagates downstream to patient SMS, courier dispatch, lab queue priority
*/
function OrderStep3({ route, setRoute, stat, setStat, onBack, onNext }) {
  const statCopy = {
    pickup: {
      label: "Dispatch a courier now (~30 min ETA)",
      detail: "Adds STAT dispatch fee. Lab prioritizes on receipt. SMS sent to patient: \"Courier dispatched now to collect your sample.\"",
      tat: "Lab TAT: 2h on common STAT panel (CBC, BMP, troponin, lipase, lactate). Other tests fall back to routine TAT.",
    },
    walkin: {
      label: "Patient must go to PSC now",
      detail: "URGENT-framed SMS sent immediately. Lab prioritizes on receipt. No STAT pickup fee — patient travels.",
      tat: "Lab TAT: 2h on common STAT panel from PSC arrival. Other tests routine.",
    },
    dispatch: {
      label: "Nearest phlebotomist dispatched now",
      detail: "Phase-2 only. Once HBC coverage exists in this region.",
      tat: "—",
    },
  };
  const currentStatCopy = statCopy[route];

  return (
    <div className="bg-surface border border-line rounded-xl p-5">
      <h2 className="font-display text-[19px] font-medium mb-1">Who draws the blood?</h2>
      <p className="text-[12px] text-ink-3 mb-4">
        First decide who's holding the needle — that determines the patient flow, identity tier, and tracking surface.
      </p>

      <div className="space-y-5">
        {/* Group A — doctor draws */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-0.5">
            <span className="w-5 h-5 rounded-md bg-terracotta-soft text-terracotta flex items-center justify-center shrink-0">
              <Syringe size={11} />
            </span>
            <span className="text-[10.5px] uppercase tracking-[0.16em] font-semibold text-ink">I draw the blood</span>
            <span className="text-[11px] text-ink-3 normal-case tracking-normal">— at your cabinet</span>
          </div>
          <RouteOption
            id="pickup" active={route === "pickup"} onClick={() => setRoute("pickup")}
            title="Tube pickup at your cabinet"
            sub="You draw at your cabinet; Kura courier collects on the regional route. Geographic reach extension."
            meta={["Courier (no medical contact)", "T3 identity from your labels", "Next pickup: today 16:40"]}
            accent="terracotta"
          />
        </div>

        {/* Group B — Kura draws */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-0.5">
            <span className="w-5 h-5 rounded-md bg-jade-soft text-jade flex items-center justify-center shrink-0">
              <Building2 size={11} />
            </span>
            <span className="text-[10.5px] uppercase tracking-[0.16em] font-semibold text-ink">Kura draws the blood</span>
            <span className="text-[11px] text-ink-3 normal-case tracking-normal">— phlebotomist captures identity</span>
          </div>
          <div className="space-y-2">
            <RouteOption
              id="walkin" active={route === "walkin"} onClick={() => setRoute("walkin")}
              title="Booking code → patient walks into a Kura PSC"
              sub="Patient gets a code + QR. Reception captures identity. Phlebotomist draws on-site. Use when you don't draw blood yourself."
              meta={["Kura phlebotomist", "T1 identity at reception", "Closest PSC: BKK1 (1.2 km)"]}
              accent="jade"
            />
            <RouteOption
              id="dispatch" active={false} onClick={() => {}}
              title="Home blood collection (HBC)"
              sub="Kura phlebotomist arrives at the patient's home, draws, and captures identity in person. Best for elderly or remote patients."
              meta={["Kura phlebotomist + GPS tracking", "T1 identity in person", "Phase-2 launch"]}
              accent="plum"
              badge="Coming soon"
              disabled
            />
          </div>
        </div>
      </div>

      {/* STAT toggle — propagates through SMS, dispatch, lab queue */}
      <div className={`mt-4 rounded-lg border-2 p-4 transition ${
        stat ? "border-crimson bg-crimson-soft" : "border-line bg-surface-2"
      }`}>
        <div className="flex items-start gap-3">
          <button
            onClick={() => setStat(!stat)}
            role="switch"
            aria-checked={stat}
            className={`relative w-9 h-5 rounded-full transition shrink-0 mt-0.5 ${
              stat ? "bg-crimson" : "bg-line"
            }`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-surface transition shadow-sm ${
              stat ? "left-[18px]" : "left-0.5"
            }`} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-[13.5px] font-semibold inline-flex items-center gap-1.5">
                <Zap size={13} className={stat ? "text-crimson" : "text-ink-3"} />
                STAT — urgent routing
              </h3>
              {stat && (
                <span className="text-[9px] uppercase tracking-wider font-bold text-white bg-crimson px-1.5 py-0.5 rounded">
                  Active
                </span>
              )}
            </div>
            <p className="text-[11.5px] text-ink-2 leading-snug">
              {stat ? currentStatCopy.label : "Off — routine routing. SMS, dispatch, and lab queue follow scheduled cadence."}
            </p>
            {stat && (
              <>
                <p className="text-[11px] text-ink-3 leading-snug mt-1.5">
                  {currentStatCopy.detail}
                </p>
                <p className="text-[10.5px] text-ink-3 leading-snug mt-1 font-mono">
                  {currentStatCopy.tat}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[10.5px] text-ink-3">
                  <span className="inline-flex items-center gap-1"><Send size={9} /> URGENT SMS</span>
                  <span className="inline-flex items-center gap-1"><Motorbike size={9} /> STAT dispatch</span>
                  <span className="inline-flex items-center gap-1"><FlaskConical size={9} /> Front of lab queue</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="hairline my-5" />
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-[12px] text-ink-3 hover:text-ink">← Back to tests</button>
        <button
          onClick={onNext}
          disabled={!route}
          className="inline-flex items-center gap-1.5 bg-jade text-white rounded-lg px-4 py-2 text-[13px] font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {route ? "Continue to confirm" : "Pick a draw method to continue"} <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

/* ---------- Step 4 — confirm ---------- */
function OrderStep4({ patient, tests, route, stat, total, onBack }) {
  const routeLabels = {
    walkin: {
      label: "Patient walks into BKK1 PSC",
      sub: "Booking code + QR sent to patient via SMS + Telegram. T1 identity captured at reception.",
      icon: <Building2 size={16} />,
    },
    pickup: {
      label: "Tube pickup at your cabinet",
      sub: stat
        ? "STAT courier dispatched now · ~30 min ETA. T3 identity from your labels."
        : "Courier route 16:40 today · Sopheap T. KH-3401. T3 identity from your labels.",
      icon: <Motorbike size={16} />,
    },
    dispatch: {
      label: "Phlebotomist dispatched to patient's address",
      sub: "ETA 90 min in BKK1 · GPS-tracked · T1 identity captured in person.",
      icon: <MapPin size={16} />,
    },
  };
  const r = routeLabels[route];

  return (
    <div className="bg-surface border border-line rounded-xl p-5">
      <div className="flex items-start justify-between mb-1">
        <h2 className="font-display text-[19px] font-medium">Confirm and place</h2>
        {stat && (
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-white bg-crimson px-2 py-1 rounded">
            <Zap size={11} /> STAT order
          </span>
        )}
      </div>
      <p className="text-[12px] text-ink-3 mb-4">Review the full order before submitting. Patient and insurance billing happen automatically.</p>

      <ConfirmBlock label="Patient" onEdit={() => {}}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-jade-soft text-jade flex items-center justify-center font-medium text-[12px]">
            {patient.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <div className="text-[14px] font-medium">{patient.name}</div>
            <div className="text-[11px] text-ink-3">
              {patient.khmer} · <span className="font-mono">{patient.id}</span> · {patient.age}{patient.sex} · {patient.insurance}
            </div>
          </div>
        </div>
      </ConfirmBlock>

      <ConfirmBlock label={`Tests (${tests.length})`} onEdit={() => {}}>
        <ul className="text-[12.5px] space-y-1">
          {tests.map(t => (
            <li key={t} className="flex justify-between">
              <span>· {TEST_CATALOG[t]?.name || t}</span>
              <span className="font-mono text-ink-3">${TEST_CATALOG[t]?.price || 0}</span>
            </li>
          ))}
        </ul>
        <div className="hairline my-2" />
        <div className="flex justify-between text-[13px] font-medium">
          <span>Subtotal</span>
          <span className="font-mono">${total}.00{stat && route === "pickup" && <span className="text-crimson"> + STAT fee</span>}</span>
        </div>
      </ConfirmBlock>

      <ConfirmBlock label={stat ? "Sample routing · STAT" : "Sample routing"} onEdit={() => {}}>
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
            stat ? "bg-crimson-soft text-crimson" : "bg-line-2 text-ink-2"
          }`}>{r.icon}</div>
          <div>
            <div className="text-[13px] font-medium flex items-center gap-2">
              {r.label}
              {stat && <Zap size={11} className="text-crimson" />}
            </div>
            <div className="text-[11px] text-ink-3 mt-0.5 leading-snug">{r.sub}</div>
          </div>
        </div>
      </ConfirmBlock>

      <ConfirmBlock label="Billing">
        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-0.5">Insurance</div>
            <div>{patient.insurance} · billed direct{stat && <span className="text-ink-3"> · STAT code attached when clinically justified</span>}</div>
          </div>
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-0.5">Patient owes at draw</div>
            <div className="font-mono">$0.00</div>
          </div>
        </div>
      </ConfirmBlock>

      <ConfirmBlock label="Patient will receive">
        <ul className="text-[12px] space-y-1.5 text-ink-2">
          <li className="flex items-center gap-2">
            <Send size={11} className={stat ? "text-crimson shrink-0" : "text-ink-3 shrink-0"} />
            {stat
              ? <span><span className="font-semibold text-crimson">URGENT</span> SMS + Telegram — sent immediately with STAT framing</span>
              : "SMS + Telegram with booking code, QR, and prep instructions"}
          </li>
          <li className="flex items-center gap-2"><Sparkles size={11} className="text-ink-3 shrink-0" /> Smart report in their patient portal once results land</li>
          <li className="flex items-center gap-2"><FileText size={11} className="text-ink-3 shrink-0" /> Your signed legal report when you sign</li>
          {stat && (
            <li className="flex items-center gap-2"><Bell size={11} className="text-crimson shrink-0" /> You'll get an in-app push + SMS when STAT results land</li>
          )}
        </ul>
      </ConfirmBlock>

      <div className="hairline my-5" />
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-[12px] text-ink-3 hover:text-ink">← Back to routing</button>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 border border-line text-ink rounded-lg px-3 py-2 text-[12px] font-medium hover:border-ink">
            Save as draft
          </button>
          <button className={`inline-flex items-center gap-1.5 text-white rounded-lg px-4 py-2 text-[13px] font-medium ${
            stat ? "bg-crimson hover:opacity-90" : "bg-jade hover:bg-jade-2"
          }`}>
            {stat ? <>Place STAT order <Zap size={13} /></> : <>Place order <CheckCircle2 size={13} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmBlock({ label, children, onEdit }) {
  return (
    <div className="border border-line rounded-lg p-4 mb-2.5">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold">{label}</div>
        {onEdit && <button onClick={onEdit} className="text-[11px] text-jade-2 hover:underline">Edit</button>}
      </div>
      {children}
    </div>
  );
}

/* ---------- Right rail cards ---------- */
function OrderDraftCard({ patient, tests, total, step, stat, route }) {
  const routeLabel = {
    pickup: "Tube pickup at cabinet",
    walkin: "Walk-in to PSC BKK1",
    dispatch: "Phlebotomist dispatch (Phase 2)",
  };
  return (
    <div className="bg-surface border border-line rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3">Order draft</div>
        {stat && (
          <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-white bg-crimson px-1.5 py-0.5 rounded">
            <Zap size={9} /> STAT
          </span>
        )}
      </div>

      <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 mb-1">Patient</div>
      <div className="text-[13px] font-medium mb-3">
        {step >= 1 ? patient.name : <span className="text-ink-3 font-normal">— pick a patient</span>}
      </div>

      <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 mb-1">Tests ({tests.length})</div>
      {tests.length > 0 ? (
        <ul className="text-[12px] space-y-0.5 mb-3">
          {tests.map(t => (
            <li key={t} className="flex justify-between">
              <span className="text-ink-2 truncate pr-2">{TEST_CATALOG[t]?.name || t}</span>
              <span className="font-mono text-ink-3 shrink-0">${TEST_CATALOG[t]?.price || 0}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-[12px] text-ink-3 mb-3">— pick tests</div>
      )}

      {step >= 3 && (
        <>
          <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 mb-1">Routing</div>
          <div className="text-[12px] text-ink-2 mb-3">{routeLabel[route]}</div>
        </>
      )}

      <div className="hairline my-2" />
      <div className="flex justify-between text-[13px] font-medium">
        <span>Total</span>
        <span className="font-mono">${total}.00</span>
      </div>
      <p className="text-[10.5px] text-ink-3 mt-2 leading-snug">
        {patient.insurance} will be billed directly. Patient owes $0 at draw.
      </p>
    </div>
  );
}

function CourierRouteCard({ stat }) {
  return (
    <div className={`bg-surface border rounded-xl p-4 ${stat ? "border-crimson" : "border-line"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 flex items-center gap-1.5">
          {stat ? "STAT courier dispatch" : "Today's courier route"}
        </div>
        <span className={`inline-flex items-center gap-1 text-[10px] ${stat ? "text-crimson" : "text-jade-2"}`}>
          <span className={`w-1.5 h-1.5 rounded-full pulse-dot ${stat ? "bg-crimson" : "bg-jade-2"}`} /> {stat ? "Now" : "Live"}
        </span>
      </div>

      {stat ? (
        <>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-md bg-crimson-soft text-crimson flex items-center justify-center">
              <Zap size={14} />
            </div>
            <div className="leading-tight">
              <div className="text-[12.5px] font-medium">STAT dispatch initiated</div>
              <div className="text-[11px] text-ink-3">Nearest courier · ~30 min ETA</div>
            </div>
          </div>
          <div className="text-[11px] text-ink-2 leading-snug bg-crimson-soft border border-crimson rounded-md p-2.5">
            STAT bypasses the regular regional route. Lab will queue this sample at the front on receipt. STAT dispatch fee added to order.
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-md bg-terracotta-soft text-terracotta flex items-center justify-center">
              <Motorbike size={14} />
            </div>
            <div className="leading-tight">
              <div className="text-[12.5px] font-medium">Sopheap T. · KH-3401</div>
              <div className="text-[11px] text-ink-3">3 cabinets remaining · ETA your cabinet 16:40</div>
            </div>
          </div>
          <div className="space-y-1.5 text-[11.5px]">
            <Stop time="14:20" label="Dr. Pou cabinet · BKK3" done />
            <Stop time="15:05" label="Polyclinic Tonle · Russian Mkt" done />
            <Stop time="16:10" label="Dr. Lim cabinet · BKK2" current />
            <Stop time="16:40" label="Your cabinet · BKK1" />
          </div>
        </>
      )}
    </div>
  );
}

/* Walk-in PSC card — shown on Steps 3+4 when route === "walkin" */
function WalkinPSCCard({ stat }) {
  return (
    <div className={`bg-surface border rounded-xl p-4 ${stat ? "border-crimson" : "border-line"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3">
          {stat ? "STAT — patient SMS preview" : "Closest PSC for the patient"}
        </div>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
          stat ? "bg-crimson-soft text-crimson" : "bg-jade-soft text-jade"
        }`}>
          {stat ? <Zap size={14} /> : <Building2 size={14} />}
        </div>
        <div className="leading-tight">
          <div className="text-[12.5px] font-medium">PSC BKK1 · Phnom Penh</div>
          <div className="text-[11px] text-ink-3">1.2 km · open until 18:00 · phlebotomist on duty</div>
        </div>
      </div>
      {stat ? (
        <div className="text-[11px] text-ink-2 leading-snug bg-crimson-soft border border-crimson rounded-md p-2.5 font-mono">
          🚨 URGENT — Dr. Chann needs blood work now. Please go to PSC BKK1 immediately. Booking code: <span className="font-semibold">7K-2294</span>
        </div>
      ) : (
        <div className="text-[11px] text-ink-2 leading-snug bg-surface-2 border border-line rounded-md p-2.5">
          Patient gets booking code + QR via SMS + Telegram. Identity captured at reception (T1). Phlebotomist draws on-site.
        </div>
      )}
    </div>
  );
}

function RouteOption({ active, onClick, title, sub, meta, accent, badge, disabled }) {
  const ringColor = disabled
    ? "border-line bg-surface-2 opacity-60 cursor-not-allowed"
    : active
    ? accent === "jade" ? "border-jade bg-jade-soft"
    : accent === "terracotta" ? "border-terracotta bg-terracotta-soft"
    : "border-plum bg-line-2"
    : "border-line bg-surface hover:border-ink";
  const badgeTone = disabled
    ? "text-ink-3 bg-line-2"
    : badge === "Your default"
    ? "text-jade bg-jade-soft"
    : "text-terracotta bg-terracotta-soft";
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full text-left rounded-lg border-2 p-4 transition ${ringColor}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 ${
          disabled ? "border-line bg-surface-2" :
          active ? "bg-ink border-ink" : "border-line"
        }`}>
          {active && !disabled && <div className="w-full h-full rounded-full bg-surface scale-50" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-[13.5px] font-semibold flex items-center gap-1.5">
              {disabled && <Lock size={11} className="text-ink-3" />}
              {title}
            </h3>
            {badge && (
              <span className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${badgeTone}`}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-[11.5px] text-ink-2 mb-2 leading-snug">{sub}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10.5px] text-ink-3">
            {meta.map((m, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-line shrink-0" />{m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

function Stop({ time, label, done, current }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[10.5px] text-ink-3 w-10 shrink-0">{time}</span>
      <span className={`w-1.5 h-1.5 rounded-full ${done ? "bg-jade-2" : current ? "bg-terracotta pulse-dot" : "bg-line"}`} />
      <span className={done ? "text-ink-3 line-through" : current ? "text-ink font-medium" : "text-ink-2"}>{label}</span>
    </div>
  );
}

/* ============================================================
   LAB CATALOG VIEW — browseable directory of every test Kura offers
   - Search + category filter
   - Each row expands inline to show description, indications, prep
   - Reference ranges respect the doctor's US/SI preference
   - "Add to draft order" CTA seeds the Orders flow
   ============================================================ */
const LAB_CATALOG = [
  // Diabetes
  { code: "HBA1C",   name: "Glycated hemoglobin (HbA1c)", category: "Diabetes",
    sample: "EDTA whole blood · 3 mL", tat: "Same-day",  prep: "No fasting required",
    price: { usd: 8,  khr: "32,000" }, refUnit: "%", ref: "≤ 7.0",
    description: "Reflects 8–12 week average glycemia. Backbone of T2DM monitoring.",
    indications: ["T2DM diagnosis & monitoring", "Pre-diabetes screening", "Treatment response"],
    popular: true },
  { code: "FPG",     name: "Fasting plasma glucose",       category: "Diabetes",
    sample: "Fluoride plasma · 2 mL", tat: "Same-day", prep: "8 h fasting",
    price: { usd: 3, khr: "12,000" }, refUnit: "mg/dL", ref: "70–100",
    description: "Single-point fasting glucose. Cheap, fast, requires fasting.",
    indications: ["Diabetes screening", "Hypoglycemia work-up"],
    popular: true },
  { code: "OGTT",    name: "Oral glucose tolerance test (75 g)", category: "Diabetes",
    sample: "Plasma × 2 (0 + 2 h)", tat: "Same-day", prep: "8 h fasting · 2 h on-site",
    price: { usd: 10, khr: "40,000" }, refUnit: "mg/dL", ref: "< 140 (2 h)",
    description: "Gold standard for gestational DM and impaired glucose tolerance.",
    indications: ["Gestational DM (24–28 wk)", "Impaired fasting glucose work-up"] },
  { code: "RBG",     name: "Random blood glucose",         category: "Diabetes",
    sample: "Plasma · 2 mL", tat: "Same-day", prep: "None",
    price: { usd: 2, khr: "8,000" }, refUnit: "mg/dL", ref: "< 200",
    description: "Spot glucose. Useful for hyperglycemia screening at any time.",
    indications: ["Symptomatic hyperglycemia", "Walk-in screen"] },

  // Lipids
  { code: "LIPID",   name: "Lipid panel (TC + LDL + HDL + TG)", category: "Lipids",
    sample: "Serum · 3 mL", tat: "Same-day", prep: "9–12 h fasting recommended",
    price: { usd: 9, khr: "36,000" }, refUnit: "mg/dL", ref: "LDL < 100",
    description: "Bundled cardiovascular risk panel. Direct LDL or calculated.",
    indications: ["CVD risk stratification", "Statin titration"],
    popular: true },
  { code: "APOB",    name: "Apolipoprotein B",             category: "Lipids",
    sample: "Serum · 1 mL", tat: "48 h", prep: "Fasting preferred",
    price: { usd: 14, khr: "56,000" }, refUnit: "mg/dL", ref: "< 90",
    description: "More accurate atherogenic-particle marker than LDL-C in mixed dyslipidemia.",
    indications: ["Discordant LDL/TG", "Residual CVD risk"] },
  { code: "LPA",     name: "Lipoprotein(a)",                category: "Lipids",
    sample: "Serum · 1 mL", tat: "5 days · sent to Bangkok", prep: "None",
    price: { usd: 32, khr: "128,000" }, refUnit: "nmol/L", ref: "< 75",
    description: "Genetically determined atherogenic lipoprotein. Measure once per lifetime.",
    indications: ["Premature CVD", "Family hx of MI < 55"] },

  // Renal
  { code: "CRE",     name: "Creatinine + eGFR",             category: "Renal",
    sample: "Serum · 1 mL", tat: "Same-day", prep: "None",
    price: { usd: 3, khr: "12,000" }, refUnit: "mg/dL", ref: "0.7–1.2",
    description: "Kidney filtration marker. Auto-reported with CKD-EPI eGFR.",
    indications: ["CKD staging", "Pre-contrast imaging", "Drug dose adjustment"],
    popular: true },
  { code: "UACR",    name: "Urine albumin/creatinine ratio", category: "Renal",
    sample: "Spot urine · 5 mL", tat: "Same-day", prep: "First-morning preferred",
    price: { usd: 5, khr: "20,000" }, refUnit: "mg/g", ref: "< 30",
    description: "Earliest marker of diabetic / hypertensive nephropathy.",
    indications: ["Annual T2DM screen", "Hypertension nephropathy work-up"] },
  { code: "BMP",     name: "Basic metabolic panel (Na/K/Cl/HCO₃/BUN/Cr/Glu)", category: "Renal",
    sample: "Serum · 2 mL", tat: "Same-day", prep: "None",
    price: { usd: 7, khr: "28,000" }, refUnit: "—", ref: "Per-analyte",
    description: "Electrolytes + renal function bundle.",
    indications: ["Diuretic monitoring", "Hospital follow-up", "Vomiting/diarrhea"] },

  // Liver
  { code: "LFT",     name: "Liver function panel (ALT/AST/ALP/GGT/Bili/Alb)", category: "Liver",
    sample: "Serum · 2 mL", tat: "Same-day", prep: "None",
    price: { usd: 7, khr: "28,000" }, refUnit: "—", ref: "Per-analyte",
    description: "Bundled hepatocellular + cholestatic markers.",
    indications: ["Statin start", "Fatty liver", "Hepatitis follow-up"],
    popular: true },
  { code: "GGT",     name: "Gamma-glutamyl transferase",   category: "Liver",
    sample: "Serum · 1 mL", tat: "Same-day", prep: "None",
    price: { usd: 3, khr: "12,000" }, refUnit: "U/L", ref: "< 50",
    description: "Cholestasis + alcohol-related liver injury marker.",
    indications: ["ALP elevation work-up", "Alcohol use disorder"] },

  // Thyroid
  { code: "TSH",     name: "Thyroid-stimulating hormone",   category: "Thyroid",
    sample: "Serum · 1 mL", tat: "24 h", prep: "None",
    price: { usd: 6, khr: "24,000" }, refUnit: "mIU/L", ref: "0.4–4.0",
    description: "First-line thyroid screen.",
    indications: ["Fatigue / weight change", "Atrial fibrillation work-up", "Pregnancy"],
    popular: true },
  { code: "FT4",     name: "Free thyroxine (FT4)",          category: "Thyroid",
    sample: "Serum · 1 mL", tat: "24 h", prep: "None",
    price: { usd: 7, khr: "28,000" }, refUnit: "ng/dL", ref: "0.8–1.8",
    description: "Confirms thyroid dysfunction when TSH is abnormal.",
    indications: ["Reflex on abnormal TSH", "Hyperthyroidism monitoring"] },

  // Hematology
  { code: "CBC",     name: "Complete blood count + differential", category: "Hematology",
    sample: "EDTA whole blood · 3 mL", tat: "Same-day", prep: "None",
    price: { usd: 4, khr: "16,000" }, refUnit: "—", ref: "Per-analyte",
    description: "RBC, WBC + 5-part diff, platelets. Flagging algorithm + microscopy reflex.",
    indications: ["Fatigue / pallor", "Infection work-up", "Pre-op"],
    popular: true },
  { code: "FERR",    name: "Ferritin",                      category: "Hematology",
    sample: "Serum · 1 mL", tat: "24 h", prep: "None",
    price: { usd: 8, khr: "32,000" }, refUnit: "ng/mL", ref: "30–300",
    description: "Iron stores marker. Acute-phase reactant — interpret with CRP.",
    indications: ["Iron-deficiency anemia", "Restless legs", "Hair loss"] },

  // Cardiac
  { code: "TROP",    name: "High-sensitivity troponin I",   category: "Cardiac",
    sample: "Plasma · 1 mL", tat: "STAT — 60 min", prep: "None",
    price: { usd: 18, khr: "72,000" }, refUnit: "ng/L", ref: "< 14 (F) · < 22 (M)",
    description: "Myocardial injury marker. STAT-routable via Kura courier.",
    indications: ["Chest pain rule-out", "Suspected NSTEMI"] },
  { code: "BNP",     name: "NT-proBNP",                     category: "Cardiac",
    sample: "Plasma · 1 mL", tat: "Same-day", prep: "None",
    price: { usd: 22, khr: "88,000" }, refUnit: "pg/mL", ref: "< 125 (< 75 y)",
    description: "Heart failure marker. Age-adjusted thresholds.",
    indications: ["Dyspnea work-up", "HF monitoring"] },

  // Infectious / Cambodia-relevant
  { code: "HIV",     name: "HIV 4th-gen Ag/Ab",             category: "Infectious",
    sample: "Serum · 1 mL", tat: "Same-day", prep: "None",
    price: { usd: 6, khr: "24,000" }, refUnit: "—", ref: "Non-reactive",
    description: "Combined p24 antigen + HIV-1/2 antibody. Window ~14 days.",
    indications: ["Routine screen", "Post-exposure", "Pregnancy"] },
  { code: "HBSAG",   name: "Hepatitis B surface antigen",   category: "Infectious",
    sample: "Serum · 1 mL", tat: "Same-day", prep: "None",
    price: { usd: 4, khr: "16,000" }, refUnit: "—", ref: "Non-reactive",
    description: "Active HBV infection marker.",
    indications: ["Pregnancy screen", "Pre-treatment", "Liver disease work-up"] },
  { code: "DENG",    name: "Dengue NS1 + IgM/IgG",          category: "Infectious",
    sample: "Serum · 1 mL", tat: "Same-day", prep: "None",
    price: { usd: 9, khr: "36,000" }, refUnit: "—", ref: "Non-reactive",
    description: "Acute and convalescent dengue diagnosis. NS1 sensitive in days 1–5.",
    indications: ["Febrile illness in endemic season", "Suspected DHF"] },
  { code: "MAL",     name: "Malaria smear + RDT",            category: "Infectious",
    sample: "EDTA · 3 mL + capillary RDT", tat: "STAT — 30 min", prep: "None",
    price: { usd: 5, khr: "20,000" }, refUnit: "—", ref: "Non-reactive",
    description: "Thick + thin smear with species ID. Pf/Pv RDT in parallel.",
    indications: ["Fever after travel to endemic area", "Cyclical fever"] },

  // Vitamins / Hormones
  { code: "VITD",    name: "25-OH Vitamin D",               category: "Vitamins",
    sample: "Serum · 1 mL", tat: "48 h", prep: "None",
    price: { usd: 14, khr: "56,000" }, refUnit: "ng/mL", ref: "30–100",
    description: "Storage form of vitamin D. Most reliable status marker.",
    indications: ["Bone pain / osteoporosis", "Fatigue", "Pediatric growth"] },
  { code: "B12",     name: "Vitamin B12 (cobalamin)",       category: "Vitamins",
    sample: "Serum · 1 mL", tat: "24 h", prep: "None",
    price: { usd: 8, khr: "32,000" }, refUnit: "pg/mL", ref: "200–900",
    description: "Deficiency causes macrocytic anemia and neuropathy.",
    indications: ["Macrocytic anemia", "Peripheral neuropathy", "Vegan/elderly"] },
  { code: "TEST",    name: "Total testosterone",            category: "Hormones",
    sample: "Serum · 1 mL", tat: "24 h", prep: "Morning draw (07:00–10:00)",
    price: { usd: 11, khr: "44,000" }, refUnit: "ng/dL", ref: "264–916 (M)",
    description: "Morning sample preferred. Confirm low values on a second draw.",
    indications: ["Low libido", "ED", "Suspected hypogonadism"] },

  // Tumor markers
  { code: "PSA",     name: "Prostate-specific antigen",     category: "Tumor markers",
    sample: "Serum · 1 mL", tat: "24 h", prep: "Avoid ejaculation 48 h",
    price: { usd: 9, khr: "36,000" }, refUnit: "ng/mL", ref: "< 4.0 (age-adj.)",
    description: "Prostate cancer screening + BPH monitoring. Age-adjusted ref ranges.",
    indications: ["Men ≥ 50", "Family hx prostate Ca", "LUTS"] },
  { code: "AFP",     name: "Alpha-fetoprotein",             category: "Tumor markers",
    sample: "Serum · 1 mL", tat: "48 h", prep: "None",
    price: { usd: 10, khr: "40,000" }, refUnit: "ng/mL", ref: "< 10",
    description: "HCC surveillance in chronic HBV/HCV. Also elevated in pregnancy.",
    indications: ["HCC surveillance (q6mo)", "Cirrhosis follow-up"] },
];

const LAB_CATEGORIES = [
  { id: "all",         label: "All tests" },
  { id: "Diabetes",    label: "Diabetes" },
  { id: "Lipids",      label: "Lipids" },
  { id: "Renal",       label: "Renal" },
  { id: "Liver",       label: "Liver" },
  { id: "Thyroid",     label: "Thyroid" },
  { id: "Hematology",  label: "Hematology" },
  { id: "Cardiac",     label: "Cardiac" },
  { id: "Infectious",  label: "Infectious" },
  { id: "Vitamins",    label: "Vitamins" },
  { id: "Hormones",    label: "Hormones" },
  { id: "Tumor markers", label: "Tumor markers" },
];

function LabCatalogView({ onOpenPatientChart, onStartVerification }) {
  const [system, setSystem] = useLabUnits();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  // Inline row expansion was removed — see LabTestExpandedDetail below for the
  // preserved content (description, indications, reference range, sample/prep).
  // Re-mount it inside the row's <li> and re-introduce an `expanded` state to
  // bring the click-to-expand behaviour back.
  const [draft, setDraft] = useState([]); // codes added to draft
  const [suggestOpen, setSuggestOpen] = useState(false);

  // Doctor's personal test library. Authored here (catalog rows = the source
  // of truth for tests), surfaced inside QuickOrderPanel on each patient chart.
  const [favorites, setFavorites] = useState(DEFAULT_FAVORITES);
  const [bundles, setBundles] = useState(DEFAULT_BUNDLES);
  // picker: null | { mode: "favorite" } | { mode: "bundle", bundle?: {…} }
  const [picker, setPicker] = useState(null);

  const isFavorite = (code) => favorites.includes(code);
  const toggleFavorite = (code) =>
    setFavorites(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  const saveBundle = (b) => {
    if (b.id && bundles.some(x => x.id === b.id)) {
      setBundles(prev => prev.map(x => x.id === b.id ? b : x));
    } else {
      setBundles(prev => [...prev, { ...b, id: b.id || `b-${Date.now()}` }]);
    }
    setPicker(null);
  };
  const deleteBundle = (id) => setBundles(prev => prev.filter(b => b.id !== id));

  const q = query.trim().toLowerCase();
  const filtered = LAB_CATALOG.filter(t =>
    (category === "all" ||
      (category === "favorites" && favorites.includes(t.code)) ||
      t.category === category) &&
    (q === "" ||
      t.name.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q))
  );

  // Test counts per category for chip badges
  const counts = LAB_CATALOG.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});

  const inDraft = (code) => draft.includes(code);
  const toggleDraft = (code) => setDraft(d => inDraft(code) ? d.filter(c => c !== code) : [...d, code]);

  const cartOpen = draft.length > 0;

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto">
      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-3">Lab catalog</div>
      <h1 className="font-display text-[30px] font-medium leading-none mb-1">
        Every test Kura runs — <span className="text-jade-2">{LAB_CATALOG.length}+ assays</span>
      </h1>
      <p className="text-[12.5px] text-ink-3 mb-5">
        Browse the full catalog. Click a row for prep, indications, and reference ranges. Reference ranges follow your <span className="font-mono">{system === "us" ? "US" : "SI"}</span> preference.
      </p>

      {/* Doctor's personal test library — favorites + bundles. Lives at the
          top of the catalog so the doctor curates it where the tests are. */}
      <div className="grid grid-cols-12 gap-4 mb-5">
        <div data-tour="catalog-favorites" className="col-span-5">
          <FavoritesCard
            favorites={favorites}
            onRemove={toggleFavorite}
            onAdd={() => setPicker({ mode: "favorite" })}
          />
        </div>
        <div data-tour="catalog-bundles" className="col-span-7">
          <BundlesCard
            bundles={bundles}
            onEdit={(b) => setPicker({ mode: "bundle", bundle: b })}
            onDelete={deleteBundle}
            onNew={() => setPicker({ mode: "bundle" })}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
      <div className={`transition-all ${cartOpen ? "col-span-8" : "col-span-12"}`}>

      {/* Search */}
      <div data-tour="catalog-search" className="bg-surface border border-line rounded-xl p-4 mb-3">
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, code (e.g. HBA1C), or category…"
            className="w-full bg-surface-2 border border-line-2 rounded-lg pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-jade"
          />
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-1.5">
          {LAB_CATEGORIES.map(c => {
            const isActive = category === c.id;
            const count = c.id === "all" ? LAB_CATALOG.length : (counts[c.id] || 0);
            const chip = (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`text-[11.5px] px-2.5 py-1 rounded-full border transition inline-flex items-center gap-1.5 ${
                  isActive ? "bg-jade text-white border-ink" : "bg-surface text-ink-2 border-line hover:border-ink"
                }`}
              >
                {c.label}
                <span className={`text-[10px] font-mono ${isActive ? "text-white/70" : "text-ink-3"}`}>{count}</span>
              </button>
            );
            if (c.id === "all") {
              const favActive = category === "favorites";
              return (
                <React.Fragment key="all-and-favorites">
                  {chip}
                  <button
                    onClick={() => setCategory("favorites")}
                    className={`text-[11.5px] px-2.5 py-1 rounded-full border transition inline-flex items-center gap-1.5 ${
                      favActive ? "bg-jade text-white border-ink" : "bg-surface text-ink-2 border-line hover:border-ink"
                    }`}
                  >
                    <Star size={11} className={favActive ? "text-amber" : "text-amber"} style={favorites.length > 0 ? { fill: "currentColor" } : undefined} />
                    Favorites
                    <span className={`text-[10px] font-mono ${favActive ? "text-white/70" : "text-ink-3"}`}>{favorites.length}</span>
                  </button>
                </React.Fragment>
              );
            }
            return chip;
          })}
        </div>
      </div>

      {/* Results */}
      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-line-2 bg-surface-2/40 text-[11px] text-ink-3">
          <span>{filtered.length} test{filtered.length === 1 ? "" : "s"}{category !== "all" && ` in ${category}`}{q && ` matching "${query}"`}</span>
          <span className="inline-flex items-center gap-1"><Sparkles size={10} className="text-jade-2" /> Prices in USD · paid in KHR or via insurer</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <div className="text-[13px] text-ink-2 mb-1">No tests match{query ? ` "${query}"` : ""}.</div>
            <div className="text-[11.5px] text-ink-3 mb-4">Try a broader search or clear the category filter.</div>
            <div className="hairline max-w-[260px] mx-auto mb-4" />
            <div className="text-[11.5px] text-ink-3 mb-2">Don't see what you need?</div>
            <button
              onClick={() => setSuggestOpen(true)}
              className="inline-flex items-center gap-1.5 text-[12px] bg-jade text-white px-3 py-1.5 rounded-md font-medium hover:opacity-90"
            >
              <Plus size={12} /> Suggest a missing test
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-line-2">
            {filtered.map(t => (
              <li key={t.code}>
                <div className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-surface-2/30 transition">
                  <div className="w-8 h-8 rounded-md bg-jade-soft text-jade flex items-center justify-center shrink-0 mt-0.5">
                    <TestTubes size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[13.5px] font-semibold">{t.name}</h3>
                      <span className="text-[10px] font-mono text-ink-3 bg-surface border border-line rounded px-1.5 py-0.5">{t.code}</span>
                      <span className="text-[10px] text-ink-3">· {t.category}</span>
                      {t.popular && (
                        <span className="text-[9.5px] uppercase tracking-wider font-semibold text-jade bg-jade-soft px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                          <Star size={9} /> Popular
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-ink-3 mt-1">
                      <span className="inline-flex items-center gap-1"><Clock size={10} /> {t.tat}</span>
                      <span className="inline-flex items-center gap-1"><Droplet size={10} /> {t.sample}</span>
                      <span className="inline-flex items-center gap-1"><FileText size={10} /> {t.prep}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 pl-2">
                    <div className="text-[13px] font-display font-medium tnum">${t.price.usd}</div>
                    <div className="text-[10px] text-ink-3 font-mono">{t.price.khr} ៛</div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(t.code)}
                    title={isFavorite(t.code) ? "Remove from favorites" : "Add to favorites"}
                    className={`shrink-0 w-7 h-7 rounded-md inline-flex items-center justify-center transition border ${
                      isFavorite(t.code)
                        ? "bg-amber-soft border-amber text-amber"
                        : "bg-surface border-line text-ink-3 hover:border-amber hover:text-amber"
                    }`}
                  >
                    <Star size={13} style={isFavorite(t.code) ? { fill: "currentColor" } : undefined} />
                  </button>
                  <button
                    onClick={() => toggleDraft(t.code)}
                    title={inDraft(t.code) ? "Remove from cart" : "Add to cart"}
                    className={`shrink-0 w-7 h-7 rounded-md inline-flex items-center justify-center transition border ${
                      inDraft(t.code)
                        ? "bg-crimson-soft border-crimson text-crimson hover:bg-crimson hover:text-white"
                        : "bg-surface border-line text-ink-2 hover:border-ink hover:text-ink"
                    }`}
                  >
                    {inDraft(t.code) ? <Trash2 size={13} /> : <Plus size={13} />}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Persistent footer — doctors can always submit a request for a test we don't run yet */}
      {filtered.length > 0 && (
        <div className="mt-3 bg-surface border border-dashed border-line rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-jade-soft text-jade flex items-center justify-center shrink-0">
            <Sparkles size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] text-ink-2 font-medium">Test you need isn't here?</div>
            <div className="text-[11px] text-ink-3 leading-snug">Submit a request — our lab ops team works on adding new assays from doctor demand.</div>
          </div>
          <button
            onClick={() => setSuggestOpen(true)}
            className="text-[11.5px] bg-jade text-white px-3 py-1.5 rounded-md font-medium hover:opacity-90 inline-flex items-center gap-1.5 shrink-0"
          >
            <Plus size={11} /> Suggest a test
          </button>
        </div>
      )}
      </div>

      {cartOpen && (
        <div className="col-span-4">
          <CatalogCart draft={draft} onRemove={(c) => toggleDraft(c)} onClear={() => setDraft([])} onOpenPatientChart={onOpenPatientChart} onStartVerification={onStartVerification} />
        </div>
      )}
      </div>

      {suggestOpen && <SuggestTestModal onClose={() => setSuggestOpen(false)} initialName={query} />}

      {picker && (
        <CatalogPicker
          mode={picker.mode}
          initialBundle={picker.bundle}
          existingFavorites={favorites}
          onSelectFavorite={(code) => { toggleFavorite(code); setPicker(null); }}
          onSaveBundle={saveBundle}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}

/* ============================================================
   LAB-TEST EXPANDED DETAIL — preserved but currently not rendered.
   This is the click-to-expand panel that used to open inside each catalog row
   (description, indications, US/SI reference range, sample · turnaround · prep).
   Kept as a self-contained component so it's easy to re-introduce later — just
   render <LabTestExpandedDetail t={t} system={system} setSystem={setSystem}
   inDraft={inDraft} /> inside the row's <li> when expansion is needed again.
   ============================================================ */
// eslint-disable-next-line no-unused-vars
function LabTestExpandedDetail({ t, system, setSystem, inDraft }) {
  const r = formatLabRef(t.ref, t.refUnit, t.name, system);
  const altSystem = system === "us" ? "si" : "us";
  const altR = formatLabRef(t.ref, t.refUnit, t.name, altSystem);
  const altDiffers = altR.ref !== r.ref || altR.unit !== r.unit;
  return (
    <div className="px-4 pb-4 pt-0">
      <div className="ml-11 grid grid-cols-12 gap-4">
        {/* Clinical context */}
        <div className="col-span-7 space-y-3">
          <p className="text-[12.5px] text-ink-2 leading-relaxed">{t.description}</p>
          <div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1.5">Common indications</div>
            <div className="flex flex-wrap gap-1.5">
              {t.indications.map((ind, i) => (
                <span key={i} className="text-[11px] text-ink-2 bg-surface border border-line rounded-full px-2.5 py-0.5">
                  {ind}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Reference + specimen — single coherent card */}
        <div className="col-span-5">
          <div className="rounded-lg border border-line bg-surface overflow-hidden">
            <div className="px-3 py-2.5 bg-surface-2/50">
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-[10px] uppercase tracking-[0.16em] text-ink-3 font-semibold">Reference range</div>
                <button
                  onClick={() => setSystem(altSystem)}
                  className="text-[10px] font-mono text-ink-3 hover:text-ink"
                  title={`Switch to ${altSystem.toUpperCase()}`}
                >
                  {system.toUpperCase()} ⇄ {altSystem.toUpperCase()}
                </button>
              </div>
              <div className="font-mono text-[14.5px] text-ink leading-tight mt-0.5">
                {r.ref}{r.unit !== "—" ? <span className="text-ink-3"> {r.unit}</span> : null}
              </div>
              {altDiffers && (
                <div className="font-mono text-[10.5px] text-ink-3 mt-0.5">
                  {altR.ref}{altR.unit !== "—" ? ` ${altR.unit}` : ""} <span className="text-ink-3">· {altSystem.toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="hairline" />
            <div className="px-3 py-2.5 grid grid-cols-[16px_70px_1fr] gap-x-2 gap-y-1.5 text-[11.5px] items-center">
              <Droplet size={11} className="text-ink-3" />
              <span className="text-ink-3 uppercase tracking-wider text-[9.5px] font-semibold">Sample</span>
              <span className="text-ink-2">{t.sample}</span>

              <Clock size={11} className="text-ink-3" />
              <span className="text-ink-3 uppercase tracking-wider text-[9.5px] font-semibold">Turnaround</span>
              <span className="text-ink-2">{t.tat}</span>

              <FileText size={11} className="text-ink-3" />
              <span className="text-ink-3 uppercase tracking-wider text-[9.5px] font-semibold">Prep</span>
              <span className="text-ink-2">{t.prep}</span>
            </div>
            {inDraft(t.code) && (
              <>
                <div className="hairline" />
                <div className="px-3 py-2 bg-jade-soft/40 flex items-center gap-1.5 text-[11px] text-jade-2 font-medium">
                  <CheckCircle2 size={11} /> In draft order
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SUGGEST TEST MODAL — doctors submit assays they need that we don't run yet.
   Becomes the demand signal our lab-ops team uses to prioritise new assays.
   ============================================================ */
function SuggestTestModal({ onClose, initialName = "" }) {
  const [name, setName] = useState(initialName);
  const [sample, setSample] = useState("");
  const [urgency, setUrgency] = useState("nice"); // 'asap' | 'soon' | 'nice'
  const [volume, setVolume] = useState("1-5");    // expected requests / month
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const urgencyOpts = [
    { id: "asap", label: "ASAP",        sub: "Blocking patient care now" },
    { id: "soon", label: "Within 1 mo", sub: "Have patients waiting" },
    { id: "nice", label: "Nice to have",sub: "Would broaden my offering" },
  ];
  const volumeOpts = [
    { id: "1-5",   label: "1–5 / mo" },
    { id: "6-20",  label: "6–20 / mo" },
    { id: "20+",   label: "20+ / mo" },
  ];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-bg border border-line rounded-xl shadow-xl w-full max-w-md mt-12 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line-2 bg-jade-soft/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-jade text-white flex items-center justify-center"><Sparkles size={13} /></div>
            <div>
              <h3 className="font-display text-[15px] font-medium leading-tight">Suggest a test</h3>
              <div className="text-[10.5px] text-ink-3 uppercase tracking-[0.14em] font-semibold">Doctor demand → lab ops backlog</div>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-3 hover:text-ink p-1 -m-1"><X size={14} /></button>
        </div>

        {submitted ? (
          <div className="px-5 py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-jade-soft text-jade-2 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={20} />
            </div>
            <h4 className="font-display text-[17px] font-medium mb-1">Suggestion submitted</h4>
            <p className="text-[12px] text-ink-2 leading-snug mb-4 max-w-[280px] mx-auto">
              Our lab-ops team reviews requests weekly. If we already have a vendor in qualification you'll get an ETA — otherwise we'll start the workup based on aggregate demand.
            </p>
            <button onClick={onClose} className="text-[12px] bg-jade text-white px-4 py-2 rounded-md font-medium hover:opacity-90">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="px-5 py-4 space-y-3.5">
              <label className="block">
                <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1.5">Test name</div>
                <input
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Anti-CCP, Procalcitonin, JAK2 V617F…"
                  className="w-full px-3 py-2 rounded-md border border-line bg-surface text-[13px] focus:border-ink focus:outline-none"
                />
              </label>

              <label className="block">
                <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1.5">Sample type <span className="text-ink-3 font-normal normal-case tracking-normal">(if known)</span></div>
                <input
                  value={sample}
                  onChange={e => setSample(e.target.value)}
                  placeholder="Serum, EDTA whole blood, urine…"
                  className="w-full px-3 py-2 rounded-md border border-line bg-surface text-[13px] focus:border-ink focus:outline-none"
                />
              </label>

              <div>
                <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1.5">Urgency</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {urgencyOpts.map(u => (
                    <button
                      key={u.id}
                      onClick={() => setUrgency(u.id)}
                      className={`text-left px-2.5 py-1.5 rounded-md border transition ${urgency === u.id ? "border-jade-2 bg-jade-soft" : "border-line hover:border-ink"}`}
                    >
                      <div className={`text-[11.5px] font-medium ${urgency === u.id ? "text-jade-2" : "text-ink"}`}>{u.label}</div>
                      <div className="text-[10px] text-ink-3 leading-tight mt-0.5">{u.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1.5">Expected volume</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {volumeOpts.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setVolume(v.id)}
                      className={`text-[11.5px] py-1.5 rounded-md border transition ${volume === v.id ? "border-jade-2 bg-jade-soft text-jade-2 font-medium" : "border-line text-ink-2 hover:border-ink"}`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1.5">Why you need it <span className="text-ink-3 font-normal normal-case tracking-normal">(optional)</span></div>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Specific patient population, clinical workflow, what you're sending to another lab today…"
                  className="w-full px-3 py-2 rounded-md border border-line bg-surface text-[12.5px] focus:border-ink focus:outline-none resize-none"
                />
              </label>
            </div>

            <div className="px-5 py-3 border-t border-line-2 bg-surface-2/30 flex items-center justify-between gap-2">
              <span className="text-[10.5px] text-ink-3 leading-snug">We notify you when this test goes live or if we need clarification.</span>
              <button
                disabled={!name.trim()}
                onClick={() => setSubmitted(true)}
                className={`text-[12px] px-3.5 py-2 rounded-md font-medium inline-flex items-center gap-1.5 transition ${name.trim() ? "bg-jade text-white hover:opacity-90" : "bg-line text-ink-3 cursor-not-allowed"}`}
              >
                <Send size={12} /> Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

/* ============================================================
   SUPPLIES VIEW — reorder consumables (tubes, labels, draw kit)
   Doctor-facing only · no admin/leakage analytics here
   ============================================================ */
const SUPPLIES = [
  // Tubes (free with Kura — we ship them for the orders we run)
  { id: "tube-edta-3", category: "tubes", name: "Purple top · EDTA",       spec: "3 mL · K3 EDTA · 100 / box",          dot: "bg-plum",      onHand: 84,  weeklyBurn: 32,  pricing: "free" },
  { id: "tube-sst-5",  category: "tubes", name: "Gold top · SST",          spec: "5 mL · gel separator · 100 / box",    dot: "bg-amber",     onHand: 22,  weeklyBurn: 28,  pricing: "free" },
  { id: "tube-cit-27", category: "tubes", name: "Blue top · sodium citrate", spec: "2.7 mL · 3.2% citrate · 50 / box",  dot: "bg-jade-2",    onHand: 6,   weeklyBurn: 8,   pricing: "free" },
  { id: "tube-hep-4",  category: "tubes", name: "Green top · Li-heparin",  spec: "4 mL · plasma · 100 / box",           dot: "bg-jade",      onHand: 41,  weeklyBurn: 9,   pricing: "free" },
  // Specimen cups
  { id: "cup-urine",   category: "cups",  name: "Urine cup · sterile",     spec: "120 mL · screw cap · 50 / box",       dot: "bg-amber-soft",onHand: 18,  weeklyBurn: 12,  pricing: "free" },
  // Labels
  { id: "label-roll",  category: "labels",name: "Kura barcode roll",       spec: "Code 128 · 500 stickers / roll",      dot: "bg-ink",       onHand: 3,   weeklyBurn: 0.5, pricing: "free" },
  // Needles
  { id: "needle-23",   category: "needles", name: "Vacutainer needle · 23G", spec: "1¼\" · safety lock · 100 / box",   dot: "bg-ink-3",     onHand: 56,  weeklyBurn: 26,  pricing: "$18 / box" },
  { id: "needle-21",   category: "needles", name: "Vacutainer needle · 21G", spec: "1½\" · safety lock · 100 / box",   dot: "bg-ink-3",     onHand: 31,  weeklyBurn: 14,  pricing: "$18 / box" },
  // Draw kit
  { id: "tourniquet",  category: "kit",   name: "Tourniquet · latex-free", spec: "Adult · single-use · 25 / pack",      dot: "bg-plum",      onHand: 12,  weeklyBurn: 3,   pricing: "$6 / pack" },
  { id: "swab-alc",    category: "kit",   name: "Alcohol swab",            spec: "70% IPA · 200 / box",                 dot: "bg-jade-soft", onHand: 145, weeklyBurn: 56,  pricing: "$5 / box" },
];

const supplyDaysLeft = (s) => Math.floor((s.onHand / s.weeklyBurn) * 7);
const supplyStatus = (s) => {
  const d = supplyDaysLeft(s);
  if (d <= 7)  return "critical";
  if (d <= 21) return "low";
  return "stocked";
};

/* ============================================================
   SUPPLIES — coming-soon placeholder
   ============================================================ */
function SuppliesSoonView() {
  return (
    <div className="px-8 py-6 max-w-[1100px] mx-auto">
      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-3">Stocking</div>
      <div className="flex items-center gap-3 mb-1">
        <h1 className="font-display text-[30px] font-medium leading-none text-ink-2">Supplies</h1>
        <PreviewLock />
      </div>
      <p className="text-[12.5px] text-ink-3 mb-6">
        Auto-reorder tubes, labels, and draw-kit consumables — Kura ships them free for bookings we run. Coming soon.
      </p>
      <PreviewBlur>
        <div className="bg-surface border border-line rounded-xl p-5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-plum font-semibold mb-2">
            <Package size={11} /> Phase 2 · backoffice tooling
          </div>
          <h3 className="font-display text-[18px] font-medium mb-2">Stock + utilization tracking</h3>
          <p className="text-[12.5px] text-ink-2 leading-snug mb-4">
            On-hand quantities per supply (tubes by colour, labels, needles, draw kit, urine cups), weekly burn rate, days-until-empty, one-click reorder. Kura ships free for any consumable used on a Kura booking.
          </p>
          <div className="grid grid-cols-2 gap-3 text-[11.5px] text-ink-2">
            <div className="rounded-md border border-line-2 p-3">
              <div className="text-[10.5px] uppercase tracking-wider text-ink-3 font-semibold mb-1">For the clinic</div>
              One-click reorder · auto-replenish · pack-size aware days-left countdown.
            </div>
            <div className="rounded-md border border-line-2 p-3">
              <div className="text-[10.5px] uppercase tracking-wider text-ink-3 font-semibold mb-1">For Kura ops</div>
              Leakage signal — shipped vs. logged Kura draws — when consumption diverges from booked orders.
            </div>
          </div>
        </div>
      </PreviewBlur>
    </div>
  );
}

/* ============================================================
   TASKS — productivity / assignment to cabinet members
   Coming-soon: blurred preview with the standard PreviewBlur treatment.
   ============================================================ */
/* ============================================================
   CALENDAR — F2F follow-up scheduling for the doctor's cabinet
   Coming-soon · uses the standard PreviewBlur treatment
   ============================================================ */
function CalendarView() {
  const [tier] = useDoctorTier();
  if (tier === "explorer") {
    return (
      <ExplorerEmptyState
        icon={Calendar}
        title="Your calendar is empty"
        body="Bookings from patients and teammates land here once you're verified. Right now there's nothing on the books — verify your license and you'll start filling slots."
      />
    );
  }
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];
  // Fake slot occupancy for a week — proto only
  const slots = {
    "Mon-09:00": { who: "Sokha Chann",    kind: "T2DM follow-up", tone: "jade" },
    "Mon-10:00": { who: "Vannak Heng",    kind: "HTN review",     tone: "plum" },
    "Mon-14:00": { who: "Pisey Long",     kind: "Pediatric · cold", tone: "amber" },
    "Tue-09:00": { who: "Bora Pich",      kind: "Lipid review",   tone: "jade" },
    "Tue-11:00": { who: "Channary Pich",  kind: "Annual",         tone: "ink" },
    "Wed-10:00": { who: "Sopheap Mao",    kind: "Lipid + thyroid",tone: "plum" },
    "Wed-15:00": { who: "Sokha Chann",    kind: "Telehealth",     tone: "jade" },
    "Thu-14:00": { who: "Dara Sok",       kind: "URI",            tone: "amber" },
    "Fri-09:00": { who: "Sopheap Mao",    kind: "T2DM follow-up", tone: "jade" },
    "Fri-16:00": { who: "Bora Pich",      kind: "ECG",            tone: "plum" },
  };
  const toneClasses = {
    jade:  "bg-jade-soft border-jade-2 text-jade-2",
    plum:  "bg-line-2 border-plum text-plum",
    amber: "bg-amber-soft border-amber text-amber",
    ink:   "bg-surface-2 border-line text-ink-2",
  };

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto">
      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-3">Cabinet</div>
      <div className="flex items-center gap-3 mb-1">
        <h1 className="font-display text-[30px] font-medium leading-none text-ink-2">Calendar</h1>
        <PreviewLock />
      </div>
      <p className="text-[12.5px] text-ink-3 mb-6 max-w-2xl">
        Schedule F2F follow-ups, telehealth slots, and recurring patient visits. Bookable windows
        sync to your public directory profile so patients can self-serve.
      </p>

      <PreviewBlur>
        {/* Week header */}
        <div className="bg-surface border border-line rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line-2">
            <div className="flex items-center gap-3">
              <button className="text-[11px] text-ink-3 border border-line rounded px-2 py-1 hover:border-ink">←</button>
              <h2 className="font-display text-[16px] font-medium">Mon 11 – Sat 16 May 2026</h2>
              <button className="text-[11px] text-ink-3 border border-line rounded px-2 py-1 hover:border-ink">→</button>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-md border border-line p-0.5 text-[11px] bg-surface">
                <button className="px-2 py-0.5 rounded bg-ink text-bg font-medium">Week</button>
                <button className="px-2 py-0.5 rounded text-ink-3">Day</button>
                <button className="px-2 py-0.5 rounded text-ink-3">Month</button>
              </div>
              <button className="text-[11.5px] inline-flex items-center gap-1.5 bg-jade text-white rounded-md px-3 py-1.5 font-medium">
                <Plus size={12} /> New event
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid" style={{ gridTemplateColumns: "70px repeat(6, 1fr)" }}>
            <div className="bg-surface-2/40 border-b border-r border-line-2"></div>
            {days.map(d => (
              <div key={d} className="bg-surface-2/40 border-b border-r border-line-2 last:border-r-0 px-2 py-2 text-center">
                <div className="text-[10px] uppercase tracking-wider text-ink-3 font-semibold">{d}</div>
                <div className="text-[14px] font-display font-medium">{11 + days.indexOf(d)}</div>
              </div>
            ))}
            {hours.flatMap(h => [
              <div key={`h-${h}`} className="border-b border-r border-line-2 px-2 py-2 text-[10.5px] text-ink-3 font-mono">{h}</div>,
              ...days.map(d => {
                const slot = slots[`${d}-${h}`];
                return (
                  <div key={`${d}-${h}`} className="border-b border-r border-line-2 last:border-r-0 min-h-[52px] p-1">
                    {slot && (
                      <div className={`text-left rounded border px-1.5 py-1 text-[10px] leading-tight ${toneClasses[slot.tone]}`}>
                        <div className="font-medium truncate">{slot.who}</div>
                        <div className="opacity-80 truncate">{slot.kind}</div>
                      </div>
                    )}
                  </div>
                );
              })
            ])}
          </div>
        </div>

        {/* Side rail under */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-surface border border-line rounded-xl p-4">
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-2">This week</div>
            <ul className="space-y-1.5 text-[11.5px]">
              <li className="flex justify-between"><span className="text-ink-2">Booked slots</span><span className="font-mono">10</span></li>
              <li className="flex justify-between"><span className="text-ink-2">Open slots</span><span className="font-mono">38</span></li>
              <li className="flex justify-between"><span className="text-ink-2">No-show rate</span><span className="font-mono">8%</span></li>
              <li className="flex justify-between"><span className="text-ink-2">Avg visit · F2F</span><span className="font-mono">22 min</span></li>
            </ul>
          </div>
          <div className="bg-surface border border-line rounded-xl p-4">
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-2">Availability rules</div>
            <ul className="space-y-1.5 text-[11.5px] text-ink-2">
              <li className="flex items-start gap-1.5"><CheckCircle2 size={11} className="text-jade-2 mt-0.5 shrink-0" /> Mon–Fri 09:00–17:00 · F2F + telehealth</li>
              <li className="flex items-start gap-1.5"><CheckCircle2 size={11} className="text-jade-2 mt-0.5 shrink-0" /> Sat 09:00–12:00 · F2F only</li>
              <li className="flex items-start gap-1.5"><CheckCircle2 size={11} className="text-jade-2 mt-0.5 shrink-0" /> 30 min buffer between visits</li>
              <li className="flex items-start gap-1.5"><CheckCircle2 size={11} className="text-jade-2 mt-0.5 shrink-0" /> Public profile shows next 4 weeks</li>
            </ul>
          </div>
        </div>
      </PreviewBlur>
    </div>
  );
}

function TasksView() {
  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto">
      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-3">Cabinet workflow</div>
      <div className="flex items-center gap-3 mb-1">
        <h1 className="font-display text-[30px] font-medium leading-none text-ink-2">Tasks</h1>
        <PreviewLock />
      </div>
      <p className="text-[12.5px] text-ink-3 mb-6 max-w-2xl">
        Assign work to yourself or your cabinet members — lab review queues, callback lists, refill requests, follow-ups.
        Tasks auto-generate from clinical events (flagged labs, missed appointments, refill windows) and live on a shared board.
      </p>

      <PreviewBlur>
        {/* Filter ribbon */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {["All · 24", "Assigned to me · 8", "Unassigned · 5", "Due today · 3", "Overdue · 2"].map((c, i) => (
            <span key={i} className={`text-[11.5px] px-2.5 py-1 rounded-full border ${
              i === 0 ? "bg-ink text-bg border-ink" : "bg-surface text-ink-2 border-line"
            }`}>{c}</span>
          ))}
          <div className="flex-1" />
          <button className="text-[11.5px] inline-flex items-center gap-1.5 bg-jade text-white rounded-md px-3 py-1.5 font-medium">
            <Plus size={12} /> New task
          </button>
        </div>

        {/* Kanban columns */}
        <div className="grid grid-cols-3 gap-4">
          <TaskColumn
            tone="amber"
            title="To do"
            count={9}
            tasks={[
              { who: "SC", whoName: "Dr. Sopha", title: "Review HbA1c 9.4% — Sokha Chann", sub: "P-9134 · auto-flagged", tag: "Lab review", due: "Due today", overdue: false },
              { who: "BL", whoName: "Bopha (reception)", title: "Call patient re: refill — Vannak Heng", sub: "P-8602 · Amlodipine running low", tag: "Callback", due: "Due in 2d", overdue: false },
              { who: "?",  whoName: "Unassigned", title: "Send referral letter — Pisey Long", sub: "P-7720 · ENT", tag: "Referral", due: "Overdue 1d", overdue: true },
              { who: "SC", whoName: "Dr. Sopha", title: "Sign 3 pending consultation notes", sub: "Drafts from yesterday", tag: "Note", due: "Due today", overdue: false },
            ]}
          />
          <TaskColumn
            tone="jade"
            title="In progress"
            count={6}
            tasks={[
              { who: "BL", whoName: "Bopha", title: "Verify Forte insurance — 4 patients", sub: "Eligibility batch", tag: "Insurance", due: "—", overdue: false },
              { who: "NK", whoName: "Nita (nurse)", title: "Prep tubes for tomorrow's draws", sub: "12 bookings", tag: "Supplies", due: "Due today", overdue: false },
            ]}
          />
          <TaskColumn
            tone="ink"
            title="Done · today"
            count={9}
            tasks={[
              { who: "SC", whoName: "Dr. Sopha", title: "Sign Rx — Metformin refill", sub: "Sokha Chann · 90 days", tag: "Rx", due: "✓ 13:42", overdue: false, done: true },
              { who: "BL", whoName: "Bopha", title: "Schedule follow-up — 6 patients", sub: "T2DM cohort · 6w", tag: "Schedule", due: "✓ 11:30", overdue: false, done: true },
              { who: "NK", whoName: "Nita", title: "Receive lab supplies delivery", sub: "Eurofar · 8 boxes", tag: "Supplies", due: "✓ 10:15", overdue: false, done: true },
            ]}
          />
        </div>

        {/* Team workload + auto-rule preview */}
        <div className="mt-5 grid grid-cols-12 gap-4">
          <div className="col-span-7 bg-surface border border-line rounded-xl p-4">
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-3">Team workload · today</div>
            <ul className="space-y-2.5">
              {[
                { who: "Dr. Sopha", load: 8, cap: 12, tone: "jade" },
                { who: "Bopha (reception)", load: 11, cap: 14, tone: "amber" },
                { who: "Nita (nurse)", load: 6, cap: 10, tone: "jade" },
                { who: "Channary (lab tech)", load: 3, cap: 8, tone: "jade" },
              ].map(p => (
                <li key={p.who}>
                  <div className="flex items-baseline justify-between text-[12px] mb-1">
                    <span className="text-ink-2">{p.who}</span>
                    <span className="font-mono text-ink-3">{p.load} / {p.cap}</span>
                  </div>
                  <div className="h-1.5 bg-line-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${p.tone === "amber" ? "bg-amber" : "bg-jade-2"}`} style={{ width: `${(p.load / p.cap) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-5 bg-surface border border-line rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.16em] text-jade font-semibold mb-2">
              <Sparkles size={11} /> Auto-rules
            </div>
            <p className="text-[12px] text-ink-2 leading-snug mb-3">
              Tasks spawn automatically from clinical events. The rules below run for every patient — edit any time.
            </p>
            <ul className="space-y-1.5 text-[11.5px]">
              <li className="flex items-start gap-2"><CheckCircle2 size={11} className="text-jade-2 mt-0.5 shrink-0" /><span className="text-ink-2">HbA1c &gt; 8% → assign lab review to Dr. Sopha</span></li>
              <li className="flex items-start gap-2"><CheckCircle2 size={11} className="text-jade-2 mt-0.5 shrink-0" /><span className="text-ink-2">Rx refill window &lt; 14d → callback to reception</span></li>
              <li className="flex items-start gap-2"><CheckCircle2 size={11} className="text-jade-2 mt-0.5 shrink-0" /><span className="text-ink-2">Booking no-show → rebook task to reception</span></li>
              <li className="flex items-start gap-2"><CheckCircle2 size={11} className="text-jade-2 mt-0.5 shrink-0" /><span className="text-ink-2">Note unsigned 24h → reminder to author</span></li>
            </ul>
          </div>
        </div>
      </PreviewBlur>
    </div>
  );
}

function TaskColumn({ title, tone, count, tasks }) {
  const accent = {
    amber: "text-amber bg-amber-soft border-amber",
    jade:  "text-jade-2 bg-jade-soft border-jade",
    ink:   "text-ink-2 bg-line-2 border-line",
  }[tone];
  return (
    <div className="bg-surface border border-line rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-line-2">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${accent}`}>{title}</span>
          <span className="text-[11px] font-mono text-ink-3">{count}</span>
        </div>
        <Plus size={12} className="text-ink-3" />
      </div>
      <ul className="divide-y divide-line-2">
        {tasks.map((t, i) => (
          <li key={i} className={`px-3 py-2.5 ${t.done ? "opacity-60" : ""}`}>
            <div className="flex items-start gap-2 mb-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9.5px] font-semibold shrink-0 ${
                t.who === "?" ? "bg-line-2 text-ink-3" : "bg-jade-soft text-jade"
              }`} title={t.whoName}>{t.who}</div>
              <div className="flex-1 min-w-0">
                <div className={`text-[12.5px] leading-snug ${t.done ? "line-through text-ink-3" : "text-ink-2"}`}>{t.title}</div>
                <div className="text-[10.5px] text-ink-3 truncate">{t.sub}</div>
              </div>
            </div>
            <div className="flex items-center justify-between ml-8">
              <span className="text-[9.5px] uppercase tracking-wider font-semibold text-ink-3 bg-line-2 px-1.5 py-0.5 rounded">{t.tag}</span>
              <span className={`text-[10.5px] font-medium ${
                t.overdue ? "text-crimson" : t.done ? "text-jade-2" : "text-ink-3"
              }`}>{t.due}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   DISPENSARY — in-clinic pharma sales, inventory, replenishment
   Cambodia context: doctors commonly dispense from their cabinet;
   prices in USD with KHR equivalents; MoH requires batch + expiry tracking.
   ============================================================ */
const DRUGS = [
  // Antibiotics
  { id: "amox-500",   category: "antibiotics", brand: "Amoxil",     generic: "Amoxicillin",         form: "500 mg cap",        packSize: 100, onHand: 240, weeklyBurn: 85,  unitPrice: 0.25, unitCost: 0.11, batch: "AX24-118", expiry: "2027-02" },
  { id: "cipro-500",  category: "antibiotics", brand: "Ciprobid",   generic: "Ciprofloxacin",       form: "500 mg tab",        packSize: 100, onHand: 38,  weeklyBurn: 42,  unitPrice: 0.45, unitCost: 0.19, batch: "CP24-061", expiry: "2026-08" },
  { id: "azith-500",  category: "antibiotics", brand: "Zithromax",  generic: "Azithromycin",        form: "500 mg tab · 3-pack", packSize: 30, onHand: 12,  weeklyBurn: 9,   unitPrice: 4.50, unitCost: 2.10, batch: "AZ23-244", expiry: "2026-06" },
  // Cardio
  { id: "amlo-5",     category: "cardio",      brand: "Norvasc",    generic: "Amlodipine",          form: "5 mg tab",          packSize: 100, onHand: 410, weeklyBurn: 76,  unitPrice: 0.18, unitCost: 0.07, batch: "AM25-012", expiry: "2027-11" },
  { id: "losart-50",  category: "cardio",      brand: "Cozaar",     generic: "Losartan",            form: "50 mg tab",         packSize: 100, onHand: 184, weeklyBurn: 64,  unitPrice: 0.22, unitCost: 0.09, batch: "LO24-307", expiry: "2027-04" },
  { id: "atorv-20",   category: "cardio",      brand: "Lipitor",    generic: "Atorvastatin",        form: "20 mg tab",         packSize: 90,  onHand: 96,  weeklyBurn: 48,  unitPrice: 0.38, unitCost: 0.16, batch: "AT24-189", expiry: "2026-10" },
  // Diabetes
  { id: "metf-500",   category: "diabetes",    brand: "Glucophage", generic: "Metformin",           form: "500 mg tab",        packSize: 100, onHand: 320, weeklyBurn: 102, unitPrice: 0.15, unitCost: 0.06, batch: "MT25-044", expiry: "2027-09" },
  { id: "glic-80",    category: "diabetes",    brand: "Diamicron",  generic: "Gliclazide",          form: "80 mg tab",         packSize: 60,  onHand: 24,  weeklyBurn: 28,  unitPrice: 0.32, unitCost: 0.14, batch: "GL23-211", expiry: "2026-05" },
  // Pain / antipyretic
  { id: "para-500",   category: "pain",        brand: "Panadol",    generic: "Paracetamol",         form: "500 mg tab",        packSize: 200, onHand: 1280,weeklyBurn: 310, unitPrice: 0.08, unitCost: 0.03, batch: "PN25-077", expiry: "2028-01" },
  { id: "ibu-400",    category: "pain",        brand: "Brufen",     generic: "Ibuprofen",           form: "400 mg tab",        packSize: 100, onHand: 220, weeklyBurn: 95,  unitPrice: 0.10, unitCost: 0.04, batch: "IB24-188", expiry: "2027-03" },
  // GI
  { id: "ome-20",     category: "gi",          brand: "Losec",      generic: "Omeprazole",          form: "20 mg cap",         packSize: 100, onHand: 168, weeklyBurn: 62,  unitPrice: 0.20, unitCost: 0.08, batch: "OM24-291", expiry: "2027-01" },
  { id: "ors-sachet", category: "gi",          brand: "Royal-D",    generic: "ORS (oral rehydration)", form: "sachet · 200 mL", packSize: 50, onHand: 412, weeklyBurn: 78,  unitPrice: 0.20, unitCost: 0.07, batch: "OR25-014", expiry: "2027-07" },
  // Respiratory
  { id: "salb-inh",   category: "respiratory", brand: "Ventolin",   generic: "Salbutamol",          form: "100 mcg inhaler",   packSize: 1,   onHand: 18,  weeklyBurn: 6,   unitPrice: 4.20, unitCost: 2.40, batch: "VT24-152", expiry: "2026-09" },
  { id: "loratad-10", category: "respiratory", brand: "Claritin",   generic: "Loratadine",          form: "10 mg tab",         packSize: 30,  onHand: 64,  weeklyBurn: 22,  unitPrice: 0.28, unitCost: 0.10, batch: "CL25-008", expiry: "2027-12" },
  // Vitamins / supplements (OTC, walk-in friendly)
  { id: "vitc-1000",  category: "vitamins",    brand: "Redoxon",    generic: "Vitamin C",           form: "1000 mg eff. tab",  packSize: 20,  onHand: 84,  weeklyBurn: 31,  unitPrice: 0.40, unitCost: 0.18, batch: "VC25-029", expiry: "2027-06" },
  { id: "iron-folic", category: "vitamins",    brand: "Sangobion",  generic: "Iron + folic acid",   form: "cap",               packSize: 100, onHand: 110, weeklyBurn: 36,  unitPrice: 0.22, unitCost: 0.10, batch: "SG24-260", expiry: "2027-02" },
];

const drugDaysLeft   = (d) => Math.floor((d.onHand / d.weeklyBurn) * 7);
const drugStatus     = (d) => {
  const days = drugDaysLeft(d);
  if (days <= 7)  return "critical";
  if (days <= 21) return "low";
  return "stocked";
};
// Months from today (2026-05) to expiry "YYYY-MM"
const drugExpiryMonths = (d) => {
  const [y, m] = d.expiry.split("-").map(Number);
  return (y - 2026) * 12 + (m - 5);
};
const drugExpirySoon = (d) => drugExpiryMonths(d) <= 6;

const DISPENSARY_CATS = [
  { id: "all",         label: "All" },
  { id: "antibiotics", label: "Antibiotics" },
  { id: "cardio",      label: "Cardio" },
  { id: "diabetes",    label: "Diabetes" },
  { id: "pain",        label: "Pain" },
  { id: "gi",          label: "GI / ORS" },
  { id: "respiratory", label: "Respiratory" },
  { id: "vitamins",    label: "Vitamins" },
];

// Today's dispensing log — what's been sold/handed over from the cabinet today
const DISPENSE_LOG = [
  { id: "DX-4821", time: "14:32", patient: "Sokha Chann",    mrn: "P-9134", drug: "Metformin 500 mg",       qty: 60, total: 9.00,  pay: "KHQR",  rx: true,  prescriber: "Dr. Sopha" },
  { id: "DX-4820", time: "14:18", patient: "Walk-in",        mrn: "—",      drug: "Paracetamol 500 mg",     qty: 20, total: 1.60,  pay: "Cash",  rx: false, prescriber: "OTC" },
  { id: "DX-4819", time: "13:55", patient: "Pisey Long",     mrn: "P-7720", drug: "Amoxicillin 500 mg",     qty: 21, total: 5.25,  pay: "Cash",  rx: true,  prescriber: "Dr. Sopha" },
  { id: "DX-4818", time: "13:40", patient: "Walk-in",        mrn: "—",      drug: "ORS sachet · Royal-D",   qty: 6,  total: 1.20,  pay: "Cash",  rx: false, prescriber: "OTC" },
  { id: "DX-4817", time: "12:22", patient: "Vannak Heng",    mrn: "P-8602", drug: "Amlodipine 5 mg",        qty: 30, total: 5.40,  pay: "KHQR",  rx: true,  prescriber: "Dr. Sopha" },
  { id: "DX-4816", time: "11:48", patient: "Sopheap Mao",    mrn: "P-8866", drug: "Omeprazole 20 mg",       qty: 14, total: 2.80,  pay: "KHQR",  rx: true,  prescriber: "Dr. Sopha" },
  { id: "DX-4815", time: "11:05", patient: "Walk-in",        mrn: "—",      drug: "Ventolin inhaler",       qty: 1,  total: 4.20,  pay: "Cash",  rx: true,  prescriber: "Dr. Sopha" },
  { id: "DX-4814", time: "10:32", patient: "Channary Pich",  mrn: "P-9011", drug: "Losartan 50 mg",         qty: 30, total: 6.60,  pay: "Cash",  rx: true,  prescriber: "Dr. Sopha" },
  { id: "DX-4813", time: "09:50", patient: "Walk-in",        mrn: "—",      drug: "Vitamin C 1000 mg",      qty: 10, total: 4.00,  pay: "Cash",  rx: false, prescriber: "OTC" },
  { id: "DX-4812", time: "09:18", patient: "Dara Sok",       mrn: "P-8410", drug: "Ciprofloxacin 500 mg",   qty: 14, total: 6.30,  pay: "KHQR",  rx: true,  prescriber: "Dr. Sopha" },
];

// Suppliers — Cambodia distributors
const SUPPLIERS = [
  { id: "eurofar",     name: "Eurofar Cambodge",       lead: "2 days", terms: "Net 30",     rating: "★★★★★", notes: "Generics + chronic disease" },
  { id: "medico",      name: "Medico Cambodge",        lead: "1 day",  terms: "COD / Net 14", rating: "★★★★", notes: "Antibiotics, fast for short-dated" },
  { id: "ppm",         name: "PPM (Pharma Product Mfg)", lead: "3 days", terms: "Net 30",   rating: "★★★★", notes: "Local manufacture — paracetamol, ORS" },
  { id: "pharmalink",  name: "Pharmalink",             lead: "2 days", terms: "Net 30",     rating: "★★★",   notes: "Inhalers, specialty" },
];

function DispensaryView() {
  const [tier] = useDoctorTier();
  const [tab, setTab] = useState("inventory");        // inventory | sales | replenishment
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [reorderDraft, setReorderDraft] = useState({}); // drugId → packs
  const [dispenseDrug, setDispenseDrug] = useState(null);

  if (tier === "explorer") {
    return (
      <ExplorerEmptyState
        icon={Pill}
        title="Your dispensary is empty"
        body="In-house dispensing, sales receipts, and stock replenishment all live here. Verify your license to start stocking your dispensary and selling at the counter."
      />
    );
  }

  const drugs = DRUGS.filter(d => (cat === "all" || d.category === cat) &&
    (q.trim() === "" || d.brand.toLowerCase().includes(q.toLowerCase()) || d.generic.toLowerCase().includes(q.toLowerCase())));

  const criticalCount = DRUGS.filter(d => drugStatus(d) === "critical").length;
  const lowCount      = DRUGS.filter(d => drugStatus(d) === "low").length;
  const expiringCount = DRUGS.filter(d => drugExpirySoon(d)).length;
  const draftCount    = Object.values(reorderDraft).filter(q => q > 0).length;

  // Today KPIs from the dispensing log
  const todayRevenue = DISPENSE_LOG.reduce((s, e) => s + e.total, 0);
  const todayUnits   = DISPENSE_LOG.reduce((s, e) => s + e.qty,   0);
  const todayRxCount = DISPENSE_LOG.filter(e => e.rx).length;

  // Monthly estimate — weeklyBurn × unitPrice × ~4.33
  const monthRevenue = DRUGS.reduce((s, d) => s + d.weeklyBurn * d.unitPrice * 4.33, 0);
  const monthMargin  = DRUGS.reduce((s, d) => s + d.weeklyBurn * (d.unitPrice - d.unitCost) * 4.33, 0);

  const addReorder = (id) => setReorderDraft(r => ({ ...r, [id]: (r[id] ?? 0) + 1 }));
  const removeReorder = (id) => setReorderDraft(r => {
    const next = { ...r };
    const v = (next[id] ?? 0) - 1;
    if (v <= 0) delete next[id]; else next[id] = v;
    return next;
  });

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto">
      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-3">Cabinet revenue</div>
      <div className="flex items-center gap-3 mb-1">
        <h1 className="font-display text-[30px] font-medium leading-none text-ink-2">
          Dispensary — <span className="text-ink-3">{DRUGS.length} SKUs</span>
        </h1>
        <PreviewLock />
      </div>
      <p className="text-[12.5px] text-ink-3 mb-5">
        In-clinic pharma sales, stock on hand, and one-tap replenishment. Days-left and burn rate
        are computed from your last 4 weeks of dispensing. KHR auto-converts at <span className="font-mono text-ink-2">4,100 ៛ / $1</span>.
      </p>

      <PreviewBlur>
      <div className="flex items-center justify-end mb-3">
        <button
          onClick={() => setDispenseDrug(DRUGS[0])}
          className="inline-flex items-center gap-1.5 bg-jade text-white text-[12.5px] font-medium px-3 py-1.5 rounded-md hover:bg-jade-2 transition"
        >
          <Plus size={13} /> Dispense
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiTile
          eyebrow="Today · revenue"
          value={`$${todayRevenue.toFixed(2)}`}
          sub={`≈ ${(todayRevenue * 4100).toLocaleString()} ៛ · ${DISPENSE_LOG.length} dispenses`}
          tone="jade"
          icon={<Banknote size={12} />}
        />
        <KpiTile
          eyebrow="Today · units"
          value={`${todayUnits}`}
          sub={`${todayRxCount} on Rx · ${DISPENSE_LOG.length - todayRxCount} OTC`}
          tone="plum"
          icon={<Pill size={12} />}
        />
        <KpiTile
          eyebrow="Stock alerts"
          value={`${criticalCount + lowCount}`}
          sub={`${criticalCount} critical · ${lowCount} low · ${expiringCount} expiring <6mo`}
          tone={criticalCount > 0 ? "crimson" : "amber"}
          icon={<AlertTriangle size={12} />}
        />
        <KpiTile
          eyebrow="Revenue · MTD est."
          value={`$${Math.round(monthRevenue).toLocaleString()}`}
          sub={`Gross margin ≈ $${Math.round(monthMargin).toLocaleString()} (${Math.round(monthMargin / monthRevenue * 100)}%)`}
          tone="ink"
          icon={<TrendingUp size={12} />}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-line">
        <DispensaryTab id="inventory"     label="Inventory"     count={DRUGS.length}        active={tab} onClick={setTab} />
        <DispensaryTab id="sales"         label="Sales · today" count={DISPENSE_LOG.length} active={tab} onClick={setTab} />
        <DispensaryTab id="replenishment" label="Replenishment" count={criticalCount + lowCount} active={tab} onClick={setTab} badgeTone={criticalCount > 0 ? "crimson" : (lowCount > 0 ? "amber" : "ink")} />
      </div>

      {tab === "inventory" && (
        <div className="grid grid-cols-12 gap-6">
          <div className={dispenseDrug ? "col-span-8" : "col-span-12"}>
            {/* Search + category chips */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-surface border border-line rounded-md px-2.5 py-1.5 w-[260px]">
                <Search size={13} className="text-ink-3" />
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Search brand or generic…"
                  className="bg-transparent text-[12.5px] outline-none flex-1 placeholder:text-ink-3"
                />
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {DISPENSARY_CATS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCat(c.id)}
                    className={`text-[11.5px] px-2.5 py-1 rounded-full border transition ${
                      cat === c.id
                        ? "bg-ink text-bg border-ink"
                        : "bg-surface text-ink-2 border-line hover:bg-surface-2"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_80px_80px_90px_90px_120px] gap-3 px-3.5 py-1 text-[9.5px] uppercase tracking-wider text-ink-3 font-semibold">
              <div>Drug</div>
              <div className="text-right">On hand</div>
              <div className="text-right">Per week</div>
              <div className="text-right">Days left</div>
              <div className="text-right">Price · margin</div>
              <div className="text-right">Action</div>
            </div>

            <div className="space-y-1.5">
              {drugs.map(d => (
                <DrugRow
                  key={d.id}
                  drug={d}
                  onDispense={() => setDispenseDrug(d)}
                  onReorder={() => addReorder(d.id)}
                />
              ))}
              {drugs.length === 0 && (
                <div className="text-center py-10 text-[12.5px] text-ink-3">
                  No SKUs match your search.
                </div>
              )}
            </div>
          </div>

          {dispenseDrug && (
            <div className="col-span-4">
              <QuickDispensePanel drug={dispenseDrug} onClose={() => setDispenseDrug(null)} />
            </div>
          )}
        </div>
      )}

      {tab === "sales" && <DispensarySalesTab log={DISPENSE_LOG} />}

      {tab === "replenishment" && (
        <DispensaryReplenishmentTab
          draft={reorderDraft}
          onAdd={addReorder}
          onRemove={removeReorder}
          onClear={() => setReorderDraft({})}
        />
      )}
      </PreviewBlur>
    </div>
  );
}

function KpiTile({ eyebrow, value, sub, tone = "ink", icon }) {
  const toneMap = {
    jade:    "text-jade-2",
    plum:    "text-plum",
    amber:   "text-amber",
    crimson: "text-crimson",
    ink:     "text-ink-2",
  };
  return (
    <div className="bg-surface border border-line rounded-lg p-3.5">
      <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] font-semibold mb-1.5 ${toneMap[tone]}`}>
        {icon}{eyebrow}
      </div>
      <div className="font-display text-[24px] font-medium tnum leading-none">{value}</div>
      <div className="text-[11px] text-ink-3 mt-1.5">{sub}</div>
    </div>
  );
}

function DispensaryTab({ id, label, count, active, onClick, badgeTone }) {
  const tones = {
    crimson: "text-crimson bg-crimson-soft",
    amber:   "text-amber bg-amber-soft",
    ink:     "text-ink-3 bg-line-2",
  };
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-3 py-2 text-[12.5px] tab-underline ${active === id ? "active text-ink font-medium" : "text-ink-3 hover:text-ink"}`}
    >
      {label}
      {count > 0 && (
        <span className={`ml-1.5 text-[9.5px] font-mono px-1.5 py-0.5 rounded ${badgeTone ? tones[badgeTone] : "text-ink-3"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function DrugRow({ drug, onDispense, onReorder }) {
  const days = drugDaysLeft(drug);
  const status = drugStatus(drug);
  const expSoon = drugExpirySoon(drug);
  const styles = {
    critical: { border: "border-crimson", chipBg: "bg-crimson-soft", chipText: "text-crimson", daysText: "text-crimson", label: "Critical" },
    low:      { border: "border-amber",   chipBg: "bg-amber-soft",   chipText: "text-amber",   daysText: "text-amber",   label: "Running low" },
    stocked:  { border: "border-line",    chipBg: "bg-jade-soft",    chipText: "text-jade-2",  daysText: "text-jade-2",  label: "Stocked" },
  }[status];
  const margin = drug.unitPrice - drug.unitCost;
  const marginPct = Math.round((margin / drug.unitPrice) * 100);

  return (
    <div className={`bg-surface border ${styles.border} rounded-lg px-3.5 py-3 grid grid-cols-[1fr_80px_80px_90px_90px_120px] gap-3 items-center`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="font-medium text-[13.5px] truncate">{drug.brand}</div>
          <span className="text-[10.5px] text-ink-3 truncate">· {drug.generic}</span>
          {expSoon && (
            <span className="text-[9.5px] font-medium px-1.5 py-0.5 rounded bg-amber-soft text-amber inline-flex items-center gap-1 whitespace-nowrap">
              <Clock size={9} /> exp {drug.expiry}
            </span>
          )}
        </div>
        <div className="text-[11px] text-ink-3 truncate">
          {drug.form} · batch <span className="font-mono">{drug.batch}</span>
        </div>
      </div>

      <div className="text-right">
        <div className="font-mono text-[13px] tnum">{drug.onHand}</div>
        <div className="text-[10px] text-ink-3">units</div>
      </div>

      <div className="text-right">
        <div className="font-mono text-[12.5px] text-ink-2 tnum">{drug.weeklyBurn}</div>
        <div className="text-[10px] text-ink-3">u/wk</div>
      </div>

      <div className="text-right">
        <div className={`font-mono text-[13px] tnum font-medium ${styles.daysText}`}>{days}d</div>
        <span className={`inline-block text-[9.5px] font-medium px-1.5 py-0.5 rounded ${styles.chipBg} ${styles.chipText}`}>
          {styles.label}
        </span>
      </div>

      <div className="text-right">
        <div className="font-mono text-[12.5px] tnum">${drug.unitPrice.toFixed(2)}</div>
        <div className="text-[10px] text-jade-2 tnum">+{marginPct}% margin</div>
      </div>

      <div className="flex items-center gap-1.5 justify-end">
        <button
          onClick={onReorder}
          className="text-[11px] text-ink-2 hover:text-ink border border-line rounded-md px-2 py-1 hover:bg-surface-2 transition inline-flex items-center gap-1"
          title="Add to reorder cart"
        >
          <Plus size={11} /> Reorder
        </button>
        <button
          onClick={onDispense}
          className="text-[11px] bg-jade text-white rounded-md px-2 py-1 hover:bg-jade-2 transition inline-flex items-center gap-1"
        >
          <Pill size={11} /> Dispense
        </button>
      </div>
    </div>
  );
}

function QuickDispensePanel({ drug, onClose }) {
  const [qty, setQty] = useState(10);
  const [patient, setPatient] = useState("");
  const [pay, setPay] = useState("KHQR");
  const total = qty * drug.unitPrice;

  return (
    <div className="bg-surface border border-line rounded-xl p-4 sticky top-[72px]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-jade-2 font-semibold mb-0.5">Quick dispense</div>
          <div className="font-medium text-[14px]">{drug.brand}</div>
          <div className="text-[11px] text-ink-3">{drug.generic} · {drug.form}</div>
        </div>
        <button onClick={onClose} className="text-ink-3 hover:text-ink p-1 -m-1"><X size={14} /></button>
      </div>

      <div className="hairline mb-3" />

      <label className="block mb-3">
        <div className="text-[10.5px] uppercase tracking-wider text-ink-3 font-semibold mb-1">Patient</div>
        <input
          value={patient}
          onChange={e => setPatient(e.target.value)}
          placeholder="Search patient or 'Walk-in'"
          className="w-full bg-bg border border-line rounded-md px-2.5 py-1.5 text-[12.5px] outline-none focus:border-jade-2"
        />
      </label>

      <label className="block mb-3">
        <div className="text-[10.5px] uppercase tracking-wider text-ink-3 font-semibold mb-1">Quantity (units)</div>
        <div className="flex items-center gap-2">
          <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-7 h-7 border border-line rounded-md text-ink-2 hover:bg-surface-2">−</button>
          <input
            type="number"
            value={qty}
            onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="flex-1 bg-bg border border-line rounded-md px-2 py-1 text-[13px] outline-none focus:border-jade-2 font-mono tnum text-center"
          />
          <button onClick={() => setQty(q => q + 1)} className="w-7 h-7 border border-line rounded-md text-ink-2 hover:bg-surface-2">+</button>
        </div>
        <div className="text-[10.5px] text-ink-3 mt-1">On hand: <span className="font-mono">{drug.onHand}</span> · after: <span className="font-mono">{Math.max(0, drug.onHand - qty)}</span></div>
      </label>

      <div className="mb-3">
        <div className="text-[10.5px] uppercase tracking-wider text-ink-3 font-semibold mb-1">Payment</div>
        <div className="flex items-center gap-1">
          {["KHQR", "Cash", "Insurance"].map(p => (
            <button
              key={p}
              onClick={() => setPay(p)}
              className={`flex-1 text-[11.5px] py-1.5 rounded-md border transition ${
                pay === p ? "bg-ink text-bg border-ink" : "bg-surface border-line text-ink-2 hover:bg-surface-2"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="hairline mb-3" />

      <div className="flex items-baseline justify-between mb-1">
        <div className="text-[11px] text-ink-3">Total</div>
        <div className="font-display text-[22px] font-medium tnum">${total.toFixed(2)}</div>
      </div>
      <div className="text-right text-[10.5px] text-ink-3 mb-3 font-mono">≈ {(total * 4100).toLocaleString()} ៛</div>

      <button className="w-full bg-jade text-white text-[12.5px] font-medium py-2 rounded-md hover:bg-jade-2 transition inline-flex items-center justify-center gap-1.5">
        <CheckCircle2 size={13} /> Confirm dispense
      </button>
      <button className="w-full mt-1.5 text-[11px] text-ink-3 hover:text-ink py-1">
        Print receipt + label
      </button>
    </div>
  );
}

function DispensarySalesTab({ log }) {
  const total = log.reduce((s, e) => s + e.total, 0);
  const cash = log.filter(e => e.pay === "Cash").reduce((s, e) => s + e.total, 0);
  const khqr = log.filter(e => e.pay === "KHQR").reduce((s, e) => s + e.total, 0);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-8">
        <div className="grid grid-cols-[60px_1fr_180px_70px_80px_60px_80px] gap-3 px-3.5 py-1 text-[9.5px] uppercase tracking-wider text-ink-3 font-semibold">
          <div>Time</div>
          <div>Patient</div>
          <div>Drug</div>
          <div className="text-right">Qty</div>
          <div className="text-right">Total</div>
          <div>Pay</div>
          <div>Type</div>
        </div>
        <div className="space-y-1">
          {log.map(e => (
            <div key={e.id} className="bg-surface border border-line rounded-lg px-3.5 py-2.5 grid grid-cols-[60px_1fr_180px_70px_80px_60px_80px] gap-3 items-center text-[12.5px]">
              <div className="font-mono text-[11.5px] text-ink-3 tnum">{e.time}</div>
              <div className="min-w-0">
                <div className="truncate">{e.patient}</div>
                <div className="text-[10.5px] text-ink-3 font-mono">{e.mrn}</div>
              </div>
              <div className="truncate text-ink-2">{e.drug}</div>
              <div className="text-right font-mono tnum">{e.qty}</div>
              <div className="text-right font-mono tnum font-medium">${e.total.toFixed(2)}</div>
              <div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  e.pay === "KHQR" ? "bg-jade-soft text-jade-2" :
                  e.pay === "Cash" ? "bg-amber-soft text-amber" :
                                     "bg-plum/15 text-plum"
                }`}>{e.pay}</span>
              </div>
              <div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  e.rx ? "bg-line-2 text-ink-2" : "bg-line-2 text-ink-3"
                }`}>{e.rx ? "Rx" : "OTC"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-4 space-y-3">
        <div className="bg-surface border border-line rounded-xl p-4">
          <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1.5">Today · settled</div>
          <div className="font-display text-[28px] font-medium tnum leading-none">${total.toFixed(2)}</div>
          <div className="text-[11px] text-ink-3 mt-1 font-mono">≈ {(total * 4100).toLocaleString()} ៛</div>
          <div className="hairline my-3" />
          <ul className="space-y-1.5 text-[11.5px]">
            <li className="flex justify-between">
              <span className="text-ink-2 inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-jade-2" /> KHQR</span>
              <span className="font-mono text-ink-2 tnum">${khqr.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-ink-2 inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber" /> Cash</span>
              <span className="font-mono text-ink-2 tnum">${cash.toFixed(2)}</span>
            </li>
          </ul>
        </div>

        <div className="bg-surface border border-line rounded-xl p-4">
          <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-2">Top sellers · today</div>
          <ul className="space-y-1.5 text-[11.5px]">
            <li className="flex justify-between"><span className="text-ink-2">Metformin 500 mg</span><span className="font-mono text-ink-3 tnum">$9.00 · 60u</span></li>
            <li className="flex justify-between"><span className="text-ink-2">Losartan 50 mg</span><span className="font-mono text-ink-3 tnum">$6.60 · 30u</span></li>
            <li className="flex justify-between"><span className="text-ink-2">Ciprofloxacin 500</span><span className="font-mono text-ink-3 tnum">$6.30 · 14u</span></li>
            <li className="flex justify-between"><span className="text-ink-2">Amlodipine 5 mg</span><span className="font-mono text-ink-3 tnum">$5.40 · 30u</span></li>
            <li className="flex justify-between"><span className="text-ink-2">Amoxicillin 500</span><span className="font-mono text-ink-3 tnum">$5.25 · 21u</span></li>
          </ul>
        </div>

        <button className="w-full bg-surface border border-line rounded-md py-2 text-[11.5px] text-ink-2 hover:bg-surface-2 inline-flex items-center justify-center gap-1.5">
          <FileText size={12} /> Export end-of-day report
        </button>
      </div>
    </div>
  );
}

function DispensaryReplenishmentTab({ draft, onAdd, onRemove, onClear }) {
  // Auto-suggested reorder list: critical + low + expiring soon
  const suggested = DRUGS
    .map(d => ({ d, status: drugStatus(d), expSoon: drugExpirySoon(d) }))
    .filter(x => x.status !== "stocked" || x.expSoon)
    .sort((a, b) => {
      const rank = { critical: 0, low: 1, stocked: 2 };
      return rank[a.status] - rank[b.status];
    });

  const cartItems = Object.entries(draft).map(([id, packs]) => {
    const d = DRUGS.find(x => x.id === id);
    return d ? { d, packs } : null;
  }).filter(Boolean);

  const cartTotal = cartItems.reduce((s, { d, packs }) => s + d.unitCost * d.packSize * packs, 0);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className={cartItems.length > 0 ? "col-span-8" : "col-span-12"}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-[18px] font-medium">Suggested reorder</h2>
            <p className="text-[11.5px] text-ink-3">Items at or below 21 days of stock, or expiring within 6 months.</p>
          </div>
          <button className="text-[11.5px] text-jade-2 font-medium hover:underline inline-flex items-center gap-1">
            <Zap size={11} /> Auto-fill all to 60-day stock
          </button>
        </div>

        <div className="space-y-1.5">
          {suggested.map(({ d, status, expSoon }) => (
            <ReplenishmentRow
              key={d.id}
              drug={d}
              status={status}
              expSoon={expSoon}
              packs={draft[d.id] ?? 0}
              onAdd={() => onAdd(d.id)}
              onRemove={() => onRemove(d.id)}
            />
          ))}
        </div>

        <div className="mt-6 bg-surface border border-line rounded-xl p-4">
          <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-3">Suppliers</div>
          <div className="grid grid-cols-2 gap-2">
            {SUPPLIERS.map(s => (
              <div key={s.id} className="border border-line rounded-md p-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-[12.5px]">{s.name}</div>
                  <span className="text-[10px] text-amber">{s.rating}</span>
                </div>
                <div className="text-[10.5px] text-ink-3 mt-0.5">{s.notes}</div>
                <div className="text-[10.5px] text-ink-2 mt-1.5 font-mono">{s.lead} · {s.terms}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {cartItems.length > 0 && (
        <div className="col-span-4">
          <div className="bg-surface border border-line rounded-xl p-4 sticky top-[72px]">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold">Reorder cart · {cartItems.length} SKU</div>
              <button onClick={onClear} className="text-[10.5px] text-ink-3 hover:text-ink">Clear</button>
            </div>

            <div className="space-y-2 mb-3">
              {cartItems.map(({ d, packs }) => (
                <div key={d.id} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium truncate">{d.brand}</div>
                    <div className="text-[10.5px] text-ink-3 truncate">
                      {packs} × {d.packSize}u · ${(d.unitCost * d.packSize * packs).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onRemove(d.id)} className="w-6 h-6 border border-line rounded-md text-ink-2 hover:bg-surface-2 text-[12px]">−</button>
                    <div className="w-6 text-center font-mono text-[12px] tnum">{packs}</div>
                    <button onClick={() => onAdd(d.id)} className="w-6 h-6 border border-line rounded-md text-ink-2 hover:bg-surface-2 text-[12px]">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hairline mb-3" />

            <div className="flex items-baseline justify-between mb-1">
              <div className="text-[11px] text-ink-3">Subtotal · cost</div>
              <div className="font-display text-[20px] font-medium tnum">${cartTotal.toFixed(2)}</div>
            </div>
            <div className="text-right text-[10.5px] text-ink-3 mb-3">
              Suggested supplier: <span className="text-ink-2 font-medium">Eurofar Cambodge</span> · 2-day lead
            </div>

            <button className="w-full bg-jade text-white text-[12.5px] font-medium py-2 rounded-md hover:bg-jade-2 transition inline-flex items-center justify-center gap-1.5">
              <Send size={12} /> Send purchase order
            </button>
            <button className="w-full mt-1.5 text-[11px] text-ink-3 hover:text-ink py-1">
              Save as draft
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReplenishmentRow({ drug, status, expSoon, packs, onAdd, onRemove }) {
  const days = drugDaysLeft(drug);
  const styles = {
    critical: { border: "border-crimson", chip: "bg-crimson-soft text-crimson",   label: "Critical" },
    low:      { border: "border-amber",   chip: "bg-amber-soft text-amber",       label: "Running low" },
    stocked:  { border: "border-line",    chip: "bg-line-2 text-ink-2",           label: "Expiring" },
  }[status];
  const suggest = Math.max(1, Math.ceil((drug.weeklyBurn * 8 - drug.onHand) / drug.packSize));

  return (
    <div className={`bg-surface border ${styles.border} rounded-lg px-3.5 py-3 flex items-center gap-4`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="font-medium text-[13px] truncate">{drug.brand}</div>
          <span className="text-[10.5px] text-ink-3">· {drug.generic}</span>
          <span className={`text-[9.5px] font-medium px-1.5 py-0.5 rounded ${styles.chip}`}>{styles.label}</span>
          {expSoon && (
            <span className="text-[9.5px] font-medium px-1.5 py-0.5 rounded bg-amber-soft text-amber inline-flex items-center gap-1">
              <Clock size={9} /> exp {drug.expiry}
            </span>
          )}
        </div>
        <div className="text-[11px] text-ink-3 mt-0.5">
          {drug.form} · <span className="font-mono">{drug.onHand}u</span> on hand · <span className="font-mono">{days}d</span> left · pack of {drug.packSize}
        </div>
      </div>

      <div className="text-right hidden md:block">
        <div className="text-[9.5px] uppercase tracking-wider text-ink-3">Suggest</div>
        <div className="font-mono text-[12.5px] tnum">{suggest} pack{suggest === 1 ? "" : "s"}</div>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={onRemove} className="w-7 h-7 border border-line rounded-md text-ink-2 hover:bg-surface-2 text-[13px]">−</button>
        <div className="w-7 text-center font-mono text-[13px] tnum">{packs}</div>
        <button onClick={onAdd} className="w-7 h-7 border border-line rounded-md text-ink-2 hover:bg-surface-2 text-[13px]">+</button>
      </div>

      <div className="text-right min-w-[70px]">
        <div className="text-[9.5px] uppercase tracking-wider text-ink-3">Pack cost</div>
        <div className="font-mono text-[12.5px] tnum text-ink-2">${(drug.unitCost * drug.packSize).toFixed(2)}</div>
      </div>
    </div>
  );
}

/* ============================================================
   PICKUPS — courier dispatch list + detail
   ============================================================ */
const PICKUPS = [
  { id: "PU-9134-4821", bookingId: "KO-9134-4821", bookingCode: "FZ48210", patient: "Sokha Chann", mrn: "P-9134", route: "In-clinic draw", type: "regular", status: "en-route",   requestedAt: "today, 13:42", eta: "next sweep · 14:15", driver: "Sok S." },
  { id: "PU-9134-4604", bookingId: "KO-9134-4604", bookingCode: "FZ46040", patient: "Sokha Chann", mrn: "P-9134", route: "In-clinic draw", type: "regular", status: "assigned",   requestedAt: "20m ago",      eta: "next sweep", driver: "Channa P." },
  { id: "PU-8866-4029", bookingId: "KO-8866-4029", bookingCode: "FZ40290", patient: "Sopheap Mao", mrn: "P-8866", route: "In-clinic draw", type: "regular", status: "completed",  requestedAt: "2d ago",       eta: "—",          driver: "Bopha L." },
];

const pickupStatusMeta = {
  "pending":   { label: "Pending dispatch", color: "text-ink-2 bg-line-2",     icon: Clock },
  "assigned":  { label: "Assigned",         color: "text-amber bg-amber-soft", icon: Motorbike },
  "en-route":  { label: "En route",         color: "text-jade-2 bg-jade-soft", icon: Motorbike },
  "arrived":   { label: "Arrived",          color: "text-jade-2 bg-jade-soft", icon: CheckCircle2 },
  "completed": { label: "Completed",        color: "text-jade-2 bg-jade-soft", icon: CheckCircle2 },
  "cancelled": { label: "Cancelled",        color: "text-ink-3 bg-line-2",     icon: X },
};

function PickupsListView({ onOpenPickup, onStartVerification }) {
  const [tier] = useDoctorTier();
  const [filter, setFilter] = useState("active");
  const [expandedId, setExpandedId] = useState(null);
  if (tier === "explorer") {
    return (
      <ExplorerEmptyState
        icon={Motorbike}
        title="No pickups yet"
        body="Once you place an in-clinic draw, a Kura courier picks up the sample and brings it to the lab — every pickup gets tracked here. Verify your license to start placing draws."
        onStartVerification={onStartVerification}
      />
    );
  }
  const isActive = (p) => p.status === "pending" || p.status === "assigned" || p.status === "en-route" || p.status === "arrived";

  const visible = PICKUPS.filter(p => {
    if (filter === "active") return isActive(p);
    if (filter === "all")    return true;
    return p.status === filter;
  });
  const counts = {
    all:        PICKUPS.length,
    active:     PICKUPS.filter(isActive).length,
    "en-route": PICKUPS.filter(p => p.status === "en-route").length,
    assigned:   PICKUPS.filter(p => p.status === "assigned").length,
    completed:  PICKUPS.filter(p => p.status === "completed").length,
  };

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-3">Logistics</div>
          <h1 className="font-display text-[30px] font-medium leading-none">Pickups</h1>
          <p className="text-[12.5px] text-ink-3 mt-1.5">Kura courier pickups for in-clinic draws — track active dispatches and review past sweeps.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 text-[11.5px] flex-wrap">
        <OrdersFilterPill active={filter === "active"}    onClick={() => setFilter("active")}>Active · {counts.active}</OrdersFilterPill>
        <OrdersFilterPill active={filter === "en-route"}  onClick={() => setFilter("en-route")}>En route · {counts["en-route"]}</OrdersFilterPill>
        <OrdersFilterPill active={filter === "assigned"}  onClick={() => setFilter("assigned")}>Assigned · {counts.assigned}</OrdersFilterPill>
        <OrdersFilterPill active={filter === "completed"} onClick={() => setFilter("completed")}>Completed · {counts.completed}</OrdersFilterPill>
        <OrdersFilterPill active={filter === "all"}       onClick={() => setFilter("all")}>All · {counts.all}</OrdersFilterPill>
      </div>

      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-line-2 bg-surface-2/50 text-[10.5px] uppercase tracking-[0.14em] text-ink-3">
              <th className="text-left px-4 py-2.5 font-semibold">Pickup</th>
              <th className="text-left px-3 py-2.5 font-semibold">Booking</th>
              <th className="text-left px-3 py-2.5 font-semibold">Patient</th>
              <th className="text-left px-3 py-2.5 font-semibold">Type</th>
              <th className="text-left px-3 py-2.5 font-semibold">Status</th>
              <th className="text-left px-3 py-2.5 font-semibold">Driver</th>
              <th className="text-right px-3 py-2.5 font-semibold">ETA</th>
              <th className="text-right px-3 py-2.5 font-semibold">Requested</th>
              <th className="px-3 py-2.5 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-ink-3 text-[12px]">No pickups match the current filter.</td></tr>
            ) : visible.map(p => {
              const meta = pickupStatusMeta[p.status];
              const isOpen = expandedId === p.id;
              return (
                <React.Fragment key={p.id}>
                  <tr
                    onClick={() => setExpandedId(isOpen ? null : p.id)}
                    className={`border-b border-line-2 last:border-b-0 cursor-pointer transition group ${isOpen ? "bg-surface-2/60" : "hover:bg-surface-2/50"}`}
                  >
                    <td className="px-4 py-3 align-top font-mono text-[11px] text-ink-2 tracking-[0.06em]">{p.id}</td>
                    <td className="px-3 py-3 align-top font-mono text-[11px] text-ink-2 tracking-[0.06em]">{p.bookingCode}</td>
                    <td className="px-3 py-3 align-top">
                      <div className="text-ink font-medium text-[12.5px]">{p.patient}</div>
                      <div className="text-[10.5px] text-ink-3 font-mono">{p.mrn}</div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <span className="text-[11.5px] text-ink-2 inline-flex items-center gap-1"><Motorbike size={11} className="text-ink-3" /> Sweep</span>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <span className={`text-[10px] uppercase tracking-wider font-semibold inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${meta.color}`}>
                        <meta.icon size={10} /> {meta.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 align-top text-[11.5px] text-ink-2">{p.driver || "—"}</td>
                    <td className="px-3 py-3 align-top text-right text-[11.5px] font-mono text-ink-2 tnum">{p.eta}</td>
                    <td className="px-3 py-3 align-top text-right text-[11px] text-ink-3 font-mono">{p.requestedAt}</td>
                    <td className="px-3 py-3 text-right align-top">
                      <ChevronDown size={13} className={`text-ink-3 inline-block transition-transform ${isOpen ? "rotate-180 text-ink" : ""}`} />
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-surface-2/30">
                      <td colSpan={9} className="px-4 pb-4 pt-1 border-b border-line-2">
                        <InlinePickupDetail pickup={p} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PickupDetailView({ pickup, onBack }) {
  const meta = pickupStatusMeta[pickup.status];
  const initialCourier = ({
    "pending":   "unassigned",
    "assigned":  "assigned-elsewhere",
    "en-route":  "en-route-to-you",
    "arrived":   "arrived",
    "completed": null,
    "cancelled": null,
  })[pickup.status];
  const [courier, setCourier] = useState(initialCourier);

  // Synthesised booking summary — in production this comes from the order record
  // keyed by pickup.bookingId. For the proto we infer tests by patient.
  const bookingSummary = useMemo(() => {
    const byMrn = {
      "P-9134": { tests: ["HbA1c", "Microalbumin"],          total: 20 },
      "P-8866": { tests: ["Lipid panel", "TSH"],              total: 24 },
    }[pickup.mrn] ?? { tests: ["HbA1c"], total: 8 };
    return { id: pickup.bookingId, code: pickup.bookingCode, ...byMrn };
  }, [pickup]);

  const tubes = tubesForTests(bookingSummary.tests.map(name => ({ name })));

  // Chain-of-custody — proto narrative for stakeholder demos
  const custody = [
    { label: "Sample drawn",           when: "today, 13:42", who: "Dr. Sopha",      done: true },
    { label: "Pickup requested",       when: pickup.requestedAt, who: "Clinic system", done: true },
    { label: "Courier assigned",       when: pickup.status === "pending" ? "—" : "today, 13:51", who: pickup.driver, done: pickup.status !== "pending" },
    { label: "En route to clinic",     when: ["en-route","arrived","completed"].includes(pickup.status) ? "today, 14:02" : "—", who: pickup.driver, done: ["en-route","arrived","completed"].includes(pickup.status) },
    { label: "Tubes handed over",      when: ["arrived","completed"].includes(pickup.status) ? "today, 14:18" : "—", who: pickup.driver, done: ["arrived","completed"].includes(pickup.status) },
    { label: "Delivered to lab",       when: pickup.status === "completed" ? "today, 14:54" : "—", who: pickup.driver, done: pickup.status === "completed" },
  ];

  const openPatientInTab = () => openEntityInNewTab("patient", { id: pickup.mrn, name: pickup.patient });

  return (
    <div className="px-8 py-6 max-w-[1280px] mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 mb-3 text-[12px] text-ink-3">
        <button onClick={onBack} className="inline-flex items-center gap-1 hover:text-ink">
          <ChevronLeft size={13} /> Pickups
        </button>
        <ChevronRight size={11} className="text-ink-3" />
        <span className="font-mono text-ink-2">{pickup.id}</span>
      </div>

      {/* Cross-link back to the patient chart */}
      <RelatedLinkBar
        items={[
          { kind: "patient", label: pickup.patient, sub: pickup.mrn, onOpen: openPatientInTab },
        ]}
      />

      {/* Header card — pickup-first identity */}
      <div className="bg-surface border border-line rounded-xl p-5 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3">Pickup</span>
              <h1 className="font-display font-mono text-[22px] font-medium leading-none tracking-[0.06em]">{pickup.id}</h1>
              <span className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded inline-flex items-center gap-1 ${meta.color}`}>
                <meta.icon size={10} /> {meta.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[12px] text-ink-3 flex-wrap">
              <span className="inline-flex items-center gap-1">{pickup.route === "Home draw" ? <Motorbike size={11} /> : <MapPin size={11} />} {pickup.route}</span>
              <span className="inline-flex items-center gap-1"><Clock size={11} /> requested {pickup.requestedAt}</span>
              {pickup.eta && pickup.eta !== "—" && (
                <span className="inline-flex items-center gap-1 text-jade-2"><Motorbike size={11} /> ETA {pickup.eta}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button className="inline-flex items-center gap-1 text-[11.5px] px-2.5 py-1.5 rounded-md border border-line hover:border-ink text-ink-2">
              <Phone size={11} /> Call driver
            </button>
            {pickup.status !== "completed" && pickup.status !== "cancelled" && (
              <button className="inline-flex items-center gap-1 text-[11.5px] px-2.5 py-1.5 rounded-md border border-line text-crimson hover:border-crimson">
                <X size={11} /> Cancel pickup
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* LEFT — courier + samples + custody */}
        <div className="col-span-8 space-y-4">
          {courier && <CourierTrackingCard state={courier} onCycleState={setCourier} />}

          {/* Samples being collected */}
          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-line-2">
              <TestTubes size={13} className="text-jade-2" />
              <h3 className="font-display text-[15px] font-medium">Samples to transport</h3>
              <span className="text-[10.5px] font-mono text-ink-3">{tubes.length} tube{tubes.length === 1 ? "" : "s"} · {bookingSummary.tests.length} test{bookingSummary.tests.length === 1 ? "" : "s"}</span>
            </div>
            <ul className="divide-y divide-line-2">
              {tubes.map((tu, i) => (
                <li key={i} className="px-4 py-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-md shrink-0 ${tu.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium">{tu.tube}</div>
                    <div className="text-[11px] text-ink-3 truncate">{tu.volume} · {tu.tests.join(" + ")}</div>
                  </div>
                  <span className="text-[10.5px] font-mono text-ink-3 bg-line-2 px-1.5 py-0.5 rounded">{i + 1} of {tubes.length}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chain-of-custody */}
          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-line-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={13} className="text-jade-2" />
                <h3 className="font-display text-[15px] font-medium">Chain of custody</h3>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-ink-3">Audit log</span>
            </div>
            <ol className="px-4 py-3 space-y-3">
              {custody.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${step.done ? "bg-jade-2 text-white" : "bg-line text-ink-3"}`}>
                    {step.done ? <CheckCircle2 size={11} /> : <span className="w-1.5 h-1.5 rounded-full bg-ink-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[12.5px] ${step.done ? "text-ink font-medium" : "text-ink-3"}`}>{step.label}</div>
                    <div className="text-[10.5px] text-ink-3 font-mono">{step.when}{step.who && step.who !== "—" ? ` · ${step.who}` : ""}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* RIGHT — patient mini-card + driver + actions */}
        <div className="col-span-4 space-y-4">
          {/* Patient quick-card */}
          <div className="bg-surface border border-line rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users size={13} className="text-ink-3" />
                <h3 className="font-display text-[14px] font-medium">Patient</h3>
              </div>
              <button onClick={openPatientInTab} className="text-[11px] text-jade-2 font-medium hover:underline inline-flex items-center gap-1">
                Open chart <ExternalLink size={10} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-jade-soft text-jade flex items-center justify-center font-display text-[14px] font-medium shrink-0">
                {pickup.patient.split(" ").map(s => s[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-medium truncate">{pickup.patient}</div>
                <div className="text-[11px] text-ink-3 font-mono">{pickup.mrn}</div>
              </div>
            </div>
            <div className="hairline my-3" />
            <ul className="space-y-1.5 text-[11.5px]">
              <li className="flex justify-between"><span className="text-ink-3 inline-flex items-center gap-1"><Phone size={10} /> Phone</span><span className="text-ink-2 font-mono">+855 12 ••• 4471</span></li>
              <li className="flex justify-between"><span className="text-ink-3 inline-flex items-center gap-1"><MapPin size={10} /> Cabinet</span><span className="text-ink-2">T1 · BKK1</span></li>
              <li className="flex justify-between"><span className="text-ink-3">Insurer</span><span className="text-ink-2">Forte</span></li>
            </ul>
          </div>

          {/* Driver card */}
          {pickup.driver && pickup.driver !== "—" && (
            <div className="bg-surface border border-line rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Motorbike size={13} className="text-ink-3" />
                <h3 className="font-display text-[14px] font-medium">Courier</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-line-2 text-ink-2 flex items-center justify-center font-semibold text-[12px] shrink-0">
                  {pickup.driver.split(" ").map(s => s[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate">{pickup.driver}</div>
                  <div className="text-[10.5px] text-ink-3 font-mono">★ 4.9 · 248 trips · 14 today</div>
                </div>
              </div>
              <div className="hairline my-3" />
              <ul className="space-y-1.5 text-[11.5px]">
                <li className="flex justify-between"><span className="text-ink-3">Vehicle</span><span className="text-ink-2">Honda Click · ABC-3492</span></li>
                <li className="flex justify-between"><span className="text-ink-3">Started shift</span><span className="text-ink-2 font-mono">07:00</span></li>
              </ul>
              <button className="w-full mt-3 text-[11.5px] inline-flex items-center justify-center gap-1.5 bg-jade text-white rounded-md py-1.5 font-medium hover:opacity-90">
                <Phone size={11} /> Call {pickup.driver.split(" ")[0]}
              </button>
            </div>
          )}

          {/* Pickup metadata */}
          <div className="bg-surface border border-line rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={13} className="text-ink-3" />
              <h3 className="font-display text-[14px] font-medium">Pickup details</h3>
            </div>
            <ul className="space-y-1.5 text-[11.5px]">
              <li className="flex justify-between"><span className="text-ink-3">Pickup ID</span><span className="text-ink-2 font-mono">{pickup.id}</span></li>
              <li className="flex justify-between"><span className="text-ink-3">Booking</span><span className="text-ink-2 font-mono">{pickup.bookingCode}</span></li>
              <li className="flex justify-between"><span className="text-ink-3">Type</span><span className="text-ink-2">Scheduled sweep · daily</span></li>
              <li className="flex justify-between"><span className="text-ink-3">Requested</span><span className="text-ink-2">{pickup.requestedAt}</span></li>
              {pickup.eta && pickup.eta !== "—" && (
                <li className="flex justify-between"><span className="text-ink-3">ETA</span><span className="text-jade-2 font-medium">{pickup.eta}</span></li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuppliesView() {
  const [filter, setFilter] = useState("all");
  const [reorderDraft, setReorderDraft] = useState({}); // id → qty (packs)

  const filtered = filter === "all" ? SUPPLIES : SUPPLIES.filter(s => s.category === filter);
  const lowCount      = SUPPLIES.filter(s => supplyStatus(s) === "low").length;
  const criticalCount = SUPPLIES.filter(s => supplyStatus(s) === "critical").length;
  const draftCount = Object.values(reorderDraft).filter(q => q > 0).length;

  const addToReorder = (id) => setReorderDraft(d => ({ ...d, [id]: (d[id] ?? 0) + 1 }));
  const removeFromReorder = (id) => setReorderDraft(d => {
    const next = { ...d };
    const v = (next[id] ?? 0) - 1;
    if (v <= 0) delete next[id]; else next[id] = v;
    return next;
  });

  const tabs = [
    { id: "all",     label: "All",     count: SUPPLIES.length },
    { id: "tubes",   label: "Tubes",   count: SUPPLIES.filter(s => s.category === "tubes").length },
    { id: "cups",    label: "Cups",    count: SUPPLIES.filter(s => s.category === "cups").length },
    { id: "labels",  label: "Labels",  count: SUPPLIES.filter(s => s.category === "labels").length },
    { id: "needles", label: "Needles", count: SUPPLIES.filter(s => s.category === "needles").length },
    { id: "kit",     label: "Draw kit",count: SUPPLIES.filter(s => s.category === "kit").length },
  ];

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto">
      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-3">Stocking</div>
      <h1 className="font-display text-[30px] font-medium leading-none mb-1">
        Supplies — <span className="text-jade-2">{SUPPLIES.length} items</span>
      </h1>
      <p className="text-[12.5px] text-ink-3 mb-5">
        Track what's on hand at <span className="text-ink-2 font-medium">T1 · BKK1</span>. Days-left is computed from your 4-week consumption average.
      </p>

      {/* Summary chips + next delivery */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {criticalCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-crimson-soft text-crimson text-[11px] font-medium">
            <AlertTriangle size={11} /> {criticalCount} critical
          </span>
        )}
        {lowCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-soft text-amber text-[11px] font-medium">
            <AlertTriangle size={11} /> {lowCount} running low
          </span>
        )}
        <span className="text-[11.5px] text-ink-3 inline-flex items-center gap-1.5 ml-1">
          <Motorbike size={11} /> Next Kura delivery · <span className="font-mono text-ink-2">Mon 17 May</span>
        </span>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className={draftCount > 0 ? "col-span-8" : "col-span-12"}>
          {/* Category tabs */}
          <div className="flex items-center gap-1 mb-3 border-b border-line">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={`px-3 py-2 text-[12px] tab-underline ${filter === t.id ? "active text-ink font-medium" : "text-ink-3 hover:text-ink"}`}
              >
                {t.label} <span className="text-ink-3 font-mono text-[10px] ml-0.5">{t.count}</span>
              </button>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {filtered.map(s => (
              <SupplyRow
                key={s.id}
                supply={s}
                draftQty={reorderDraft[s.id] ?? 0}
                onAdd={() => addToReorder(s.id)}
                onRemove={() => removeFromReorder(s.id)}
              />
            ))}
          </div>
        </div>

        {draftCount > 0 && (
          <div className="col-span-4">
            <ReorderCart draft={reorderDraft} onClear={() => setReorderDraft({})} onAdd={addToReorder} onRemove={removeFromReorder} />
          </div>
        )}
      </div>
    </div>
  );
}

function SupplyRow({ supply, draftQty, onAdd, onRemove }) {
  const days = supplyDaysLeft(supply);
  const status = supplyStatus(supply);
  const statusStyles = {
    critical: { border: "border-crimson", chipBg: "bg-crimson-soft", chipText: "text-crimson", daysText: "text-crimson" },
    low:      { border: "border-amber",   chipBg: "bg-amber-soft",   chipText: "text-amber",   daysText: "text-amber"   },
    stocked:  { border: "border-line",    chipBg: "bg-jade-soft",    chipText: "text-jade-2",  daysText: "text-jade-2"  },
  }[status];

  return (
    <div className={`bg-surface border ${statusStyles.border} rounded-xl p-3.5 flex items-center gap-4`}>
      <div className={`w-8 h-8 rounded-md shrink-0 ${supply.dot}`} />

      <div className="flex-1 min-w-0">
        <div className="font-medium text-[14px] truncate">{supply.name}</div>
        <div className="text-[11px] text-ink-3 truncate">{supply.spec}</div>
      </div>

      <div className="hidden md:flex items-center gap-6 text-[12px]">
        <div className="text-right">
          <div className="text-[9.5px] uppercase tracking-wider text-ink-3">On hand</div>
          <div className="font-mono font-medium tabular-nums">{supply.onHand}</div>
        </div>
        <div className="text-right">
          <div className="text-[9.5px] uppercase tracking-wider text-ink-3">Per week</div>
          <div className="font-mono text-ink-2 tabular-nums">{supply.weeklyBurn}</div>
        </div>
        <div className="text-right min-w-[44px]">
          <div className="text-[9.5px] uppercase tracking-wider text-ink-3">Days left</div>
          <div className={`font-mono font-semibold tabular-nums ${statusStyles.daysText}`}>{days}</div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className={`text-[9.5px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${statusStyles.chipBg} ${statusStyles.chipText}`}>
          {status}
        </span>
        <div className="text-[10px] text-ink-3 font-mono">{supply.pricing === "free" ? "Free w/ Kura" : supply.pricing}</div>
      </div>

      {draftQty > 0 ? (
        <div className="flex items-center gap-1 shrink-0 border border-line rounded-md">
          <button onClick={onRemove} className="px-2 py-1 text-ink-3 hover:text-ink hover:bg-surface-2 rounded-l-md">−</button>
          <span className="text-[12px] font-mono w-6 text-center">{draftQty}</span>
          <button onClick={onAdd} className="px-2 py-1 text-ink-3 hover:text-ink hover:bg-surface-2 rounded-r-md">+</button>
        </div>
      ) : (
        <button onClick={onAdd} className="text-[11.5px] px-2.5 py-1.5 rounded-md bg-jade text-white hover:opacity-90 inline-flex items-center gap-1 shrink-0">
          <Plus size={11} /> Reorder
        </button>
      )}
    </div>
  );
}

function ReorderCart({ draft, onClear, onAdd, onRemove }) {
  const lines = Object.entries(draft)
    .map(([id, qty]) => ({ supply: SUPPLIES.find(s => s.id === id), qty }))
    .filter(l => l.supply && l.qty > 0);

  const paidTotal = lines.reduce((sum, l) => {
    const m = l.supply.pricing.match(/\$(\d+(?:\.\d+)?)/);
    return sum + (m ? Number(m[1]) * l.qty : 0);
  }, 0);

  return (
    <div className="bg-surface border border-line rounded-xl sticky top-[80px] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line-2">
        <div className="flex items-center gap-2">
          <Package size={14} className="text-jade-2" />
          <h3 className="font-display text-[15px] font-medium">Reorder draft</h3>
          <span className="text-[10.5px] font-mono text-jade-2 bg-jade-soft px-1.5 py-0.5 rounded">{lines.length}</span>
        </div>
        <button onClick={onClear} className="text-[10.5px] text-ink-3 hover:text-ink">Clear</button>
      </div>

      <ul className="px-4 py-3 space-y-2 max-h-[420px] overflow-y-auto">
        {lines.map(({ supply, qty }) => (
          <li key={supply.id} className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded ${supply.dot} shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium truncate">{supply.name}</div>
              <div className="text-[10px] text-ink-3 font-mono">{supply.pricing === "free" ? "Free" : supply.pricing}</div>
            </div>
            <div className="flex items-center gap-1 border border-line rounded-md">
              <button onClick={() => onRemove(supply.id)} className="px-1.5 py-0.5 text-ink-3 hover:text-ink rounded-l-md">−</button>
              <span className="text-[11px] font-mono w-5 text-center">{qty}</span>
              <button onClick={() => onAdd(supply.id)} className="px-1.5 py-0.5 text-ink-3 hover:text-ink rounded-r-md">+</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="px-4 py-3 border-t border-line-2 bg-surface-2/30">
        <div className="flex items-center justify-between text-[11.5px] mb-2">
          <span className="text-ink-3">Free items (tubes, labels)</span>
          <span className="font-mono text-jade-2">included</span>
        </div>
        <div className="flex items-center justify-between text-[12px] mb-3">
          <span className="text-ink-2 font-medium">Paid items</span>
          <span className="font-mono font-medium">${paidTotal.toFixed(2)}</span>
        </div>
        <button className="w-full text-[12px] bg-jade text-white py-2 rounded-md font-medium hover:opacity-90 inline-flex items-center justify-center gap-1.5">
          <Motorbike size={12} /> Confirm reorder · next Mon delivery
        </button>
      </div>
    </div>
  );
}

function CatalogCart({ draft, onRemove, onClear, onOpenPatientChart, onStartVerification }) {
  // Phase machine: cart → patient → review → placed
  const [phase, setPhase] = useState("cart");
  const [chosenPatient, setChosenPatient] = useState(null);
  const [patientQuery, setPatientQuery] = useState("");
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [route, setRoute] = useState("clinic"); // 'clinic' | 'psc'
  const [orderRef, setOrderRef] = useState(null);
  const [tier] = useDoctorTier();
  const canOrder = tier !== "explorer";

  const items = draft.map(code => LAB_CATALOG.find(x => x.code === code)).filter(Boolean);
  const total = items.reduce((sum, t) => sum + (t.price.usd || 0), 0);

  // Patient search — same data + matcher as the OrdersView Step 1
  const filterByQuery = (list) => {
    const q = patientQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.khmer || "").toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  };
  const panelHits = filterByQuery(patients);

  const reset = () => {
    setPhase("cart");
    setChosenPatient(null);
    setPatientQuery("");
    setOrderRef(null);
  };

  /* ─────────────────────────  PHASE: placed  ───────────────────────── */
  if (phase === "placed" && chosenPatient && orderRef) {
    return (
      <div className="bg-surface border border-jade rounded-xl overflow-hidden sticky top-[100px]">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-line-2 bg-jade-soft/60">
          <CheckCircle2 size={16} className="text-jade-2" />
          <h3 className="font-display text-[15px] font-medium text-ink">Order placed</h3>
        </div>
        <div className="px-4 py-3 space-y-3">
          <p className="text-[12px] text-ink-2 leading-relaxed">
            {items.length} test{items.length === 1 ? "" : "s"} for <span className="font-medium">{chosenPatient.name}</span>.
            Booking code + QR sent via SMS + Telegram.
          </p>
          <div className="rounded-md border border-line-2 bg-surface-2/40 p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] uppercase tracking-[0.14em] text-ink-3">Order ref</div>
              <button
                onClick={() => openMobileBooking(orderRef)}
                className="text-[10px] text-jade-2 hover:underline inline-flex items-center gap-1"
                title="Preview as patient (mobile)"
              >
                <ExternalLink size={10} /> Preview on mobile
              </button>
            </div>
            <div className="font-mono text-[13px] text-ink">{orderRef}</div>
          </div>
          <button
            onClick={() => { onOpenPatientChart?.(chosenPatient.id); onClear(); reset(); }}
            className="w-full text-[12px] bg-jade text-white py-2 rounded-md font-medium hover:opacity-90 inline-flex items-center justify-center gap-1.5"
          >
            Open {chosenPatient.name.split(" ")[0]}'s chart <ArrowRight size={12} />
          </button>
          <button onClick={() => { onClear(); reset(); }} className="w-full text-[11.5px] text-ink-3 hover:text-ink py-1">
            Back to catalog
          </button>
        </div>
      </div>
    );
  }

  /* ─────────────────────────  PHASE: patient picker  ───────────────────────── */
  if (phase === "patient") {
    return (
      <div className="bg-surface border border-line rounded-xl overflow-hidden sticky top-[100px]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-line-2 bg-surface-2/30">
          <button onClick={() => setPhase("cart")} className="text-[11px] text-ink-3 hover:text-ink inline-flex items-center gap-1">
            <ArrowLeft size={11} /> Back to cart
          </button>
          <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold">Step 2 · patient</span>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-line-2">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
            <input
              autoFocus
              value={patientQuery}
              onChange={e => setPatientQuery(e.target.value)}
              placeholder="Search name, phone, ID, or Khmer name…"
              className="w-full pl-7 pr-2 py-2 rounded-md border border-line bg-surface text-[12.5px] placeholder:text-ink-3 focus:border-ink focus:outline-none"
            />
          </div>
        </div>

        {/* Add new patient — top, like in the screenshot */}
        <div className="px-4 pt-3">
          <button
            onClick={() => setShowNewPatient(true)}
            className="w-full rounded-md border border-dashed border-line hover:border-jade hover:bg-jade-soft/30 text-[12.5px] text-ink-2 hover:text-jade-2 py-2.5 inline-flex items-center justify-center gap-1.5 transition"
          >
            <Plus size={13} /> Add new patient
          </button>
        </div>

        {/* Hits */}
        <div className="px-4 py-3">
          <div className="text-[9.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-2">
            {patientQuery ? `Results · ${panelHits.length}` : "Recent in your panel"}
          </div>
          {panelHits.length > 0 ? (
            <ul className="space-y-1.5">
              {panelHits.slice(0, 6).map(p => (
                <li key={p.id}>
                  <PatientHitRow
                    p={p}
                    selected={chosenPatient?.id === p.id}
                    onSelect={() => setChosenPatient(p)}
                    provenance="In your panel"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-md border border-dashed border-line p-3 text-center">
              <div className="text-[12px] text-ink-2 mb-1">No match for "{patientQuery}"</div>
              <div className="text-[10.5px] text-ink-3 mb-2 leading-snug">Start a new patient with a phone number — we'll send them a link to fill in the rest.</div>
              <button
                onClick={() => setShowNewPatient(true)}
                className="text-[11.5px] bg-jade text-white px-3 py-1.5 rounded-md font-medium hover:opacity-90 inline-flex items-center gap-1.5"
              >
                <Plus size={11} /> Create patient
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-line-2 bg-surface-2/30">
          <button
            disabled={!chosenPatient}
            onClick={() => setPhase("review")}
            className={`w-full text-[12px] py-2 rounded-md font-medium inline-flex items-center justify-center gap-1.5 transition ${
              chosenPatient ? "bg-jade text-white hover:opacity-90" : "bg-line text-ink-3 cursor-not-allowed"
            }`}
          >
            {chosenPatient ? <>Next · review order <ArrowRight size={12} /></> : "Pick a patient to continue"}
          </button>
        </div>

        {showNewPatient && (
          <NewPatientModal
            onClose={() => setShowNewPatient(false)}
            onConfirmPatient={(kid, name) => {
              setChosenPatient({ name: name || "Patient", id: kid, age: "—", sex: "—", khmer: "—", lastSeen: "just now" });
              setShowNewPatient(false);
            }}
          />
        )}
      </div>
    );
  }

  /* ─────────────────────────  PHASE: review  ───────────────────────── */
  if (phase === "review" && chosenPatient) {
    const placeOrder = () => {
      const ref = `KO-${chosenPatient.id.split("-")[1] ?? "0000"}-${Math.floor(Math.random() * 9000 + 1000)}`;
      setOrderRef(ref);
      setPhase("placed");
    };
    return (
      <div className="bg-surface border border-line rounded-xl overflow-hidden sticky top-[100px]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-line-2 bg-surface-2/30">
          <button onClick={() => setPhase("patient")} className="text-[11px] text-ink-3 hover:text-ink inline-flex items-center gap-1">
            <ArrowLeft size={11} /> Back
          </button>
          <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold">Step 3 · review</span>
        </div>

        {/* Patient summary */}
        <div className="px-4 py-3 border-b border-line-2">
          <div className="text-[9.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-1.5">For</div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-jade-soft text-jade flex items-center justify-center text-[11px] font-medium">
              {chosenPatient.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] font-medium truncate">{chosenPatient.name}</div>
              <div className="text-[10.5px] text-ink-3 truncate">
                {chosenPatient.khmer && chosenPatient.khmer !== "—" ? `${chosenPatient.khmer} · ` : ""}
                <span className="font-mono">{chosenPatient.id}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openEntityInNewTab("patient", { id: chosenPatient.id, name: chosenPatient.name })}
                className="text-[10.5px] text-jade-2 hover:underline inline-flex items-center gap-1"
                title="Open this patient's chart in a new tab"
              >
                <ExternalLink size={10} /> Chart
              </button>
              <button onClick={() => setPhase("patient")} className="text-[10.5px] text-ink-3 hover:text-ink">Change</button>
            </div>
          </div>
        </div>

        {/* Tests */}
        <div className="px-4 py-3 border-b border-line-2 space-y-1.5">
          <div className="text-[9.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-1">In this order</div>
          {items.map(t => (
            <div key={t.code} className="flex items-center justify-between text-[12px]">
              <span className="text-ink-2 truncate">{t.name}</span>
              <span className="font-mono text-ink-3 shrink-0 ml-2">${t.price.usd.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Route */}
        <div className="px-4 py-3 border-b border-line-2">
          <div className="text-[9.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-1.5">Route</div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setRoute("clinic")}
              className={`text-left px-2.5 py-2 rounded-md border transition ${route === "clinic" ? "border-jade-2 bg-jade-soft" : "border-line hover:border-ink"}`}
            >
              <div className={`flex items-center gap-1.5 text-[11.5px] font-medium ${route === "clinic" ? "text-jade-2" : "text-ink"}`}>
                <RouteIcon left={<Motorbike size={12} />} right={<TestTubes size={12} />} />
                Draw in clinic
              </div>
              <div className="text-[10px] text-ink-3 mt-0.5 leading-snug">You draw · Kura shipper picks up sample</div>
            </button>
            <button
              onClick={() => setRoute("psc")}
              className={`text-left px-2.5 py-2 rounded-md border transition ${route === "psc" ? "border-jade-2 bg-jade-soft" : "border-line hover:border-ink"}`}
            >
              <div className={`flex items-center gap-1.5 text-[11.5px] font-medium ${route === "psc" ? "text-jade-2" : "text-ink"}`}>
                <RouteIcon left={<PersonStanding size={13} />} right={<FileText size={11} />} />
                Send to PSC
              </div>
              <div className="text-[10px] text-ink-3 mt-0.5 leading-snug">Slip + QR sent to patient phone</div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-surface-2/30">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-[11px] text-ink-3">{items.length} test{items.length === 1 ? "" : "s"} · {route === "clinic" ? "In-clinic draw" : "PSC pickup"}</span>
            <span className="font-mono text-[14px] font-semibold">${total.toFixed(2)}</span>
          </div>
          <button onClick={placeOrder} className="w-full text-[12px] py-2 rounded-md bg-jade text-white font-medium hover:opacity-90 inline-flex items-center justify-center gap-1.5">
            <FlaskConical size={12} /> Place order
          </button>
        </div>
      </div>
    );
  }

  /* ─────────────────────────  PHASE: cart  ───────────────────────── */
  return (
    <div className="bg-surface border border-line rounded-xl overflow-hidden sticky top-[72px] max-h-[calc(100vh-88px)] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line-2">
        <div className="flex items-center gap-2">
          <ShoppingCart size={14} className="text-jade-2" />
          <h3 className="font-display text-[15px] font-medium">Cart</h3>
          <span className="text-[10.5px] font-mono text-jade-2 bg-jade-soft px-1.5 py-0.5 rounded">{items.length}</span>
        </div>
        <button onClick={onClear} className="text-[10.5px] text-ink-3 hover:text-ink underline-offset-2 hover:underline">Clear</button>
      </div>

      <ul className="flex-1 min-h-0 overflow-y-auto">
        {items.map(t => (
          <li key={t.code} className="px-4 py-2.5 border-b border-line-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[12.5px] font-medium text-ink truncate">{t.name}</div>
              <div className="text-[10px] text-ink-3 font-mono">{t.code}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono text-[11.5px] text-ink-2">${t.price.usd.toFixed(2)}</div>
              <button onClick={() => onRemove(t.code)} className="text-[10px] text-ink-3 hover:text-crimson mt-0.5">
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="px-4 py-3 border-t border-line-2 bg-surface-2/30">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[11px] text-ink-3">{items.length} test{items.length === 1 ? "" : "s"}</span>
          <span className="font-mono text-[14px] font-semibold">${total.toFixed(2)}</span>
        </div>
        {canOrder ? (
          <button onClick={() => setPhase("patient")} className="w-full text-[12px] py-2 rounded-md bg-jade text-white font-medium hover:opacity-90 inline-flex items-center justify-center gap-1.5">
            Continue · find patient <ArrowRight size={12} />
          </button>
        ) : (
          <>
            <button
              disabled
              title="Verify your MoH license to place orders"
              className="w-full text-[12px] py-2 rounded-md bg-line text-ink-3 font-medium inline-flex items-center justify-center gap-1.5 cursor-not-allowed"
            >
              <Lock size={11} /> Continue · find patient
            </button>
            <div className="mt-2 rounded-md border border-amber bg-amber-soft/60 px-2.5 py-2 text-[10.5px] text-ink-2 leading-snug">
              <span className="font-semibold text-amber inline-flex items-center gap-1"><ShieldCheck size={10} /> Explorer mode.</span>{" "}
              Browse all you want — but we need your MoH license on file before we can run real orders. <button onClick={onStartVerification} className="text-jade-2 font-medium hover:underline">Verify license →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   TELEHEALTH VIEW
   ============================================================ */
function TelehealthView() {
  return (
    <div className="px-8 py-6 max-w-[1100px] mx-auto">
      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-3">Telehealth</div>
      <div className="flex items-center gap-3 mb-1">
        <h1 className="font-display text-[30px] font-medium leading-none text-ink-2">Telehealth</h1>
        <PreviewLock />
      </div>
      <p className="text-[12.5px] text-ink-3 mb-6">
        A massive feature spanning availability, booking, video, and voice notes. Treated as its own bet — shipping after the core EMR is solid.
      </p>

      <PreviewBlur>
      {/* Big coming-soon hero */}
      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        <div className="relative px-8 py-12 bg-gradient-to-br from-jade-soft to-surface-2">
          <div className="flex items-start gap-5 max-w-2xl">
            <div className="w-14 h-14 rounded-xl bg-jade text-white flex items-center justify-center shrink-0">
              <Video size={26} />
            </div>
            <div className="flex-1">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-semibold text-plum bg-line-2 px-2 py-1 rounded mb-3">
                <Clock size={10} /> Coming soon · Phase 1 build
              </span>
              <h2 className="font-display text-[26px] font-medium leading-tight mb-2">
                Telehealth is coming as a complete bundle
              </h2>
              <p className="text-[13.5px] text-ink-2 leading-relaxed">
                Availability calendar, patient self-serve booking from your directory profile, reception
                on-behalf booking, video conduit, and voice notes — four subsystems behind one nav item.
                We're building the calendar &amp; booking primitives first; video and voice notes go production-grade
                in Phase 3.
              </p>
            </div>
          </div>
        </div>

        {/* Four subsystems */}
        <div className="grid grid-cols-2 divide-x divide-line-2 border-t border-line-2">
          <ComingSoonSubsystem
            icon={<Calendar size={15} />}
            phase="Phase 1"
            tone="jade"
            title="Availability calendar"
            blurb="Bookable windows, one-off blocks, recurring exceptions. Shared primitive — feeds patient self-serve booking from your directory profile."
          />
          <ComingSoonSubsystem
            icon={<Send size={15} />}
            phase="Phase 1"
            tone="jade"
            title="Patient self-serve booking"
            blurb="Patient finds you on Kura's directory, picks a slot, books. Booking lands on your calendar. Reception on-behalf booking uses the same flow."
          />
          <ComingSoonSubsystem
            icon={<Video size={15} />}
            phase="Phase 3"
            tone="plum"
            title="Video conduit"
            blurb="The actual video call. Vendor evaluation pending — production-grade integration in Phase 3, after core EMR adoption."
          />
          <ComingSoonSubsystem
            icon={<Sparkles size={15} />}
            phase="Phase 3"
            tone="plum"
            title="Voice notes (speech-to-text)"
            blurb="Live transcription during sessions, auto-drafted SOAP notes, doctor signs. Same Phase 3 timeline as video."
          />
        </div>
      </div>

      {/* What works today */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="bg-surface border border-line rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-jade font-semibold mb-2">
            <CheckCircle2 size={11} /> While you wait
          </div>
          <h3 className="font-display text-[15px] font-medium mb-2">What works today</h3>
          <ul className="text-[12px] text-ink-2 space-y-1.5">
            <li className="flex gap-1.5"><CheckCircle2 size={11} className="text-jade-2 shrink-0 mt-0.5" /> <span>Schedule a follow-up from any patient chart (Action ribbon · Schedule)</span></li>
            <li className="flex gap-1.5"><CheckCircle2 size={11} className="text-jade-2 shrink-0 mt-0.5" /> <span>Order labs in patient context (no telehealth needed)</span></li>
            <li className="flex gap-1.5"><CheckCircle2 size={11} className="text-jade-2 shrink-0 mt-0.5" /> <span>Send patient a Telegram message (right-rail action on patient header)</span></li>
            <li className="flex gap-1.5"><CheckCircle2 size={11} className="text-jade-2 shrink-0 mt-0.5" /> <span>Phone consultations — bill via the standard cabinet visit flow</span></li>
          </ul>
        </div>

        <div className="bg-surface border border-line rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-amber font-semibold mb-2">
            <Bell size={11} /> Get notified
          </div>
          <h3 className="font-display text-[15px] font-medium mb-2">Want to be a launch partner?</h3>
          <p className="text-[12px] text-ink-2 leading-relaxed mb-3">
            We're picking 5–10 partner cabinets to pilot the calendar &amp; booking primitives once they're ready.
            Pilot doctors get early access, direct line to the build team, and influence on the spec.
          </p>
          <button className="inline-flex items-center gap-1.5 text-[12px] bg-jade text-white px-3 py-1.5 rounded-md font-medium hover:opacity-90">
            <Mail size={11} /> Tell me when it's ready
          </button>
        </div>
      </div>
      </PreviewBlur>
    </div>
  );
}

function ComingSoonSubsystem({ icon, phase, tone, title, blurb }) {
  const toneMap = {
    jade: "text-jade bg-jade-soft",
    plum: "text-plum bg-line-2",
  };
  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-7 h-7 rounded-md flex items-center justify-center ${toneMap[tone]}`}>{icon}</span>
        <span className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${toneMap[tone]}`}>{phase}</span>
      </div>
      <h4 className="font-display text-[15px] font-medium mb-1">{title}</h4>
      <p className="text-[11.5px] text-ink-3 leading-relaxed">{blurb}</p>
    </div>
  );
}

function TelehealthToday() {
  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-8 space-y-3">
        <SessionCard
          time="11:30 — 12:00" patient="Sokha Chann" reason="HbA1c review · trending up"
          status="next" tags={["T2DM", "review medication"]} bookedBy="self-serve"
        />
        <SessionCard
          time="14:00 — 14:30" patient="Kosal Ros" reason="Routine annual"
          status="upcoming" tags={["annual"]} bookedBy="self-serve"
        />
        <SessionCard
          time="15:30 — 15:45" patient="Bopha Yim" reason="Result interpretation · TSH borderline"
          status="upcoming" tags={["thyroid", "follow-up"]} bookedBy="reception"
        />
        <SessionCard
          time="16:30 — 17:00" patient="Phally Sin" reason="New patient consult — bridged via your QR"
          status="upcoming" tags={["new patient"]} bookedBy="self-serve"
        />
      </div>
      <div className="col-span-4 space-y-4">
        <div className="bg-surface border border-line rounded-xl p-4">
          <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-3">This week</div>
          <div className="flex items-baseline gap-2">
            <div className="font-display text-[44px] font-medium leading-none tnum">14</div>
            <div className="text-[12px] text-ink-3">teleconsults</div>
          </div>
          <div className="text-[11.5px] text-jade-2 mt-1">+ 3 vs last week</div>
          <div className="hairline my-4" />
          <div className="space-y-2 text-[11.5px]">
            <div className="flex justify-between"><span className="text-ink-3">Avg duration</span><span className="font-mono">22 min</span></div>
            <div className="flex justify-between"><span className="text-ink-3">Self-serve from directory</span><span className="font-mono">9 / 14</span></div>
            <div className="flex justify-between"><span className="text-ink-3">Reception-on-behalf</span><span className="font-mono">5 / 14</span></div>
            <div className="flex justify-between"><span className="text-ink-3">Insurance billable</span><span className="font-mono">11 / 14</span></div>
          </div>
        </div>
        <div className="bg-surface border border-line rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={13} className="text-jade-2" />
            <h3 className="text-[13px] font-medium">Voice notes on</h3>
            <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold text-amber bg-amber-soft px-1.5 py-0.5 rounded">
              Phase 3
            </span>
          </div>
          <p className="text-[11.5px] text-ink-2 leading-snug">
            Khmer + English speech-to-text drafts a structured note. You review and sign before it lands in the patient's chart. Production-grade integration ships in Phase 3.
          </p>
        </div>
      </div>
    </div>
  );
}

/* Availability calendar — v1 surface per architecture spec §3 ("Telehealth booking model").
   Doctor publishes bookable windows; patient self-serve from directory + reception on-behalf
   both flow against this calendar. */
function TelehealthCalendar() {
  // Demo: a typical week with mixed availability, blocks, exceptions.
  const days = [
    { day: "Mon", date: "11", windows: [{ start: "09:00", end: "12:00", booked: 4 }, { start: "14:00", end: "17:00", booked: 6 }] },
    { day: "Tue", date: "12", windows: [{ start: "09:00", end: "12:00", booked: 3 }], block: "No Tuesday afternoons (recurring)" },
    { day: "Wed", date: "13", windows: [{ start: "09:00", end: "12:00", booked: 5 }, { start: "14:00", end: "17:00", booked: 5 }] },
    { day: "Thu", date: "14", windows: [{ start: "09:00", end: "12:00", booked: 2 }, { start: "14:00", end: "17:00", booked: 1 }] },
    { day: "Fri", date: "15", windows: [{ start: "09:00", end: "12:00", booked: 4 }, { start: "14:00", end: "17:00", booked: 3 }] },
    { day: "Sat", date: "16", windows: [], block: "Off (one-off — helping family)" },
    { day: "Sun", date: "17", windows: [], block: "Closed" },
  ];

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-8">
        {/* Week nav */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-md hover:bg-surface-2 border border-line"><ChevronLeft size={14} /></button>
            <div className="text-[14px] font-medium">11–17 May 2026</div>
            <button className="p-1.5 rounded-md hover:bg-surface-2 border border-line"><ChevronRight size={14} /></button>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-[11.5px] text-ink-2 border border-line rounded-md px-2.5 py-1.5 hover:border-ink inline-flex items-center gap-1">
              <Plus size={11} /> Add one-off block
            </button>
            <button className="text-[11.5px] bg-jade text-white rounded-md px-3 py-1.5 hover:opacity-90 inline-flex items-center gap-1.5 font-medium">
              Edit recurring hours
            </button>
          </div>
        </div>

        {/* Week strip */}
        <div className="bg-surface border border-line rounded-xl overflow-hidden">
          <div className="grid grid-cols-7">
            {days.map((d, i) => (
              <div key={i} className={`border-r last:border-r-0 border-line-2 p-3 ${
                d.block ? "bg-surface-2" : ""
              }`}>
                <div className="flex items-baseline gap-1 mb-2">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-ink-3">{d.day}</div>
                  <div className="font-display text-[18px] font-medium tnum">{d.date}</div>
                </div>

                {d.windows.length > 0 ? (
                  <div className="space-y-1">
                    {d.windows.map((w, wi) => (
                      <div key={wi} className="bg-jade-soft border border-jade rounded-md p-1.5">
                        <div className="text-[10.5px] font-mono text-jade font-medium">{w.start}–{w.end}</div>
                        <div className="text-[10px] text-ink-3">{w.booked} booked</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10.5px] text-ink-3 italic">—</div>
                )}

                {d.block && (
                  <div className="mt-2 text-[10px] text-terracotta bg-terracotta-soft border border-terracotta rounded-md px-1.5 py-1 leading-snug">
                    {d.block}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Open question call-out per spec */}
        <div className="mt-4 bg-surface border border-line rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-amber-soft text-amber flex items-center justify-center shrink-0">
              <AlertTriangle size={13} />
            </div>
            <div className="flex-1">
              <div className="text-[12.5px] font-medium mb-0.5">Patient self-reschedule policy</div>
              <p className="text-[11px] text-ink-2 leading-snug">
                Recommended: patients can self-reschedule up to <span className="font-medium">4 hours before the slot</span>. Later changes require contacting the cabinet. Reduces no-shows without putting your calendar at the patient's mercy.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button className="text-[11px] text-jade-2 hover:underline font-medium">Apply default</button>
                <button className="text-[11px] text-ink-3 hover:text-ink">Customize policy</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-4 space-y-4">
        <div className="bg-surface border border-line rounded-xl p-4">
          <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-2">Booking sources this week</div>
          <div className="space-y-3">
            <SourceBar label="Patient self-serve (directory)" value={9} total={14} tone="jade" hint="The flywheel — keep growing" />
            <SourceBar label="Reception on-behalf" value={5} total={14} tone="ink" hint="Mealea booked these by phone" />
          </div>
          <div className="hairline my-3" />
          <p className="text-[11px] text-ink-2 leading-snug">
            Both flows respect the same availability calendar. Self-serve is bet-the-flywheel for new directory traffic; on-behalf is the safety net for older patients who won't self-serve.
          </p>
        </div>

        <div className="bg-surface border border-line rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={13} className="text-jade-2" />
            <h3 className="text-[13px] font-medium">Live on directory</h3>
          </div>
          <p className="text-[11.5px] text-ink-2 leading-snug mb-3">
            Your published windows are visible at:
          </p>
          <div className="font-mono text-[10.5px] bg-surface-2 border border-line rounded p-2 text-ink-2 break-all">
            kura.med/doctors/sopheak-chann
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionCard({ time, patient, reason, status, tags }) {
  return (
    <div className={`bg-surface border rounded-xl p-4 flex items-center gap-4 ${
      status === "next" ? "border-jade" : "border-line"
    }`}>
      <div className="w-1 self-stretch rounded-full" style={{ background: status === "next" ? "var(--jade)" : "var(--line)" }} />
      <div className="font-mono text-[12px] text-ink-2 w-32 shrink-0">{time}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-[14px] font-medium">{patient}</h3>
          {status === "next" && (
            <span className="text-[9.5px] uppercase tracking-wide font-semibold text-jade bg-jade-soft px-1.5 py-0.5 rounded">Up next</span>
          )}
        </div>
        <p className="text-[11.5px] text-ink-2 mt-0.5">{reason}</p>
        <div className="flex gap-1 mt-1.5">
          {tags.map(t => (
            <span key={t} className="text-[9.5px] uppercase tracking-wide text-ink-3 border border-line rounded px-1 py-px">
              {t}
            </span>
          ))}
        </div>
      </div>
      <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium ${
        status === "next" ? "bg-jade text-white" : "border border-line text-ink-2 hover:border-ink"
      }`}>
        <Video size={12} /> {status === "next" ? "Join" : "Open"}
      </button>
    </div>
  );
}

/* ============================================================
   CARE PLANS VIEW (coming-soon)
   - Per-patient longitudinal monitoring + reusable visit templates.
   - The test library (favorites + bundles) lives on the Lab catalog
     page instead, since both are test-level concepts and the catalog
     is the natural authoring surface for them.
   ============================================================ */
function CarePlansView() {
  return (
    <SoonScaffold
      eyebrow="Care plans"
      title="Templates compound your time"
      lede="Author care plans for individual patients (monitoring goals, lab cadence, prescription routine, recall windows) and reusable visit templates. We're building this surface next — here's what's coming."
      cards={[
        { icon: <ClipboardList size={14} />, tone: "jade",       title: "Patient-level care plans",
          body: "Set monitoring goals, lab cadence, prescription routine, and recall windows per patient. The Today strip surfaces who's off-track." },
        { icon: <Sparkles size={14} />,     tone: "terracotta", title: "Reusable visit templates",
          body: 'Author once for "T2DM follow-up at 90 days" or "HTN baseline + 12w follow-up." Apply across all matching patients in one click.' },
        { icon: <Pill size={14} />,         tone: "plum",       title: "Prescriptions → medicine delivery",
          body: "Care plan items can include prescriptions that route to Kura's medicine-delivery network (Phase 4). Refills auto-trigger on cadence." },
      ]}
      ctaTitle="Want this sooner?"
      ctaSub="We're prioritizing Care plans for the next sprint. Tell us which template you'd build first — it shapes our default library."
      ctaPrimary="Suggest a template"
    >
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-7">
          <h2 className="font-display text-[18px] font-medium mb-3">Active plans</h2>
          <div className="space-y-2">
            <PlanRow patient="Sokha Chann" template="T2DM follow-up · quarterly" status="On track"      cycle="Q1·26" tone="jade" />
            <PlanRow patient="Vibol Heng"  template="HTN + T2DM · quarterly"     status="Overdue · 4w"  cycle="Q4·25" tone="amber" />
            <PlanRow patient="Bora Pich"   template="Lipid management · 12w"     status="Up-titrating"  cycle="Q1·26" tone="terracotta" />
            <PlanRow patient="Sreypov Lim" template="Annual screen · 12m"        status="Scheduled"     cycle="Q2·27" tone="ink" />
          </div>
        </div>
        <div className="col-span-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-[18px] font-medium">Your templates</h2>
            <span className="text-[11.5px] text-ink-3 inline-flex items-center gap-1">
              <Plus size={11} /> New template
            </span>
          </div>
          <div className="space-y-2">
            <TemplateRow name="T2DM follow-up · quarterly" patients={42} items="Lab + 2 Rx + Tele" />
            <TemplateRow name="HTN baseline + 12w follow-up" patients={28} items="Lab + Rx + Tele" />
            <TemplateRow name="Lipid management · 12w cadence" patients={19} items="Lab + Rx escalation" />
            <TemplateRow name="Annual healthy adult screen" patients={61} items="Lab panel + Tele" />
          </div>
        </div>
      </div>
    </SoonScaffold>
  );
}

/* ============================================================
   DOCTOR TEST LIBRARY — favorites + bundles
   Lives on the Lab catalog page (LabCatalogView). Authoring happens
   inline (star a row to favorite) and via CatalogPicker (multi-select
   when building bundles). Default seed data ships pre-populated so a
   fresh doctor sees what the library is for.
   ============================================================ */
const DEFAULT_FAVORITES = [];
const DEFAULT_BUNDLES = [];

function FavoritesCard({ favorites, onRemove, onAdd }) {
  return (
    <div className="bg-surface border border-line rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line-2">
        <div className="flex items-center gap-2">
          <Star size={13} className="text-amber" />
          <h3 className="font-display text-[14px] font-medium">Favorites</h3>
          <span className="text-[10.5px] text-ink-3 font-mono">{favorites.length}</span>
        </div>
        <button
          onClick={onAdd}
          className="text-[11px] text-jade-2 font-medium hover:underline inline-flex items-center gap-1"
        >
          <Plus size={11} /> Add
        </button>
      </div>
      <div className="px-4 py-2 text-[10.5px] text-ink-3 border-b border-line-2 bg-surface-2/30">
        One-tap tests pinned to the top of Quick order on every patient.
      </div>
      {favorites.length === 0 ? (
        <div className="px-4 py-8 text-center text-[12px] text-ink-3">
          No favorites yet. Add the tests you reach for most.
        </div>
      ) : (
        <ul className="divide-y divide-line-2">
          {favorites.map(code => {
            const t = LAB_CATALOG.find(x => x.code === code);
            if (!t) return null;
            return (
              <li key={code} className="px-3 py-2.5 flex items-center gap-2 group hover:bg-surface-2/40 transition">
                <Star size={12} className="text-amber shrink-0" style={{ fill: "currentColor" }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] text-ink leading-tight truncate">{t.name}</div>
                  <div className="text-[10.5px] text-ink-3 leading-tight">{t.category}</div>
                </div>
                <span className="font-mono text-[11px] text-ink-3 shrink-0">${t.price.usd}</span>
                <button
                  onClick={() => onRemove(code)}
                  title="Remove from favorites"
                  className="text-ink-3 hover:text-crimson p-0.5 opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={11} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function BundlesCard({ bundles, onEdit, onDelete, onNew }) {
  return (
    <div className="bg-surface border border-line rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line-2">
        <div className="flex items-center gap-2">
          <Package size={13} className="text-jade-2" />
          <h3 className="font-display text-[14px] font-medium">Bundles</h3>
          <span className="text-[10.5px] text-ink-3 font-mono">{bundles.length}</span>
        </div>
        <button
          onClick={onNew}
          className="text-[11px] text-jade-2 font-medium hover:underline inline-flex items-center gap-1"
        >
          <Plus size={11} /> New bundle
        </button>
      </div>
      <div className="px-4 py-2 text-[10.5px] text-ink-3 border-b border-line-2 bg-surface-2/30">
        Named test sets you reuse. Apply with one tap from Quick order.
      </div>
      {bundles.length === 0 ? (
        <div className="px-4 py-8 text-center text-[12px] text-ink-3">
          No bundles yet. Group recurring test sets for one-tap ordering.
        </div>
      ) : (
        <ul className="divide-y divide-line-2">
          {bundles.map(bundle => {
            const tests = bundle.codes
              .map(c => LAB_CATALOG.find(t => t.code === c))
              .filter(Boolean);
            const total = tests.reduce((s, t) => s + t.price.usd, 0);
            return (
              <li key={bundle.id} className="px-3 py-2.5 hover:bg-surface-2/40 transition group">
                <div className="flex items-center gap-2 mb-1">
                  <Package size={11} className="text-jade-2 shrink-0" />
                  <span className="text-[12.5px] font-medium text-ink truncate flex-1">{bundle.name}</span>
                  <span className="text-[10.5px] text-ink-3 font-mono shrink-0">{tests.length} tests · ${total}</span>
                  <button onClick={() => onEdit(bundle)} title="Edit bundle"
                    className="text-ink-3 hover:text-ink p-0.5 opacity-0 group-hover:opacity-100 transition">
                    <Pencil size={11} />
                  </button>
                  <button onClick={() => onDelete(bundle.id)} title="Delete bundle"
                    className="text-ink-3 hover:text-crimson p-0.5 opacity-0 group-hover:opacity-100 transition">
                    <X size={11} />
                  </button>
                </div>
                <div className="text-[10.5px] text-ink-3 truncate pl-[18px]">
                  {tests.map(t => t.name).join(" · ")}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function CatalogPicker({ mode, initialBundle, existingFavorites, onSelectFavorite, onSaveBundle, onClose }) {
  const [search, setSearch] = useState("");
  const [name, setName] = useState(initialBundle?.name || "");
  const [selected, setSelected] = useState(() => new Set(initialBundle?.codes || []));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return LAB_CATALOG;
    return LAB_CATALOG.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  }, [search]);

  const byCategory = useMemo(() => {
    const map = {};
    filtered.forEach(t => {
      if (!map[t.category]) map[t.category] = [];
      map[t.category].push(t);
    });
    return map;
  }, [filtered]);

  const toggleTest = (code) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const handleSave = () => {
    onSaveBundle({
      id: initialBundle?.id,
      name: name.trim() || "Untitled bundle",
      codes: [...selected],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-surface rounded-xl shadow-2xl max-w-2xl w-full max-h-[82vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line-2">
          <div>
            <h3 className="font-display text-[18px] font-medium leading-tight">
              {mode === "favorite" ? "Add to favorites" : initialBundle ? "Edit bundle" : "New bundle"}
            </h3>
            <p className="text-[11.5px] text-ink-3 mt-0.5">
              {mode === "favorite"
                ? "Pick a single test from the full lab catalog."
                : "Name it and pick tests you order together."}
            </p>
          </div>
          <button onClick={onClose} className="text-ink-3 hover:text-ink p-1 -m-1"><X size={16} /></button>
        </div>

        {mode === "bundle" && (
          <div className="px-5 py-3 border-b border-line-2 bg-surface-2/30">
            <label className="block text-[10px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1">Bundle name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. T2DM quarterly"
              autoFocus
              className="w-full text-[15px] font-medium bg-transparent outline-none border-b border-line focus:border-ink py-1 placeholder:text-ink-3 placeholder:font-normal"
            />
          </div>
        )}

        <div className="px-5 py-3 border-b border-line-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by test name, code, or category…"
              autoFocus={mode === "favorite"}
              className="w-full pl-8 pr-2 py-2 rounded-md border border-line bg-surface text-[12.5px] focus:border-ink outline-none placeholder:text-ink-3"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-subtle">
          {filtered.length === 0 ? (
            <div className="px-3 py-10 text-center text-[12px] text-ink-3">
              No tests match &ldquo;{search}&rdquo;.
            </div>
          ) : (
            Object.entries(byCategory).map(([cat, tests]) => (
              <div key={cat} className="mb-2">
                <div className="px-3 py-1 text-[9.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold">{cat}</div>
                {tests.map(t => {
                  const isSelected = selected.has(t.code);
                  const alreadyFav = mode === "favorite" && existingFavorites.includes(t.code);
                  return (
                    <button
                      key={t.code}
                      onClick={() => {
                        if (mode === "favorite") {
                          if (!alreadyFav) onSelectFavorite(t.code);
                        } else {
                          toggleTest(t.code);
                        }
                      }}
                      disabled={alreadyFav}
                      className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2.5 transition ${
                        alreadyFav ? "opacity-50 cursor-not-allowed" :
                        isSelected ? "bg-jade-soft/50 hover:bg-jade-soft/60" :
                                     "hover:bg-surface-2/50"
                      }`}
                    >
                      <span className="font-mono text-[10px] text-plum bg-line-2 px-1.5 py-0.5 rounded shrink-0">{t.code}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] text-ink truncate">{t.name}</div>
                        <div className="text-[10.5px] text-ink-3 truncate">${t.price.usd} · TAT {t.tat}</div>
                      </div>
                      {alreadyFav && <Star size={12} className="text-amber shrink-0" style={{ fill: "currentColor" }} />}
                      {isSelected && mode === "bundle" && <CheckCircle2 size={14} className="text-jade-2 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {mode === "bundle" && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-line-2 bg-surface-2/30">
            <div className="text-[12px] text-ink-3">
              <span className="font-mono text-ink-2">{selected.size}</span> test{selected.size === 1 ? "" : "s"} selected
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="text-[12.5px] text-ink-3 hover:text-ink px-3 py-1.5 rounded-md">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={selected.size === 0 || !name.trim()}
                className="text-[12.5px] bg-jade text-white px-4 py-1.5 rounded-md font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {initialBundle ? "Save changes" : "Create bundle"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Small inline chip used on coming-soon preview pages — signals that the UI
   below is a visual proto with no real backend behind it. */
function PreviewLock() {
  return (
    <span
      title="Preview not wired up"
      className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-3 bg-line-2 border border-line rounded-md px-2 py-1"
    >
      <Lock size={10} /> Preview not wired up
    </span>
  );
}

/* Full-content blur overlay used on every coming-soon page. Renders children
   slightly dimmed + blurred with a centered "Preview — not yet wired up" chip,
   and disables pointer events so nothing reacts to clicks. */
function PreviewBlur({ children, label = "Preview — not yet wired up" }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-bg/40 backdrop-blur-[1px] z-10 rounded-xl pointer-events-none flex items-start justify-center pt-24">
        <div className="bg-surface border border-line rounded-lg px-4 py-2.5 shadow-sm flex items-center gap-2 sticky top-24">
          <Lock size={13} className="text-ink-3" />
          <span className="text-[12px] text-ink-2">{label}</span>
        </div>
      </div>
      <div className="opacity-60 pointer-events-none select-none">
        {children}
      </div>
    </div>
  );
}

function SoonScaffold({ eyebrow, title, lede, cards, previewTitle, ctaTitle, ctaSub, ctaPrimary, children }) {
  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto">
      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-3">{eyebrow}</div>
      <h1 className="font-display text-[30px] font-medium leading-none mb-1 flex items-center gap-3 flex-wrap">
        {title}
        <span className="text-[11px] uppercase tracking-[0.16em] text-amber bg-amber-soft px-2 py-0.5 rounded font-semibold">
          Coming soon
        </span>
      </h1>
      <p className="text-[12.5px] text-ink-3 mb-6 max-w-2xl">{lede}</p>

      {cards && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {cards.map(c => <FeaturePreview key={c.title} {...c} />)}
        </div>
      )}

      {children && (
        <div className="mb-6">
          <PreviewBlur label={previewTitle}>{children}</PreviewBlur>
        </div>
      )}

      <div className="flex items-center justify-between bg-surface border border-line rounded-xl p-4">
        <div>
          <div className="font-display text-[15px] font-medium">{ctaTitle}</div>
          <p className="text-[11.5px] text-ink-3 mt-0.5">{ctaSub}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-[12px] text-ink-3 hover:text-ink px-3 py-2 rounded-lg border border-line hover:border-ink">
            Notify me
          </button>
          <button className="inline-flex items-center gap-1.5 bg-jade text-white rounded-lg px-3.5 py-2 text-[12.5px] font-medium hover:opacity-90">
            {ctaPrimary} <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FeaturePreview({ icon, tone, title, body }) {
  const toneMap = {
    jade: "bg-jade-soft text-jade",
    terracotta: "bg-terracotta-soft text-terracotta",
    plum: "bg-line-2 text-plum",
  };
  return (
    <div className="bg-surface border border-line rounded-xl p-4">
      <div className={`w-7 h-7 rounded-md flex items-center justify-center mb-2.5 ${toneMap[tone]}`}>
        {icon}
      </div>
      <div className="text-[14px] font-semibold mb-1">{title}</div>
      <p className="text-[11.5px] text-ink-2 leading-snug">{body}</p>
    </div>
  );
}

function PlanRow({ patient, template, status, cycle, tone }) {
  const map = {
    jade: "text-jade-2 bg-jade-soft",
    amber: "text-amber bg-amber-soft",
    terracotta: "text-terracotta bg-terracotta-soft",
    ink: "text-ink-3 bg-line-2",
  };
  return (
    <div className="bg-surface border border-line rounded-lg px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium">{patient}</div>
        <div className="text-[11px] text-ink-3">{template}</div>
      </div>
      <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded ${map[tone]}`}>{status}</span>
      <span className="font-mono text-[11px] text-ink-3 w-12 text-right">{cycle}</span>
      <ChevronRight size={14} className="text-ink-3" />
    </div>
  );
}

function PharmaCallsView() {
  return (
    <SoonScaffold
      eyebrow="Pharma calls"
      title="Get paid for your time"
      lede="Pharma reps used to drop in unannounced — your time uncompensated, their reach untraceable. With Kura, calls are scheduled on your calendar, paid through Kura, and measured by anonymized prescribing patterns. You decide who gets your attention."
      cards={[
        { icon: <Calendar size={14} />,  tone: "jade",       title: "Scheduled, not surprised",
          body: "Pharma books 15–30 minute slots on your Kura calendar. Accept, decline, or counter-propose. No walk-ins, no waiting-room drop-bys." },
        { icon: <Banknote size={14} />,  tone: "terracotta", title: "Paid for your time",
          body: "Kura collects $60–$120 per call from the pharma partner and pays you directly via your verified bank account. Time on the call is logged, audited, and taxable." },
        { icon: <Activity size={14} />,  tone: "plum",       title: "Patterns, not pressure",
          body: "After a call, the pharma partner sees anonymized aggregate prescribing trends for the drug discussed. Never patient PII, never per-doctor pressure — and you can opt-out." },
      ]}
      ctaTitle="Want this sooner?"
      ctaSub="We're scoping the doctor-side calendar, payout flow, and pharma analytics surface for Phase 3. Tell us which pharma partner you'd accept a call from first — it shapes our launch list."
      ctaPrimary="Suggest a partner"
    >
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-7">
          <h2 className="font-display text-[18px] font-medium mb-3">Pending requests</h2>
          <div className="space-y-2">
            <PharmaCallRow rep="Roche"     drug="Trastuzumab launch · oncology Q&A" duration="30 min" pay="$80"  status="Pending"           tone="amber" />
            <PharmaCallRow rep="Novartis"  drug="Cosentyx — psoriatic arthritis"    duration="20 min" pay="$60"  status="Pending"           tone="amber" />
            <PharmaCallRow rep="Pfizer"    drug="Eliquis safety profile update"     duration="15 min" pay="$45"  status="Accepted · Wed 14:00" tone="jade" />
            <PharmaCallRow rep="Sanofi"    drug="Toujeo dosing in T2DM"             duration="30 min" pay="$90"  status="Declined"          tone="ink" />
          </div>
        </div>
        <div className="col-span-5 space-y-3">
          <div>
            <h2 className="font-display text-[18px] font-medium mb-3">Earnings · last 90d</h2>
            <div className="bg-surface border border-line rounded-lg p-4">
              <div className="flex items-baseline gap-2">
                <div className="font-display text-[28px] font-medium tnum">$1,240</div>
                <div className="text-[11.5px] text-jade-2 font-medium">+18%</div>
              </div>
              <div className="text-[11px] text-ink-3 mt-1">12 calls · avg $103 · 4h 50m reviewed</div>
              <div className="hairline my-3" />
              <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1.5">Top partners</div>
              <ul className="space-y-1.5 text-[11.5px]">
                <li className="flex justify-between"><span className="text-ink-2">Roche</span><span className="font-mono text-ink-3">$420 · 4 calls</span></li>
                <li className="flex justify-between"><span className="text-ink-2">Novartis</span><span className="font-mono text-ink-3">$340 · 4 calls</span></li>
                <li className="flex justify-between"><span className="text-ink-2">Pfizer</span><span className="font-mono text-ink-3">$280 · 3 calls</span></li>
                <li className="flex justify-between"><span className="text-ink-2">Sanofi</span><span className="font-mono text-ink-3">$200 · 1 call</span></li>
              </ul>
            </div>
          </div>
          <div className="bg-surface border border-line rounded-lg p-4">
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1.5">Your availability</div>
            <div className="text-[12.5px] text-ink-2 leading-snug mb-2">3 open slots per week · Mon &amp; Wed afternoons</div>
            <button className="text-[11.5px] text-jade-2 font-medium hover:underline inline-flex items-center gap-1">
              Edit availability <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </div>
    </SoonScaffold>
  );
}

function PharmaCallRow({ rep, drug, duration, pay, status, tone }) {
  const map = {
    jade:       "text-jade-2 bg-jade-soft",
    amber:      "text-amber bg-amber-soft",
    terracotta: "text-terracotta bg-terracotta-soft",
    ink:        "text-ink-3 bg-line-2",
  };
  return (
    <div className="bg-surface border border-line rounded-lg px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-md bg-line-2 text-ink-2 flex items-center justify-center font-semibold text-[11px] shrink-0">
        {rep.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium">{rep}</div>
        <div className="text-[11px] text-ink-3 truncate">{drug} · {duration}</div>
      </div>
      <span className="font-mono text-[13px] tnum text-ink-2">{pay}</span>
      <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded whitespace-nowrap ${map[tone]}`}>{status}</span>
      <ChevronRight size={14} className="text-ink-3" />
    </div>
  );
}

function TemplateRow({ name, patients, items }) {
  return (
    <div className="bg-surface border border-line rounded-lg px-4 py-3 flex items-center justify-between hover:border-ink transition cursor-pointer">
      <div>
        <div className="text-[13px] font-medium">{name}</div>
        <div className="text-[11px] text-ink-3">{items}</div>
      </div>
      <div className="text-right">
        <div className="font-mono text-[14px] tnum">{patients}</div>
        <div className="text-[10px] text-ink-3 uppercase tracking-wide">patients</div>
      </div>
    </div>
  );
}

/* ============================================================
   PERFORMANCE VIEW — action-oriented dashboard
   ============================================================ */
function PerformanceView() {
  return (
    <SoonScaffold
      eyebrow="Dashboard"
      title="Build the view that fits your practice"
      lede="Today's performance page is one fixed layout. The customizable dashboard lets you pin the metrics, leak points, and follow-ups that matter to you — and rearrange the grid."
      cards={[
        { icon: <LayoutDashboard size={14} />, tone: "jade",       title: "Customize your dashboard",
          body: "Pick the metrics that matter. Pin KPIs, leakage queues, and action cards in any arrangement." },
        { icon: <TrendingUp size={14} />,      tone: "terracotta", title: "Trends, not just snapshots",
          body: "See leakage patterns over weeks and quarters. Spot which problems are getting worse before they hurt." },
        { icon: <Zap size={14} />,             tone: "plum",       title: "Action queue",
          body: "Items grouped by what to do next: review & sign, patient follow-up, claim fix. Empty inbox is the goal." },
      ]}
      ctaTitle="Want this sooner?"
      ctaSub="The customizable Dashboard ships after Care plans. Tell us which widget you'd pin first — it shapes the default layout."
      ctaPrimary="Suggest a widget"
    >
      <div>
      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-3">Performance · last 30 days</div>
      <h2 className="font-display text-[26px] font-medium leading-none mb-1">Money in, patients in, leakage out.</h2>
      <p className="text-[12.5px] text-ink-3 mb-6">
        Kura takes 0% from doctors. Surfaces every leak point with a clear next action.
      </p>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPI label="Insurance payouts" value="$4,820" delta="+18%" tone="jade" sub="Forte · 22 claims paid" />
        <KPI label="Patients seen" value="84" delta="+9" tone="jade" sub="incl. 11 new bridged" />
        <KPI label="Lab volume sent" value="142" delta="+22" tone="jade" sub="orders → Kura" />
        <KPI label="Claim rejection rate" value="3.6%" delta="-1.4 pts" tone="jade" sub="3 of 84 claims" />
      </div>

      {/* Action cards — bidirectional surfacing */}
      <h2 className="font-display text-[18px] font-medium mb-3">Leakage to fix</h2>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <ActionCard
          tone="terracotta"
          icon={<Sparkles size={16} />}
          headline="5 results back · 2 flagged"
          body="Sokha C. and Bora P. need a second look — values out of range. Sign reports and notify patients."
          cta="Review results"
        />
        <ActionCard
          tone="amber"
          icon={<AlertTriangle size={16} />}
          headline="3 claims rejected"
          body="2 missing diagnosis code · 1 outside coverage. Resubmit in one click after fix."
          cta="Review reasons"
        />
        <ActionCard
          tone="plum"
          icon={<Calendar size={16} />}
          headline="12 patients due for follow-up"
          body="Care plan cadence fired this week. Schedule labs to keep cycle on track."
          cta="Schedule labs"
        />
      </div>

      {/* Two cards: claims breakdown + acquisition source */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-7 bg-surface border border-line rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-[16px] font-medium">Insurance payouts · last 30 days</h3>
            <span className="text-[11px] text-ink-3 font-mono">22 paid · 3 rejected · 4 pending</span>
          </div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer>
              <LineChart
                data={[
                  { d: "W1", v: 980 }, { d: "W2", v: 1240 },
                  { d: "W3", v: 1180 }, { d: "W4", v: 1420 },
                ]}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <XAxis dataKey="d" stroke="#7C857F" fontSize={10} tickLine={false} axisLine={{ stroke: "#E5DFD3" }} />
                <YAxis stroke="#7C857F" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #E5DFD3", borderRadius: 6, fontSize: 11 }} />
                <Line type="monotone" dataKey="v" stroke="#1F4D3F" strokeWidth={2.4} dot={{ fill: "#1F4D3F", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-5 bg-surface border border-line rounded-xl p-5">
          <h3 className="font-display text-[16px] font-medium mb-4">New patients · acquisition source</h3>
          <div className="space-y-3">
            <SourceBar label="Directory (organic search)" value={5} total={11} tone="jade" hint="kura.med/doctors/sopheak-chann" />
            <SourceBar label="Walk-in to your cabinet" value={4} total={11} tone="ink" hint="bridged via your reception" />
            <SourceBar label="Self-bridge (Telegram)" value={2} total={11} tone="amber" hint="patient initiated via TG bot" />
          </div>
          <div className="hairline my-4" />
          <div className="text-[11.5px] text-ink-2 leading-snug">
            <strong className="text-jade">Free SEO is working.</strong> Your directory profile ranked for 6 long-tail queries this month. Top: "diabetic doctor BKK1".
          </div>
        </div>
      </div>
      </div>
    </SoonScaffold>
  );
}

function KPI({ label, value, delta, sub, tone }) {
  const toneMap = { jade: "text-jade-2" };
  return (
    <div className="bg-surface border border-line rounded-xl p-4">
      <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="font-display text-[28px] font-medium tnum leading-none">{value}</div>
        <div className={`text-[11.5px] font-medium ${toneMap[tone]}`}>{delta}</div>
      </div>
      <div className="text-[11px] text-ink-3 mt-1">{sub}</div>
    </div>
  );
}

function ActionCard({ tone, icon, headline, body, cta }) {
  const map = {
    terracotta: "border-terracotta bg-terracotta-soft text-terracotta",
    amber: "border-amber bg-amber-soft text-amber",
    plum: "border-plum bg-line-2 text-plum",
  };
  return (
    <div className="bg-surface border border-line rounded-xl p-4">
      <div className={`w-7 h-7 rounded-md flex items-center justify-center mb-3 ${map[tone]}`}>{icon}</div>
      <h3 className="text-[14px] font-semibold leading-snug mb-1">{headline}</h3>
      <p className="text-[11.5px] text-ink-2 leading-snug mb-3">{body}</p>
      <button className="inline-flex items-center gap-1 text-[11.5px] font-medium text-ink hover:text-jade-2">
        {cta} <ArrowRight size={11} />
      </button>
    </div>
  );
}

function SourceBar({ label, value, total, tone, hint }) {
  const pct = Math.round((value / total) * 100);
  const map = {
    jade: "bg-jade-2",
    terracotta: "bg-terracotta",
    plum: "bg-plum",
    amber: "bg-amber",
    ink: "bg-ink-2",
  };
  return (
    <div>
      <div className="flex items-baseline justify-between text-[12px] mb-1">
        <span>{label}</span>
        <span className="font-mono text-ink-2">{value} <span className="text-ink-3">/ {total}</span></span>
      </div>
      <div className="h-1.5 bg-line-2 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${map[tone]}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-[10.5px] text-ink-3 mt-1">{hint}</div>
    </div>
  );
}

/* ============================================================
   DIRECTORY VIEW — Doctolib-style public profile preview
   ============================================================ */
function DirectoryView() {
  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto">
      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-3">Public directory · kura.med/doctors/sopheak-chann</div>
      <div className="flex items-center gap-3 mb-1">
        <h1 className="font-display text-[30px] font-medium leading-none">Your free patient acquisition channel</h1>
        <PreviewLock />
      </div>
      <p className="text-[12.5px] text-ink-3 mb-6">
        Kura's directory ranks for searches you couldn't rank for alone. Patients who book here become your patients — and Kura's.
      </p>

      <PreviewBlur>
      <div className="grid grid-cols-12 gap-5">
        <div data-tour="directory-body" className="col-span-8">
          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            {/* Browser chrome */}
            <div className="px-4 py-2 border-b border-line-2 bg-surface-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-line" />
                <div className="w-2.5 h-2.5 rounded-full bg-line" />
                <div className="w-2.5 h-2.5 rounded-full bg-line" />
              </div>
              <div className="flex-1 mx-4 bg-surface border border-line rounded text-[11px] font-mono text-ink-3 px-2 py-1 truncate">
                kura.med/doctors/sopheak-chann
              </div>
            </div>
            {/* Profile body */}
            <div className="p-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-xl bg-jade-soft text-jade flex items-center justify-center font-display text-[32px] font-medium shrink-0">
                  SC
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display text-[26px] font-medium leading-none">Dr. Sopheak Chann</h2>
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-jade bg-jade-soft px-1.5 py-0.5 rounded">
                      <ShieldCheck size={9} /> Verified
                    </span>
                  </div>
                  <div className="text-[13px] text-ink-2">General Practitioner · Internal Medicine</div>
                  <div className="text-[12px] text-ink-3 mt-1">ឆាន សុភ័ក្រ · Speaks Khmer, English, French</div>
                  <div className="flex items-center gap-3 mt-2 text-[11.5px] text-ink-3">
                    <span className="inline-flex items-center gap-1"><MapPin size={11} /> BKK1, Phnom Penh</span>
                    <span className="inline-flex items-center gap-1"><Clock size={11} /> Mon–Sat · 8am–6pm</span>
                  </div>
                </div>
              </div>

              <div className="hairline my-5" />

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-2">Insurance accepted</h3>
                  <ul className="text-[12.5px] space-y-1">
                    <li>· Forte EmCare</li>
                    <li>· National Social Security Fund</li>
                    <li>· Self-pay (Kura cash rates)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-2">Services</h3>
                  <ul className="text-[12.5px] space-y-1">
                    <li>· In-cabinet consultation</li>
                    <li>· Telehealth (Khmer + English)</li>
                    <li>· Lab orders + home collection</li>
                    <li>· Medicine delivery to patient's home</li>
                  </ul>
                </div>
              </div>

              <div className="hairline my-5" />

              <div className="bg-surface-2 border border-line-2 rounded-lg p-4">
                <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-2">Book online</div>
                <div className="flex gap-2 mb-2">
                  {["Mon 11", "Tue 12", "Wed 13", "Thu 14", "Fri 15"].map((d, i) => (
                    <button key={d} className={`flex-1 py-2 text-[11.5px] rounded-md border ${i === 1 ? "border-jade bg-jade-soft text-jade font-medium" : "border-line text-ink-2 hover:border-ink"}`}>
                      {d}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {["08:30", "09:00", "10:15", "11:00", "11:30", "14:00", "14:30", "15:00", "16:30", "17:00"].map((t, i) => (
                    <button key={t} className={`py-1.5 text-[11px] rounded-md border ${i === 4 ? "bg-jade text-white border-ink" : "border-line text-ink-2 hover:border-ink"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hairline my-5" />

              {/* Patient reviews */}
              <div>
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1">Patient reviews</div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-[26px] font-medium tnum leading-none">4.7</span>
                      <div className="flex items-center gap-0.5 text-amber">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} size={13} fill={i <= 4 ? "currentColor" : "none"} strokeWidth={1.5} />
                        ))}
                      </div>
                      <span className="text-[11.5px] text-ink-3">· 38 verified reviews</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-jade bg-jade-soft px-1.5 py-0.5 rounded">
                    <ShieldCheck size={9} /> Verified-only
                  </span>
                </div>

                {/* Rating distribution */}
                <div className="grid grid-cols-12 gap-4 mb-4">
                  <div className="col-span-5 space-y-1">
                    {[
                      { stars: 5, count: 28, pct: 74 },
                      { stars: 4, count: 7, pct: 18 },
                      { stars: 3, count: 2, pct: 5 },
                      { stars: 2, count: 1, pct: 3 },
                      { stars: 1, count: 0, pct: 0 },
                    ].map((r) => (
                      <div key={r.stars} className="flex items-center gap-2 text-[11px]">
                        <span className="w-3 text-ink-3 tnum">{r.stars}</span>
                        <Star size={9} className="text-amber" fill="currentColor" strokeWidth={1.5} />
                        <div className="flex-1 h-1.5 bg-line-2 rounded-full overflow-hidden">
                          <div className="h-full bg-amber" style={{ width: `${r.pct}%` }} />
                        </div>
                        <span className="w-6 text-right tnum text-ink-3">{r.count}</span>
                      </div>
                    ))}
                  </div>
                  <div className="col-span-7 bg-surface-2 border border-line-2 rounded-lg p-3 text-[11px] text-ink-2 leading-relaxed">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-3 mb-1.5 font-semibold">
                      <ShieldCheck size={10} /> How reviews work
                    </div>
                    Only patients who completed a real visit can post. Identity is verified through your Kura panel.
                    You can publicly respond to any review. Star rating only ranks doctors with ≥5 verified reviews.
                  </div>
                </div>

                {/* Review list */}
                <div className="space-y-3">
                  <ReviewCard
                    initials="SC"
                    name="Sokha C."
                    when="2 weeks ago"
                    rating={5}
                    visit="In-cabinet · Diabetes follow-up"
                    body="Dr. Chann took time to explain my A1c trend in Khmer and English. Adjusted my metformin and ordered labs without making me come back. Cabinet was on time."
                    bodyKhmer="វេជ្ជបណ្ឌិតបានពន្យល់ច្បាស់ ហើយតាមដានយកចិត្តទុកដាក់ខ្លាំង។"
                    response={null}
                  />
                  <ReviewCard
                    initials="BP"
                    name="Bora P."
                    when="1 month ago"
                    rating={4}
                    visit="Telehealth · Lipid review"
                    body="Good consultation. The video call quality dropped twice but the doctor reconnected quickly. Lab results were explained clearly."
                    bodyKhmer={null}
                    response={{
                      when: "3 weeks ago",
                      body: "Thank you Bora. We've upgraded our connection at the cabinet — should be more stable next time.",
                    }}
                  />
                  <ReviewCard
                    initials="VH"
                    name="Vibol H."
                    when="2 months ago"
                    rating={5}
                    visit="In-cabinet · Hypertension"
                    body="The reception team was helpful and the doctor explained my blood pressure medications properly. Pickup of medicine from BKK1 PSC was easy."
                    bodyKhmer="ពិតជាល្អ! សូមអរគុណច្រើន។"
                    response={null}
                  />
                </div>

                <button className="w-full mt-3 py-2 text-[11.5px] text-ink-3 border border-line rounded-md hover:bg-surface-2">
                  See all 38 reviews
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-4 space-y-4">
          <div className="bg-surface border border-line rounded-xl p-4">
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-2">Profile editability</div>
            <p className="text-[11.5px] text-ink-2 leading-snug mb-3">
              You control what represents your practice. Kura controls what verifies your credentials.
            </p>
            <div className="space-y-1.5 text-[11.5px]">
              <Editable label="Photo" who="you" />
              <Editable label="Hours" who="you" />
              <Editable label="Languages" who="you" />
              <Editable label="Services offered" who="you" />
              <Editable label="Bio (free text)" who="you" />
              <Editable label="Name" who="kura" />
              <Editable label="License number" who="kura" />
              <Editable label="Specialty" who="kura" />
              <Editable label="Verified badge" who="kura" />
            </div>
          </div>

          <div className="bg-surface border border-line rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-jade font-semibold mb-1">
              <Zap size={10} /> SEO performance
            </div>
            <div className="font-display text-[28px] font-medium tnum leading-none mt-2">147</div>
            <div className="text-[11px] text-ink-3">profile views · last 30 days</div>
            <div className="hairline my-3" />
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1.5">Top queries</div>
            <ul className="text-[11.5px] space-y-1">
              <li>"diabetic doctor BKK1" <span className="font-mono text-ink-3 float-right">#3</span></li>
              <li>"telehealth GP Phnom Penh" <span className="font-mono text-ink-3 float-right">#5</span></li>
              <li>"forte emcare doctor" <span className="font-mono text-ink-3 float-right">#2</span></li>
            </ul>
          </div>

          <div className="bg-surface border border-line rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-amber font-semibold mb-1">
              <Star size={10} fill="currentColor" /> Reviews this period
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <div className="font-display text-[28px] font-medium tnum leading-none">+4</div>
              <div className="text-[11px] text-ink-3">new · last 30 days</div>
            </div>
            <div className="hairline my-3" />
            <div className="space-y-1.5 text-[11.5px]">
              <div className="flex justify-between">
                <span className="text-ink-2">Response rate</span>
                <span className="tnum text-jade font-medium">68%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-2">Avg. response time</span>
                <span className="tnum text-ink-2">2.3 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-2">Awaiting response</span>
                <span className="tnum text-amber font-medium">2</span>
              </div>
            </div>
            <button className="w-full mt-3 py-1.5 text-[11px] border border-line rounded-md hover:bg-surface-2 text-ink-2">
              Manage responses
            </button>
          </div>
        </div>
      </div>
      </PreviewBlur>
    </div>
  );
}

function Editable({ label, who }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-2">{label}</span>
      <span className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
        who === "you" ? "text-jade bg-jade-soft" : "text-ink-3 bg-line-2"
      }`}>
        {who === "you" ? "You edit" : "Kura-controlled"}
      </span>
    </div>
  );
}

function ReviewCard({ initials, name, when, rating, visit, body, bodyKhmer, response }) {
  return (
    <div className="border border-line-2 rounded-lg p-3.5 bg-surface">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-surface-2 border border-line text-ink-2 flex items-center justify-center font-semibold text-[11px] shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-medium text-[12.5px] text-ink">{name}</span>
            <span className="inline-flex items-center gap-0.5 text-[9.5px] uppercase tracking-wider font-semibold text-jade">
              <ShieldCheck size={8} /> Verified visit
            </span>
            <span className="text-[11px] text-ink-3">· {when}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-0.5 text-amber">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={11} fill={i <= rating ? "currentColor" : "none"} strokeWidth={1.5} />
              ))}
            </div>
            <span className="text-[10.5px] text-ink-3">{visit}</span>
          </div>
          <p className="text-[12px] text-ink-2 leading-relaxed">{body}</p>
          {bodyKhmer && (
            <p className="text-[12px] text-ink-3 leading-relaxed mt-1 italic">{bodyKhmer}</p>
          )}
          {response ? (
            <div className="mt-2.5 pl-3 border-l-2 border-jade bg-jade-soft/40 rounded-r-md py-2 pr-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10.5px] font-semibold text-jade">Dr. Sopheak Chann's response</span>
                <span className="text-[10.5px] text-ink-3">· {response.when}</span>
              </div>
              <p className="text-[11.5px] text-ink-2 leading-relaxed">{response.body}</p>
            </div>
          ) : (
            <button className="mt-2 text-[10.5px] text-jade hover:underline font-medium inline-flex items-center gap-1">
              <MessageCircle size={10} /> Respond publicly
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MEMBERS VIEW — cabinet team with scoped permissions
   ============================================================ */
function emailLocalToName(email) {
  if (!email) return "";
  const local = String(email).split("@")[0] || "";
  const cleaned = local.replace(/\d+/g, "").replace(/[._-]+/g, " ").trim();
  if (!cleaned) return local;
  return cleaned
    .split(/\s+/)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

function deriveInitials(name, email) {
  const source = (name || "").replace(/^(Dr\.?|Mr\.?|Mrs\.?|Ms\.?)\s+/i, "").trim();
  if (source) {
    const parts = source.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (email || "?").slice(0, 2).toUpperCase();
}

function MembersView() {
  const auth = useAuth();
  const ownerEmail = auth?.session?.email ?? "";
  const ownerFullName = auth?.kyc?.fullName || "";
  const ownerName = ownerFullName || emailLocalToName(ownerEmail) || "You";
  const isVerified = auth?.kyc?.status === "verified";
  const isSopheakDemo = ownerEmail.toLowerCase() === "verified@gmail.com";

  const owner = {
    initials: deriveInitials(ownerName, ownerEmail),
    name: ownerName,
    khmer: isSopheakDemo ? "ឆាន សុភ័ក្រ" : null,
    role: isVerified ? "Owner · Doctor" : "Owner",
    email: ownerEmail,
    tier: auth?.billing?.enabled ? "T3" : (isVerified ? "T2" : null),
    scope: ["Sign reports", "Order labs", "Care plans", "Manage members", "Billing"],
    lastActive: "now",
    isYou: true,
  };

  // Sopheak's verified demo keeps a populated team to showcase team-management UI.
  // Pierre's demo and every real signup start solo so the invite CTA leads.
  const teammates = isSopheakDemo ? [
    {
      initials: "SL", name: "Dr. Sokha Lim", khmer: "លឹម សុខា", role: "Doctor",
      email: "sokha.lim@chann.med", tier: "T1",
      scope: ["Sign reports", "Order labs", "Care plans"], lastActive: "12 min ago",
    },
    {
      initials: "TS", name: "Theary Sok", khmer: "សុខ ធារី", role: "Nurse · Phlebotomist",
      email: "theary@chann.med", tier: null,
      scope: ["Order labs (under doctor)", "Draw samples", "Update vitals"], lastActive: "1 hr ago",
    },
    {
      initials: "MP", name: "Mealea Pich", khmer: "ពេជ្រ មាលា", role: "Reception",
      email: "mealea@chann.med", tier: null,
      scope: ["Bridge patients", "Schedule bookings", "View patient list"], lastActive: "5 min ago",
    },
  ] : [];

  const pendingInvites = isSopheakDemo ? [
    { email: "phally.tep@chann.med", role: "Nurse · Phlebotomist", sent: "2 days ago" },
    { email: "dara.heng@chann.med", role: "Doctor", sent: "6 days ago" },
  ] : [];

  const members = [owner, ...teammates];
  const isSolo = teammates.length === 0;
  const doctorCount = members.filter(m => /Doctor/i.test(m.role)).length;
  const staffCount = members.filter(m => /Nurse|Reception|Phlebotom|Accountant/i.test(m.role)).length;

  const cabinetLabel = auth?.workspace?.name || "Cabinet";
  const cabinetSub = auth?.workspace?.address ? ` · ${auth.workspace.address}` : "";

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto">
      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-3">{cabinetLabel}{cabinetSub}</div>
      <h1 className="font-display text-[30px] font-medium leading-none mb-1">Your team</h1>
      <p className="text-[12.5px] text-ink-3 mb-6 max-w-2xl">
        {isSolo
          ? "Right now it's just you — the cabinet owner. Bring in a doctor, nurse, phlebotomist, receptionist, or accountant so the right work goes to the right hands without sharing your sign-in."
          : "Doctors, nurses, and reception share the cabinet workspace — each with scoped permissions. Add staff so your reception can bridge patients and your nurses can prep orders without sharing your sign-in."
        }
      </p>

      {/* Counts + invite */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-7 text-[12px]">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-[24px] font-medium tnum">{members.length}</span>
            <span className="text-ink-3">{members.length === 1 ? "member" : "members"}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-[24px] font-medium tnum">{doctorCount}</span>
            <span className="text-ink-3">{doctorCount === 1 ? "doctor" : "doctors"}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-[24px] font-medium tnum">{staffCount}</span>
            <span className="text-ink-3">staff</span>
          </div>
          {pendingInvites.length > 0 && (
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-[24px] font-medium tnum text-amber">{pendingInvites.length}</span>
              <span className="text-ink-3">pending</span>
            </div>
          )}
        </div>
        <button className="inline-flex items-center gap-1.5 bg-jade text-white rounded-lg px-3.5 py-2 text-sm font-medium hover:opacity-90">
          <Plus size={14} /> Invite member
        </button>
      </div>

      {/* Active members table */}
      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-2.5 text-[10px] uppercase tracking-[0.14em] text-ink-3 border-b border-line-2 bg-surface-2">
          <div className="col-span-4">Member</div>
          <div className="col-span-3">Role</div>
          <div className="col-span-3">Scope</div>
          <div className="col-span-2 text-right">Last active</div>
        </div>
        {members.map((m, i) => <MemberRow key={i} {...m} />)}
        {isSolo && <SoloOwnerInviteRow />}
      </div>

      {/* Pending invites — only when there are invites */}
      {pendingInvites.length > 0 && (
        <>
          <h2 className="font-display text-[18px] font-medium mt-8 mb-3">Pending invites</h2>
          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            {pendingInvites.map((p, i) => <PendingInvite key={i} {...p} />)}
          </div>
        </>
      )}

      {/* Permissions explainer */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <PermissionExplainer
          icon={<ShieldCheck size={14} />}
          tone="jade"
          role="Owner / Doctor"
          who="You"
          scope="Full access. Manages members, billing, and settles claims. Signs lab reports. Owns the cabinet's eKYC tier."
        />
        <PermissionExplainer
          icon={<Stethoscope size={14} />}
          tone="ink"
          role="Doctor"
          who="Colleagues"
          scope="Orders labs, signs reports, runs telehealth, owns their patient panel. Cannot manage members or billing."
        />
        <PermissionExplainer
          icon={<Activity size={14} />}
          tone="amber"
          role="Nurse / Reception"
          who="Clinical staff"
          scope="Bridges patients, draws samples, prepares orders for doctor sign-off. Cannot order labs solo or sign reports."
        />
      </div>

      <div className="mt-6 text-[10.5px] text-ink-3 leading-snug max-w-2xl">
        Members with clinical scope (doctors, nurses) need their own eKYC verification. Reception roles bridge patients but never view restricted PHI directly. Full clinic-OS surfaces (locations, audit log, advanced roles) ship in Phase 2 — see architecture spec §3.
      </div>
    </div>
  );
}

function MemberRow({ name, khmer, role, email, tier, initials, scope, lastActive, isYou }) {
  return (
    <div className="grid grid-cols-12 px-5 py-3.5 items-center border-b border-line-2 last:border-b-0 hover:bg-surface-2 transition">
      <div className="col-span-4 flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-jade-soft text-jade flex items-center justify-center font-medium text-[12px] shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-medium flex items-center gap-1.5">
            {name}
            {isYou && (
              <span className="text-[9px] uppercase tracking-wide text-jade bg-jade-soft px-1.5 py-px rounded font-semibold">
                You
              </span>
            )}
          </div>
          <div className="text-[10.5px] text-ink-3 truncate">{khmer} · {email}</div>
        </div>
      </div>
      <div className="col-span-3 text-[12px]">
        <div className="text-ink-2">{role}</div>
        {tier && (
          <div className="text-[10px] text-jade-2 inline-flex items-center gap-1 mt-0.5">
            <ShieldCheck size={9} /> {tier} verified
          </div>
        )}
      </div>
      <div className="col-span-3 flex flex-wrap gap-1">
        {scope.slice(0, 3).map(s => (
          <span key={s} className="text-[10px] text-ink-3 border border-line rounded px-1.5 py-px">{s}</span>
        ))}
        {scope.length > 3 && <span className="text-[10px] text-ink-3 px-1.5 py-px">+{scope.length - 3}</span>}
      </div>
      <div className="col-span-2 flex items-center justify-end gap-2">
        <span className="text-[11px] text-ink-2 font-mono">{lastActive}</span>
        <button className="p-1 text-ink-3 hover:text-ink hover:bg-surface-2 rounded">
          <MoreHorizontal size={14} />
        </button>
      </div>
    </div>
  );
}

function PendingInvite({ email, role, sent }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-line-2 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-line-2 text-ink-3 flex items-center justify-center">
          <Inbox size={14} />
        </div>
        <div>
          <div className="text-[13px] font-medium">{email}</div>
          <div className="text-[10.5px] text-ink-3">Invited as {role} · sent {sent}</div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[10px] uppercase tracking-wide text-amber bg-amber-soft px-1.5 py-0.5 rounded font-semibold mr-2">
          Pending
        </span>
        <button className="text-[11.5px] text-ink-3 hover:text-ink px-2 py-1 rounded hover:bg-surface-2">Resend</button>
        <button className="text-[11.5px] text-crimson hover:opacity-80 px-2 py-1 rounded hover:bg-surface-2">Cancel</button>
      </div>
    </div>
  );
}

function SoloOwnerInviteRow() {
  return (
    <div className="px-5 py-10 text-center border-t border-line-2 bg-surface-2/30">
      <div className="w-12 h-12 rounded-full bg-jade-soft text-jade flex items-center justify-center mx-auto mb-3">
        <UserPlus size={20} />
      </div>
      <div className="font-display text-[17px] font-medium mb-1">Build out your cabinet</div>
      <p className="text-[12px] text-ink-2 max-w-md mx-auto mb-4 leading-relaxed">
        Invite a colleague, nurse, phlebotomist, receptionist, or accountant. Each gets a role with scoped access — and HR · payroll · accounting come along for the ride.
      </p>
      <button className="inline-flex items-center gap-1.5 bg-jade text-white rounded-lg px-4 py-2 text-[13px] font-medium hover:opacity-90">
        <Plus size={13} /> Invite your first teammate
      </button>
      <div className="text-[10.5px] text-ink-3 mt-3">Members with clinical scope verify their own license · reception bridges patients only.</div>
    </div>
  );
}

function PermissionExplainer({ icon, tone, role, who, scope }) {
  const toneMap = {
    jade: "bg-jade-soft text-jade",
    ink: "bg-line-2 text-ink-2",
    amber: "bg-amber-soft text-amber",
  };
  return (
    <div className="bg-surface border border-line rounded-xl p-4">
      <div className={`w-7 h-7 rounded-md flex items-center justify-center mb-2 ${toneMap[tone]}`}>
        {icon}
      </div>
      <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-0.5">{role}</div>
      <div className="font-display text-[15px] font-medium mb-1.5">{who}</div>
      <p className="text-[11.5px] text-ink-2 leading-snug">{scope}</p>
    </div>
  );
}

/* ============================================================
   PROFILE SHEET (eKYC tier panel)
   ============================================================ */
function ProfileSheet({ onClose }) {
  const [unitSystem, setUnitSystem] = useLabUnits();
  const [tier, setTier] = useDoctorTier();
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/20" onClick={onClose} />
      <div className="relative w-[420px] bg-surface h-full border-l border-line overflow-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line-2">
          <h2 className="font-display text-[18px] font-medium">Your account</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-2"><X size={16} /></button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-jade-soft text-jade flex items-center justify-center font-display text-[20px] font-medium">SC</div>
            <div>
              <div className="font-medium">Dr. Sopheak Chann</div>
              <div className="text-[11.5px] text-ink-3">sopheak@chann.med · MoH-CAM-2018-04471</div>
            </div>
          </div>

          {/* Tier ladder */}
          <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-2">Verification</div>
          <div className="space-y-2 mb-4">
            <Tier
              n="0" name="Explorer"
              status={tier === "explorer" ? "current" : "done"}
              highlight={tier === "explorer"}
              what="Browse catalog, view sample patients, watch product tour"
            />
            <Tier
              n="1" name="Verified clinician"
              status={tier === "verified" ? "current" : tier === "done" ? "done" : "locked"}
              highlight={tier === "verified"}
              what="Real PHI, lab orders, care plans, telehealth, directory listing visible"
            />
            <Tier
              n="2" name="Billing-enabled"
              status={tier === "done" ? "current" : "locked"}
              highlight={tier === "done"}
              what="Insurance payouts to your bank · Kura takes 0%"
              cta={tier !== "done" ? "Add bank details" : undefined}
            />
          </div>

          {/* Demo tier switcher — prototype-only. Lets stakeholders flip
              between tiers and see how gates respond in real time. */}
          <div className="rounded-lg border border-amber/40 bg-amber-soft/40 px-3 py-2.5 mb-5">
            <div className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.14em] text-amber font-semibold mb-2">
              <Sparkles size={10} /> Demo · switch tier
            </div>
            <div className="inline-flex w-full rounded-md bg-surface border border-line p-0.5">
              {Object.entries(TIER_META).map(([id, m]) => (
                <button
                  key={id}
                  onClick={() => setTier(id)}
                  title={m.desc}
                  className={`flex-1 px-2 py-1 rounded text-[11px] font-medium transition ${
                    tier === id ? "bg-jade text-white" : "text-ink-3 hover:text-ink"
                  }`}
                >
                  {m.short}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-ink-3 leading-snug mt-2">
              {TIER_META[tier].desc} · resets on reload.
            </p>
          </div>

          <div className="hairline my-5" />

          {/* Preferences — global doctor settings that affect rendering everywhere */}
          <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-2">Preferences</div>
          <div className="rounded-lg border border-line bg-surface-2/40 p-3 mb-5">
            <div className="flex items-center justify-between gap-3 mb-1">
              <div className="flex items-center gap-2">
                <FlaskConical size={13} className="text-jade-2" />
                <span className="text-[12.5px] font-medium">Lab unit system</span>
              </div>
              <div className="inline-flex rounded-md border border-line bg-surface p-0.5 text-[11px] font-medium">
                <button
                  onClick={() => setUnitSystem("us")}
                  className={`px-2.5 py-1 rounded ${unitSystem === "us" ? "bg-jade text-white" : "text-ink-3 hover:text-ink"}`}
                >
                  US
                </button>
                <button
                  onClick={() => setUnitSystem("si")}
                  className={`px-2.5 py-1 rounded ${unitSystem === "si" ? "bg-jade text-white" : "text-ink-3 hover:text-ink"}`}
                >
                  SI
                </button>
              </div>
            </div>
            <p className="text-[11px] text-ink-3 leading-snug">
              {unitSystem === "us"
                ? "mg/dL for glucose & lipids, mg/dL for creatinine, % for HbA1c. Chosen by clinicians trained in US/UK conventions."
                : "mmol/L for glucose & lipids, µmol/L for creatinine, mmol/mol for HbA1c. Standard across Cambodia and most of the world."}
            </p>
            <p className="text-[10.5px] text-ink-3 mt-1.5 leading-snug">
              Affects values, reference ranges, and trend charts everywhere — chart, trend modal, exports.
            </p>
          </div>

          {/* Quick links */}
          <ul className="space-y-1 text-[12.5px]">
            <ProfileLink icon={<Globe size={14} />} label="Public directory profile" detail="kura.med/doctors/sopheak-chann" />
            <ProfileLink icon={<Users size={14} />} label="Cabinet members" detail="4 active · 2 pending invites" />
            <ProfileLink icon={<Building2 size={14} />} label="Cabinet & courier route" detail="BKK1 · daily 16:40 pickup" />
            <ProfileLink icon={<FileText size={14} />} label="License & documents" detail="Renews 2027-04" />
            <ProfileLink icon={<Inbox size={14} />} label="Notification preferences" detail="Email + Telegram" />
          </ul>
        </div>
      </div>
    </div>
  );
}

function Tier({ n, name, status, what, cta, highlight }) {
  const isLocked = status === "locked";
  const isDone = status === "done";
  const isCurrent = status === "current";
  return (
    <div className={`rounded-lg border p-3 ${
      highlight ? "border-jade bg-jade-soft" : isDone ? "border-line bg-surface-2" : "border-line bg-surface"
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-mono font-semibold ${
          isDone ? "bg-jade text-white" :
          isCurrent ? "bg-jade text-white" :
          "bg-line text-ink-3"
        }`}>
          {isDone ? <CheckCircle2 size={12} /> : `T${n}`}
        </div>
        <div className="text-[13px] font-semibold">{name}</div>
        {isCurrent && <span className="text-[9.5px] uppercase tracking-wider font-bold text-jade ml-auto">You are here</span>}
        {isLocked && <span className="text-[9.5px] uppercase tracking-wider text-ink-3 ml-auto">Locked</span>}
      </div>
      <p className="text-[11px] text-ink-2 leading-snug">{what}</p>
      {cta && (
        <button className="mt-2 text-[11.5px] font-medium text-jade-2 hover:underline inline-flex items-center gap-1">
          {cta} <ArrowRight size={11} />
        </button>
      )}
    </div>
  );
}

function ProfileLink({ icon, label, detail }) {
  return (
    <li>
      <button className="w-full flex items-center gap-3 p-2.5 rounded-md hover:bg-surface-2">
        <span className="w-7 h-7 rounded-md bg-line-2 text-ink-2 flex items-center justify-center">{icon}</span>
        <span className="flex-1 text-left">
          <span className="block font-medium">{label}</span>
          <span className="block text-[11px] text-ink-3">{detail}</span>
        </span>
        <ChevronRight size={13} className="text-ink-3" />
      </button>
    </li>
  );
}

/* ============================================================
   PATIENT DETAIL FULL — the treatment workspace
   Action ribbon: Order labs · Prescribe · Add diagnosis · Refer · Schedule · Note
   Body: problem list (ICD-10), vitals, labs trend, medications,
         allergies, encounter timeline, AI recap, claims, alerts
   ============================================================ */
function PatientDetailFull({ patient, onBack, onQuickOrder, onOrderPlaced, onViewOrder }) {
  const [actionPanel, setActionPanel] = useState(null); // null | "rx" | "icd" | "note"
  const [showHospitalRefer, setShowHospitalRefer] = useState(false);
  const [headerCompact, setHeaderCompact] = useState(false);
  const [scribeOpen, setScribeOpen] = useState(false);
  // When the scribe summarises a transcript, we route the draft into the
  // existing ConsultationNotePanel via its seedHtml prop. Bumping noteSeedKey
  // re-mounts the panel so the editor re-seeds with the new draft.
  const [noteSeed, setNoteSeed] = useState(null);
  const [noteSeedKey, setNoteSeedKey] = useState(0);
  // Reflex testing phase — lifted up so the Lab history can react to the same
  // state as the ReflexTestingCard (don't show FT3/FT4 in the flowsheet until
  // the doctor approves and payment runs).
  const [reflexPhase, setReflexPhase] = useState("detected");
  // Right-rail accordion — only one secondary section open at a time. Null = all
  // collapsed (default). Primary surfaces (Order labs, Recent orders, Follow up)
  // stay always-visible.
  const [openRailSection, setOpenRailSection] = useState(null);
  const toggleRail = (id) => setOpenRailSection(prev => prev === id ? null : id);
  // Just-placed booking from the Quick order panel — the new row + NEW badge
  // persist until reload, but the card-level jade glow is its own state that
  // auto-fades after the pulse so it doesn't sit there forever.
  const [justPlacedBooking, setJustPlacedBooking] = useState(null);
  const [bookingGlow, setBookingGlow] = useState(false);
  const bookingsRef = useRef(null);

  const handleQuickOrderPlaced = (order) => {
    setJustPlacedBooking(order);
    setBookingGlow(true);
    setTimeout(() => {
      bookingsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
    // Drop the card glow after the pulse animation completes (~3.6s).
    setTimeout(() => setBookingGlow(false), 3800);
    onOrderPlaced && onOrderPlaced(order);
  };

  // Airbnb-style header collapse: detailed at top, compact once the page has scrolled.
  // Hysteresis: collapse at 120, only re-expand below 40. The 80px dead-zone
  // stops rapid back-and-forth toggles when scroll inertia overshoots the
  // threshold, which was causing the header to flicker between the two layouts.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHeaderCompact(prev => {
        if (!prev && y > 120) return true;
        if (prev && y < 40)   return false;
        return prev;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Demo-data extensions (the cohort patient object is sparse —
  // these are reasonable defaults for the prototype's first patient)
  const isSokha = patient.id === "P-9134";
  const problems = isSokha
    ? [
        { code: "E11.65", label: "Type 2 diabetes mellitus with hyperglycemia", since: "2020-03", status: "active" },
        { code: "E78.5",  label: "Hyperlipidemia, unspecified",                  since: "2021-08", status: "active" },
        { code: "I10",    label: "Essential hypertension",                       since: "2022-11", status: "managed" },
        { code: "K76.0",  label: "Fatty liver, not elsewhere classified",        since: "2024-02", status: "active" },
      ]
    : [
        { code: "E78.0", label: "Pure hypercholesterolemia", since: "2023-04", status: "active" },
      ];
  const vitals = isSokha
    ? [
        { label: "BP",            value: "146/92", unit: "mmHg",  flag: "high", when: "today" },
        { label: "HR",            value: "78",     unit: "bpm",   flag: "ok",   when: "today" },
        { label: "Weight",        value: "82.4",   unit: "kg",    flag: "warn", when: "today" },
        { label: "BMI",           value: "28.7",   unit: "kg/m²", flag: "warn", when: "today" },
        { label: "Glucose (FPG)", value: "148",    unit: "mg/dL", flag: "high", when: "today" },
        { label: "SpO₂",          value: "98",     unit: "%",     flag: "ok",   when: "today" },
      ]
    : [
        { label: "BP",     value: "128/82", unit: "mmHg",  flag: "ok", when: "5d ago" },
        { label: "HR",     value: "72",     unit: "bpm",   flag: "ok", when: "5d ago" },
        { label: "Weight", value: "61.0",   unit: "kg",    flag: "ok", when: "5d ago" },
        { label: "BMI",    value: "23.4",   unit: "kg/m²", flag: "ok", when: "5d ago" },
      ];
  const meds = isSokha
    ? [
        { name: "Metformin",      dose: "1000mg", freq: "BID", route: "PO", since: "2020-04", refills: 3, status: "active" },
        { name: "Gliclazide MR",  dose: "60mg",   freq: "OD",  route: "PO", since: "2022-01", refills: 2, status: "active" },
        { name: "Atorvastatin",   dose: "20mg",   freq: "OD",  route: "PO", since: "2021-09", refills: 1, status: "active" },
        { name: "Lisinopril",     dose: "10mg",   freq: "OD",  route: "PO", since: "2022-12", refills: 4, status: "active" },
      ]
    : [
        { name: "Atorvastatin", dose: "20mg", freq: "OD", route: "PO", since: "2023-05", refills: 2, status: "active" },
      ];
  const allergies = isSokha
    ? [{ what: "Sulfa drugs", reaction: "rash", severity: "moderate" }]
    : [{ what: "—", reaction: "no known allergies", severity: "—" }];
  const encounters = isSokha
    ? [
        { kind: "lab",   date: "today",     label: "HbA1c + lipid panel — results posted",  detail: "9.4% · LDL 162 · 2 flagged",      icon: "lab",   flag: "warn" },
        { kind: "visit", date: "12d ago",   label: "In-cabinet · T2DM follow-up",           detail: "Note signed · ICD-10: E11.65",    icon: "visit" },
        { kind: "rx",    date: "12d ago",   label: "Prescription · Metformin refill",       detail: "1000mg BID · 90 days · sent PDF", icon: "rx" },
        { kind: "claim", date: "11d ago",   label: "Forte EmCare · claim submitted",        detail: "$48.50 · pending insurer",        icon: "claim" },
        { kind: "visit", date: "3mo ago",   label: "Telehealth · Quarterly A1c review",     detail: "Note signed · plan adjusted",     icon: "tele" },
        { kind: "lab",   date: "3mo ago",   label: "HbA1c + lipid panel",                   detail: "8.4% · LDL 158",                  icon: "lab" },
      ]
    : [
        { kind: "lab",   date: "5d ago", label: "Lipid panel — results posted", detail: "LDL 178",                     icon: "lab", flag: "warn" },
        { kind: "visit", date: "5d ago", label: "In-cabinet · Lipid review",    detail: "Note signed · ICD-10: E78.0", icon: "visit" },
      ];

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto">
      {/* Breadcrumb / back */}
      <div className="flex items-center gap-1 mb-4 text-[12px] text-ink-3">
        <button onClick={onBack} className="inline-flex items-center gap-1 hover:text-ink">
          <ChevronLeft size={13} /> Patients
        </button>
        <ChevronRight size={11} className="text-ink-3" />
        <span className="text-ink-2 font-medium">{patient.name}</span>
        <span className="font-mono ml-1 text-ink-3">{patient.id}</span>
      </div>

      {/* Patient header card — Airbnb-style detailed (top) ↔ compact (scrolled).
          Short ease-out transitions on size/padding properties only. The AI
          recap below is a structural DOM swap (different element trees per
          state) and is NOT transitioned — that's what caused the flicker
          before. At 200ms the swap reads as "inside" the surrounding resize
          motion, plus hysteresis on the scroll trigger keeps the toggle rare. */}
      <div data-tour="patient-header" className={`bg-surface border border-line rounded-xl mb-4 sticky top-[60px] z-30 shadow-sm transition-[padding] duration-200 ease-out ${headerCompact ? "px-4 py-2.5" : "px-5 py-4"}`}>
        <div className={`flex items-center transition-[gap] duration-200 ease-out ${headerCompact ? "gap-3" : "gap-3.5"}`}>
          <div className={`rounded-lg flex items-center justify-center font-display font-medium shrink-0 transition-[width,height,font-size,border-radius] duration-200 ease-out ${
            headerCompact ? "w-9 h-9 text-[13px]" : "w-11 h-11 text-[16px]"
          } ${
            patient.flag === "critical" ? "bg-crimson-soft text-crimson" :
            patient.flag === "warning"  ? "bg-amber-soft text-amber" :
            "bg-jade-soft text-jade"
          }`}>
            {patient.name.split(" ").map(s => s[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className={`font-display font-medium leading-none transition-[font-size] duration-200 ease-out ${headerCompact ? "text-[16px]" : "text-[20px]"}`}>
                {patient.name}
              </h1>
              {problems[0] && (
                <span className={`inline-flex items-center gap-1.5 font-medium rounded-full transition-[padding,font-size] duration-200 ease-out ${
                  headerCompact ? "text-[10px] px-1.5 py-0.5" : "text-[11px] px-2.5 py-1"
                } bg-line-2 text-ink-2`}>
                  <Activity size={headerCompact ? 9 : 11} /> {problems[0].label.split(" with")[0]}
                </span>
              )}
              {headerCompact && (
                <span className="text-[11px] text-ink-3 truncate">
                  · {patient.age} {patient.sex === "M" ? "♂" : "♀"} · MRN <span className="font-mono">{patient.id}</span> · {patient.insurance}
                </span>
              )}
            </div>
            {!headerCompact && (
            <div className="mt-1 flex items-center gap-3 text-[12px] text-ink-3 flex-wrap">
              <span>{patient.age} {patient.sex === "M" ? "♂" : "♀"}</span>
              <span className="text-ink-3/50">·</span>
              <span>MRN <span className="font-mono text-ink-2">{patient.id}</span></span>
              <span className="text-ink-3/50">·</span>
              <span className="inline-flex items-center gap-1"><Clock size={11} /> Last seen {patient.lastSeen}</span>
            </div>
            )}
          </div>
        </div>

        {/* AI recap — folded into the header card; collapses with the rest on scroll */}
        {headerCompact ? (
          <div className="mt-2 pt-2 border-t border-line-2 flex items-center gap-2 text-[11.5px]">
            <Sparkles size={12} className="text-jade-2 shrink-0" />
            <span className="text-[9.5px] uppercase tracking-[0.18em] text-jade font-semibold shrink-0">Needs review</span>
            <span className="text-ink-2 truncate">{patient.summary} <span className="text-jade-2 font-semibold">Next:</span> <span className="text-ink-2">{patient.nextStep}</span></span>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-line-2 flex items-start gap-2.5">
            <Sparkles size={13} className="text-jade-2 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10.5px] uppercase tracking-[0.14em] text-jade font-semibold">Needs review</span>
              </div>
              <p className="text-[12.5px] text-ink leading-relaxed">
                {patient.summary}
                <span className="text-jade-2 font-medium"> Suggested:</span>{" "}
                <span className="text-ink-2">{patient.nextStep}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action surfaces — the sub-header ribbon was removed. Each primitive
          is reachable from existing surfaces:
            - Order labs   → QuickOrderPanel on the right rail
            - Prescribe    → MedicationsCard "+ Add" / AI suggestions
            - Add diagnosis → DiagnosesCard "+ Add" / AI suggestions
            - Voice notes  → floating circular FAB (below)
            - Note         → flows from Voice notes (record → summarize)
            - Hospital refer / Schedule → bento at the bottom of the right rail */}
      {actionPanel === "rx" && <RxWriterPanel onClose={() => setActionPanel(null)} meds={meds} allergies={allergies} />}
      {actionPanel === "icd" && <IcdPickerPanel onClose={() => setActionPanel(null)} existingProblems={problems} />}
      {actionPanel === "note" && (
        <ConsultationNotePanel
          key={`note-${noteSeedKey}`}
          onClose={() => { setActionPanel(null); setNoteSeed(null); }}
          patient={patient}
          isSokha={isSokha}
          seedHtml={noteSeed?.html}
          seedMotif={noteSeed?.motif}
        />
      )}
      {showHospitalRefer && <HospitalReferralModal patient={patient} onClose={() => setShowHospitalRefer(false)} />}

      {/* Voice notes — always-on circular FAB; opens the ScribePanel which
          handles its own minimized / panel states. Hidden while the scribe is
          open so the panel/pill takes its place in the bottom-right corner. */}
      {!scribeOpen && (
        <button
          onClick={() => setScribeOpen(true)}
          title="Dictate clinical note"
          aria-label="Dictate clinical note"
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 pl-3.5 pr-4 h-12 rounded-full bg-jade text-white shadow-lg hover:opacity-95 transition"
        >
          <Mic size={17} />
          <span className="text-[12.5px] font-medium">Dictate note</span>
        </button>
      )}

      {/* Floating AI scribe */}
      {scribeOpen && (
        <ScribePanel
          patient={patient}
          isSokha={isSokha}
          onClose={() => setScribeOpen(false)}
          onDraftReady={(draft) => {
            setNoteSeed(draft);
            setNoteSeedKey(k => k + 1);
            setActionPanel("note");
            setScribeOpen(false);
          }}
        />
      )}

      {/* Two-column body */}
      <div className="grid grid-cols-12 gap-4">
        {/* LEFT — chart */}
        <div className="space-y-4 col-span-8">
          {/* Reflex testing — appears when a recent flagged result on this patient triggers a rule */}
          {patient.id === "P-4421" && (
            <ReflexTestingCard
              order={{ id: "KO-4421-7220", patient: patient.name, mrn: patient.id }}
              patient={{ name: patient.name, mrn: patient.id }}
              phase={reflexPhase}
              onPhaseChange={setReflexPhase}
            />
          )}

          {/* Labs — multi-test trend matrix (vitals included as the first panel).
              The `data-tour="lab-trends"` anchor sits on the inner <table> in
              LabTrendTable so the spotlight wraps the matrix itself, not the
              surrounding "Lab history" header + range toolbar. */}
          <LabTrendTable patient={patient} reflexPhase={reflexPhase} />
        </div>

        {/* RIGHT — always-on quick order on top, then bookings, then context cards.
            Sticky + bounded max-height + overflow-y-auto = independent scroll
            for the rail. Mouse over here scrolls the rail internally (wheel
            events are consumed by overflow-y-auto), mouse over the left column
            scrolls the page. The rail docks at top-[160px] which sits just
            under the compact patient header (top-[60px] + ~93px height).
            self-start prevents the grid from stretching it to full row height. */}
        <div className="col-span-4 space-y-4 self-start sticky top-[160px] max-h-[calc(100vh-176px)] overflow-y-auto scrollbar-subtle pr-1 -mr-1">
          <div data-tour="quick-order">
            <QuickOrderPanel patient={patient} onOrderPlaced={handleQuickOrderPlaced} onViewOrder={onViewOrder} />
          </div>

          {/* Bookings — past + upcoming labs for this patient */}
          <div ref={bookingsRef}>
            <PatientBookingsCard
              patient={patient}
              isSokha={isSokha}
              justPlaced={justPlacedBooking}
              glow={bookingGlow}
              onReorder={(b) => {
                const newId = `KO-${b.mrn.split("-")[1]}-${Math.floor(Math.random() * 9000 + 1000)}`;
                handleQuickOrderPlaced({ ...b, id: newId, status: "scheduled", when: "just now", flagged: 0 });
              }}
            />
          </div>

          {/* Follow up — patient outreach prompt with clear CTA */}
          {isSokha && (
            <div className="rounded-xl border border-line bg-surface p-4">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1.5">
                <Send size={11} /> Follow up
              </div>
              <p className="text-[12px] text-ink-2 leading-relaxed mb-2.5">
                HbA1c follow-up is due. Send Sokha a walk-in lab link.
              </p>
              <button className="w-full text-[11.5px] font-medium text-jade-2 hover:text-jade px-2 py-1.5 rounded-md border border-line hover:border-jade-2 transition">
                Send link via Telegram
              </button>
            </div>
          )}

          {/* Single-open accordion for secondary clinical + admin surfaces.
              Default all collapsed so the rail doesn't read like a wall of
              decisions. Doctor opens what they need. */}
          <div data-tour="meds-card" className="space-y-2">
            <RailSection
              id="medications"
              icon={<Pill size={13} className="text-jade-2" />}
              title="Medications"
              count={isSokha ? "3 suggested" : null}
              open={openRailSection === "medications"}
              onToggle={() => toggleRail("medications")}
            >
              <MedicationsCard isSokha={isSokha} />
            </RailSection>

            <RailSection
              id="diagnoses"
              icon={<ClipboardList size={13} className="text-plum" />}
              title="Diagnoses"
              count={isSokha ? "1 active · 3 suggested" : null}
              open={openRailSection === "diagnoses"}
              onToggle={() => toggleRail("diagnoses")}
            >
              <DiagnosesCard isSokha={isSokha} />
            </RailSection>

            <RailSection
              id="chart-gaps"
              icon={<AlertTriangle size={13} className="text-ink-3" />}
              title="Chart gaps"
              count="3 items"
              open={openRailSection === "chart-gaps"}
              onToggle={() => toggleRail("chart-gaps")}
            >
              <div className="space-y-3">
                <AllergiesCard knownDefault={false} />
                <AlertsCard knownDefault={false} />
                <VaccinationsCard />
              </div>
            </RailSection>

            <RailSection
              id="admin"
              icon={<CreditCard size={13} className="text-ink-3" />}
              title="Admin"
              count="Insurance"
              open={openRailSection === "admin"}
              onToggle={() => toggleRail("admin")}
            >
              <InsuranceCard patient={patient} knownDefault={false} />
            </RailSection>

            <RailSection
              id="documents"
              icon={<FileText size={13} className="text-ink-3" />}
              title="Documents"
              count={null}
              open={openRailSection === "documents"}
              onToggle={() => toggleRail("documents")}
            >
              <DocumentsCard isSokha={isSokha} />
            </RailSection>
          </div>

          {/* Secondary routing actions — hospital referral + scheduling. Two
              side-by-side bento cards that mirror the action ribbon's button
              shape (icon left, label + sub stacked right). Used less often
              than the core ribbon primitives so they sit at the rail's bottom. */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowHospitalRefer(true)}
              className="bg-surface border border-line rounded-xl p-3 flex items-center gap-2.5 hover:bg-surface-2/40 hover:border-line-2 transition text-left"
            >
              <Cross size={14} className="text-ink-2 shrink-0" />
              <div className="min-w-0">
                <div className="text-[12.5px] font-medium text-ink leading-tight">Hospital refer</div>
                <div className="text-[10px] text-ink-3 leading-tight truncate">Surgery · imaging</div>
              </div>
            </button>
            <button
              className="bg-surface border border-line rounded-xl p-3 flex items-center gap-2.5 hover:bg-surface-2/40 hover:border-line-2 transition text-left"
            >
              <Calendar size={14} className="text-ink-2 shrink-0" />
              <div className="min-w-0">
                <div className="text-[12.5px] font-medium text-ink leading-tight">Schedule</div>
                <div className="text-[10px] text-ink-3 leading-tight truncate">Cabinet · tele</div>
              </div>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

/* RailSection — single-open accordion for the right rail.
   Collapsed: thin button row (border + bg-surface) with title + count + chevron.
   Open: renders the wrapped card content directly (children have own chrome).
   Doctor sees one decision surface at a time instead of a wall of cards. */
function RailSection({ id, icon, title, count, open, onToggle, children }) {
  if (open) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded
          aria-controls={`rail-${id}`}
          className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12.5px] text-ink-3 hover:text-ink transition"
        >
          <ChevronDown size={13} className="rotate-180 shrink-0" />
          <span className="flex-1 truncate">Collapse {title.toLowerCase()}</span>
        </button>
        <div id={`rail-${id}`}>{children}</div>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={false}
      aria-controls={`rail-${id}`}
      className="w-full bg-surface border border-line rounded-xl flex items-center gap-2 px-3.5 py-2.5 text-left hover:border-ink-3 hover:bg-surface-2/30 transition"
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 text-[13px] font-medium text-ink truncate">{title}</span>
      {count && (
        <span className="text-[10.5px] text-ink-3 font-mono shrink-0">{count}</span>
      )}
      <ChevronDown size={14} className="text-ink-3 shrink-0" />
    </button>
  );
}

function PatientBookingsCard({ patient, isSokha, justPlaced, glow, onReorder }) {
  const [cancelledIds, setCancelledIds] = useState(() => new Set());
  const [editingOrder, setEditingOrder] = useState(null); // booking obj when modal is open
  const [edits, setEdits]               = useState({}); // bookingId → updated tests[] (names)
  const [showHistory, setShowHistory]   = useState(false);

  // Demo bookings: only Sokha has a history. Every other patient starts at
  // zero bookings so the panel feels honest about brand-new charts.
  const baseBookings = isSokha
    ? [
        { id: "KO-9134-3812", patient: patient.name, mrn: patient.id, tests: ["HbA1c"], route: "PSC pickup", status: "results-back", total: 8, when: "3mo ago", flagged: 0 },
      ]
    : [];

  // Prepend the just-placed booking if it isn't already in the list. The
  // pulse animation runs while justPlaced is non-null (parent clears it on a
  // timer) so the row visibly attracts the eye after the toast fires.
  const rawBookings = justPlaced && !baseBookings.some(b => b.id === justPlaced.id)
    ? [{ ...justPlaced, when: "Just now" }, ...baseBookings]
    : baseBookings;
  // Apply in-memory edits so the row reflects the saved test list.
  const bookings = rawBookings.map(b => edits[b.id] ? { ...b, tests: edits[b.id] } : b);

  // Split: active (scheduled / in-progress / just-placed) vs history (results-back / cancelled).
  // Active stays visible; history hides behind a "Previous orders" disclosure.
  const active = bookings.filter(b => {
    if (cancelledIds.has(b.id)) return false;
    return b.status === "scheduled" || b.status === "in-progress";
  });
  const history = bookings.filter(b => {
    if (cancelledIds.has(b.id)) return true;
    return b.status === "results-back";
  });

  const statusMeta = {
    "in-progress":  { label: "In progress",  color: "text-amber bg-amber-soft" },
    "scheduled":    { label: "Scheduled",    color: "text-ink-2 bg-line-2" },
    "results-back": { label: "Results back", color: "text-jade-2 bg-jade-soft" },
  };

  // Nothing to show — return null so the rail doesn't carry an empty card.
  if (active.length === 0 && history.length === 0) return null;

  const renderActiveRow = (b) => {
    const meta = statusMeta[b.status];
    const code = getBookingMeta(b, false).code;
    const isJust = justPlaced && b.id === justPlaced.id;
    const canEdit = b.status === "scheduled";
    return (
      <li key={b.id} className={`${isJust ? "booking-pulse-row " : ""}px-3 py-2.5 transition hover:bg-surface-2/40`}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-mono text-[10px] bg-line-2 px-1.5 py-0.5 rounded shrink-0 tracking-[0.06em] text-ink-2">{code}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] text-ink truncate font-medium">{b.tests.join(" · ")}</div>
            <div className="text-[10px] text-ink-3">{b.when}</div>
          </div>
          <span className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded shrink-0 ${meta.color}`}>{meta.label}</span>
        </div>
        {canEdit && (
          <div className="flex items-center gap-3 pl-[60px]">
            <button
              onClick={() => setEditingOrder(b)}
              className="text-[11px] font-medium text-jade-2 hover:text-jade hover:underline inline-flex items-center gap-1"
            >
              <Pencil size={10} /> Edit order
            </button>
            <button
              onClick={() => setCancelledIds(prev => { const next = new Set(prev); next.add(b.id); return next; })}
              className="text-[11px] text-ink-3 hover:text-crimson hover:underline"
            >
              Cancel order
            </button>
          </div>
        )}
      </li>
    );
  };

  const renderHistoryRow = (b) => {
    const isCancelled = cancelledIds.has(b.id);
    const meta = isCancelled
      ? { label: "Cancelled", color: "text-ink-3 bg-line-2" }
      : statusMeta[b.status];
    const code = getBookingMeta(b, isCancelled).code;
    return (
      <li key={b.id} className="px-3 py-2 flex items-center gap-2 hover:bg-surface-2/40 transition">
        <span className={`font-mono text-[10px] bg-line-2 px-1.5 py-0.5 rounded shrink-0 tracking-[0.06em] ${isCancelled ? "line-through text-ink-3" : "text-ink-2"}`}>{code}</span>
        <div className="flex-1 min-w-0">
          <div className={`text-[11.5px] truncate ${isCancelled ? "line-through text-ink-3" : "text-ink-2"}`}>{b.tests.join(" · ")}</div>
          <div className="text-[10px] text-ink-3">{b.when}</div>
        </div>
        <span className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded shrink-0 ${meta.color}`}>{meta.label}</span>
        {!isCancelled && b.status === "results-back" && (
          <button
            onClick={() => onReorder && onReorder(b)}
            title="Reorder same tests"
            className="text-[10.5px] text-jade-2 font-medium hover:underline shrink-0"
          >
            Reorder
          </button>
        )}
      </li>
    );
  };

  return (
    <>
      {/* Active scheduled / in-progress orders — one card surface */}
      {active.length > 0 && (
        <div className={`bg-surface border rounded-xl transition-all duration-700 ${glow ? "border-jade-2 shadow-[0_0_0_4px_var(--color-jade-soft)]" : "border-line"}`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-line-2">
            <div className="flex items-center gap-2">
              <FlaskConical size={13} className="text-jade-2" />
              <h3 className="font-display text-[14px] font-medium">Active orders</h3>
              {active.length > 1 && (
                <span className="text-[9.5px] uppercase tracking-wider text-ink-3 font-mono bg-line-2 px-1.5 py-0.5 rounded">{active.length}</span>
              )}
            </div>
          </div>
          <ul className="divide-y divide-line-2">
            {active.map(renderActiveRow)}
          </ul>
        </div>
      )}

      {/* Previous orders — collapsed by default. Only one decision surface
          visible per state. */}
      {history.length > 0 && (
        <div className="bg-surface border border-line rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowHistory(v => !v)}
            aria-expanded={showHistory}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface-2/40 transition"
          >
            <div className="flex items-center gap-2 text-[12.5px] text-ink-2">
              <span className="font-medium">Previous orders</span>
              <span className="text-[10.5px] text-ink-3">
                {history.length} {history.length === 1 ? "order" : "orders"}
              </span>
            </div>
            <ChevronDown size={13} className={`text-ink-3 transition ${showHistory ? "rotate-180" : ""}`} />
          </button>
          {showHistory && (
            <ul className="divide-y divide-line-2 border-t border-line-2">
              {history.map(renderHistoryRow)}
            </ul>
          )}
        </div>
      )}

      {editingOrder && (
        <EditBookingTestsModal
          order={editingOrder}
          onCancel={() => setEditingOrder(null)}
          onSave={(nextTests) => {
            setEdits(prev => ({ ...prev, [editingOrder.id]: nextTests.map(t => t.name) }));
            setEditingOrder(null);
          }}
        />
      )}
    </>
  );
}

/* Inline detail view shown when a booking row is expanded. Carries the most
   useful bits of the full booking detail page (progress, tests with results
   when back, quick actions) without making the doctor navigate away. */
const INLINE_RESULTS = {
  "HbA1c":         { value: "9.4",  unit: "%",     ref: "≤ 7.0",   flag: "high" },
  "Microalbumin":  { value: "34",   unit: "mg/g",  ref: "< 30",    flag: "warn" },
  "Lipid panel":   { value: "162",  unit: "mg/dL", ref: "LDL<100", flag: "warn" },
  "TSH":           { value: "0.01", unit: "mIU/L", ref: "0.5–4.5", flag: "high" },
  "Vit D, 25-OH":  { value: "22",   unit: "ng/mL", ref: "30–100",  flag: "low" },
  "CBC with diff": { value: "—",    unit: "",      ref: "panel",   flag: null  },
  "TC + LDL + HDL + TG": { value: "—", unit: "",   ref: "panel",   flag: null  },
};

function InlineBookingDetail({ booking }) {
  const showResults = booking.status === "results-back";
  const isCancellable = booking.status === "scheduled" || booking.status === "in-progress";
  const isPsc = booking.route === "PSC pickup";

  return (
    <div className="px-4 pb-3 pt-1 bg-surface-2/30">
      {/* Tests — flat list, no nested card */}
      <ul className="divide-y divide-line-2 mb-3">
        {booking.tests.map(t => {
          const r = INLINE_RESULTS[t];
          return (
            <li key={t} className="py-1.5 flex items-center gap-2 text-[12px]">
              <TestTubes size={11} className="text-jade-2 shrink-0" />
              <span className="text-ink-2 flex-1 truncate">{t}</span>
              {showResults && r && r.value !== "—" ? (
                <span className={`font-mono text-[11.5px] font-medium tnum ${
                  r.flag === "high" ? "text-crimson" :
                  r.flag === "warn" || r.flag === "low" ? "text-amber" :
                  "text-ink"
                }`}>
                  {r.value} <span className="text-[9.5px] text-ink-3 font-normal">{r.unit}</span>
                </span>
              ) : (
                <span className="text-[10px] text-ink-3">Awaiting</span>
              )}
            </li>
          );
        })}
        <li className="py-1.5 flex items-center justify-between text-[10.5px] text-ink-3">
          <span>{booking.tests.length} test{booking.tests.length === 1 ? "" : "s"} · {booking.route} · {booking.when}</span>
          <span className="font-mono">${booking.total.toFixed(2)}</span>
        </li>
      </ul>

      {/* Actions — only what's contextual: View results (results-back), Telegram reminder (PSC pre-results), Cancel */}
      <div className="flex items-center gap-1.5">
        {showResults && (
          <button className="text-[11px] bg-jade text-white px-2.5 py-1.5 rounded-md font-medium hover:opacity-90 inline-flex items-center gap-1">
            <FlaskConical size={10} /> View results
          </button>
        )}
        {!showResults && isPsc && (
          <button className="text-[11px] bg-jade text-white px-2.5 py-1.5 rounded-md font-medium hover:opacity-90 inline-flex items-center gap-1">
            <Send size={10} /> Telegram reminder
          </button>
        )}
        {isCancellable && (
          <button className="text-[11px] text-ink-3 hover:text-crimson hover:underline inline-flex items-center gap-1 ml-1">
            <X size={10} /> Cancel
          </button>
        )}
      </div>
    </div>
  );
}

/* Inline pickup detail — same idea as InlineBookingDetail. Shows the courier
   chain-of-custody + driver + tubes inline so the doctor can answer "where's
   the sample right now?" without navigating to the full pickup page. */
function InlinePickupDetail({ pickup }) {
  const tubesGuess = ({
    "P-9134": ["Purple top · EDTA · 3 mL", "Urine cup · 10 mL"],
    "P-8866": ["Gold top · SST · 5 mL"],
  })[pickup.mrn] ?? ["Purple top · EDTA · 3 mL"];

  const custody = [
    { label: "Sample drawn",           when: "today, 13:42",     who: "Dr. Sopha",     done: true },
    { label: "Pickup requested",       when: pickup.requestedAt, who: "Clinic system", done: true },
    { label: "Courier assigned",       when: pickup.status === "pending" ? "—" : "today, 13:51", who: pickup.driver, done: pickup.status !== "pending" },
    { label: "En route to clinic",     when: ["en-route","arrived","completed"].includes(pickup.status) ? "today, 14:02" : "—", who: pickup.driver, done: ["en-route","arrived","completed"].includes(pickup.status) },
    { label: "Tubes handed over",      when: ["arrived","completed"].includes(pickup.status) ? "today, 14:18" : "—", who: pickup.driver, done: ["arrived","completed"].includes(pickup.status) },
    { label: "Delivered to lab",       when: pickup.status === "completed" ? "today, 14:54" : "—", who: pickup.driver, done: pickup.status === "completed" },
  ];

  return (
    <div className="grid grid-cols-12 gap-3 pt-2">
      {/* Chain of custody — left, dominant */}
      <div className="col-span-7 rounded-md border border-line bg-surface">
        <div className="px-3 py-1.5 border-b border-line-2 text-[9.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold flex items-center gap-1.5">
          <ShieldCheck size={10} className="text-jade-2" /> Chain of custody
        </div>
        <ol className="px-3 py-2 space-y-1.5">
          {custody.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-[11.5px]">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${step.done ? "bg-jade-2 text-white" : "bg-line text-ink-3"}`}>
                {step.done ? <CheckCircle2 size={9} /> : <span className="w-1 h-1 rounded-full bg-ink-3" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className={step.done ? "text-ink-2 font-medium" : "text-ink-3"}>{step.label}</div>
                <div className="text-[10px] text-ink-3 font-mono">{step.when}{step.who && step.who !== "—" ? ` · ${step.who}` : ""}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Side: tubes + driver + actions */}
      <div className="col-span-5 space-y-2">
        <div className="rounded-md border border-line bg-surface px-3 py-2">
          <div className="text-[9.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-1.5">Tubes to transport</div>
          <ul className="space-y-1">
            {tubesGuess.map((t, i) => (
              <li key={i} className="flex items-center gap-1.5 text-[11px] text-ink-2">
                <TestTubes size={10} className="text-jade-2 shrink-0" /> {t}
              </li>
            ))}
          </ul>
        </div>

        {pickup.driver && pickup.driver !== "—" && (
          <div className="rounded-md border border-line bg-surface px-3 py-2">
            <div className="text-[9.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-1">Courier</div>
            <div className="flex items-center justify-between gap-2">
              <div className="text-[12px] text-ink-2 font-medium truncate">{pickup.driver}</div>
              {pickup.eta && pickup.eta !== "—" && (
                <span className="text-[10.5px] text-jade-2 font-medium font-mono shrink-0">ETA {pickup.eta}</span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {pickup.status !== "completed" && pickup.status !== "cancelled" && (
            <button className="text-[10.5px] bg-jade text-white px-2.5 py-1 rounded-md font-medium hover:opacity-90 inline-flex items-center gap-1">
              <Phone size={10} /> Call driver
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* Medications card — same shape as DiagnosesCard. Defaults to empty (most
   patients walk in with no meds on file), shows AI-derived prescription
   suggestions based on labs + vitals + diagnoses. Doctor selects to add. */
// Each option carries both the sigla (what doctors read on a chart) and the
// plain-English meaning (what the dropdown surfaces so it's never opaque).
const RX_FREQ_OPTIONS = [
  { value: "OD",  label: "Once daily" },
  { value: "BID", label: "Twice daily" },
  { value: "TID", label: "Three times daily" },
  { value: "QID", label: "Four times daily" },
  { value: "PRN", label: "As needed" },
];

// Parse an AI-suggested dose string into editable parts. Tolerates extra
// whitespace and accepts the canonical sigla (OD/BID/TID/QID/PRN).
function parseRxDose(dose = "") {
  const m = String(dose).match(/^(.+?)\s+(OD|BID|TID|QID|PRN)\s*$/i);
  if (m) return { strength: m[1].trim(), freq: m[2].toUpperCase() };
  return { strength: String(dose).trim(), freq: "OD" };
}

function MedicationsCard({ isSokha }) {
  const aiCandidates = useMemo(() => isSokha ? [
    { drug: "Empagliflozin", dose: "10 mg OD", class: "SGLT2i",            trigger: "A1c 9.4% · microalbumin 34", rationale: "CV + renal protection in T2DM with early nephropathy" },
    { drug: "Lisinopril",    dose: "10 mg OD", class: "ACE inhibitor",      trigger: "BP 146/92 · microalbumin 34", rationale: "HTN <130/80 + RAAS blockade slows albuminuria" },
    { drug: "Atorvastatin",  dose: "40 mg OD", class: "High-intensity statin", trigger: "LDL 162 · T2DM",          rationale: "Primary prevention · diabetic dyslipidemia gap" },
  ] : [], [isSokha]);

  // Active meds are normalised to { drug, strength, freq, class, notes } so
  // the pencil editor can edit each piece independently.
  const [active, setActive] = useState([]);
  const [editingDrug, setEditingDrug] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const remaining = aiCandidates.filter(c => !active.some(a => a.drug === c.drug));

  const addMed = (c) => {
    const parsed = parseRxDose(c.dose);
    setActive(prev => [...prev, { drug: c.drug, strength: parsed.strength, freq: parsed.freq, class: c.class, notes: "" }]);
  };
  const updateMed = (drug, patch) => setActive(prev => prev.map(m => m.drug === drug ? { ...m, ...patch } : m));
  const removeMed = (drug) => setActive(prev => prev.filter(m => m.drug !== drug));

  // Open the patient-facing Rx prescription page (mirrors the Dx prescription
  // flow): write the current prescription payload to localStorage so the new
  // tab can read it, then navigate to ?rx=<code>.
  const handleDownloadRx = () => {
    const rxCode = `KR-9134-${Math.floor(Math.random() * 9000 + 1000)}`;
    try {
      localStorage.setItem(`kura.rx.${rxCode}`, JSON.stringify({
        issuedAt: Date.now(),
        items: active.map(m => ({ drug: m.drug, strength: m.strength, freq: m.freq, class: m.class, notes: m.notes || "" })),
      }));
    } catch { /* localStorage may be unavailable in some embedded contexts */ }
    window.open(`${window.location.pathname}?rx=${encodeURIComponent(rxCode)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-surface border border-line rounded-xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line-2">
        <div className="flex items-center gap-2">
          <Pill size={13} className="text-terracotta" />
          <h3 className="font-display text-[14px] font-medium">Medications</h3>
          <span className="text-[9.5px] uppercase tracking-wider text-terracotta font-mono bg-line-2 px-1.5 py-0.5 rounded">Rx</span>
        </div>
        <button className="text-[11px] text-jade-2 font-medium hover:underline inline-flex items-center gap-1">
          <Plus size={11} /> Add
        </button>
      </div>

      {/* Active list */}
      {active.length > 0 ? (
        <ul className="divide-y divide-line-2">
          {active.map(m => {
            const isEditing = editingDrug === m.drug;
            return (
              <li key={m.drug} className={isEditing ? "bg-surface-2/40" : ""}>
                <div className="px-3 py-2 flex items-center gap-2 hover:bg-surface-2/30 group">
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-ink truncate">
                      {m.drug} <span className="font-mono text-[10.5px] text-ink-3 ml-0.5">{m.strength} {m.freq}</span>
                    </div>
                    <div className="text-[10.5px] text-ink-3 truncate">{m.class}</div>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-ink-2 bg-line-2 px-1.5 py-0.5 rounded shrink-0">
                    Active
                  </span>
                  <button
                    onClick={() => setEditingDrug(isEditing ? null : m.drug)}
                    title={isEditing ? "Close editor" : "Edit dose · frequency · notes"}
                    className={`p-0.5 transition ${isEditing ? "text-ink" : "text-ink-3 hover:text-ink opacity-0 group-hover:opacity-100"}`}
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={() => removeMed(m.drug)}
                    title="Discontinue"
                    className="text-ink-3 hover:text-crimson p-0.5 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={11} />
                  </button>
                </div>
                {isEditing && (
                  <RxMedEditRow
                    med={m}
                    onSave={(patch) => { updateMed(m.drug, patch); setEditingDrug(null); }}
                    onCancel={() => setEditingDrug(null)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="px-4 py-3 text-[11.5px] text-ink-3 leading-snug">
          {remaining.length > 0
            ? "Medication list not confirmed"
            : "No medications recorded."}
        </div>
      )}

      {/* Suggestions summary — names only, single CTA opens full review modal.
          Per-suggestion rationale + Review button live in the modal so the
          rail doesn't carry N clinical decisions at once. */}
      {remaining.length > 0 && (
        <div className="px-3 pb-3 pt-2.5 border-t border-line-2 bg-surface-2/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.14em] text-jade-2 font-semibold">
              <Sparkles size={10} /> Suggested medications
            </div>
            <span className="text-[10px] text-ink-3 font-mono">{remaining.length}</span>
          </div>
          <ul className="space-y-1 mb-2.5">
            {remaining.map(c => (
              <li key={c.drug} className="text-[11.5px] text-ink-2 leading-snug px-1.5 py-1 rounded hover:bg-surface-2/60 transition">
                <span className="font-medium text-ink">{c.drug}</span>
                <span className="font-mono text-[10.5px] text-ink-3 ml-1">{c.dose}</span>
                <div className="text-[10px] text-ink-3 font-mono mt-0.5">{c.trigger}</div>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setReviewOpen(true)}
            className="w-full text-[11.5px] font-medium text-jade-2 hover:text-jade px-2 py-1.5 rounded-md border border-line hover:border-jade-2 transition inline-flex items-center justify-center gap-1.5"
          >
            Review medications <ChevronRight size={11} />
          </button>
        </div>
      )}

      {/* Legal Rx PDF — visible once at least one med has been prescribed.
          Same pattern as Dx prescription: opens a patient-facing A4 page the
          patient can print or save-as-PDF for the pharmacy. */}
      {active.length > 0 && (
        <div className="px-3 pt-3 pb-3 border-t border-line-2">
          <button
            onClick={handleDownloadRx}
            className="w-full bg-surface border border-line rounded-md px-3 py-2.5 hover:border-ink hover:bg-surface-2/40 transition group flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-md bg-terracotta-soft text-terracotta flex items-center justify-center shrink-0">
              <FileText size={15} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-[12px] font-medium text-ink leading-tight">Download Rx prescription</div>
              <div className="text-[10.5px] text-ink-3 leading-tight mt-0.5">Legal PDF · {active.length} med{active.length === 1 ? "" : "s"} · e-signed</div>
            </div>
            <ExternalLink size={13} className="text-ink-3 group-hover:text-ink shrink-0" />
          </button>
        </div>
      )}

      {reviewOpen && (
        <MedicationsReviewModal
          candidates={remaining}
          onClose={() => setReviewOpen(false)}
          onAccept={(c) => addMed(c)}
        />
      )}
    </div>
  );
}

function MedicationsReviewModal({ candidates, onClose, onAccept }) {
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-bg border border-line rounded-xl shadow-xl w-full max-w-[560px] max-h-[85vh] flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-line-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-md bg-terracotta-soft text-terracotta flex items-center justify-center shrink-0"><Pill size={14} /></div>
            <div className="min-w-0">
              <h3 className="font-display text-[16px] font-medium leading-tight">Review medications</h3>
              <div className="text-[11px] text-ink-3 leading-tight mt-0.5">Suggestions based on recent results and chart context. Nothing is added until you confirm.</div>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-3 hover:text-ink p-1 -m-1 shrink-0"><X size={16} /></button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
          {candidates.length === 0 ? (
            <div className="text-[12.5px] text-ink-3 italic">No suggestions remaining.</div>
          ) : candidates.map(c => (
            <div key={c.drug} className="rounded-lg border border-line bg-surface px-3.5 py-3">
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <div className="text-[13.5px] font-medium text-ink">
                  {c.drug} <span className="font-mono text-[11px] text-ink-3 ml-0.5">{c.dose}</span>
                </div>
                <div className="text-[10.5px] text-ink-3 shrink-0">{c.class}</div>
              </div>
              <div className="text-[11px] text-ink-3 font-mono mb-1">Trigger: {c.trigger}</div>
              <div className="text-[12px] text-ink-2 leading-relaxed mb-3">{c.rationale}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAccept(c)}
                  className="text-[12px] font-medium bg-jade text-white px-3 py-1.5 rounded-md hover:opacity-90 inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 size={12} /> Accept and prescribe
                </button>
                <button className="text-[12px] text-ink-3 hover:text-ink hover:underline px-1">
                  Not now
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-line-2 bg-surface-2/30 text-[11px] text-ink-3 leading-snug">
          Suggestions are advisory. Confirm contraindications, allergies, and renal function before prescribing.
        </div>
      </div>
    </div>,
    document.body
  );
}

// Inline editor for a single active medication. Drug name + strength are
// free-text (so the doctor can rename "Empagliflozin" → "Dapagliflozin" or
// type a custom strength like "12.5 mg" or "1 puff"). Frequency is a fixed
// select against the canonical sigla but each option spells out the meaning
// in plain English so non-clinicians reviewing the demo aren't lost.
function RxMedEditRow({ med, onSave, onCancel }) {
  const [drug, setDrug]         = useState(med.drug);
  const [strength, setStrength] = useState(med.strength);
  const [freq, setFreq]         = useState(med.freq);
  const [notes, setNotes]       = useState(med.notes || "");
  const dirty =
    drug.trim()     !== med.drug.trim() ||
    strength.trim() !== med.strength.trim() ||
    freq            !== med.freq ||
    notes           !== (med.notes || "");

  return (
    <div className="px-3 pb-3 pt-2 border-t border-line-2/60 bg-surface-2/30">
      <div className="mb-2">
        <label className="block text-[9.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-1">Drug</label>
        <input
          value={drug}
          onChange={e => setDrug(e.target.value)}
          placeholder="e.g. Empagliflozin"
          className="w-full px-2 py-1.5 rounded-md border border-line bg-surface text-[12.5px] focus:border-ink focus:outline-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="block text-[9.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-1">Strength</label>
          <input
            value={strength}
            onChange={e => setStrength(e.target.value)}
            placeholder="e.g. 10 mg"
            className="w-full px-2 py-1.5 rounded-md border border-line bg-surface text-[12px] font-mono focus:border-ink focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[9.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-1">Frequency</label>
          <select
            value={freq}
            onChange={e => setFreq(e.target.value)}
            className="w-full px-2 py-1.5 rounded-md border border-line bg-surface text-[12px] focus:border-ink focus:outline-none"
          >
            {RX_FREQ_OPTIONS.map(f => (
              <option key={f.value} value={f.value}>{f.value} · {f.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mb-2.5">
        <label className="block text-[9.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-1">Notes · sig <span className="text-ink-3 normal-case">(optional)</span></label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="e.g. Take with food. Avoid in pregnancy."
          className="w-full px-2 py-1.5 rounded-md border border-line bg-surface text-[12px] focus:border-ink focus:outline-none"
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        <button onClick={onCancel} className="text-[11.5px] px-2.5 py-1 rounded-md border border-line bg-surface text-ink-2 hover:border-ink">Cancel</button>
        <button
          onClick={() => onSave({ drug: drug.trim() || med.drug, strength: strength.trim() || med.strength, freq, notes: notes.trim() })}
          disabled={!dirty || !strength.trim() || !drug.trim()}
          className={`text-[11.5px] px-2.5 py-1 rounded-md font-medium inline-flex items-center gap-1 ${
            dirty && strength.trim() && drug.trim() ? "bg-jade text-white hover:opacity-90" : "bg-line text-ink-3 cursor-not-allowed"
          }`}
        >
          <CheckCircle2 size={11} /> Save
        </button>
      </div>
    </div>
  );
}

// Code 128 barcode renderer — used in the mobile-scan method so the user
// can point a webcam at the screen and test the linking flow without printing.
function Barcode128({ value, height = 40 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !value) return;
    try {
      JsBarcode(ref.current, value, {
        format: "CODE128",
        displayValue: false,
        height,
        margin: 0,
        width: 1.4,
        background: "#FFFFFF",
        lineColor: "#15201A",
      });
    } catch (e) { /* invalid value — ignore */ }
  }, [value, height]);
  return <svg ref={ref} className="w-full" />;
}

// Webcam barcode scanner modal — uses BarcodeDetector (polyfilled on Linux Chrome / Firefox).
// Accepts any virgin Kura sticker (12-digit, clinic prefix 26), rejects unknown formats and
// IDs already used in this order.
function BarcodeScannerModal({ onClose, onScanned, usedIds = [] }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("starting"); // 'starting' | 'scanning' | 'no-camera' | 'unsupported' | 'linked' | 'duplicate' | 'unknown'
  const [lastDetected, setLastDetected] = useState("");

  // Kura sticker format: clinic prefix 26 + 10 digits = 12 numeric chars total.
  const KURA_STICKER_RE = /^26\d{10}$/;

  useEffect(() => {
    let cancelled = false;
    let stream = null;
    let rafId = null;
    let stopped = false;

    const stop = () => {
      cancelled = true;
      stopped = true;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      if (stream) {
        try { stream.getTracks().forEach(t => t.stop()); } catch (e) {}
        stream = null;
      }
      const v = videoRef.current;
      if (v) {
        try { v.pause(); } catch (e) {}
        v.srcObject = null;
      }
    };

    (async () => {
      if (!("BarcodeDetector" in window)) {
        setStatus("unsupported");
        return;
      }
      let s;
      try {
        s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch (err) {
        console.error("[scanner] getUserMedia failed:", err);
        if (!cancelled) setStatus("no-camera");
        return;
      }
      if (cancelled) {
        s.getTracks().forEach(t => t.stop());
        return;
      }
      stream = s;
      const video = videoRef.current;
      if (!video) {
        s.getTracks().forEach(t => t.stop());
        return;
      }
      video.srcObject = stream;
      // Wait for the video to have enough data; avoids the "play interrupted" race.
      await new Promise(resolve => {
        if (video.readyState >= 2) return resolve();
        const onReady = () => { video.removeEventListener("canplay", onReady); resolve(); };
        video.addEventListener("canplay", onReady, { once: true });
        setTimeout(resolve, 1500); // safety: don't hang forever
      });
      if (cancelled) return;
      try {
        if (video.paused) await video.play();
      } catch (err) {
        // play() can throw AbortError if React re-mounts mid-setup — safe to ignore.
      }
      if (cancelled) return;
      setStatus("scanning");

      // Native BarcodeDetector — Code 128 plus a few common formats for fallback.
      const supported = await window.BarcodeDetector.getSupportedFormats?.() ?? [];
      const formats = ["code_128", "code_39", "ean_13", "ean_8", "qr_code"].filter(f => supported.length === 0 || supported.includes(f));
      const detector = new window.BarcodeDetector({ formats });

      const tick = async () => {
        if (cancelled || stopped) return;
        try {
          const barcodes = await detector.detect(video);
          if (cancelled || stopped) return;
          if (barcodes.length > 0) {
            const text = barcodes[0].rawValue;
            setLastDetected(text);
            if (!KURA_STICKER_RE.test(text)) {
              setStatus("unknown");
              setTimeout(() => { if (!cancelled && !stopped) setStatus("scanning"); }, 1500);
            } else if (usedIds.includes(text)) {
              setStatus("duplicate");
              setTimeout(() => { if (!cancelled && !stopped) setStatus("scanning"); }, 1500);
            } else {
              stopped = true;
              setStatus("linked");
              setTimeout(() => { if (!cancelled) onScanned(text); }, 500);
              return;
            }
          }
        } catch (e) { /* detect throws on no-frame transient — ignore */ }
        if (!cancelled && !stopped) rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    })();

    return stop;
  }, [onScanned, usedIds]);

  const statusMap = {
    "starting":    { label: "Starting camera…",                                                       color: "text-ink-3"  },
    "scanning":    { label: "Point camera at the Kura sticker",                                        color: "text-ink-2"  },
    "no-camera":   { label: "Camera blocked — check permissions",                                      color: "text-amber"  },
    "unsupported": { label: "Browser doesn't support BarcodeDetector",                                 color: "text-amber"  },
    "linked":      { label: `✓ Sticker accepted · ${lastDetected}`,                                    color: "text-jade-2" },
    "duplicate":   { label: `✗ ${lastDetected} already used in this order`,                            color: "text-crimson"},
    "unknown":     { label: `✗ ${lastDetected || "Unknown"} — not a Kura sticker`,                     color: "text-amber"  },
  };
  const s = statusMap[status];
  const cameraBlocked = status === "no-camera" || status === "unsupported";

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-ink/60 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-line-2">
          <div className="flex items-center gap-2">
            <ScanLine size={14} className="text-jade-2" />
            <h3 className="font-display text-[15px] font-medium">Scan tube barcode</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md hover:bg-surface-2 text-ink-3 flex items-center justify-center"><X size={14} /></button>
        </div>

        <div className="aspect-square bg-ink relative overflow-hidden">
          <video ref={videoRef} className="w-full h-full object-cover -scale-x-100" muted playsInline autoPlay />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`w-3/4 h-24 border-2 rounded-md transition-colors ${
              status === "linked"    ? "border-jade-2"  :
              status === "duplicate" ? "border-crimson" :
              status === "unknown"   ? "border-amber"   :
                                       "border-jade-soft/80"
            }`}>
              <div className="relative h-full overflow-hidden">
                <div className="absolute inset-x-0 h-px bg-jade-2/80 top-1/2 -translate-y-1/2 scan-line" />
              </div>
            </div>
          </div>
          {cameraBlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/70 text-white text-[12px] text-center px-4">
              <div>
                <AlertTriangle size={20} className="mx-auto mb-2 text-amber" />
                {status === "unsupported"
                  ? <>This browser doesn't support BarcodeDetector.<br/>Try Chrome / Edge, or use Simulate scan below.</>
                  : "Camera blocked or unavailable."}
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-line-2 bg-surface-2/40 text-center">
          <div className={`text-[12px] font-medium ${s.color}`}>{s.label}</div>
        </div>

        <div className="px-4 py-2.5 border-t border-line-2 bg-surface flex items-center justify-between">
          <span className="text-[10.5px] text-ink-3">Don't have a sticker? Use a demo scan.</span>
          <button
            onClick={() => {
              // Generate a fresh virgin Kura ID that isn't already in use.
              let id;
              do { id = generateSampleId(); } while (usedIds.includes(id));
              onScanned(id);
            }}
            className="text-[11px] text-ink-2 px-2.5 py-1 rounded-md border border-line hover:border-ink"
          >
            Simulate scan
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Tube manifest by test name — drives the "tubes needed" surface for clinic draws.
const TUBE_FOR_TEST = {
  "HbA1c":                        { tube: "Purple top · EDTA",        volume: "3 mL",  dot: "bg-plum" },
  "Lipid panel":                  { tube: "Gold top · SST",           volume: "5 mL",  dot: "bg-amber" },
  "Comprehensive metabolic panel":{ tube: "Gold top · SST",           volume: "5 mL",  dot: "bg-amber" },
  "Microalbumin":                 { tube: "Urine cup · sterile",      volume: "10 mL", dot: "bg-jade-2" },
  "CBC with diff":                { tube: "Purple top · EDTA",        volume: "3 mL",  dot: "bg-plum" },
  "TSH":                          { tube: "Gold top · SST",           volume: "3 mL",  dot: "bg-amber" },
  "Vitamin D, 25-OH":             { tube: "Gold top · SST",           volume: "3 mL",  dot: "bg-amber" },
  "Urinalysis":                   { tube: "Urine cup · sterile",      volume: "10 mL", dot: "bg-jade-2" },
};

function tubesForTests(items) {
  // Group selected tests by tube type so the doctor draws the minimum number of vials.
  const grouped = {};
  for (const t of items) {
    const spec = TUBE_FOR_TEST[t.name];
    if (!spec) continue;
    const key = spec.tube;
    if (!grouped[key]) grouped[key] = { tube: spec.tube, volume: spec.volume, dot: spec.dot, tests: [] };
    grouped[key].tests.push(t.name);
  }
  return Object.values(grouped);
}

// Friendly booking code: 2 letters + 5 digits, no ambiguous chars (no I, O, 0, 1).
function generateFriendlyCode() {
  const letters = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const digits  = "23456789";
  const pick = (set, n) => Array.from({ length: n }, () => set[Math.floor(Math.random() * set.length)]).join("");
  return pick(letters, 2) + pick(digits, 5);
}

// Short alphanumeric code for the shipper hand-off (4 chars).
function generateShortCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// 12-digit Code-128 sample IDs — Kura clinic prefix 26 + 10-digit sequential.
// Format mirrors what real labs print on Code 128 specimen labels.
function generateSampleId() {
  const prefix = "26";
  const body = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("");
  return prefix + body;
}

function QuickOrderPanel({ patient, onClose, onOrderPlaced, onViewOrder }) {
  const isSokha = patient.id === "P-9134";

  // Suggestion groups — driven by the patient's primary problems.
  // For Sokha (T2DM, HTN, dyslipidemia) the suggested-for-her group surfaces first.
  const suggested = isSokha
    ? [
        { id: "hba1c",   name: "HbA1c",            price: 8,  hint: "Due for glycemic control" },
        { id: "lipid",   name: "Lipid panel",      price: 18, hint: "LDL was 162" },
        { id: "microalb",name: "Microalbumin",     price: 12, hint: "Follow up nephropathy risk" },
        { id: "cmp",     name: "Metabolic panel",  price: 15, hint: "Check liver and renal function" },
      ]
    : [
        { id: "lipid",   name: "Lipid panel",      price: 18, hint: "Annual screening" },
        { id: "hba1c",   name: "HbA1c",            price: 8,  hint: "Diabetes screening" },
      ];
  const common = [
    { id: "cbc",     name: "CBC with diff",         price: 9 },
    { id: "tsh",     name: "TSH",                   price: 12 },
    { id: "vit-d",   name: "Vitamin D, 25-OH",      price: 22 },
    { id: "urinaly", name: "Urinalysis",            price: 6 },
  ];

  const [selected, setSelected] = useState(() => new Set());
  const [query, setQuery] = useState("");
  const [route, setRoute] = useState("clinic"); // 'psc' | 'clinic' — Home draw lives in the telehealth context, not here
  const [phase, setPhase] = useState("cart"); // 'cart' | 'route' | 'placed-psc' | 'placed-clinic-needs-pickup' | 'placed-clinic-pickup-done'
  const [orderId, setOrderId] = useState(null);
  const [bookingCode, setBookingCode] = useState(null); // for PSC
  const [bookingCopied, setBookingCopied] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null); // remember the order obj so we can navigate to its detail view
  const [pickupCode, setPickupCode] = useState(null);   // for clinic post-pickup
  const [pickupUrgent, setPickupUrgent] = useState(false);
  const [sampleIds, setSampleIds] = useState([]);          // pre-generated IDs (non-scan methods)
  const [labelMethod, setLabelMethod] = useState("mobile-scan");
  const [tubeScans, setTubeScans] = useState({});          // tubeIndex → scanned sticker ID (scan method)
  const [scannerOpenFor, setScannerOpenFor] = useState(null);
  const [mobileScanView, setMobileScanView] = useState("scan"); // 'scan' | 'ship' — step 2 vs step 3 view
  const [thermalView, setThermalView] = useState("setup"); // 'setup' | 'ship' — print labels vs pickup
  const [thermalPrinterLinked, setThermalPrinterLinked] = useState(false); // demo: clinic has a thermal printer linked
  const [thermalPrinted, setThermalPrinted] = useState(false); // labels have been sent to the printer
  const [selectedPickup, setSelectedPickup] = useState("regular"); // 'regular' | 'urgent'
  const [shipToast, setShipToast] = useState(null); // transient "labeling done" confirmation

  // PSC payment incentive — higher conversion when patient has skin in the game
  const [pscPayWhen, setPscPayWhen] = useState("now");      // 'now' | 'later' (at PSC counter)
  const [pscPayMethod, setPscPayMethod] = useState("cash"); // 'cash' | 'khqr' — only when paying now

  // Cash-confirm modal — friction step before the doctor commits to having
  // collected paper cash at the clinic. Reconciliation depends on this being
  // a deliberate yes/no, not a one-tap autopilot.
  const [confirmCashOpen, setConfirmCashOpen] = useState(false);

  // Auto-dismiss the ship-ready toast after 3.5s
  useEffect(() => {
    if (!shipToast) return;
    const t = setTimeout(() => setShipToast(null), 3500);
    return () => clearTimeout(t);
  }, [shipToast]);

  // Catalog fallback — when the user searches for something not in the
  // suggested/common groups, surface real matches from LAB_CATALOG so the
  // panel can actually find every test Kura offers (e.g. "egfr" → Creatinine
  // + eGFR). Items are normalised to the suggested shape and excluded if
  // already present in suggested/common.
  const catalogMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const existingNames = new Set([...suggested, ...common].map(t => t.name.toLowerCase()));
    return LAB_CATALOG
      .filter(t =>
        (t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q))
        && !existingNames.has(t.name.toLowerCase())
      )
      .slice(0, 8)
      .map(t => ({
        id: `cat-${t.code.toLowerCase()}`,
        name: t.name,
        price: t.price.usd,
        hint: t.category,
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const all = [...suggested, ...common, ...catalogMatches];

  const filtered = (group) => {
    if (!query.trim()) return group;
    const q = query.toLowerCase();
    return group.filter(t => t.name.toLowerCase().includes(q));
  };
  const toggle = (id) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const items = all.filter(t => selected.has(t.id));
  const total = items.reduce((sum, t) => sum + t.price, 0);

  const placeOrder = () => {
    const newId = `KO-${patient.id.split("-")[1]}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const routeLabel = route === "clinic" ? "In-clinic draw" : "PSC pickup";
    const newOrder = {
      id: newId,
      patient: patient.name,
      mrn: patient.id,
      tests: items.map(t => t.name),
      route: routeLabel,
      status: "scheduled",
      total,
      when: "today",
      flagged: 0,
    };
    setOrderId(newId);
    setPlacedOrder(newOrder);
    if (route === "psc") {
      setBookingCode(generateFriendlyCode());
      setPhase("placed-psc");
      // PSC: order is committed the moment the slip is sent.
      if (onOrderPlaced) onOrderPlaced(newOrder);
    } else {
      // Clinic: order isn't "placed" yet — defer onOrderPlaced (toast + Bookings row)
      // until the doctor confirms tubes are ready for pickup in requestPickup().
      const tubeCount = tubesForTests(items).length;
      setSampleIds(Array.from({ length: tubeCount }, () => generateSampleId()));
      setTubeScans({});
      setMobileScanView("scan");
      setThermalView("setup");
      setThermalPrinted(false);
      setSelectedPickup("regular");
      setPhase("placed-clinic-needs-pickup");
    }
  };

  const requestPickup = (urgent) => {
    setPickupCode(generateShortCode());
    setPickupUrgent(urgent);
    setPhase("placed-clinic-pickup-done");
    if (placedOrder && onOrderPlaced) onOrderPlaced(placedOrder);
  };

  const tubes = tubesForTests(items);

  // PSC placed state
  if (phase === "placed-psc") {
    const patientPhone = "+855 12 ••• 4471";
    const pscAddress = "55 St. 178 · BKK1, Phnom Penh";
    const pscDistance = "1.2 km";
    const firstName = patient.name.split(" ")[0];

    const paymentLine = pscPayWhen === "later"
      ? { icon: <Banknote size={11} />,  text: "Patient pays at PSC counter",     tone: "text-ink-3"  }
      : pscPayMethod === "cash"
        ? { icon: <Banknote size={11} />, text: `Cash collected · $${total.toFixed(2)}`, tone: "text-jade-2" }
        : { icon: <QrCode  size={11} />,  text: `KHQR sent · $${total.toFixed(2)}`,      tone: "text-jade-2" };

    return (
      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-line-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-jade-2" />
            <h3 className="font-display text-[15px] font-medium">Sent to PSC</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md hover:bg-surface-2 text-ink-3 flex items-center justify-center"><X size={14} /></button>
        </div>

        <div className="px-4 py-4">
          <div className="rounded-lg border border-jade-2 bg-jade-soft/40 px-4 py-5 text-center">
            <CheckCircle2 size={26} className="text-jade-2 mx-auto mb-2" />
            <div className="text-[10.5px] uppercase tracking-[0.14em] text-jade-2 font-semibold mb-1">Booking code</div>
            <button
              onClick={() => openMobileBooking(bookingCode)}
              className="font-mono text-[26px] font-medium tracking-[0.14em] text-ink leading-none mb-1 hover:text-jade-2 transition inline-flex items-center gap-1.5"
              title="Preview as patient (mobile)"
            >
              {bookingCode} <ExternalLink size={12} className="text-ink-3" />
            </button>
            <div className="text-[10.5px] text-jade-2 mb-2">
              <button onClick={() => openMobileBooking(bookingCode)} className="hover:underline inline-flex items-center gap-1">
                Preview as patient on mobile →
              </button>
            </div>
            <div className="text-[11.5px] text-ink-2 leading-snug">
              Sent to <span className="font-medium">{firstName}</span> · <span className="font-mono text-[10.5px]">{patientPhone}</span>
            </div>
            <div className="text-[10.5px] text-ink-3 mt-1.5 inline-flex items-center justify-center gap-1 leading-snug">
              <MapPin size={10} /> <span>Closest · <span className="font-mono">{pscAddress}</span> · <span className="text-jade-2 font-mono">{pscDistance}</span></span>
            </div>
            <div className={`text-[11px] mt-2.5 inline-flex items-center gap-1.5 ${paymentLine.tone}`}>
              {paymentLine.icon} {paymentLine.text}
            </div>
            <div className="text-[10px] text-ink-3 mt-3 leading-snug">
              Booking link includes directions and pre-test prep for the selected tests.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Clinic post-place: 5 labeling methods to compare, then pickup
  if (phase === "placed-clinic-needs-pickup") {
    const methods = [
      { id: "mobile-scan", icon: <ScanLine size={13} />, label: "Scan" },
      { id: "thermal",     icon: <Printer size={13} />,  label: "Barcode" },
    ];

    const Pickup = () => {
      // Scheduled sweep model — Kura courier swings through every cabinet on a
      // fixed daily route (like a milkman). No dispatch, no per-call urgency,
      // no upcharge. Doctor just sees when the next sweep will hit.
      return (
        <>
          <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-1.5">Ship to lab</div>
          <div className="rounded-md border border-jade-2 bg-jade-soft/40 p-3 mb-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-md bg-jade text-white flex items-center justify-center shrink-0">
                <Motorbike size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium text-ink">Next sweep · <span className="font-mono">14:15 – 14:30</span></div>
                <div className="text-[10.5px] text-ink-3 mt-0.5">Sok S. swings by your cabinet daily on the BKK1 route — just leave the tubes at reception.</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => requestPickup(false)}
            className="w-full text-[12px] px-2.5 py-2 rounded-md font-medium bg-jade text-white hover:opacity-90 inline-flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 size={12} /> Confirm — tubes ready
          </button>
        </>
      );
    };

    const scannedCount = Object.keys(tubeScans).length;
    const allScanned = scannedCount === tubes.length;
    const inShipView = (labelMethod === "mobile-scan" && mobileScanView === "ship")
                    || (labelMethod === "thermal"     && thermalView === "ship");

    return (
      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-line-2">
          <div className="flex items-center gap-2">
            <FlaskConical size={14} className="text-ink-2" />
            <h3 className="font-display text-[15px] font-medium">Preparing order</h3>
            <span className="text-[9.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold bg-surface-2 border border-line/60 px-1.5 py-0.5 rounded">Not yet placed</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md hover:bg-surface-2 text-ink-3 flex items-center justify-center"><X size={14} /></button>
        </div>

        <div className="px-4 py-4">
          {/* Method picker tabs — hidden once the user is committed to a flow's ship view */}
          {!inShipView && (
            <div className="grid grid-cols-2 gap-1 mb-3">
              {methods.map(m => (
                <button
                  key={m.id}
                  onClick={() => setLabelMethod(m.id)}
                  className={`px-1 py-1.5 rounded-md border transition flex flex-col items-center gap-0.5 ${labelMethod === m.id ? "border-jade-2 bg-jade-soft text-jade-2" : "border-line text-ink-2 hover:border-ink"}`}
                >
                  {m.icon}
                  <span className={`text-[9.5px] leading-tight ${labelMethod === m.id ? "font-semibold" : ""}`}>{m.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Method D: Mobile scan — 3-step peel → stick → scan flow */}
          {labelMethod === "mobile-scan" && mobileScanView === "scan" && (
            <>
              {/* Step 1 · Peel */}
              <div className="mb-3">
                <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-1.5 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-jade text-white text-[9px] font-semibold flex items-center justify-center shrink-0">1</span>
                  Peel off <span className="font-mono">{tubes.length}</span> label{tubes.length === 1 ? "" : "s"}
                </div>
                <div className="flex items-center gap-3 pl-[22px]">
                  <svg viewBox="0 0 36 36" className="w-9 h-9 shrink-0" fill="none" aria-hidden="true">
                    {/* Sticker body */}
                    <path
                      d="M 10 4 L 26 4 Q 28 4, 28 6 L 28 24 L 22 30 L 10 30 Q 8 30, 8 28 L 8 6 Q 8 4, 10 4 Z"
                      fill="var(--color-jade-soft)" stroke="var(--color-jade-2)" strokeWidth="1.1" strokeLinejoin="round"
                    />
                    {/* Dog-ear */}
                    <path
                      d="M 28 24 L 22 24 L 22 30 Z"
                      fill="var(--color-bg)" stroke="var(--color-jade-2)" strokeWidth="1.1" strokeLinejoin="round"
                    />
                    {/* Barcode */}
                    <g stroke="var(--color-jade-2)">
                      <line x1="11.5" y1="10" x2="11.5" y2="21" strokeWidth="0.8"/>
                      <line x1="13.5" y1="10" x2="13.5" y2="21" strokeWidth="1.4"/>
                      <line x1="15.5" y1="10" x2="15.5" y2="21" strokeWidth="0.8"/>
                      <line x1="17.5" y1="10" x2="17.5" y2="21" strokeWidth="1.2"/>
                      <line x1="19.5" y1="10" x2="19.5" y2="21" strokeWidth="0.8"/>
                      <line x1="21.5" y1="10" x2="21.5" y2="21" strokeWidth="1.4"/>
                      <line x1="23.5" y1="10" x2="23.5" y2="21" strokeWidth="0.8"/>
                    </g>
                  </svg>
                  <p className="text-[11.5px] text-ink-2 leading-snug">
                    Pull the pre-printed barcode stickers off the Kura roll.
                  </p>
                </div>
              </div>

              {/* Step 2 · Stick */}
              <div className="mb-3">
                <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-1.5 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-jade text-white text-[9px] font-semibold flex items-center justify-center shrink-0">2</span>
                  Stick 1 label on each tube
                </div>
                <div className="flex items-center gap-3 pl-[22px]">
                  <svg viewBox="0 0 56 36" className="w-14 h-9 shrink-0" fill="none" aria-hidden="true">
                    <path d="M 22 4 L 22 26 Q 22 32, 28 32 Q 34 32, 34 26 L 34 4 Z" fill="var(--color-bg)" stroke="var(--color-ink-3)" strokeWidth="1"/>
                    <rect x="20" y="2" width="16" height="5" rx="1" fill="var(--color-plum)"/>
                    <rect x="18" y="14" width="20" height="9" rx="1" fill="var(--color-jade-soft)" stroke="var(--color-jade-2)" strokeWidth="0.8"/>
                    <g stroke="var(--color-jade-2)">
                      <line x1="20" y1="16" x2="20" y2="21" strokeWidth="0.6"/>
                      <line x1="22" y1="16" x2="22" y2="21" strokeWidth="1"/>
                      <line x1="24" y1="16" x2="24" y2="21" strokeWidth="0.6"/>
                      <line x1="26" y1="16" x2="26" y2="21" strokeWidth="1.2"/>
                      <line x1="28" y1="16" x2="28" y2="21" strokeWidth="0.6"/>
                      <line x1="30" y1="16" x2="30" y2="21" strokeWidth="1"/>
                      <line x1="32" y1="16" x2="32" y2="21" strokeWidth="0.6"/>
                      <line x1="34" y1="16" x2="34" y2="21" strokeWidth="1.2"/>
                      <line x1="36" y1="16" x2="36" y2="21" strokeWidth="0.6"/>
                    </g>
                    <path d="M 50 18 L 42 18 M 42 18 L 44 16 M 42 18 L 44 20" stroke="var(--color-ink-2)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-[11.5px] text-ink-2 leading-snug">
                    Apply one sticker per tube — anywhere along the side.
                  </p>
                </div>
              </div>

              {/* Step 3 · Scan */}
              <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-1.5 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-jade text-white text-[9px] font-semibold flex items-center justify-center shrink-0">3</span>
                Scan each tube to bind the ID
              </div>
              <div className="flex items-center gap-3 pl-[22px] mb-4">
                <svg viewBox="0 0 56 36" className="w-14 h-9 shrink-0" fill="none" aria-hidden="true">
                  <path d="M 4 12 L 4 6 L 10 6" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M 46 6 L 52 6 L 52 12" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M 52 24 L 52 30 L 46 30" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M 10 30 L 4 30 L 4 24" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round"/>
                  <g stroke="var(--color-ink)">
                    <line x1="9" y1="10" x2="9" y2="26" strokeWidth="1"/>
                    <line x1="11" y1="10" x2="11" y2="26" strokeWidth="1.5"/>
                    <line x1="14" y1="10" x2="14" y2="26" strokeWidth="0.8"/>
                    <line x1="17" y1="10" x2="17" y2="26" strokeWidth="1.5"/>
                    <line x1="20" y1="10" x2="20" y2="26" strokeWidth="1"/>
                    <line x1="23" y1="10" x2="23" y2="26" strokeWidth="0.8"/>
                    <line x1="26" y1="10" x2="26" y2="26" strokeWidth="1.5"/>
                    <line x1="29" y1="10" x2="29" y2="26" strokeWidth="1"/>
                    <line x1="32" y1="10" x2="32" y2="26" strokeWidth="0.8"/>
                    <line x1="35" y1="10" x2="35" y2="26" strokeWidth="1.5"/>
                    <line x1="38" y1="10" x2="38" y2="26" strokeWidth="1"/>
                    <line x1="41" y1="10" x2="41" y2="26" strokeWidth="0.8"/>
                    <line x1="44" y1="10" x2="44" y2="26" strokeWidth="1.5"/>
                    <line x1="47" y1="10" x2="47" y2="26" strokeWidth="1"/>
                  </g>
                  <line x1="4" y1="18" x2="52" y2="18" stroke="var(--color-jade-2)" strokeWidth="1.5" strokeDasharray="2 1"/>
                </svg>
                <p className="text-[11.5px] text-ink-2 leading-snug">
                  Point your webcam at each barcode to bind it to the tube.
                </p>
              </div>
              <ul className="space-y-1.5 mb-3">
                {tubes.map((t, i) => {
                  const scannedId = tubeScans[i];
                  return (
                    <li key={t.tube} className={`rounded-md border p-2.5 transition ${scannedId ? "border-jade-2 bg-jade-soft/40" : "border-line"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-3 h-3 rounded-full shrink-0 ${t.dot}`} />
                        <span className="text-[11.5px] font-medium">{t.tube}</span>
                        <span className="text-[10.5px] text-ink-3 font-mono ml-auto">{t.volume}</span>
                      </div>
                      <div className="text-[10px] text-ink-3 mb-1.5">{t.tests.join(" · ")}</div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10.5px] text-ink-3 truncate">
                          {scannedId ? <span className="text-jade-2">✓ Linked · {scannedId}</span> : "Awaiting scan"}
                        </span>
                        {scannedId ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setTubeScans(prev => { const next = { ...prev }; delete next[i]; return next; })}
                              className="text-[10.5px] px-1.5 py-1 rounded-md border border-line text-ink-3 hover:border-ink hover:text-ink inline-flex items-center gap-1"
                              title="Unbind this tube"
                            >
                              <Undo2 size={10} /> Undo
                            </button>
                            <button
                              onClick={() => { setTubeScans(prev => { const next = { ...prev }; delete next[i]; return next; }); setScannerOpenFor(i); }}
                              className="text-[10.5px] px-1.5 py-1 rounded-md border border-line text-ink-3 hover:border-ink hover:text-ink inline-flex items-center gap-1"
                              title="Rescan this tube"
                            >
                              <ScanLine size={10} /> Redo
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setScannerOpenFor(i)}
                            className="text-[11px] px-2 py-1 rounded-md bg-jade text-white inline-flex items-center gap-1 hover:opacity-90 shrink-0"
                          >
                            <ScanLine size={10} /> Scan
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* CTA — disabled until all tubes scanned */}
              <div className="mb-3">
                <button
                  onClick={() => {
                    setMobileScanView("ship");
                    setShipToast({
                      message: `${tubes.length} tube${tubes.length === 1 ? "" : "s"} bound`,
                      sub: "Pick a pickup option below — or go back to redo a scan.",
                    });
                  }}
                  disabled={!allScanned}
                  title={allScanned ? undefined : `Scan ${tubes.length - scannedCount} more tube${tubes.length - scannedCount === 1 ? "" : "s"} first`}
                  className={`w-full text-[12px] px-2.5 py-2 rounded-md font-medium inline-flex items-center justify-center gap-1.5 transition ${
                    allScanned
                      ? "bg-jade text-white hover:opacity-90"
                      : "bg-ink/15 text-ink-3 cursor-not-allowed"
                  }`}
                >
                  Continue · Ship to lab <ChevronRight size={12} />
                </button>
                {!allScanned && (
                  <p className="text-[10px] text-ink-3 text-center mt-1.5 inline-flex items-center justify-center gap-1 w-full">
                    <AlertTriangle size={10} className="text-amber" />
                    Scan {tubes.length - scannedCount} more tube{tubes.length - scannedCount === 1 ? "" : "s"} first
                  </p>
                )}
              </div>
            </>
          )}

          {/* Ship view — shipping (mobile-scan only) */}
          {labelMethod === "mobile-scan" && mobileScanView === "ship" && (
            <button
              onClick={() => setMobileScanView("scan")}
              className="text-[11px] text-ink-3 hover:text-ink inline-flex items-center gap-1 mb-3"
            >
              <ChevronLeft size={11} /> Back to step 3 · Scan tubes
            </button>
          )}

          {/* Scanner modal — accepts any virgin 12-digit Kura sticker (prefix 26) */}
          {scannerOpenFor != null && (
            <BarcodeScannerModal
              onClose={() => setScannerOpenFor(null)}
              usedIds={Object.values(tubeScans)}
              onScanned={(scannedId) => {
                setTubeScans(prev => ({ ...prev, [scannerOpenFor]: scannedId }));
                setScannerOpenFor(null);
              }}
            />
          )}

          {/* Method E: Thermal printer · setup view — mirrors Scan's 3-step layout */}
          {labelMethod === "thermal" && thermalView === "setup" && (
            <>
              {/* Step 1 · Link printer */}
              <div className="mb-3">
                <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-1.5 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-jade text-white text-[9px] font-semibold flex items-center justify-center shrink-0">1</span>
                  Link printer
                  <span className={`ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold tracking-wider ${
                    thermalPrinterLinked ? "bg-jade-soft text-jade-2" : "bg-amber-soft text-amber"
                  }`}>
                    {thermalPrinterLinked
                      ? <><CheckCircle2 size={9} /> CONNECTED</>
                      : <><AlertTriangle size={9} /> NO PRINTER</>}
                  </span>
                </div>
                <div className="flex items-center gap-3 pl-[22px]">
                  <svg viewBox="0 0 56 36" className="w-14 h-9 shrink-0" fill="none" aria-hidden="true">
                    {/* Paper tray top */}
                    <rect x="20" y="4" width="16" height="3.5" rx="0.5" fill="var(--color-bg)" stroke="var(--color-ink-3)" strokeWidth="0.8"/>
                    {/* Printer body */}
                    <rect x="14" y="7.5" width="28" height="18" rx="2" fill="var(--color-surface-2)" stroke="var(--color-ink-3)" strokeWidth="1"/>
                    {/* Display screen */}
                    <rect x="22" y="11" width="14" height="4" rx="0.5" fill={thermalPrinterLinked ? "var(--color-jade-soft)" : "var(--color-bg)"} stroke="var(--color-ink-3)" strokeWidth="0.6"/>
                    {/* Status LED */}
                    <circle cx="18" cy="13" r="1.4" fill={thermalPrinterLinked ? "var(--color-jade-2)" : "var(--color-amber)"}/>
                    {/* Output slot */}
                    <rect x="18" y="19.5" width="20" height="2" rx="0.5" fill="var(--color-ink)"/>
                    {/* Feet */}
                    <line x1="17" y1="25.5" x2="17" y2="28" stroke="var(--color-ink-3)" strokeWidth="1"/>
                    <line x1="39" y1="25.5" x2="39" y2="28" stroke="var(--color-ink-3)" strokeWidth="1"/>
                  </svg>
                  <p className="text-[11.5px] text-ink-2 leading-snug flex-1 min-w-0">
                    {thermalPrinterLinked
                      ? <span className="font-mono text-[10.5px] text-jade-2">Zebra ZT411 · USB · Ready</span>
                      : <>Connect a Zebra or Brother thermal printer.</>}
                  </p>
                  {!thermalPrinterLinked && (
                    <button
                      onClick={() => setThermalPrinterLinked(true)}
                      className="text-[10.5px] px-2 py-1 rounded-md border border-amber text-amber hover:bg-amber-soft/40 shrink-0"
                    >
                      Link printer
                    </button>
                  )}
                </div>
              </div>

              {/* Step 2 · Print labels */}
              <div className="mb-3">
                <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-1.5 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-jade text-white text-[9px] font-semibold flex items-center justify-center shrink-0">2</span>
                  Print {tubes.length} label{tubes.length === 1 ? "" : "s"}
                  {thermalPrinted && (
                    <span className="ml-auto inline-flex items-center gap-1 text-[9.5px] font-semibold tracking-wider text-jade-2">
                      <CheckCircle2 size={9} /> PRINTED
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 pl-[22px]">
                  <svg viewBox="0 0 56 36" className="w-14 h-9 shrink-0" fill="none" aria-hidden="true">
                    {/* Printer body */}
                    <rect x="14" y="3" width="28" height="13" rx="2" fill="var(--color-surface-2)" stroke="var(--color-ink-3)" strokeWidth="1"/>
                    {/* Output slot */}
                    <rect x="18" y="13" width="20" height="2" rx="0.5" fill="var(--color-ink)"/>
                    {/* Paper coming out */}
                    <rect x="20" y="16" width="16" height="16" rx="1" fill="var(--color-jade-soft)" stroke="var(--color-jade-2)" strokeWidth="0.8"/>
                    {/* Mini barcode on label */}
                    <g stroke="var(--color-jade-2)">
                      <line x1="22" y1="20" x2="22" y2="28" strokeWidth="0.6"/>
                      <line x1="24" y1="20" x2="24" y2="28" strokeWidth="1"/>
                      <line x1="26" y1="20" x2="26" y2="28" strokeWidth="0.6"/>
                      <line x1="28" y1="20" x2="28" y2="28" strokeWidth="1.2"/>
                      <line x1="30" y1="20" x2="30" y2="28" strokeWidth="0.6"/>
                      <line x1="32" y1="20" x2="32" y2="28" strokeWidth="1"/>
                      <line x1="34" y1="20" x2="34" y2="28" strokeWidth="0.6"/>
                    </g>
                  </svg>
                  <p className="text-[11.5px] text-ink-2 leading-snug">
                    Send the barcode labels to your thermal printer.
                  </p>
                </div>
              </div>

              {/* Step 3 · Stick (verbatim from Scan step 2) */}
              <div className="mb-3">
                <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-1.5 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-jade text-white text-[9px] font-semibold flex items-center justify-center shrink-0">3</span>
                  Stick 1 label on each tube
                </div>
                <div className="flex items-center gap-3 pl-[22px]">
                  <svg viewBox="0 0 56 36" className="w-14 h-9 shrink-0" fill="none" aria-hidden="true">
                    <path d="M 22 4 L 22 26 Q 22 32, 28 32 Q 34 32, 34 26 L 34 4 Z" fill="var(--color-bg)" stroke="var(--color-ink-3)" strokeWidth="1"/>
                    <rect x="20" y="2" width="16" height="5" rx="1" fill="var(--color-plum)"/>
                    <rect x="18" y="14" width="20" height="9" rx="1" fill="var(--color-jade-soft)" stroke="var(--color-jade-2)" strokeWidth="0.8"/>
                    <g stroke="var(--color-jade-2)">
                      <line x1="20" y1="16" x2="20" y2="21" strokeWidth="0.6"/>
                      <line x1="22" y1="16" x2="22" y2="21" strokeWidth="1"/>
                      <line x1="24" y1="16" x2="24" y2="21" strokeWidth="0.6"/>
                      <line x1="26" y1="16" x2="26" y2="21" strokeWidth="1.2"/>
                      <line x1="28" y1="16" x2="28" y2="21" strokeWidth="0.6"/>
                      <line x1="30" y1="16" x2="30" y2="21" strokeWidth="1"/>
                      <line x1="32" y1="16" x2="32" y2="21" strokeWidth="0.6"/>
                      <line x1="34" y1="16" x2="34" y2="21" strokeWidth="1.2"/>
                      <line x1="36" y1="16" x2="36" y2="21" strokeWidth="0.6"/>
                    </g>
                    <path d="M 50 18 L 42 18 M 42 18 L 44 16 M 42 18 L 44 20" stroke="var(--color-ink-2)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-[11.5px] text-ink-2 leading-snug">
                    Apply one sticker per tube — anywhere along the side.
                  </p>
                </div>
              </div>

              {/* Label preview list */}
              <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-1.5">Label preview</div>
              <ul className="space-y-1.5 mb-3">
                {tubes.map((t, i) => (
                  <li key={t.tube} className={`rounded-md border p-2.5 transition ${thermalPrinted ? "border-jade-2 bg-jade-soft/40" : "border-line bg-surface-2/40"}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`w-3 h-3 rounded-full shrink-0 ${t.dot}`} />
                      <span className="text-[11.5px] font-medium">{t.tube}</span>
                      <span className="text-[10.5px] text-ink-3 font-mono ml-auto">{t.volume}</span>
                    </div>
                    <div className="bg-white border border-line-2 rounded p-1.5">
                      <div className="flex gap-px h-6 mb-1 justify-center">
                        {Array.from({ length: 30 }, (_, j) => (
                          <div key={j} style={{ width: Math.random() > 0.5 ? 2 : 1, background: Math.random() > 0.3 ? "#15201A" : "transparent" }} />
                        ))}
                      </div>
                      <div className="text-[10px] font-mono text-center">{sampleIds[i] ?? "····"}</div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Single CTA — Print (simulate), then Continue · Ship to lab */}
              <div className="mb-3">
                <button
                  onClick={() => {
                    if (!thermalPrinterLinked) return;
                    if (!thermalPrinted) {
                      setThermalPrinted(true);
                      setShipToast({
                        message: `${tubes.length} label${tubes.length === 1 ? "" : "s"} printed`,
                        sub: "Stick them on the matching tubes before drawing.",
                      });
                    } else {
                      setThermalView("ship");
                    }
                  }}
                  disabled={!thermalPrinterLinked}
                  title={thermalPrinterLinked ? undefined : "Link a printer first"}
                  className={`w-full text-[12px] px-2.5 py-2 rounded-md font-medium inline-flex items-center justify-center gap-1.5 transition ${
                    thermalPrinterLinked
                      ? "bg-jade text-white hover:opacity-90"
                      : "bg-ink/15 text-ink-3 cursor-not-allowed"
                  }`}
                >
                  {!thermalPrinted
                    ? <><Printer size={12} /> Print {tubes.length} barcode label{tubes.length === 1 ? "" : "s"}</>
                    : <>Continue · Ship to lab <ChevronRight size={12} /></>}
                </button>
                {!thermalPrinterLinked && (
                  <p className="text-[10px] text-ink-3 text-center mt-1.5 inline-flex items-center justify-center gap-1 w-full">
                    <AlertTriangle size={10} className="text-amber" />
                    Link a printer to print labels and continue
                  </p>
                )}
              </div>
            </>
          )}

          {/* Method E: Thermal printer · ship view */}
          {labelMethod === "thermal" && thermalView === "ship" && (
            <button
              onClick={() => setThermalView("setup")}
              className="text-[11px] text-ink-3 hover:text-ink inline-flex items-center gap-1 mb-3"
            >
              <ChevronLeft size={11} /> Back to label setup
            </button>
          )}

          {/* Pickup section — only visible in each method's ship view */}
          {inShipView && <Pickup />}
        </div>

        {/* Transient ship-ready toast (portaled to body so stacking is reliable) */}
        {shipToast && createPortal(
          <div className="fixed bottom-6 right-6 z-[70] toast-pop">
            <div className="bg-surface border border-jade-2 rounded-lg shadow-2xl px-4 py-3 flex items-start gap-2.5 min-w-[280px] max-w-sm">
              <CheckCircle2 size={16} className="text-jade-2 mt-0.5 shrink-0" />
              <div>
                <div className="text-[12.5px] font-medium text-ink">{shipToast.message}</div>
                {shipToast.sub && <div className="text-[11px] text-ink-3 mt-0.5 leading-snug">{shipToast.sub}</div>}
              </div>
              <button onClick={() => setShipToast(null)} className="ml-auto -mr-1 -mt-1 w-5 h-5 rounded text-ink-3 hover:text-ink hover:bg-surface-2 flex items-center justify-center shrink-0">
                <X size={12} />
              </button>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // Clinic post-pickup: single success box · pickup code + ETA · view-order CTA
  if (phase === "placed-clinic-pickup-done") {
    return (
      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-line-2">
          <div className="flex items-center gap-2">
            <Motorbike size={14} className="text-jade-2" />
            <h3 className="font-display text-[15px] font-medium">Pickup scheduled</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md hover:bg-surface-2 text-ink-3 flex items-center justify-center"><X size={14} /></button>
        </div>

        <div className="px-4 py-4">
          <div className="rounded-lg border border-jade-2 bg-jade-soft/40 px-4 py-5 text-center">
            <CheckCircle2 size={26} className="text-jade-2 mx-auto mb-2" />
            {pickupUrgent ? (
              <>
                <div className="text-[10.5px] uppercase tracking-[0.14em] text-jade-2 font-semibold mb-1">Pickup code</div>
                <div className="font-mono text-[26px] font-medium tracking-[0.14em] text-ink leading-none mb-2">{pickupCode}</div>
                <div className="text-[11.5px] text-ink-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-jade-2 pulse-dot" />
                    <span className="font-mono font-medium">14:15 – 14:30</span>
                  </span>
                  <span className="text-ink-3"> · on-demand · Sok S.</span>
                </div>
                <div className="text-[10px] text-ink-3 mt-3 leading-snug">Read the code out to the rider at handoff to verify the order.</div>
              </>
            ) : (
              <>
                <div className="text-[13px] font-medium text-ink mb-1">Tubes ready for pickup</div>
                <div className="text-[11.5px] text-ink-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-jade-2 pulse-dot" />
                    <span className="font-mono font-medium">14:15 – 14:30</span>
                  </span>
                  <span className="text-ink-3"> · next sweep · Sok S.</span>
                </div>
                <div className="text-[10px] text-ink-3 mt-3 leading-snug">Leave the bagged tubes at reception — Sok collects on the BKK1 route.</div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // cart phase
  return (
    <div className="bg-surface border border-line rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line-2">
        <div className="flex items-center gap-2">
          <ShoppingCart size={14} className="text-jade-2" />
          <h3 className="font-display text-[15px] font-medium">Lab orders</h3>
          {selected.size > 0 && (
            <span className="text-[10.5px] font-mono text-jade-2 bg-jade-soft px-1.5 py-0.5 rounded">{selected.size}</span>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="w-7 h-7 rounded-md hover:bg-surface-2 text-ink-3 flex items-center justify-center">
            <X size={14} />
          </button>
        )}
      </div>

      {phase === "cart" ? (
        <>
          {/* AI suggestions take the hero spot — that's what the doctor is
              meant to scan first. Search is below as a quieter "find another
              test" secondary input. Catalog fallback (catalogMatches) kicks
              in when the query doesn't match the suggested list. */}
          <div className="px-4 py-3">
            {filtered(suggested).length > 0 && (() => {
              const visible = filtered(suggested);
              const allSelected = visible.every(t => selected.has(t.id));
              return (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[9.5px] uppercase tracking-[0.14em] text-jade-2 font-semibold inline-flex items-center gap-1.5">
                      <Sparkles size={10} /> Suggested from results
                    </div>
                    <button
                      onClick={() => setSelected(prev => {
                        const next = new Set(prev);
                        if (allSelected) {
                          visible.forEach(t => next.delete(t.id));
                        } else {
                          visible.forEach(t => next.add(t.id));
                        }
                        return next;
                      })}
                      className="text-[10.5px] font-medium text-jade-2 hover:text-jade hover:underline"
                    >
                      {allSelected ? "Clear" : "Select suggested"}
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {visible.map(t => (
                      <TestPickerRow key={t.id} test={t} selected={selected.has(t.id)} onToggle={() => toggle(t.id)} />
                    ))}
                  </ul>
                </>
              );
            })()}

            {query.trim() && catalogMatches.length > 0 && (
              <div className={filtered(suggested).length > 0 ? "mt-3" : ""}>
                <div className="text-[9.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-2 inline-flex items-center gap-1.5">
                  <FlaskConical size={10} /> From catalog
                </div>
                <ul className="space-y-1">
                  {catalogMatches.map(t => (
                    <TestPickerRow key={t.id} test={t} selected={selected.has(t.id)} onToggle={() => toggle(t.id)} />
                  ))}
                </ul>
              </div>
            )}

            {query.trim() && filtered(suggested).length === 0 && catalogMatches.length === 0 && (
              <div className="text-[12px] text-ink-3 text-center py-4">No tests match &ldquo;{query}&rdquo;.</div>
            )}
          </div>

          <div className="px-4 pb-3 border-t border-line-2 pt-3 bg-surface-2/30">
            <div className="text-[9.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-1.5">Add another test</div>
            <div className="relative">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search tests"
                className="w-full pl-7 pr-2 py-1.5 rounded-md border border-line bg-surface text-[11.5px] placeholder:text-ink-3 focus:border-ink focus:outline-none"
              />
            </div>
          </div>
        </>
      ) : (
        /* phase === "route" — show selected-tests summary at the top of the panel */
        <div className="px-4 py-3 space-y-1.5">
          <div className="text-[9.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-1">In this order</div>
          {items.map(t => (
            <div key={t.id} className="flex items-center justify-between text-[12px]">
              <span className="text-ink-2 truncate">{t.name}</span>
              <span className="font-mono text-ink-3 shrink-0 ml-2">{fmtPrice(t.price)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 py-3 border-t border-line-2 bg-surface-2/30">
        {phase === "cart" ? (
          <>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[11px] text-ink-3">{items.length} test{items.length === 1 ? "" : "s"} selected</span>
              <span className="font-mono text-[14px] font-semibold text-ink">{fmtPrice(total)}</span>
            </div>
            <button
              disabled={items.length === 0}
              onClick={() => setPhase("route")}
              className={`w-full text-[12px] py-2 rounded-md font-medium inline-flex items-center justify-center gap-1.5 transition ${items.length === 0 ? "bg-line text-ink-3 cursor-not-allowed" : "bg-jade text-white hover:opacity-90"}`}
            >
              {items.length === 0 ? "Select tests to continue" : <>Choose collection point <ArrowRight size={12} /></>}
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => setPhase("cart")} className="text-[11px] text-ink-3 hover:text-ink inline-flex items-center gap-1">
                <ArrowLeft size={11} /> Back to tests
              </button>
              <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold">Step 2 · route</span>
            </div>
            <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 mb-1.5">Route</div>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              <button
                onClick={() => setRoute("clinic")}
                className={`text-left px-2.5 py-2 rounded-md border transition ${route === "clinic" ? "border-jade-2 bg-jade-soft" : "border-line hover:border-ink"}`}
              >
                <div className={`flex items-center gap-1.5 text-[11.5px] font-medium ${route === "clinic" ? "text-jade-2" : "text-ink"}`}>
                  <RouteIcon left={<Motorbike size={12} />} right={<TestTubes size={12} />} />
                  Draw in clinic
                </div>
                <div className="text-[10px] text-ink-3 mt-0.5 leading-snug">You draw · Kura shipper picks up sample</div>
              </button>
              <button
                onClick={() => setRoute("psc")}
                className={`text-left px-2.5 py-2 rounded-md border transition ${route === "psc" ? "border-jade-2 bg-jade-soft" : "border-line hover:border-ink"}`}
              >
                <div className={`flex items-center gap-1.5 text-[11.5px] font-medium ${route === "psc" ? "text-jade-2" : "text-ink"}`}>
                  <RouteIcon left={<PersonStanding size={13} />} right={<FileText size={11} />} />
                  Send to PSC
                </div>
                <div className="text-[10px] text-ink-3 mt-0.5 leading-snug">Slip + QR sent to patient phone</div>
              </button>
            </div>

            {route === "psc" && (
              <div className="rounded-md border border-jade-soft bg-jade-soft/40 p-2.5 mb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Banknote size={11} className="text-jade-2" />
                  <span className="text-[10.5px] uppercase tracking-[0.14em] text-jade-2 font-semibold">Charge patient</span>
                </div>
                <div className="grid grid-cols-2 gap-1 mb-2">
                  <button
                    onClick={() => setPscPayWhen("now")}
                    className={`text-left px-2 py-1.5 rounded-md border text-[10.5px] transition ${pscPayWhen === "now" ? "border-jade-2 bg-surface text-jade-2 font-medium" : "border-line/60 text-ink-2 hover:border-ink"}`}
                  >
                    <div className="flex items-center gap-1.5">
                      Pay now
                      <span className="text-[8.5px] uppercase tracking-wider font-semibold text-jade bg-jade-soft px-1 py-0.5 rounded ml-auto">Recommended</span>
                    </div>
                    <div className="text-[9px] text-ink-3 mt-0.5 leading-tight">+40% show-up rate</div>
                  </button>
                  <button
                    onClick={() => setPscPayWhen("later")}
                    className={`text-left px-2 py-1.5 rounded-md border text-[10.5px] transition ${pscPayWhen === "later" ? "border-jade-2 bg-surface text-jade-2 font-medium" : "border-line/60 text-ink-2 hover:border-ink"}`}
                  >
                    <div>Pay later</div>
                    <div className="text-[9px] text-ink-3 mt-0.5 leading-tight">At PSC counter</div>
                  </button>
                </div>
                {pscPayWhen === "now" && (
                  <>
                    <div className="text-[9.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-1 mt-2">Method</div>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => setPscPayMethod("cash")}
                        className={`text-left px-2 py-1.5 rounded-md border text-[10.5px] transition ${pscPayMethod === "cash" ? "border-jade-2 bg-surface text-jade-2 font-medium" : "border-line/60 text-ink-2 hover:border-ink"}`}
                      >
                        <div className="flex items-center gap-1"><Banknote size={10}/> Cash</div>
                        <div className="text-[9px] text-ink-3 mt-0.5 leading-tight">Collected at clinic now</div>
                      </button>
                      <button
                        onClick={() => setPscPayMethod("khqr")}
                        className={`text-left px-2 py-1.5 rounded-md border text-[10.5px] transition ${pscPayMethod === "khqr" ? "border-jade-2 bg-surface text-jade-2 font-medium" : "border-line/60 text-ink-2 hover:border-ink"}`}
                      >
                        <div className="flex items-center gap-1"><QrCode size={10}/> KHQR</div>
                        <div className="text-[9px] text-ink-3 mt-0.5 leading-tight">Sent to patient via Telegram</div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[11px] text-ink-3">{items.length} test{items.length === 1 ? "" : "s"} · {route === "clinic" ? "In-clinic draw" : "PSC pickup"}</span>
              <span className="font-mono text-[14px] font-semibold text-ink">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => {
                // PSC + Pay now + Cash → interrupt with a confirm-collection
                // modal so the doctor reads it. Anything else goes straight through.
                if (route === "psc" && pscPayWhen === "now" && pscPayMethod === "cash") {
                  setConfirmCashOpen(true);
                } else {
                  placeOrder();
                }
              }}
              className="w-full text-[12px] py-2 rounded-md font-medium inline-flex items-center justify-center gap-1.5 bg-jade text-white hover:opacity-90 transition"
            >
              {route === "clinic"
                ? <><Droplet size={12} /> Draw blood</>
                : <><Send size={12} /> Send to PSC</>}
            </button>
          </>
        )}
      </div>

      {confirmCashOpen && (
        <CashConfirmModal
          amount={total}
          patientName={patient.name}
          onCancel={() => setConfirmCashOpen(false)}
          onConfirm={() => { setConfirmCashOpen(false); placeOrder(); }}
        />
      )}
    </div>
  );
}

/* Friction confirm — fires only when the doctor selected PSC + Pay now +
   Cash. Reconciliation between what the doctor reports vs. what shows up
   in the till is critical, so we make them read a yes/no rather than
   one-tap through a $0–$80 cash claim. */
function CashConfirmModal({ amount, patientName, onCancel, onConfirm }) {
  const firstName = (patientName || "the patient").split(" ")[0];
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm" onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} className="bg-bg border border-line rounded-xl shadow-xl w-full max-w-[400px] overflow-hidden">
        <div className="px-5 py-4 border-b border-line-2 bg-amber-soft/60 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-amber text-white flex items-center justify-center"><Banknote size={16} /></div>
          <div>
            <h3 className="font-display text-[15px] font-medium leading-tight">Confirm cash payment</h3>
            <div className="text-[10.5px] text-ink-3 uppercase tracking-[0.14em] font-semibold">Records to reconciliation log</div>
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="text-[13px] text-ink-2 leading-relaxed mb-3">
            Have you collected <span className="font-display text-[15px] text-ink font-medium tnum">${amount.toFixed(2)}</span> in cash from <span className="font-medium text-ink">{firstName}</span>?
          </p>
          <div className="rounded-md border border-line-2 bg-surface-2/40 px-3 py-2 text-[11px] text-ink-3 leading-snug">
            If not collected, the PSC can collect payment at sample collection.
          </div>
        </div>
        <div className="px-5 py-3 border-t border-line-2 bg-surface-2/30 grid grid-cols-2 gap-2">
          <button onClick={onCancel} className="text-[12.5px] py-2 rounded-md border border-line bg-surface text-ink-2 hover:border-ink font-medium">
            Not collected
          </button>
          <button onClick={onConfirm} className="text-[12.5px] py-2 rounded-md bg-jade text-white hover:opacity-90 font-medium inline-flex items-center justify-center gap-1.5">
            <CheckCircle2 size={12} /> Mark ${amount.toFixed(2)} collected
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function fmtPrice(n) {
  // Clinical price chrome — drop trailing .00 so $8 reads cleaner than $8.00
  // in a tight rail. Keep cents when the price isn't a whole dollar (e.g. $8.50).
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`;
}

function TestPickerRow({ test, selected, onToggle }) {
  return (
    <li>
      <button
        onClick={onToggle}
        title={test.hint ? `Why suggested: ${test.hint}` : undefined}
        className={`w-full text-left px-2.5 py-2 rounded-md border transition flex items-start gap-2 ${selected ? "border-jade-2 bg-jade-soft/40" : "border-line hover:border-line-2 hover:bg-surface-2/40"}`}
      >
        <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${selected ? "border-jade-2 bg-jade-2" : "border-line"}`}>
          {selected && <CheckCircle2 size={10} className="text-white" />}
        </span>
        <span className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[12px] font-medium text-ink truncate">{test.name}</div>
            <span className="font-mono text-[11px] text-ink-3 shrink-0">{fmtPrice(test.price)}</span>
          </div>
          {test.hint && (
            <div className="text-[10px] text-ink-3 leading-tight mt-0.5 truncate">{test.hint}</div>
          )}
        </span>
      </button>
    </li>
  );
}

function DocumentsCard({ isSokha }) {
  // Imaging / diagnostic studies — the PDF is the source of truth; the row is
  // just a pointer. Compact list, neutral styling, click opens the doc.
  const docs = isSokha ? [
    { kind: "ECG", label: "Resting 12-lead ECG",         date: "8mo ago",  pages: 2 },
    { kind: "XR",  label: "Chest PA · AP",                date: "11mo ago", pages: 1 },
    { kind: "US",  label: "Abdominal · liver + kidneys",  date: "6mo ago",  pages: 4 },
  ] : [];

  return (
    <div className="bg-surface border border-line rounded-xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line-2">
        <div className="flex items-center gap-2">
          <FileText size={13} className="text-ink-3" />
          <h3 className="font-display text-[14px] font-medium">Documents</h3>
          {docs.length > 0 && (
            <span className="text-[9.5px] uppercase tracking-wider text-ink-3 font-mono bg-line-2 px-1.5 py-0.5 rounded">{docs.length}</span>
          )}
        </div>
        <button className="text-[11px] text-jade-2 font-medium hover:underline inline-flex items-center gap-1">
          <Plus size={11} /> Upload
        </button>
      </div>
      {docs.length === 0 ? (
        <div className="px-4 py-3 text-[11.5px] text-ink-3 leading-snug">
          No imaging or diagnostic studies on file.
        </div>
      ) : (
        <ul className="divide-y divide-line-2">
          {docs.map((d, i) => (
            <li key={i}>
              <button
                onClick={() => openDocumentPdf(d.kind)}
                title="Open PDF in a new tab"
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-surface-2/40 transition group"
              >
                <span className="font-mono text-[10px] text-ink-2 bg-line-2 px-1.5 py-0.5 rounded shrink-0 tracking-[0.06em]">{d.kind}</span>
                <span className="flex-1 text-[11.5px] text-ink-2 truncate">{d.label}</span>
                <span className="text-[10px] text-ink-3 font-mono shrink-0">{d.date}</span>
                <ExternalLink size={11} className="text-ink-3 opacity-60 group-hover:opacity-100 transition shrink-0" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* Diagnoses · ICD-10 card. Defaults to empty — when the AI engine sees labs/
   vitals/history, it surfaces ICD-10 suggestions the doctor can add with one
   click. Doctor stays in control: nothing is auto-added to the chart. */
function DiagnosesCard({ isSokha }) {
  // AI-derived candidate codes — what the rules engine would propose for this
  // patient based on their labs and vitals. For non-Sokha patients we show
  // nothing (real-world default). The first item starts confirmed for Sokha
  // since T2DM is on her chart already.
  const aiCandidates = useMemo(() => isSokha ? [
    { code: "I10",    label: "Essential (primary) hypertension",            trigger: "BP 146/92 · 3 visits",     confidence: "high" },
    { code: "E78.5",  label: "Hyperlipidemia, unspecified",                  trigger: "LDL 162 mg/dL",            confidence: "high" },
    { code: "N18.3",  label: "Chronic kidney disease, stage 3",              trigger: "Microalbumin 34 · eGFR borderline", confidence: "low" },
  ] : [], [isSokha]);

  // Seed with confirmed T2DM for Sokha so the "1 active" surface has truth in it.
  const [active, setActive] = useState(() => isSokha ? [
    { code: "E11.65", label: "Type 2 diabetes mellitus with hyperglycemia", status: "active" },
  ] : []);
  const [reviewOpen, setReviewOpen] = useState(false);

  const remaining = aiCandidates.filter(c => !active.some(a => a.code === c.code));

  const addCode = (c) => setActive(prev => [...prev, { ...c, status: "active" }]);
  const removeCode = (code) => setActive(prev => prev.filter(c => c.code !== code));

  return (
    <div className="bg-surface border border-line rounded-xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line-2">
        <div className="flex items-center gap-2">
          <ClipboardList size={13} className="text-plum" />
          <h3 className="font-display text-[14px] font-medium">Diagnoses</h3>
          <span className="text-[9.5px] uppercase tracking-wider text-plum font-mono bg-line-2 px-1.5 py-0.5 rounded">ICD-10</span>
        </div>
        <button className="text-[11px] text-jade-2 font-medium hover:underline inline-flex items-center gap-1">
          <Plus size={11} /> Add
        </button>
      </div>

      {/* Active codes — neutral "Active" pill (no crimson; red is reserved
          for risk + abnormal values). */}
      {active.length > 0 ? (
        <ul className="divide-y divide-line-2">
          {active.map(p => (
            <li key={p.code} className="px-3 py-2 flex items-center gap-2 hover:bg-surface-2/30 group">
              <span className="font-mono text-[10px] text-plum bg-line-2 px-1.5 py-0.5 rounded shrink-0">{p.code}</span>
              <span className="flex-1 text-[11.5px] text-ink-2 truncate" title={p.label}>{p.label}</span>
              <span className="text-[9px] uppercase tracking-wider font-semibold text-ink-2 bg-line-2 px-1.5 py-0.5 rounded shrink-0">
                Active
              </span>
              <button
                onClick={() => removeCode(p.code)}
                title="Remove"
                className="text-ink-3 hover:text-crimson p-0.5 opacity-0 group-hover:opacity-100 transition"
              >
                <X size={11} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-4 py-3 text-[11.5px] text-ink-3 leading-snug">
          {remaining.length > 0
            ? "No active diagnoses confirmed"
            : "No diagnoses on file."}
        </div>
      )}

      {/* Suggestions summary — code + label only, single CTA opens full
          review modal. Per-suggestion reasoning lives in the modal. */}
      {remaining.length > 0 && (
        <div className="px-3 pb-3 pt-2.5 border-t border-line-2 bg-surface-2/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.14em] text-jade-2 font-semibold">
              <Sparkles size={10} /> Suggested diagnoses
            </div>
            <span className="text-[10px] text-ink-3 font-mono">{remaining.length}</span>
          </div>
          <ul className="space-y-1 mb-2.5">
            {remaining.map(c => (
              <li key={c.code} className="flex items-center gap-1.5 px-1.5 py-1 text-[11.5px] rounded hover:bg-surface-2/60 transition">
                <span className="font-mono text-[10px] text-plum bg-line-2 px-1.5 py-0.5 rounded shrink-0">{c.code}</span>
                <span className="text-ink-2 truncate">{c.label}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setReviewOpen(true)}
            className="w-full text-[11.5px] font-medium text-jade-2 hover:text-jade px-2 py-1.5 rounded-md border border-line hover:border-jade-2 transition inline-flex items-center justify-center gap-1.5"
          >
            Review diagnoses <ChevronRight size={11} />
          </button>
        </div>
      )}

      {reviewOpen && (
        <DiagnosesReviewModal
          candidates={remaining}
          onClose={() => setReviewOpen(false)}
          onAccept={(c) => addCode(c)}
        />
      )}
    </div>
  );
}

function DiagnosesReviewModal({ candidates, onClose, onAccept }) {
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-bg border border-line rounded-xl shadow-xl w-full max-w-[560px] max-h-[85vh] flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-line-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-md bg-plum/10 text-plum flex items-center justify-center shrink-0"><ClipboardList size={14} /></div>
            <div className="min-w-0">
              <h3 className="font-display text-[16px] font-medium leading-tight">Review diagnoses</h3>
              <div className="text-[11px] text-ink-3 leading-tight mt-0.5">Suggestions based on recent results and chart context. Nothing is added until you confirm.</div>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-3 hover:text-ink p-1 -m-1 shrink-0"><X size={16} /></button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
          {candidates.length === 0 ? (
            <div className="text-[12.5px] text-ink-3 italic">No suggestions remaining.</div>
          ) : candidates.map(c => (
            <div key={c.code} className="rounded-lg border border-line bg-surface px-3.5 py-3">
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <div className="text-[13.5px] font-medium text-ink leading-tight">
                  <span className="font-mono text-[11px] text-plum bg-line-2 px-1.5 py-0.5 rounded mr-1.5 align-middle">{c.code}</span>
                  {c.label}
                </div>
                <div className="text-[10.5px] text-ink-3 shrink-0 capitalize">{c.confidence} confidence</div>
              </div>
              <div className="text-[11.5px] text-ink-3 font-mono mb-3">Trigger: {c.trigger}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAccept(c)}
                  className="text-[12px] font-medium bg-jade text-white px-3 py-1.5 rounded-md hover:opacity-90 inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 size={12} /> Confirm diagnosis
                </button>
                <button className="text-[12px] text-ink-3 hover:text-ink hover:underline px-1">
                  Not now
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-line-2 bg-surface-2/30 text-[11px] text-ink-3 leading-snug">
          Suggestions are advisory. Confirm clinical history and rule-out alternatives before coding.
        </div>
      </div>
    </div>,
    document.body
  );
}

/* All three right-rail context cards (Allergies / Insurance / Alerts) default
   to `unknown` — the real-world starting state for any new patient. A small
   "demo: switch case" link at the bottom flips to the populated demo data so
   stakeholders can see both shapes. */
function AllergiesCard({ knownDefault = false }) {
  const [state, setState] = useState(knownDefault ? "known" : "unknown");
  return (
    <div className="bg-surface border border-line rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle size={13} className="text-crimson" />
          <h3 className="font-display text-[14px] font-medium">Allergies</h3>
          {state === "unknown" && (
            <span className="text-[9.5px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-line-2 text-ink-3">unknown</span>
          )}
        </div>
        <button className="text-[11px] text-jade-2 font-medium hover:underline inline-flex items-center gap-1">
          <Plus size={11} /> Add
        </button>
      </div>
      {state === "unknown" ? (
        <div className="text-[11.5px] text-ink-3 leading-snug">Not on file — capture at next visit.</div>
      ) : (
        <div className="text-[12px] text-ink-2">
          <span className="font-medium text-crimson">Sulfa drugs</span>
          <span className="text-ink-3"> · rash · moderate</span>
        </div>
      )}
      <div className="mt-2 pt-1.5 border-t border-line-2 text-right">
        <button onClick={() => setState(s => s === "unknown" ? "known" : "unknown")} className="text-[10px] text-ink-3 hover:text-ink underline-offset-2 hover:underline">
          demo: switch case ({state})
        </button>
      </div>
    </div>
  );
}

function InsuranceCard({ patient, knownDefault = false }) {
  const [state, setState] = useState(knownDefault ? "known" : "unknown");
  return (
    <div className="bg-surface border border-line rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CreditCard size={13} className="text-jade-2" />
          <h3 className="font-display text-[14px] font-medium">Insurance · claims</h3>
          {state === "unknown" && (
            <span className="text-[9.5px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-line-2 text-ink-3">self-pay</span>
          )}
        </div>
        {state === "unknown" && (
          <button className="text-[11px] text-jade-2 font-medium hover:underline inline-flex items-center gap-1">
            <Plus size={11} /> Add
          </button>
        )}
      </div>
      {state === "unknown" ? (
        <div className="text-[11.5px] text-ink-3 leading-snug">No insurer on file.</div>
      ) : (
        <>
          <div className="text-[12px] text-ink-2 mb-2">
            <span className="font-medium">{patient?.insurance || "Forte"}</span>
            <span className="text-ink-3"> · member 4471-9134-2</span>
          </div>
          <div className="space-y-1.5 text-[11.5px]">
            <div className="flex justify-between"><span className="text-ink-2">Last claim</span><span className="text-amber">Pending · 2d</span></div>
            <div className="flex justify-between"><span className="text-ink-2">YTD billed</span><span className="tnum">$284.50</span></div>
            <div className="flex justify-between"><span className="text-ink-2">YTD paid</span><span className="tnum text-jade">$236.00</span></div>
          </div>
        </>
      )}
      <div className="mt-2 pt-1.5 border-t border-line-2 text-right">
        <button onClick={() => setState(s => s === "unknown" ? "known" : "unknown")} className="text-[10px] text-ink-3 hover:text-ink underline-offset-2 hover:underline">
          demo: switch case ({state})
        </button>
      </div>
    </div>
  );
}

function AlertsCard({ knownDefault = false }) {
  const [state, setState] = useState(knownDefault ? "known" : "unknown");
  return (
    <div className="bg-surface border border-line rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Bell size={13} className="text-amber" />
          <h3 className="font-display text-[14px] font-medium">Alerts</h3>
          <span className="text-[10.5px] text-ink-3 font-mono">{state === "known" ? 3 : 0}</span>
        </div>
      </div>
      {state === "unknown" ? (
        <div className="text-[11.5px] text-ink-3 leading-snug">Needs labs, vitals &amp; meds to surface rules.</div>
      ) : (
        <ul className="space-y-2 text-[11.5px]">
          <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-crimson mt-1.5 shrink-0" /><span className="text-ink-2">A1c trending up 4 quarters · consider SGLT2i</span></li>
          <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber mt-1.5 shrink-0" /><span className="text-ink-2">Annual eye exam overdue · refer ophtho</span></li>
          <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber mt-1.5 shrink-0" /><span className="text-ink-2">Metformin refill in 18 days</span></li>
        </ul>
      )}
      <div className="mt-2 pt-1.5 border-t border-line-2 text-right">
        <button onClick={() => setState(s => s === "unknown" ? "known" : "unknown")} className="text-[10px] text-ink-3 hover:text-ink underline-offset-2 hover:underline">
          demo: switch case ({state})
        </button>
      </div>
    </div>
  );
}

function VaccinationsCard() {
  // Prototype: cycle through three states with the demo link at the bottom.
  // States represent HBsAg test outcomes that drive the Hep-B recommendation.
  const [state, setState] = useState("unknown"); // 'unknown' | 'vaccinated' | 'non-vaccinated'

  const cycle = () => {
    setState(s => s === "unknown" ? "vaccinated" : s === "vaccinated" ? "non-vaccinated" : "unknown");
  };

  return (
    <div className="bg-surface border border-line rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Syringe size={13} className="text-jade-2" />
          <h3 className="font-display text-[14px] font-medium">Vaccinations</h3>
          {state === "unknown" && (
            <span className="text-[9.5px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-line-2 text-ink-3">unscreened</span>
          )}
          {state === "vaccinated" && (
            <span className="text-[9.5px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-jade-soft text-jade-2">ok</span>
          )}
          {state === "non-vaccinated" && (
            <span className="text-[9.5px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-crimson-soft text-crimson">susceptible</span>
          )}
        </div>
        {state === "unknown" && (
          <button className="text-[11px] text-jade-2 font-medium hover:underline inline-flex items-center gap-1">
            <FlaskConical size={11} /> Order HBsAg
          </button>
        )}
        {state === "non-vaccinated" && (
          <button className="text-[11px] text-jade-2 font-medium hover:underline inline-flex items-center gap-1">
            <Syringe size={11} /> Order vaccine
          </button>
        )}
      </div>

      <div className="text-[11.5px] flex items-center gap-1.5">
        <span className="text-ink-2 font-medium">Hep B</span>
        <span className="text-ink-3">·</span>
        {state === "unknown" && (
          <span className="text-ink-3">HBsAg not on file</span>
        )}
        {state === "vaccinated" && (
          <span className="text-ink-3">HBsAg negative · 3 mo ago</span>
        )}
        {state === "non-vaccinated" && (
          <span className="text-ink-3">HBsAg positive · 3 mo ago</span>
        )}
      </div>

      <div className="mt-2 pt-1.5 border-t border-line-2 text-right">
        <button onClick={cycle} className="text-[10px] text-ink-3 hover:text-ink underline-offset-2 hover:underline">
          demo: switch case ({state})
        </button>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, sub, tone, onClick, active }) {
  const toneMap = {
    jade:       "hover:bg-jade-soft hover:text-jade",
    terracotta: "hover:bg-terracotta-soft hover:text-terracotta",
    plum:       "hover:bg-line-2 hover:text-plum",
    ink:        "hover:bg-surface-2 hover:text-ink",
  };
  const activeMap = {
    jade:       "bg-jade-soft text-jade",
    terracotta: "bg-terracotta-soft text-terracotta",
    plum:       "bg-line-2 text-plum",
    ink:        "bg-surface-2 text-ink",
  };
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-md transition border ${
        active ? activeMap[tone] + " border-line" : `border-transparent text-ink-2 ${toneMap[tone]}`
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="text-left">
        <span className="block text-[12.5px] font-medium leading-tight">{label}</span>
        <span className="block text-[10px] text-ink-3 leading-tight">{sub}</span>
      </span>
    </button>
  );
}

function TierBadge({ tier }) {
  const map = {
    T1: { color: "text-jade bg-jade-soft",   label: "T1 · phone confirmed" },
    T2: { color: "text-jade bg-jade-soft",   label: "T2 · ID verified" },
    T3: { color: "text-amber bg-amber-soft", label: "T3 · cold" },
  };
  const m = map[tier] || map.T3;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${m.color}`}>
      <ShieldCheck size={9} /> {m.label}
    </span>
  );
}

function EncounterRow({ encounter }) {
  const iconMap = {
    lab:   { icon: <FlaskConical size={12} />, color: "text-jade-2 bg-jade-soft" },
    visit: { icon: <Stethoscope size={12} />,  color: "text-ink bg-line-2" },
    rx:    { icon: <Pill size={12} />,         color: "text-terracotta bg-terracotta-soft" },
    claim: { icon: <Banknote size={12} />,     color: "text-plum bg-line-2" },
    tele:  { icon: <Video size={12} />,        color: "text-jade-2 bg-jade-soft" },
  };
  const m = iconMap[encounter.icon] || iconMap.visit;
  return (
    <li className="px-4 py-2.5 flex items-center gap-3 hover:bg-surface-2/30">
      <span className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${m.color}`}>{m.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] text-ink">{encounter.label}</div>
        <div className="text-[11px] text-ink-3 truncate">{encounter.detail}</div>
      </div>
      <span className="text-[10.5px] text-ink-3 tabular-nums shrink-0">{encounter.date}</span>
      {encounter.flag === "warn" && <span className="w-1.5 h-1.5 rounded-full bg-amber shrink-0" />}
      <ChevronRight size={13} className="text-ink-3 shrink-0" />
    </li>
  );
}

function RxWriterPanel({ onClose, meds, allergies }) {
  const [drug, setDrug] = useState("");
  const suggestions = ["Empagliflozin 10mg", "Empagliflozin 25mg", "Dapagliflozin 10mg", "Sitagliptin 100mg"]
    .filter(s => !drug || s.toLowerCase().includes(drug.toLowerCase()));
  return (
    <div className="bg-surface border border-terracotta rounded-xl mb-4">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line-2 bg-terracotta-soft">
        <div className="flex items-center gap-2">
          <Pill size={14} className="text-terracotta" />
          <h3 className="font-display text-[15px] font-medium text-terracotta">Write prescription</h3>
          <span className="text-[10.5px] uppercase tracking-wider text-ink-3">Phase 1: PDF for any pharmacy</span>
        </div>
        <button onClick={onClose} className="text-ink-3 hover:text-ink"><X size={14} /></button>
      </div>
      <div className="p-4 grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1.5">Drug</label>
          <input
            value={drug}
            onChange={e => setDrug(e.target.value)}
            placeholder="Search formulary…"
            className="w-full px-3 py-2 rounded-md border border-line bg-surface text-[13px] focus:border-ink focus:outline-none mb-2"
          />
          {drug && (
            <ul className="border border-line-2 rounded-md mb-3 max-h-32 overflow-auto">
              {suggestions.slice(0, 4).map(s => (
                <li key={s} className="px-3 py-2 text-[12.5px] hover:bg-surface-2 cursor-pointer border-b border-line-2 last:border-b-0">
                  {s}
                </li>
              ))}
            </ul>
          )}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1">Frequency</label>
              <select className="w-full px-2 py-1.5 rounded-md border border-line bg-surface text-[12.5px]">
                <option>OD (once daily)</option><option>BID</option><option>TID</option><option>QID</option><option>PRN</option>
              </select>
            </div>
            <div>
              <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1">Duration</label>
              <select className="w-full px-2 py-1.5 rounded-md border border-line bg-surface text-[12.5px]">
                <option>30 days</option><option>60 days</option><option>90 days</option><option>Indefinite</option>
              </select>
            </div>
            <div>
              <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1">Refills</label>
              <select className="w-full px-2 py-1.5 rounded-md border border-line bg-surface text-[12.5px]">
                <option>0</option><option>1</option><option>2</option><option>3</option><option>5</option>
              </select>
            </div>
          </div>
          <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1">Sig (instructions)</label>
          <textarea rows={2} className="w-full px-3 py-2 rounded-md border border-line bg-surface text-[12.5px]" placeholder="Take with breakfast. Hold if SGLT2i side effects…" />
          <div className="mt-3 flex items-center justify-between">
            <label className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-2">
              <input type="checkbox" className="accent-jade" /> Send to Kura pharmacy
              <span className="text-[10px] uppercase tracking-wider text-ink-3 bg-line-2 px-1.5 py-0.5 rounded">Phase 4</span>
            </label>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="text-[12px] text-ink-3 hover:text-ink px-3 py-1.5">Cancel</button>
              <button className="text-[12px] bg-terracotta text-white px-3 py-1.5 rounded-md font-medium hover:opacity-90">
                Sign &amp; PDF Rx
              </button>
            </div>
          </div>
        </div>
        <div className="col-span-5 space-y-3">
          <div className="border border-line-2 rounded-md p-3 bg-surface-2/50">
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1.5">Drug-drug interactions</div>
            <div className="text-[11.5px] text-ink-2">
              Checking against {meds.length} active medications…
              <div className="mt-1.5 inline-flex items-center gap-1 text-jade text-[11px]"><CheckCircle2 size={11} /> No major interactions detected</div>
            </div>
          </div>
          <div className="border border-line-2 rounded-md p-3 bg-surface-2/50">
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1.5">Allergy check</div>
            <div className="text-[11.5px] text-ink-2">
              {allergies[0]?.what !== "—" ? (
                <>Patient has known allergy: <span className="text-crimson font-medium">{allergies[0].what}</span></>
              ) : (
                <span className="text-jade inline-flex items-center gap-1"><CheckCircle2 size={11} /> No known allergies on file</span>
              )}
            </div>
          </div>
          <div className="text-[10.5px] text-ink-3 leading-relaxed">
            DDI source: First Databank (DECISION 24). Prescription PDFs and stores against the encounter; in Phase 4, "Send to Kura pharmacy" routes to dispensing &amp; delivery.
          </div>
        </div>
      </div>
    </div>
  );
}

function IcdPickerPanel({ onClose, existingProblems }) {
  const [q, setQ] = useState("");
  const catalog = [
    { code: "E11.65", label: "Type 2 diabetes mellitus with hyperglycemia" },
    { code: "E11.9",  label: "Type 2 diabetes mellitus without complications" },
    { code: "E78.5",  label: "Hyperlipidemia, unspecified" },
    { code: "E78.0",  label: "Pure hypercholesterolemia" },
    { code: "I10",    label: "Essential (primary) hypertension" },
    { code: "K76.0",  label: "Fatty (change of) liver, NEC" },
    { code: "N18.3",  label: "Chronic kidney disease, stage 3 (moderate)" },
    { code: "Z79.4",  label: "Long term (current) use of insulin" },
  ];
  const filtered = catalog.filter(c => !q || c.code.toLowerCase().includes(q.toLowerCase()) || c.label.toLowerCase().includes(q.toLowerCase()));
  const existingCodes = new Set(existingProblems.map(p => p.code));
  return (
    <div className="bg-surface border border-plum rounded-xl mb-4">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line-2 bg-line-2">
        <div className="flex items-center gap-2">
          <ClipboardList size={14} className="text-plum" />
          <h3 className="font-display text-[15px] font-medium text-plum">Add ICD-10 diagnosis</h3>
          <span className="text-[10.5px] uppercase tracking-wider text-ink-3">Attaches to encounter and claim</span>
        </div>
        <button onClick={onClose} className="text-ink-3 hover:text-ink"><X size={14} /></button>
      </div>
      <div className="p-4">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search by code or description…"
          className="w-full px-3 py-2 rounded-md border border-line bg-surface text-[13px] focus:border-ink focus:outline-none mb-3"
        />
        <ul className="space-y-1 max-h-64 overflow-auto">
          {filtered.map(c => {
            const has = existingCodes.has(c.code);
            return (
              <li key={c.code} className={`px-3 py-2 rounded-md border text-[12.5px] flex items-center gap-3 ${
                has ? "border-line-2 bg-surface-2 text-ink-3" : "border-line hover:border-ink hover:bg-surface-2 cursor-pointer"
              }`}>
                <span className="font-mono text-[11px] text-plum bg-line-2 px-1.5 py-0.5 rounded shrink-0">{c.code}</span>
                <span className="flex-1">{c.label}</span>
                {has ? (
                  <span className="text-[10px] uppercase tracking-wider text-ink-3">Already on chart</span>
                ) : (
                  <button className="text-[11px] text-jade-2 font-medium hover:underline inline-flex items-center gap-1">
                    <Plus size={10} /> Add
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        <div className="mt-3 text-[10.5px] text-ink-3 leading-relaxed">
          ICD-10 in v1 (DECISION 21) · Cambodia payers haven't moved to ICD-11. Forward-compatible mapping ready.
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CONSULTATION NOTE — AI-assisted WYSIWYG (Doctolib-style)
   - Generates a structured scaffold from patient context (labs, problems, vitals)
   - Sparkle (✨) markers prefix every AI-drafted heading so the doctor sees provenance
   - Plain contentEditable + execCommand toolbar — proto-grade, no external editor dep
   - Auto-extracted vitals & ICD-10 suggestions on the side rail
   ============================================================ */
const NOTE_TEMPLATES = [
  { id: "t2dm",     name: "T2DM follow-up",       blurb: "Chronic diabetes review · A1c + vitals" },
  { id: "htn",      name: "Hypertension review",  blurb: "BP log, medication titration, lifestyle" },
  { id: "uri",      name: "URI / cold",           blurb: "Acute viral · symptomatic management" },
  { id: "sport",    name: "Sports / school cert", blurb: "Pediatric fitness certificate" },
  { id: "annual",   name: "Annual check-up",      blurb: "Adult preventive · screening due" },
];

function scaffoldForPatient(patient, isSokha) {
  if (isSokha) {
    return `
<p><strong>✨ History of present illness</strong></p>
<p>${patient.age || "43"}yo ${patient.sex === "M" ? "male" : "female"}, T2DM since 2020, here for quarterly follow-up. Reports increasing fatigue over the past 3 weeks. Adherent to metformin 1000mg BID and gliclazide 60mg OD. Denies polyuria, polydipsia, blurred vision, chest pain, or dyspnea.</p>
<p><strong>✨ Examination</strong></p>
<p>BP <strong>146/92</strong> (elevated). HR 78, regular. Weight 82.4 kg (BMI 28.7). General appearance well. Cardiopulmonary: regular rate, no murmurs, lungs clear bilaterally. Abdomen soft, non-tender. Lower extremities: no edema, pedal pulses 2+, monofilament intact.</p>
<p><strong>✨ Labs · today</strong></p>
<p>HbA1c <strong>9.4%</strong> (from 8.4% three months ago — trending up four consecutive quarters). LDL 162 mg/dL. FPG 148.</p>
<p><strong>✨ Assessment</strong></p>
<ol>
<li>T2DM with hyperglycemia, uncontrolled — escalate therapy.</li>
<li>Essential hypertension, suboptimally controlled.</li>
<li>Hyperlipidemia.</li>
</ol>
<p><strong>✨ Plan</strong></p>
<ol>
<li>Add empagliflozin 10mg OD (SGLT2i — A1c, CV, renal benefit).</li>
<li>Increase lisinopril to 20mg OD; recheck BP in 4 weeks.</li>
<li>Continue atorvastatin 20mg; intensify if LDL &gt; 100 at 12 weeks.</li>
<li>Annual ophthalmology referral — overdue.</li>
<li>Follow-up 6 weeks with repeat A1c, BP log, fasting lipids.</li>
</ol>
<div class="personal-notes" contenteditable="true">
  <div class="personal-notes-label" contenteditable="false">Personal notes</div>
  <p><br/></p>
</div>`;
  }
  return `
<p><strong>✨ History</strong></p>
<p>${patient.age || ""}yo ${patient.sex === "M" ? "male" : "female"} presenting for ${patient.lastSeen ? "follow-up" : "consultation"}. Symptoms reviewed; no acute distress.</p>
<p><strong>✨ Examination</strong></p>
<p>General: well-appearing, afebrile. Cardiopulmonary: regular rate, lungs clear. Abdomen soft, non-tender.</p>
<p><strong>✨ Assessment</strong></p>
<p>—</p>
<p><strong>✨ Plan</strong></p>
<p>—</p>
<div class="personal-notes" contenteditable="true">
  <div class="personal-notes-label" contenteditable="false">Personal notes</div>
  <p><br/></p>
</div>`;
}

/* ============================================================
   AI SCRIBE — floating speech-to-clinical-note panel
   - Uses the browser Web Speech API (Chrome/Edge); falls back gracefully
   - Records continuously across the visit (auto-restarts on natural pauses)
   - Pause/resume/stop, live interim transcript, finalised lines accumulate
   - "Summarize → Draft note" routes a SOAP-structured draft into the
     existing ConsultationNotePanel via seedHtml
   ============================================================ */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildNoteFromTranscript(transcript, patient, isSokha) {
  const text = (transcript || "").trim();
  if (!text) {
    return scaffoldForPatient(patient, isSokha);
  }
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+|(?:\.\s)/)
    .map(s => s.trim())
    .filter(s => s.length > 1);

  const planRe       = /\b(plan|prescrib|start(ed|ing)?|increase|decrease|continue|stop|refer|follow.?up|return|recheck|order|repeat|titrate|consider|recommend|adjust|switch|add (the )?med|begin|initiate)\b/i;
  const assessmentRe = /\b(assess|diagnos|impression|condition|uncontrolled|stable|worsening|improved|likely|consistent with|suspect)\b/i;
  const labRe        = /\b(a1c|hba1c|ldl|hdl|triglycer|glucose|lipid|hemoglobin|creatinine|egfr|tsh|lab|test|result|mg\/dl|mmol)\b/i;
  const examRe       = /\b(blood pressure|\bbp\b|heart rate|\bhr\b|temperature|weight|exam|auscultat|palpat|abdomen|chest|lungs?|murmur|edema|pulse|monofilament|appearance)\b/i;
  const hpiRe        = /\b(pain|fatigue|tired|cough|fever|headache|nausea|vomit|symptom|complain|feel|since|day|week|month|onset|history|presents|reports|denies|noticed)\b/i;

  const hpi = [], exam = [], labs = [], assessment = [], plan = [], misc = [];
  sentences.forEach(s => {
    if (planRe.test(s))            plan.push(s);
    else if (assessmentRe.test(s)) assessment.push(s);
    else if (labRe.test(s))        labs.push(s);
    else if (examRe.test(s))       exam.push(s);
    else if (hpiRe.test(s))        hpi.push(s);
    else                           misc.push(s);
  });
  const hpiAll = [...hpi, ...misc];

  const para = arr => arr.length ? `<p>${arr.map(escapeHtml).join(" ")}</p>` : `<p>—</p>`;
  const list = arr => arr.length ? `<ol>${arr.map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ol>` : `<p>—</p>`;

  return `
<p><strong>✨ History of present illness</strong></p>
${para(hpiAll)}
<p><strong>✨ Examination</strong></p>
${para(exam)}
<p><strong>✨ Labs · today</strong></p>
${para(labs)}
<p><strong>✨ Assessment</strong></p>
${list(assessment)}
<p><strong>✨ Plan</strong></p>
${list(plan)}
<p><strong>✨ Source transcript</strong></p>
<blockquote style="border-left:2px solid #e5e1d6;padding:4px 10px;color:#7a7368;font-size:11.5px;font-style:italic;margin:6px 0">${escapeHtml(text)}</blockquote>
<div class="personal-notes" contenteditable="true">
  <div class="personal-notes-label" contenteditable="false">Personal notes</div>
  <p><br/></p>
</div>`;
}

function fmtMMSS(total) {
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function ScribePanel({ patient, isSokha, onClose, onDraftReady }) {
  const [supported, setSupported] = useState(true);
  const [status, setStatus] = useState("idle"); // idle | recording | paused | summarizing
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [permError, setPermError] = useState(null);
  const [minimized, setMinimized] = useState(false);
  const [lang, setLang] = useState("en-US");

  const recRef = useRef(null);
  const statusRef = useRef("idle");
  const timerRef = useRef(null);
  const transcriptScrollRef = useRef(null);

  useEffect(() => { statusRef.current = status; }, [status]);

  // Set up recognition once. Lang is updated on the live instance below.
  useEffect(() => {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;

    rec.onresult = (e) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const text = r[0].transcript;
        if (r.isFinal) finalChunk += text.trim() + ". ";
        else interimChunk += text;
      }
      if (finalChunk) {
        setTranscript(t => (t + finalChunk).replace(/\.\s*\.\s*/g, ". "));
      }
      setInterim(interimChunk);
    };

    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setPermError("Microphone permission denied. Allow access in your browser and try again.");
        setStatus("idle");
      } else if (e.error === "no-speech") {
        // expected during quiet stretches — recognition will fire onend; we restart there
      } else {
        setPermError(`Speech recognition error: ${e.error}`);
      }
    };

    rec.onend = () => {
      // Keep listening across natural pauses while user hasn't pressed Pause / Stop.
      if (statusRef.current === "recording") {
        try { rec.start(); } catch (_) { /* ignore overlapping starts */ }
      }
      setInterim("");
    };

    recRef.current = rec;
    return () => {
      try { rec.onend = null; rec.stop(); } catch (_) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync language change to the live recognizer.
  useEffect(() => {
    if (recRef.current) recRef.current.lang = lang;
  }, [lang]);

  // Timer
  useEffect(() => {
    if (status === "recording") {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  // Auto-scroll transcript
  useEffect(() => {
    const el = transcriptScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [transcript, interim]);

  const start = () => {
    setPermError(null);
    if (!recRef.current) return;
    try {
      recRef.current.start();
      setStatus("recording");
    } catch (e) {
      // start() throws if already started — treat as already-recording
      setStatus("recording");
    }
  };
  const pause = () => {
    setStatus("paused");
    try { recRef.current?.stop(); } catch (_) {}
  };
  const stop = () => {
    setStatus("idle");
    try { recRef.current?.stop(); } catch (_) {}
    setInterim("");
  };
  const reset = () => {
    stop();
    setTranscript("");
    setSeconds(0);
  };
  const summarize = () => {
    if (!transcript.trim()) return;
    setStatus("summarizing");
    try { recRef.current?.stop(); } catch (_) {}
    setTimeout(() => {
      const html = buildNoteFromTranscript(transcript, patient, isSokha);
      const motif = transcript.trim().split(/[.!?]/)[0].slice(0, 80) || "Voice-captured consultation";
      onDraftReady({ html, motif });
      setStatus("idle");
    }, 900);
  };

  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMinimized(false)}
          className="inline-flex items-center gap-2 bg-jade text-white text-[12px] px-3 py-2 rounded-full shadow-lg hover:opacity-95"
        >
          {status === "recording" && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
          <Mic size={14} />
          <span className="font-medium">
            {status === "recording" ? `Recording · ${fmtMMSS(seconds)}` : "Voice notes"}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[380px] bg-surface border border-jade rounded-xl shadow-xl overflow-hidden flex flex-col" style={{ maxHeight: "min(640px, calc(100vh - 32px))" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-line-2 bg-jade-soft/60">
        <div className="w-7 h-7 rounded-md bg-jade text-white flex items-center justify-center shrink-0">
          {status === "recording"
            ? <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            : <Mic size={13} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-[13.5px] font-medium text-ink leading-tight">Voice notes</div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-ink-3 font-semibold leading-tight">
            {status === "recording" ? `Recording · ${fmtMMSS(seconds)}` :
             status === "paused"    ? `Paused · ${fmtMMSS(seconds)}` :
             status === "summarizing" ? "Drafting note…" :
             "Speech → SOAP note"}
          </div>
        </div>
        <button
          onClick={() => setMinimized(true)}
          title="Minimize"
          className="text-ink-3 hover:text-ink p-1"
        >
          <span className="block w-3 h-px bg-current" />
        </button>
        <button onClick={onClose} title="Close" className="text-ink-3 hover:text-ink p-1 -mr-1">
          <X size={13} />
        </button>
      </div>

      {/* Body */}
      <div className="p-3 space-y-3 overflow-y-auto flex-1">
        {!supported && (
          <div className="text-[11.5px] text-terracotta bg-terracotta-soft/60 border border-terracotta-soft rounded-md p-2.5">
            Your browser doesn't support the Web Speech API. Use Chrome or Edge on desktop to capture audio.
          </div>
        )}
        {permError && supported && (
          <div className="text-[11.5px] text-terracotta bg-terracotta-soft/60 border border-terracotta-soft rounded-md p-2.5">
            {permError}
          </div>
        )}

        {status === "idle" && supported && !transcript && (
          <div className="text-[11.5px] text-ink-2 leading-snug">
            Press <span className="font-semibold text-jade-2">Start</span> and speak normally during the consultation. Kura captures the conversation continuously — pauses are fine — and structures it into a SOAP note when you stop.
            <div className="mt-2 text-[10.5px] text-ink-3">Audio stays on-device. Web Speech API · {lang === "en-US" ? "English" : lang === "fr-FR" ? "Français" : lang === "km-KH" ? "ភាសាខ្មែរ" : lang}.</div>
          </div>
        )}

        {/* Transcript */}
        {(transcript || interim || status !== "idle") && (
          <div className="border border-line rounded-md bg-surface-2/40 overflow-hidden">
            <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-line-2">
              <div className="text-[10px] uppercase tracking-[0.16em] text-ink-3 font-semibold">Live transcript</div>
              {status === "recording" && (
                <div className="flex items-end gap-1 h-3">
                  {[0, 1, 2, 3, 4].map(i => (
                    <span
                      key={i}
                      className="w-0.5 h-3 bg-jade-2 rounded-full wave-bar"
                      style={{ animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div
              ref={transcriptScrollRef}
              className="px-2.5 py-2 text-[12px] text-ink-2 leading-relaxed max-h-[220px] overflow-y-auto whitespace-pre-wrap"
            >
              {transcript || (status === "idle" && !interim
                ? <span className="text-ink-3 italic">Nothing captured yet.</span>
                : null)}
              {interim && (
                <span className="text-ink-3 italic">{transcript ? " " : ""}{interim}</span>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          {status === "idle" && (
            <button
              onClick={start}
              disabled={!supported}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-jade text-white text-[12.5px] font-medium px-3 py-2 rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mic size={13} /> {transcript ? "Resume" : "Start"}
            </button>
          )}
          {status === "recording" && (
            <>
              <button
                onClick={pause}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-surface border border-line text-ink-2 text-[12.5px] font-medium px-3 py-2 rounded-md hover:bg-surface-2"
              >
                <span className="flex gap-0.5"><span className="w-0.5 h-3 bg-current" /><span className="w-0.5 h-3 bg-current" /></span>
                Pause
              </button>
              <button
                onClick={stop}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-crimson-soft text-crimson text-[12.5px] font-medium px-3 py-2 rounded-md hover:opacity-90"
              >
                <span className="w-2.5 h-2.5 bg-current rounded-sm" />
                Stop
              </button>
            </>
          )}
          {status === "paused" && (
            <>
              <button
                onClick={start}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-jade text-white text-[12.5px] font-medium px-3 py-2 rounded-md hover:opacity-90"
              >
                <Mic size={13} /> Resume
              </button>
              <button
                onClick={stop}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-surface border border-line text-ink-2 text-[12.5px] font-medium px-3 py-2 rounded-md hover:bg-surface-2"
              >
                <span className="w-2.5 h-2.5 bg-current rounded-sm" />
                Stop
              </button>
            </>
          )}
          {status === "summarizing" && (
            <div className="flex-1 inline-flex items-center justify-center gap-2 bg-jade-soft text-jade-2 text-[12.5px] font-medium px-3 py-2 rounded-md">
              <RotateCw size={13} className="animate-spin" /> Drafting…
            </div>
          )}
        </div>

        {/* Summarize CTA */}
        {transcript && status !== "summarizing" && (
          <button
            onClick={summarize}
            className="w-full inline-flex items-center justify-center gap-2 bg-surface border border-jade text-jade-2 text-[12px] font-medium px-3 py-2 rounded-md hover:bg-jade-soft/60"
          >
            <Sparkles size={12} /> Summarize → draft note
            <ArrowRight size={12} />
          </button>
        )}

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-1 border-t border-line-2">
          <select
            value={lang}
            onChange={e => setLang(e.target.value)}
            disabled={status === "recording"}
            className="text-[10.5px] bg-transparent text-ink-3 outline-none disabled:opacity-50 cursor-pointer"
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="fr-FR">Français</option>
            <option value="km-KH">ភាសាខ្មែរ</option>
          </select>
          {transcript && (
            <button onClick={reset} className="text-[10.5px] text-ink-3 hover:text-ink underline">
              Clear &amp; start over
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ConsultationNotePanel({ onClose, patient, isSokha, seedHtml, seedMotif }) {
  const editorRef = useRef(null);
  const [motif, setMotif] = useState(seedMotif || (isSokha
    ? "T2DM quarterly follow-up + new fatigue"
    : "Follow-up consultation"));
  const [regenerating, setRegenerating] = useState(false);
  const [dictating, setDictating] = useState(false);
  const [vitals, setVitals] = useState({
    bp:     isSokha ? "146/92" : "",
    weight: isSokha ? "82.4"   : "",
    height: isSokha ? "168"    : "",
    hr:     isSokha ? "78"     : "",
  });

  // Seed the editor once. After that the browser owns the DOM —
  // we never re-write it from React (that would blow away the cursor).
  useEffect(() => {
    if (editorRef.current && !editorRef.current.dataset.seeded) {
      editorRef.current.innerHTML = seedHtml || scaffoldForPatient(patient, isSokha);
      editorRef.current.dataset.seeded = "1";
    }
  }, [patient, isSokha, seedHtml]);

  const exec = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
  };

  const regenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = scaffoldForPatient(patient, isSokha);
      }
      setRegenerating(false);
    }, 600);
  };

  return (
    <div className="bg-surface border border-jade rounded-xl mb-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-line-2 bg-jade-soft/60">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md bg-jade text-white flex items-center justify-center shrink-0">
            <Sparkles size={13} />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-[15px] font-medium text-ink leading-tight">Consultation note</h3>
            <div className="text-[10.5px] text-ink-3 uppercase tracking-[0.16em] font-semibold">AI-assisted · drafts from labs, vitals &amp; history</div>
          </div>
        </div>
        <button onClick={onClose} className="text-ink-3 hover:text-ink p-1 -m-1"><X size={14} /></button>
      </div>

      <div className="p-4 grid grid-cols-12 gap-4">
        {/* ───────── Main editor ───────── */}
        <div className="col-span-8 space-y-3">
          {/* Reason for visit */}
          <div>
            <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1.5">Reason for visit</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-line bg-surface focus-within:border-ink transition">
              <Sparkles size={12} className="text-jade-2 shrink-0" />
              <input
                value={motif}
                onChange={e => setMotif(e.target.value)}
                placeholder="One-line summary…"
                className="flex-1 text-[13px] bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1.5">Note</label>

            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-2 py-1.5 border border-line border-b-0 rounded-t-md bg-surface-2/40 flex-wrap">
              <ToolbarBtn onClick={() => exec("bold")}          title="Bold (⌘B)"><Bold size={12} /></ToolbarBtn>
              <ToolbarBtn onClick={() => exec("italic")}        title="Italic (⌘I)"><Italic size={12} /></ToolbarBtn>
              <ToolbarBtn onClick={() => exec("underline")}     title="Underline (⌘U)"><Underline size={12} /></ToolbarBtn>
              <ToolbarBtn onClick={() => exec("strikeThrough")} title="Strikethrough"><Strikethrough size={12} /></ToolbarBtn>
              <ToolbarSep />
              <ToolbarBtn onClick={() => exec("insertUnorderedList")} title="Bullet list"><List size={13} /></ToolbarBtn>
              <ToolbarBtn onClick={() => exec("insertOrderedList")}   title="Numbered list"><ListOrdered size={13} /></ToolbarBtn>
              <ToolbarSep />
              <select
                onChange={e => { exec("formatBlock", e.target.value); e.target.value = "p"; }}
                defaultValue="p"
                className="text-[11.5px] bg-transparent border-0 outline-none rounded px-1.5 py-1 hover:bg-line-2 cursor-pointer text-ink-2"
              >
                <option value="p">Normal</option>
                <option value="h2">Heading</option>
                <option value="h3">Subheading</option>
              </select>
              <div className="flex-1" />
              <ToolbarBtn
                onClick={() => setDictating(d => !d)}
                title={dictating ? "Stop dictation" : "Dictate"}
                active={dictating}
              >
                {dictating && <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" />}
                <Mic size={14} />
                <span className="text-[10.5px] font-medium">{dictating ? "Recording…" : "Dictate"}</span>
              </ToolbarBtn>
              <ToolbarBtn
                onClick={regenerate}
                title="Regenerate with AI"
                disabled={regenerating}
                accent="jade"
              >
                {regenerating ? <RotateCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                <span className="text-[10.5px] font-medium">{regenerating ? "Generating…" : "Regenerate"}</span>
              </ToolbarBtn>
            </div>

            {/* Editor surface */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              spellCheck
              className="consult-editor px-4 py-3 border border-line bg-surface text-[12.5px] text-ink-2 leading-relaxed min-h-[320px] focus:border-ink"
            />
          </div>

          {/* Provenance + actions */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-[10.5px] text-ink-3">
              <Sparkles size={10} className="text-jade-2" />
              <span>Drafted from {isSokha ? "6 prior encounters + today's labs" : "today's visit context"}. Sections marked ✨ are AI — review before signing.</span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-line-2 mt-1">
            <button onClick={onClose} className="text-[12px] text-ink-3 hover:text-ink px-3 py-1.5">
              Save draft
            </button>
            <button className="text-[12px] bg-jade text-white px-3 py-1.5 rounded-md font-medium hover:opacity-90 inline-flex items-center gap-1.5">
              <CheckCircle2 size={12} /> Sign &amp; lock
            </button>
          </div>
        </div>

        {/* ───────── Side rail ───────── */}
        <div className="col-span-4 space-y-3">
          {/* Auto-extracted vitals */}
          <div className="border border-line rounded-lg bg-surface overflow-hidden">
            <div className="p-3 space-y-2">
              <VitalField label="BP"     value={vitals.bp}     unit="mmHg" onChange={v => setVitals(s => ({ ...s, bp: v }))} />
              <VitalField label="Weight" value={vitals.weight} unit="kg"   onChange={v => setVitals(s => ({ ...s, weight: v }))} />
              <VitalField label="Height" value={vitals.height} unit="cm"   onChange={v => setVitals(s => ({ ...s, height: v }))} />
              <VitalField label="HR"     value={vitals.hr}     unit="bpm"  onChange={v => setVitals(s => ({ ...s, hr: v }))} />
            </div>
            <div className="px-3 py-2 border-t border-line-2 text-[10.5px] text-ink-3 leading-snug">
              Edit any field to override. On <span className="text-ink-2 font-medium">Sign &amp; lock</span>, values flow into the flowsheet.
            </div>
          </div>

          {/* ICD-10 suggestions */}
          <div className="border border-line rounded-lg bg-surface overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-2/40 border-b border-line-2">
              <Sparkles size={11} className="text-jade-2" />
              <div className="text-[10px] uppercase tracking-[0.16em] text-ink-3 font-semibold">Suggested codes</div>
              <span className="ml-auto text-[10px] text-jade-2">ICD-10</span>
            </div>
            <ul className="divide-y divide-line-2">
              {(isSokha
                ? [
                    { code: "E11.65", label: "T2DM with hyperglycemia" },
                    { code: "I10",    label: "Essential hypertension" },
                    { code: "E78.5",  label: "Hyperlipidemia" },
                  ]
                : [
                    { code: "Z00.00", label: "General adult exam" },
                  ]
              ).map(c => (
                <li key={c.code} className="px-3 py-2 flex items-center gap-2 hover:bg-surface-2/40 cursor-pointer">
                  <span className="font-mono text-[10px] text-plum bg-line-2 px-1.5 py-0.5 rounded shrink-0">{c.code}</span>
                  <span className="flex-1 text-[11px] text-ink-2 truncate">{c.label}</span>
                  <Plus size={11} className="text-ink-3" />
                </li>
              ))}
            </ul>
          </div>

          {/* Templates */}
          <div className="border border-line rounded-lg bg-surface overflow-hidden">
            <div className="px-3 py-2 bg-surface-2/40 border-b border-line-2">
              <div className="text-[10px] uppercase tracking-[0.16em] text-ink-3 font-semibold">Templates</div>
            </div>
            <ul className="divide-y divide-line-2">
              {NOTE_TEMPLATES.map(t => (
                <li key={t.id}>
                  <button className="w-full text-left px-3 py-2 hover:bg-surface-2/40 transition">
                    <div className="text-[11.5px] text-ink-2 font-medium">{t.name}</div>
                    <div className="text-[10.5px] text-ink-3">{t.blurb}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Scribe upsell */}
          <div className="border border-jade rounded-lg p-3 bg-jade-soft/40">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-jade font-semibold mb-1.5">
              <Mic size={11} /> Voice notes · phase 2
            </div>
            <p className="text-[11.5px] text-ink-2 leading-snug mb-2">
              Open the patient's encounter on your phone — Kura captures the conversation and structures the note in real time. You only sign.
            </p>
            <button className="text-[11px] text-jade-2 font-medium hover:underline inline-flex items-center gap-1">
              Start voice notes <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolbarBtn({ children, onClick, title, active, disabled, accent }) {
  const base = "inline-flex items-center gap-1 px-1.5 py-1 rounded text-ink-2 hover:bg-line-2 transition disabled:opacity-50 disabled:cursor-not-allowed";
  const tone = accent === "jade"
    ? "text-jade-2 hover:bg-jade-soft"
    : active
      ? "bg-jade-soft text-jade-2"
      : "";
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // keep editor selection alive
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${tone}`}
    >
      {children}
    </button>
  );
}

function ToolbarSep() {
  return <span className="w-px h-4 bg-line-2 mx-1" />;
}

function VitalField({ label, value, unit, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <Star size={11} className="text-jade-2 shrink-0" />
      <span className="text-[11px] text-ink-3 w-12 shrink-0">{label}</span>
      <input
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder="—"
        className="flex-1 min-w-0 px-2 py-1 rounded border border-line bg-surface text-[12px] font-mono tnum outline-none focus:border-ink"
      />
      <span className="text-[10.5px] text-ink-3 w-10 shrink-0">{unit}</span>
    </div>
  );
}

/* ============================================================
   BILLING & PAYMENTS — bank · KHQR · insurer panel · monthly netting · auto-pay
   ============================================================ */
function BillingView() {
  return (
    <SoonScaffold
      eyebrow="Billing & Payments"
      title="Cash, claims, lab fees — netted monthly"
      lede="The cleanest part of running a clinic shouldn't be a mystery. One settlement that shows what came in, what's pending, what Kura owes you, what you owe Kura — before money moves."
      cards={[
        { icon: <Banknote size={14} />,    tone: "jade",       title: "Net settlement",
          body: "Insurance payouts, KHQR cash, telehealth, and lab fees all net to one monthly transfer. See the math before it settles." },
        { icon: <ShieldCheck size={14} />, tone: "terracotta", title: "Bank verification → T2 unlock",
          body: "One small-deposit confirmation enables direct insurer-to-doctor disbursement. Without it, claims sit in escrow." },
        { icon: <Lock size={14} />,        tone: "plum",       title: "Auto-pay rules",
          body: "Pre-authorize what Kura can draft on settlement day (lab fees, telehealth platform). Everything else needs your sign-off." },
      ]}
      ctaTitle="Want this sooner?"
      ctaSub="Billing depends on bank verification + insurer-API wiring. We're scoping both for Phase 3. Tell us which insurer's claims hurt most today."
      ctaPrimary="Suggest an insurer"
    >
      <div>
      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-3">Cabinet · Account &amp; Settlement</div>
      <h2 className="font-display text-[26px] font-medium leading-none mb-1">Billing &amp; Payments</h2>
      <p className="text-[12.5px] text-ink-3 mb-6">
        How you pay Kura and how Kura pays you. Cash, claims, and lab fees net into one monthly settlement — see the math before it settles.
      </p>

      {/* T2 unlock banner */}
      <div className="mb-5 rounded-xl border border-amber bg-amber-soft p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-md bg-amber text-white flex items-center justify-center shrink-0">
          <Banknote size={18} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-medium text-[13.5px] text-ink">Verify your bank account to unlock T2</span>
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-amber bg-surface px-1.5 py-0.5 rounded">
              <Lock size={9} /> Currently T1
            </span>
          </div>
          <p className="text-[12px] text-ink-2 leading-snug">
            Without bank verification, Kura can't disburse insurance payouts directly to you, and monthly netting can't run. Verification typically takes 1 business day via small-deposit confirmation.
          </p>
        </div>
        <button className="text-[12px] bg-jade text-white px-3 py-1.5 rounded-md font-medium hover:opacity-90 inline-flex items-center gap-1.5 shrink-0">
          Verify bank <ArrowRight size={12} />
        </button>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* LEFT — primary surfaces */}
        <div className="col-span-8 space-y-5">
          {/* Bank + KHQR side by side */}
          <div className="grid grid-cols-2 gap-4">
            <BankCard />
            <KhqrCard />
          </div>

          {/* Insurer panel grid */}
          <div className="bg-surface border border-line rounded-xl">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-line-2">
              <div>
                <h3 className="font-display text-[16px] font-medium leading-none">Insurer paneling</h3>
                <p className="text-[11px] text-ink-3 mt-0.5">Each insurer validates you separately. T2 is per-insurer.</p>
              </div>
              <button className="text-[11.5px] text-jade-2 hover:underline inline-flex items-center gap-1">
                <Plus size={11} /> Add insurer
              </button>
            </div>
            <div>
              <InsurerRow
                name="Forte EmCare"
                khmer="ហ្វតធេ អែម-ខែរ"
                status="active"
                paneledSince="2024-08"
                expires="2026-08-12"
                claimsThisMonth={18}
                ytdPaid="$2,340"
                schedule="Net 30 · monthly batch"
              />
              <InsurerRow
                name="National Social Security Fund"
                khmer="មូលនិធិសន្តិសុខសង្គមជាតិ"
                status="pending"
                paneledSince="—"
                expires="—"
                claimsThisMonth={0}
                ytdPaid="—"
                schedule="Net 45 · weekly batch"
                pendingNote="Application submitted 2 weeks ago — awaiting MoH liaison"
              />
              <InsurerRow
                name="Self-pay (cash patients)"
                khmer="—"
                status="active"
                paneledSince="—"
                expires="—"
                claimsThisMonth={9}
                ytdPaid="$486"
                schedule="Settles via monthly netting"
                meta="Includes cabinet-drawn lab fees on cash patients"
              />
            </div>
          </div>

          {/* Monthly netting statement — the centerpiece */}
          <NettingStatement />

          {/* Settlement history */}
          <div className="bg-surface border border-line rounded-xl">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-line-2">
              <h3 className="font-display text-[16px] font-medium leading-none">Settlement history</h3>
              <button className="text-[11.5px] text-jade-2 hover:underline">Export CSV</button>
            </div>
            <div className="overflow-hidden">
              <table className="w-full text-[12px]">
                <thead className="bg-surface-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-3">
                  <tr>
                    <th className="text-left px-5 py-2 font-semibold">Period</th>
                    <th className="text-right px-3 py-2 font-semibold">Owed Kura</th>
                    <th className="text-right px-3 py-2 font-semibold">Owed by Kura</th>
                    <th className="text-right px-3 py-2 font-semibold">Net</th>
                    <th className="text-right px-3 py-2 font-semibold">Direction</th>
                    <th className="text-right px-5 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-2">
                  <SettlementRow period="Apr 2026" owe="$182" owed="$748" net="$566" direction="received" status="settled" />
                  <SettlementRow period="Mar 2026" owe="$214" owed="$612" net="$398" direction="received" status="settled" />
                  <SettlementRow period="Feb 2026" owe="$256" owed="$220" net="$36" direction="paid" status="settled" />
                  <SettlementRow period="Jan 2026" owe="$148" owed="$534" net="$386" direction="received" status="settled" />
                  <SettlementRow period="Dec 2025" owe="$98" owed="$420" net="$322" direction="received" status="settled" />
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT — config rail */}
        <div className="col-span-4 space-y-4">
          {/* Auto-pay setup */}
          <AutoPayCard />

          {/* Payment terms */}
          <div className="bg-surface border border-line rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-ink-3 font-semibold mb-2">
              <FileText size={10} /> Payment terms
            </div>
            <ul className="text-[11.5px] text-ink-2 space-y-1.5 leading-relaxed">
              <li className="flex gap-1.5"><CheckCircle2 size={12} className="text-jade shrink-0 mt-0.5" /> <span>Kura takes <span className="font-semibold">0%</span> from doctors on insurance claims</span></li>
              <li className="flex gap-1.5"><CheckCircle2 size={12} className="text-jade shrink-0 mt-0.5" /> <span>Lab fees flow at Kura wholesale rates</span></li>
              <li className="flex gap-1.5"><CheckCircle2 size={12} className="text-jade shrink-0 mt-0.5" /> <span>Monthly netting · settles 1st of each month</span></li>
              <li className="flex gap-1.5"><CheckCircle2 size={12} className="text-jade shrink-0 mt-0.5" /> <span>Auto-pay covers both directions</span></li>
              <li className="flex gap-1.5"><AlertTriangle size={12} className="text-amber shrink-0 mt-0.5" /> <span>STAT dispatch is pass-through cost</span></li>
            </ul>
            <button className="mt-3 text-[11px] text-jade-2 hover:underline inline-flex items-center gap-1">
              View full agreement <ArrowRight size={11} />
            </button>
          </div>

          {/* This month at a glance */}
          <div className="bg-surface border border-line rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-ink-3 font-semibold mb-2">
              <TrendingUp size={10} /> This month so far
            </div>
            <div className="space-y-2 text-[11.5px]">
              <Stat label="Cabinet visits billed" value="42" />
              <Stat label="Cash patients" value="11" />
              <Stat label="Insurance claims sent" value="27" />
              <Stat label="Telehealth sessions" value="4" />
              <Stat label="Directory bookings" value="6" />
            </div>
          </div>

          {/* Help */}
          <div className="rounded-xl border border-line-2 bg-surface-2 p-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-ink-3 font-semibold mb-1.5">
              <Mail size={10} /> Need help?
            </div>
            <p className="text-[11.5px] text-ink-2 leading-snug mb-2">
              Disputes pause auto-pay until resolved. Reach Kura's billing team for any line item that doesn't match your records.
            </p>
            <button className="text-[11.5px] text-jade-2 font-medium hover:underline inline-flex items-center gap-1">
              billing@kura.med <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </div>
      </div>
    </SoonScaffold>
  );
}

function BankCard() {
  return (
    <div className="bg-surface border border-line rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-line-2 text-ink-2 flex items-center justify-center">
            <Building2 size={14} />
          </div>
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3">Bank account</div>
            <div className="text-[13px] font-medium">ABA Bank · Cambodia</div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-amber bg-amber-soft px-1.5 py-0.5 rounded">
          <AlertTriangle size={9} /> Unverified
        </span>
      </div>
      <div className="hairline mb-3" />
      <div className="space-y-1.5 text-[11.5px]">
        <div className="flex justify-between">
          <span className="text-ink-3">Account holder</span>
          <span className="text-ink-2">Dr. Sopheak Chann</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-3">Account number</span>
          <span className="font-mono text-ink-2">•••• 4471</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-3">Currency</span>
          <span className="text-ink-2">USD / KHR</span>
        </div>
      </div>
      <button className="mt-3 w-full py-2 bg-jade text-white text-[12px] rounded-md font-medium hover:opacity-90 inline-flex items-center justify-center gap-1.5">
        <ShieldCheck size={12} /> Verify with small deposit
      </button>
      <p className="text-[10.5px] text-ink-3 mt-2 leading-snug">
        Two small deposits will arrive within 1–2 business days. Confirm both amounts to verify.
      </p>
    </div>
  );
}

function KhqrCard() {
  return (
    <div className="bg-surface border border-line rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-jade-soft text-jade flex items-center justify-center">
            <CreditCard size={14} />
          </div>
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3">KHQR · cabinet cash</div>
            <div className="text-[13px] font-medium">Bakong-linked</div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-jade bg-jade-soft px-1.5 py-0.5 rounded">
          <CheckCircle2 size={9} /> Active
        </span>
      </div>
      {/* QR visual */}
      <div className="bg-surface-2 border border-line-2 rounded-md p-3 flex items-center justify-center mb-3">
        <div className="w-32 h-32 bg-ink relative" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent 0 4px, rgba(255,255,255,0.85) 4px 5px), repeating-linear-gradient(90deg, transparent 0 4px, rgba(255,255,255,0.85) 4px 5px)",
        }}>
          <div className="absolute inset-3 bg-surface flex items-center justify-center">
            <div className="w-8 h-8 bg-jade rounded" />
          </div>
        </div>
      </div>
      <div className="text-[11px] text-ink-3 leading-snug mb-3">
        Patients scan with Wing, ABA, Acleda, or any KHQR-compatible app. Funds settle to your account; Kura reconciles via the booking-payment link.
      </div>
      <div className="flex gap-2">
        <button className="flex-1 py-1.5 text-[11.5px] border border-line rounded-md hover:border-ink text-ink-2">Print QR</button>
        <button className="flex-1 py-1.5 text-[11.5px] border border-line rounded-md hover:border-ink text-ink-2">Download</button>
      </div>
    </div>
  );
}

function InsurerRow({ name, khmer, status, paneledSince, expires, claimsThisMonth, ytdPaid, schedule, pendingNote, meta }) {
  const statusMap = {
    active:  { color: "text-jade bg-jade-soft",       icon: <CheckCircle2 size={9} />,  label: "Active" },
    pending: { color: "text-amber bg-amber-soft",     icon: <Clock size={9} />,         label: "Pending" },
    needs:   { color: "text-crimson bg-crimson-soft", icon: <AlertTriangle size={9} />, label: "Needs action" },
  };
  const s = statusMap[status];
  return (
    <div className="px-5 py-4 border-b border-line-2 last:border-b-0 grid grid-cols-12 gap-3 items-start">
      <div className="col-span-4">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-[13px]">{name}</span>
          <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${s.color}`}>
            {s.icon} {s.label}
          </span>
        </div>
        {khmer !== "—" && <div className="text-[11px] text-ink-3 mb-0.5">{khmer}</div>}
        <div className="text-[10.5px] text-ink-3">{schedule}</div>
        {meta && <div className="text-[10.5px] text-ink-3 italic mt-0.5">{meta}</div>}
      </div>
      <div className="col-span-3 text-[11.5px]">
        <div className="text-[10px] uppercase tracking-[0.14em] text-ink-3 mb-1">Paneled</div>
        <div className="text-ink-2">{paneledSince}</div>
        {expires !== "—" && <div className="text-[10.5px] text-ink-3 mt-0.5">expires {expires}</div>}
      </div>
      <div className="col-span-3 text-[11.5px]">
        <div className="text-[10px] uppercase tracking-[0.14em] text-ink-3 mb-1">Activity</div>
        <div className="text-ink-2 tabular-nums">{claimsThisMonth} claims · this month</div>
        <div className="text-[10.5px] text-ink-3 tabular-nums">YTD paid {ytdPaid}</div>
      </div>
      <div className="col-span-2 text-right">
        {status === "pending" ? (
          <>
            <button className="text-[11px] text-jade-2 font-medium hover:underline">View progress →</button>
            {pendingNote && <p className="text-[10.5px] text-ink-3 mt-1 italic leading-snug">{pendingNote}</p>}
          </>
        ) : (
          <button className="text-[11px] text-jade-2 hover:underline">Manage →</button>
        )}
      </div>
    </div>
  );
}

function NettingStatement() {
  // Math: 318 - 982 = -664 → Kura owes you $664
  const owedByYou = [
    { label: "Cabinet-drawn labs (cash patients)", amount: 248, count: "11 patients" },
    { label: "STAT courier dispatch fees",         amount: 35,  count: "2 STATs"     },
    { label: "Platform fees",                       amount: 35,  count: "—"           },
  ];
  const owedToYou = [
    { label: "PSC walk-in revenue share",         amount: 184, count: "8 walk-ins"   },
    { label: "Forte EmCare disbursements",        amount: 612, count: "18 claims"    },
    { label: "Telehealth session billing",        amount: 144, count: "4 sessions"   },
    { label: "Directory-booked visit revenue",    amount: 42,  count: "6 bookings"   },
  ];
  const totalOwedByYou = owedByYou.reduce((a, b) => a + b.amount, 0);
  const totalOwedToYou = owedToYou.reduce((a, b) => a + b.amount, 0);
  const net = totalOwedToYou - totalOwedByYou;
  const direction = net >= 0 ? "received" : "paid";

  return (
    <div className="bg-surface border border-jade rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-jade-soft bg-jade-soft">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.18em] text-jade font-semibold">May 2026 · running statement</div>
            <h3 className="font-display text-[18px] font-medium text-ink leading-tight mt-0.5">Monthly netting · settles June 1</h3>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-jade bg-surface px-1.5 py-0.5 rounded">
            <Activity size={9} /> Live · 23 days into period
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-line-2">
        {/* You owe Kura */}
        <div className="p-5">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold">You owe Kura</div>
            <div className="font-display text-[20px] font-medium tnum text-terracotta">${totalOwedByYou.toFixed(2)}</div>
          </div>
          <ul className="space-y-2">
            {owedByYou.map(r => (
              <li key={r.label} className="flex items-baseline justify-between text-[11.5px] gap-2">
                <span className="text-ink-2 flex-1">{r.label}</span>
                <span className="text-[10.5px] text-ink-3 tabular-nums">{r.count}</span>
                <span className="tnum text-ink-2 w-14 text-right">${r.amount}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Kura owes you */}
        <div className="p-5">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold">Kura owes you</div>
            <div className="font-display text-[20px] font-medium tnum text-jade-2">${totalOwedToYou.toFixed(2)}</div>
          </div>
          <ul className="space-y-2">
            {owedToYou.map(r => (
              <li key={r.label} className="flex items-baseline justify-between text-[11.5px] gap-2">
                <span className="text-ink-2 flex-1">{r.label}</span>
                <span className="text-[10.5px] text-ink-3 tabular-nums">{r.count}</span>
                <span className="tnum text-ink-2 w-14 text-right">${r.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Net */}
      <div className="px-5 py-4 bg-surface-2 border-t border-line-2 flex items-center justify-between gap-4">
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-0.5">Net · running</div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[28px] font-medium tnum text-jade leading-none">
              ${Math.abs(net).toFixed(2)}
            </span>
            <span className="text-[12px] text-ink-2">
              {direction === "received" ? "Kura will pay you" : "You will pay Kura"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-[11.5px] text-ink-2 px-3 py-1.5 border border-line rounded-md hover:border-ink">
            Export PDF
          </button>
          <button className="text-[11.5px] text-ink-2 px-3 py-1.5 border border-line rounded-md hover:border-ink">
            Dispute a line
          </button>
          <button className="text-[12px] bg-jade text-white px-3 py-1.5 rounded-md font-medium hover:opacity-90">
            View all line items →
          </button>
        </div>
      </div>
    </div>
  );
}

function SettlementRow({ period, owe, owed, net, direction, status }) {
  const dirMap = {
    received: { color: "text-jade",       label: "→ to you" },
    paid:     { color: "text-terracotta", label: "→ to Kura" },
  };
  const d = dirMap[direction];
  return (
    <tr className="hover:bg-surface-2/30">
      <td className="px-5 py-2.5 font-medium">{period}</td>
      <td className="px-3 py-2.5 text-right tnum text-ink-2">{owe}</td>
      <td className="px-3 py-2.5 text-right tnum text-ink-2">{owed}</td>
      <td className={`px-3 py-2.5 text-right tnum font-semibold ${d.color}`}>{net}</td>
      <td className={`px-3 py-2.5 text-right text-[10.5px] uppercase tracking-wider ${d.color}`}>{d.label}</td>
      <td className="px-5 py-2.5 text-right">
        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-jade bg-jade-soft px-1.5 py-0.5 rounded">
          <CheckCircle2 size={9} /> {status}
        </span>
      </td>
    </tr>
  );
}

function AutoPayCard() {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="bg-surface border border-line rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-ink-3 font-semibold">
          <Zap size={10} /> Auto-pay
        </div>
        <button
          onClick={() => setEnabled(e => !e)}
          className={`relative w-9 h-5 rounded-full transition ${enabled ? "bg-jade" : "bg-line"}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-surface transition ${enabled ? "left-4" : "left-0.5"}`} />
        </button>
      </div>
      <p className="text-[11.5px] text-ink-2 leading-snug mb-3">
        Single authorization that runs <span className="font-medium">both directions</span> — Kura debits when you net-owe, ACHs when Kura net-owes. One transfer per month, no manual chasing.
      </p>

      <div className={`rounded-md border p-3 mb-3 transition ${enabled ? "border-jade bg-jade-soft" : "border-line-2 bg-surface-2 opacity-60"}`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-3 font-semibold">Per-month cap</span>
          <span className="text-[12.5px] font-mono text-ink-2 tnum">$1,500</span>
        </div>
        <p className="text-[10.5px] text-ink-3 leading-snug">
          Statements above this require explicit confirmation; below auto-runs.
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-[10.5px] text-ink-3">
        <Lock size={10} /> Bank verification required to enable
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-2">{label}</span>
      <span className="font-mono tnum text-ink">{value}</span>
    </div>
  );
}

/* ============================================================
   PATIENTS LIST VIEW — search/show across panel + Kura-wide
   Distinct from Inbox (daily triage) — this is "find anyone."
   ============================================================ */
function PatientsListView({ patients, detailMode, selected, onOpenChart, onCloseDetail, onQuickOrder, onNewPatient, onOrderPlaced, onViewOrder }) {
  const [q, setQ] = useState("");
  const [includeKuraWide, setIncludeKuraWide] = useState(false);
  // Column-based sort with direction. Defaults to most-recent-first.
  const [sort, setSort] = useState({ col: "lastSeen", dir: "asc" });
  const setSortCol = (col) => setSort(s => s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" });
  const auth = useAuth();

  if (detailMode && selected) {
    return <PatientDetailFull patient={selected} onBack={onCloseDetail} onQuickOrder={onQuickOrder} onOrderPlaced={onOrderPlaced} onViewOrder={onViewOrder} />;
  }

  // Doctor's panel: only Pierre's demo account renders the populated extras.
  // Every other account shows just the props (App pre-filters to the 1 demo
  // patient) so the panel matches the lean sidebar count.
  const extras = !isPierreAccount(auth) ? [] : [
    { id: "P-7723", name: "Pisey Sao", khmer: "សៅ ភិស៊ី", age: 62, sex: "F", insurance: "Forte", bridge: "T2", lastSeen: "2mo ago", flag: "ok",      tags: [],            summary: "Annual wellness, stable" },
    { id: "P-6589", name: "Rithy Mao",  khmer: "ម៉ៅ រិទ្ធី",  age: 41, sex: "M", insurance: "NSSF",  bridge: "T1", lastSeen: "5mo ago", flag: "warning", tags: ["overdue"],  summary: "HTN follow-up overdue" },
    { id: "P-5421", name: "Channa Tep", khmer: "ទេព ចាន់ណា",  age: 36, sex: "M", insurance: "Self-pay", bridge: "T3", lastSeen: "1mo ago", flag: "ok", tags: ["new"],      summary: "New patient, lipid screen" },
    { id: "P-4998", name: "Davy Nuon",  khmer: "នួន ដាវី",   age: 28, sex: "F", insurance: "Forte", bridge: "T1", lastSeen: "3wk ago", flag: "ok", tags: [],              summary: "Booked via directory · annual" },
  ];
  const ownPanel = [...patients, ...extras];

  const filterByQuery = (list) => list.filter(p => {
    if (!q) return true;
    const hay = `${p.name} ${p.khmer} ${p.id}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  const panelMatches = filterByQuery(ownPanel);

  // Kura-wide records are NEVER browseable — only returned when there's a query
  // AND the doctor opts in. Privacy: doctors cannot see other doctors' patients
  // by default; matches surface only when the doctor types something specific.
  const kuraWideMatches = (q && includeKuraWide) ? filterByQuery(kuraWidePatients()) : [];

  const sortFn = (a, b) => {
    let cmp = 0;
    if (sort.col === "name")          cmp = a.name.localeCompare(b.name);
    else if (sort.col === "age")      cmp = (a.age || 0) - (b.age || 0);
    else if (sort.col === "lastSeen") cmp = lastSeenScore(a.lastSeen) - lastSeenScore(b.lastSeen);
    return sort.dir === "desc" ? -cmp : cmp;
  };
  const sortedPanel = [...panelMatches].sort(sortFn);
  const sortedKura  = [...kuraWideMatches].sort(sortFn);

  // Card layout for small panels: <5 patients, no search query, no Kura-wide
  // matches. Acts more like a work queue than a directory.
  const useCardLayout = sortedPanel.length > 0 && sortedPanel.length < 5 && !q && sortedKura.length === 0;
  // Local search hidden until panel has enough rows to need filtering. Global
  // search in TopBar covers everything until then.
  const showLocalSearch = patients.length >= 5;

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-display text-[30px] font-medium leading-none mb-1.5">Patients</h1>
          <p className="text-[13px] text-ink-3">
            Open a chart to continue care.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onNewPatient}>
          <Plus size={12} /> New patient
        </Button>
      </div>

      {/* Search + filters — hidden until panel has enough rows */}
      {showLocalSearch && (
        <div className="bg-surface border border-line rounded-xl p-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search patients"
                className="w-full pl-9 pr-3 py-2 rounded-md border border-line bg-surface text-[13px] focus:border-ink focus:outline-none"
              />
            </div>
            <button className="inline-flex items-center gap-1.5 text-[12px] text-ink-2 px-2.5 py-2 rounded-md border border-line hover:border-ink">
              <Filter size={12} /> Filters
            </button>
          </div>
        </div>
      )}

      {/* Result count */}
      <div className="mb-3 text-[11.5px] text-ink-3">
        <span className="font-semibold text-ink">{sortedPanel.length}</span> patient{sortedPanel.length === 1 ? "" : "s"}
        {q && <> matching <span className="font-mono">"{q}"</span></>}
        {sortedKura.length > 0 && <span className="ml-2">· <span className="font-semibold text-ink">{sortedKura.length}</span> Kura-wide match{sortedKura.length === 1 ? "" : "es"}</span>}
      </div>

      {/* Cards for small panels — clearer next step than a single table row */}
      {useCardLayout ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {sortedPanel.map(p => (
            <PatientCard key={p.id} patient={p} onOpen={() => onOpenChart(p.id)} />
          ))}
        </div>
      ) : (
        <div className="bg-surface border border-line rounded-xl overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead className="bg-surface-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-3 border-b border-line-2">
              <tr>
                <SortableTh col="name"     sort={sort} onSort={setSortCol}>Patient</SortableTh>
                <SortableTh col="age"      sort={sort} onSort={setSortCol}>Age · Sex</SortableTh>
                <SortableTh col="lastSeen" sort={sort} onSort={setSortCol}>Last seen</SortableTh>
                <th className="text-left px-3 py-2.5 font-semibold">Next step</th>
                <th className="text-right px-4 py-2.5 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-2">
              {sortedPanel.map(p => (
                <PatientListRow key={p.id} patient={p} onOpen={() => onOpenChart(p.id)} />
              ))}
            </tbody>
          </table>
          {sortedPanel.length === 0 && (
            <div className="px-4 py-12 text-center">
              <Search size={22} className="mx-auto text-ink-3 mb-2" />
              <p className="text-[12.5px] text-ink-2 mb-1">
                {q ? <>No patients in your panel match "<span className="font-mono">{q}</span>"</> : "No patients in your panel."}
              </p>
              {q && !includeKuraWide && (
                <p className="text-[11px] text-ink-3 mb-3">Tick "Also search Kura-wide for matches" above, or add this person as a new patient.</p>
              )}
              <Button size="sm" onClick={onNewPatient}>
                <Plus size={11} /> Add new patient
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Kura-wide section — only renders when there are matches */}
      {sortedKura.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold">Kura-wide matches</span>
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-plum bg-line-2 px-1.5 py-0.5 rounded">
              <ShieldCheck size={9} /> Search-result only · not your panel
            </span>
          </div>
          <div className="bg-surface border border-line rounded-xl overflow-hidden">
            <table className="w-full text-[12.5px]">
              <tbody className="divide-y divide-line-2">
                {sortedKura.map(p => (
                  <PatientListRow key={p.id} patient={p} onOpen={() => {}} />
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10.5px] text-ink-3 mt-2 leading-relaxed">
            These are real Kura patients seen elsewhere who match your query. You can't open their chart from here — bridge them into your panel via Orders Step 1 (search-first dedup) or by adding them as a new patient. Identity index integrity matters: doctors can't browse other doctors' panels.
          </p>
        </div>
      )}
    </div>
  );
}

function kuraWidePatients() {
  // Simulated Kura-wide records that aren't in this doctor's own panel
  return [
    { id: "P-3201", name: "Sokun Em",   khmer: "អែម សុគន្ធ", age: 53, sex: "M", insurance: "Forte",   bridge: "T2", lastSeen: "8mo ago", flag: "ok", tags: [], summary: "—", provenance: "In Dr. Lim's panel · BKK2" },
    { id: "P-2876", name: "Nimol Ros",  khmer: "រស់ និមល",   age: 44, sex: "F", insurance: "NSSF",    bridge: "T2", lastSeen: "1y ago",  flag: "ok", tags: [], summary: "—", provenance: "Last seen at PSC BKK1, 1y ago" },
    { id: "P-1654", name: "Sothy Heng", khmer: "ហេង សុធី",   age: 67, sex: "M", insurance: "Self-pay", bridge: "T1", lastSeen: "2y ago",  flag: "ok", tags: [], summary: "—", provenance: "In Dr. Sok's panel · TUOL KORK" },
  ];
}

function ScopeButton({ active, onClick, label, count, hint }) {
  return (
    <button
      onClick={onClick}
      title={hint}
      className={`text-[12px] px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 transition ${
        active ? "bg-surface text-ink shadow-sm font-medium" : "text-ink-3 hover:text-ink"
      }`}
    >
      {label}
      <span className="font-mono text-[10px] text-ink-3">{count}</span>
    </button>
  );
}

/* Numeric "days ago" score for sorting. Parses strings like "today",
   "12 days ago", "3wk ago", "2mo ago", "94 days ago" into a comparable
   number of days. Lower = more recent. */
function lastSeenScore(raw) {
  if (!raw) return Infinity;
  if (raw === "today") return 0;
  const m = raw.match(/^(\d+)\s*(hour|hr|h|day|d|week|wk|w|month|mo|m|year|yr|y)s?\s*ago$/i);
  if (!m) return 9999;
  const n = parseInt(m[1], 10);
  const u = m[2].toLowerCase();
  const mult = u.startsWith("h") ? 1 / 24
              : (u === "d" || u.startsWith("day")) ? 1
              : (u === "w" || u === "wk" || u.startsWith("week")) ? 7
              : (u === "m" || u === "mo" || u.startsWith("month")) ? 30
              : 365;
  return n * mult;
}

function SortableTh({ col, sort, onSort, children, align = "left" }) {
  const active = sort.col === col;
  return (
    <th className={`px-3 py-2.5 font-semibold select-none ${align === "right" ? "text-right" : "text-left"}`}>
      <button
        onClick={() => onSort(col)}
        className={`inline-flex items-center gap-1 ${active ? "text-ink" : "text-ink-3 hover:text-ink"} transition`}
      >
        <span>{children}</span>
        {active ? (
          sort.dir === "asc"
            ? <ChevronUp size={11} className="text-ink-2" />
            : <ChevronDown size={11} className="text-ink-2" />
        ) : (
          <ChevronDown size={10} className="text-ink-3/30" />
        )}
      </button>
    </th>
  );
}

/* Friendlier "last seen" — collapse long day counts into weeks/months/years
   so the column reads at a glance ("210 days ago" → "7 months ago"). Anything
   today/this-week stays as-is. */
function humanizeLastSeen(raw) {
  if (!raw) return "—";
  if (raw === "today") return "today";
  const dayMatch = raw.match(/^(\d+)\s*days?\s*ago$/i);
  if (dayMatch) {
    const d = parseInt(dayMatch[1], 10);
    if (d < 14)  return `${d} day${d === 1 ? "" : "s"} ago`;
    if (d < 60)  return `${Math.round(d / 7)} weeks ago`;
    if (d < 730) return `${Math.round(d / 30)} months ago`;
    return `${Math.round(d / 365)} years ago`;
  }
  return raw;
}

function PatientListRow({ patient, onOpen }) {
  const flagDot = {
    critical: "bg-crimson",
    warning:  "bg-amber",
    ok:       "bg-jade",
  }[patient.flag] || "bg-line";
  const initials = patient.name.split(" ").map(s => s[0]).slice(0, 2).join("");
  const isKuraWide = !!patient.provenance;
  return (
    <tr className="hover:bg-surface-2/50 cursor-pointer" onClick={onOpen}>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-md flex items-center justify-center font-semibold text-[11px] shrink-0 ${
            isKuraWide ? "bg-line-2 text-ink-3" : "bg-jade-soft text-jade"
          }`}>{initials}</div>
          <div>
            <div className="font-medium text-ink">{patient.name}</div>
            <div className="text-[11px] text-ink-3">{patient.khmer}</div>
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5 text-ink-2">{patient.age} {patient.sex === "M" ? "♂" : "♀"}</td>
      <td className="px-3 py-2.5 text-ink-2 tabular-nums">{humanizeLastSeen(patient.lastSeen)}</td>
      <td className="px-3 py-2.5">
        {isKuraWide ? (
          <span className="text-[10.5px] text-ink-3 italic">{patient.provenance}</span>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${flagDot}`} />
            <span className="text-[11px] text-ink-2 truncate max-w-[260px]">{patient.summary}</span>
          </div>
        )}
      </td>
      <td className="px-4 py-2.5 text-right">
        {isKuraWide ? (
          <button onClick={(e) => { e.stopPropagation(); }} className="text-[11px] text-jade-2 font-medium hover:underline inline-flex items-center gap-1">
            Bridge to panel <ArrowRight size={11} />
          </button>
        ) : (
          <button className="text-[11px] text-jade-2 font-medium hover:underline inline-flex items-center gap-1">
            Open chart <ArrowRight size={11} />
          </button>
        )}
      </td>
    </tr>
  );
}

/* Patient card — used when the panel is small (<5). Gives the doctor a clear
   next action instead of a thin table row. Promotes "Open chart" as primary;
   secondary actions stay quiet. */
function PatientCard({ patient, onOpen }) {
  const flagDot = {
    critical: "bg-crimson",
    warning:  "bg-amber",
    ok:       "bg-jade",
  }[patient.flag] || "bg-line";
  const initials = patient.name.split(" ").map(s => s[0]).slice(0, 2).join("");
  return (
    <button
      type="button"
      onClick={onOpen}
      className="text-left bg-surface border border-line rounded-xl p-4 hover:border-ink-3 transition group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-md flex items-center justify-center font-semibold text-[12px] shrink-0 bg-jade-soft text-jade">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-ink text-[14px] leading-tight">{patient.name}</div>
          <div className="text-[11.5px] text-ink-3 mt-0.5">
            {patient.age} · {patient.sex === "M" ? "Male" : "Female"} · Last seen {humanizeLastSeen(patient.lastSeen)}
          </div>
        </div>
      </div>

      {patient.summary && patient.summary !== "—" && (
        <div className="mt-3 pt-3 border-t border-line-2 flex items-start gap-2">
          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${flagDot}`} />
          <div className="flex-1 min-w-0">
            <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-0.5">Next step</div>
            <div className="text-[12.5px] text-ink-2 leading-snug">{patient.summary}</div>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[12px] font-medium text-jade-2 group-hover:underline">
        Open chart <ArrowRight size={12} />
      </div>
    </button>
  );
}

/* ============================================================
   LAB TREND TABLE — multi-test, multi-date trend matrix
   Rows grouped by panel; pill-chip cells with status; sparkline trend.
   ============================================================ */
function LabTrendTable({ patient, reflexPhase }) {
  // Panels start expanded. Doctor can collapse via the per-panel chevron or the
  // global Collapse/Expand all toggle in the header.
  const [collapsedPanels, setCollapsedPanels] = useState({});
  const [expandedTest, setExpandedTest] = useState(null); // panel-test key for inline trend chart
  const [closingTest, setClosingTest] = useState(null); // deferred-unmount key during collapse animation
  const [openedTests, setOpenedTests] = useState(() => new Set()); // session-local 'read' tracker
  const [range, setRange] = useState("6m"); // '7d' | '3m' | '6m' | 'all'
  const [search, setSearch] = useState("");

  const COLLAPSE_MS = 320;
  const handleTestRowClick = (testKey) => {
    setOpenedTests(prev => { const next = new Set(prev); next.add(testKey); return next; });
    if (expandedTest === testKey) {
      // Mark as closing → keep mounted while the collapse animation plays.
      setClosingTest(testKey);
      setExpandedTest(null);
      setTimeout(() => setClosingTest(curr => curr === testKey ? null : curr), COLLAPSE_MS);
    } else {
      // If something else was mid-close, drop it; show this one.
      setClosingTest(null);
      setExpandedTest(testKey);
    }
  };
  const [system] = useLabUnits();
  const isSokha    = patient.id === "P-9134";
  const isChannary = patient.id === "P-4421";

  // Each column has a label + months-ago (today is 2026-05-11). Used for filters + Latest age.
  const dates = isSokha
    ? [
        { label: "May 2025", monthsAgo: 12 },
        { label: "Jul 2025", monthsAgo: 10 },
        { label: "Sep 2025", monthsAgo: 8 },
        { label: "Oct 2025", monthsAgo: 7 },
        { label: "Dec 2025", monthsAgo: 5 },
        { label: "Feb 2026", monthsAgo: 3 },
        { label: "today",    monthsAgo: 0 },
      ]
    : [
        { label: "Jan 2025", monthsAgo: 16 },
        { label: "Apr 2025", monthsAgo: 13 },
        { label: "Aug 2025", monthsAgo: 9 },
        { label: "Nov 2025", monthsAgo: 6 },
        { label: "Feb 2026", monthsAgo: 3 },
        { label: "Apr 2026", monthsAgo: 1 },
        { label: "today",    monthsAgo: 0 },
      ];

  // Column order for date columns: newest first (today on the left). Filter by range.
  // 7d is the safer default — surfaces the most recent visit + anything truly current.
  const rangeLimit = range === "7d" ? 0.25 : range === "3m" ? 3 : range === "6m" ? 6 : Infinity;
  const displayCols = dates
    .map((_, i) => dates.length - 1 - i)
    .filter(origIdx => dates[origIdx].monthsAgo <= rangeLimit);
  const hiddenColCount = dates.length - displayCols.length;

  const panels = isSokha ? [
    {
      name: "Vitals",
      tests: [
        { name: "Heart rate",    unit: "bpm",   ref: "60–100",   values: ["76", "74", "78", "80", "76", "78", "78"],                              flags: ["ok","ok","ok","ok","ok","ok","ok"] },
        { name: "Weight",        unit: "kg",    ref: "—",         values: ["79.8", "80.4", "81.2", "81.8", "82.0", "82.4", "82.4"],               flags: ["warn","warn","warn","warn","warn","warn","warn"] },
        { name: "BMI",           unit: "kg/m²", ref: "18.5–24.9", values: ["27.8", "28.0", "28.3", "28.5", "28.6", "28.7", "28.7"],               flags: ["warn","warn","warn","warn","warn","warn","warn"] },
        { name: "Temperature",   unit: "°C",    ref: "36.1–37.5", values: ["36.7", "36.6", "36.8", "36.5", "37.0", "36.7", "36.8"],               flags: ["ok","ok","ok","ok","ok","ok","ok"] },
        { name: "SpO₂",          unit: "%",     ref: "≥ 95",      values: ["98", "98", "97", "98", "98", "98", "98"],                             flags: ["ok","ok","ok","ok","ok","ok","ok"] },
        { name: "BP",            unit: "mmHg",  ref: "< 130/80", values: ["138/86", "140/88", "142/88", "144/90", "144/90", "146/92", "146/92"], flags: ["warn","warn","high","high","high","high","high"] },
      ],
    },
    {
      name: "Glycemic control",
      tests: [
        { name: "HbA1c",          unit: "%",     ref: "≤ 7.0",  values: ["7.8", "8.1", "8.4", null, "8.9", null, "9.4"], flags: ["high","high","high",null,"high",null,"high"], hasTrendChart: true },
        { name: "Fasting glucose", unit: "mg/dL", ref: "70–100", values: ["132", null, "141", null, "146", null, "148"], flags: ["high",null,"high",null,"high",null,"high"] },
      ],
    },
    {
      name: "Lipid panel",
      tests: [
        { name: "Total cholesterol", unit: "mg/dL", ref: "< 200", values: ["218", null, "224", null, "232", null, "240"], flags: ["high",null,"high",null,"high",null,"high"] },
        { name: "LDL-C",             unit: "mg/dL", ref: "< 100", values: ["158", null, "162", null, "170", null, "162"], flags: ["high",null,"high",null,"high",null,"high"] },
        { name: "HDL-C",             unit: "mg/dL", ref: "> 40",  values: ["42",  null, "40",  null, "39",  null, "38"],  flags: ["ok",  null,"low", null,"low", null,"low"] },
        { name: "Triglycerides",     unit: "mg/dL", ref: "< 150", values: ["180", null, "195", null, "204", null, "210"], flags: ["high",null,"high",null,"high",null,"high"] },
      ],
    },
    {
      name: "Renal function",
      tests: [
        { name: "Creatinine", unit: "mg/dL", ref: "0.7–1.2", values: ["0.88", null, "0.91", null, "0.93", null, "0.94"], flags: ["ok",null,"ok",null,"ok",null,"ok"] },
        { name: "eGFR",        unit: "—",     ref: "> 60",   values: ["98",   null, "95",   null, "93",   null, "92"],   flags: ["ok",null,"ok",null,"ok",null,"ok"] },
        { name: "Microalbumin", unit: "mg/g", ref: "< 30",   values: [null,   null, "28",   null, null,   null, "34"],    flags: [null, null,"ok",null,null,null,"warn"] },
      ],
    },
    {
      name: "Liver function",
      tests: [
        { name: "ALT", unit: "U/L", ref: "< 40", values: ["38", null, "42", null, "44", null, "44"], flags: ["ok",null,"warn",null,"high",null,"high"] },
        { name: "AST", unit: "U/L", ref: "< 35", values: ["32", null, "34", null, "37", null, "38"], flags: ["ok",null,"ok",null,"warn",null,"warn"] },
      ],
    },
    {
      name: "Cardiovascular markers",
      tests: [
        { name: "Homocysteine", unit: "µmol/L", ref: "5–15", values: [null, "18", null, null, null, null, null], flags: [null,"high",null,null,null,null,null] },
      ],
    },
    {
      // Qualitative panel — pos/neg results, no trend math possible.
      // Most non-null draws are recent (5mo ago + today); one positive.
      name: "STD / STI screen",
      tests: [
        { name: "HIV 1/2 Ab/Ag",          unit: "—", ref: "Negative",     values: ["Negative",null,null,null,null,null,null],     flags: ["ok",null,null,null,null,null,null] },
        { name: "Syphilis (RPR)",         unit: "—", ref: "Non-reactive", values: ["Non-reactive",null,null,null,null,null,null], flags: ["ok",null,null,null,null,null,null] },
        { name: "Hepatitis B (HBsAg)",    unit: "—", ref: "Negative",     values: ["Negative",null,null,null,null,null,null],     flags: ["ok",null,null,null,null,null,null] },
        { name: "Hepatitis C (anti-HCV)", unit: "—", ref: "Negative",     values: ["Negative",null,null,null,null,null,null],     flags: ["ok",null,null,null,null,null,null] },
        { name: "Gonorrhea (NAAT)",       unit: "—", ref: "Negative",     values: ["Positive",null,null,null,null,null,null],     flags: ["high",null,null,null,null,null,null] },
        { name: "Chlamydia (NAAT)",       unit: "—", ref: "Negative",     values: ["Negative",null,null,null,null,null,null],     flags: ["ok",null,null,null,null,null,null] },
        { name: "Trichomonas",            unit: "—", ref: "Negative",     values: ["Negative",null,null,null,null,null,null],     flags: ["ok",null,null,null,null,null,null] },
        { name: "Mycoplasma genitalium",  unit: "—", ref: "Negative",     values: ["Negative",null,null,null,null,null,null],     flags: ["ok",null,null,null,null,null,null] },
        { name: "HSV-1 IgG",              unit: "—", ref: "Negative",     values: ["Negative",null,null,null,null,null,null],     flags: ["ok",null,null,null,null,null,null] },
        { name: "HSV-2 IgG",              unit: "—", ref: "Negative",     values: ["Negative",null,null,null,null,null,null],     flags: ["ok",null,null,null,null,null,null] },
        { name: "HPV (high-risk pool)",   unit: "—", ref: "Negative",     values: ["Negative",null,null,null,null,null,null],     flags: ["ok",null,null,null,null,null,null] },
        { name: "Mycoplasma hominis",     unit: "—", ref: "Negative",     values: ["Negative",null,null,null,null,null,null],     flags: ["ok",null,null,null,null,null,null] },
        { name: "Ureaplasma urealyticum", unit: "—", ref: "Negative",     values: ["Negative",null,null,null,null,null,null],     flags: ["ok",null,null,null,null,null,null] },
      ],
    },
    {
      // Qualitative dipstick panel — semi-quantitative scale (Neg / Trace / 1+ / 2+ / 3+).
      // Single draw 1yr ago — not the today visit.
      name: "Urinalysis (dipstick)",
      tests: [
        { name: "Color",         unit: "—",    ref: "Yellow",      values: ["Yellow",null,null,null,null,null,null],          flags: ["ok",null,null,null,null,null,null] },
        { name: "Clarity",       unit: "—",    ref: "Clear",       values: ["Slightly cloudy",null,null,null,null,null,null], flags: ["warn",null,null,null,null,null,null] },
        { name: "pH",            unit: "—",    ref: "5.0–8.0",     values: ["5.5",null,null,null,null,null,null],             flags: ["ok",null,null,null,null,null,null] },
        { name: "Specific gravity", unit: "—", ref: "1.005–1.030", values: ["1.022",null,null,null,null,null,null],           flags: ["ok",null,null,null,null,null,null] },
        { name: "Protein",       unit: "—",    ref: "Negative",    values: ["1+",null,null,null,null,null,null],              flags: ["high",null,null,null,null,null,null] },
        { name: "Glucose",       unit: "—",    ref: "Negative",    values: ["2+",null,null,null,null,null,null],              flags: ["high",null,null,null,null,null,null] },
        { name: "Ketones",       unit: "—",    ref: "Negative",    values: ["Trace",null,null,null,null,null,null],           flags: ["warn",null,null,null,null,null,null] },
        { name: "Blood",         unit: "—",    ref: "Negative",    values: ["Negative",null,null,null,null,null,null],        flags: ["ok",null,null,null,null,null,null] },
        { name: "Nitrites",      unit: "—",    ref: "Negative",    values: ["Negative",null,null,null,null,null,null],        flags: ["ok",null,null,null,null,null,null] },
        { name: "Leukocytes",    unit: "—",    ref: "Negative",    values: ["Trace",null,null,null,null,null,null],           flags: ["warn",null,null,null,null,null,null] },
      ],
    },
    {
      // Demo: female-cycle hormones drawn together — represented here on Sokha for prototype.
      // Each test still appears as a flowsheet row; clicking any test opens a combined chart.
      name: "Cycle hormones",
      combinedChart: {
        title: "Cycle hormone profile",
        subtitle: "All four hormones overlaid · most recent cycle",
        xLabel: "Cycle day",
        markerX: 14,
        markerLabel: "ovulation",
        // Each series carries cycle-phase normal ranges (rangeLow/rangeHigh per day)
        // so the chart can render a phase-aware reference band on hover.
        series: [
          { name: "Estradiol (E2)", color: "#A855F7", latest: "220 pg/mL",
            points: [
              {x:1, value:50,  rangeLow:20,  rangeHigh:100},
              {x:5, value:80,  rangeLow:30,  rangeHigh:150},
              {x:10,value:180, rangeLow:60,  rangeHigh:250},
              {x:14,value:380, rangeLow:180, rangeHigh:430},
              {x:21,value:220, rangeLow:80,  rangeHigh:280},
              {x:25,value:140, rangeLow:50,  rangeHigh:200},
              {x:28,value:60,  rangeLow:25,  rangeHigh:120},
            ] },
          { name: "LH", color: "#3B82F6", latest: "8 mIU/mL",
            points: [
              {x:1, value:5,  rangeLow:2,  rangeHigh:10},
              {x:5, value:6,  rangeLow:2,  rangeHigh:10},
              {x:10,value:8,  rangeLow:3,  rangeHigh:12},
              {x:14,value:60, rangeLow:25, rangeHigh:80},
              {x:21,value:10, rangeLow:2,  rangeHigh:15},
              {x:25,value:8,  rangeLow:2,  rangeHigh:12},
              {x:28,value:5,  rangeLow:2,  rangeHigh:10},
            ] },
          { name: "FSH", color: "#10B981", latest: "8 mIU/mL",
            points: [
              {x:1, value:12, rangeLow:5,  rangeHigh:20},
              {x:5, value:8,  rangeLow:3,  rangeHigh:12},
              {x:10,value:5,  rangeLow:2,  rangeHigh:10},
              {x:14,value:18, rangeLow:8,  rangeHigh:25},
              {x:21,value:4,  rangeLow:1.5,rangeHigh:8},
              {x:25,value:3,  rangeLow:1.5,rangeHigh:8},
              {x:28,value:8,  rangeLow:3,  rangeHigh:14},
            ] },
          { name: "Progesterone (P4)", color: "#F59E0B", latest: "12 ng/mL",
            points: [
              {x:1, value:1,  rangeLow:0.1,rangeHigh:1.5},
              {x:5, value:1,  rangeLow:0.1,rangeHigh:1.5},
              {x:10,value:1,  rangeLow:0.1,rangeHigh:1.5},
              {x:14,value:2,  rangeLow:0.5,rangeHigh:3},
              {x:21,value:18, rangeLow:8,  rangeHigh:22},
              {x:25,value:12, rangeLow:5,  rangeHigh:18},
              {x:28,value:2,  rangeLow:0.5,rangeHigh:5},
            ] },
        ],
      },
      tests: [
        { name: "Estradiol (E2)",    unit: "pg/mL",   ref: "30–400",  values: [null, null, "180", null, "220", null, "220"], flags: [null,null,"ok",null,"ok",null,"ok"] },
        { name: "LH",                unit: "mIU/mL",  ref: "1.7–8.6", values: [null, null, "7", null, "9", null, "8"],       flags: [null,null,"ok",null,"high",null,"warn"] },
        { name: "FSH",               unit: "mIU/mL",  ref: "3.5–12.5",values: [null, null, "6", null, "9", null, "8"],       flags: [null,null,"ok",null,"ok",null,"ok"] },
        { name: "Progesterone (P4)", unit: "ng/mL",   ref: "> 10",    values: [null, null, "11", null, "14", null, "12"],    flags: [null,null,"ok",null,"ok",null,"ok"] },
      ],
    },
  ] : isChannary ? [
    (() => {
      // FT3 / FT4 today columns depend on the reflex phase:
      //   detected / declined → no row (nulls filtered out)
      //   patient-pending     → clock · "awaiting pay"
      //   running             → clock · "ETA 4h"
      //   completed           → actual result
      const ft3Today = reflexPhase === "completed" ? "6.8"
        : reflexPhase === "patient-pending" ? "_pending_pay_"
        : reflexPhase === "running" ? "_pending_run_"
        : null;
      const ft4Today = reflexPhase === "completed" ? "2.1"
        : reflexPhase === "patient-pending" ? "_pending_pay_"
        : reflexPhase === "running" ? "_pending_run_"
        : null;
      const ft3Flag = reflexPhase === "completed" ? "high" : null;
      const ft4Flag = reflexPhase === "completed" ? "high" : null;
      return {
        name: "Thyroid panel",
        tests: [
          { name: "TSH",     unit: "mIU/L", ref: "0.5–4.5", values: [null, "1.4", "0.6", null, "0.18", null, "0.01"], flags: [null,"ok","ok", null,"low", null,"high"], hasTrendChart: true },
          { name: "Free T3", unit: "pg/mL", ref: "2.3–4.2", values: [null, null,  null,  null, null,    null, ft3Today], flags: [null, null, null, null, null, null, ft3Flag] },
          { name: "Free T4", unit: "ng/dL", ref: "0.8–1.8", values: [null, null,  null,  null, null,    null, ft4Today], flags: [null, null, null, null, null, null, ft4Flag] },
        ],
      };
    })(),
    {
      name: "Lipid panel",
      tests: [
        { name: "LDL-C",         unit: "mg/dL", ref: "< 100", values: [null, "118", "112", "108", "104", null, "98"],  flags: [null,"warn","warn","warn","warn",null,"ok"] },
        { name: "Total chol",    unit: "mg/dL", ref: "< 200", values: [null, "196", "192", "188", "186", null, "182"], flags: [null,"ok",  "ok",  "ok",  "ok",  null,"ok"] },
        { name: "HDL-C",         unit: "mg/dL", ref: "> 40",  values: [null, "54",  "55",  "56",  "58",  null, "60"],  flags: [null,"ok",  "ok",  "ok",  "ok",  null,"ok"] },
      ],
    },
  ] : [
    {
      name: "Lipid panel",
      tests: [
        { name: "LDL-C",         unit: "mg/dL", ref: "< 100", values: [null, "165", "158", "162", "170", null, "178"], flags: [null,"high","high","high","high",null,"high"] },
        { name: "Total chol",    unit: "mg/dL", ref: "< 200", values: [null, "238", "228", "232", "240", null, "248"], flags: [null,"high","high","high","high",null,"high"] },
        { name: "HDL-C",         unit: "mg/dL", ref: "> 40",  values: [null, "48",  "46",  "45",  "44",  null, "42"],  flags: [null,"ok",  "ok",  "warn","warn",null,"warn"] },
      ],
    },
  ];

  // Filter rows by search term — matches against test name OR panel name.
  // A panel hit reveals all its tests; a test hit only reveals that test.
  // Also hide tests/panels whose values are all null in the visible date range.
  const q = search.trim().toLowerCase();
  const rangeActive = range !== "all";
  const filteredPanels = panels
    .map(panel => {
      const panelHit = !q || panel.name.toLowerCase().includes(q);
      let tests = panelHit
        ? panel.tests
        : panel.tests.filter(t => t.name.toLowerCase().includes(q));
      // Drop tests with no data inside the visible date columns
      if (rangeActive) {
        tests = tests.filter(t => displayCols.some(idx => t.values[idx] != null));
      }
      return { ...panel, tests };
    })
    .filter(p => p.tests.length > 0);

  const allCollapsed = filteredPanels.length > 0 && filteredPanels.every(p => collapsedPanels[p.name]);
  const allExpanded  = filteredPanels.length > 0 && filteredPanels.every(p => !collapsedPanels[p.name]);
  const toggleAll = () => {
    if (allCollapsed) {
      setCollapsedPanels({});
    } else {
      const next = {};
      for (const p of filteredPanels) next[p.name] = true;
      setCollapsedPanels(next);
    }
  };

  return (
    <div id="lab-history" className="bg-surface border border-line rounded-xl scroll-mt-24">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line-2">
        <div className="flex items-center gap-2">
          <FlaskConical size={13} className="text-jade-2" />
          <h3 className="font-display text-[15px] font-medium">Lab history</h3>
        </div>
        <button
          disabled
          title="Coming soon — paste a lab PDF or photo, Kura extracts values into the flowsheet."
          className="text-[11px] text-ink-3 font-medium inline-flex items-center gap-1 cursor-not-allowed opacity-60 hover:opacity-80 transition"
        >
          <Plus size={11} /> Import results
          <span className="ml-1 text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-line-2 text-ink-3">soon</span>
        </button>
      </div>

      <div className="px-4 py-2 border-b border-line-2 bg-surface-2/30 flex items-center gap-2 text-[11px] flex-wrap">
        <div className="relative">
          <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tests or panels…"
            className="pl-6 pr-2 py-1 rounded-full border border-line bg-surface text-[11px] text-ink placeholder:text-ink-3 focus:border-ink focus:outline-none w-52"
          />
        </div>

        <span className="w-px h-3.5 bg-line mx-1" />
        <Calendar size={11} className="text-ink-3" />
        <div className="inline-flex rounded-full border border-line bg-surface overflow-hidden">
          <RangeSegment active={range === "7d"}  onClick={() => setRange("7d")}>7d</RangeSegment>
          <RangeSegment active={range === "3m"}  onClick={() => setRange("3m")}>3mo</RangeSegment>
          <RangeSegment active={range === "6m"}  onClick={() => setRange("6m")}>6mo</RangeSegment>
          <RangeSegment active={range === "all"} onClick={() => setRange("all")}>All</RangeSegment>
        </div>

        <button
          onClick={toggleAll}
          className="ml-auto text-[10.5px] text-ink-3 hover:text-ink underline-offset-2 hover:underline"
        >
          {allCollapsed ? "Expand all" : "Collapse all"}
        </button>
      </div>

      {range !== "all" && hiddenColCount > 0 && (
        <div className="px-4 py-2 border-b border-line-2 bg-surface-2/60 flex items-center gap-2 text-[11.5px]">
          <span className="text-ink-3 flex-1">
            Showing the last {range === "7d" ? "7 days" : range === "3mo" ? "3 months" : "6 months"}
            <span className="text-ink-3"> · <span className="font-mono">{hiddenColCount}</span> earlier {hiddenColCount === 1 ? "draw" : "draws"} hidden</span>
          </span>
          <button onClick={() => setRange("all")} className="text-jade-2 font-medium hover:underline">Show earlier results</button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table data-tour="lab-trends" className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-line-2 bg-surface-2/50">
              <th className="text-left px-3 py-2.5 font-semibold sticky left-0 bg-surface-2 z-10 text-[10.5px] uppercase tracking-[0.14em] text-ink-3 w-[130px]">Test</th>
              <th className="text-center px-2 py-2.5 font-semibold w-16 text-[10.5px] uppercase tracking-[0.14em] text-ink-3">Trend</th>
              {displayCols.map(origIdx => {
                const isToday = dates[origIdx].monthsAgo === 0;
                return (
                  <th
                    key={origIdx}
                    className={`text-center px-1.5 py-2.5 font-semibold whitespace-nowrap ${
                      isToday
                        ? "border-l-2 border-line-2 text-[11px] text-ink-2"
                        : "text-[10px] uppercase tracking-[0.08em] text-ink-3"
                    }`}
                  >
                    {isToday ? "Today" : shortDate(dates[origIdx].label)}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredPanels.length === 0 ? (
              <tr>
                <td colSpan={2 + displayCols.length} className="px-4 py-8 text-center text-[12px] text-ink-3">
                  No tests match the current filters.
                </td>
              </tr>
            ) : filteredPanels.map(panel => {
              // Default expanded; collapsedPanels override. Search forces expand.
              const isExpanded = q ? true : !collapsedPanels[panel.name];
              const summary = panelSummary(panel, dates);
              return (
                <React.Fragment key={panel.name}>
                  <tr className="bg-surface-2/30 hover:bg-surface-2/60 cursor-pointer border-b border-line-2" onClick={() => setCollapsedPanels(c => ({ ...c, [panel.name]: !c[panel.name] }))}>
                    <td colSpan={2 + displayCols.length} className="px-4 py-2.5">
                      <div className="flex items-center gap-2 text-[12px]">
                        {isExpanded ? <ChevronDown size={12} className="text-ink-3" /> : <ChevronRight size={12} className="text-ink-3" />}
                        <span className="font-semibold text-ink-2">{panel.name}</span>
                        <span className="text-ink-3 font-normal">·</span>
                        <span className="text-[11px] text-ink-3 font-mono">{panel.tests.length} tests</span>
                        {summary.abnormalCount > 0 && (
                          <>
                            <span className="text-ink-3 font-normal">·</span>
                            <span className="text-[11px] font-mono text-crimson">{summary.abnormalCount} abnormal</span>
                          </>
                        )}
                        <span className="text-ink-3 font-normal">·</span>
                        <span className="text-[11px] text-ink-3 font-mono">last draw {summary.lastDrawLabel}</span>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && panel.tests.map(test => {
                    const r = formatLabRef(test.ref, test.unit, test.name, system);
                    const testKey = `${panel.name}::${test.name}`;
                    const isOpen = expandedTest === testKey;
                    // Qualitative results (Negative / Yellow / Cloudy / +1) have no trend to plot,
                    // so they aren't expandable — skip the click handler, chevron, and pointer cursor.
                    const isQualitative = test.values.some(v => v != null && /[+a-zA-Z]/.test(String(v)));
                    return (
                    <React.Fragment key={test.name}>
                    <tr
                      onClick={isQualitative ? undefined : () => handleTestRowClick(testKey)}
                      className={`border-b border-line-2 group transition ${isQualitative ? "" : "cursor-pointer"} ${isOpen ? "bg-line-2/60" : isQualitative ? "" : "hover:bg-line-2/40"}`}
                    >
                      <td className="px-3 py-2.5 sticky left-0 z-10 w-[130px]">
                        <div className="text-ink-2 text-[12px] font-medium flex items-center gap-1.5 leading-tight">
                          {!openedTests.has(testKey)
                            ? <span className="w-1.5 h-1.5 rounded-full bg-ink-2 shrink-0" title="Unread" />
                            : <span className="w-1.5 h-1.5 shrink-0" />}
                          {isQualitative ? <span className="w-[11px] shrink-0" /> : isOpen ? <ChevronDown size={11} className="text-ink-3 shrink-0" /> : <ChevronRight size={11} className="text-ink-3 opacity-0 group-hover:opacity-100 transition shrink-0" />}
                          <span className="truncate">{test.name}</span>
                        </div>
                        <div className={`text-[10px] text-ink-3 font-mono leading-tight mt-0.5 ${isQualitative ? "" : "group-hover:hidden"}`}>{r.ref} {r.unit}</div>
                        {!isOpen && !isQualitative && (
                          <div className="text-[10px] text-jade-2 leading-tight mt-0.5 hidden group-hover:block">
                            Click for details →
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <TrendDots values={test.values} flags={test.flags} noRef={test.ref === "—"} />
                      </td>
                      {displayCols.map(origIdx => {
                        const v = test.values[origIdx];
                        const flag = test.flags[origIdx];
                        const isToday = dates[origIdx].monthsAgo === 0;
                        return (
                          <td key={origIdx} className={`px-1.5 py-2.5 text-center ${isToday ? "border-l-2 border-line-2" : ""}`}>
                            <div className="flex flex-col items-center leading-tight gap-0.5">
                              <LabValueChip value={v} unit={test.unit} name={test.name} flag={flag} prominent={isToday} noRef={test.ref === "—"} />
                              {v && !(typeof v === "string" && v.startsWith("_pending_")) && (
                                <span className={`text-[9.5px] ${isToday ? "text-ink-2 font-medium" : "text-ink-3"}`}>
                                  {ageLabel(dates[origIdx].monthsAgo)}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    {(isOpen || closingTest === testKey) && (
                      <tr className="border-b border-line-2 bg-surface-2/20">
                        <td colSpan={2 + displayCols.length} className="px-4 py-4">
                          <div className={closingTest === testKey ? "inline-collapse-anim" : "inline-expand-anim"}>
                            <InlineTrendExpansion test={test} panel={panel} dates={dates} onClose={() => handleTestRowClick(testKey)} />
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2.5 border-t border-line-2 bg-surface-2/40 flex items-center justify-between text-[10.5px] text-ink-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-crimson" /> High</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber" /> Borderline</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-jade" /> In range</span>
          <span className="inline-flex items-center gap-1"><span className="text-ink-3">—</span> No data</span>
        </div>
        <span className="inline-flex items-center gap-1"><TrendingUp size={10} /> Click any row to see full trend</span>
      </div>
    </div>
  );
}

function panelSummary(panel, dates) {
  let abnormalCount = 0;
  let minMonthsAgo = Infinity;
  for (const t of panel.tests) {
    const idx = lastFilledIndex(t.values);
    if (idx < 0) continue;
    const flag = t.flags[idx];
    if (flag && flag !== "ok") abnormalCount += 1;
    const m = dates[idx].monthsAgo;
    if (m < minMonthsAgo) minMonthsAgo = m;
  }
  const lastDrawLabel = minMonthsAgo === Infinity ? "—" : ageLabel(minMonthsAgo);
  return { abnormalCount, lastDrawLabel };
}

function lastFilledIndex(values) {
  for (let i = values.length - 1; i >= 0; i--) if (values[i] != null) return i;
  return -1;
}

function ageLabel(monthsAgo) {
  if (monthsAgo === 0) return "today";
  if (monthsAgo < 12) return `${monthsAgo}mo ago`;
  const years = Math.floor(monthsAgo / 12);
  const remMonths = monthsAgo % 12;
  if (remMonths === 0) return `${years}yr ago`;
  return `${years}yr ${remMonths}mo ago`;
}

function shortDate(label) {
  // "May 2025" → "May '25"; "today" → "Today"
  if (label === "today") return "Today";
  const m = label.match(/^(\w+)\s+(\d{4})$/);
  return m ? `${m[1]} '${m[2].slice(2)}` : label;
}

function parseLabValue(s) {
  if (s == null) return null;
  // Handles "162" and "138/86" (use first segment for BP)
  const first = String(s).split("/")[0];
  const n = parseFloat(first);
  return Number.isFinite(n) ? n : null;
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-2 py-0.5 rounded-full border text-[11px] transition " +
        (active
          ? "bg-jade-soft border-jade text-jade-2 font-medium"
          : "bg-surface border-line text-ink-2 hover:border-line-2 hover:text-ink")
      }
    >
      {children}
    </button>
  );
}

function RangeSegment({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-2 py-0.5 text-[11px] transition border-r border-line last:border-r-0 " +
        (active
          ? "bg-jade-soft text-jade-2 font-medium"
          : "text-ink-2 hover:bg-surface-2")
      }
    >
      {children}
    </button>
  );
}

function LabValueChip({ value, unit, flag, name, prominent, noRef }) {
  // Unit is intentionally omitted: it lives once on the test row's reference line,
  // not repeated per cell. Color is the only abnormal indicator — no triangles/arrows.
  const [system] = useLabUnits();
  if (!value) return <span className="text-ink-3">—</span>;
  // Reflex-pending sentinels: render a clock pill instead of the value.
  if (value === "_pending_pay_") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-amber bg-amber-soft px-1.5 py-0.5 rounded font-medium whitespace-nowrap" title="Reflex requested · awaiting patient payment via Telegram">
        <Clock size={9} /> awaiting pay
      </span>
    );
  }
  if (value === "_pending_run_") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-jade-2 bg-jade-soft px-1.5 py-0.5 rounded font-medium whitespace-nowrap" title="Reflex panel running on held sample">
        <Clock size={9} /> ETA 4h
      </span>
    );
  }
  const { value: dv } = formatLabValue(value, unit, name, system);
  const sizeClass = prominent ? "text-[13.5px] font-semibold" : "text-[11px]";
  // No reference range = severity is meaningless; render in neutral dark gray.
  const colorClass = noRef ? "text-ink-2" :
    flag === "high" ? "text-crimson" :
    flag === "warn" || flag === "low" ? "text-amber" :
    flag === "ok" ? "text-jade" :
    "text-ink-2";
  return <span className={`${sizeClass} font-mono whitespace-nowrap ${colorClass}`}>{dv}</span>;
}

function TrendDots({ values, flags, noRef }) {
  // No trend for qualitative / semi-quantitative panels (STD, urine dipstick, etc.)
  const hasQualitative = values.some(v => v != null && /[+a-zA-Z]/.test(String(v)));
  if (hasQualitative) return <span className="text-ink-3 text-[10px]">—</span>;

  // No reference range = severity is meaningless; collapse every flag to neutral gray.
  const colorMap = noRef
    ? { high: "#7C857F", warn: "#7C857F", low: "#7C857F", ok: "#7C857F" }
    : { high: "#B43E3E", warn: "#C49449", low: "#C49449", ok: "#1F4D3F" };
  const w = 60, h = 20, padX = 3, padY = 3;

  // BP rows render as candles (systolic↔diastolic vertical bar) instead of a single-value line.
  const isBP = values.some(v => v != null && String(v).includes("/"));
  if (isBP) {
    const parsed = values
      .map((v, i) => {
        if (v == null) return null;
        const parts = String(v).split("/");
        const sys = parseFloat(parts[0]);
        const dia = parseFloat(parts[1]);
        if (!Number.isFinite(sys) || !Number.isFinite(dia)) return null;
        return { sys, dia, flag: flags[i] };
      })
      .filter(Boolean);
    if (parsed.length === 0) return <span className="text-ink-3 text-[10px]">—</span>;

    const allNums = parsed.flatMap(p => [p.sys, p.dia]);
    const minV = Math.min(...allNums);
    const maxV = Math.max(...allNums);
    const range = maxV - minV;
    const usableH = h - 2 * padY;
    const yFor = n => range === 0 ? h / 2 : padY + (1 - (n - minV) / range) * usableH;
    const xStep = parsed.length > 1 ? (w - 2 * padX) / (parsed.length - 1) : 0;

    return (
      <svg width={w} height={h} className="inline-block overflow-visible">
        {parsed.map((p, i) => {
          const x = padX + i * xStep;
          const yTop = yFor(p.sys);
          const yBot = yFor(p.dia);
          const color = colorMap[p.flag] || "#7C857F";
          return (
            <g key={i}>
              <line x1={x} y1={yTop} x2={x} y2={yBot} stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.55} />
              <circle cx={x} cy={yTop} r={1.8} fill={color} />
              <circle cx={x} cy={yBot} r={1.8} fill={color} />
            </g>
          );
        })}
      </svg>
    );
  }

  // Real sparkline: parse numeric values and map y to actual magnitude so the line slopes.
  const parsed = values
    .map((v, i) => {
      if (v == null) return null;
      const num = parseLabValue(v);
      return num == null ? null : { num, flag: flags[i] };
    })
    .filter(Boolean);
  if (parsed.length === 0) return <span className="text-ink-3 text-[10px]">—</span>;

  const xStep = parsed.length > 1 ? (w - 2 * padX) / (parsed.length - 1) : 0;

  const nums = parsed.map(p => p.num);
  const minV = Math.min(...nums);
  const maxV = Math.max(...nums);
  const range = maxV - minV;
  const usableH = h - 2 * padY;
  const yFor = n => range === 0 ? h / 2 : padY + (1 - (n - minV) / range) * usableH;

  const pts = parsed.map((p, i) => ({ ...p, x: padX + i * xStep, y: yFor(p.num) }));

  return (
    <svg width={w} height={h} className="inline-block overflow-visible">
      {pts.length > 1 && pts.slice(0, -1).map((p, i) => {
        const next = pts[i + 1];
        return (
          <line
            key={i}
            x1={p.x} y1={p.y} x2={next.x} y2={next.y}
            stroke="#C8C0AE" strokeWidth={1}
          />
        );
      })}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2} fill={colorMap[p.flag] || "#7C857F"} />
      ))}
    </svg>
  );
}

/* ============================================================
   INLINE TREND EXPANSION — chart shown directly in the lab table
   when a doctor clicks a test row (replaces TrendModal overlay).
   Auto-detects BP (systolic/diastolic) and combined-chart panels.
   ============================================================ */
function InlineTrendExpansion({ test, panel, dates, onClose }) {
  const [system] = useLabUnits();
  const [scheduleState, setScheduleState] = useState("idle"); // 'idle' | 'picking' | 'done'
  const [scheduledIn, setScheduledIn] = useState(null); // months

  // Combined-chart panels (e.g. cycle hormones) get a dedicated multi-series view.
  if (panel?.combinedChart) {
    return <CombinedChartExpansion panel={panel} highlight={test.name} onClose={onClose} />;
  }

  const dispRef = formatLabRef(test.ref, test.unit, test.name, system);
  const isBP = test.values.some(v => v && String(v).includes("/"));

  const chartData = test.values
    .map((v, i) => {
      if (!v) return null;
      if (isBP) {
        const parts = String(v).split("/");
        const sys = parseFloat(parts[0]);
        const dia = parseFloat(parts[1]);
        if (isNaN(sys) || isNaN(dia)) return null;
        return { date: dates[i].label, systolic: sys, diastolic: dia, raw: v, flag: test.flags[i] };
      }
      const numeric = parseFloat(v);
      if (isNaN(numeric)) return null;
      const { v: cv } = convertLabNumber(numeric, test.unit, test.name, system);
      return { date: dates[i].label, value: cv, raw: String(cv), flag: test.flags[i] };
    })
    .filter(Boolean);

  // Parse reference. For BP we also need both targets separately.
  const refRange = parseRefRange(dispRef.ref);
  const bpTargets = isBP ? parseBPTargets(dispRef.ref) : null; // { sys, dia }
  const lastValue = chartData[chartData.length - 1];
  const status = lastValue ? (isBP
    ? bpStatus(lastValue.systolic, lastValue.diastolic, bpTargets)
    : rangeStatus(lastValue.value, refRange)) : "unknown";
  const statusMap = {
    above: { label: "Above range", color: "text-crimson", chartStroke: "#C25E3F" },
    below: { label: "Below range", color: "text-amber",   chartStroke: "#C49449" },
    in:    { label: "In range",    color: "text-jade-2",  chartStroke: "#4D8B6E" },
    unknown: { label: "—",         color: "text-ink-3",   chartStroke: "#7C857F" },
  };
  const sLabel = statusMap[status];

  // Y domain
  const allNumeric = chartData.flatMap(d => isBP ? [d.systolic, d.diastolic] : [d.value]);
  const refBounds = isBP
    ? [bpTargets?.sys, bpTargets?.dia].filter(v => v != null)
    : [refRange.low, refRange.high].filter(v => v != null);
  // For BP, anchor the y-axis to the clinical zone boundaries (normal dia 60–80,
  // normal sys 100–120, Stage 2 HTN ≥140) so the background bands always render
  // with context even when the observed values are clustered high.
  const bpBandAnchors = isBP ? [55, 80, 100, 120, 140, 155] : [];
  const minObs = Math.min(...allNumeric, ...refBounds, ...bpBandAnchors);
  const maxObs = Math.max(...allNumeric, ...refBounds, ...bpBandAnchors);
  const pad = (maxObs - minObs) * 0.15 || maxObs * 0.1 || 1;
  const yDomain = [Math.max(0, minObs - pad), maxObs + pad];

  // Re-test interval suggestion — HbA1c follow-up is 3mo; others default to 2mo.
  const defaultInterval = /hba1c/i.test(test.name) ? 3 : 2;
  const intervalOptions = [
    { months: 1, label: "1 month" },
    { months: 3, label: "3 months" },
    { months: 6, label: "6 months" },
  ];
  const scheduledDate = scheduledIn ? addMonths(new Date(), scheduledIn) : null;

  return (
    <div className="grid grid-cols-12 gap-5">
      {/* LEFT — status + big value + meta */}
      <div className="col-span-4 flex flex-col">
        <div className="text-[9.5px] uppercase tracking-[0.14em] text-ink-3 mb-2">{test.name}</div>
        <div className={`font-display text-[20px] font-medium ${sLabel.color} mb-1`}>{sLabel.label}</div>
        <div className="flex items-baseline gap-1.5">
          <span className={`font-display text-[28px] font-medium tnum leading-none ${sLabel.color}`}>{lastValue?.raw ?? "—"}</span>
          <span className="text-[12px] text-ink-3">{dispRef.unit !== "—" && dispRef.unit}</span>
        </div>
        <div className="text-[11px] text-ink-3 mt-1">{lastValue?.date}</div>
        {/\d/.test(dispRef.ref || "") && (
          <div className="text-[10.5px] text-ink-3 font-mono mt-1">Reference: {dispRef.ref} {dispRef.unit !== "—" && dispRef.unit}</div>
        )}

        <div className="mt-auto pt-3">
          <button className="text-[11px] text-ink-2 px-2.5 py-1.5 rounded-md border border-line hover:border-ink inline-flex items-center gap-1">
            <FlaskConical size={10} /> Order again
          </button>
        </div>
      </div>

      {/* RIGHT — chart with left-side range bar */}
      <div className="col-span-8 flex items-stretch gap-2">
        {/* Left range bar — BP gets its own (two green normal zones);
            other tests with a clear single-value range get the generic one. */}
        {isBP ? (
          <BPRangeBar yDomain={yDomain} />
        ) : (refRange.low != null || refRange.high != null) ? (
          <RangeBar refRange={refRange} yDomain={yDomain} unit={dispRef.unit} />
        ) : null}

        <div className="flex-1">
          <div style={{ height: 200 }} className="-mr-2">
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 22, right: isBP ? 36 : 24, left: 8, bottom: 4 }}>
                <XAxis
                  dataKey="date"
                  stroke="#7C857F"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#E5DFD3" }}
                  tick={({ x, y, payload }) => {
                    const isToday = payload.value === "today";
                    return (
                      <text
                        x={x}
                        y={y + 12}
                        fontSize={isToday ? 11 : 10}
                        fontWeight={isToday ? 600 : 400}
                        textAnchor="middle"
                        fill={isToday ? "#15201A" : "#7C857F"}
                      >
                        {payload.value}
                      </text>
                    );
                  }}
                />
                <YAxis domain={yDomain} hide />
                <Tooltip
                  content={isBP ? <BPTooltip /> : undefined}
                  contentStyle={isBP ? undefined : { background: "white", border: "1px solid #E5DFD3", borderRadius: 6, fontSize: 11 }}
                  labelStyle={{ color: "#15201A", fontWeight: 600 }}
                />

                {isBP ? (
                  <>
                    {/* Clinical zones (rendered first so candles paint on top).
                        Neutral gray: normal diastolic 60–80 and normal systolic 100–120.
                        The left-side BPRangeBar labels these zones. */}
                    <ReferenceArea y1={60} y2={80} fill="#7C857F" fillOpacity={0.08} stroke="none" />
                    <ReferenceArea y1={100} y2={120} fill="#7C857F" fillOpacity={0.08} stroke="none" />
                    {/* Invisible lines anchor the x/y scales; BPCandles reads them via Recharts hooks. */}
                    <Line type="monotone" dataKey="systolic" name="Systolic" stroke="transparent" dot={false} activeDot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="transparent" dot={false} activeDot={false} isAnimationActive={false} />
                    <BPCandles data={chartData} />
                  </>
                ) : (
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#D5CFC0"
                    strokeWidth={1.5}
                    activeDot={{ r: 7 }}
                    isAnimationActive={false}
                    dot={(props) => {
                      const { cx, cy, payload, index } = props;
                      const isLast = index === chartData.length - 1;
                      const st = rangeStatus(payload.value, refRange);
                      const fill = st === "in" ? "#4D8B6E" : st === "above" ? "#A8362F" : st === "below" ? "#B5871F" : "#7C857F";
                      return (
                        <g key={`dot-${index}`}>
                          <circle cx={cx} cy={cy} r={isLast ? 6 : 4.5} fill={fill} stroke="white" strokeWidth={1.5} />
                          {isLast && (
                            <text x={cx} y={cy - 12} fontSize={11} fontWeight={600} textAnchor="middle" fill={fill}>
                              {payload.value}
                            </text>
                          )}
                        </g>
                      );
                    }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          {isBP && (
            <div className="flex items-center gap-4 justify-center mt-1 text-[10.5px] text-ink-3">
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-1 rounded-sm bg-[#B43E3E]" /> Above</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-1 rounded-sm bg-[#C49449]" /> Borderline</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-1 rounded-sm bg-[#4D8B6E]" /> In range</span>
              <span className="inline-flex items-center gap-1.5 ml-2 text-ink-3/70">Top: systolic · Bottom: diastolic</span>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM — re-test card, only when out of range */}
      {status !== "in" && status !== "unknown" && (
        <div className="col-span-12 flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-line bg-surface-2/40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md border border-line flex items-center justify-center text-ink-3 shrink-0">
              {scheduleState === "done" ? <CheckCircle2 size={13} className="text-jade-2" /> : <Clock size={13} />}
            </div>
            <div>
              <div className="text-[12px] font-medium text-ink">
                {scheduleState === "done"
                  ? `Re-test scheduled · ${formatShortDate(scheduledDate)}`
                  : "Re-test out-of-range biomarker"}
              </div>
              <div className="text-[10.5px] text-ink-3">
                {scheduleState === "done"
                  ? `Reminder sent to patient via Telegram · in ${scheduledIn} ${scheduledIn === 1 ? "month" : "months"}`
                  : `Recommended re-test in ${defaultInterval} months`}
              </div>
            </div>
          </div>

          {scheduleState === "idle" && (
            <button onClick={() => setScheduleState("picking")} className="text-[11.5px] bg-jade text-white px-3 py-1.5 rounded-md font-medium hover:opacity-90">
              Schedule
            </button>
          )}

          {scheduleState === "picking" && (
            <div className="flex items-center gap-1.5">
              {intervalOptions.map(opt => (
                <button
                  key={opt.months}
                  onClick={() => { setScheduledIn(opt.months); setScheduleState("done"); }}
                  className={`text-[11px] px-2 py-1 rounded-md border transition ${
                    opt.months === defaultInterval
                      ? "border-jade-2 bg-jade-soft text-jade-2 font-medium hover:bg-jade-soft/80"
                      : "border-line text-ink-2 hover:border-ink"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <button onClick={() => setScheduleState("idle")} className="text-[10.5px] text-ink-3 hover:text-ink ml-1">
                Cancel
              </button>
            </div>
          )}

          {scheduleState === "done" && (
            <button onClick={() => { setScheduleState("idle"); setScheduledIn(null); }} className="text-[11px] text-ink-3 hover:text-ink underline-offset-2 hover:underline">
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function RangeBar({ refRange, yDomain }) {
  const [yMin, yMax] = yDomain;
  const total = yMax - yMin;
  if (total <= 0) return null;

  const seg = (from, to, color, label, sub) => ({
    from, to,
    heightPct: ((to - from) / total) * 100,
    color, label, sub,
  });

  // Build segments top → bottom. Labels follow the Function Health convention:
  // "In range > 40" / "Below range < 40", etc., so the threshold is explicit.
  const segments = [];
  const { low, high } = refRange;
  if (low != null && high != null) {
    if (yMax > high) segments.push(seg(high, yMax, "#A8362F", "Above range", `> ${high}`));
    segments.push(seg(Math.max(yMin, low), Math.min(yMax, high), "#4D8B6E", "In range", `${low}–${high}`));
    if (yMin < low) segments.push(seg(yMin, low, "#B5871F", "Below range", `< ${low}`));
  } else if (high != null) {
    if (yMax > high) segments.push(seg(high, yMax, "#A8362F", "Above range", `> ${high}`));
    if (yMin < high) segments.push(seg(yMin, Math.min(yMax, high), "#4D8B6E", "In range", `< ${high}`));
  } else if (low != null) {
    if (yMax > low) segments.push(seg(Math.max(yMin, low), yMax, "#4D8B6E", "In range", `> ${low}`));
    if (yMin < low) segments.push(seg(yMin, low, "#B5871F", "Below range", `< ${low}`));
  } else {
    return null;
  }

  // Match the chart's plot-area margins (top 22, xAxis bottom ~34).
  const TOP_PAD = 22;
  const BOTTOM_PAD = 34;

  return (
    <div className="flex items-stretch text-[9.5px] select-none shrink-0">
      <div className="w-1.5 flex flex-col rounded-full overflow-hidden" style={{ marginTop: TOP_PAD, marginBottom: BOTTOM_PAD }}>
        {segments.map((s, i) => (
          <div key={i} style={{ background: s.color, height: `${s.heightPct}%`, minHeight: 4 }} />
        ))}
      </div>
      <div className="ml-1.5 flex flex-col justify-between" style={{ marginTop: TOP_PAD - 4, marginBottom: BOTTOM_PAD - 4 }}>
        {segments.map((s, i) => (
          <div
            key={i}
            className="flex flex-col justify-center leading-tight"
            style={{ height: `${s.heightPct}%`, minHeight: 20, color: s.color }}
          >
            <div className="font-medium">{s.label}</div>
            <div className="text-ink-3 font-mono text-[9px]">{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Candle overlay for the BP trend chart. Read x/y scales via Recharts 3.x hooks
// (Customized was deprecated and no longer passes xAxisMap/yAxisMap props).
function BPCandles({ data }) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!xScale || !yScale) return null;

  const colorFor = (flag) =>
    flag === "high" ? "#B43E3E" :
    flag === "warn" ? "#C49449" :
    flag === "low"  ? "#C49449" :
    flag === "ok"   ? "#4D8B6E" : "#7C857F";

  return (
    <g>
      {data.map((d, i) => {
        const cx = xScale(d.date, { position: "middle" });
        const ySys = yScale(d.systolic);
        const yDia = yScale(d.diastolic);
        if (!Number.isFinite(cx) || !Number.isFinite(ySys) || !Number.isFinite(yDia)) return null;
        const color = colorFor(d.flag);
        const isLast = i === data.length - 1;
        const barW = isLast ? 10 : 8;
        return (
          <g key={i}>
            <rect x={cx - barW / 2} y={ySys} width={barW} height={Math.max(2, yDia - ySys)} rx={barW / 2} fill={color} fillOpacity={isLast ? 0.55 : 0.4} />
            <circle cx={cx} cy={ySys} r={isLast ? 5 : 4} fill={color} stroke="white" strokeWidth={1.5} />
            <circle cx={cx} cy={yDia} r={isLast ? 5 : 4} fill={color} stroke="white" strokeWidth={1.5} />
            {isLast && (
              <>
                <text x={cx + 9} y={ySys + 4} fontSize={11} fontWeight={600} fill={color}>{d.systolic}</text>
                <text x={cx + 9} y={yDia + 4} fontSize={11} fontWeight={600} fill={color}>{d.diastolic}</text>
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}

// Custom tooltip for BP: shows both systolic and diastolic together (the
// auto tooltip renders empty because the two Line series are transparent).
function BPTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-surface border border-line rounded-md shadow-sm px-2.5 py-1.5 text-[11px]">
      <div className="text-ink font-semibold mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-ink-3 text-[10px] w-[52px]">Systolic</span>
        <span className="font-mono tnum font-medium text-ink">{d.systolic}</span>
        <span className="text-ink-3 text-[10px]">mmHg</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-ink-3 text-[10px] w-[52px]">Diastolic</span>
        <span className="font-mono tnum font-medium text-ink">{d.diastolic}</span>
        <span className="text-ink-3 text-[10px]">mmHg</span>
      </div>
    </div>
  );
}

// Left-side scale for BP — mirrors the RangeBar shape used by other vitals
// but renders two distinct green normal zones (sys 100–120 and dia 60–80)
// with the spans in-between left neutral. Anchored to the same TOP_PAD /
// BOTTOM_PAD as RangeBar so the bar lines up with the plot area.
function BPRangeBar({ yDomain }) {
  const [yMin, yMax] = yDomain;
  const total = yMax - yMin;
  if (total <= 0) return null;

  const seg = (from, to, color, label, sub) => ({
    pct: ((to - from) / total) * 100,
    color, label, sub,
  });

  // Top → bottom across the visible y-domain. Only the two clinical normal
  // zones get a labeled gray fill; everything else is rendered neutral background.
  const segments = [];
  if (yMax > 120) segments.push(seg(120, yMax, null, null, null));
  segments.push(seg(Math.max(yMin, 100), Math.min(yMax, 120), "#7C857F", "Sys normal", "100–120"));
  if (yMin < 100 && yMax > 80) segments.push(seg(Math.max(yMin, 80), 100, null, null, null));
  if (yMin < 80) segments.push(seg(Math.max(yMin, 60), Math.min(yMax, 80), "#7C857F", "Dia normal", "60–80"));
  if (yMin < 60) segments.push(seg(yMin, 60, null, null, null));

  const TOP_PAD = 22;
  const BOTTOM_PAD = 34;

  return (
    <div className="flex items-stretch text-[9.5px] select-none shrink-0">
      <div className="w-1.5 flex flex-col rounded-full overflow-hidden" style={{ marginTop: TOP_PAD, marginBottom: BOTTOM_PAD }}>
        {segments.map((s, i) => (
          <div key={i} style={{ background: s.color || "#E5DFD3", height: `${s.pct}%`, minHeight: 2 }} />
        ))}
      </div>
      <div className="ml-1.5 flex flex-col" style={{ marginTop: TOP_PAD - 4, marginBottom: BOTTOM_PAD - 4 }}>
        {segments.map((s, i) => (
          <div
            key={i}
            className="flex flex-col justify-center leading-tight"
            style={{ height: `${s.pct}%`, color: s.color || "transparent" }}
          >
            {s.label && (
              <>
                <div className="font-medium">{s.label}</div>
                <div className="text-ink-3 font-mono text-[9px]">{s.sub}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function parseBPTargets(ref) {
  const m = ref.match(/(\d+)\s*\/\s*(\d+)/);
  if (!m) return null;
  return { sys: parseFloat(m[1]), dia: parseFloat(m[2]) };
}

function bpStatus(sys, dia, targets) {
  if (!targets) return "unknown";
  if (sys > targets.sys || dia > targets.dia) return "above";
  return "in";
}

function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function formatShortDate(d) {
  if (!d) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function parseRefRange(ref) {
  // Returns { low, high, lowStrict, highStrict }. Bounds may be null.
  // *Strict flags distinguish "> 40" (40 is out) from "≥ 40" (40 is in).
  const bp = ref.match(/(\d+)\s*\/\s*(\d+)/);
  if (bp) return { low: null, high: parseFloat(bp[1]), lowStrict: false, highStrict: false };
  const m = ref.match(/^\s*([<≤>≥])\s*(\d+\.?\d*)/);
  if (m) {
    const v = parseFloat(m[2]);
    const strict = m[1] === "<" || m[1] === ">";
    if (m[1] === "<" || m[1] === "≤") return { low: null, high: v, lowStrict: false, highStrict: strict };
    return { low: v, high: null, lowStrict: strict, highStrict: false };
  }
  const rg = ref.match(/(\d+\.?\d*)\s*[–-]\s*(\d+\.?\d*)/);
  if (rg) return { low: parseFloat(rg[1]), high: parseFloat(rg[2]), lowStrict: false, highStrict: false };
  return { low: null, high: null, lowStrict: false, highStrict: false };
}

function rangeStatus(value, range) {
  if (value == null || isNaN(value)) return "unknown";
  if (range.low == null && range.high == null) return "unknown";
  if (range.high != null && (range.highStrict ? value >= range.high : value > range.high)) return "above";
  if (range.low != null && (range.lowStrict ? value <= range.low : value < range.low)) return "below";
  return "in";
}

/* ============================================================
   COMBINED CHART EXPANSION — multi-series chart used by panels
   like "Cycle hormones" where 4 markers tell one story together.
   ============================================================ */
function CombinedChartExpansion({ panel, highlight, onClose }) {
  const { xLabel, series } = panel.combinedChart;
  const [hovered, setHovered] = useState(null);
  // The active series = mouse hover wins, otherwise the clicked row's series.
  const active = hovered ?? highlight;
  const activeSeries = series.find(s => s.name === active);

  // Pivot series → wide rows keyed by x. Each row carries the active series'
  // rangeLow / rangeHigh so an Area can render the phase-aware normal band.
  const xValues = Array.from(new Set(series.flatMap(s => s.points.map(p => p.x))));
  xValues.sort((a, b) => a - b);
  const chartData = xValues.map(x => {
    const row = { x };
    for (const s of series) {
      const pt = s.points.find(p => p.x === x);
      if (pt) row[s.name] = pt.value;
    }
    if (activeSeries) {
      const pt = activeSeries.points.find(p => p.x === x);
      if (pt && pt.rangeLow != null && pt.rangeHigh != null) {
        row.__rangeLow = pt.rangeLow;
        row.__rangeBand = pt.rangeHigh - pt.rangeLow;
      }
    }
    return row;
  });

  return (
    <div>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[9.5px] uppercase tracking-[0.14em] text-ink-3 mb-0.5">{panel.name}</div>
          <div className="font-display text-[18px] font-medium leading-tight">{panel.combinedChart.title ?? "Combined view"}</div>
          <div className="text-[11px] text-ink-3 mt-0.5">{panel.combinedChart.subtitle}</div>
        </div>
        <button className="text-[11px] text-ink-2 px-2 py-1 rounded-md border border-line hover:border-ink inline-flex items-center gap-1">
          <FlaskConical size={10} /> Order panel again
        </button>
      </div>

      <div style={{ height: 240 }} className="-mx-2">
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
            <XAxis dataKey="x" type="number" domain={["dataMin", "dataMax"]} stroke="#7C857F" fontSize={10} tickLine={false} axisLine={{ stroke: "#E5DFD3" }} label={{ value: xLabel, position: "insideBottom", offset: -2, fill: "#7C857F", fontSize: 10 }} />
            <YAxis stroke="#7C857F" fontSize={10} tickLine={false} axisLine={false} width={36} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload) return null;
                const visible = payload.filter(p => !String(p.dataKey).startsWith("__"));
                if (visible.length === 0) return null;
                return (
                  <div style={{ background: "white", border: "1px solid #E5DFD3", borderRadius: 6, fontSize: 11, padding: "6px 9px" }}>
                    <div style={{ color: "#15201A", fontWeight: 600, marginBottom: 4 }}>{xLabel} {label}</div>
                    {visible.map(p => (
                      <div key={p.dataKey} style={{ color: p.color }}>
                        {p.name}: <span style={{ fontFamily: "monospace" }}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            {panel.combinedChart.markerX != null && (
              <ReferenceLine x={panel.combinedChart.markerX} stroke="#15201A" strokeDasharray="2 2" strokeOpacity={0.4} label={{ value: panel.combinedChart.markerLabel ?? "", fill: "#7C857F", fontSize: 9, position: "top" }} />
            )}

            {/* Phase-aware normal-range band for the active series. Stacked Areas:
                the lower invisible Area pushes the visible band up to rangeLow. */}
            {activeSeries && (
              <>
                <Area type="monotone" dataKey="__rangeLow" stackId="range" stroke="none" fill="transparent" isAnimationActive={false} legendType="none" />
                <Area type="monotone" dataKey="__rangeBand" stackId="range" stroke="none" fill={activeSeries.color} fillOpacity={0.12} isAnimationActive={false} legendType="none" />
              </>
            )}

            {series.map(s => {
              const isActive = s.name === active;
              const dim = active && !isActive;
              return (
                <Line
                  key={s.name}
                  type="monotone"
                  dataKey={s.name}
                  stroke={s.color}
                  strokeWidth={isActive ? 2.8 : 1.6}
                  strokeOpacity={dim ? 0.18 : 1}
                  dot={{ fill: s.color, r: isActive ? 3.5 : 2.5, fillOpacity: dim ? 0.18 : 1, strokeOpacity: dim ? 0.18 : 1 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 flex-wrap justify-center mt-2 text-[10.5px] text-ink-3">
        {series.map(s => {
          const isActive = s.name === active;
          const dim = active && !isActive;
          return (
            <button
              key={s.name}
              onMouseEnter={() => setHovered(s.name)}
              onMouseLeave={() => setHovered(null)}
              className={`inline-flex items-center gap-1.5 transition cursor-default ${isActive ? "text-ink font-medium" : ""} ${dim ? "opacity-40" : ""}`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
              {s.name} {s.latest && <span className="font-mono text-ink-3">{s.latest}</span>}
            </button>
          );
        })}
      </div>
      {active && (
        <div className="text-[10px] text-ink-3 text-center mt-1.5">
          Shaded band shows the cycle-phase normal range for <span className="font-medium text-ink-2">{active}</span>.
        </div>
      )}
    </div>
  );
}

/* ============================================================
   TREND MODAL — kept for any legacy entry points but no longer
   the primary lab-detail surface (replaced by InlineTrendExpansion).
   ============================================================ */
function TrendModal({ test, onClose }) {
  const [system] = useLabUnits();
  const dispRef = formatLabRef(test.ref, test.unit, test.name, system);

  // Build chart data from values + dates. For BP, parse systolic only.
  // Apply unit conversion at chart-data level so axis, tooltip, and target line are coherent.
  const chartData = test.values
    .map((v, i) => {
      if (!v) return null;
      const isBP = String(v).includes("/");
      const numeric = isBP ? parseFloat(String(v).split("/")[0]) : parseFloat(v);
      if (isNaN(numeric)) return null;
      if (isBP) {
        return { date: test.dates[i], value: numeric, raw: v, flag: test.flags[i] };
      }
      const { v: cv } = convertLabNumber(numeric, test.unit, test.name, system);
      return { date: test.dates[i], value: cv, raw: String(cv), flag: test.flags[i] };
    })
    .filter(Boolean);

  // Parse target from displayed ref so it sits in the correct unit system
  const parseTarget = (ref) => {
    const m = ref.match(/[≤<>]\s*(\d+\.?\d*)/);
    if (m) return parseFloat(m[1]);
    const range = ref.match(/(\d+\.?\d*)[–-](\d+\.?\d*)/);
    if (range) return parseFloat(range[2]);
    return null;
  };
  const target = parseTarget(dispRef.ref);

  const lastValue = chartData[chartData.length - 1];
  const firstValue = chartData[0];
  const delta = lastValue && firstValue ? (lastValue.value - firstValue.value).toFixed(2) : null;
  const deltaPct = delta && firstValue.value ? ((delta / firstValue.value) * 100).toFixed(1) : null;
  const deltaUp = delta > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-surface border border-line rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-line-2">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold">Trend</span>
              <span className="text-[10.5px] text-ink-3">· {chartData.length} readings</span>
            </div>
            <h2 className="font-display text-[24px] font-medium leading-tight">{test.name}</h2>
            <div className="text-[12px] text-ink-3 mt-0.5">
              Reference range: <span className="font-mono text-ink-2">{dispRef.ref}</span>
              {dispRef.unit && dispRef.unit !== "—" && <> {dispRef.unit}</>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-[11.5px] text-ink-2 px-2.5 py-1.5 rounded-md border border-line hover:border-ink inline-flex items-center gap-1">
              <FlaskConical size={11} /> Order again
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-md hover:bg-surface-2 text-ink-3 flex items-center justify-center">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Headline */}
        <div className="px-6 py-4 grid grid-cols-3 gap-6 border-b border-line-2 bg-surface-2/40">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-0.5">Latest</div>
            <div className="flex items-baseline gap-1">
              <span className={`font-display text-[28px] font-medium tnum ${
                lastValue?.flag === "high" ? "text-crimson" :
                lastValue?.flag === "warn" || lastValue?.flag === "low" ? "text-amber" :
                "text-ink"
              }`}>{lastValue?.raw ?? "—"}</span>
              <span className="text-[11px] text-ink-3">{dispRef.unit !== "—" && dispRef.unit}</span>
            </div>
            <div className="text-[10.5px] text-ink-3 mt-0.5">{lastValue?.date}</div>
          </div>
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-0.5">Change since first reading</div>
            <div className="flex items-baseline gap-1">
              <span className={`font-display text-[28px] font-medium tnum ${deltaUp ? "text-crimson" : "text-jade-2"}`}>
                {deltaUp ? "↑" : "↓"} {Math.abs(delta)}
              </span>
              <span className="text-[11px] text-ink-3">{deltaPct && `(${deltaPct}%)`}</span>
            </div>
            <div className="text-[10.5px] text-ink-3 mt-0.5">{firstValue?.date} → {lastValue?.date}</div>
          </div>
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-0.5">Target</div>
            <div className="font-display text-[28px] font-medium tnum text-jade">{target ?? "—"}</div>
            <div className="text-[10.5px] text-ink-3 mt-0.5">{dispRef.ref}</div>
          </div>
        </div>

        {/* Chart */}
        <div className="px-6 py-5">
          <div style={{ height: 280 }} className="-mx-2">
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 12, right: 16, left: 12, bottom: 8 }}>
                <XAxis dataKey="date" stroke="#7C857F" fontSize={11} tickLine={false} axisLine={{ stroke: "#E5DFD3" }} />
                <YAxis stroke="#7C857F" fontSize={11} tickLine={false} axisLine={false} width={40} />
                <Tooltip
                  contentStyle={{ background: "white", border: "1px solid #E5DFD3", borderRadius: 6, fontSize: 11 }}
                  labelStyle={{ color: "#15201A", fontWeight: 600 }}
                  formatter={(value) => [value, test.name]}
                />
                {target && (
                  <ReferenceLine y={target} stroke="#1F4D3F" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: `target ${dispRef.ref}`, fill: "#7C857F", fontSize: 10, position: "right" }} />
                )}
                <Line type="monotone" dataKey="value" stroke="#C25E3F" strokeWidth={2.4} dot={{ fill: "#C25E3F", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-line-2 bg-surface-2/40 flex items-center justify-between text-[11px] text-ink-3">
          <span>Dashed line marks the clinical target. Hover any point for exact value.</span>
          <button onClick={onClose} className="text-[11.5px] text-ink-2 hover:text-ink">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   NEW PATIENT MODAL — quick-create from Patients page
   Mirrors Orders Step 1 inline-create with TG-first unlock
   ============================================================ */
/* ============================================================
   HOSPITAL REFERRAL MODAL — for services Kura doesn't provide
   (surgery, MRI, specialty consults, inpatient admission, etc.)
   Phased flow: service → hospital → letter → sent.
   ============================================================ */
function HospitalReferralModal({ patient, onClose }) {
  const [phase, setPhase] = useState("service"); // 'service' | 'hospital' | 'letter' | 'sent'
  const [service, setService] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [urgency, setUrgency] = useState("routine"); // 'routine' | 'urgent' | 'stat'
  const [reason, setReason] = useState("");
  const [question, setQuestion] = useState("");
  const [attachLabs, setAttachLabs] = useState(true);
  const [attachImaging, setAttachImaging] = useState(true);
  const [attachMeds, setAttachMeds] = useState(true);
  const [referralRef] = useState(() => `KR-${patient.id.split("-")[1]}-${Math.floor(Math.random()*9000+1000)}`);

  const SERVICES = [
    { id: "surgery",     label: "Surgery",       desc: "Thyroidectomy · appendectomy · hernia · etc.", icon: <Cross size={16} /> },
    { id: "imaging",     label: "Imaging",       desc: "MRI · CT · PET · echo",                       icon: <Activity size={16} /> },
    { id: "specialty",   label: "Specialty consult", desc: "Oncology · cardio · endo · neuro",        icon: <Stethoscope size={16} /> },
    { id: "inpatient",   label: "Inpatient admission", desc: "Acute · observation · IV care",         icon: <Building2 size={16} /> },
    { id: "mental",      label: "Mental health", desc: "Psychiatry · therapy · crisis",                icon: <Activity size={16} /> },
    { id: "rehab",       label: "Rehab / PT",    desc: "Physio · post-surgical · cardiac rehab",       icon: <PersonStanding size={16} /> },
  ];

  // Mock hospital recommendations — would come from a network API filtered by
  // service + patient location + insurance + recency-weighted volume.
  const hospitalsForService = {
    surgery: [
      { id: "h1", name: "Royal Phnom Penh Hospital",    distance: "3.2 km",  wait: "Next slot Mon 26 May",       cost: "$1,200–$1,600", insurance: ["Forte", "NSSF"], tag: "Kura-partner" },
      { id: "h2", name: "Sunrise Japan Hospital",        distance: "6.8 km",  wait: "Wed 28 May · 9:00",          cost: "$1,800–$2,400", insurance: ["Forte"],         tag: "Verified" },
      { id: "h3", name: "Calmette Hospital · Endocrine", distance: "4.1 km",  wait: "Fri 30 May · multi-step",    cost: "Public · $250–$450", insurance: ["NSSF"],     tag: "Public" },
    ],
    imaging: [
      { id: "h4", name: "Royal Phnom Penh · Radiology",  distance: "3.2 km",  wait: "Tomorrow 14:00",   cost: "$120–$180",    insurance: ["Forte", "NSSF"], tag: "Kura-partner" },
      { id: "h5", name: "Diagnostic Center BKK",         distance: "1.8 km",  wait: "Same-day · walk-in", cost: "$95–$140",    insurance: ["Forte"],         tag: "Verified" },
    ],
    specialty: [
      { id: "h6", name: "Dr. Sophy Khun · Endocrinology", distance: "2.4 km", wait: "10 days",          cost: "$60 consult",  insurance: ["Forte"],         tag: "Kura-partner" },
      { id: "h7", name: "Royal Cardio Group",            distance: "3.2 km",  wait: "5 days",           cost: "$80 consult",  insurance: ["Forte", "NSSF"], tag: "Verified" },
    ],
    inpatient: [
      { id: "h8", name: "Royal Phnom Penh Hospital",     distance: "3.2 km",  wait: "Bed available",    cost: "$200/day",     insurance: ["Forte", "NSSF"], tag: "Kura-partner" },
    ],
    mental: [
      { id: "h9", name: "Khmer-Soviet Friendship",       distance: "5.6 km",  wait: "3 weeks",          cost: "Public · $0–$30", insurance: ["NSSF"],       tag: "Public" },
    ],
    rehab: [
      { id: "h10", name: "Kura Rehab Center BKK1",       distance: "1.2 km",  wait: "Next week",        cost: "$25/session",  insurance: ["Forte"],         tag: "Kura-partner" },
    ],
  };

  const submit = () => setPhase("sent");

  const stepLabel = {
    service:  "Step 1 of 3 · Choose a service",
    hospital: "Step 2 of 3 · Pick a destination",
    letter:   "Step 3 of 3 · Draft the letter",
    sent:     "Referral sent",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface border border-line rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-line-2">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-0.5">{stepLabel[phase]}</div>
            <h2 className="font-display text-[22px] font-medium leading-tight">
              {phase === "service"  && "Where does the patient need to go?"}
              {phase === "hospital" && "Choose a destination"}
              {phase === "letter"   && "Compose the referral"}
              {phase === "sent"     && "Referral on its way"}
            </h2>
            {phase !== "sent" && (
              <p className="text-[12px] text-ink-3 mt-1">
                For <span className="text-ink-2 font-medium">{patient.name}</span> · MRN <span className="font-mono">{patient.id}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-md hover:bg-surface-2 text-ink-3 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {/* Phase: SERVICE */}
          {phase === "service" && (
            <div className="grid grid-cols-2 gap-2.5">
              {SERVICES.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setService(s); setPhase("hospital"); }}
                  className="text-left rounded-lg border border-line p-3.5 hover:border-ink hover:bg-surface-2/40 transition group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-md bg-jade-soft text-jade flex items-center justify-center shrink-0">
                      {s.icon}
                    </div>
                    <div className="text-[14px] font-semibold">{s.label}</div>
                    <ArrowRight size={13} className="ml-auto text-ink-3 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <div className="text-[11.5px] text-ink-3 leading-snug">{s.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* Phase: HOSPITAL */}
          {phase === "hospital" && service && (
            <>
              <div className="flex items-center gap-2 mb-3 text-[11.5px]">
                <span className="text-ink-3">Service:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-jade-soft text-jade-2 font-medium">
                  {service.label}
                </span>
                <button onClick={() => setPhase("service")} className="text-ink-3 hover:text-ink underline-offset-2 hover:underline">change</button>
              </div>
              <p className="text-[11.5px] text-ink-3 mb-3 leading-snug">
                Sorted by Kura partnership tier, distance from patient, and insurance match. Cost ranges are typical for this procedure category.
              </p>
              <ul className="space-y-2">
                {(hospitalsForService[service.id] || []).map(h => (
                  <li key={h.id}>
                    <button
                      onClick={() => { setHospital(h); setPhase("letter"); }}
                      className="w-full text-left rounded-lg border border-line p-3 hover:border-ink hover:bg-surface-2/40 transition group flex items-start gap-3"
                    >
                      <div className="w-9 h-9 rounded-md bg-line-2 text-ink-2 flex items-center justify-center shrink-0">
                        <Building2 size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[13px] font-semibold">{h.name}</span>
                          <span className={`text-[9.5px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
                            h.tag === "Kura-partner" ? "text-jade-2 bg-jade-soft" :
                            h.tag === "Verified"     ? "text-ink-2 bg-line-2" :
                                                       "text-ink-3 bg-line-2"
                          }`}>{h.tag}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-ink-3">
                          <span className="inline-flex items-center gap-1"><MapPin size={10} /> {h.distance}</span>
                          <span className="inline-flex items-center gap-1"><Clock size={10} /> {h.wait}</span>
                          <span className="inline-flex items-center gap-1"><Banknote size={10} /> {h.cost}</span>
                        </div>
                        <div className="text-[10.5px] text-ink-3 mt-1">
                          Accepts: <span className="font-mono text-ink-2">{h.insurance.join(" · ")}</span>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-ink-3 opacity-0 group-hover:opacity-100 transition shrink-0 mt-2" />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Phase: LETTER */}
          {phase === "letter" && service && hospital && (
            <>
              <div className="flex items-center gap-2 mb-3 text-[11.5px] flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-jade-soft text-jade-2 font-medium">{service.label}</span>
                <ArrowRight size={11} className="text-ink-3" />
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-line-2 text-ink-2 font-medium">{hospital.name}</span>
                <button onClick={() => setPhase("hospital")} className="text-ink-3 hover:text-ink underline-offset-2 hover:underline ml-1">change</button>
              </div>

              <div className="rounded-md border border-line bg-surface-2/40 p-3 mb-4">
                <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-2">Patient summary · auto-filled</div>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div><span className="text-ink-3">Name</span> · <span className="text-ink-2 font-medium">{patient.name}</span></div>
                  <div><span className="text-ink-3">MRN</span> · <span className="font-mono text-ink-2">{patient.id}</span></div>
                  <div><span className="text-ink-3">Age / Sex</span> · <span className="text-ink-2">{patient.age} / {patient.sex === "M" ? "♂" : "♀"}</span></div>
                  <div><span className="text-ink-3">Insurance</span> · <span className="text-ink-2">{patient.insurance}</span></div>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1.5">Urgency</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "routine", label: "Routine",  sub: "Next available", color: "border-line text-ink-2",            active: "border-jade-2 bg-jade-soft text-jade-2" },
                    { id: "urgent",  label: "Urgent",   sub: "Within 1 week",  color: "border-line text-ink-2",            active: "border-amber bg-amber-soft text-amber" },
                    { id: "stat",    label: "Stat",     sub: "Today / 48h",    color: "border-line text-ink-2",            active: "border-crimson bg-crimson-soft text-crimson" },
                  ].map(u => (
                    <button
                      key={u.id}
                      onClick={() => setUrgency(u.id)}
                      className={`text-left px-2.5 py-2 rounded-md border transition ${urgency === u.id ? u.active + " font-medium" : u.color + " hover:border-ink"}`}
                    >
                      <div className="text-[12px]">{u.label}</div>
                      <div className="text-[10px] text-ink-3 mt-0.5">{u.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1.5">Reason for referral</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={2}
                  placeholder="Suspected pathology, symptoms, relevant findings…"
                  className="w-full px-3 py-2 rounded-md border border-line bg-surface text-[12.5px] focus:border-ink focus:outline-none leading-snug"
                />
              </div>

              <div className="mb-3">
                <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1.5">Specific question</label>
                <input
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="e.g. Suitable surgical candidate for total thyroidectomy?"
                  className="w-full px-3 py-2 rounded-md border border-line bg-surface text-[12.5px] focus:border-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1.5">Attach to letter</label>
                <div className="space-y-1.5">
                  <AttachToggle checked={attachLabs}    onChange={() => setAttachLabs(v => !v)}    label="Relevant labs"        sub="Last 12 mo · HbA1c, TSH, lipid panel, etc." />
                  <AttachToggle checked={attachImaging} onChange={() => setAttachImaging(v => !v)} label="Imaging studies"      sub="ECG, X-rays, ultrasound from Documents" />
                  <AttachToggle checked={attachMeds}    onChange={() => setAttachMeds(v => !v)}    label="Current medications"  sub="Active Rx list + allergies" />
                </div>
              </div>
            </>
          )}

          {/* Phase: SENT */}
          {phase === "sent" && service && hospital && (
            <>
              <div className="rounded-md border border-jade bg-jade-soft/60 px-4 py-4 mb-4 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-jade-2 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-[13px] text-ink font-medium">Referral sent to {hospital.name}</div>
                  <div className="text-[11.5px] text-ink-2 mt-1 leading-snug">
                    Letter delivered to their referrals desk. {patient.name} receives a Telegram with the appointment slot once accepted.
                  </div>
                </div>
              </div>
              <div className="rounded-md border border-line bg-surface-2 p-3 mb-3">
                <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-2">Referral ref</div>
                <div className="font-mono text-[14px] text-ink">{referralRef}</div>
                <div className="hairline my-2.5" />
                <div className="grid grid-cols-2 gap-2 text-[11.5px]">
                  <div><span className="text-ink-3">Service</span> · <span className="text-ink-2">{service.label}</span></div>
                  <div><span className="text-ink-3">Urgency</span> · <span className="text-ink-2 capitalize">{urgency}</span></div>
                  <div><span className="text-ink-3">Hospital</span> · <span className="text-ink-2">{hospital.name}</span></div>
                  <div><span className="text-ink-3">Est. response</span> · <span className="text-ink-2">{urgency === "stat" ? "1–4 hours" : urgency === "urgent" ? "24 hours" : "2 business days"}</span></div>
                </div>
              </div>
              <p className="text-[11px] text-ink-3 leading-snug">
                Track this referral from the Referrals view in your sidebar. Status auto-updates when the hospital confirms, books, or returns a summary.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-line-2 bg-surface-2/40 flex items-center justify-between">
          <span className="text-[11px] text-ink-3">
            {phase === "service"  && "Kura's network · 28 partner hospitals across Phnom Penh + Siem Reap"}
            {phase === "hospital" && "Costs reflect Kura-negotiated rates where available"}
            {phase === "letter"   && "Letter is signed by you · audit-trail logged on send"}
            {phase === "sent"     && "You can withdraw within 24h before the hospital confirms"}
          </span>
          <div className="flex items-center gap-2">
            {phase === "hospital" && (
              <button onClick={() => setPhase("service")} className="text-[12px] text-ink-3 hover:text-ink px-3 py-1.5">← Back</button>
            )}
            {phase === "letter" && (
              <>
                <button onClick={() => setPhase("hospital")} className="text-[12px] text-ink-3 hover:text-ink px-3 py-1.5">← Back</button>
                <button onClick={submit} className="text-[12px] bg-jade text-white px-3 py-1.5 rounded-md font-medium hover:opacity-90 inline-flex items-center gap-1.5">
                  <Send size={11} /> Send referral
                </button>
              </>
            )}
            {phase === "sent" && (
              <button onClick={onClose} className="text-[12px] bg-jade text-white px-3 py-1.5 rounded-md font-medium hover:opacity-90">
                Done
              </button>
            )}
            {phase === "service" && (
              <button onClick={onClose} className="text-[12px] text-ink-3 hover:text-ink px-3 py-1.5">Cancel</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AttachToggle({ checked, onChange, label, sub }) {
  return (
    <label className="flex items-start gap-2.5 px-2.5 py-2 rounded-md border border-line bg-surface hover:border-ink cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-jade-2 mt-0.5" />
      <div className="flex-1">
        <div className="text-[12px] text-ink font-medium">{label}</div>
        <div className="text-[10.5px] text-ink-3 mt-0.5">{sub}</div>
      </div>
    </label>
  );
}

function OTPInput({ value, onChange, length = 6 }) {
  const refs = useRef([]);

  const handleChange = (idx, val) => {
    if (val.length > 1) {
      // Paste — fill all boxes
      const digits = val.replace(/\D/g, "").slice(0, length);
      onChange(digits);
      const focusIdx = Math.min(digits.length, length - 1);
      requestAnimationFrame(() => refs.current[focusIdx]?.focus());
      return;
    }
    const d = val.replace(/\D/g, "");
    if (val && !d) return; // ignore non-digit
    const arr = (value + "      ").slice(0, length).split("");
    arr[idx] = d;
    const joined = arr.join("").trimEnd();
    onChange(joined);
    if (d && idx < length - 1) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      e.preventDefault();
      const arr = (value + "      ").slice(0, length).split("");
      arr[idx - 1] = "";
      onChange(arr.join("").trimEnd());
      refs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) refs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < length - 1) refs.current[idx + 1]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          autoFocus={i === 0}
          className="w-11 h-12 text-center text-[20px] font-mono border border-line rounded-md focus:border-ink focus:outline-none bg-surface caret-ink"
        />
      ))}
    </div>
  );
}

function NewPatientModal({ onClose, onConfirmPatient }) {
  // Phased flow — phone-first, lookup, verify, confirm-or-deny:
  //   'lookup'      → phone input
  //   'no-match'    → phone unknown · continue to create
  //   'otp'         → match found · OTP auto-sent · enter 6-digit code
  //   'own-panel'   → already in your panel · open existing
  //   'confirm'     → code verified · masked card · "Is this the right patient?"
  //   'mismatch'    → doctor said No · identity mismatch fallback
  //   'create'      → new-patient form (only from no-match)
  const [phase, setPhase] = useState("lookup");
  const [phone, setPhone] = useState("");
  const [match, setMatch] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [lookupCount, setLookupCount] = useState(0);
  const [lastLookupAt, setLastLookupAt] = useState(0);

  // Create-form state
  const [name, setName] = useState("");
  const [khmer, setKhmer] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("M");
  const [insurance, setInsurance] = useState("self-pay");

  // Resend countdown tick
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  // Auto-verify when OTP reaches 6 digits (mock — any 6 digits passes).
  useEffect(() => {
    if (phase !== "otp" || otp.length < 6) return;
    setOtpError("");
    const t = setTimeout(() => setPhase("confirm"), 350);
    return () => clearTimeout(t);
  }, [otp, phase]);

  const phoneClean = phone.replace(/\D/g, "");
  const phoneValid = phoneClean.length >= 8 && phoneClean.length <= 9;
  const phonePretty = `+855 ${phoneClean.slice(0, 2)} ${phoneClean.slice(2, 5)} ${phoneClean.slice(5)}`.trim();

  // Demo registry — three scenarios. Last 8 digits drive the match.
  //   17555103  → already in YOUR panel
  //   23456789  → in ANOTHER doctor's panel (bridge path)
  //   21000200  → Kura-wide PSC self-serve (bridge path, no current doctor)
  const kuraRegistry = [
    { kid: "K-19204", name: "Channary Sok", phoneLast: "17555103", scope: "own-panel",
      ageRange: "45–49", sex: "F",
      provenance: "Already in your panel · added 2025-08-14" },
    { kid: "K-44102", name: "Dara Heng",    phoneLast: "23456789", scope: "other-panel",
      ageRange: "55–59", sex: "M",
      provenance: "In Dr. Lim's panel · BKK2 cabinet" },
    { kid: "K-71558", name: "Sopheap Mao",  phoneLast: "21000200", scope: "kura-wide",
      ageRange: "30–34", sex: "F",
      provenance: "Seen at PSC BKK1 · self-serve labs" },
  ];

  // Soft rate limit — visible in the footer; throttles after 5 quick lookups.
  const RATE_LIMIT = 30; // per session, mocked
  const RAPID_WINDOW_MS = 60 * 1000;
  const tooFast = Date.now() - lastLookupAt < 800 && lookupCount > 2;

  const runLookup = () => {
    if (!phoneValid) return;
    setLookupCount(c => c + 1);
    setLastLookupAt(Date.now());
    const last8 = phoneClean.slice(-8);
    const hit = kuraRegistry.find(p => p.phoneLast === last8);
    if (hit) {
      setMatch(hit);
      if (hit.scope === "own-panel") {
        setPhase("own-panel");
      } else {
        setOtp("");
        setOtpError("");
        setResendCountdown(30);
        setPhase("otp");
      }
    } else {
      setPhase("no-match");
    }
  };

  const resendCode = () => {
    setOtp("");
    setOtpError("");
    setResendCountdown(30);
  };

  const maskName = (full) =>
    full.split(" ").map(w => w.length <= 2 ? w : w[0] + "•".repeat(w.length - 2) + w[w.length - 1]).join(" ");

  const maskedPhone = phoneClean.length >= 8
    ? `+855 ${phoneClean.slice(0, 2)} ••• ${phoneClean.slice(-3)}`
    : phonePretty;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface border border-line rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-line-2">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-0.5">New patient</div>
            <h2 className="font-display text-[19px] font-medium leading-tight">
              {phase === "lookup" || phase === "own-panel" ? "Look up by phone" :
               phase === "no-match" || phase === "create" ? "Add a new patient" :
               phase === "otp" ? "Enter the code" :
               phase === "confirm" ? "Is this the right patient?" :
               phase === "mismatch" ? "Identity mismatch" :
               "Patient confirmed"}
            </h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md hover:bg-surface-2 text-ink-3 flex items-center justify-center">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {/* Phase: LOOKUP */}
          {phase === "lookup" && (
            <>
              <p className="text-[12px] text-ink-3 mb-3 leading-snug">
                Phone is the dedup key. If the patient already exists in Kura — your panel, another doctor's, or a PSC walk-in — we'll find them.
              </p>
              <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1.5">Mobile</label>
              <div className="flex items-center gap-2">
                <span className="text-[12.5px] text-ink-3 font-mono px-2 py-2 rounded-md border border-line bg-surface-2">+855</span>
                <input
                  autoFocus
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="12 345 678"
                  className="flex-1 px-3 py-2 rounded-md border border-line bg-surface text-[13px] focus:border-ink focus:outline-none font-mono"
                />
              </div>
              <p className="text-[10.5px] text-ink-3 mt-1.5">8–9 digits. Try <span className="font-mono">23 456 789</span> (another doctor's panel) or <span className="font-mono">21 000 200</span> (PSC walk-in).</p>
              {tooFast && (
                <p className="text-[10.5px] text-amber mt-2 inline-flex items-center gap-1.5">
                  <AlertTriangle size={11} /> Slow down — high lookup rate triggers an audit entry.
                </p>
              )}
            </>
          )}

          {/* Phase: NO MATCH — proceed to create */}
          {phase === "no-match" && (
            <>
              <div className="rounded-md border border-jade bg-jade-soft/60 px-3 py-2.5 mb-3 flex items-start gap-2">
                <CheckCircle2 size={13} className="text-jade-2 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[12px] text-ink font-medium">Phone is new in Kura</div>
                  <div className="text-[10.5px] text-ink-3 font-mono">{phonePretty}</div>
                </div>
              </div>
              <button onClick={() => setPhase("create")} className="w-full text-[12.5px] bg-jade text-white px-3 py-2 rounded-md font-medium hover:opacity-90 inline-flex items-center justify-center gap-1.5">
                <Plus size={12} /> Continue · enter patient details
              </button>
              <button onClick={() => setPhase("lookup")} className="w-full text-[11px] text-ink-3 hover:text-ink mt-2">
                ← Look up a different phone
              </button>
            </>
          )}

          {/* Phase: OTP — match found, code sent, doctor enters it */}
          {phase === "otp" && (
            <>
              <p className="text-[12.5px] text-ink-2 leading-snug mb-1">
                We sent a 6-digit code to <span className="font-mono text-ink">{maskedPhone}</span> via SMS.
              </p>
              <p className="text-[11.5px] text-ink-3 mb-4 leading-snug">
                Ask the patient to read it out — entering it confirms they're the person we have on file.
              </p>

              <OTPInput value={otp} onChange={(v) => { setOtp(v); setOtpError(""); }} length={6} />

              {otpError && (
                <p className="text-[11px] text-crimson mt-2 text-center">{otpError}</p>
              )}

              <div className="text-center mt-4 text-[11px]">
                {resendCountdown > 0 ? (
                  <span className="text-ink-3">Resend code in <span className="font-mono">{resendCountdown}s</span></span>
                ) : (
                  <button onClick={resendCode} className="text-jade-2 font-medium hover:underline">Resend code</button>
                )}
              </div>

              <button onClick={() => setPhase("lookup")} className="w-full text-[11px] text-ink-3 hover:text-ink mt-3">
                ← Change Phone
              </button>
            </>
          )}

          {/* Phase: OWN PANEL — already yours */}
          {phase === "own-panel" && match && (
            <>
              <div className="rounded-md border border-line-2 bg-surface-2 px-3 py-2.5 mb-3 flex items-start gap-2">
                <CheckCircle2 size={13} className="text-jade-2 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[12px] text-ink font-medium">Already in your panel</div>
                  <div className="text-[10.5px] text-ink-2 mt-0.5">{match.provenance}</div>
                </div>
              </div>
              <button onClick={onClose} className="w-full text-[12.5px] bg-jade text-white px-3 py-2 rounded-md font-medium hover:opacity-90 inline-flex items-center justify-center gap-1.5">
                Open existing record <ArrowRight size={12} />
              </button>
              <p className="text-[10px] text-ink-3 mt-3">Duplicate creation is blocked when the phone is already on your panel.</p>
            </>
          )}

          {/* Phase: CONFIRM — code verified, masked card, doctor checks identity */}
          {phase === "confirm" && match && (
            <>
              <p className="text-[12px] text-ink-2 mb-3 leading-snug">
                The code was verified. Confirm with the patient that this is the right person before we open the chart.
              </p>
              <div className="rounded-md border border-line bg-surface-2 px-3 py-3 mb-3">
                <div className="font-display text-[20px] font-medium leading-tight">{maskName(match.name)}</div>
                <div className="text-[11.5px] text-ink-2 mt-1">{match.ageRange} · {match.sex === "F" ? "Female" : match.sex === "M" ? "Male" : "Other"} · MRN <span className="font-mono">{match.kid}</span></div>
                <div className="text-[10px] text-ink-3 mt-1.5">{match.provenance}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPhase("mismatch")}
                  className="text-[12px] text-ink-2 px-3 py-2 rounded-md border border-line hover:border-crimson hover:text-crimson transition"
                >
                  No, not {match.name.split(" ")[0][0]}•••
                </button>
                <button
                  onClick={() => {
                    onConfirmPatient && onConfirmPatient(match.kid, match.name);
                    onClose();
                  }}
                  className="text-[12.5px] bg-jade text-white px-3 py-2 rounded-md font-medium hover:opacity-90 inline-flex items-center justify-center gap-1.5"
                >
                  Yes, this is {match.name.split(" ")[0][0]}••• <ArrowRight size={12} />
                </button>
              </div>
              <button
                onClick={() => openEntityInNewTab("patient", { id: match.kid, name: match.name })}
                className="mt-2 w-full text-[11px] text-jade-2 hover:underline inline-flex items-center justify-center gap-1.5 py-1"
              >
                <ExternalLink size={11} /> Open chart in a new tab
              </button>
              <p className="text-[10px] text-ink-3 mt-2 leading-snug">
                Yes → patient is added to your panel and we open the chart. No → flagged as a possible code-holder mismatch.
              </p>
            </>
          )}

          {/* Phase: MISMATCH — doctor said No · identity mismatch fallback */}
          {phase === "mismatch" && (
            <>
              <div className="rounded-md border border-amber bg-amber-soft/60 px-3 py-3 mb-3 flex items-start gap-2.5">
                <AlertTriangle size={14} className="text-amber shrink-0 mt-0.5" />
                <div>
                  <div className="text-[12px] text-ink font-medium">Code holder is not the patient</div>
                  <div className="text-[10.5px] text-ink-2 mt-0.5 leading-snug">
                    Someone with access to this phone confirmed the code, but the doctor confirms it's not the person on file. This is rare — possibly a stolen / shared device, or the registry has the wrong phone.
                  </div>
                </div>
              </div>
              <div className="text-[11.5px] text-ink-2 leading-snug space-y-1.5 mb-3">
                <div className="font-medium">What happens next:</div>
                <div className="text-ink-3">· Bridge request is denied · logged in the audit trail.</div>
                <div className="text-ink-3">· Kura support is paged to investigate the phone-to-patient mapping.</div>
                <div className="text-ink-3">· No PHI is revealed — the chart never opens for this lookup.</div>
              </div>
              <button onClick={() => setPhase("lookup")} className="w-full text-[12.5px] bg-jade text-white px-3 py-2 rounded-md font-medium hover:opacity-90">
                Try a different phone
              </button>
              <button onClick={onClose} className="w-full text-[11px] text-ink-3 hover:text-ink mt-2">
                Close
              </button>
            </>
          )}

          {/* Phase: CREATE — proper new patient */}
          {phase === "create" && (
            <>
              <div className="text-[11px] text-ink-3 mb-3">
                Phone: <span className="font-mono text-ink-2">{phonePretty}</span>{" "}
                <button onClick={() => setPhase("lookup")} className="text-ink-3 hover:text-ink underline ml-1">change</button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1.5">Full name (Latin)</label>
                  <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sokha Chann" className="w-full px-3 py-2 rounded-md border border-line bg-surface text-[13px] focus:border-ink focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1.5">Khmer name <span className="text-ink-3 normal-case">(optional)</span></label>
                  <input value={khmer} onChange={e => setKhmer(e.target.value)} placeholder="ឆាន សុខា" className="w-full px-3 py-2 rounded-md border border-line bg-surface text-[13px] focus:border-ink focus:outline-none" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1.5">Age</label>
                    <input value={age} onChange={e => setAge(e.target.value)} placeholder="54" className="w-full px-3 py-2 rounded-md border border-line bg-surface text-[13px] focus:border-ink focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1.5">Sex</label>
                    <select value={sex} onChange={e => setSex(e.target.value)} className="w-full px-3 py-2 rounded-md border border-line bg-surface text-[13px]">
                      <option value="M">Male</option><option value="F">Female</option><option value="O">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1.5">Insurance</label>
                    <select value={insurance} onChange={e => setInsurance(e.target.value)} className="w-full px-3 py-2 rounded-md border border-line bg-surface text-[13px]">
                      <option value="self-pay">Self-pay</option>
                      <option value="forte">Forte</option>
                      <option value="nssf">NSSF</option>
                    </select>
                  </div>
                </div>
              </div>
              <p className="text-[10.5px] text-ink-3 mt-3 leading-snug">
                On save, the patient receives a Telegram welcome with an ID-confirm link (T3 → T1).
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-line-2 bg-surface-2/50 flex items-center justify-between text-[10.5px]">
          <span className="text-ink-3 inline-flex items-center gap-1.5">
            <Lock size={10} /> {lookupCount} of {RATE_LIMIT} lookups today · audited
          </span>
          {phase === "lookup" && (
            <button
              onClick={runLookup}
              disabled={!phoneValid || tooFast}
              className={`text-[12px] px-3 py-1.5 rounded-md font-medium inline-flex items-center gap-1.5 ${phoneValid && !tooFast ? "bg-jade text-white hover:opacity-90" : "bg-line text-ink-3 cursor-not-allowed"}`}
            >
              Check phone <ArrowRight size={11} />
            </button>
          )}
          {phase === "create" && (
            <button onClick={onClose} className="text-[12px] bg-jade text-white px-3 py-1.5 rounded-md font-medium hover:opacity-90 inline-flex items-center gap-1.5">
              <Plus size={11} /> Save patient
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   REFER A COLLEAGUE MODAL — doctor-to-doctor referral program
   Network effect: more doctors → better lab economics → free SEO compounds
   ============================================================ */
/* ============================================================
   EKYC FLOW — multi-step verification wizard. Promotes the doctor from
   Explorer → Verified on completion. Skippable at every step. UI-only —
   nothing actually uploads or talks to MoH. Pattern mimics a signup-style
   onboarding so we can reuse it as the real signup later.
   ============================================================ */
/* Landing popup that fires for Explorer-tier doctors the moment they enter
   the app. Inspired by Doctolib's CPS verification prompt — a friendly,
   benefit-led gate that stakes the verification flow up front rather than
   waiting for them to discover the banner. CTA opens EkycFlowModal; the X
   and "I'll do it later" link defer to the persistent ExplorerBanner. */
function EkycLandingPrompt({ onClose, onStart }) {
  return createPortal(
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-bg border border-line rounded-xl shadow-xl w-full max-w-[460px] overflow-hidden relative">
        <button onClick={onClose} aria-label="Close" className="absolute top-3.5 right-3.5 text-ink-3 hover:text-ink p-1 -m-1 z-10">
          <X size={16} />
        </button>

        <div className="px-7 pt-8 pb-7 text-center">
          <div className="mb-5 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-jade-soft flex items-center justify-center">
              <ShieldCheck size={26} className="text-jade-2" strokeWidth={1.75} />
            </div>
          </div>

          <h2 className="font-display text-[20px] font-medium leading-snug mb-2">
            Verify your license
          </h2>

          <p className="text-[13px] text-ink-2 leading-relaxed mb-6 px-2">
            Confirm your MoH license to use Kura with real patients.
          </p>

          <Button onClick={onStart} className="w-full" size="lg">
            Verify license
          </Button>

          <button
            onClick={onClose}
            className="mt-3 text-[12px] text-ink-3 hover:text-ink-2 underline-offset-2 hover:underline"
          >
            Keep exploring
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function EkycFlowModal({ onClose, onComplete }) {
  const [step, setStep] = useState(0); // 0..3 form steps · 4 = success
  const STEPS = ["License details", "Identity", "Practice", "Review"];

  // Pre-seeded with reasonable defaults so the doctor can click through fast
  // and see the flow shape. Real form would be empty.
  const [form, setForm] = useState({
    licenseNumber: "MoH-CAM-2018-04471",
    licenseExpiry: "2027-04",
    licenseFront: null,
    licenseBack: null,
    idType: "Khmer ID",
    idNumber: "",
    selfieDone: false,
    idPhotoDone: false,
    cabinetName: "Cabinet Médical Chann",
    cabinetAddress: "12 St. 308, Boeung Keng Kang 1, Phnom Penh",
    cabinetPhone: "+855 23 222 4471",
    specialty: "General Practice",
  });
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const stepValid = () => {
    if (step === 0) return form.licenseNumber.trim().length >= 6;
    if (step === 1) return form.selfieDone && form.idPhotoDone;
    if (step === 2) return form.cabinetAddress.trim().length > 0;
    return true;
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else setStep(STEPS.length); // → success state
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-bg border border-line rounded-xl shadow-xl w-full max-w-[680px] max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-line-2">
          <div>
            <h2 className="font-display text-[15px] font-medium leading-tight">
              {step < STEPS.length ? STEPS[step] : "Submitted"}
            </h2>
            {step < STEPS.length && (
              <div className="text-[11.5px] text-ink-3 mt-0.5">
                Step {step + 1} of {STEPS.length}
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-ink-3 hover:text-ink p-1 -m-1"><X size={16} /></button>
        </div>

        {/* Compact progress bar */}
        {step < STEPS.length && (
          <div className="h-1 bg-line-2/60">
            <div
              className="h-full bg-jade-2 transition-all"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 0 && <EkycLicenseStep form={form} update={update} />}
          {step === 1 && <EkycIdentityStep form={form} update={update} />}
          {step === 2 && <EkycPracticeStep form={form} update={update} />}
          {step === 3 && <EkycReviewStep form={form} />}
          {step === 4 && <EkycDoneStep onComplete={onComplete} />}
        </div>

        {/* Footer — hidden on success state */}
        {step < STEPS.length && (
          <div className="px-6 py-3.5 border-t border-line-2 bg-surface-2/30 flex items-center justify-between gap-3">
            <button onClick={onClose} className="text-[12px] text-ink-3 hover:text-ink-2 underline-offset-2 hover:underline">
              Skip for now
            </button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <Button variant="outline" size="sm" onClick={() => setStep(s => s - 1)}>
                  Back
                </Button>
              )}
              <Button onClick={next} disabled={!stepValid()} size="sm">
                {step === STEPS.length - 1 ? "Submit for verification" : "Continue"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function EkycLicenseStep({ form, update }) {
  return (
    <>
      <h3 className="font-display text-[20px] font-medium mb-1.5">Add your MoH license</h3>
      <p className="text-[13px] text-ink-2 mb-5 leading-relaxed">
        Enter your license number and upload a photo of your license. We'll use this to confirm you're registered to practice in Cambodia.
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-[12px] text-ink-2 font-medium mb-1.5">License number</label>
          <input
            value={form.licenseNumber}
            onChange={e => update("licenseNumber", e.target.value)}
            placeholder="MoH-CAM-YYYY-XXXXX"
            className="w-full px-3 py-2.5 rounded-md border border-line bg-surface text-[13.5px] font-mono focus:border-ink focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[12px] text-ink-2 font-medium mb-1.5">Expiry date</label>
          <input
            type="month"
            value={form.licenseExpiry}
            onChange={e => update("licenseExpiry", e.target.value)}
            className="w-full px-3 py-2.5 rounded-md border border-line bg-surface text-[13px] focus:border-ink focus:outline-none"
          />
        </div>
        <div>
          <div className="text-[12px] text-ink-2 font-medium mb-1.5">License photo</div>
          <EkycUploadTile label="Front side" done={form.licenseFront} onClick={() => update("licenseFront", true)} required />
          <EkycUploadTile label="Back side" done={form.licenseBack} onClick={() => update("licenseBack", true)} optional compact />
        </div>
        <p className="text-[11.5px] text-ink-3 pt-1">
          Most reviews completed within 24 hours.
        </p>
      </div>
    </>
  );
}

function EkycIdentityStep({ form, update }) {
  return (
    <>
      <h3 className="font-display text-[20px] font-medium mb-1">Verify your identity</h3>
      <p className="text-[12.5px] text-ink-2 mb-5 leading-relaxed">
        Quick liveness check + ID match. This ties the license to the human in front of the camera so nobody else can use your account to prescribe.
      </p>
      <div className="space-y-4">
        <div className="rounded-lg border border-line bg-surface p-4 flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${form.selfieDone ? "bg-jade-2 text-white" : "bg-line-2 text-ink-3"}`}>
            {form.selfieDone ? <CheckCircle2 size={18} /> : <Users size={18} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium">Liveness selfie</div>
            <div className="text-[11px] text-ink-3 leading-snug mt-0.5">Look at the camera, blink twice, smile.</div>
          </div>
          <button
            onClick={() => update("selfieDone", !form.selfieDone)}
            className={`text-[11.5px] px-3 py-1.5 rounded-md font-medium ${
              form.selfieDone ? "bg-jade-soft text-jade-2 border border-jade-soft" : "bg-jade text-white"
            }`}
          >
            {form.selfieDone ? "Done · retake" : "Start"}
          </button>
        </div>

        <div className="rounded-lg border border-line bg-surface p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${form.idPhotoDone ? "bg-jade-2 text-white" : "bg-line-2 text-ink-3"}`}>
              {form.idPhotoDone ? <CheckCircle2 size={18} /> : <CreditCard size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium">Government-issued ID</div>
              <div className="text-[11px] text-ink-3 leading-snug mt-0.5">Khmer ID, passport, or driving license — clear photo of the front.</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {["Khmer ID", "Passport", "Driving license"].map(t => (
              <button
                key={t}
                onClick={() => update("idType", t)}
                className={`text-[11px] py-1.5 rounded-md border transition ${
                  form.idType === t ? "border-jade-2 bg-jade-soft text-jade-2 font-medium" : "border-line text-ink-2 hover:border-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            value={form.idNumber}
            onChange={e => update("idNumber", e.target.value)}
            placeholder={`${form.idType} number (optional · we read it from the photo)`}
            className="w-full px-3 py-2 rounded-md border border-line bg-surface text-[12.5px] font-mono focus:border-ink focus:outline-none mb-2"
          />
          <EkycUploadTile label="ID photo · front" done={form.idPhotoDone} onClick={() => update("idPhotoDone", true)} />
        </div>
      </div>
    </>
  );
}

function EkycPracticeStep({ form, update }) {
  return (
    <>
      <h3 className="font-display text-[20px] font-medium mb-1">Where you practice</h3>
      <p className="text-[12.5px] text-ink-2 mb-5 leading-relaxed">
        This becomes the letterhead on your Dx prescriptions and tells the courier where to pick up samples.
      </p>
      <div className="space-y-3">
        <div>
          <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1.5">Cabinet name</label>
          <input
            value={form.cabinetName}
            onChange={e => update("cabinetName", e.target.value)}
            className="w-full px-3 py-2.5 rounded-md border border-line bg-surface text-[13px] focus:border-ink focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1.5">Address</label>
          <input
            value={form.cabinetAddress}
            onChange={e => update("cabinetAddress", e.target.value)}
            placeholder="Street, sangkat, khan, city"
            className="w-full px-3 py-2.5 rounded-md border border-line bg-surface text-[13px] focus:border-ink focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1.5">Reception phone</label>
            <input
              value={form.cabinetPhone}
              onChange={e => update("cabinetPhone", e.target.value)}
              className="w-full px-3 py-2.5 rounded-md border border-line bg-surface text-[13px] font-mono focus:border-ink focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1.5">Specialty</label>
            <select
              value={form.specialty}
              onChange={e => update("specialty", e.target.value)}
              className="w-full px-3 py-2.5 rounded-md border border-line bg-surface text-[13px] focus:border-ink focus:outline-none"
            >
              <option>General Practice</option>
              <option>Internal Medicine</option>
              <option>Pediatrics</option>
              <option>Cardiology</option>
              <option>Endocrinology</option>
              <option>OB/GYN</option>
              <option>Dermatology</option>
              <option>ENT</option>
              <option>Other</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
}

function EkycReviewStep({ form }) {
  const rows = [
    { label: "MoH license", value: form.licenseNumber, sub: `Expires ${form.licenseExpiry}` },
    { label: "ID", value: `${form.idType}${form.idNumber ? ` · ${form.idNumber}` : ""}`, sub: form.idPhotoDone ? "Photo on file" : "—" },
    { label: "Cabinet", value: form.cabinetName, sub: form.cabinetAddress },
    { label: "Reception", value: form.cabinetPhone, sub: form.specialty },
  ];
  return (
    <>
      <h3 className="font-display text-[20px] font-medium mb-1">Review &amp; submit</h3>
      <p className="text-[12.5px] text-ink-2 mb-5 leading-relaxed">
        Once submitted, our verification team cross-checks your license against the MoH registry. You can keep exploring while we review — most clinicians are verified within 24 hours.
      </p>
      <div className="rounded-lg border border-line bg-surface divide-y divide-line-2">
        {rows.map(r => (
          <div key={r.label} className="px-4 py-3 flex items-center gap-3">
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold w-[100px] shrink-0">{r.label}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium truncate">{r.value || "—"}</div>
              <div className="text-[10.5px] text-ink-3 truncate">{r.sub}</div>
            </div>
            <CheckCircle2 size={14} className="text-jade-2 shrink-0" />
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-md border border-line-2 bg-surface-2/40 px-3 py-2.5 text-[11px] text-ink-2 leading-snug">
        By submitting, you confirm the information above is accurate and you're the registered holder of this license. Misrepresentation is a criminal offence under Cambodia's Medical Practice Act.
      </div>
    </>
  );
}

function EkycDoneStep({ onComplete }) {
  return (
    <div className="text-center py-8">
      <div className="w-14 h-14 rounded-full bg-jade-soft text-jade-2 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 size={26} />
      </div>
      <h3 className="font-display text-[20px] font-medium mb-2">Verification submitted</h3>
      <p className="text-[13px] text-ink-2 leading-relaxed max-w-[420px] mx-auto mb-6">
        Your license has been submitted. For this prototype, Verified mode is now available. In production, reviews are usually completed within 24 hours.
      </p>
      <Button onClick={onComplete} size="lg">
        Continue
      </Button>
    </div>
  );
}

function EkycUploadTile({ label, done, onClick, optional, required, compact }) {
  // Compact variant: lighter secondary action row (back side, optional uploads)
  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`mt-2 w-full rounded-md border border-dashed px-3 py-2.5 transition flex items-center gap-2.5 text-left ${
          done ? "border-jade-2 bg-jade-soft/40" : "border-line hover:border-ink-3 bg-surface"
        }`}
      >
        <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${done ? "bg-jade-2 text-white" : "bg-line-2 text-ink-3"}`}>
          {done ? <CheckCircle2 size={13} /> : <FileText size={12} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] text-ink-2">
            {done ? `${label} added` : `Add ${label.toLowerCase()} if needed`}
          </div>
        </div>
        {optional && !done && (
          <span className="text-[10.5px] text-ink-3">Optional</span>
        )}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-md border-2 border-dashed px-3 py-4 transition text-center ${
        done ? "border-jade-2 bg-jade-soft/40" : "border-line hover:border-ink bg-surface"
      }`}
    >
      <div className={`w-8 h-8 rounded-md flex items-center justify-center mx-auto mb-1.5 ${done ? "bg-jade-2 text-white" : "bg-line-2 text-ink-3"}`}>
        {done ? <CheckCircle2 size={15} /> : <FileText size={14} />}
      </div>
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-[12px] font-medium text-ink-2">{label}</span>
        {required && <span className="text-[10px] text-ink-3">Required</span>}
        {optional && <span className="text-[10px] text-ink-3">Optional</span>}
      </div>
      <div className="text-[10.5px] text-ink-3 mt-0.5">
        {done ? "Photo on file · tap to retake" : "Tap to upload or take photo"}
      </div>
    </button>
  );
}

function ReferralsView({ onToast }) {
  const [tier] = useDoctorTier();
  if (tier === "explorer") {
    return (
      <ExplorerEmptyState
        icon={Users}
        title="No referrals yet"
        body="Refer colleagues once you're verified — both of you get lab credit when they finish onboarding. Your referral link, the running tally, and pending invites all live here."
      />
    );
  }
  const referralCode = "SOPHEAK-2026";
  const referralUrl = `https://kura.med/join?ref=${referralCode}`;
  const [copied, setCopied] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailNote, setEmailNote] = useState(
    "Hi Sokha — I've been using Kura for the past 6 months. Free EMR, lab orders, claim payouts. Thought of you. Use my link, we both get $50 in lab credit when you finish onboarding."
  );

  const referrals = [
    { name: "Dr. Sokha Lim",   cabinet: "BKK2 · GP",          status: "active",  credit: "+$50",   when: "3 weeks ago" },
    { name: "Dr. Mealea Ouk",  cabinet: "Tuol Kork · OBGYN",  status: "onboard", credit: "pending", when: "1 week ago" },
    { name: "Dr. Vichet Nuon", cabinet: "—",                  status: "invited", credit: "—",       when: "2 days ago" },
  ];
  const earned   = referrals.filter(r => r.status === "active").length * 50;
  const verified = referrals.filter(r => r.status === "active").length;

  const handleCopy = () => {
    try { navigator.clipboard?.writeText(referralUrl); } catch { /* clipboard unavailable */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    onToast && onToast("Referral link copied", { sub: referralCode });
  };

  const handleSendEmail = () => {
    if (!emailTo.trim()) return;
    onToast && onToast("Invite sent", { sub: `${emailTo.trim()} · they'll get your link + note` });
    setEmailTo("");
  };

  return (
    <div className="px-8 py-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-ink-3">Refer &amp; earn</div>
          <h1 className="font-display text-[30px] font-medium leading-none">Bring a colleague onto Kura</h1>
          <p className="text-[12.5px] text-ink-3 mt-1.5">
            When a doctor you refer crosses T1 (verified clinician), <span className="text-jade font-semibold">you both get $50 in lab credit</span>.
          </p>
        </div>
      </div>

      {/* Stats hero */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="bg-jade text-white rounded-xl p-4 relative overflow-hidden">
          <Sparkles size={48} className="absolute -top-2 -right-2 text-white/15" />
          <div className="text-[9.5px] uppercase tracking-[0.18em] text-white/70 mb-1">Earned so far</div>
          <div className="font-display text-[28px] font-medium leading-none">${earned.toFixed(0)}</div>
          <div className="text-[10.5px] text-white/80 mt-1.5">in lab credit</div>
        </div>
        <div className="bg-surface border border-line rounded-xl p-4">
          <div className="text-[9.5px] uppercase tracking-[0.18em] text-ink-3 mb-1">Referred</div>
          <div className="font-display text-[28px] font-medium leading-none text-ink">{referrals.length}</div>
          <div className="text-[10.5px] text-ink-3 mt-1.5">total invites</div>
        </div>
        <div className="bg-surface border border-line rounded-xl p-4">
          <div className="text-[9.5px] uppercase tracking-[0.18em] text-ink-3 mb-1">Verified</div>
          <div className="font-display text-[28px] font-medium leading-none text-jade-2">{verified}</div>
          <div className="text-[10.5px] text-ink-3 mt-1.5">at T1 or above</div>
        </div>
        <div className="bg-surface border border-line rounded-xl p-4">
          <div className="text-[9.5px] uppercase tracking-[0.18em] text-ink-3 mb-1">Pending</div>
          <div className="font-display text-[28px] font-medium leading-none text-amber">{referrals.length - verified}</div>
          <div className="text-[10.5px] text-ink-3 mt-1.5">invited or onboarding</div>
        </div>
      </div>

      {/* Share link + email invite — 2-col */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Share link */}
        <div className="bg-surface border border-line rounded-xl p-5">
          <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-2">Share link</div>
          <h3 className="font-display text-[16px] font-medium mb-3">Your referral link</h3>
          <div className="flex items-center gap-2 mb-3">
            <input
              readOnly
              value={referralUrl}
              onClick={e => e.target.select()}
              className="flex-1 px-3 py-2 rounded-md border border-line bg-surface-2 text-[12.5px] font-mono text-ink-2"
            />
            <button
              onClick={handleCopy}
              className={`text-[12px] px-3 py-2 rounded-md font-medium inline-flex items-center gap-1.5 transition ${
                copied ? "bg-jade-soft text-jade-2" : "bg-jade text-white hover:opacity-90"
              }`}
            >
              {copied ? <><CheckCircle2 size={11}/> Copied</> : <><Copy size={11}/> Copy</>}
            </button>
          </div>
          <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-2">Or share via</div>
          <div className="grid grid-cols-3 gap-2">
            <button className="px-3 py-2 rounded-md border border-line text-[12px] text-ink-2 hover:border-ink hover:bg-surface-2/40 inline-flex items-center justify-center gap-1.5 transition">
              <Send size={12} /> Telegram
            </button>
            <button className="px-3 py-2 rounded-md border border-line text-[12px] text-ink-2 hover:border-ink hover:bg-surface-2/40 inline-flex items-center justify-center gap-1.5 transition">
              <Mail size={12} /> Email
            </button>
            <button className="px-3 py-2 rounded-md border border-line text-[12px] text-ink-2 hover:border-ink hover:bg-surface-2/40 inline-flex items-center justify-center gap-1.5 transition">
              <Phone size={12} /> SMS
            </button>
          </div>
        </div>

        {/* Email invite */}
        <div className="bg-surface border border-line rounded-xl p-5">
          <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-2">Email invite</div>
          <h3 className="font-display text-[16px] font-medium mb-3">Send a personal note</h3>
          <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1.5">Colleague's email</label>
          <input
            value={emailTo}
            onChange={e => setEmailTo(e.target.value)}
            placeholder="dr.lim@example.com"
            className="w-full px-3 py-2 rounded-md border border-line bg-surface text-[13px] focus:border-ink focus:outline-none mb-3"
          />
          <label className="block text-[10.5px] uppercase tracking-[0.16em] text-ink-3 mb-1.5">
            Personal note <span className="text-ink-3 normal-case">(optional)</span>
          </label>
          <textarea
            rows={4}
            value={emailNote}
            onChange={e => setEmailNote(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-line bg-surface text-[12.5px] leading-relaxed mb-3"
          />
          <button
            onClick={handleSendEmail}
            disabled={!emailTo.trim()}
            className={`w-full text-[12.5px] py-2 rounded-md font-medium inline-flex items-center justify-center gap-1.5 transition ${
              emailTo.trim() ? "bg-jade text-white hover:opacity-90" : "bg-line text-ink-3 cursor-not-allowed"
            }`}
          >
            <Send size={12} /> Send invite
          </button>
        </div>
      </div>

      {/* History */}
      <div className="bg-surface border border-line rounded-xl overflow-hidden mb-5">
        <div className="px-5 py-3 border-b border-line-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold">Your referrals</div>
            <span className="text-[10.5px] text-ink-3 font-mono">{referrals.length}</span>
          </div>
        </div>
        <ul className="divide-y divide-line-2">
          {referrals.map((r, i) => (
            <ReferralHistoryRow key={i} {...r} />
          ))}
        </ul>
      </div>

      {/* Why this matters */}
      <div className="rounded-xl border border-jade-soft bg-jade-soft/40 px-5 py-4 text-[12px] text-ink-2 leading-relaxed">
        <span className="text-jade font-semibold">Why this matters: </span>
        the directory ranks better with more doctors on it (more long-tail content), in-network referrals stay in-network, and lab economics get better as volume scales — Kura is genuinely better when more good doctors are on it.
      </div>
    </div>
  );
}

function ReferralHistoryRow({ name, cabinet, status, credit, when }) {
  const statusMap = {
    active:  { color: "text-jade bg-jade-soft",       label: "Active T1+" },
    onboard: { color: "text-amber bg-amber-soft",     label: "Onboarding" },
    invited: { color: "text-ink-3 bg-line-2",         label: "Invited" },
  };
  const s = statusMap[status];
  return (
    <li className="px-2 py-2.5 flex items-center gap-3">
      <div className="w-8 h-8 rounded-md bg-line-2 text-ink-3 flex items-center justify-center font-semibold text-[11px] shrink-0">
        {name.split(" ").slice(-1)[0][0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-medium">{name}</div>
        <div className="text-[10.5px] text-ink-3">{cabinet} · {when}</div>
      </div>
      <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${s.color}`}>{s.label}</span>
      <span className={`text-[11.5px] tabular-nums font-mono ${credit.startsWith("+") ? "text-jade font-semibold" : "text-ink-3"}`}>{credit}</span>
    </li>
  );
}

/* ============================================================
   NUDGE PANEL — remote re-engagement / "remote prescribe" flow
   Doctor notices patient overdue → nudges via Telegram → patient
   confirms → doctor sends e-Rx booking code → patient walks into a
   Kura branch with that code. Async touchpoint, no in-cabinet visit.
   ============================================================ */
function NudgePanel({ patient, onClose }) {
  const [stage, setStage] = useState("draft"); // draft | sent | confirmed | erx-sent

  const previewText = `សួស្តី ${patient.name} — Dr. Chann here. Your last HbA1c was 3 months ago — time for a recheck. Should I order it for you? Reply YES and I'll send a code you bring to the nearest Kura branch (BKK1 is 1.2 km from you). 30 min, no booking needed.`;

  return (
    <div className="bg-surface border border-jade rounded-xl mb-4">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line-2 bg-jade-soft">
        <div className="flex items-center gap-2">
          <Send size={14} className="text-jade" />
          <h3 className="font-display text-[15px] font-medium text-jade">Remote nudge — async re-engagement</h3>
          <span className="text-[10.5px] uppercase tracking-wider text-ink-3">Patient not present · TG → confirm → e-Rx</span>
        </div>
        <button onClick={onClose} className="text-ink-3 hover:text-ink"><X size={14} /></button>
      </div>

      {/* Stage-stepper */}
      <div className="px-4 py-2.5 border-b border-line-2 bg-surface-2/30 flex items-center gap-2 text-[11px]">
        <NudgeStep n={1} label="Draft TG"      active={stage === "draft"}      done={["sent", "confirmed", "erx-sent"].includes(stage)} />
        <span className="flex-1 h-px bg-line-2" />
        <NudgeStep n={2} label="Patient replies" active={stage === "sent"}     done={["confirmed", "erx-sent"].includes(stage)} />
        <span className="flex-1 h-px bg-line-2" />
        <NudgeStep n={3} label="Send e-Rx code" active={stage === "confirmed"} done={stage === "erx-sent"} />
      </div>

      <div className="p-4 grid grid-cols-12 gap-4">
        <div className="col-span-7">
          {/* Why this nudge */}
          <div className="rounded-md bg-amber-soft border border-amber px-3 py-2 mb-3 flex items-start gap-2">
            <AlertTriangle size={11} className="text-amber mt-0.5 shrink-0" />
            <div className="text-[11.5px] text-ink-2">
              <span className="font-medium">Why nudge:</span> last HbA1c was 9.4% on Feb 2026 (3 months ago). Trending up 4 quarters. SGLT2i was added — recheck now to assess response.
            </div>
          </div>

          {/* TG preview / convo */}
          <div className="rounded-lg bg-surface-2 border border-line-2 p-3 space-y-2">
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-1 flex items-center gap-1.5">
              <Send size={10} /> Telegram conversation
            </div>

            {/* Outgoing message */}
            <div className="flex justify-end">
              <div className={`max-w-[85%] px-3 py-2 rounded-lg rounded-br-sm ${stage === "draft" ? "bg-line-2 border border-dashed border-ink-3" : "bg-jade text-white"}`}>
                <div className={`text-[12px] leading-relaxed ${stage === "draft" ? "text-ink-2" : "text-white"}`}>{previewText}</div>
                <div className={`text-[9.5px] mt-1 ${stage === "draft" ? "text-ink-3" : "text-white/70"} text-right`}>
                  {stage === "draft" ? "draft · not sent" : stage === "sent" ? "sent · 2 min ago · seen" : "sent · 4 min ago · replied"}
                </div>
              </div>
            </div>

            {/* Incoming reply (after sent) */}
            {(stage === "confirmed" || stage === "erx-sent") && (
              <div className="flex justify-start">
                <div className="max-w-[85%] px-3 py-2 rounded-lg rounded-bl-sm bg-surface border border-line-2">
                  <div className="text-[12px] leading-relaxed text-ink-2">YES please. I can come tomorrow morning before work. ✓</div>
                  <div className="text-[9.5px] text-ink-3 mt-1">3 min ago</div>
                </div>
              </div>
            )}

            {/* e-Rx card (after sent) */}
            {stage === "erx-sent" && (
              <div className="flex justify-end">
                <div className="max-w-[85%] px-3 py-2.5 rounded-lg rounded-br-sm bg-jade text-white">
                  <div className="text-[10px] uppercase tracking-wider font-semibold opacity-80 mb-1">e-Rx · walk-in code</div>
                  <div className="font-mono text-[15px] font-bold tracking-wider">KUR-9134-A1C</div>
                  <div className="text-[11px] mt-1 leading-relaxed opacity-90">
                    Bring this code to <span className="font-semibold">Kura BKK1</span> (1.2 km · Mon–Sat 7am–6pm).
                    HbA1c only · 30 min · billed to Forte EmCare.
                  </div>
                  <div className="text-[9.5px] mt-1 opacity-70 text-right">just now</div>
                </div>
              </div>
            )}
          </div>

          {/* Action button — changes per stage */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10.5px] text-ink-3">
              {stage === "draft" && "Edit text inline before sending"}
              {stage === "sent" && "Patient typically replies within 2 hours"}
              {stage === "confirmed" && "Code generates a walk-in booking at the nearest PSC"}
              {stage === "erx-sent" && "Patient will receive an SMS reminder 1h before close-of-day"}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="text-[12px] text-ink-3 hover:text-ink px-3 py-1.5">
                {stage === "erx-sent" ? "Done" : "Cancel"}
              </button>
              {stage === "draft" && (
                <button onClick={() => setStage("sent")} className="text-[12px] bg-jade text-white px-3 py-1.5 rounded-md font-medium hover:opacity-90 inline-flex items-center gap-1.5">
                  <Send size={11} /> Send via Telegram
                </button>
              )}
              {stage === "sent" && (
                <button onClick={() => setStage("confirmed")} className="text-[12px] bg-jade text-white px-3 py-1.5 rounded-md font-medium hover:opacity-90 inline-flex items-center gap-1.5">
                  <CheckCircle2 size={11} /> Simulate patient reply
                </button>
              )}
              {stage === "confirmed" && (
                <button onClick={() => setStage("erx-sent")} className="text-[12px] bg-jade text-white px-3 py-1.5 rounded-md font-medium hover:opacity-90 inline-flex items-center gap-1.5">
                  <FileText size={11} /> Generate &amp; send e-Rx code
                </button>
              )}
              {stage === "erx-sent" && (
                <button className="text-[12px] bg-jade text-white px-3 py-1.5 rounded-md font-medium hover:opacity-90 inline-flex items-center gap-1.5">
                  <CheckCircle2 size={11} /> Mark complete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right side — context + e-Rx config */}
        <div className="col-span-5 space-y-3">
          <div className="rounded-md bg-surface-2 border border-line-2 p-3">
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-2">e-Rx walk-in code includes</div>
            <ul className="text-[11.5px] text-ink-2 space-y-1.5">
              <li className="flex gap-1.5"><CheckCircle2 size={11} className="text-jade-2 shrink-0 mt-0.5" /> <span>HbA1c only · pre-authorized at PSC</span></li>
              <li className="flex gap-1.5"><CheckCircle2 size={11} className="text-jade-2 shrink-0 mt-0.5" /> <span>Routes to nearest Kura branch (BKK1)</span></li>
              <li className="flex gap-1.5"><CheckCircle2 size={11} className="text-jade-2 shrink-0 mt-0.5" /> <span>Billed to Forte EmCare on patient ID</span></li>
              <li className="flex gap-1.5"><CheckCircle2 size={11} className="text-jade-2 shrink-0 mt-0.5" /> <span>Result lands back here · auto-signed</span></li>
              <li className="flex gap-1.5"><CheckCircle2 size={11} className="text-jade-2 shrink-0 mt-0.5" /> <span>Code expires in 14 days if unused</span></li>
            </ul>
          </div>
          <div className="rounded-md bg-surface-2 border border-line-2 p-3">
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-3 font-semibold mb-2">Other channels</div>
            <ul className="text-[11.5px] text-ink-2 space-y-1.5">
              <li className="flex items-center justify-between"><span>Voice call instead</span> <button className="text-[10.5px] text-jade-2 hover:underline">Switch</button></li>
              <li className="flex items-center justify-between"><span>SMS fallback (no TG)</span> <button className="text-[10.5px] text-jade-2 hover:underline">Switch</button></li>
              <li className="flex items-center justify-between"><span>Reception calls patient</span> <button className="text-[10.5px] text-jade-2 hover:underline">Delegate</button></li>
            </ul>
          </div>
          <div className="text-[10.5px] text-ink-3 leading-relaxed">
            This pattern — <span className="font-medium text-ink-2">notice → nudge → confirm → e-Rx code</span> — keeps care continuous between in-cabinet visits. The patient never has to schedule; they just walk in with the code.
          </div>
        </div>
      </div>
    </div>
  );
}

function NudgeStep({ n, label, active, done }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-mono font-semibold ${
        done ? "bg-jade text-white" : active ? "bg-jade-soft text-jade border border-jade" : "bg-line-2 text-ink-3"
      }`}>
        {done ? <CheckCircle2 size={11} /> : n}
      </span>
      <span className={`${active ? "text-ink font-medium" : done ? "text-ink-2" : "text-ink-3"}`}>{label}</span>
    </span>
  );
}