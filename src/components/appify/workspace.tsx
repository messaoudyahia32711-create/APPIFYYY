"use client";

import { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  Info,
  SlidersHorizontal,
  Palette,
  Navigation,
  Bell,
  MessageSquareCode,
  BadgeDollarSign,
  BarChart3,
  Link2,
  FileCode2,
  Hammer,
  EyeOff,
  Eye,
  SearchX,
  RotateCcw,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppifyLogo, AppIconBadge, LangToggle } from "./ui";
import { GoogleAuthButton } from "./google-auth";
import { PhoneFrame, usePhoneState } from "./phone";
import { useLang } from "@/lib/appify/i18n";
import { navigate } from "@/lib/appify/router";
import { useAppById } from "@/lib/appify/store";
import { cn } from "@/lib/utils";
import { OverviewPanel } from "./panels/overview";
import { GeneralPanel } from "./panels/general";
import { SettingsPanel } from "./panels/settings";
import { AppearancePanel } from "./panels/appearance";
import { NavigationPanel } from "./panels/navigation";
import { NotificationsPanel } from "./panels/notifications";
import { BridgePanel } from "./panels/bridge";
import { MonetizationPanel, AnalyticsPanel, DeepLinkPanel, CustomCodePanel } from "./panels/growth";
import { BuildPanel } from "./panels/build";

const SECTION_ICONS = {
  overview: LayoutDashboard,
  general: Info,
  settings: SlidersHorizontal,
  appearance: Palette,
  navigation: Navigation,
  notifications: Bell,
  bridge: MessageSquareCode,
  monetization: BadgeDollarSign,
  analytics: BarChart3,
  deeplink: Link2,
  code: FileCode2,
  build: Hammer,
} as const;

export type SectionKey = keyof typeof SECTION_ICONS;

export const SECTION_KEYS: SectionKey[] = [
  "overview",
  "general",
  "settings",
  "appearance",
  "navigation",
  "notifications",
  "bridge",
  "monetization",
  "analytics",
  "deeplink",
  "code",
  "build",
];

/* Appilix-style grouped sidebar */
const GROUPS: { key: "main" | "appSettings" | "modules"; items: SectionKey[] }[] = [
  { key: "main", items: ["overview", "notifications", "build"] },
  { key: "appSettings", items: ["general", "settings", "appearance", "navigation"] },
  { key: "modules", items: ["bridge", "monetization", "analytics", "deeplink", "code"] },
];

export function WorkspacePage({ appId, tab }: { appId: string; tab: string }) {
  const { d, lang } = useLang();
  const app = useAppById(appId);
  const [previewOpen, setPreviewOpen] = useState(true);
  const phone = usePhoneState(app);
  const Back = lang === "ar" ? ArrowRight : ArrowLeft;

  if (!app) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <SearchX className="size-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">{d.ws.notFound}</h1>
        <p className="text-muted-foreground">{d.ws.notFoundDesc}</p>
        <Button onClick={() => navigate("#/dashboard")} className="rounded-xl bg-primary font-bold text-primary-foreground">
          {d.ws.backDash}
        </Button>
      </div>
    );
  }

  const activeKey = (SECTION_KEYS.includes(tab as SectionKey) ? tab : "overview") as SectionKey;
  const ActiveIcon = SECTION_ICONS[activeKey];

  // active integration modules (drives the sidebar count + list, like the original)
  const activeModules: { key: SectionKey; on: boolean }[] = [
    { key: "navigation", on: app.navigation.bottomNavEnabled },
    { key: "appearance", on: app.style.appBarEnabled },
    { key: "notifications", on: app.firebaseServerKey.trim().length > 0 },
    { key: "monetization", on: app.monetization.admobEnabled },
    { key: "analytics", on: app.integrations.appsflyerEnabled || app.integrations.metaEnabled },
    { key: "settings", on: app.settings.caching },
    { key: "deeplink", on: app.deepLink.patterns.length > 0 },
    { key: "code", on: app.customCode.css.trim().length > 0 || app.customCode.js.trim().length > 0 },
  ];
  const modulesOn = activeModules.filter((m) => m.on);

  const renderPanel = () => {
    switch (activeKey) {
      case "overview":
        return <OverviewPanel app={app} />;
      case "general":
        return <GeneralPanel app={app} />;
      case "settings":
        return <SettingsPanel app={app} />;
      case "appearance":
        return <AppearancePanel app={app} />;
      case "navigation":
        return <NavigationPanel app={app} />;
      case "notifications":
        return <NotificationsPanel app={app} />;
      case "bridge":
        return <BridgePanel app={app} />;
      case "monetization":
        return <MonetizationPanel app={app} />;
      case "analytics":
        return <AnalyticsPanel app={app} />;
      case "deeplink":
        return <DeepLinkPanel app={app} />;
      case "code":
        return <CustomCodePanel app={app} />;
      case "build":
        return <BuildPanel app={app} />;
    }
  };

  const goPricing = () => {
    navigate("#/");
    window.setTimeout(() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }), 120);
  };

  const navItem = (key: SectionKey) => {
    const Icon = SECTION_ICONS[key];
    const active = key === activeKey;
    return (
      <button
        key={key}
        onClick={() => navigate(`#/app/${app.id}/${key}`)}
        className={cn(
          "flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-start text-sm transition-colors",
          active
            ? "bg-primary font-semibold text-white shadow-[0_4px_12px_rgba(109,40,217,0.3)]"
            : "font-medium text-foreground/75 hover:bg-accent hover:text-primary",
        )}
      >
        <Icon className={cn("size-4.5 shrink-0", active ? "text-white" : "text-primary/70")} />
        <span className="truncate">{d.ws.sections[key]}</span>
      </button>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => navigate("#/dashboard")} className="hidden md:block" aria-label="Appify">
              <AppifyLogo />
            </button>
            <span className="hidden h-7 w-px bg-border md:block" />
            <span className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-3 py-1.5 shadow-soft">
              <AppIconBadge name={app.name} icon={app.icon} size={30} className="rounded-lg" />
              <span className="min-w-0">
                <span className="block max-w-36 truncate text-sm font-bold leading-tight">{app.name}</span>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground" dir="ltr">
                  Free plan · Android
                </span>
              </span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("#/dashboard")}
              className="shrink-0 gap-1.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Back className="size-4" />
              <span className="hidden lg:inline">{d.ws.backDash}</span>
            </Button>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <GoogleAuthButton />
            <LangToggle />
            <Button
              onClick={() => setPreviewOpen((v) => !v)}
              variant="outline"
              className="hidden rounded-xl border-border bg-card font-semibold xl:inline-flex"
            >
              {previewOpen ? <EyeOff className="size-4 text-primary" /> : <Eye className="size-4 text-primary" />}
              <span className="hidden lg:inline">{previewOpen ? d.ws.hidePreview : d.ws.showPreview}</span>
            </Button>
            <Button
              onClick={() => navigate(`#/app/${app.id}/build`)}
              className="rounded-xl bg-primary font-bold text-primary-foreground hover:bg-primary/90"
            >
              <Hammer className="size-4" />
              <span className="hidden sm:inline">{d.ws.sections.build}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 gap-0 px-4 py-6 md:px-6 lg:py-7">
        {/* sidebar — start side (right in RTL) */}
        <aside className="hidden w-64 shrink-0 lg:block" aria-label="sections">
          <nav className="sticky top-24 max-h-[calc(100vh-7.5rem)] space-y-1 overflow-y-auto rounded-2xl border border-border bg-card p-3 shadow-soft no-scrollbar">
            {GROUPS.map((group, gi) => (
              <div key={group.key} className={cn(gi > 0 && "mt-3 border-t border-border/70 pt-3")}>
                <div className="mb-1.5 px-3.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80">
                  {d.ws.groups[group.key]}
                </div>
                {group.items.map(navItem)}
                {group.key === "modules" && (
                  <div className="mt-1.5 px-3.5 text-[11px] font-semibold text-muted-foreground">
                    {d.ws.activeModules}: <span className="font-bold text-primary" dir="ltr">{modulesOn.length}</span>
                  </div>
                )}
              </div>
            ))}

            {/* plan card — like the original */}
            <div className="mt-4 rounded-2xl border border-border bg-muted/60 p-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-50 text-[10px] font-extrabold text-amber-600" dir="ltr">
                  365
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-tight">{d.plan.title}</div>
                  <div className="text-[10.5px] text-muted-foreground">{d.plan.daysLeft}</div>
                </div>
              </div>
              <button
                onClick={goPricing}
                className="mt-3 w-full rounded-xl bg-foreground py-2 text-xs font-bold text-background transition-colors hover:bg-foreground/85"
              >
                {d.plan.upgrade}
              </button>
            </div>
          </nav>
        </aside>

        {/* content */}
        <main className={cn("min-w-0 flex-1 pb-24 lg:pb-0", previewOpen && "xl:me-2")} dir={lang === "ar" ? "rtl" : "ltr"}>
          <div className={cn(previewOpen && "xl:max-w-[860px]")}>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
                <ActiveIcon className="size-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold md:text-[22px]">{d.ws.sections[activeKey]}</h1>
                <p className="text-[13px] text-muted-foreground">{d.ws.sectionDescs[activeKey]}</p>
              </div>
            </div>
            {renderPanel()}
          </div>
        </main>

        {/* embedded live preview — end side (like the original builder) */}
        {previewOpen && (
          <aside className="hidden w-[380px] shrink-0 xl:block" aria-label="live preview">
            <div className="sticky top-24 max-h-[calc(100vh-7.5rem)] space-y-3 overflow-y-auto no-scrollbar pb-4">
              <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-3.5 py-2.5 shadow-soft">
                <span className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <Eye className="size-3.5 text-primary" />
                  {d.ws.livePreview}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="flex rounded-lg bg-muted p-0.5" role="group" aria-label={d.preview.device}>
                    {(["pixel", "iphone"] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => phone.setDevice(v)}
                        className={cn(
                          "rounded-md px-2 py-1 text-[10px] font-bold transition-colors",
                          phone.device === v ? "bg-card text-primary shadow-soft" : "text-muted-foreground",
                        )}
                      >
                        {v === "pixel" ? "Android" : "iPhone"}
                      </button>
                    ))}
                  </div>
                  <Button variant="outline" size="icon" className="size-7 rounded-lg border-border bg-card" onClick={phone.replaySplash} aria-label={d.preview.replaySplash}>
                    <RotateCcw className="size-3.5 text-primary" />
                  </Button>
                </div>
              </div>
              <PhoneFrame app={app} state={phone} />
              <button
                onClick={() => navigate(`#/app/${app.id}/preview`)}
                className="mx-auto flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-primary shadow-soft transition-colors hover:bg-accent"
              >
                <Sparkles className="size-3.5" />
                {d.ws.openFullPreview}
                <ChevronDown className={cn("size-3.5 rtl:-rotate-90", lang === "ar" ? "-rotate-90" : "rotate-90")} />
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* mobile tabs */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/97 backdrop-blur-xl lg:hidden">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 py-2.5">
          {SECTION_KEYS.map((key) => {
            const Icon = SECTION_ICONS[key];
            const active = key === activeKey;
            return (
              <button
                key={key}
                onClick={() => navigate(`#/app/${app.id}/${key}`)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  active ? "bg-primary text-white" : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {d.ws.sections[key]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
