import { useState, useEffect } from "react";
import {
  ShieldCheck, Globe, Award, Building2, Fingerprint, Clock, Lock,
  ArrowRight, CheckCircle2, AlertCircle, ChevronDown, FileText,
  Smartphone, Hash, Stamp, Key, Scale, ExternalLink, Sparkles
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  IconBadge,
  StatusPill,
  Banner,
  Button,
} from "@kura/ui-kit";

/* ============================================================
   Per-country signing provider matrix (2026 SEA landscape).

   All providers expose the same CSC v2 (ETSI TS 119 432) HTTP
   contract: credentials/authorize, signatures/signHash. The PAdES
   embedding pipeline upstream is therefore identical regardless of
   country — only the provider config + UX seam (mobile handoff,
   OTP, etc.) changes.

   Strategy: build against CSC, instantiate per workspace.country.
   Self-issued AES providers (KH/PH) cover lenient-market MVP;
   licensed-CA QES providers (VN/ID/MY) unlock strict markets
   without rearchitecture.
   ============================================================ */
export const SIGNING_PROVIDERS = {
  KH: {
    country: "Cambodia",
    flag: "🇰🇭",
    name: "Kura Internal CA",
    fqdn: "ca.kura.med",
    level: "AES",
    padesProfile: "PAdES-B-LT",
    legalBasis: "Law on E-Commerce NS/RKM/1119/017 (2019), Art. 11–13",
    legalNote: "Simple/advanced e-signature accepted with mutual consent. License-bound identity from MoH eKYC.",
    tsp: "Self-issued",
    tspKind: "internal",
    tsa: "freetsa.org (RFC 3161)",
    enrollmentTime: "~30s, automatic at eKYC",
    enrollmentMode: "automatic",
    perSignature: "Free",
    stepUp: "none",
  },
  VN: {
    country: "Vietnam",
    flag: "🇻🇳",
    name: "VNPT-CA",
    fqdn: "ca.vnpt.vn",
    level: "QES",
    padesProfile: "PAdES-B-LTA",
    legalBasis: "Law on Electronic Transactions 2023, Decree 117/2020, Circular 04/2022",
    legalNote: "Qualified digital signature mandatory for all e-prescriptions. MIC-licensed CA required by law.",
    tsp: "VNPT (MIC-licensed)",
    tspKind: "licensed-ca",
    tsa: "VNPT TSA",
    enrollmentTime: "~15 min, in-person license verification",
    enrollmentMode: "in-person",
    perSignature: "$0.45",
    stepUp: "otp-pin",
  },
  ID: {
    country: "Indonesia",
    flag: "🇮🇩",
    name: "PrivyID",
    fqdn: "privy.id",
    level: "QES",
    padesProfile: "PAdES-B-LTA",
    legalBasis: "Permenkes 24/2022, GR 71/2019, ITE Law 2008/2016",
    legalNote: "Certified digital signature mandatory for electronic medical records. PSrE-licensed (Kominfo).",
    tsp: "PrivyID (Kominfo-licensed PSrE)",
    tspKind: "licensed-ca",
    tsa: "PrivyID TSA",
    enrollmentTime: "~8 min, mobile app onboarding",
    enrollmentMode: "mobile-app",
    perSignature: "$0.30",
    stepUp: "mobile-handoff",
  },
  MY: {
    country: "Malaysia",
    flag: "🇲🇾",
    name: "Pos Digicert",
    fqdn: "posdigicert.com.my",
    level: "QES",
    padesProfile: "PAdES-B-LTA",
    legalBasis: "Digital Signature Act 1997 (Act 562), Communications and Multimedia Act 1998",
    legalNote: "Only MCMC-licensed CA signatures carry legal weight as 'digital signature' under DSA 1997.",
    tsp: "Pos Digicert (MCMC-licensed)",
    tspKind: "licensed-ca",
    tsa: "MSC Trustgate TSA",
    enrollmentTime: "~12 min, soft-cert via MyDigital ID",
    enrollmentMode: "remote",
    perSignature: "$0.55",
    stepUp: "otp-pin",
  },
  TH: {
    country: "Thailand",
    flag: "🇹🇭",
    name: "Thai Digital ID",
    fqdn: "thaiid.in.th",
    level: "AES",
    padesProfile: "PAdES-B-LT",
    legalBasis: "Electronic Transactions Act B.E. 2544 (2001), MoPH e-prescription guidelines",
    legalNote: "Secure digital signature with timestamp required for e-prescriptions. ETDA-supervised TSP.",
    tsp: "Thai Digital ID (ETDA-supervised)",
    tspKind: "licensed-ca",
    tsa: "TDID TSA",
    enrollmentTime: "~5 min, NDID linkage",
    enrollmentMode: "remote",
    perSignature: "$0.20",
    stepUp: "otp",
  },
  SG: {
    country: "Singapore",
    flag: "🇸🇬",
    name: "Netrust",
    fqdn: "netrust.net",
    level: "AES",
    padesProfile: "PAdES-B-LT",
    legalBasis: "Electronic Transactions Act 2010 (amended 2021), HSA NEHR guidelines",
    legalNote: "Secure electronic signature with audit chain. IMDA-supervised TSP.",
    tsp: "Netrust (IMDA-licensed)",
    tspKind: "licensed-ca",
    tsa: "Netrust TSA",
    enrollmentTime: "~3 min, Singpass linkage",
    enrollmentMode: "remote",
    perSignature: "$0.35",
    stepUp: "singpass",
  },
  PH: {
    country: "Philippines",
    flag: "🇵🇭",
    name: "Kura Internal CA",
    fqdn: "ca.kura.med",
    level: "AES",
    padesProfile: "PAdES-B-LT",
    legalBasis: "Electronic Commerce Act RA 8792, DOH e-prescription Administrative Order",
    legalNote: "AES with audit trail accepted. DICT-supervised TSP uplift available for high-stakes use.",
    tsp: "Self-issued (RA 8792 compliant)",
    tspKind: "internal",
    tsa: "freetsa.org (RFC 3161)",
    enrollmentTime: "~30s, automatic at eKYC",
    enrollmentMode: "automatic",
    perSignature: "Free",
    stepUp: "none",
  },
};

export function getSigningProvider(country) {
  return SIGNING_PROVIDERS[country] ?? SIGNING_PROVIDERS.KH;
}

const LEVEL_LABEL = {
  AES: { label: "Advanced", tone: "jade" },
  QES: { label: "Qualified", tone: "plum" },
};

// Mock hash generator — stands in for SHA-256 over the PDF byte range.
function mockHash(len = 40) {
  const c = "abcdef0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
}

/* ============================================================
   simulateSign — async stand-in for the CSC v2 signing pipeline.
   Real call sequence:
     1. credentials/authorize → returns SAD (Signature Activation Data)
     2. signatures/signHash    → HSM-held key signs the doc hash
     3. RFC 3161 timestamp     → TSA timestamps the signature
     4. embed CMS into PDF byte range (PAdES-B-LT[A])
   ============================================================ */
export async function simulateSign({ documentId, documentTitle, doctor, provider, onProgress }) {
  const stage = (s, ms = 500) => new Promise(r => {
    onProgress?.(s);
    setTimeout(r, ms);
  });

  await stage("hashing", 350);
  await stage("authorizing", 500);
  await stage("signing", 700);
  await stage("timestamping", 400);
  await stage("embedding", 350);

  const now = new Date();
  return {
    documentId,
    documentTitle,
    documentHash: mockHash(64),
    signatureValue: mockHash(128),
    subjectDN: `CN=${doctor.name}, L=${doctor.license}, O=Kura, C=${doctor.country ?? "KH"}`,
    issuer: provider.tsp,
    tsa: provider.tsa,
    timestamp: now.toISOString(),
    padesProfile: provider.padesProfile,
    level: provider.level,
    verifyUrl: `kura.med/verify/${(documentId || "demo").toLowerCase()}`,
    provider: { ...provider },
    doctor: { name: doctor.name, license: doctor.license },
  };
}

/* ============================================================
   SignatureBadge — embed-anywhere panel showing PAdES details.
   Use on signed-document footers (Rx, Dx PDFs).
   ============================================================ */
export function SignatureBadge({ record, compact = false }) {
  if (!record) return null;
  const levelMeta = LEVEL_LABEL[record.level] ?? LEVEL_LABEL.AES;
  const dt = new Date(record.timestamp);
  const dateStr = dt.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const tone = levelMeta.tone === "plum" ? "info" : "success";

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 text-[10.5px] font-mono">
        <StatusPill tone={tone} icon={<ShieldCheck size={10} />}>
          {record.padesProfile}
        </StatusPill>
        <span className="text-ink-3">·</span>
        <span className="text-ink-2 truncate">{record.issuer}</span>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)] p-3.5">
      <div className="flex items-start gap-3">
        <IconBadge tone={tone === "info" ? "info" : "brand"} size="md">
          <ShieldCheck size={17} strokeWidth={1.75} />
        </IconBadge>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-k-overline uppercase tracking-k-caps text-[var(--ink-500)]">
              Electronically signed
            </span>
            <StatusPill tone={tone}>
              {record.padesProfile} · {levelMeta.label}
            </StatusPill>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] leading-snug">
            <div>
              <div className="text-ink-3 text-[9.5px] uppercase tracking-wider">Signer</div>
              <div className="text-ink font-medium">{record.doctor?.name}</div>
              <div className="text-ink-3 font-mono text-[10px]">{record.doctor?.license}</div>
            </div>
            <div>
              <div className="text-ink-3 text-[9.5px] uppercase tracking-wider">Issuer (TSP)</div>
              <div className="text-ink">{record.issuer}</div>
              <div className="text-ink-3 font-mono text-[10px]">{record.provider?.fqdn}</div>
            </div>
            <div>
              <div className="text-ink-3 text-[9.5px] uppercase tracking-wider">Timestamp (TSA)</div>
              <div className="text-ink font-mono text-[10.5px]">{dateStr}</div>
              <div className="text-ink-3 font-mono text-[10px]">{record.tsa}</div>
            </div>
            <div>
              <div className="text-ink-3 text-[9.5px] uppercase tracking-wider">Document hash</div>
              <div className="text-ink-2 font-mono text-[10px] truncate" title={record.documentHash}>
                {record.documentHash.slice(0, 24)}…
              </div>
              <div className="text-ink-3 text-[10px]">SHA-256 over byte range</div>
            </div>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-line-2 flex items-center justify-between">
            <a
              href="#"
              onClick={e => e.preventDefault()}
              className="text-[11px] text-jade-2 hover:underline inline-flex items-center gap-1 font-medium"
            >
              <ExternalLink size={11} /> {record.verifyUrl}
            </a>
            <span className="text-[10px] text-ink-3 font-mono">{record.documentId}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SignDocumentModal — walks the doctor through the CSC signing
   flow. Steps vary by provider:
     - internal (KH/PH):     review → signing (no step-up)
     - otp / otp-pin (VN/MY/TH): review → step-up → signing
     - singpass (SG):        review → singpass step-up → signing
     - mobile-handoff (ID):  review → "open PrivyID app" → signing
   All variants converge on the same `done` state.
   ============================================================ */
export function SignDocumentModal({ onClose, onSigned, provider, doctor, document }) {
  const [phase, setPhase] = useState("review"); // review | stepup | signing | done
  const [stageLabel, setStageLabel] = useState("");
  const [otp, setOtp] = useState("");
  const [record, setRecord] = useState(null);

  const handleBeginSigning = async () => {
    setPhase("signing");
    const r = await simulateSign({
      documentId: document.id,
      documentTitle: document.title,
      doctor,
      provider,
      onProgress: setStageLabel,
    });
    setRecord(r);
    setPhase("done");
    onSigned?.(r);
  };

  const handleProceedFromReview = () => {
    if (provider.stepUp === "none") {
      handleBeginSigning();
    } else {
      setPhase("stepup");
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open && phase !== "signing") onClose(); }}>
      <DialogContent
        showCloseButton={phase !== "signing"}
        className="max-w-[520px] gap-0 overflow-hidden p-0"
        onPointerDownOutside={(e) => { if (phase === "signing") e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (phase === "signing") e.preventDefault(); }}
      >
        {phase === "review" && (
          <SignReviewStep
            provider={provider}
            doctor={doctor}
            document={document}
            onCancel={onClose}
            onProceed={handleProceedFromReview}
          />
        )}
        {phase === "stepup" && (
          <SignStepUpStep
            provider={provider}
            otp={otp}
            setOtp={setOtp}
            onBack={() => setPhase("review")}
            onProceed={handleBeginSigning}
          />
        )}
        {phase === "signing" && (
          <SignProgressStep
            provider={provider}
            stageLabel={stageLabel}
          />
        )}
        {phase === "done" && record && (
          <SignDoneStep
            record={record}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function SignReviewStep({ provider, doctor, document, onCancel, onProceed }) {
  const levelMeta = LEVEL_LABEL[provider.level];
  return (
    <>
      <div className="px-6 pt-7 pb-4">
        <div className="text-[10.5px] uppercase tracking-[0.18em] text-ink-3 font-semibold mb-1">
          Sign &amp; issue
        </div>
        <h2 className="font-display text-[19px] font-medium leading-snug">
          {document.title}
        </h2>
        <p className="text-[12px] text-ink-3 mt-1.5">
          You are about to electronically sign this document. Review the details below before continuing.
        </p>
      </div>

      <div className="px-6 pb-4 space-y-3">
        <ReviewRow icon={<FileText size={13} />} label="Document">
          <div className="text-[12.5px] text-ink">{document.title}</div>
          <div className="text-[10.5px] text-ink-3 font-mono">{document.id}</div>
        </ReviewRow>
        <ReviewRow icon={<Fingerprint size={13} />} label="Signer">
          <div className="text-[12.5px] text-ink">{doctor.name}</div>
          <div className="text-[10.5px] text-ink-3 font-mono">{doctor.license}</div>
        </ReviewRow>
        <ReviewRow icon={<Award size={13} />} label="Signature method">
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-ink">{provider.name}</span>
            <span className={`text-[9.5px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
              levelMeta.tone === "plum" ? "text-plum bg-line-2" : "text-jade-2 bg-jade-soft"
            }`}>
              {provider.padesProfile} · {levelMeta.label}
            </span>
          </div>
          <div className="text-[10.5px] text-ink-3 mt-0.5">
            {provider.flag} {provider.country} · {provider.tsp}
          </div>
        </ReviewRow>
        <ReviewRow icon={<Scale size={13} />} label="Legal basis">
          <div className="text-[11.5px] text-ink-2 leading-snug">{provider.legalBasis}</div>
        </ReviewRow>
      </div>

      <div className="flex items-center gap-2 border-t border-[var(--border)] bg-[var(--surface-2)] px-6 py-4">
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <div className="flex-1" />
        <Button onClick={onProceed} size="sm">
          <ShieldCheck size={13} />
          {provider.stepUp === "none" ? "Sign now" : "Continue"}
          {provider.stepUp !== "none" && <ArrowRight size={12} />}
        </Button>
      </div>
    </>
  );
}

function ReviewRow({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3 border-b border-[var(--border)] py-2 last:border-b-0">
      <IconBadge tone="brand" size="sm">{icon}</IconBadge>
      <div className="flex-1 min-w-0">
        <div className="mb-0.5 text-k-overline uppercase tracking-k-caps text-[var(--ink-500)]">{label}</div>
        {children}
      </div>
    </div>
  );
}

function SignStepUpStep({ provider, otp, setOtp, onBack, onProceed }) {
  const mode = provider.stepUp;

  if (mode === "mobile-handoff") {
    return (
      <MobileHandoffStep
        provider={provider}
        onBack={onBack}
        onProceed={onProceed}
      />
    );
  }
  if (mode === "singpass") {
    return (
      <SingpassStep
        provider={provider}
        onBack={onBack}
        onProceed={onProceed}
      />
    );
  }
  // otp or otp-pin
  return (
    <OtpStep
      provider={provider}
      otp={otp}
      setOtp={setOtp}
      withPin={mode === "otp-pin"}
      onBack={onBack}
      onProceed={onProceed}
    />
  );
}

function OtpStep({ provider, otp, setOtp, withPin, onBack, onProceed }) {
  const [pin, setPin] = useState("");
  const ready = otp.length === 6 && (!withPin || pin.length >= 4);
  return (
    <>
      <div className="px-6 pt-7 pb-2">
        <div className="text-[10.5px] uppercase tracking-[0.18em] text-ink-3 font-semibold mb-1">
          Step-up authentication
        </div>
        <h2 className="font-display text-[18px] font-medium leading-snug">
          Confirm with {provider.name}
        </h2>
        <p className="text-[12px] text-ink-3 mt-1.5">
          We sent a 6-digit code to the phone number registered with your {provider.tsp} certificate.
        </p>
      </div>

      <div className="px-6 pb-2 space-y-4">
        <div>
          <label className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold block mb-1.5">
            One-time code
          </label>
          <input
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full bg-surface-2 border border-line-2 rounded-lg px-3 py-2.5 text-[15px] font-mono tracking-[0.3em] text-center focus:outline-none focus:border-jade"
            placeholder="000000"
            autoFocus
          />
        </div>
        {withPin && (
          <div>
            <label className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold block mb-1.5">
              Certificate PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value.slice(0, 8))}
              className="w-full bg-surface-2 border border-line-2 rounded-lg px-3 py-2.5 text-[15px] font-mono tracking-[0.3em] text-center focus:outline-none focus:border-jade"
              placeholder="••••"
            />
            <div className="text-[10.5px] text-ink-3 mt-1">
              The PIN protects your private key — {provider.tsp} never sees it in clear.
            </div>
          </div>
        )}
        <Banner tone="warning" icon={<AlertCircle size={14} />}>
          Demo prototype — any 6-digit code works. Real flow validates against the TSP's authentication server before HSM signing.
        </Banner>
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-[var(--border)] bg-[var(--surface-2)] px-6 py-4">
        <Button variant="ghost" size="sm" onClick={onBack}>Back</Button>
        <div className="flex-1" />
        <Button onClick={onProceed} disabled={!ready} size="sm">
          <ShieldCheck size={13} /> Sign now <ArrowRight size={12} />
        </Button>
      </div>
    </>
  );
}

function MobileHandoffStep({ provider, onBack, onProceed }) {
  const [waiting, setWaiting] = useState(false);
  useEffect(() => {
    if (!waiting) return;
    const t = setTimeout(onProceed, 1800);
    return () => clearTimeout(t);
  }, [waiting, onProceed]);
  return (
    <>
      <div className="px-6 pt-7 pb-2 text-center">
        <div className="text-[10.5px] uppercase tracking-[0.18em] text-ink-3 font-semibold mb-1">
          Mobile handoff
        </div>
        <h2 className="font-display text-[18px] font-medium leading-snug">
          Continue in the {provider.name} app
        </h2>
      </div>

      <div className="flex flex-col items-center gap-4 px-6 py-3 pb-4">
        <IconBadge tone="brand" size="lg" className="size-20 [&>svg]:size-8">
          <Smartphone size={32} strokeWidth={1.5} />
        </IconBadge>
        {!waiting ? (
          <>
            <p className="max-w-[380px] text-center text-k-body leading-snug text-[var(--ink-600)]">
              {provider.name} requires you to approve this signature in their mobile app.
              We've sent a notification to the device linked to your certificate.
            </p>
            <Button onClick={() => setWaiting(true)} size="sm">
              <Smartphone size={13} /> Simulate approval on phone
            </Button>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-1 inline-flex items-center gap-2 text-k-body font-medium text-[var(--brand-600)]">
              <span className="size-2 animate-pulse rounded-full bg-[var(--brand-500)]" />
              Waiting for approval on {provider.name}…
            </div>
            <div className="text-k-xs text-[var(--ink-500)]">
              Tap "Approve" in the app to complete the signature.
            </div>
          </div>
        )}

        <Banner tone="warning" icon={<AlertCircle size={14} />} className="w-full">
          Indonesia QES flows always require mobile approval. This is a regulatory requirement, not a UX choice — design your Rx flow to tolerate the handoff.
        </Banner>
      </div>

      <div className="flex items-center gap-2 border-t border-[var(--border)] bg-[var(--surface-2)] px-6 py-4">
        <Button variant="ghost" size="sm" onClick={onBack}>Back</Button>
      </div>
    </>
  );
}

function SingpassStep({ provider, onBack, onProceed }) {
  const [waiting, setWaiting] = useState(false);
  useEffect(() => {
    if (!waiting) return;
    const t = setTimeout(onProceed, 1400);
    return () => clearTimeout(t);
  }, [waiting, onProceed]);
  return (
    <>
      <div className="px-6 pt-7 pb-2 text-center">
        <div className="text-[10.5px] uppercase tracking-[0.18em] text-ink-3 font-semibold mb-1">
          Singpass
        </div>
        <h2 className="font-display text-[18px] font-medium leading-snug">
          Authenticate with Singpass
        </h2>
      </div>
      <div className="flex flex-col items-center gap-4 px-6 py-3 pb-4">
        <IconBadge tone="brand" size="lg" className="size-20 [&>svg]:size-8">
          <Fingerprint size={32} strokeWidth={1.5} />
        </IconBadge>
        {!waiting ? (
          <>
            <p className="max-w-[380px] text-center text-k-body leading-snug text-[var(--ink-600)]">
              Sign in with Singpass to authorize this signature. Your {provider.tsp} certificate is linked to your Singpass identity.
            </p>
            <Button onClick={() => setWaiting(true)} size="sm">
              <Fingerprint size={13} /> Continue with Singpass
            </Button>
          </>
        ) : (
          <div className="inline-flex items-center gap-2 text-k-body font-medium text-[var(--brand-600)]">
            <span className="size-2 animate-pulse rounded-full bg-[var(--brand-500)]" />
            Verifying Singpass biometric…
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 border-t border-[var(--border)] bg-[var(--surface-2)] px-6 py-4">
        <Button variant="ghost" size="sm" onClick={onBack}>Back</Button>
      </div>
    </>
  );
}

function SignProgressStep({ provider, stageLabel }) {
  const stages = [
    { id: "hashing",      label: "Hashing document (SHA-256)", icon: Hash },
    { id: "authorizing",  label: `Authorizing with ${provider.tsp}`, icon: Key },
    { id: "signing",      label: "HSM signing the hash",       icon: Lock },
    { id: "timestamping", label: `RFC 3161 timestamp via ${provider.tsa}`, icon: Stamp },
    { id: "embedding",    label: `Embedding signature (${provider.padesProfile})`, icon: ShieldCheck },
  ];
  const activeIdx = stages.findIndex(s => s.id === stageLabel);
  return (
    <div className="px-6 py-7">
      <div className="text-[10.5px] uppercase tracking-[0.18em] text-ink-3 font-semibold mb-1 text-center">
        Signing
      </div>
      <h2 className="font-display text-[18px] font-medium leading-snug text-center mb-5">
        Sealing the document…
      </h2>

      <div className="space-y-2">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const done = idx < activeIdx || (activeIdx === -1 && false);
          const active = idx === activeIdx;
          return (
            <div
              key={stage.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
                active ? "bg-jade-soft" : done ? "" : "opacity-50"
              }`}
            >
              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                done ? "bg-jade text-white" :
                active ? "bg-bg border border-jade text-jade-2" :
                "bg-surface-2 text-ink-3"
              }`}>
                {done ? <CheckCircle2 size={14} /> : <Icon size={13} />}
              </div>
              <div className={`text-[12.5px] flex-1 ${
                active ? "text-ink font-medium" :
                done ? "text-ink-2" :
                "text-ink-3"
              }`}>
                {stage.label}
              </div>
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-jade animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SignDoneStep({ record, onClose }) {
  return (
    <>
      <div className="px-6 pb-2 pt-7 text-center">
        <span className="mx-auto mb-3 inline-flex">
          <IconBadge tone="success" size="lg">
            <CheckCircle2 size={26} strokeWidth={1.75} />
          </IconBadge>
        </span>
        <h2 className="k-h3 leading-snug">Signed and sealed</h2>
        <p className="mt-1 text-k-body text-[var(--ink-500)]">
          The document is now legally valid in {record.provider.country}.
        </p>
      </div>
      <div className="px-6 pb-5">
        <SignatureBadge record={record} />
      </div>
      <div className="flex items-center gap-2 border-t border-[var(--border)] bg-[var(--surface-2)] px-6 py-4">
        <div className="flex-1" />
        <Button onClick={onClose} size="sm">Done</Button>
      </div>
    </>
  );
}

/* ============================================================
   SigningSettingsView — the workspace's e-signature configuration
   page. Shows the active provider (driven by workspace.country),
   the doctor's enrolled certificate, and recent signatures. The
   country switcher lets you preview how other SEA markets are
   configured — no workspace mutation, view-only.
   ============================================================ */
export function SigningSettingsView({ workspace, doctor }) {
  const actualCountry = workspace?.country ?? "KH";
  const [previewCountry, setPreviewCountry] = useState(actualCountry);
  const provider = getSigningProvider(previewCountry);
  const isPreview = previewCountry !== actualCountry;
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [signatures, setSignatures] = useState([]);
  const levelMeta = LEVEL_LABEL[provider.level];

  const onSigned = (record) => {
    setSignatures(prev => [record, ...prev].slice(0, 8));
  };

  return (
    <div className="px-8 py-6 max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between gap-6 mb-1">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-3 mb-1">
            Cabinet · Workspace settings
          </div>
          <h1 className="font-display text-[28px] font-medium leading-none">
            e-Signature
          </h1>
          <p className="text-[12.5px] text-ink-3 mt-1.5 max-w-[640px]">
            How Rx, Dx, and clinical PDFs are electronically sealed.
            Provider is automatically selected based on your workspace's country —
            every region's regulator gets the right thing.
          </p>
        </div>
        <CountrySwitcher
          value={previewCountry}
          onChange={setPreviewCountry}
          actualCountry={actualCountry}
        />
      </div>

      {isPreview && (
        <Banner
          tone="warning"
          icon={<AlertCircle size={14} />}
          title="Preview mode"
          className="mb-4 mt-4"
        >
          You're viewing how Kura signs documents for a {provider.flag} <span className="font-medium">{provider.country}</span> workspace.
          Your actual workspace ({SIGNING_PROVIDERS[actualCountry].flag} {SIGNING_PROVIDERS[actualCountry].country}) is unchanged.
        </Banner>
      )}

      <div className="mt-5 grid grid-cols-12 gap-5">
        {/* Active provider card */}
        <div className="col-span-7 bg-surface border border-line rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-line-2 bg-surface-2/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-jade-2" />
              <div className="text-[12px] font-medium text-ink">Active signing provider</div>
            </div>
            <StatusPill tone={levelMeta.tone === "plum" ? "info" : "success"}>
              {levelMeta.label} · {provider.padesProfile}
            </StatusPill>
          </div>
          <div className="px-5 py-4">
            <div className="mb-4 flex items-start gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-[var(--radius)] border border-[var(--brand-200)] bg-[var(--brand-50)] text-[18px]">
                {provider.flag}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-medium text-ink leading-tight">{provider.name}</div>
                <div className="text-[11.5px] text-ink-3 font-mono mt-0.5">{provider.fqdn}</div>
                <div className="text-[11px] text-ink-2 mt-1">
                  {provider.tsp} · {provider.country}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11.5px]">
              <ProviderStat icon={<Award size={11} />} label="Assurance level" value={`${provider.level} (${levelMeta.label})`} />
              <ProviderStat icon={<Stamp size={11} />} label="PAdES profile" value={provider.padesProfile} mono />
              <ProviderStat icon={<Building2 size={11} />} label="Timestamp authority" value={provider.tsa} />
              <ProviderStat icon={<Clock size={11} />} label="Enrollment time" value={provider.enrollmentTime} />
              <ProviderStat icon={<Key size={11} />} label="Step-up" value={stepUpLabel(provider.stepUp)} />
              <ProviderStat icon={<Sparkles size={11} />} label="Per-signature cost" value={provider.perSignature} />
            </div>

            <div className="mt-4 pt-4 border-t border-line-2">
              <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold mb-1.5 inline-flex items-center gap-1">
                <Scale size={11} /> Legal basis
              </div>
              <div className="text-[11.5px] text-ink-2 leading-snug mb-2">{provider.legalBasis}</div>
              <div className="text-[11px] text-ink-3 leading-snug">{provider.legalNote}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-[var(--border)] bg-[var(--surface-2)] px-5 py-3">
            <Button
              onClick={() => setSignModalOpen(true)}
              disabled={isPreview}
              size="sm"
              title={isPreview ? "Disabled in preview mode — switch back to your workspace country to sign" : ""}
            >
              <ShieldCheck size={12} /> Sign a test document
            </Button>
            <span className="text-k-2xs text-[var(--ink-500)]">
              Walks through the full CSC v2 flow without producing a real signature.
            </span>
          </div>
        </div>

        {/* Doctor's certificate card */}
        <div className="col-span-5 bg-surface border border-line rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-line-2 bg-surface-2/40 flex items-center gap-2">
            <Fingerprint size={14} className="text-jade-2" />
            <div className="text-[12px] font-medium text-ink">Your enrolled certificate</div>
          </div>
          <div className="px-5 py-4">
            <div className="font-mono text-[11px] text-ink-2 leading-relaxed bg-surface-2 border border-line-2 rounded-md px-3 py-2.5 mb-3">
              <div><span className="text-ink-3">CN=</span>{doctor.name}</div>
              <div><span className="text-ink-3">L=</span>{doctor.license}</div>
              <div><span className="text-ink-3">O=</span>Kura</div>
              <div><span className="text-ink-3">C=</span>{previewCountry}</div>
              <div><span className="text-ink-3">issuer=</span>{provider.tsp}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <div className="text-[9.5px] uppercase tracking-wider text-ink-3 font-semibold">Status</div>
                <div className="inline-flex items-center gap-1 text-jade-2 font-medium">
                  <CheckCircle2 size={11} /> Active
                </div>
              </div>
              <div>
                <div className="text-[9.5px] uppercase tracking-wider text-ink-3 font-semibold">Expires</div>
                <div className="text-ink font-mono text-[10.5px]">2027-05-13</div>
              </div>
              <div>
                <div className="text-[9.5px] uppercase tracking-wider text-ink-3 font-semibold">Key algorithm</div>
                <div className="text-ink font-mono text-[10.5px]">ECDSA P-256 / SHA-256</div>
              </div>
              <div>
                <div className="text-[9.5px] uppercase tracking-wider text-ink-3 font-semibold">Key custody</div>
                <div className="text-ink text-[11px]">{provider.tspKind === "internal" ? "Kura HSM" : `${provider.tsp} HSM`}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent signatures */}
        <div className="col-span-12 bg-surface border border-line rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-line-2 bg-surface-2/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-jade-2" />
              <div className="text-[12px] font-medium text-ink">Recent signatures</div>
            </div>
            <div className="text-[10.5px] text-ink-3 font-mono">{signatures.length} this session</div>
          </div>
          {signatures.length === 0 ? (
            <div className="px-5 py-10 text-center text-[12px] text-ink-3">
              No signatures yet. Try the test signing flow above to see how it works.
            </div>
          ) : (
            <ul className="divide-y divide-line-2">
              {signatures.map(record => (
                <li key={record.documentId + record.timestamp} className="px-5 py-3 hover:bg-surface-2/50">
                  <div className="flex items-center gap-3">
                    <IconBadge tone="brand" size="md">
                      <FileText size={14} />
                    </IconBadge>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] text-ink truncate font-medium">{record.documentTitle}</div>
                      <div className="text-[10.5px] text-ink-3 font-mono">{record.documentId}</div>
                    </div>
                    <SignatureBadge record={record} compact />
                    <div className="text-[10.5px] text-ink-3 font-mono">
                      {new Date(record.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* SEA regulatory map */}
        <div className="col-span-12 bg-surface border border-line rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-line-2 bg-surface-2/40 flex items-center gap-2">
            <Globe size={14} className="text-jade-2" />
            <div className="text-[12px] font-medium text-ink">SEA regulatory landscape</div>
            <div className="flex-1" />
            <div className="text-[10.5px] text-ink-3">
              Click any row to preview that country's signing flow
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11.5px]">
              <thead className="bg-surface-2/30 text-ink-3 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Country</th>
                  <th className="px-4 py-2 text-left font-semibold">Provider</th>
                  <th className="px-4 py-2 text-left font-semibold">Level</th>
                  <th className="px-4 py-2 text-left font-semibold">PAdES</th>
                  <th className="px-4 py-2 text-left font-semibold">Step-up</th>
                  <th className="px-4 py-2 text-left font-semibold">Cost</th>
                  <th className="px-4 py-2 text-left font-semibold">Legal anchor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-2">
                {Object.entries(SIGNING_PROVIDERS).map(([cc, p]) => {
                  const lvl = LEVEL_LABEL[p.level];
                  const active = cc === previewCountry;
                  return (
                    <tr
                      key={cc}
                      onClick={() => setPreviewCountry(cc)}
                      className={`cursor-pointer transition ${active ? "bg-jade-soft/40" : "hover:bg-surface-2/50"}`}
                    >
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-2">
                          <span className="text-[14px]">{p.flag}</span>
                          <span className="text-ink font-medium">{p.country}</span>
                          {cc === actualCountry && (
                            <span className="text-[9px] uppercase tracking-wider font-semibold text-jade-2 bg-jade-soft px-1.5 py-0.5 rounded">
                              You
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-ink-2">{p.name}</td>
                      <td className="px-4 py-2.5">
                        <StatusPill tone={lvl.tone === "plum" ? "info" : "success"}>
                          {p.level}
                        </StatusPill>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-ink-2 text-[10.5px]">{p.padesProfile}</td>
                      <td className="px-4 py-2.5 text-ink-2">{stepUpLabel(p.stepUp)}</td>
                      <td className="px-4 py-2.5 font-mono text-ink-2 text-[10.5px]">{p.perSignature}</td>
                      <td className="px-4 py-2.5 text-ink-3 text-[10.5px] max-w-[280px] truncate" title={p.legalBasis}>
                        {p.legalBasis}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {signModalOpen && (
        <SignDocumentModal
          onClose={() => setSignModalOpen(false)}
          onSigned={onSigned}
          provider={provider}
          doctor={doctor}
          document={{
            id: `KURA-RX-${mockHash(4).toUpperCase()}`,
            title: "Test prescription — demo document",
          }}
        />
      )}
    </div>
  );
}

function CountrySwitcher({ value, onChange, actualCountry }) {
  const [open, setOpen] = useState(false);
  const current = SIGNING_PROVIDERS[value];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 bg-surface border border-line rounded-md px-3 py-1.5 text-[12px] hover:bg-surface-2"
      >
        <span>{current.flag}</span>
        <span className="text-ink">{current.country}</span>
        <ChevronDown size={12} className="text-ink-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[20]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-[21] bg-bg border border-line rounded-lg shadow-lg w-[220px] py-1 overflow-hidden">
            {Object.entries(SIGNING_PROVIDERS).map(([cc, p]) => (
              <button
                key={cc}
                onClick={() => { onChange(cc); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-surface-2 ${
                  cc === value ? "bg-jade-soft" : ""
                }`}
              >
                <span>{p.flag}</span>
                <span className="text-ink flex-1 text-left">{p.country}</span>
                {cc === actualCountry && (
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-jade-2">
                    You
                  </span>
                )}
                {cc === value && cc !== actualCountry && (
                  <CheckCircle2 size={11} className="text-jade-2" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProviderStat({ icon, label, value, mono }) {
  return (
    <div>
      <div className="text-[9.5px] uppercase tracking-[0.14em] text-ink-3 font-semibold inline-flex items-center gap-1">
        {icon} {label}
      </div>
      <div className={`text-[11.5px] text-ink mt-0.5 ${mono ? "font-mono" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function stepUpLabel(stepUp) {
  switch (stepUp) {
    case "none":            return "None (auto)";
    case "otp":             return "SMS / TOTP";
    case "otp-pin":         return "OTP + cert PIN";
    case "mobile-handoff":  return "Mobile app approval";
    case "singpass":        return "Singpass biometric";
    default:                return stepUp;
  }
}
