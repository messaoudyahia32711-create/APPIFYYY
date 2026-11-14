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
  Check,
  Circle,
  Hourglass,
  FolderCog,
  TabletSmartphone,
  Flame,
  CircleDollarSign,
  Database,
  PlayCircle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  EmptyState,
  StatCard,
} from "./ui";
import { useLang } from "@/lib/appify/i18n";
import { useAppifyStore } from "@/lib/appify/store";
import { navigate } from "@/lib/appify/router";
import { createDemoApp, isSampleUrl } from "@/lib/appify/defaults";
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
  const featured = apps[0]; // like the original: overview of your app

  const pushDone = featured ? featured.firebaseServerKey.trim().length > 0 : false;
  const admobDone = featured ? featured.monetization.admobEnabled : false;
  const cacheOn = featured ? featured.settings.caching : false;
  const logoDone = featured ? !!featured.icon : false;
  const buildDone = featured ? featured.builds.length > 0 : false;

  const statusTone = (ok: boolean) =>
    ok
      ? { chip: "bg-emerald-50 text-emerald-600", icon: "bg-emerald-50 text-emerald-600" }
      : { chip: "bg-red-50 text-red-600", icon: "bg-red-50 text-red-500" };

  const guides = [
    { title: d.dash.guide1, tone: "bg-primary", tab: "wizard" },
    { title: d.dash.guide2, tone: "bg-violet-500", tab: "notifications" },
    { title: d.dash.guide3, tone: "bg-emerald-500", tab: "monetization" },
    { title: d.dash.guide4, tone: "bg-amber-500", tab: "build" },
  ];

  const guideTarget = (tab: string) => {
    if (!featured) return navigate("#/new");
    if (tab === "wizard") return navigate("#/new");
    navigate(`#/app/${featured.id}/${tab}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-card/92 backdrop-blur-xl">
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
            <h1 className="text-2xl font-bold md:text-[28px]">{d.dash.hello}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground md:text-[15px]">{d.dash.subtitle}</p>
          </div>
          <span className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-soft">
            <LayoutDashboard className="size-3.5 text-primary" />
            {d.common.dashboard}
          </span>
        </div>

        {/* stats */}
        <div className="mt-7 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <StatCard label={d.dash.statApps} value={apps.length} icon={<Smartphone className="size-4" />} />
          <StatCard label={d.dash.statBuilds} value={totalBuilds} icon={<Hammer className="size-4" />} tone="green" />
          <StatCard label={d.dash.statNotifs} value={totalNotifs} icon={<Bell className="size-4" />} tone="orange" />
          <StatCard
            label={d.dash.statAvg}
            value={avgBuild !== null ? `${avgBuild} ${d.common.sec}` : "—"}
            icon={<Clock3 className="size-4" />}
          />
        </div>

        {apps.length === 0 ? (
          <div className="mt-6 space-y-6">
            <button
              onClick={() => navigate("#/new")}
              className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-dashed border-primary/35 bg-accent/60 px-5 py-5 text-start transition-all hover:border-primary/60 hover:bg-accent md:px-7"
            >
              <div className="flex items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-white transition-transform group-hover:scale-105">
                  <Plus className="size-6" />
                </span>
                <div>
                  <div className="text-base font-bold text-foreground md:text-lg">{d.dash.newAppTitle}</div>
                  <div className="mt-0.5 text-sm text-muted-foreground">{d.dash.newAppDesc}</div>
                </div>
              </div>
              <Plus className="size-5 shrink-0 text-primary transition-transform group-hover:rotate-90" />
            </button>
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
                    className="rounded-xl border-border bg-card"
                  >
                    <Sparkles className="size-4 text-primary" />
                    {d.dash.seedCta}
                  </Button>
                </div>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid items-start gap-5 lg:grid-cols-2">
            {/* ===== left column: my apps + guides ===== */}
            <div className="space-y-5">
              <h2 className="text-lg font-bold">{d.dash.myApps}</h2>
              {apps.map((app) => {
                const lastBuild = app.builds[0];
                const steps = [
                  { label: d.dash.stepCreate, done: true },
                  { label: d.dash.stepSplash, done: true },
                  { label: d.dash.stepLogo, done: !!app.icon },
                  { label: d.dash.stepBuild, done: app.builds.length > 0 },
                ];
                return (
                  <div
                    key={app.id}
                    className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-pop"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <AppIconBadge name={app.name} icon={app.icon} size={52} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-[17px] font-bold">{app.name}</h3>
                            {isSampleUrl(app.url) && (
                              <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-primary">
                                {d.dash.demoBadge}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground" dir="ltr">
                            {d.dash.createdFor} {app.url.replace(/^https?:\/\//, "")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* completion checklist — like the original */}
                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-xl bg-muted/50 px-4 py-3.5">
                      {steps.map((s) => (
                        <span key={s.label} className="flex items-center gap-2 text-[13px]">
                          {s.done ? (
                            <Check className="size-4 shrink-0 text-emerald-600" />
                          ) : (
                            <Circle className="size-3.5 shrink-0 text-muted-foreground/50" />
                          )}
                          <span className={cn("font-medium", s.done ? "text-muted-foreground" : "text-foreground")}>{s.label}</span>
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <PlatformChips platforms={["android", "ios"]} />
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground" dir="ltr">
                        v{app.version}
                      </span>
                      <span className="ms-auto text-[11px] text-muted-foreground">
                        {d.dash.lastBuild}:{" "}
                        <span className="font-semibold text-foreground">
                          {lastBuild ? lastBuild.output.toUpperCase() : d.common.never}
                        </span>
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2 border-t border-border/70 pt-4">
                      <Button
                        onClick={() => navigate(`#/app/${app.id}`)}
                        className="h-9 flex-1 rounded-xl bg-primary font-bold text-primary-foreground hover:bg-primary/90"
                      >
                        <Pencil className="size-4" />
                        {d.dash.openWorkspace}
                      </Button>
                      <Button
                        onClick={() => navigate(`#/app/${app.id}/preview`)}
                        className="h-9 rounded-xl border border-border bg-card font-semibold text-foreground hover:bg-muted"
                        variant="outline"
                      >
                        <Eye className="size-4 text-primary" />
                        {d.common.preview}
                      </Button>
                      <Button
                        onClick={() => setToDelete(app.id)}
                        className="h-9 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-destructive"
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

              {/* guides — like the original tutorials card */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <h3 className="text-[17px] font-bold">{d.dash.guides}</h3>
                <p className="mt-0.5 text-[13px] text-muted-foreground">{d.dash.guidesSub}</p>
                <div className="mt-4 space-y-2.5">
                  {guides.map((g) => (
                    <button
                      key={g.title}
                      onClick={() => guideTarget(g.tab)}
                      className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-2.5 py-2.5 text-start transition-colors hover:border-border hover:bg-muted/60"
                    >
                      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-105", g.tone)}>
                        <PlayCircle className="size-5" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-[13.5px] font-bold leading-snug">{g.title}</span>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">{d.dash.guideCta}</span>
                      </span>
                      <ChevronDown className="size-4 shrink-0 -rotate-90 text-muted-foreground/50 rtl:rotate-90" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ===== right column: overview + integration status + FAQ ===== */}
            {featured && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold max-lg:mt-9 lg:invisible">{d.dash.myApps}</h2>

                {/* app overview — like the original */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <h3 className="text-[17px] font-bold">{d.dash.overviewT}</h3>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">{d.dash.overviewSub}</p>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-xl border border-border p-3.5">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <Hourglass className="size-5" />
                      </span>
                      <div>
                        <div className="text-[11px] font-medium text-muted-foreground">{d.dash.expires}</div>
                        <div className="text-[13px] font-bold leading-tight" dir="ltr">365 {d.common.day}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-border p-3.5">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <FolderCog className="size-5" />
                      </span>
                      <div>
                        <div className="text-[11px] font-medium text-muted-foreground">{d.dash.appVersion}</div>
                        <div className="text-[13px] font-bold leading-tight" dir="ltr">{featured.versionCode} ({featured.version})</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-border p-3.5">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <TabletSmartphone className="size-5" />
                      </span>
                      <div>
                        <div className="text-[11px] font-medium text-muted-foreground">{d.dash.appType}</div>
                        <div className="text-[13px] font-bold leading-tight">Android</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* integration status cards — like the original */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                    <span className={cn("flex size-9 items-center justify-center rounded-xl", statusTone(pushDone).icon)}>
                      <Flame className="size-4.5" />
                    </span>
                    <div className="mt-3 text-xs font-semibold text-muted-foreground">{d.dash.stPush}</div>
                    <div className={cn("mt-0.5 text-sm font-bold", pushDone ? "text-emerald-600" : "text-red-500")}>
                      {pushDone ? d.dash.stDone : d.dash.stNotDone}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                    <span className={cn("flex size-9 items-center justify-center rounded-xl", admobDone ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                      <CircleDollarSign className="size-4.5" />
                    </span>
                    <div className="mt-3 text-xs font-semibold text-muted-foreground">{d.dash.stAdmob}</div>
                    <div className={cn("mt-0.5 text-sm font-bold", admobDone ? "text-emerald-600" : "text-amber-600")}>
                      {admobDone ? d.dash.stDone : d.dash.stNotDone}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Database className="size-4.5" />
                    </span>
                    <div className="mt-3 text-xs font-semibold text-muted-foreground">{d.dash.stCache}</div>
                    <div className={cn("mt-0.5 text-sm font-bold", cacheOn ? "text-emerald-600" : "text-muted-foreground")}>
                      {cacheOn ? d.dash.stEnabled : d.dash.stDisabled}
                    </div>
                  </div>
                </div>

                {/* FAQs — like the original */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <h3 className="text-[17px] font-bold">{d.dash.faqT}</h3>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">{d.dash.faqSub}</p>
                  <Accordion type="single" collapsible className="mt-3">
                    {d.landing.faq.items.slice(0, 4).map((f, i) => (
                      <AccordionItem key={i} value={`dfaq-${i}`} className="border-border/70">
                        <AccordionTrigger className="py-3.5 text-start text-[13.5px] font-bold hover:no-underline [&>svg]:text-primary">
                          {f.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-[13px] leading-relaxed text-muted-foreground">
                          {f.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-muted-foreground">{d.common.simulatedEnv}</p>
      </main>

      <Dialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <DialogContent className="rounded-2xl border-border bg-popover sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{d.dash.deleteTitle}</DialogTitle>
            <DialogDescription>
              {(appToDelete ? d.dash.deleteBody : "").replace("{name}", appToDelete?.name ?? "")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setToDelete(null)} className="rounded-xl border-border bg-card">
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
