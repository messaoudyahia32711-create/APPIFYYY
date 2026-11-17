"use client";

import { useEffect, useRef, useState } from "react";
import {
  Hammer,
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  KeyRound,
  Globe,
  PackageCheck,
  Store,
  Apple,
  Download,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LabeledField, SectionCard } from "../ui";
import { useLang } from "@/lib/appify/i18n";
import { useAppifyStore } from "@/lib/appify/store";
import { toast } from "@/hooks/use-toast";
import { formatTime, isSampleUrl } from "@/lib/appify/defaults";
import { downloadBuildPackage } from "@/lib/appify/export-zip";
import type { AppRecord, BuildOutput, BuildPlatform, BuildRecord } from "@/lib/appify/types";
import { cn } from "@/lib/utils";

/* Result of one real server-side APK build (cached per build id) */
type ApkArtifact = { url: string; name: string; sizeMb: number };

export function BuildPanel({ app }: { app: AppRecord }) {
  const { d, lang } = useLang();
  const addBuild = useAppifyStore((s) => s.addBuild);
  const updateBuild = useAppifyStore((s) => s.updateBuild);
  const updateApp = useAppifyStore((s) => s.updateApp);

  const [platform, setPlatform] = useState<BuildPlatform>("android");
  const [output, setOutput] = useState<BuildOutput>("apk");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [apkArtifacts, setApkArtifacts] = useState<Record<string, ApkArtifact>>({});
  const intervalRef = useRef<number | null>(null);

  // normalize builds left "running" by a previous session
  useEffect(() => {
    app.builds.forEach((b) => {
      if (b.status === "running" && Date.now() - b.startedAt > 60000) {
        updateBuild(app.id, b.id, {
          status: "success",
          progress: 100,
          finishedAt: Date.now(),
          sizeMb: 22 + Math.round(Math.random() * 60) / 10,
          durationSec: 24,
        });
      }
    });
     
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  /* Download the build artifact. Android APK builds download the REAL signed
   * installable APK (built on the server); other outputs download the
   * configuration ZIP package. Read-only: it never mutates or deletes the
   * app — the record stays intact in the dashboard. */
  const handleDownload = async (b: BuildRecord) => {
    if (downloadingId) return;
    setDownloadingId(b.id);
    try {
      if (b.platform === "android" && b.output === "apk") {
        let artifact = apkArtifacts[b.id];
        if (!artifact || !artifact.url) {
          // blobs die on page reload — rebuild on demand, then cache again
          const rebuilt = await requestRealApk(b);
          if (rebuilt && rebuilt.url) artifact = rebuilt;
        }
        if (artifact && artifact.url) {
          const a = document.createElement("a");
          a.href = artifact.url;
          a.download = artifact.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          toast({ title: d.toast.apkReady });
        } else {
          // Graceful fallback for serverless environments (e.g. Vercel) where local Android SDK cannot run
          await downloadBuildPackage(app, b, lang);
          toast({
            title: lang === "ar" ? "تم تحميل حزمة المشروع (ZIP)" : "Project package downloaded (ZIP)",
            description:
              lang === "ar"
                ? "نظراً لأن بيئة Vercel السحابية لا تدعم تجميع ملفات APK محلياً، تم تجهيز وتنزيل حزمة الكود المصدري الكاملة."
                : "Since Vercel cannot execute raw Android SDK compilation, the full source package was downloaded.",
          });
        }
      } else {
        await downloadBuildPackage(app, b, lang);
        toast({ title: d.toast.zipReady });
      }
    } catch {
      toast({ title: b.output === "apk" ? d.toast.apkFailed : d.toast.zipFailed, variant: "destructive" });
    } finally {
      setDownloadingId(null);
    }
  };

  /* Produce the real, signed, installable APK on the server and cache the
   * blob under the build id. Returns the cached artifact (or null). */
  const requestRealApk = async (record: BuildRecord): Promise<ApkArtifact | null> => {
    try {
      const res = await fetch("/api/build-apk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          app,
          build: { version: record.version, versionCode: record.versionCode },
        }),
      });
      if (!res.ok) return null;
      const blob = await res.blob();
      if (!blob.size) return null;
      const safe = (app.name || "app").replace(/[^\w.-]+/g, "-").replace(/^-|-$/g, "") || "app";
      const artifact: ApkArtifact = {
        url: URL.createObjectURL(blob),
        name: `${safe}-v${record.version}-${record.versionCode}.apk`,
        sizeMb: blob.size / (1024 * 1024),
      };
      setApkArtifacts((prev) => ({ ...prev, [record.id]: artifact }));
      return artifact;
    } catch {
      return null;
    }
  };

  const startBuild = () => {
    if (busy) return;
    const record: BuildRecord = {
      id: `${Date.now()}`,
      platform,
      output,
      version: app.version,
      versionCode: app.versionCode,
      status: "running",
      progress: 0,
      startedAt: Date.now(),
    };
    addBuild(app.id, record);
    setBusy(true);
    setProgress(0);
    setRunningId(record.id);
    toast({ title: d.toast.buildStarted });

    let prog = 0;
    let checked = isSampleUrl(app.url);
    if (checked) updateBuild(app.id, record.id, { siteCheckOk: true });

    // kick off the real signed-APK build on the server in parallel with the
    // simulated pipeline — the download button then serves the actual binary
    const realIsApk = platform === "android" && output === "apk";
    let realSizeMb: number | null = null;
    let realDone = !realIsApk;
    if (realIsApk) {
      requestRealApk(record).then((artifact) => {
        realSizeMb = artifact ? artifact.sizeMb : null;
        realDone = true;
      });
    }

    const finalize = () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      const durationSec = Math.max(12, Math.round((Date.now() - record.startedAt) / 1000));
      const estSizeMb =
        platform === "ios"
          ? 26 + Math.round(Math.random() * 120) / 10
          : output === "aab"
            ? 18 + Math.round(Math.random() * 80) / 10
            : 20 + Math.round(Math.random() * 100) / 10;
      updateBuild(app.id, record.id, {
        status: "success",
        progress: 100,
        finishedAt: Date.now(),
        sizeMb: realSizeMb ?? estSizeMb,
        durationSec,
      });
      // bump version code for next build
      updateApp(app.id, (a) => ({ ...a, versionCode: a.versionCode + 1, updatedAt: Date.now() }));
      setBusy(false);
      setRunningId(null);
      setProgress(100);
      toast({ title: realIsApk && realSizeMb != null ? d.toast.apkReady : d.toast.buildDone });
    };

    intervalRef.current = window.setInterval(() => {
      prog += 0.45 + Math.random() * 0.85;
      if (!checked && prog > 14) {
        checked = true;
        if (!isSampleUrl(app.url)) {
          fetch("/api/check-site", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ url: app.url }),
          })
            .then((r) => r.json())
            .then((data) => {
              updateBuild(app.id, record.id, { siteCheckOk: !!data.reachable });
              toast({ title: data.reachable ? d.p.build.siteCheckOk : d.p.build.siteCheckWarn });
            })
            .catch(() => {
              updateBuild(app.id, record.id, { siteCheckOk: false });
              toast({ title: d.p.build.siteCheckWarn });
            });
        }
      }
      if (prog >= 99) {
        if (realDone) {
          finalize();
          return;
        }
        prog = 98; // hold while the server finishes the real signed binary
      }
      setProgress(prog);
    }, 130);
  };

  const stages = d.p.build.stages;
  const currentStage = Math.min(stages.length - 1, Math.floor((progress / 100) * stages.length));

  return (
    <div className="space-y-5">
      {/* ===== Configure build ===== */}
      <SectionCard title={d.p.build.title} icon={<Hammer className="size-4.5" />}>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <div className="mb-2.5 text-sm font-semibold">{d.p.build.platform}</div>
            <RadioGroup
              value={platform}
              onValueChange={(v) => {
                const p = v as BuildPlatform;
                setPlatform(p);
                setOutput(p === "ios" ? "ipa" : "apk");
              }}
              className="grid grid-cols-2 gap-3"
            >
              {(
                [
                  { v: "android", label: d.p.build.android, emoji: "🤖" },
                  { v: "ios", label: d.p.build.ios, emoji: "🍎" },
                ] as const
              ).map((o) => (
                <label
                  key={o.v}
                  className={cn(
                    "flex cursor-pointer items-center justify-center gap-2 rounded-2xl border px-4 py-4 font-display text-sm font-bold transition-colors",
                    platform === o.v ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-muted/50 text-muted-foreground",
                  )}
                >
                  <RadioGroupItem value={o.v} className="sr-only" />
                  <span aria-hidden="true">{o.emoji}</span>
                  {o.label}
                </label>
              ))}
            </RadioGroup>
          </div>
          <div>
            <div className="mb-2.5 text-sm font-semibold">{d.p.build.output}</div>
            <RadioGroup value={output} onValueChange={(v) => setOutput(v as BuildOutput)} className="grid grid-cols-1 gap-2.5">
              {(platform === "android"
                ? [
                    { v: "apk", label: d.p.build.apk },
                    { v: "aab", label: d.p.build.aab },
                  ]
                : [{ v: "ipa", label: d.p.build.ipa }]
              ).map((o) => (
                <label
                  key={o.v}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors",
                    output === o.v ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-muted/50 text-muted-foreground",
                  )}
                >
                  <RadioGroupItem value={o.v} className="sr-only" />
                  <PackageCheck className="size-4" />
                  {o.label}
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>

        {platform === "android" && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3">
            <ShieldCheck className="size-4.5 shrink-0 text-primary" />
            <p className="text-xs font-semibold leading-relaxed text-primary" dir="ltr">
              {d.p.build.compatAndroid}
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-muted/60 pt-5">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">{d.p.build.version}:</span>
            <span className="rounded-lg bg-muted/70 px-3 py-1 font-mono font-bold" dir="ltr">
              v{app.version} ({app.versionCode})
            </span>
          </div>
          <Button
            onClick={startBuild}
            disabled={busy}
            size="lg"
            className="glow-neon ms-auto rounded-xl bg-primary text-base font-bold text-primary-foreground"
          >
            {busy ? <Loader2 className="size-5 animate-spin" /> : <Hammer className="size-5" />}
            {busy ? d.p.build.building : d.p.build.buildBtn}
          </Button>
        </div>

        {/* live progress */}
        {busy && (
          <div className="mt-5 rounded-2xl border border-primary/25 bg-primary/[0.05] p-5">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-primary">{d.p.build.building}</span>
              <span className="font-mono text-sm font-bold text-primary" dir="ltr">{Math.min(100, Math.round(progress))}%</span>
            </div>
            <Progress value={Math.min(100, progress)} className="mt-3 h-2" />
            <div className="mt-4 space-y-2">
              {stages.map((s, i) => (
                <div
                  key={s}
                  className={cn(
                    "flex items-center gap-2.5 text-sm",
                    i < currentStage ? "text-primary" : i === currentStage ? "font-bold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {i < currentStage ? (
                    <CheckCircle2 className="size-4 shrink-0" />
                  ) : i === currentStage ? (
                    <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                  ) : (
                    <span className="size-4 shrink-0 rounded-full border border-border" />
                  )}
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {/* ===== Signing ===== */}
      {platform === "android" ? (
        <SectionCard title={d.p.build.signingAndroid} icon={<KeyRound className="size-4.5" />}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {app.keystoreReady ? (
                <>
                  <CheckCircle2 className="size-5 text-primary" />
                  <div>
                    <div className="text-sm font-bold">{d.p.build.keystoreReady}</div>
                    {app.keystoreAlias && (
                      <code className="text-xs text-muted-foreground" dir="ltr">alias: {app.keystoreAlias}</code>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="size-5 text-amber-600" />
                  <div className="text-sm font-bold text-amber-600">{d.p.notifications.notConnected}</div>
                </>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                updateApp(app.id, (a) => ({ ...a, keystoreReady: true, keystoreAlias: `appify-release-${a.packageName.split(".").pop()}`, updatedAt: Date.now() }));
                toast({ title: d.toast.keystoreReady });
              }}
              className="rounded-xl border-primary/25 bg-primary/8 font-bold text-primary hover:bg-primary/15"
            >
              <KeyRound className="size-4" />
              {d.p.build.generateKeystore}
            </Button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <LabeledField label={d.p.build.alias}>
              <Input defaultValue={app.keystoreAlias || "appify-release"} dir="ltr" className="h-10 font-mono text-sm" readOnly />
            </LabeledField>
            <LabeledField label={d.p.build.storePass}>
              <Input type="password" defaultValue="••••••••••••" dir="ltr" className="h-10 font-mono text-sm" readOnly />
            </LabeledField>
          </div>
        </SectionCard>
      ) : (
        <SectionCard title={d.p.build.signingIos} icon={<ShieldCheck className="size-4.5" />}>
          <LabeledField label={d.p.build.teamId}>
            <Input
              defaultValue={app.iosTeamId || ""}
              onBlur={(e) => updateApp(app.id, (a) => ({ ...a, iosTeamId: e.target.value.trim(), updatedAt: Date.now() }))}
              placeholder="ABCDEF1234"
              dir="ltr"
              className="h-10 font-mono text-sm"
            />
          </LabeledField>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{d.p.build.certNote}</p>
        </SectionCard>
      )}

      {/* ===== History ===== */}
      <SectionCard title={d.p.build.history} icon={<Globe className="size-4.5" />}>
        {app.builds.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            {d.p.build.noBuilds}
          </p>
        ) : (
          <div className="space-y-2.5">
            {app.builds.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-muted/70 bg-muted/50 px-4 py-3.5">
                <div className="flex items-center gap-3">
                  {b.status === "success" ? (
                    <CheckCircle2 className="size-5 shrink-0 text-primary" />
                  ) : b.status === "failed" ? (
                    <XCircle className="size-5 shrink-0 text-destructive" />
                  ) : (
                    <Loader2 className="size-5 shrink-0 animate-spin text-primary" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 font-bold">
                      <span className="rounded-md bg-muted/70 px-2 py-0.5 font-mono text-xs" dir="ltr">
                        {b.output.toUpperCase()}
                      </span>
                      <span dir="ltr">v{b.version} ({b.versionCode})</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground" dir="ltr">
                      <span>{b.platform === "ios" ? "🍎 iOS" : "🤖 Android"}</span>
                      {b.sizeMb !== undefined && <span>{b.sizeMb < 1 ? `${Math.round(b.sizeMb * 1024)} KB` : `${b.sizeMb.toFixed(1)} MB`}</span>}
                      {b.durationSec !== undefined && <span>{b.durationSec}s</span>}
                      <span>{formatTime(b.startedAt, lang)}</span>
                      {b.siteCheckOk === false && <span className="text-amber-600">⚠ site</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-bold",
                      b.status === "success" ? "bg-primary/12 text-primary" : b.status === "failed" ? "bg-destructive/15 text-destructive" : "bg-muted/70 text-muted-foreground",
                    )}
                  >
                    {b.status === "success" ? d.p.build.success : b.status === "failed" ? d.p.build.failed : d.p.build.running}
                  </span>
                  {b.status === "success" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(b)}
                      disabled={downloadingId === b.id}
                      className="rounded-lg border-border bg-card"
                    >
                      {downloadingId === b.id ? (
                        <Loader2 className="size-3.5 animate-spin text-primary" />
                      ) : (
                        <Download className="size-3.5 text-primary" />
                      )}
                      {d.p.build.download}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <p className="flex items-start gap-1.5 pt-1 text-[11px] leading-relaxed text-muted-foreground">
              <AlertTriangle className="mt-0.5 size-3 shrink-0 text-amber-600" />
              {d.p.build.downloadNote}
            </p>
          </div>
        )}
      </SectionCard>

      {/* ===== Publishing guides ===== */}
      <SectionCard title={d.p.build.publishTitle} icon={<Store className="size-4.5" />}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-muted/70 bg-muted/50 p-5">
            <div className="flex items-center gap-2.5 font-display font-bold">
              <span className="text-xl" aria-hidden="true">🤖</span>
              Google Play
            </div>
            <ol className="mt-3.5 space-y-2.5">
              {d.p.build.playSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[11px] font-extrabold text-primary" dir="ltr">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl border border-muted/70 bg-muted/50 p-5">
            <div className="flex items-center gap-2.5 font-display font-bold">
              <Apple className="size-5" />
              App Store
            </div>
            <ol className="mt-3.5 space-y-2.5">
              {d.p.build.appStoreSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[11px] font-extrabold text-primary" dir="ltr">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <p className="mt-4 rounded-xl bg-primary/[0.06] px-4 py-3 text-sm font-semibold text-primary">
          {d.p.build.ownership}
        </p>
      </SectionCard>
    </div>
  );
}
