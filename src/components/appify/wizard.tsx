"use client";

import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Globe,
  ImagePlus,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppifyLogo, AppIconBadge, ColorField, LabeledField, LangToggle } from "./ui";
import { useLang } from "@/lib/appify/i18n";
import { navigate } from "@/lib/appify/router";
import { useAppifyStore } from "@/lib/appify/store";
import { createAppRecord, generatePackageName, SAMPLE_URL, isSampleUrl } from "@/lib/appify/defaults";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type CheckState =
  | { phase: "idle" }
  | { phase: "checking" }
  | {
      phase: "done";
      reachable: boolean;
      https: boolean;
      title: string | null;
      icon: string | null;
    };

const STEPS = ["url", "info", "brand", "review"] as const;

export function WizardPage() {
  const { d, lang } = useLang();
  const createApp = useAppifyStore((s) => s.createApp);

  const [step, setStep] = useState<(typeof STEPS)[number]>("url");
  const [url, setUrl] = useState("");
  const [check, setCheck] = useState<CheckState>({ phase: "idle" });
  const [name, setName] = useState("");
  const [pkg, setPkg] = useState("");
  const [bundle, setBundle] = useState("");
  const [icon, setIcon] = useState<string | undefined>(undefined);
  const [splashBg, setSplashBg] = useState("#6D28D9");
  const [statusBarColor, setStatusBarColor] = useState("#6D28D9");
  const [creating, setCreating] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const ArrowNext = lang === "ar" ? ArrowLeft : ArrowRight;
  const ArrowBack = lang === "ar" ? ArrowRight : ArrowLeft;

  const normalizedUrl = (() => {
    const u = url.trim();
    if (!u) return "";
    return /^https?:\/\//i.test(u) ? u : `https://${u}`;
  })();

  const urlValid = /^https?:\/\/[a-zA-Z0-9][\w.-]*\.[a-zA-Z]{2,}(:\d+)?(\/.*)?$/.test(normalizedUrl);

  const doCheck = async () => {
    if (!urlValid) return;
    setCheck({ phase: "checking" });
    try {
      const res = await fetch("/api/check-site", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl }),
      });
      const data = await res.json();
      setCheck({
        phase: "done",
        reachable: !!data.reachable,
        https: !!data.https,
        title: data.title ?? null,
        icon: data.icon ?? null,
      });
      if (data.title && !name) setName(data.title);
    } catch {
      setCheck({ phase: "done", reachable: false, https: normalizedUrl.startsWith("https"), title: null, icon: null });
    }
  };

  const useSample = () => {
    setUrl(SAMPLE_URL);
    setCheck({ phase: "done", reachable: true, https: true, title: d.store.name, icon: null });
    if (!name) setName(d.store.name);
    setPkg("com.elite.showcase");
    setBundle("com.elite.showcase");
  };

  const goInfo = () => {
    if (!urlValid) {
      toast({ title: d.wizard.errUrl, variant: "destructive" });
      return;
    }
    if (!pkg) {
      const p = generatePackageName(normalizedUrl);
      setPkg(p);
      setBundle(p);
    }
    if (check.phase === "idle") doCheck();
    setStep("info");
  };

  const onIconFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 512;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        // center-crop square
        const side = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        setIcon(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const doCreate = () => {
    if (!name.trim()) {
      toast({ title: d.wizard.errName, variant: "destructive" });
      return;
    }
    setCreating(true);
    setTimeout(() => {
      const record = createAppRecord({
        name: name.trim(),
        url: isSampleUrl(url.trim()) ? url.trim() : normalizedUrl,
        icon,
        packageName: pkg || "com.myapp.app",
        bundleId: bundle || pkg || "com.myapp.app",
        splashBg,
        statusBarColor,
      });
      createApp(record);
      toast({ title: d.wizard.appCreated });
      navigate(`#/app/${record.id}`);
    }, 900);
  };

  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-card/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4 md:px-6">
          <button onClick={() => navigate("#/dashboard")} className="flex items-center gap-3">
            <AppifyLogo />
            <span className="hidden rounded-full bg-muted/60 px-3 py-1 text-xs font-semibold text-muted-foreground sm:block">
              {d.wizard.title}
            </span>
          </button>
          <LangToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 md:px-6 md:py-10">
        <h1 className="font-display text-2xl font-extrabold md:text-3xl">{d.wizard.title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground md:text-base">{d.wizard.subtitle}</p>

        {/* stepper */}
        <div className="mt-7 flex items-center gap-1.5" aria-label="progress">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-1.5">
              <div
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i <= stepIndex ? "bg-primary" : "bg-border",
                )}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span className="text-primary">
            {stepIndex + 1} / 4 — {[d.wizard.step1, d.wizard.step2, d.wizard.step3, d.wizard.step4][stepIndex]}
          </span>
        </div>

        <div className="mt-7 rounded-3xl border border-muted/70 bg-card p-5 md:p-7">
          {/* ============ STEP 1: URL ============ */}
          {step === "url" && (
            <div className="space-y-6">
              <LabeledField label={d.wizard.urlLabel} hint={d.wizard.urlHint}>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Globe className="absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3" />
                    <Input
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        setCheck({ phase: "idle" });
                      }}
                      placeholder={d.wizard.urlPlaceholder}
                      dir="ltr"
                      className="h-12 ps-9 text-base"
                      type="url"
                      inputMode="url"
                    />
                  </div>
                  <Button
                    onClick={doCheck}
                    disabled={!urlValid || check.phase === "checking"}
                    variant="outline"
                    className="h-12 rounded-xl border-primary/25 bg-primary/8 font-bold text-primary hover:bg-primary/15"
                  >
                    {check.phase === "checking" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="size-4" />
                    )}
                    {check.phase === "checking" ? d.wizard.checking : d.wizard.checkBtn}
                  </Button>
                </div>
              </LabeledField>

              {check.phase === "done" && (
                <div
                  className={cn(
                    "rounded-2xl border p-4",
                    check.reachable ? "border-primary/25 bg-primary/[0.06]" : "border-amber-200 bg-amber-50",
                  )}
                >
                  <div className="flex items-start gap-3">
                    {check.reachable ? (
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                    ) : (
                      <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-foreground">
                        {check.reachable ? d.wizard.checkOk : d.wizard.checkFail}
                      </div>
                      {!check.reachable && <p className="mt-1 text-sm text-muted-foreground">{d.wizard.checkFailHint}</p>}
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-bold",
                            check.https ? "bg-primary/12 text-primary" : "bg-amber-50 text-amber-600",
                          )}
                          dir="ltr"
                        >
                          <ShieldCheck className="size-3" />
                          {check.https ? d.wizard.checkHttps : d.wizard.checkNoHttps}
                        </span>
                        {check.title && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-2.5 py-1 text-muted-foreground">
                            {d.wizard.foundTitle}: <span className="max-w-56 truncate font-semibold text-foreground">{check.title}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    {check.icon && (
                       
                      <img src={check.icon} alt="" className="size-11 rounded-xl border border-border bg-card object-contain p-1.5" />
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={useSample}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                <Sparkles className="size-4" />
                {d.wizard.sampleCta}
              </button>

              <div className="flex justify-end">
                <Button onClick={goInfo} size="lg" className="rounded-xl bg-primary font-bold text-primary-foreground">
                  {d.wizard.nextFromUrl}
                  <ArrowNext className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ============ STEP 2: INFO ============ */}
          {step === "info" && (
            <div className="space-y-6">
              <LabeledField label={d.wizard.nameLabel} hint={d.wizard.nameHint}>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={d.wizard.namePlaceholder} className="h-11 text-base" />
              </LabeledField>

              <div className="grid gap-5 md:grid-cols-2">
                <LabeledField label={d.wizard.pkgLabel} hint={d.wizard.pkgHint}>
                  <div className="flex gap-2">
                    <Input value={pkg} onChange={(e) => setPkg(e.target.value)} dir="ltr" className="h-11 font-mono text-sm" />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 shrink-0 rounded-xl border-border bg-card"
                      onClick={() => setPkg(generatePackageName(normalizedUrl))}
                      aria-label={d.wizard.regenerate}
                    >
                      <RefreshCcw className="size-4" />
                    </Button>
                  </div>
                </LabeledField>
                <LabeledField label={d.wizard.bundleLabel} hint={d.wizard.bundleHint}>
                  <Input value={bundle} onChange={(e) => setBundle(e.target.value)} dir="ltr" className="h-11 font-mono text-sm" />
                </LabeledField>
              </div>

              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" />
                {d.wizard.autoNote}
              </p>

              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setStep("url")} className="rounded-xl">
                  <ArrowBack className="size-4" />
                  {d.common.back}
                </Button>
                <Button onClick={() => setStep("brand")} size="lg" className="rounded-xl bg-primary font-bold text-primary-foreground">
                  {d.common.next}
                  <ArrowNext className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ============ STEP 3: BRANDING ============ */}
          {step === "brand" && (
            <div className="space-y-6">
              <div className="grid items-start gap-6 md:grid-cols-[auto_1fr]">
                <div className="flex flex-col items-center gap-3">
                  <AppIconBadge name={name || "A"} icon={icon} size={96} className="shadow-2xl" />
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onIconFile(f);
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl border-border bg-card" onClick={() => fileRef.current?.click()}>
                      <ImagePlus className="size-4 text-primary" />
                      {icon ? d.p.general.changeIcon : d.wizard.uploadIcon}
                    </Button>
                    {icon && (
                      <Button variant="outline" size="icon" className="size-8 rounded-lg border-border bg-card hover:text-destructive" onClick={() => setIcon(undefined)} aria-label={d.wizard.removeIcon}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                  <p className="max-w-44 text-center text-[11px] leading-relaxed text-muted-foreground">{d.wizard.iconHint}</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="mb-2.5 text-sm font-semibold">{d.wizard.splashLabel}</div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <ColorField label={d.wizard.splashBg} value={splashBg} onChange={setSplashBg} />
                      <ColorField label={d.wizard.statusBar} value={statusBarColor} onChange={setStatusBarColor} />
                    </div>
                  </div>
                  {/* splash preview strip */}
                  <div
                    className="flex h-28 items-center justify-center rounded-2xl border border-border"
                    style={{ background: splashBg }}
                  >
                    <AppIconBadge name={name || "A"} icon={icon} size={52} />
                  </div>
                  {!icon && <p className="text-xs text-muted-foreground">{d.wizard.iconFallback}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setStep("info")} className="rounded-xl">
                  <ArrowBack className="size-4" />
                  {d.common.back}
                </Button>
                <Button onClick={() => setStep("review")} size="lg" className="rounded-xl bg-primary font-bold text-primary-foreground">
                  {d.common.next}
                  <ArrowNext className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ============ STEP 4: REVIEW ============ */}
          {step === "review" && (
            <div className="space-y-6">
              <h3 className="font-display text-lg font-bold">{d.wizard.reviewTitle}</h3>
              <div className="overflow-hidden rounded-2xl border border-muted/70">
                {[
                  { label: d.wizard.reviewUrl, value: url || "—", ltr: true },
                  { label: d.wizard.reviewName, value: name || "—", ltr: false },
                  { label: d.wizard.reviewPkg, value: `${pkg} · ${bundle}`, ltr: true },
                ].map((row, i) => (
                  <div
                    key={row.label}
                    className={cn("flex items-center justify-between gap-4 px-4 py-3.5 text-sm", i % 2 === 0 && "bg-muted/60")}
                  >
                    <span className="shrink-0 text-muted-foreground">{row.label}</span>
                    <span className="truncate font-semibold" dir={row.ltr ? "ltr" : undefined}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <div className="mb-2.5 text-sm font-semibold text-muted-foreground">{d.wizard.reviewPlatforms}</div>
                <div className="flex gap-3">
                  {[
                    { label: "Android", out: "APK + AAB" },
                    { label: "iOS", out: "IPA" },
                  ].map((p) => (
                    <div key={p.label} className="flex flex-1 items-center gap-3 rounded-2xl border border-primary/20 bg-primary/[0.05] px-4 py-3.5">
                      <Smartphone className="size-5 text-primary" />
                      <div>
                        <div className="font-display text-sm font-bold" dir="ltr">{p.label}</div>
                        <div className="text-xs text-muted-foreground" dir="ltr">{p.out}</div>
                      </div>
                      <Check className="ms-auto size-4 text-primary" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setStep("brand")} className="rounded-xl">
                  <ArrowBack className="size-4" />
                  {d.common.back}
                </Button>
                <Button
                  onClick={doCreate}
                  size="lg"
                  disabled={creating || !name.trim()}
                  className="glow-neon rounded-xl bg-primary font-bold text-primary-foreground"
                >
                  {creating ? <Loader2 className="size-4 animate-spin" /> : <Globe className="size-4.5" />}
                  {creating ? d.wizard.creating : d.wizard.createBtn}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
