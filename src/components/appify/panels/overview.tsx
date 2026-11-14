"use client";

import {
  CheckCircle2,
  Circle,
  Bell,
  Hammer,
  FileCode2,
  Navigation,
  Info,
  Smartphone,
  Globe,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppIconBadge, PlatformChips, SectionCard, StatCard } from "../ui";
import { useLang } from "@/lib/appify/i18n";
import { navigate } from "@/lib/appify/router";
import type { AppRecord } from "@/lib/appify/types";
import { formatTime, isSampleUrl } from "@/lib/appify/defaults";
import { cn } from "@/lib/utils";

export function OverviewPanel({ app }: { app: AppRecord }) {
  const { d, lang } = useLang();

  const checklist = [
    {
      key: "ck1",
      done: !!app.name && !!app.packageName && !!app.bundleId,
      target: "general",
    },
    {
      key: "ck2",
      done: app.navigation.bottomNavEnabled && app.navigation.bottomNavItems.length > 1,
      target: "navigation",
    },
    {
      key: "ck3",
      done: app.notifications.length > 0,
      target: "notifications",
    },
    { key: "ck4", done: false, target: "preview" },
    { key: "ck5", done: app.builds.length > 0, target: "build" },
  ];

  const lastBuild = app.builds[0];

  const go = (target: string) => {
    if (target === "preview") navigate(`#/app/${app.id}/preview`);
    else navigate(`#/app/${app.id}/${target}`);
  };

  return (
    <div className="space-y-5">
      {/* status card */}
      <SectionCard>
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <AppIconBadge name={app.name} icon={app.icon} size={64} className="shadow-xl" />
            <div>
              <h3 className="font-display text-lg font-extrabold">{app.name}</h3>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground" dir="ltr">
                <Globe className="size-3.5" />
                {app.url.replace(/^https?:\/\//, "")}
                {isSampleUrl(app.url) && <span className="text-primary">({d.preview.sampleBadge})</span>}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <PlatformChips platforms={["android", "ios"]} />
                <span className="rounded-full bg-white/6 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground" dir="ltr">
                  v{app.version} ({app.versionCode})
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-4 py-2 text-sm font-bold text-primary">
              <span className="size-2 rounded-full bg-primary" />
              {d.dash.statusReady} — {d.p.overview.ready}
            </span>
            <Button onClick={() => go("preview")} className="rounded-xl bg-primary font-bold text-primary-foreground">
              <Eye className="size-4" />
              {d.ws.openPreview}
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <StatCard label={d.p.overview.buildsCount} value={app.builds.length} icon={<Hammer className="size-4" />} />
        <StatCard label={d.p.overview.notifsSent} value={app.notifications.length} icon={<Bell className="size-4" />} />
        <StatCard
          label={d.p.overview.lastBuild}
          value={lastBuild ? lastBuild.output.toUpperCase() : "—"}
          icon={<Smartphone className="size-4" />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* checklist */}
        <SectionCard title={d.p.overview.checklist} icon={<Info className="size-4.5" />}>
          <ul className="space-y-2.5">
            {checklist.map((item) => {
              const label = d.p.overview[item.key as "ck1"];
              return (
                <li key={item.key}>
                  <button
                    onClick={() => go(item.target)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-start text-sm transition-colors",
                      item.done
                        ? "border-primary/20 bg-primary/[0.05] text-foreground"
                        : "border-white/8 bg-white/[0.02] text-muted-foreground hover:border-primary/25 hover:text-foreground",
                    )}
                  >
                    {item.done ? (
                      <CheckCircle2 className="size-4.5 shrink-0 text-primary" />
                    ) : (
                      <Circle className="size-4.5 shrink-0 text-muted-foreground" />
                    )}
                    <span className={cn("flex-1 font-medium", item.done && "line-through opacity-70")}>{label}</span>
                    <span className="text-[11px] font-bold text-primary">{item.done ? d.p.overview.done : "→"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </SectionCard>

        <div className="space-y-5">
          {/* quick actions */}
          <SectionCard title={d.p.overview.quickActions}>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: d.p.overview.qaBuild, icon: Hammer, target: "build" },
                { label: d.p.overview.qaNotif, icon: Bell, target: "notifications" },
                { label: d.p.overview.qaCode, icon: FileCode2, target: "code" },
              ].map((a) => (
                <button
                  key={a.target}
                  onClick={() => go(a.target)}
                  className="flex flex-col items-center gap-2.5 rounded-2xl border border-white/8 bg-white/[0.02] px-3 py-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/[0.05]"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <a.icon className="size-5" />
                  </span>
                  <span className="text-center text-xs font-bold">{a.label}</span>
                </button>
              ))}
            </div>
            {lastBuild && (
              <p className="mt-4 text-xs text-muted-foreground">
                {d.dash.lastBuild}: <span className="font-bold text-foreground">{lastBuild.output.toUpperCase()} · v{lastBuild.version}</span> · {formatTime(lastBuild.startedAt, lang)}
              </p>
            )}
          </SectionCard>

          {/* why */}
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-[#0E1A15] to-[#12101F] p-5">
            <h4 className="font-display font-bold text-primary">{d.p.overview.whatNext}</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.p.overview.whatNextD}</p>
            <button
              onClick={() => go("navigation")}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
            >
              <Navigation className="size-3.5" />
              {d.ws.sections.navigation} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
