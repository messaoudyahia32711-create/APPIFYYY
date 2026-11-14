"use client";

import { useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Fingerprint,
  ScanLine,
  Smartphone,
  Apple,
  Megaphone,
  Vibrate,
  UserRound,
  Bell,
  Trash2,
  RotateCcw,
  RefreshCcw,
  ExternalLink,
  Info,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppifyLogo, LangToggle } from "./ui";
import { PhoneFrame, usePhoneState, type BridgeMethodId } from "./phone";
import { useLang } from "@/lib/appify/i18n";
import { useAppById, useAppifyStore } from "@/lib/appify/store";
import { navigate } from "@/lib/appify/router";
import { cn } from "@/lib/utils";

function GlobeIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

/* ==================== Preview page ==================== */
export function PreviewPage({ appId }: { appId: string }) {
  const { d, lang } = useLang();
  const app = useAppById(appId);
  const bridgeEvents = useAppifyStore((s) => s.bridgeEvents);
  const clearBridgeEvents = useAppifyStore((s) => s.clearBridgeEvents);
  const state = usePhoneState(app);
  const Back = lang === "ar" ? ArrowRight : ArrowLeft;

  useEffect(() => {
    document.title = `${app?.name ?? "Appify"} — ${d.preview.title}`;
  }, [app?.name, d.preview.title]);

  if (!app) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-bold">{d.ws.notFound}</h1>
        <Button onClick={() => navigate("#/dashboard")} className="rounded-xl bg-primary font-bold text-primary-foreground">
          {d.ws.backDash}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`#/app/${app.id}`)}
              className="shrink-0 gap-1.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Back className="size-4" />
              <span className="hidden sm:inline">{app.name}</span>
            </Button>
            <span className="h-6 w-px bg-border" />
            <span className="flex items-center gap-2 text-sm font-bold">
              <Eye className="size-4 text-primary" />
              {d.preview.title}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LangToggle />
            <Button onClick={() => navigate("#/dashboard")} variant="outline" className="rounded-xl border-border bg-card">
              <AppifyLogo size={22} withText={false} />
              {d.common.dashboard}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-start gap-8 px-4 py-7 md:px-6 lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
        {/* ===== phone column ===== */}
        <div className="mx-auto w-full max-w-[430px] space-y-4">
          {/* toolbar */}
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-3 shadow-soft">
            <div className="flex rounded-xl bg-muted p-1" role="group" aria-label={d.preview.device}>
              {(
                [
                  { v: "pixel", label: d.preview.pixel },
                  { v: "iphone", label: d.preview.iphone },
                ] as const
              ).map((o) => (
                <button
                  key={o.v}
                  onClick={() => state.setDevice(o.v)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                    state.device === o.v ? "bg-card text-primary shadow-soft" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={state.replaySplash} className="rounded-lg border-border bg-card text-xs">
              <RotateCcw className="size-3.5 text-primary" />
              {d.preview.replaySplash}
            </Button>
            {!state.isSample && (
              <Button variant="outline" size="sm" onClick={state.reloadWebView} className="rounded-lg border-border bg-card text-xs">
                <RefreshCcw className="size-3.5 text-primary" />
                {d.preview.reloadPage}
              </Button>
            )}
            {(
              [
                { on: state.showNav, set: state.setShowNav, label: d.preview.toggleNav },
                { on: state.showFab, set: state.setShowFab, label: d.preview.toggleFab },
                { on: state.showAppBar, set: state.setShowAppBar, label: d.preview.toggleAppBar },
              ] as const
            ).map((t) => (
              <button
                key={t.label}
                onClick={() => t.set(!t.on)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                  t.on ? "bg-accent text-primary" : "bg-muted text-muted-foreground line-through",
                )}
              >
                {t.label}
              </button>
            ))}
            {!state.isSample && (
              <button
                onClick={state.toggleAddressBar}
                title={d.preview.toggleAddressBar}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                  state.addressBarOn ? "bg-accent text-primary" : "bg-muted text-muted-foreground line-through",
                )}
              >
                {d.preview.toggleAddressBar}
              </button>
            )}
            {!state.isSample && (
              <Button variant="outline" size="sm" onClick={() => window.open(state.currentUrl, "_blank")} className="rounded-lg border-border bg-card text-xs">
                <ExternalLink className="size-3.5" />
                {d.preview.openExternal}
              </Button>
            )}
          </div>

          <PhoneFrame app={app} state={state} />

          {/* external iframe hint */}
          {!state.isSample && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
              <Info className="mt-0.5 size-4 shrink-0 text-amber-500" />
              <div className="text-xs leading-relaxed text-muted-foreground">
                <b className="text-foreground">{d.preview.blocked}.</b> {d.preview.blockedHint}
              </div>
            </div>
          )}
          {state.isSample && (
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-primary">
              <Smartphone className="size-3.5" />
              {d.preview.sampleBadge} — {d.store.name}
            </div>
          )}
        </div>

        {/* ===== console column ===== */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="text-base font-bold">{d.preview.desc}</h3>
            <div className="mt-3.5 flex flex-wrap gap-2 text-xs">
              {[
                { label: d.p.appearance.statusBarColor, value: app.style.statusBarColor },
                { label: d.p.appearance.splashBg, value: app.style.splashBg },
                { label: d.p.appearance.splashDuration, value: `${(app.style.splashDuration / 1000).toFixed(1)}s` },
                { label: d.p.navigation.bottomNav, value: state.navVisible ? d.common.enabled : d.common.disabled },
                { label: d.p.navigation.drawer, value: app.navigation.drawerEnabled ? d.common.enabled : d.common.disabled },
                { label: d.p.navigation.fab, value: app.navigation.fabEnabled && state.showFab ? d.common.enabled : d.common.disabled },
              ].map((chip) => (
                <span key={chip.label} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1.5 font-semibold text-muted-foreground">
                  {chip.label}: <b className="text-foreground" dir="ltr">{chip.value}</b>
                </span>
              ))}
            </div>
          </div>

          {/* console */}
          <div className="overflow-hidden rounded-2xl border border-border bg-[#17181d]">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-bold text-white">
                <Megaphone className="size-4 text-primary" />
                <span className="text-primary">{d.preview.console}</span>
              </span>
              <Button variant="ghost" size="sm" onClick={clearBridgeEvents} className="gap-1.5 rounded-lg text-xs text-white/60 hover:bg-white/10 hover:text-white">
                <Trash2 className="size-3.5" />
                {d.preview.clear}
              </Button>
            </div>
            <div className="scrollbar-thin max-h-72 min-h-40 space-y-2 overflow-y-auto p-4">
              {bridgeEvents.length === 0 ? (
                <p className="py-6 text-center text-sm text-white/50">{d.preview.consoleEmpty}</p>
              ) : (
                bridgeEvents.map((ev) => (
                  <div key={ev.id} className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5" dir="ltr">
                    <div className="flex items-start justify-between gap-3">
                      <code className="font-mono text-xs font-bold text-[#c4b5fd]">{ev.method}</code>
                      <span className="shrink-0 font-mono text-[10px] text-white/40">
                        {new Date(ev.at).toLocaleTimeString("en", { hour12: false })}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-white/80">→ {ev.result}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* triggers */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h4 className="mb-3.5 text-sm font-bold">{d.preview.trigger}</h4>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {(
                [
                  { m: "biometric", label: d.preview.evBiometric, icon: Fingerprint },
                  { m: "qr", label: d.preview.evQr, icon: ScanLine },
                  { m: "google", label: d.preview.evGoogle, icon: Globe },
                  { m: "apple", label: d.preview.evApple, icon: Apple },
                  { m: "interstitial", label: d.preview.evInterstitial, icon: Megaphone },
                  { m: "vibrate", label: d.preview.evVibrate, icon: Vibrate },
                  { m: "identify", label: d.preview.evIdentify, icon: UserRound },
                  { m: "push", label: d.preview.evPush, icon: Bell },
                ] as const
              ).map((t) => (
                <button
                  key={t.m}
                  onClick={() => state.trigger(t.m as BridgeMethodId)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/50 px-2 py-3.5 text-center transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent"
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-primary">
                    {t.m === "google" ? <GlobeIcon className="size-4.5" /> : <t.icon className="size-4.5" />}
                  </span>
                  <span className="text-[11px] font-bold leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
