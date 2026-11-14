"use client";

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
  Eye,
  SearchX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppifyLogo, AppIconBadge, LangToggle } from "./ui";
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

export function WorkspacePage({ appId, tab }: { appId: string; tab: string }) {
  const { d, lang } = useLang();
  const app = useAppById(appId);
  const Back = lang === "ar" ? ArrowRight : ArrowLeft;

  if (!app) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <SearchX className="size-12 text-muted-foreground" />
        <h1 className="font-display text-2xl font-bold">{d.ws.notFound}</h1>
        <p className="text-muted-foreground">{d.ws.notFoundDesc}</p>
        <Button onClick={() => navigate("#/dashboard")} className="rounded-xl bg-primary font-bold text-primary-foreground">
          {d.ws.backDash}
        </Button>
      </div>
    );
  }

  const activeKey = (SECTION_KEYS.includes(tab as SectionKey) ? tab : "overview") as SectionKey;
  const ActiveIcon = SECTION_ICONS[activeKey];

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

  return (
    <div className="flex min-h-screen flex-col">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0A0A0B]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("#/dashboard")}
              className="shrink-0 gap-1.5 rounded-xl text-muted-foreground hover:bg-white/6 hover:text-foreground"
            >
              <Back className="size-4" />
              <span className="hidden sm:inline">{d.ws.backDash}</span>
            </Button>
            <span className="h-6 w-px bg-white/10" />
            <AppIconBadge name={app.name} icon={app.icon} size={34} />
            <div className="min-w-0">
              <div className="truncate font-display text-sm font-bold md:text-base">{app.name}</div>
              <div className="hidden truncate text-[11px] text-muted-foreground sm:block" dir="ltr">
                {app.url.replace(/^https?:\/\//, "")}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LangToggle />
            <Button
              onClick={() => navigate(`#/app/${app.id}/preview`)}
              className="rounded-xl bg-primary font-bold text-primary-foreground hover:bg-primary/90"
            >
              <Eye className="size-4" />
              <span className="hidden sm:inline">{d.ws.openPreview}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1500px] flex-1 gap-6 px-4 py-6 md:px-6 lg:py-8">
        {/* sidebar — start side (right in RTL) */}
        <aside className="hidden w-64 shrink-0 lg:block" aria-label="sections">
          <nav className="sticky top-24 space-y-1 rounded-2xl border border-white/8 bg-card p-2.5">
            {SECTION_KEYS.map((key) => {
              const Icon = SECTION_ICONS[key];
              const active = key === activeKey;
              return (
                <button
                  key={key}
                  onClick={() => navigate(`#/app/${app.id}/${key}`)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-start transition-colors",
                    active
                      ? "bg-primary/12 font-bold text-primary"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <Icon className={cn("size-4.5 shrink-0", active && "text-primary")} />
                  <span className="text-sm">{d.ws.sections[key]}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* mobile tabs */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0A0A0B]/95 backdrop-blur-xl lg:hidden">
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
                    active ? "bg-primary/15 text-primary" : "bg-white/5 text-muted-foreground",
                  )}
                >
                  <Icon className="size-3.5" />
                  {d.ws.sections[key]}
                </button>
              );
            })}
          </div>
        </div>

        {/* content */}
        <main className="min-w-0 flex-1 pb-24 lg:pb-0">
          <div key={app.id}>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ActiveIcon className="size-5" />
              </span>
              <div>
                <h1 className="font-display text-xl font-extrabold md:text-2xl">{d.ws.sections[activeKey]}</h1>
                <p className="text-sm text-muted-foreground">{d.ws.sectionDescs[activeKey]}</p>
              </div>
            </div>
            {renderPanel()}
          </div>
        </main>
      </div>
    </div>
  );
}
