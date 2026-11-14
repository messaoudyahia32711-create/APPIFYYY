"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  ExternalLink,
  Info,
  Wifi,
  BatteryFull,
  Signal,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppifyLogo, LangToggle, AppIconBadge } from "./ui";
import { SampleStore, type StorePage } from "./sample-store";
import { useLang } from "@/lib/appify/i18n";
import { useAppById, useAppifyStore } from "@/lib/appify/store";
import { navigate } from "@/lib/appify/router";
import { getIcon } from "@/lib/appify/icons";
import { isSampleUrl, samplePageFromUrl } from "@/lib/appify/defaults";
import type { AppRecord } from "@/lib/appify/types";
import { cn } from "@/lib/utils";

/* ---------- helpers ---------- */
function scopeCss(css: string, scope: string): string {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return noComments.replace(/([^{}]+)\{([^{}]*)\}/g, (match: string, sel: string, body: string) => {
    const trimmed = sel.trim();
    if (!trimmed || trimmed.startsWith("@")) return match;
    const scoped = trimmed
      .split(",")
      .map((s) => `.${scope} ${s.trim()}`)
      .join(", ");
    return `${scoped} {${body}}`;
  });
}

function patternMatches(url: string, pattern: string): boolean {
  try {
    const regexStr = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    return new RegExp(regexStr, "i").test(url);
  } catch {
    return false;
  }
}

type BridgeMethodId =
  | "biometric" | "identify" | "qr" | "google" | "apple" | "interstitial"
  | "vibrate" | "push" | "share" | "analytics" | "updateNav" | "updateDrawer"
  | "updateAppBar" | "deeplink" | "cartAdd" | "cartPay";

const METHOD_SIG: Record<BridgeMethodId, string> = {
  biometric: "AppifyBridge.startBiometricAuthentication({ title })",
  identify: "AppifyBridge.requestUserIdentification()",
  qr: "AppifyBridge.openQRScanner({ onResult })",
  google: "AppifyBridge.signInWithGoogle()",
  apple: "AppifyBridge.signInWithApple()",
  interstitial: "AppifyBridge.showInterstitialAd()",
  vibrate: "AppifyBridge.vibrate([40, 60, 40])",
  push: "AppifyBridge.requestPushPermission()",
  share: "AppifyBridge.share({ title, url })",
  analytics: "AppifyBridge.logAnalyticsEvent('add_to_cart')",
  updateNav: "AppifyBridge.updateBottomNavigationBar({ items })",
  updateDrawer: "AppifyBridge.updateNavigationDrawer({ items })",
  updateAppBar: "AppifyBridge.updateAppBar({ title, color })",
  deeplink: "AppifyBridge.openDeepLink('/product/123')",
  cartAdd: "AppifyBridge.logAnalyticsEvent('add_to_cart') + vibrate(30)",
  cartPay: "AppifyBridge.logAnalyticsEvent('purchase')",
};

/* ==================== Preview page ==================== */
export function PreviewPage({ appId }: { appId: string }) {
  const { d, lang } = useLang();
  const app = useAppById(appId);
  const bridgeEvents = useAppifyStore((s) => s.bridgeEvents);
  const pushBridgeEvent = useAppifyStore((s) => s.pushBridgeEvent);
  const clearBridgeEvents = useAppifyStore((s) => s.clearBridgeEvents);
  const pendingBridgeDemo = useAppifyStore((s) => s.pendingBridgeDemo);
  const clearPendingBridgeDemo = useAppifyStore((s) => s.clearPendingBridgeDemo);

  const [device, setDevice] = useState<"pixel" | "iphone">("pixel");
  const [splashKey, setSplashKey] = useState(0);
  const [splashVisible, setSplashVisible] = useState(true);
  const [showNav, setShowNav] = useState(true);
  const [showFab, setShowFab] = useState(true);
  const [showAppBar, setShowAppBar] = useState(true);
  const [samplePage, setSamplePage] = useState<StorePage>(() => (app ? (samplePageFromUrl(app.url) as StorePage) : "home"));
  const [currentUrl, setCurrentUrl] = useState<string>(() => app?.url ?? "");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [phoneToast, setPhoneToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const Back = lang === "ar" ? ArrowRight : ArrowLeft;

  const isSample = app ? isSampleUrl(app.url) : false;

  // splash timing — visible initially, hidden after the configured duration
  useEffect(() => {
    if (!app) return;
    const t = window.setTimeout(() => setSplashVisible(false), Math.max(600, app.style.splashDuration));
    return () => window.clearTimeout(t);
     
  }, [app?.id, splashKey]);

  const showPhoneToast = useCallback((text: string) => {
    setPhoneToast(text);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setPhoneToast(null), 2600);
  }, []);

  const trigger = useCallback(
    (method: BridgeMethodId) => {
      const resultText =
        method === "analytics" || method === "updateNav" || method === "updateDrawer" || method === "updateAppBar" || method === "deeplink" || method === "cartPay"
          ? d.preview.eventDone
          : d.preview.bridgeToast[method === "cartAdd" ? "vibrate" : (method as keyof typeof d.preview.bridgeToast)];
      pushBridgeEvent({ method: METHOD_SIG[method], result: resultText });
      showPhoneToast(resultText);
      if (method === "qr") {
        window.setTimeout(() => {
          pushBridgeEvent({ method: `${METHOD_SIG.qr} → onResult(...)`, result: d.preview.bridgeToast.qrResult });
          showPhoneToast(d.preview.bridgeToast.qrResult);
        }, 1800);
      }
    },
    [pushBridgeEvent, showPhoneToast, d],
  );

  // consume queued demo events coming from the bridge panel
  useEffect(() => {
    if (pendingBridgeDemo) {
      const m = pendingBridgeDemo as BridgeMethodId;
      clearPendingBridgeDemo();
      window.setTimeout(() => trigger(m), 350);
    }
  }, [pendingBridgeDemo, clearPendingBridgeDemo, trigger]);

  // run custom JS (in a sandboxed function) against the mini bridge
  useEffect(() => {
    if (!app || !isSample) return;
    const js = app.customCode.js.trim();
    if (!js) return;
    try {
      const miniBridge = {
        vibrate: () => trigger("vibrate"),
        showInterstitialAd: () => trigger("interstitial"),
        requestPushPermission: () => trigger("push"),
        logAnalyticsEvent: (name: string) => pushBridgeEvent({ method: `AppifyBridge.logAnalyticsEvent('${name}')`, result: d.preview.eventDone }),
      };
       
      new Function("AppifyBridge", js)(miniBridge);
    } catch {
      /* user code errors are ignored in demo */
    }
     
  }, [app?.customCode.js, isSample, app?.id]);

  const handleStoreNav = (page: StorePage) => {
    setSamplePage(page);
    setCurrentUrl(`sample://store/${page}`);
  };

  const handleStoreBridge = (method: string) => {
    if (method === "cartAdd") {
      pushBridgeEvent({ method: METHOD_SIG.analytics, result: d.preview.eventDone });
      trigger("vibrate");
    } else if (method === "cartPay") {
      pushBridgeEvent({ method: METHOD_SIG.cartPay, result: d.preview.eventDone });
    } else {
      trigger(method as BridgeMethodId);
    }
  };

  const handleNavClick = (url: string) => {
    setCurrentUrl(url);
    if (isSampleUrl(url)) setSamplePage(samplePageFromUrl(url) as StorePage);
    setDrawerOpen(false);
  };

  const scopedCss = app && isSample ? scopeCss(app.customCode.css, "appify-store-root") : "";

  if (!app) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-2xl font-bold">{d.ws.notFound}</h1>
        <Button onClick={() => navigate("#/dashboard")} className="rounded-xl bg-primary font-bold text-primary-foreground">
          {d.ws.backDash}
        </Button>
      </div>
    );
  }

  const nav = app.navigation;
  const style = app.style;

  const hiddenByPattern = nav.hideOnPatterns.some((p) => patternMatches(currentUrl, p));
  const navVisible = nav.bottomNavEnabled && showNav && !hiddenByPattern;
  const activeItem = nav.bottomNavItems.find((it) => it.url === currentUrl) ?? nav.bottomNavItems[0];

  const statusTextColor = style.statusBarContent === "dark" ? "#111318" : "#FFFFFF";

  return (
    <div className="flex min-h-screen flex-col">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0A0A0B]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`#/app/${app.id}`)}
              className="shrink-0 gap-1.5 rounded-xl text-muted-foreground hover:bg-white/6 hover:text-foreground"
            >
              <Back className="size-4" />
              <span className="hidden sm:inline">{app.name}</span>
            </Button>
            <span className="h-6 w-px bg-white/10" />
            <span className="flex items-center gap-2 font-display text-sm font-bold">
              <Eye className="size-4 text-primary" />
              {d.preview.title}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LangToggle />
            <Button onClick={() => navigate("#/dashboard")} variant="outline" className="rounded-xl border-white/12 bg-white/5">
              <AppifyLogo size={22} withText={false} />
              {d.common.dashboard}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-start gap-8 px-4 py-7 md:px-6 lg:grid-cols-[auto_minmax(0,1fr)]">
        {/* ===== phone column ===== */}
        <div className="mx-auto space-y-4">
          {/* toolbar */}
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/8 bg-card px-3.5 py-3">
            <div className="flex rounded-xl bg-white/6 p-1" role="group" aria-label={d.preview.device}>
              {(
                [
                  { v: "pixel", label: d.preview.pixel },
                  { v: "iphone", label: d.preview.iphone },
                ] as const
              ).map((o) => (
                <button
                  key={o.v}
                  onClick={() => setDevice(o.v)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                    device === o.v ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => { setSplashVisible(true); setSplashKey((k) => k + 1); }} className="rounded-lg border-white/12 bg-white/5 text-xs">
              <RotateCcw className="size-3.5 text-primary" />
              {d.preview.replaySplash}
            </Button>
            {(
              [
                { on: showNav, set: setShowNav, label: d.preview.toggleNav },
                { on: showFab, set: setShowFab, label: d.preview.toggleFab },
                { on: showAppBar, set: setShowAppBar, label: d.preview.toggleAppBar },
              ] as const
            ).map((t) => (
              <button
                key={t.label}
                onClick={() => t.set(!t.on)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                  t.on ? "bg-primary/15 text-primary" : "bg-white/6 text-muted-foreground line-through",
                )}
              >
                {t.label}
              </button>
            ))}
            {!isSample && (
              <Button variant="outline" size="sm" onClick={() => window.open(currentUrl, "_blank")} className="rounded-lg border-white/12 bg-white/5 text-xs">
                <ExternalLink className="size-3.5" />
                {d.preview.openExternal}
              </Button>
            )}
          </div>

          {/* phone frame */}
          <div className="mx-auto w-[324px]" dir="ltr">
            <div className={cn("relative rounded-[2.8rem] border border-white/15 bg-[#101013] p-2.5 shadow-2xl", device === "iphone" ? "rounded-[3rem]" : "")}>
              <div className="relative overflow-hidden rounded-[2.3rem]">
                {/* content background */}
                <div className="relative flex h-[600px] flex-col" style={{ background: style.appBgColor }}>
                  {/* status bar */}
                  <div className="relative z-30 flex items-center justify-between px-6 pt-2.5 pb-1" style={{ background: style.statusBarColor, color: statusTextColor }}>
                    <span className="text-[11px] font-bold" dir="ltr">9:41</span>
                    {/* notch */}
                    {device === "iphone" ? (
                      <span className="absolute left-1/2 top-1.5 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
                    ) : (
                      <span className="absolute left-1/2 top-2 size-3.5 -translate-x-1/2 rounded-full bg-black/90" />
                    )}
                    <span className="flex items-center gap-1.5 opacity-90">
                      <Signal className="size-3" />
                      <Wifi className="size-3" />
                      <BatteryFull className="size-3.5" />
                    </span>
                  </div>

                  {/* app bar */}
                  {style.appBarEnabled && showAppBar && (
                    <div className="relative z-20 flex items-center gap-2.5 px-4 py-2.5" style={{ background: style.appBarColor, color: statusTextColor }}>
                      {nav.drawerEnabled && (
                        <button onClick={() => setDrawerOpen(true)} aria-label="drawer">
                          <Menu className="size-5" />
                        </button>
                      )}
                      <span className="truncate font-display text-sm font-bold">{style.appBarTitle || app.name}</span>
                    </div>
                  )}

                  {/* content */}
                  <div className="relative flex-1 overflow-hidden" dir={lang === "ar" ? "rtl" : "ltr"}>
                    {isSample ? (
                      <div className="appify-store-root relative h-full" id="phone-screen">
                        {scopedCss.trim() && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
                        <SampleStore
                          page={samplePage}
                          onNavigate={handleStoreNav}
                          onBridge={handleStoreBridge}
                          appBg={style.appBgColor}
                          signedIn={signedIn}
                          onSignIn={setSignedIn}
                        />
                      </div>
                    ) : (
                      <iframe
                        key={currentUrl}
                        src={currentUrl}
                        title={app.name}
                        className="h-full w-full border-0 bg-white"
                        referrerPolicy="no-referrer"
                      />
                    )}

                    {/* splash overlay */}
                    {splashVisible && (
                      <div
                        className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 transition-opacity duration-500"
                        style={{ background: style.splashBg }}
                      >
                        <AppIconBadge name={app.name} icon={app.icon} size={72} className="animate-pulse-glow" />
                        <span className="font-display text-lg font-extrabold" style={{ color: style.splashLogoColor }}>
                          {app.name}
                        </span>
                      </div>
                    )}

                    {/* drawer overlay */}
                    {drawerOpen && nav.drawerEnabled && (
                      <div className="absolute inset-0 z-40 flex" dir={lang === "ar" ? "rtl" : "ltr"}>
                        <button className="absolute inset-0 bg-black/45" onClick={() => setDrawerOpen(false)} aria-label={d.common.close} />
                        <aside className="relative flex h-full w-60 flex-col bg-white shadow-2xl" style={{ marginInlineStart: 0 }}>
                          <div className="flex items-center gap-2.5 bg-gradient-to-br from-[#2EE6A8] to-[#8B7CFF] px-4 pb-4 pt-6">
                            <AppIconBadge name={app.name} icon={app.icon} size={40} />
                            <div>
                              <div className="font-display text-sm font-extrabold text-[#04120C]">{app.name}</div>
                              <div className="text-[10px] font-bold text-[#04120C]/70">{nav.drawerTitle}</div>
                            </div>
                          </div>
                          <nav className="flex-1 space-y-1 overflow-y-auto p-2.5">
                            {nav.drawerItems.map((item) => {
                              const Icon = getIcon(item.icon);
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => handleNavClick(item.url)}
                                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                                >
                                  <Icon className="size-4.5 text-[#0A8F63]" />
                                  <span className="truncate">{item.label}</span>
                                </button>
                              );
                            })}
                            {nav.drawerItems.length === 0 && (
                              <p className="px-3 py-4 text-xs text-gray-400">{nav.drawerTitle}</p>
                            )}
                          </nav>
                        </aside>
                      </div>
                    )}

                    {/* bridge toast bubble */}
                    {phoneToast && (
                      <div className="animate-slide-up pointer-events-none absolute inset-x-3 top-3 z-50" dir={lang === "ar" ? "rtl" : "ltr"}>
                        <div className="rounded-2xl border border-primary/40 bg-[#0E1A15]/95 px-4 py-3 shadow-2xl backdrop-blur">
                          <div className="flex items-center gap-2.5">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                              <Fingerprint className="size-4" />
                            </span>
                            <span className="text-xs font-bold text-white">{phoneToast}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FAB */}
                    {nav.fabEnabled && showFab && (
                      <button
                        onClick={() => handleNavClick(nav.fabUrl)}
                        className="absolute bottom-4 z-30 flex size-13 items-center justify-center rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform hover:scale-105 active:scale-95 ltr:right-4 rtl:left-4"
                        style={{ background: nav.fabColor, width: 52, height: 52 }}
                        aria-label={d.p.navigation.fab}
                      >
                        {(() => {
                          const Icon = getIcon(nav.fabIcon);
                          return <Icon className="size-6" style={{ color: "#04120C" }} />;
                        })()}
                      </button>
                    )}
                  </div>

                  {/* bottom nav */}
                  {navVisible && (
                    <div
                      className="relative z-30 flex items-end justify-around border-t border-white/6"
                      style={{ background: nav.navBgColor, height: nav.navHeight }}
                      dir={lang === "ar" ? "rtl" : "ltr"}
                    >
                      {nav.bottomNavItems.map((item) => {
                        const Icon = getIcon(item.icon);
                        const active = item.id === activeItem?.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavClick(item.url)}
                            className="flex flex-1 flex-col items-center justify-center gap-0.5"
                            aria-label={item.label}
                          >
                            <Icon
                              style={{
                                width: nav.navIconSize,
                                height: nav.navIconSize,
                                color: active ? nav.navActiveColor : nav.navInactiveColor,
                              }}
                              strokeWidth={active ? 2.4 : 1.8}
                            />
                            {nav.navShowLabels && (
                              <span
                                className="max-w-20 truncate text-[10px] font-bold"
                                style={{ color: active ? nav.navActiveColor : nav.navInactiveColor }}
                              >
                                {item.label}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* external iframe hint */}
          {!isSample && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3.5">
              <Info className="mt-0.5 size-4 shrink-0 text-amber-400" />
              <div className="text-xs leading-relaxed text-muted-foreground">
                <b className="text-foreground">{d.preview.blocked}.</b> {d.preview.blockedHint}
              </div>
            </div>
          )}
          {isSample && (
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-primary">
              <Smartphone className="size-3.5" />
              {d.preview.sampleBadge} — {d.store.name}
            </div>
          )}
        </div>

        {/* ===== console column ===== */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/8 bg-card p-5">
            <h3 className="font-display text-base font-bold">{d.preview.desc}</h3>
            <div className="mt-3.5 flex flex-wrap gap-2 text-xs">
              {[
                { label: d.p.appearance.statusBarColor, value: style.statusBarColor },
                { label: d.p.appearance.splashBg, value: style.splashBg },
                { label: d.p.appearance.splashDuration, value: `${(style.splashDuration / 1000).toFixed(1)}s` },
                { label: d.p.navigation.bottomNav, value: navVisible ? d.common.enabled : d.common.disabled },
                { label: d.p.navigation.drawer, value: nav.drawerEnabled ? d.common.enabled : d.common.disabled },
                { label: d.p.navigation.fab, value: nav.fabEnabled && showFab ? d.common.enabled : d.common.disabled },
              ].map((chip) => (
                <span key={chip.label} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-semibold text-muted-foreground">
                  {chip.label}: <b className="text-foreground" dir="ltr">{chip.value}</b>
                </span>
              ))}
            </div>
          </div>

          {/* console */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0C0E11]">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
              <span className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
                <Megaphone className="size-4 text-primary" />
                {d.preview.console}
              </span>
              <Button variant="ghost" size="sm" onClick={clearBridgeEvents} className="gap-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground">
                <Trash2 className="size-3.5" />
                {d.preview.clear}
              </Button>
            </div>
            <div className="scrollbar-thin max-h-72 min-h-40 space-y-2 overflow-y-auto p-4">
              {bridgeEvents.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">{d.preview.consoleEmpty}</p>
              ) : (
                bridgeEvents.map((ev) => (
                  <div key={ev.id} className="rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-2.5" dir="ltr">
                    <div className="flex items-start justify-between gap-3">
                      <code className="font-mono text-xs font-bold text-primary">{ev.method}</code>
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                        {new Date(ev.at).toLocaleTimeString("en", { hour12: false })}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-[#C9E8D8]">→ {ev.result}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* triggers */}
          <div className="rounded-2xl border border-white/8 bg-card p-5">
            <h4 className="mb-3.5 font-display text-sm font-bold">{d.preview.trigger}</h4>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {(
                [
                  { m: "biometric", label: d.preview.evBiometric, icon: Fingerprint },
                  { m: "qr", label: d.preview.evQr, icon: ScanLine },
                  { m: "google", label: d.preview.evGoogle, icon: GlobeIcon },
                  { m: "apple", label: d.preview.evApple, icon: Apple },
                  { m: "interstitial", label: d.preview.evInterstitial, icon: Megaphone },
                  { m: "vibrate", label: d.preview.evVibrate, icon: Vibrate },
                  { m: "identify", label: d.preview.evIdentify, icon: UserRound },
                  { m: "push", label: d.preview.evPush, icon: Bell },
                ] as const
              ).map((t) => (
                <button
                  key={t.m}
                  onClick={() => trigger(t.m as BridgeMethodId)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-white/8 bg-white/[0.02] px-2 py-3.5 text-center transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/[0.05]"
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <t.icon className="size-4.5" />
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

function GlobeIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}
