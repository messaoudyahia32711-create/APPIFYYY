"use client";

import { useState } from "react";
import {
  Globe,
  Link2,
  SlidersHorizontal,
  Smartphone,
  MonitorSmartphone,
  Rocket,
  ArrowLeft,
  ArrowRight,
  Bell,
  Fingerprint,
  Navigation,
  Layers,
  MessageSquareCode,
  QrCode,
  Camera,
  Palette,
  BadgeDollarSign,
  BarChart3,
  PackageCheck,
  Menu,
  X,
  CheckCircle2,
  RefreshCcw,
  Search,
  UserRound,
  Store,
  Check,
  Wifi,
  BatteryFull,
  Signal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AppifyLogo, LangToggle } from "./ui";
import { GoogleAuthButton } from "./google-auth";
import { useLang } from "@/lib/appify/i18n";
import { navigate } from "@/lib/appify/router";
import { cn } from "@/lib/utils";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ==================== Navbar ==================== */
function Navbar() {
  const { d } = useLang();
  const [open, setOpen] = useState(false);
  const links: { label: string; target: string }[] = [
    { label: d.landing.nav.howItWorks, target: "how" },
    { label: d.landing.nav.features, target: "features" },
    { label: d.landing.nav.bridge, target: "bridge" },
    { label: d.landing.nav.pricing, target: "pricing" },
    { label: d.landing.nav.faq, target: "faq" },
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-card/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
        <button onClick={() => setOpen(!open)} className="lg:hidden" aria-label="menu">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Appify">
          <AppifyLogo />
        </button>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="main">
          {links.map((l) => (
            <button
              key={l.target}
              onClick={() => scrollToSection(l.target)}
              className="rounded-full px-3.5 py-2 text-[13.5px] font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-primary"
            >
              {l.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <GoogleAuthButton />
          <LangToggle />
          <Button onClick={() => navigate("#/dashboard")} className="rounded-xl bg-primary font-bold text-primary-foreground hover:bg-primary/90">
            <span className="hidden sm:inline">{d.landing.nav.gotoDash}</span>
            <span className="sm:hidden">{d.landing.nav.gotoDash.slice(0, 6)}</span>
          </Button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border bg-card px-4 py-3 lg:hidden" aria-label="mobile">
          {links.map((l) => (
            <button
              key={l.target}
              onClick={() => {
                scrollToSection(l.target);
                setOpen(false);
              }}
              className="block w-full rounded-xl px-3 py-2.5 text-start text-sm font-semibold text-foreground/80 hover:bg-accent"
            >
              {l.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}

/* ==================== Hero phone mockup ==================== */
function HeroPhone() {
  const { d } = useLang();
  const navIcons = [Store, Search, Bell, UserRound];
  return (
    <div className="relative mx-auto w-[300px]" dir="ltr">
      {/* floating chips */}
      <div className="animate-float absolute -start-8 top-16 z-20 hidden rounded-2xl border border-border bg-card px-3.5 py-2.5 shadow-pop sm:flex sm:items-center sm:gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-xl bg-accent text-primary">
          <Bell className="size-4" />
        </span>
        <div>
          <div className="text-[11px] font-bold leading-tight">{d.landing.hero.phoneChip1}</div>
          <div className="text-[9px] text-muted-foreground" dir="ltr">Firebase · now</div>
        </div>
      </div>
      <div className="animate-float-slow absolute -end-10 top-44 z-20 hidden rounded-2xl border border-border bg-card px-3.5 py-2.5 shadow-pop sm:flex sm:items-center sm:gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-xl bg-accent text-primary">
          <Fingerprint className="size-4" />
        </span>
        <div className="text-[11px] font-bold leading-tight">{d.landing.hero.phoneChip2}</div>
      </div>

      {/* the phone */}
      <div className="animate-float-slow relative rounded-[2.6rem] border border-border bg-[#17181d] p-2.5 shadow-pop">
        <div className="relative overflow-hidden rounded-[2.2rem] bg-white">
          {/* status bar */}
          <div className="flex items-center justify-between bg-[#6D28D9] px-5 pb-1.5 pt-2.5 text-white">
            <span className="text-[10px] font-bold">9:41</span>
            <span className="absolute left-1/2 top-1.5 h-4 w-20 -translate-x-1/2 rounded-full bg-black/90" />
            <span className="flex items-center gap-1 opacity-90">
              <Signal className="size-2.5" />
              <Wifi className="size-2.5" />
              <BatteryFull className="size-3" />
            </span>
          </div>
          {/* app bar */}
          <div className="flex items-center gap-2.5 border-b border-border bg-white px-4 py-3">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary">
              <svg viewBox="0 0 64 64" className="size-4.5" aria-hidden="true">
                <path d="M20 44 L32 20 L44 44" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M26.5 36 H37.5" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <div className="text-[12px] font-bold leading-tight text-foreground">{d.landing.hero.phoneApp}</div>
              <div className="text-[9px] text-muted-foreground" dir="ltr">{d.landing.hero.phoneUrl}</div>
            </div>
          </div>
          {/* mini content */}
          <div className="space-y-2.5 bg-[#f5f6fa] p-3.5" dir="ltr">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-white p-3">
                <div className={cn("mb-2 h-14 rounded-lg", i === 1 ? "bg-violet-100" : "bg-muted")} />
                <div className="mb-1.5 h-2 w-3/4 rounded-full bg-muted" />
                <div className="h-2 w-1/2 rounded-full bg-muted" />
              </div>
            ))}
          </div>
          {/* bottom nav */}
          <div className="flex items-end justify-around border-t border-border bg-white px-2 pb-2.5 pt-2">
            {navIcons.map((Icon, i) => (
              <span key={i} className="flex flex-col items-center gap-1">
                <Icon className={cn("size-4.5", i === 0 ? "text-primary" : "text-gray-400")} strokeWidth={i === 0 ? 2.4 : 1.8} />
                <span className={cn("h-1 w-6 rounded-full", i === 0 ? "bg-primary/25" : "bg-transparent")} />
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 left-1/2 z-20 hidden -translate-x-1/2 rounded-full border border-border bg-card px-4 py-2 shadow-pop sm:flex sm:items-center sm:gap-2">
        <span className="size-2 rounded-full bg-emerald-500" />
        <span className="text-[11px] font-bold">{d.landing.hero.phoneChip3}</span>
      </div>
    </div>
  );
}

/* ==================== Hero ==================== */
function Hero() {
  const { d } = useLang();
  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      {/* soft purple glows */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-violet-200/50 blur-3xl" />
        <div className="absolute top-32 -start-24 h-72 w-72 rounded-full bg-purple-100/70 blur-3xl" />
        <div className="absolute top-48 -end-24 h-72 w-72 rounded-full bg-violet-100/70 blur-3xl" />
      </div>
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 md:px-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="text-center lg:text-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-xs font-bold text-primary">
            <Sparkle />
            {d.landing.hero.badge}
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.25] tracking-tight md:text-[44px] md:leading-[1.3]">
            {d.landing.hero.titleA}{" "}
            <span className="text-gradient">{d.landing.hero.titleB}</span>{" "}
            <span className="text-muted-foreground/80">{d.landing.hero.titleC}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground md:text-base lg:mx-0">
            {d.landing.hero.subtitle}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Button onClick={() => navigate("#/new")} size="lg" className="glow-neon h-12 rounded-xl bg-primary px-7 text-base font-bold text-primary-foreground hover:bg-primary/90">
              <Rocket className="size-5" />
              {d.landing.hero.ctaPrimary}
            </Button>
            <Button onClick={() => navigate("#/dashboard")} size="lg" variant="outline" className="h-12 rounded-xl border-border bg-card px-6 text-base font-bold hover:bg-muted">
              <MonitorSmartphone className="size-5 text-primary" />
              {d.landing.hero.ctaSecondary}
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">{d.landing.hero.trust}</p>
          <div className="mx-auto mt-8 flex max-w-lg items-center justify-center gap-6 lg:justify-start">
            {[d.landing.hero.stat1v, d.landing.hero.stat2v, d.landing.hero.stat3v].map((v, i) => (
              <div key={i} className="text-center lg:text-start">
                <div className="text-xl font-bold text-primary" dir="ltr">{v}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {[d.landing.hero.stat1t, d.landing.hero.stat2t, d.landing.hero.stat3t][i]}
                </div>
              </div>
            ))}
          </div>
        </div>
        <HeroPhone />
      </div>
    </section>
  );
}

function Sparkle() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden="true">
      <path d="M12 2l2.1 5.9L20 10l-5.9 2.1L12 18l-2.1-5.9L4 10l5.9-2.1L12 2z" />
    </svg>
  );
}

/* ==================== Flow (7 steps) ==================== */
function Flow() {
  const { d } = useLang();
  return (
    <section id="how" className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
      <SectionHead title={d.landing.flow.title} subtitle={d.landing.flow.subtitle} />
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {d.landing.flow.steps.map((s, i) => (
          <div
            key={i}
            className={cn(
              "relative rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/30",
              i === 0 && "lg:col-span-2",
            )}
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white" dir="ltr">
              {i + 1}
            </span>
            <h3 className="mt-3.5 text-[15px] font-bold">{s.title}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
            {i < d.landing.flow.steps.length - 1 && (
              <ArrowNextInline className="absolute end-4 top-6 hidden text-primary/40 lg:block" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ArrowNextInline({ className }: { className?: string }) {
  const { lang } = useLang();
  const Icon = lang === "ar" ? ArrowLeft : ArrowRight;
  return <Icon className={cn("size-4", className)} />;
}

/* ==================== Architecture ==================== */
function Arch() {
  const { d } = useLang();
  return (
    <section className="border-y border-border bg-card/60 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHead title={d.landing.arch.title} subtitle={d.landing.arch.subtitle} />
        <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-[1fr_auto_1fr]">
          {/* website box */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-foreground/70">
                <Globe className="size-4.5" />
              </span>
              <h3 className="text-base font-bold">{d.landing.arch.websiteBox}</h3>
            </div>
            <ul className="mt-4 space-y-2">
              {d.landing.arch.websiteItems.map((it) => (
                <li key={it} className="flex items-center gap-2.5 rounded-xl bg-muted/70 px-3.5 py-2.5 text-[13px] font-medium">
                  <span className="size-1.5 rounded-full bg-foreground/30" />
                  {it}
                </li>
              ))}
            </ul>
          </div>
          {/* arrow */}
          <div className="flex items-center justify-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_6px_16px_rgba(109,40,217,0.3)]">
              <ArrowNextInline className="size-5 rotate-180" />
            </span>
          </div>
          {/* app box */}
          <div className="rounded-2xl border-2 border-primary/25 bg-accent/70 p-6 shadow-soft">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white">
                <Smartphone className="size-4.5" />
              </span>
              <h3 className="text-base font-bold text-primary">{d.landing.arch.appBox}</h3>
            </div>
            <ul className="mt-4 space-y-2">
              {d.landing.arch.appItems.map((it) => (
                <li key={it} className="flex items-center gap-2.5 rounded-xl border border-primary/15 bg-card px-3.5 py-2.5 text-[13px] font-semibold">
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                  {it}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { t: d.landing.arch.point1t, dd: d.landing.arch.point1d, icon: RefreshCcw },
            { t: d.landing.arch.point2t, dd: d.landing.arch.point2d, icon: Palette },
            { t: d.landing.arch.point3t, dd: d.landing.arch.point3d, icon: Bell },
          ].map((p) => (
            <div key={p.t} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
                <p.icon className="size-5" />
              </span>
              <h4 className="mt-3.5 text-[15px] font-bold">{p.t}</h4>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{p.dd}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== Features ==================== */
const FEATURE_ICONS = [Smartphone, Bell, Navigation, Layers, MessageSquareCode, Fingerprint, Link2, Camera, Palette, BadgeDollarSign, BarChart3, PackageCheck];

function Features() {
  const { d } = useLang();
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
      <SectionHead title={d.landing.features.title} subtitle={d.landing.features.subtitle} />
      <div className="mt-10 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {d.landing.features.items.map((f, i) => {
          const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
          return (
            <div key={i} className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-pop">
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-3.5 text-[15px] font-bold">{f.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ==================== Bridge ==================== */
function Bridge() {
  const { d } = useLang();
  return (
    <section id="bridge" className="border-y border-border bg-card/60 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHead title={d.landing.bridge.title} subtitle={d.landing.bridge.subtitle} />
        <div className="mt-10 grid items-start gap-6 lg:grid-cols-2">
          <div>
            {/* flow diagram */}
            <div className="space-y-2.5">
              {[d.landing.bridge.flowWeb, d.landing.bridge.flowBridge, d.landing.bridge.flowNative].map((box, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-11 flex-1 items-center justify-between rounded-xl border px-4 font-mono text-[13px] font-bold",
                      i === 1 ? "border-primary/30 bg-accent text-primary" : "border-border bg-card text-foreground/80",
                    )}
                    dir="ltr"
                  >
                    {box}
                    {i === 1 && <MessageSquareCode className="size-4" />}
                    {i === 0 && <FileCodeIcon />}
                    {i === 2 && <Smartphone className="size-4 text-muted-foreground" />}
                  </span>
                </div>
              ))}
              <div className="ms-6 flex flex-col items-start gap-1 text-primary/50" aria-hidden="true">
                <span className="h-3 w-px bg-primary/40" />
                <span className="h-3 w-px bg-primary/40" />
              </div>
            </div>
            {/* code */}
            <div className="mt-5 overflow-hidden rounded-xl border border-border bg-[#17181d]">
              <div className="flex items-center justify-between border-b border-white/8 px-3.5 py-2">
                <span className="text-xs font-medium text-white/55" dir="ltr">{d.landing.bridge.codeTitle}</span>
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="size-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="size-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="size-2.5 rounded-full bg-[#28C840]" />
                </span>
              </div>
              <pre className="overflow-x-auto p-4 text-left font-mono text-[12.5px] leading-relaxed text-[#d6d9e0]" dir="ltr">
                <code>{`// صفحة الدفع في موقعك — your checkout page
AppifyBridge
  .startBiometricAuthentication({ title: "تأكيد الدفع" })
  .then((result) => {
    if (result.success) completePayment();
  });

// يعمل كما هو داخل التطبيق — same code inside the app`}</code>
              </pre>
            </div>
          </div>
          {/* methods */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="text-base font-bold">{d.landing.bridge.methodsTitle}</h3>
            <div className="scrollbar-thin mt-4 max-h-[420px] space-y-2 overflow-y-auto pe-1.5">
              {d.landing.bridge.methods.map((m) => (
                <div key={m.name} className="rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 transition-colors hover:border-primary/25 hover:bg-accent/60">
                  <code className="block text-left font-mono text-[12.5px] font-bold text-primary" dir="ltr">
                    AppifyBridge.{m.name}()
                  </code>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FileCodeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 text-muted-foreground" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M10 13l-2 2 2 2M14 17l2-2-2-2" />
    </svg>
  );
}

/* ==================== Navigation showcase ==================== */
function NavShow() {
  const { d } = useLang();
  const [active, setActive] = useState(0);
  const icons = [Store, Search, Bell, UserRound];
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
      <SectionHead title={d.landing.navShow.title} subtitle={d.landing.navShow.subtitle} />
      <div className="mt-10 grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        {/* interactive demo */}
        <div className="mx-auto w-full max-w-[340px] rounded-[2.2rem] border border-border bg-[#17181d] p-2.5 shadow-pop" dir="ltr">
          <div className="overflow-hidden rounded-[1.9rem] bg-white">
            <div className="flex min-h-[290px] flex-col justify-center gap-3 bg-[#f5f6fa] p-4" dir="ltr">
              <div className="rounded-xl border border-border bg-white p-3.5">
                <div className="mb-2 h-2.5 w-24 rounded-full bg-muted" />
                <div className="h-2 w-full rounded-full bg-muted" />
                <div className="mt-1.5 h-2 w-2/3 rounded-full bg-muted" />
              </div>
              <div className="rounded-xl bg-primary p-4 text-white">
                <div className="text-sm font-bold">{d.landing.navShow.demoNav[active]}</div>
                <div className="mt-1 text-[11px] opacity-80" dir="ltr">native://page/{active}</div>
              </div>
            </div>
            {/* the demo bottom nav — click it! */}
            <div className="flex items-end justify-around border-t border-border bg-white px-2 pb-2.5 pt-2">
              {icons.map((Icon, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className="flex flex-col items-center gap-1 px-2 py-1"
                  aria-label={d.landing.navShow.demoNav[i]}
                >
                  <Icon className={cn("size-5", i === active ? "text-primary" : "text-gray-400")} strokeWidth={i === active ? 2.4 : 1.8} />
                  <span className={cn("text-[9px] font-bold", i === active ? "text-primary" : "text-gray-400")}>
                    {d.landing.navShow.demoNav[i]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* cards */}
        <div className="grid gap-3.5 sm:grid-cols-2">
          {[
            { t: d.landing.navShow.bottomNavT, dd: d.landing.navShow.bottomNavD, icon: Navigation },
            { t: d.landing.navShow.drawerT, dd: d.landing.navShow.drawerD, icon: Menu },
            { t: d.landing.navShow.fabT, dd: d.landing.navShow.fabD, icon: QrCode },
            { t: d.landing.navShow.rulesT, dd: d.landing.navShow.rulesD, icon: SlidersHorizontal },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/30">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
                <c.icon className="size-5" />
              </span>
              <h3 className="mt-3 text-[15px] font-bold">{c.t}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{c.dd}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== Pricing ==================== */
function Pricing() {
  const { d } = useLang();
  return (
    <section id="pricing" className="border-y border-border bg-card/60 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHead title={d.landing.pricing.title} subtitle={d.landing.pricing.subtitle} />
        <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-3">
          {d.landing.pricing.plans.map((p, i) => (
            <div
              key={i}
              className={cn(
                "relative flex flex-col rounded-3xl border p-6 shadow-soft transition-all hover:-translate-y-1",
                i === 1 ? "border-primary bg-primary text-white shadow-[0_16px_40px_rgba(109,40,217,0.3)] lg:-my-3 lg:py-9" : "border-border bg-card hover:shadow-pop",
              )}
            >
              {i === 1 && (
                <span className="absolute -top-3.5 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 rounded-full bg-white px-4 py-1 text-[11px] font-bold text-primary shadow-soft">
                  {d.landing.pricing.popular}
                </span>
              )}
              <h3 className={cn("text-lg font-bold", i === 1 ? "text-white" : "")}>{p.name}</h3>
              <div className="mt-2 flex items-end gap-1.5">
                <span className="text-4xl font-bold tracking-tight" dir="ltr">{p.price}</span>
                <span className={cn("pb-1.5 text-xs font-medium", i === 1 ? "text-white/75" : "text-muted-foreground")}>
                  {d.landing.pricing.month}
                </span>
              </div>
              <p className={cn("mt-2 text-[13px]", i === 1 ? "text-white/80" : "text-muted-foreground")}>{p.desc}</p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className={cn("flex items-start gap-2.5 text-[13px] font-medium", i === 1 ? "text-white/95" : "text-foreground/85")}>
                    <Check className={cn("mt-0.5 size-4 shrink-0", i === 1 ? "text-white" : "text-primary")} />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => navigate("#/dashboard")}
                className={cn(
                  "mt-6 h-11 w-full rounded-xl text-[15px] font-bold",
                  i === 1 ? "bg-white text-primary hover:bg-white/90" : "bg-primary text-white hover:bg-primary/90",
                )}
              >
                {p.cta}
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">{d.landing.pricing.note}</p>
      </div>
    </section>
  );
}

/* ==================== FAQ ==================== */
function Faq() {
  const { d } = useLang();
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <SectionHead title={d.landing.faq.title} subtitle="" center />
      <Accordion type="single" collapsible className="mt-8 rounded-2xl border border-border bg-card px-5 shadow-soft">
        {d.landing.faq.items.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border-border/70">
            <AccordionTrigger className="py-4 text-start text-[14.5px] font-bold hover:no-underline [&>svg]:text-primary">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-[13.5px] leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

/* ==================== CTA ==================== */
function Cta() {
  const { d } = useLang();
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-white shadow-[0_20px_50px_rgba(109,40,217,0.35)]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-24 start-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 end-1/4 h-64 w-64 rounded-full bg-purple-300/30 blur-3xl" />
        </div>
        <h2 className="relative text-2xl font-bold md:text-[30px] md:leading-snug">{d.landing.cta.title}</h2>
        <p className="relative mx-auto mt-3 max-w-xl text-sm text-white/85 md:text-[15px]">{d.landing.cta.subtitle}</p>
        <Button
          onClick={() => navigate("#/new")}
          size="lg"
          className="relative mt-7 h-12 rounded-xl bg-white px-8 text-base font-bold text-primary hover:bg-white/90"
        >
          <Rocket className="size-5" />
          {d.landing.cta.btn}
        </Button>
      </div>
    </section>
  );
}

/* ==================== Footer ==================== */
function Footer() {
  const { d } = useLang();
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-6">
        <div>
          <AppifyLogo />
          <p className="mt-3.5 max-w-xs text-[13px] leading-relaxed text-muted-foreground">{d.landing.footer.desc}</p>
        </div>
        {[
          { title: d.landing.footer.product, links: d.landing.footer.productLinks },
          { title: d.landing.footer.resources, links: d.landing.footer.resourcesLinks },
          { title: d.landing.footer.legal, links: d.landing.footer.legalLinks },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-[13px] font-bold">{col.title}</h4>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l}>
                  <span className="cursor-pointer text-[13px] text-muted-foreground transition-colors hover:text-primary">{l}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground md:px-6">
          <span>{d.landing.footer.rights}</span>
          <span>{d.landing.footer.builtNote}</span>
        </div>
      </div>
    </footer>
  );
}

/* ==================== shared section head ==================== */
function SectionHead({ title, subtitle, center }: { title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <h2 className="text-2xl font-bold tracking-tight md:text-[30px] md:leading-snug">{title}</h2>
      {subtitle && <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

/* ==================== Page ==================== */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Flow />
        <Arch />
        <Features />
        <Bridge />
        <NavShow />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
