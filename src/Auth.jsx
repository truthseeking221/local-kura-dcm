import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ShieldCheck, ArrowRight, ArrowLeft,
  CheckCircle2, ChevronDown, Upload, Camera,
  Globe, Loader2,
} from "lucide-react";

import {
  AuthShell as KitAuthShell,
  SignInCard,
  VerifyEmailCard,
  MailProviderTile,
  Stepper,
  RadioCard,
  RadioGroup,
  Banner,
  Icon,
  Button,
  Input,
} from "@kura/ui-kit";

/* ============================================================
   AUTH — magic-link sign-in + first-time workspace onboarding
   + member KYC. Pure-frontend prototype: localStorage only,
   no real email, no real verification. Mirrors what a Supabase
   Auth + workspaces + RLS flow will look like in production.

   Chrome is reskinned onto the Kura UI kit:
   - KitAuthShell wraps every auth screen (logo + eyebrow + footer).
   - SignInCard / VerifyEmailCard / MailProviderTile drive LoginPage.
   - Stepper / RadioCard / Banner / Button / Input drive onboarding + KYC.
   All visual chrome resolves to kit tokens.
   ============================================================ */

const SESSION_KEY   = "kura.auth.session";
const WORKSPACE_KEY = "kura.auth.workspace";
const KYC_KEY       = "kura.auth.kyc";
const BILLING_KEY   = "kura.auth.billing";

// Three demo accounts seed predictable tiers so the app can be poked at
// every level of the verification ladder without going through eKYC each time:
//   pierretison19101994@gmail.com → T3: verified + billing enabled (full access)
//   verified@gmail.com            → T2: verified, no billing (Dx works, billing locked)
//   anything else                 → T0: explorer (browsing mode)
export const PIERRE_EMAIL = "pierretison19101994@gmail.com";
const VERIFIED_EMAIL      = "verified@gmail.com";

// Public bot ID for the Telegram Login Widget. The secret half of the bot
// token lives on the server only — never ship the full token in client code.
const TELEGRAM_BOT_ID = "8742080138";

function loadJson(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
  catch { return null; }
}
function saveJson(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
}
// String-keyed to avoid importing from Onboarding.jsx — onboarding state is
// meaningless without an auth session, so we clear it alongside auth.
const ONBOARDING_KEY = "kura.onboarding.v1";

function clearAuth() {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(WORKSPACE_KEY);
    localStorage.removeItem(KYC_KEY);
    localStorage.removeItem(BILLING_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
  } catch { /* ignore */ }
}

/* ============================================================
   Country defaults — drives timezone, currency, locale.
   ============================================================ */
export const COUNTRIES = [
  { code: "KH", name: "Cambodia",        tz: "Asia/Phnom_Penh",    currency: "KHR", locale: "km", flag: "🇰🇭" },
  { code: "FR", name: "France",          tz: "Europe/Paris",       currency: "EUR", locale: "fr", flag: "🇫🇷" },
  { code: "US", name: "United States",   tz: "America/New_York",   currency: "USD", locale: "en", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom",  tz: "Europe/London",      currency: "GBP", locale: "en", flag: "🇬🇧" },
  { code: "DE", name: "Germany",         tz: "Europe/Berlin",      currency: "EUR", locale: "de", flag: "🇩🇪" },
  { code: "ES", name: "Spain",           tz: "Europe/Madrid",      currency: "EUR", locale: "es", flag: "🇪🇸" },
  { code: "IT", name: "Italy",           tz: "Europe/Rome",        currency: "EUR", locale: "it", flag: "🇮🇹" },
  { code: "BE", name: "Belgium",         tz: "Europe/Brussels",    currency: "EUR", locale: "fr", flag: "🇧🇪" },
  { code: "CH", name: "Switzerland",     tz: "Europe/Zurich",      currency: "CHF", locale: "fr", flag: "🇨🇭" },
  { code: "CA", name: "Canada",          tz: "America/Toronto",    currency: "CAD", locale: "en", flag: "🇨🇦" },
  { code: "AU", name: "Australia",       tz: "Australia/Sydney",   currency: "AUD", locale: "en", flag: "🇦🇺" },
  { code: "SG", name: "Singapore",       tz: "Asia/Singapore",     currency: "SGD", locale: "en", flag: "🇸🇬" },
  { code: "JP", name: "Japan",           tz: "Asia/Tokyo",         currency: "JPY", locale: "ja", flag: "🇯🇵" },
  { code: "BR", name: "Brazil",          tz: "America/Sao_Paulo",  currency: "BRL", locale: "pt", flag: "🇧🇷" },
  { code: "MX", name: "Mexico",          tz: "America/Mexico_City",currency: "MXN", locale: "es", flag: "🇲🇽" },
  { code: "IN", name: "India",           tz: "Asia/Kolkata",       currency: "INR", locale: "en", flag: "🇮🇳" },
  { code: "TH", name: "Thailand",        tz: "Asia/Bangkok",       currency: "THB", locale: "th", flag: "🇹🇭" },
  { code: "VN", name: "Vietnam",         tz: "Asia/Ho_Chi_Minh",   currency: "VND", locale: "vi", flag: "🇻🇳" },
  { code: "NG", name: "Nigeria",         tz: "Africa/Lagos",       currency: "NGN", locale: "en", flag: "🇳🇬" },
  { code: "KE", name: "Kenya",           tz: "Africa/Nairobi",     currency: "KES", locale: "en", flag: "🇰🇪" },
  { code: "ZA", name: "South Africa",    tz: "Africa/Johannesburg",currency: "ZAR", locale: "en", flag: "🇿🇦" },
  { code: "AE", name: "UAE",             tz: "Asia/Dubai",         currency: "AED", locale: "ar", flag: "🇦🇪" },
];

const SPECIALTIES = [
  "General practice",
  "Cardiology",
  "Endocrinology",
  "Pediatrics",
  "Dermatology",
  "Gynecology",
  "Psychiatry",
  "Ophthalmology",
  "Orthopedics",
  "Oncology",
  "Other",
];

const PRACTICE_SIZES = [
  { value: "solo",   label: "Solo practice",     desc: "Just me",            icon: "tabler:user" },
  { value: "small",  label: "Small clinic",      desc: "2–10 clinicians",    icon: "tabler:users" },
  { value: "medium", label: "Medium clinic",     desc: "10–50 clinicians",   icon: "tabler:building-hospital" },
  { value: "large",  label: "Hospital / network",desc: "50+ clinicians",     icon: "tabler:building-skyscraper" },
];

function deriveDefaultWorkspace(email) {
  const lang = (typeof navigator !== "undefined" && navigator.language) || "en-US";
  const countryFromLang = (lang.split("-")[1] || "").toUpperCase();

  let browserTz = "UTC";
  try { browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch { /* ignore */ }

  let country = COUNTRIES.find(c => c.code === countryFromLang);
  if (!country) country = COUNTRIES.find(c => c.tz === browserTz);
  if (!country) country = COUNTRIES.find(c => c.code === "US") || COUNTRIES[0];

  const local = (email || "").split("@")[0] || "My";
  const pretty = local
    .replace(/\d+$/, "")
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim() || "My";

  return {
    name: `${pretty}'s practice`,
    country: country.code,
    timezone: browserTz || country.tz,
    currency: country.currency,
    locale: country.locale,
    specialty: "General practice",
    size: "solo",
    address: "",
    autoCreated: true,
    createdAt: Date.now(),
  };
}

// Webmail providers offered as one-click shortcuts from the "check your inbox"
// screen. Iconify `logos:*` collections own their own colour — pass
// strokeWidth={null} when rendering through kit's <Icon>.
const MAIL_PROVIDERS = {
  gmail:    { key: "gmail",   label: "Gmail",    url: "https://mail.google.com/",     iconName: "logos:google-gmail",
              domains: ["gmail.com", "googlemail.com"] },
  outlook:  { key: "outlook", label: "Outlook",  url: "https://outlook.live.com/",    iconName: "logos:microsoft-outlook",
              domains: ["outlook.com", "outlook.fr", "outlook.de", "hotmail.com", "hotmail.fr", "live.com", "live.fr", "msn.com"] },
  yahoo:    { key: "yahoo",   label: "Yahoo",    url: "https://mail.yahoo.com/",      iconName: "logos:yahoo",
              domains: ["yahoo.com", "yahoo.fr", "yahoo.co.uk", "yahoo.de", "ymail.com", "rocketmail.com"] },
  icloud:   { key: "icloud",  label: "iCloud",   url: "https://www.icloud.com/mail/", iconName: "logos:apple",
              domains: ["icloud.com", "me.com", "mac.com"] },
  proton:   { key: "proton",  label: "Proton",   url: "https://mail.proton.me/",      iconName: "simple-icons:protonmail",
              domains: ["proton.me", "protonmail.com", "pm.me"] },
  orange:   { key: "orange",  label: "Orange",   url: "https://mail.orange.fr/",      iconName: "simple-icons:orange",
              domains: ["orange.fr", "wanadoo.fr"] },
  aol:      { key: "aol",     label: "AOL",      url: "https://mail.aol.com/",        iconName: "simple-icons:aol",
              domains: ["aol.com"] },
};

function providersForEmail(email) {
  const domain = (email.split("@")[1] || "").toLowerCase();
  if (!domain) return [];
  for (const p of Object.values(MAIL_PROVIDERS)) {
    if (p.domains.includes(domain)) return [p];
  }
  // Custom/work domain — offer the two most likely business providers.
  return [MAIL_PROVIDERS.gmail, MAIL_PROVIDERS.outlook];
}

/* ============================================================
   useAuth — single hook that owns session/workspace/kyc state.
   ============================================================ */
export function useAuth() {
  const [session,   setSession]   = useState(() => loadJson(SESSION_KEY));
  const [workspace, setWorkspace] = useState(() => loadJson(WORKSPACE_KEY));
  const [kyc,       setKyc]       = useState(() => loadJson(KYC_KEY));
  const [billing,   setBilling]   = useState(() => loadJson(BILLING_KEY));

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("reset") === "1") {
        clearAuth();
        setSession(null); setWorkspace(null); setKyc(null); setBilling(null);
        url.searchParams.delete("reset");
        window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
      }
    } catch { /* ignore */ }
  }, []);

  const signIn = (email) => {
    const clean = String(email || "").trim();
    const lower = clean.toLowerCase();
    const next = { email: clean, signedInAt: Date.now() };
    saveJson(SESSION_KEY, next);
    setSession(next);
    try { localStorage.removeItem(ONBOARDING_KEY); } catch { /* ignore */ }

    if (lower === PIERRE_EMAIL) {
      const ws = {
        name: "Kura Cabinet",
        country: "KH", timezone: "Asia/Phnom_Penh", currency: "KHR", locale: "km",
        specialty: "General practice", size: "small",
        address: "BKK1, Phnom Penh, Cambodia",
        seededByDemo: true, createdAt: Date.now(),
      };
      const k = {
        fullName: "Pierre Tison", dob: "1994-10-19",
        license: "KH-MED-2023-1138", issuer: "KH",
        specialty: "General practice",
        idDocName: "id_pierre.jpg", selfieName: "selfie_pierre.jpg",
        consent: true, status: "verified", submittedAt: Date.now(),
      };
      const b = {
        enabled: true, bankName: "ACLEDA Bank",
        accountLast4: "8842", signature: "signed", setupAt: Date.now(),
      };
      saveJson(WORKSPACE_KEY, ws); setWorkspace(ws);
      saveJson(KYC_KEY, k);        setKyc(k);
      saveJson(BILLING_KEY, b);    setBilling(b);
      return;
    }

    if (lower === VERIFIED_EMAIL) {
      const ws = {
        name: "Cabinet Médical Chann · BKK1",
        country: "KH", timezone: "Asia/Phnom_Penh", currency: "KHR", locale: "km",
        specialty: "General practice", size: "solo",
        address: "BKK1, Phnom Penh, Cambodia",
        seededByDemo: true, createdAt: Date.now(),
      };
      const k = {
        fullName: "Dr. Sopheak Chann", dob: "1982-07-14",
        license: "KH-MoH-04471", issuer: "KH",
        specialty: "General practice",
        idDocName: "id_sopheak.jpg", selfieName: "selfie_sopheak.jpg",
        consent: true, status: "verified", submittedAt: Date.now(),
      };
      saveJson(WORKSPACE_KEY, ws); setWorkspace(ws);
      saveJson(KYC_KEY, k);        setKyc(k);
      return;
    }

    if (!loadJson(WORKSPACE_KEY)) {
      const ws = deriveDefaultWorkspace(clean);
      saveJson(WORKSPACE_KEY, ws);
      setWorkspace(ws);
    }
  };

  const completeWorkspace = (ws) => {
    const full = { ...ws, createdAt: ws.createdAt ?? Date.now() };
    saveJson(WORKSPACE_KEY, full);
    setWorkspace(full);
  };
  const completeKyc = (k) => {
    const full = { status: "pending_review", submittedAt: Date.now(), ...k };
    saveJson(KYC_KEY, full);
    setKyc(full);
  };
  const completeBilling = (b) => {
    const full = { enabled: true, setupAt: Date.now(), ...b };
    saveJson(BILLING_KEY, full);
    setBilling(full);
  };
  const signOut = () => {
    clearAuth();
    setSession(null); setWorkspace(null); setKyc(null); setBilling(null);
  };

  return { session, workspace, kyc, billing, signIn, completeWorkspace, completeKyc, completeBilling, signOut };
}

/* ── Local i18n strings (unchanged from prototype) ───────────────────────── */
const LOGIN_STRINGS = {
  en: {
    eyebrowSignIn: "Sign in to continue to Kura",
    eyebrowCheckInbox: "Check your inbox",
    eyebrowVerify: "Verify your email",
    continueWithGoogle: "Continue with Google",
    continueWithTelegram: "Continue with Telegram",
    clickLinkSentTo: "To continue, click the link sent to",
    enterCode: "Enter verification code",
    resendEmail: "Resend email",
  },
  km: {
    eyebrowSignIn: "ចូលគណនី ដើម្បីបន្តទៅ Kura",
    eyebrowCheckInbox: "ពិនិត្យប្រអប់សារ",
    eyebrowVerify: "ផ្ទៀងផ្ទាត់អ៊ីមែលរបស់អ្នក",
    continueWithGoogle: "បន្តជាមួយ Google",
    continueWithTelegram: "បន្តជាមួយ Telegram",
    clickLinkSentTo: "ដើម្បីបន្ត ចុចតំណដែលបានផ្ញើទៅ",
    enterCode: "បញ្ចូលលេខកូដផ្ទៀងផ្ទាត់",
    resendEmail: "ផ្ញើអ៊ីមែលម្ដងទៀត",
  },
  vi: {
    eyebrowSignIn: "Đăng nhập để tiếp tục vào Kura",
    eyebrowCheckInbox: "Kiểm tra hộp thư của bạn",
    eyebrowVerify: "Xác minh email của bạn",
    continueWithGoogle: "Tiếp tục với Google",
    continueWithTelegram: "Tiếp tục với Telegram",
    clickLinkSentTo: "Để tiếp tục, hãy nhấp vào liên kết đã gửi đến",
    enterCode: "Nhập mã xác minh",
    resendEmail: "Gửi lại email",
  },
};

function detectLoginLocale() {
  if (typeof navigator === "undefined") return "en";
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language || "en"];
  for (const raw of langs) {
    const lang = String(raw).toLowerCase();
    const base = lang.split("-")[0];
    if (LOGIN_STRINGS[base]) return base;
  }
  return "en";
}

/* ============================================================
   LoginPage — email → magic-link "sent" → verification code.
   ============================================================ */
export function LoginPage({ onSignIn }) {
  const t = LOGIN_STRINGS[detectLoginLocale()] || LOGIN_STRINGS.en;
  const [step, setStep] = useState("email"); // 'email' | 'sent' | 'code'
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const codeValid = code.trim().length >= 4;

  const submit = () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setStep("sent"); }, 550);
  };

  // After 5s on the "sent" screen with no interaction, slide to the
  // verification-code form. Users can also tap "Enter verification code"
  // to jump there immediately.
  useEffect(() => {
    if (step !== "sent") return;
    const id = setTimeout(() => setStep("code"), 5000);
    return () => clearTimeout(id);
  }, [step]);

  const resend = () => { setCode(""); setStep("email"); };

  const continueWithGoogle = () => {
    const w = 500, h = 640;
    const left = Math.round((window.screen.width - w) / 2);
    const top  = Math.round((window.screen.height - h) / 2);
    window.open(
      "https://accounts.google.com/v3/signin/identifier",
      "kura-google-signin",
      `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    );
  };

  const continueWithTelegram = () => {
    const w = 550, h = 470;
    const left = Math.round((window.screen.width - w) / 2);
    const top  = Math.round((window.screen.height - h) / 2);
    const url = new URL("https://oauth.telegram.org/auth");
    url.searchParams.set("bot_id", TELEGRAM_BOT_ID);
    url.searchParams.set("origin", window.location.origin);
    url.searchParams.set("request_access", "write");
    url.searchParams.set("return_to", window.location.origin + "/auth/telegram-callback");
    window.open(
      url.toString(),
      "kura-telegram-signin",
      `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    );
  };

  const verify = () => {
    if (!codeValid || verifying) return;
    setVerifying(true);
    setTimeout(() => { setVerifying(false); onSignIn(email.trim()); }, 500);
  };

  /* ─── "Check your inbox" step ─────────────────────────── */
  if (step === "sent") {
    const providers = providersForEmail(email.trim());
    return (
      <KitAuthShell eyebrow={t.eyebrowCheckInbox} footer="Kura · Doctor platform">
        <section className="w-[460px] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-xs)] [[data-density='compact']_&]:w-[380px] [[data-density='comfortable']_&]:w-[540px]">
          <div className="flex flex-col items-center text-center">
            <span
              aria-hidden
              className="mb-5 inline-flex size-12 items-center justify-center rounded-full bg-[var(--brand-50)] text-[var(--brand-700)]"
            >
              <Icon name="tabler:mail-opened" size={24} />
            </span>
            <p className="text-k-body text-[var(--ink-600)]">{t.clickLinkSentTo}</p>
            <p className="mt-1 mb-5 break-all text-[var(--type-xl)] font-semibold text-[var(--ink-900)]">
              {email.trim()}
            </p>

            {providers.length > 0 && (
              <div className={`mb-6 grid w-full gap-2 ${providers.length === 1 ? "grid-cols-1" : providers.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {providers.map(p => (
                  <MailProviderTile
                    key={p.key}
                    href={p.url}
                    label={`Open ${p.label}`}
                    icon={<Icon name={p.iconName} strokeWidth={null} />}
                  />
                ))}
              </div>
            )}

            <div className="flex flex-col items-center gap-2 text-k-body">
              <button
                type="button"
                onClick={() => setStep("code")}
                className="font-medium text-[var(--color-text-link)] underline hover:text-[var(--color-text-link-hover)]"
              >
                {t.enterCode}
              </button>
              <button
                type="button"
                onClick={resend}
                className="font-medium text-[var(--ink-500)] underline hover:text-[var(--ink-700)]"
              >
                {t.resendEmail}
              </button>
            </div>
          </div>
        </section>
      </KitAuthShell>
    );
  }

  /* ─── "Verify your email" step ─────────────────────────── */
  if (step === "code") {
    return (
      <KitAuthShell eyebrow={t.eyebrowVerify} footer="Kura · Doctor platform">
        <VerifyEmailCard
          email={email.trim()}
          code={code}
          onCodeChange={(next) => setCode(next.replace(/\s/g, ""))}
          onVerify={verify}
          isVerifying={verifying}
          onResend={resend}
        />
      </KitAuthShell>
    );
  }

  /* ─── Email entry step ─────────────────────────── */
  const providers = [
    {
      id: "google",
      label: t.continueWithGoogle,
      icon: <Icon name="logos:google-icon" strokeWidth={null} size={18} />,
      onClick: continueWithGoogle,
    },
    {
      id: "telegram",
      label: t.continueWithTelegram,
      icon: <Icon name="logos:telegram" strokeWidth={null} size={18} />,
      onClick: continueWithTelegram,
    },
  ];

  return (
    <KitAuthShell eyebrow={t.eyebrowSignIn} footer="Kura · Doctor platform">
      <SignInCard
        email={email}
        onEmailChange={setEmail}
        providers={providers}
        onSubmitEmail={submit}
        isSubmitting={submitting}
        privacyPolicyHref="#"
      />
    </KitAuthShell>
  );
}

/* ============================================================
   Shared kit-styled form helpers (replaces bespoke FieldLabel +
   TextInput + SelectInput + PrimaryButton).
   ============================================================ */
function FieldLabel({ children }) {
  return (
    <label className="mb-1.5 block text-k-overline uppercase tracking-k-caps text-[var(--ink-500)]">
      {children}
    </label>
  );
}

function NativeSelect({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-9 w-full appearance-none rounded-md border border-input bg-transparent px-3 pr-9 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-500)]" />
    </div>
  );
}

/* ============================================================
   WorkspaceOnboardingPage — 3 steps: country / cabinet / size.
   ============================================================ */
export function WorkspaceOnboardingPage({ email, onComplete, onSignOut }) {
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState("FR");
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("General practice");
  const [address, setAddress] = useState("");
  const [size, setSize] = useState("solo");

  const c = useMemo(() => COUNTRIES.find(x => x.code === country) ?? COUNTRIES[0], [country]);

  const totalSteps = 3;
  const back = () => setStep(s => Math.max(1, s - 1));
  const next = () => setStep(s => Math.min(totalSteps, s + 1));

  const finish = () => {
    onComplete({
      name: name.trim() || `${c.name} Practice`,
      country: c.code,
      timezone: c.tz,
      currency: c.currency,
      locale: c.locale,
      specialty,
      size,
      address: address.trim(),
    });
  };

  const canAdvanceStep1 = !!country;
  const canAdvanceStep2 = name.trim().length >= 2;

  const stepperSteps = [
    { label: "Country",  status: step > 1 ? "done" : step === 1 ? "active" : "locked" },
    { label: "Cabinet",  status: step > 2 ? "done" : step === 2 ? "active" : "locked" },
    { label: "Team",     status: step > 3 ? "done" : step === 3 ? "active" : "locked" },
  ];

  return (
    <KitAuthShell eyebrow="Set up your cabinet">
      <section className="w-[560px] max-w-[calc(100vw-2rem)] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-7 shadow-[var(--shadow-xs)]">
        <Stepper steps={stepperSteps} className="mb-6" />

        {step === 1 && (
          <>
            <h1 className="k-h2 mb-1.5">Where is your cabinet?</h1>
            <p className="k-body-sm mb-6">
              We'll use this to set your timezone, currency, and default language. You can change it later.
            </p>

            <FieldLabel>Country</FieldLabel>
            <NativeSelect value={country} onChange={setCountry}>
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </NativeSelect>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <DerivedChip iconName="tabler:world" label="Timezone" value={c.tz.split("/").pop().replace("_", " ")} />
              <DerivedChip iconName="tabler:currency" label="Currency" value={c.currency} />
              <DerivedChip iconName="tabler:language" label="Language" value={c.locale.toUpperCase()} />
            </div>

            <div className="mt-7 flex items-center justify-between gap-3">
              <span className="text-k-xs text-[var(--ink-500)]">{COUNTRIES.length} countries supported · more coming</span>
              <Button onClick={next} disabled={!canAdvanceStep1}>
                Continue <ArrowRight size={14} />
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="k-h2 mb-1.5">About your cabinet</h1>
            <p className="k-body-sm mb-6">
              What should we call your workspace? You can add a logo and address later from settings.
            </p>

            <div className="mb-4">
              <FieldLabel>Cabinet / Practice name</FieldLabel>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                placeholder={c.code === "FR" ? "Cabinet médical Dr. Tison" : "Mercy Clinic"}
              />
            </div>

            <div className="mb-4">
              <FieldLabel>Primary specialty</FieldLabel>
              <NativeSelect value={specialty} onChange={setSpecialty}>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </div>

            <div className="mb-2">
              <FieldLabel>
                Address <span className="lowercase font-normal tracking-normal text-[var(--ink-400)]">(optional)</span>
              </FieldLabel>
              <Input
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder={c.code === "FR" ? "12 rue de Lyon, 75012 Paris" : "Street, City"}
              />
            </div>

            <div className="mt-7 flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={back}>
                <ArrowLeft size={12} /> Back
              </Button>
              <Button onClick={next} disabled={!canAdvanceStep2}>
                Continue <ArrowRight size={14} />
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="k-h2 mb-1.5">How big is your team?</h1>
            <p className="k-body-sm mb-6">
              This helps us tune defaults for inbox, scheduling, and roles. You can invite teammates after onboarding.
            </p>

            <RadioGroup value={size} onValueChange={setSize} className="mb-4 grid grid-cols-1 gap-2">
              {PRACTICE_SIZES.map(opt => (
                <RadioCard
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                  caption={opt.desc}
                  layout="tile"
                  icon={<Icon name={opt.icon} size={18} />}
                />
              ))}
            </RadioGroup>

            <div className="mt-7 flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={back}>
                <ArrowLeft size={12} /> Back
              </Button>
              <Button onClick={finish}>
                Create cabinet <ArrowRight size={14} />
              </Button>
            </div>
          </>
        )}

        <p className="mt-6 border-t border-[var(--border)] pt-4 text-center text-k-xs text-[var(--ink-500)]">
          Signed in as <span className="text-[var(--ink-700)]">{email}</span> ·{" "}
          <button type="button" onClick={onSignOut} className="underline underline-offset-2 hover:text-[var(--ink-900)]">
            Not you?
          </button>
        </p>
      </section>
    </KitAuthShell>
  );
}

function DerivedChip({ iconName, label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-2">
      <span
        aria-hidden
        className="flex size-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--ink-600)]"
      >
        <Icon name={iconName} size={12} />
      </span>
      <div className="min-w-0">
        <div className="text-k-overline uppercase tracking-k-caps text-[var(--ink-500)]">{label}</div>
        <div className="text-k-xs truncate text-[var(--ink-800)]">{value}</div>
      </div>
    </div>
  );
}

/* ============================================================
   MemberKycPage — single-screen clinician verification form.
   ============================================================ */
export function MemberKycPage({ email, workspace, onComplete, onSignOut }) {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [license, setLicense] = useState("");
  const [issuer, setIssuer] = useState(workspace.country);
  const [specialty, setSpecialty] = useState(workspace.specialty || "General practice");
  const [idDocName, setIdDocName] = useState("");
  const [selfieName, setSelfieName] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const issuerCountry = COUNTRIES.find(c => c.code === issuer) ?? COUNTRIES[0];

  const isValid =
    fullName.trim().length >= 3 &&
    /^\d{4}-\d{2}-\d{2}$/.test(dob) &&
    license.trim().length >= 3 &&
    idDocName &&
    selfieName &&
    consent;

  const submit = () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onComplete({
        fullName: fullName.trim(),
        dob,
        license: license.trim(),
        issuer: issuerCountry.code,
        specialty,
        idDocName,
        selfieName,
        consent,
      });
    }, 700);
  };

  return (
    <KitAuthShell eyebrow="Verify your identity">
      <section className="w-[560px] max-w-[calc(100vw-2rem)] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-7 shadow-[var(--shadow-xs)]">
        <div className="mb-5 flex items-start gap-3">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius)] bg-[var(--brand-50)] text-[var(--brand-700)]"
          >
            <ShieldCheck size={18} />
          </span>
          <div>
            <h1 className="k-h3 leading-tight">Verify your clinician identity</h1>
            <p className="k-body-sm mt-1.5">
              Required before you can place orders, see PHI, or sign documents. Usually reviewed within 24 hours.
            </p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Full legal name</FieldLabel>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Dr. Jane Smith" autoFocus />
          </div>
          <div>
            <FieldLabel>Date of birth</FieldLabel>
            <Input value={dob} onChange={e => setDob(e.target.value)} placeholder="YYYY-MM-DD" />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Medical license number</FieldLabel>
            <Input value={license} onChange={e => setLicense(e.target.value)} placeholder="e.g. RPPS 10001234567" />
          </div>
          <div>
            <FieldLabel>Issuing country</FieldLabel>
            <NativeSelect value={issuer} onChange={setIssuer}>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
            </NativeSelect>
          </div>
        </div>

        <div className="mb-5">
          <FieldLabel>Specialty</FieldLabel>
          <NativeSelect value={specialty} onChange={setSpecialty}>
            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
          </NativeSelect>
        </div>

        <FieldLabel>Documents</FieldLabel>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <FileDrop
            icon={<Upload size={14} />}
            label="Photo of license or ID"
            fileName={idDocName}
            onPick={setIdDocName}
          />
          <FileDrop
            icon={<Camera size={14} />}
            label="Selfie for face match"
            fileName={selfieName}
            onPick={setSelfieName}
          />
        </div>

        <label className="mb-5 flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
            className="mt-0.5 size-4 accent-[var(--brand-500)]"
          />
          <span className="text-k-xs leading-relaxed text-[var(--ink-600)]">
            I confirm the information above is accurate and consent to Kura sharing it with our identity-verification partner
            for the sole purpose of verifying my clinician status. I can revoke consent anytime from settings.
          </span>
        </label>

        <Banner tone="info" className="mb-5">
          Only verified clinicians can place orders and view patient health information.
        </Banner>

        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onSignOut}>Sign out</Button>
          <Button onClick={submit} disabled={!isValid || submitting} className="min-w-[180px]">
            {submitting ? (
              <><Loader2 size={14} className="animate-spin" /> Submitting…</>
            ) : (
              <>Submit <ArrowRight size={14} /></>
            )}
          </Button>
        </div>

        <p className="mt-6 border-t border-[var(--border)] pt-4 text-center text-k-xs text-[var(--ink-500)]">
          {workspace.name} · <span className="text-[var(--ink-700)]">{email}</span>
        </p>
      </section>
    </KitAuthShell>
  );
}

function FileDrop({ icon, label, fileName, onPick }) {
  const inputRef = React.useRef(null);
  const onChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) onPick(f.name);
  };
  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className={`flex w-full items-center gap-3 rounded-[var(--radius)] border px-3.5 py-3 text-left transition ${
        fileName
          ? "border-[var(--brand-500)] bg-[var(--brand-50)]"
          : "border-dashed border-[var(--border)] bg-[var(--surface)] hover:border-[var(--ink-400)]"
      }`}
    >
      <span
        aria-hidden
        className={`flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] ${
          fileName
            ? "bg-[var(--brand-100)] text-[var(--brand-700)]"
            : "border border-[var(--border)] bg-[var(--surface-2)] text-[var(--ink-500)]"
        }`}
      >
        {fileName ? <CheckCircle2 size={14} /> : icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-k-body font-medium leading-tight text-[var(--ink-900)]">{label}</span>
        <span className="mt-0.5 block truncate text-k-xs text-[var(--ink-500)]">
          {fileName || "Click to upload"}
        </span>
      </span>
      <input ref={inputRef} type="file" accept="image/*,.pdf" onChange={onChange} className="hidden" />
    </button>
  );
}
