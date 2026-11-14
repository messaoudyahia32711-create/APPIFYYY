"use client";

import {
  Bell,
  Hammer,
  LayoutDashboard,
  Plus,
  Smartphone,
  Clock3,
  Trash2,
  Pencil,
  Eye,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AppifyLogo,
  AppIconBadge,
  LangToggle,
  PlatformChips,
  StatCard,
  EmptyState,
} from "./ui";
import { useLang } from "@/lib/appify/i18n";
import { useAppifyStore } from "@/lib/appify/store";
import { navigate } from "@/lib/appify/router";
import { formatTime, createDemoApp, isSampleUrl } from "@/lib/appify/defaults";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function DashboardPage() {
  const { d, lang } = useLang();
  const apps = useAppifyStore((s) => s.apps);
  const createApp = useAppifyStore((s) => s.createApp);
  const deleteApp = useAppifyStore((s) => s.deleteApp);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const totalBuilds = apps.reduce((acc, a) => acc + a.builds.filter((b) => b.status === "success").length, 0);
  const totalNotifs = apps.reduce((acc, a) => acc + a.notifications.length, 0);
  const successBuilds = apps.flatMap((a) => a.builds).filter((b) => b.status === "success");
  const avgBuild =
    successBuilds.length > 0
      ? Math.round(successBuilds.reduce((acc, b) => acc + (b.durationSec ?? 20), 0) / successBuilds.length)
      : null;

  const appToDelete = apps.find((a) => a.id === toDelete);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0A0A0B]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
          <button onClick={() => navigate("#/")} aria-label="Appify">
            <AppifyLogo />
          </button>
          <div className="flex items-center gap-2.5">
            <LangToggle />
            <Button onClick={() => navigate("#/new")} className="rounded-xl bg-primary font-bold text-primary-foreground hover:bg-primary/90">
              <Plus className="size-4" />
              <span className="hidden sm:inline">{d.common.newApp}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6 md:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold md:text-3xl">{d.dash.hello}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground md:text-base">{d.dash.subtitle}</p>
          </div>
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <LayoutDashboard className="size-3.5 text-primary" />
            {d.common.dashboard}
          </span>
        </div>

        {/* stats */}
        <div className="mt-7 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <StatCard label={d.dash.statApps} value={apps.length} icon={<Smartphone className="size-4" />} />
          <StatCard label={d.dash.statBuilds} value={totalBuilds} icon={<Hammer className="size-4" />} />
          <StatCard label={d.dash.statNotifs} value={totalNotifs} icon={<Bell className="size-4" />} />
          <StatCard
            label={d.dash.statAvg}
            value={avgBuild !== null ? `${avgBuild} ${d.common.sec}` : "—"}
            icon={<Clock3 className="size-4" />}
          />
        </div>

        {/* create CTA */}
        <button
          onClick={() => navigate("#/new")}
          className="group mt-6 flex w-full items-center justify-between gap-4 rounded-2xl border border-dashed border-primary/30 bg-primary/[0.05] px-5 py-5 text-start transition-all hover:border-primary/50 hover:bg-primary/10 md:px-7"
        >
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary transition-transform group-hover:scale-105">
              <Plus className="size-6" />
            </span>
            <div>
              <div className="font-display text-base font-bold text-foreground md:text-lg">{d.dash.newAppTitle}</div>
              <div className="mt-0.5 text-sm text-muted-foreground">{d.dash.newAppDesc}</div>
            </div>
          </div>
          <Plus className="size-5 shrink-0 text-primary transition-transform group-hover:rotate-90" />
        </button>

        {/* apps */}
        <h2 className="mt-10 font-display text-lg font-bold md:text-xl">{d.dash.yourApps}</h2>
        {apps.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={<Smartphone className="size-6" />}
              title={d.dash.emptyTitle}
              desc={d.dash.emptyDesc}
              action={
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  <Button onClick={() => navigate("#/new")} className="rounded-xl bg-primary font-bold text-primary-foreground">
                    <Plus className="size-4" />
                    {d.dash.emptyCta}
                  </Button>
                  <Button
                    onClick={() => {
                      createApp(createDemoApp());
                      toast({ title: d.toast.appCreated });
                    }}
                    variant="outline"
                    className="rounded-xl border-white/12 bg-white/5"
                  >
                    <Sparkles className="size-4 text-primary" />
                    {d.dash.seedCta}
                  </Button>
                </div>
              }
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {apps.map((app) => {
              const lastBuild = app.builds[0];
              return (
                <div
                  key={app.id}
                  className="group relative flex flex-col rounded-2xl border border-white/8 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <AppIconBadge name={app.name} icon={app.icon} size={48} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-display text-base font-bold">{app.name}</h3>
                          {isSampleUrl(app.url) && (
                            <span className="shrink-0 rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-bold text-primary">
                              {d.dash.demoBadge}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground" dir="ltr">
                          {app.url.replace(/^https?:\/\//, "")}
                        </p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                      <span className="size-1.5 rounded-full bg-primary" />
                      {d.dash.statusReady}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <PlatformChips platforms={["android", "ios"]} />
                    <span className="rounded-full bg-white/6 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground" dir="ltr">
                      v{app.version}
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    {d.dash.lastBuild}:{" "}
                    <span className={cn("font-semibold", lastBuild ? "text-foreground" : "")}>
                      {lastBuild
                        ? `${lastBuild.output.toUpperCase()} · v${lastBuild.version} · ${formatTime(lastBuild.startedAt, lang)}`
                        : d.common.never}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-2 border-t border-white/6 pt-4">
                    <Button
                      onClick={() => navigate(`#/app/${app.id}`)}
                      className="h-9 flex-1 rounded-xl bg-white/8 font-semibold hover:bg-white/14"
                      variant="ghost"
                    >
                      <Pencil className="size-4" />
                      {d.dash.openWorkspace}
                    </Button>
                    <Button
                      onClick={() => navigate(`#/app/${app.id}/preview`)}
                      className="h-9 rounded-xl bg-primary/12 font-semibold text-primary hover:bg-primary/20"
                      variant="ghost"
                    >
                      <Eye className="size-4" />
                      {d.common.preview}
                    </Button>
                    <Button
                      onClick={() => setToDelete(app.id)}
                      className="h-9 rounded-xl text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                      variant="ghost"
                      size="icon"
                      aria-label={d.dash.deleteApp}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-muted-foreground">{d.common.simulatedEnv}</p>
      </main>

      <Dialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <DialogContent className="rounded-2xl border-white/10 bg-popover sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{d.dash.deleteTitle}</DialogTitle>
            <DialogDescription>
              {(appToDelete ? d.dash.deleteBody : "").replace("{name}", appToDelete?.name ?? "")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setToDelete(null)} className="rounded-xl border-white/12 bg-white/5">
              {d.common.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (toDelete) {
                  deleteApp(toDelete);
                  toast({ title: d.toast.appDeleted });
                }
                setToDelete(null);
              }}
              className="rounded-xl"
            >
              <Trash2 className="size-4" />
              {d.common.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
