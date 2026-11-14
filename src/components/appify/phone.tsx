"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Fingerprint, Lock, RotateCcw, Loader2 } from "lucide-react";
import { AppIconBadge } from "./ui";
import { SampleStore, type StorePage } from "./sample-store";
import { useLang } from "@/lib/appify/i18n";
import { useAppifyStore } from "@/lib/appify/store";
import { useAuthStore } from "@/lib/appify/auth";
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

export type BridgeMethodId =
  | "biometric" | "identify" | "qr" | "google" | "apple" | "interstitial"
  | "vibrate" | "push" | "share" | "analytics" | "updateNav" | "updateDrawer"
  | "updateAppBar" | "deeplink" | "cartAdd" | "cartPay";

export const METHOD_SIG: Record<BridgeMethodId, string> = {
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

/* ---------- virtual mobile viewport for external websites ----------
 * Renders the site inside a real mobile-class viewport (390 CSS px wide)
 * scaled down to fit the phone screen, so the page lays out exactly like it
 * would on an actual device instead of being squeezed into ~300px.
 * ---------------------------------------------------------------- */
function VirtualWebView({
  url,
  title,
  showAddressBar,
  reloadToken = 0,
}: {
  url: string;
  title: string;
  showAddressBar: boolean;
  reloadToken?: number;
}) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number }>({ w: 304, h: 460 });
  const [reloadKey, setReloadKey] = useState(0);
  // loading is derived: the spinner shows until the iframe reports "load"
  // (or a safety timeout fires for sites that refuse to be framed)
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const viewKey = `${url}-${reloadKey}`;
  const loading = loadedKey !== viewKey;

  // external reload requests (toolbar button) bump the internal reload counter
  useEffect(() => {
    if (reloadToken > 0) setReloadKey((k) => k + 1);
  }, [reloadToken]);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 40 && r.height > 40) setBox({ w: r.width, h: r.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // safety: hide the spinner even if a site blocks framing (X-Frame-Options)
  useEffect(() => {
    const t = window.setTimeout(() => setLoadedKey(viewKey), 4500);
    return () => window.clearTimeout(t);
  }, [viewKey]);

  const VW = 390; // virtual viewport width — matches a Pixel-class Android device
  const scale = box.w / VW;
  const vh = Math.max(420, Math.round(box.h / scale));

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      {/* in-app browser chrome — optional: off by default for a clean,
          fullscreen native-app look (toggle it from App Settings) */}
      {showAddressBar && (
        <div className="flex items-center gap-1.5 border-b border-gray-200 bg-[#f1f3f4] px-2.5 py-1.5" dir="ltr">
          <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-white px-2.5 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
            <Lock className="size-3 shrink-0 text-emerald-600" />
            <span className="truncate text-[11px] font-medium text-gray-600">{url.replace(/^https?:\/\//, "")}</span>
          </span>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-200"
            aria-label="reload"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      )}
      {/* scaled page area */}
      <div ref={pageRef} className="relative flex-1 overflow-hidden">
        <div
          style={{
            width: VW,
            height: vh,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <iframe
            key={`${url}-${reloadKey}`}
            src={url}
            title={title}
            className="border-0 bg-white"
            style={{ width: VW, height: vh }}
            referrerPolicy="no-referrer"
            onLoad={() => setLoadedKey(viewKey)}
          />
        </div>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <Loader2 className="size-5 animate-spin text-gray-300" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- shared phone state ---------- */
export function usePhoneState(app: AppRecord | undefined) {
  const { d, lang } = useLang();
  const pushBridgeEvent = useAppifyStore((s) => s.pushBridgeEvent);
  const pendingBridgeDemo = useAppifyStore((s) => s.pendingBridgeDemo);
  const clearPendingBridgeDemo = useAppifyStore((s) => s.clearPendingBridgeDemo);
  const updateApp = useAppifyStore((s) => s.updateApp);

  const [device, setDevice] = useState<"pixel" | "iphone">("pixel");
  const [splashKey, setSplashKey] = useState(0);
  const [splashVisible, setSplashVisible] = useState(true);
  const [showNav, setShowNav] = useState(true);
  const [showFab, setShowFab] = useState(true);
  const [showAppBar, setShowAppBar] = useState(true);
  const [webViewReloadToken, setWebViewReloadToken] = useState(0);
  const [samplePage, setSamplePage] = useState<StorePage>(() => (app ? (samplePageFromUrl(app.url) as StorePage) : "home"));
  const [currentUrl, setCurrentUrl] = useState<string>(() => app?.url ?? "");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [phoneToast, setPhoneToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

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

  const replaySplash = () => {
    setSplashVisible(true);
    setSplashKey((k) => k + 1);
  };

  const reloadWebView = useCallback(() => setWebViewReloadToken((t) => t + 1), []);

  // persisted setting — hides/shows the browser URL chrome on top of the site
  const toggleAddressBar = useCallback(() => {
    if (!app) return;
    const next = !(app.settings.showAddressBar ?? false);
    updateApp(app.id, (a) => ({
      ...a,
      settings: { ...a.settings, showAddressBar: next },
      updatedAt: Date.now(),
    }));
  }, [app, updateApp]);

  const scopedCss = app && isSample ? scopeCss(app.customCode.css, "appify-store-root") : "";

  const nav = app?.navigation;
  const style = app?.style;
  const hiddenByPattern = app && nav ? nav.hideOnPatterns.some((p) => patternMatches(currentUrl, p)) : false;
  const navVisible = !!nav && nav.bottomNavEnabled && showNav && !hiddenByPattern;
  const activeItem = nav ? (nav.bottomNavItems.find((it) => it.url === currentUrl) ?? nav.bottomNavItems[0]) : undefined;
  const statusTextColor = style ? (style.statusBarContent === "dark" ? "#111318" : "#FFFFFF") : "#FFFFFF";

  return {
    lang,
    d,
    device, setDevice,
    splashVisible, replaySplash,
    showNav, setShowNav, showFab, setShowFab, showAppBar, setShowAppBar,
    webViewReloadToken, reloadWebView,
    addressBarOn: (app?.settings.showAddressBar ?? false) === true,
    toggleAddressBar,
    samplePage, currentUrl, drawerOpen, setDrawerOpen,
    signedIn, setSignedIn,
    phoneToast,
    trigger,
    handleStoreNav, handleStoreBridge, handleNavClick,
    isSample, scopedCss,
    nav, style, navVisible, activeItem, statusTextColor,
  };
}

export type PhoneState = ReturnType<typeof usePhoneState>;

/* ---------- the phone itself ---------- */
export function PhoneFrame({ app, state, className }: { app: AppRecord; state: PhoneState; className?: string }) {
  const { d, lang } = state;
  const siteUser = useAuthStore((s) => s.user);
  const nav = state.nav;
  const style = state.style;
  if (!nav || !style) return null;

  return (
    <div className={cn("mx-auto w-[324px]", className)} dir="ltr">
      <div className={cn("relative rounded-[2.8rem] border border-border bg-[#17181d] p-2.5 shadow-pop", state.device === "iphone" ? "rounded-[3rem]" : "")}>
        <div className="relative overflow-hidden rounded-[2.3rem]">
          {/* content background */}
          <div className="relative flex h-[600px] flex-col" style={{ background: style.appBgColor }}>
            {/* status bar */}
            <div className="relative z-30 flex items-center justify-between px-6 pt-2.5 pb-1" style={{ background: style.statusBarColor, color: state.statusTextColor }}>
              <span className="text-[11px] font-bold" dir="ltr">9:41</span>
              {/* notch */}
              {state.device === "iphone" ? (
                <span className="absolute left-1/2 top-1.5 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
              ) : (
                <span className="absolute left-1/2 top-2 size-3.5 -translate-x-1/2 rounded-full bg-black/90" />
              )}
              <span className="flex items-center gap-1.5 opacity-90">
                <svg viewBox="0 0 24 24" className="size-3 fill-current" aria-hidden="true"><path d="M2 20h3v-6H2v6zm5 0h3V9H7v11zm5 0h3V4h-3v16zm5 0h3v-9h-3v9z"/></svg>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="size-3" aria-hidden="true"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>
                <svg viewBox="0 0 24 12" className="h-3 w-5 fill-current" aria-hidden="true"><rect x="0" y="1" width="20" height="10" rx="2.5" opacity="0.4"/><rect x="1.5" y="2.5" width="14" height="7" rx="1.5"/><rect x="21.5" y="4" width="2" height="4" rx="1"/></svg>
              </span>
            </div>

            {/* app bar */}
            {style.appBarEnabled && state.showAppBar && (
              <div className="relative z-20 flex items-center gap-2.5 px-4 py-2.5" style={{ background: style.appBarColor, color: state.statusTextColor }}>
                {nav.drawerEnabled && (
                  <button onClick={() => state.setDrawerOpen(true)} aria-label="drawer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
                  </button>
                )}
                <span className="truncate text-sm font-bold">{style.appBarTitle || app.name}</span>
              </div>
            )}

            {/* content */}
            <div className="relative flex-1 overflow-hidden" dir={lang === "ar" ? "rtl" : "ltr"}>
              {state.isSample ? (
                <div className="appify-store-root relative h-full" id="phone-screen">
                  {state.scopedCss.trim() && <style dangerouslySetInnerHTML={{ __html: state.scopedCss }} />}
                  <SampleStore
                    page={state.samplePage}
                    onNavigate={state.handleStoreNav}
                    onBridge={state.handleStoreBridge}
                    appBg={style.appBgColor}
                    signedIn={state.signedIn || !!siteUser}
                    onSignIn={(name) => state.setSignedIn(name !== null)}
                    siteUser={siteUser}
                  />
                </div>
              ) : (
                <div className="relative h-full" id="phone-screen">
                  <VirtualWebView
                    url={state.currentUrl}
                    title={app.name}
                    showAddressBar={(app.settings.showAddressBar ?? false) === true}
                    reloadToken={state.webViewReloadToken}
                  />
                </div>
              )}

              {/* splash overlay */}
              {state.splashVisible && (
                <div
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 transition-opacity duration-500"
                  style={{ background: style.splashBg }}
                >
                  <AppIconBadge name={app.name} icon={app.icon} size={72} className="animate-pulse-glow" />
                  <span className="text-lg font-bold" style={{ color: style.splashLogoColor }}>
                    {app.name}
                  </span>
                </div>
              )}

              {/* drawer overlay */}
              {state.drawerOpen && nav.drawerEnabled && (
                <div className="absolute inset-0 z-40 flex" dir={lang === "ar" ? "rtl" : "ltr"}>
                  <button className="absolute inset-0 bg-black/45" onClick={() => state.setDrawerOpen(false)} aria-label={d.common.close} />
                  <aside className="relative flex h-full w-60 flex-col bg-white shadow-2xl">
                    <div className="flex items-center gap-2.5 bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] px-4 pb-4 pt-6">
                      <AppIconBadge name={app.name} icon={app.icon} size={40} className="bg-white/20 text-white shadow-none" />
                      <div>
                        <div className="text-sm font-bold text-white">{app.name}</div>
                        <div className="text-[10px] font-bold text-white/75">{nav.drawerTitle}</div>
                      </div>
                    </div>
                    <nav className="flex-1 space-y-1 overflow-y-auto p-2.5">
                      {nav.drawerItems.map((item) => {
                        const Icon = getIcon(item.icon);
                        return (
                          <button
                            key={item.id}
                            onClick={() => state.handleNavClick(item.url)}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                          >
                            <Icon className="size-4.5 text-primary" />
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
              {state.phoneToast && (
                <div className="animate-slide-up pointer-events-none absolute inset-x-3 top-3 z-50" dir={lang === "ar" ? "rtl" : "ltr"}>
                  <div className="rounded-2xl bg-[#17181d]/95 px-4 py-3 shadow-2xl backdrop-blur">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/25 text-white">
                        <Fingerprint className="size-4" />
                      </span>
                      <span className="text-xs font-bold text-white">{state.phoneToast}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* FAB */}
              {nav.fabEnabled && state.showFab && (
                <button
                  onClick={() => state.handleNavClick(nav.fabUrl)}
                  className="absolute bottom-4 end-4 z-30 flex items-center justify-center rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform hover:scale-105 active:scale-95"
                  style={{ background: nav.fabColor, width: 52, height: 52 }}
                  aria-label={d.p.navigation.fab}
                >
                  {(() => {
                    const Icon = getIcon(nav.fabIcon);
                    return <Icon className="size-6 text-white" />;
                  })()}
                </button>
              )}
            </div>

            {/* bottom nav */}
            {state.navVisible && (
              <div
                className="relative z-30 flex items-end justify-around border-t border-black/8"
                style={{ background: nav.navBgColor, height: nav.navHeight }}
                dir={lang === "ar" ? "rtl" : "ltr"}
              >
                {nav.bottomNavItems.map((item) => {
                  const Icon = getIcon(item.icon);
                  const active = item.id === state.activeItem?.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => state.handleNavClick(item.url)}
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
  );
}
