"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Link2,
  SlidersHorizontal,
  Smartphone,
  Hammer,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AppifyLogo, LangToggle } from "./ui";
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/6 bg-[#0A0A0B]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <button onClick={() => navigate("#/")} aria-label="Appify home">
          <AppifyLogo />
        </button>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.map((l) => (
            <button
              key={l.target}
              onClick={() => scrollToSection(l.target)}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/6 hover:text-foreground"
            >
              {l.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LangToggle />
          <Button
            onClick={() => navigate("#/dashboard")}
            className="hidden rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90 sm:inline-flex"
          >
            {d.landing.nav.gotoDash}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((p) => !p)}
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>
      {open && (
        <div className="border-t border-white/8 bg-[#0A0A0B]/95 px-4 py-3 lg:hidden">
          {links.map((l) => (
            <button
              key={l.target}
              onClick={() => {
                setOpen(false);
                scrollToSection(l.target);
              }}
              className="block w-full rounded-lg px-3 py-2.5 text-start text-sm font-medium text-muted-foreground hover:bg-white/6 hover:text-foreground"
            >
              {l.label}
            </button>
          ))}
          <Button onClick={() => navigate("#/dashboard")} className="mt-2 w-full rounded-xl">
            {d.landing.nav.gotoDash}
          </Button>
        </div>
      )}
    </header>
  );
}

/* ==================== Decorative hero phone ==================== */
function HeroPhone() {
  const { d, lang } = useLang();
  const demoNav = d.landing.navShow.demoNav;
  const [active, setActive] = useState(0);
  const navIcons = [Navigation, Store, Search, UserRound];
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  return (
    <div className="relative mx-auto w-[290px] sm:w-[320px]" dir="ltr">
      {/* glow */}
      <div className="absolute -inset-8 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(46,230,168,0.16),transparent)] blur-2xl" />
      <div className="animate-float-slow relative rounded-[2.6rem] border border-white/15 bg-[#0E0F12] p-2.5 shadow-2xl">
        <div className="overflow-hidden rounded-[2.1rem] bg-[#101114]">
          {/* status bar */}
          <div className="flex items-center justify-between px-5 pt-3 pb-1" dir="ltr">
            <span className="text-[10px] font-semibold text-white/85">9:41</span>
            <span className="h-4 w-16 rounded-full bg-black" />
            <span className="flex items-center gap-1 text-[10px] text-white/85">
              <span className="h-2 w-3 rounded-[2px] border border-white/60" />
            </span>
          </div>
          {/* mini app bar */}
          <div className="mx-3 mt-2 flex items-center justify-between rounded-xl bg-white/6 px-3 py-2">
            <span className="text-[11px] font-bold text-white/90">{d.landing.hero.phoneApp}</span>
            <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">{d.landing.hero.phoneUrl}</span>
          </div>
          {/* content skeleton */}
          <div className="space-y-2.5 px-4 py-3">
            <div className="h-16 rounded-xl bg-gradient-to-br from-[#17342A] to-[#1A1A2E] p-3">
              <div className="h-2 w-24 rounded-full bg-white/25" />
              <div className="mt-2 h-2 w-32 rounded-full bg-white/15" />
              <div className="mt-3 h-4 w-16 rounded-md bg-primary/70" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="h-14 rounded-xl bg-white/7" />
              <div className="h-14 rounded-xl bg-white/7" />
              <div className="h-14 rounded-xl bg-white/7" />
              <div className="h-14 rounded-xl bg-white/7" />
            </div>
          </div>
          {/* native bottom nav */}
          <div className="flex items-center justify-around border-t border-white/8 bg-[#0B0D10] px-2 py-2.5" dir={lang === "ar" ? "rtl" : "ltr"}>
            {demoNav.map((label, i) => {
              const Icon = navIcons[i] ?? Navigation;
              return (
                <button
                  key={label}
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 transition-colors",
                    active === i ? "text-[#2EE6A8]" : "text-white/45",
                  )}
                >
                  <Icon className="size-4.5" strokeWidth={active === i ? 2.4 : 1.8} />
                  <span className="text-[9px] font-semibold">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {/* floating chips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="animate-float absolute -start-8 top-14 hidden items-center gap-2 rounded-2xl border border-white/12 bg-[#121316]/95 px-3 py-2.5 shadow-xl backdrop-blur sm:flex"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Bell className="size-4" />
        </span>
        <div>
          <div className="text-[11px] font-bold text-white">{d.landing.hero.phoneChip1}</div>
          <div className="text-[9px] text-white/55">Firebase · FCM</div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="animate-float-slow absolute -end-6 bottom-24 hidden items-center gap-2 rounded-2xl border border-white/12 bg-[#121316]/95 px-3 py-2.5 shadow-xl backdrop-blur sm:flex"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <span className="flex size-8 items-center justify-center rounded-xl bg-[#8B7CFF]/20 text-[#A99BFF]">
          <Fingerprint className="size-4" />
        </span>
        <div>
          <div className="text-[11px] font-bold text-white">{d.landing.hero.phoneChip2}</div>
          <div className="text-[9px] text-white/55">Face ID · Fingerprint</div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute -bottom-4 start-1/2 -translate-x-1/2 rounded-full border border-primary/30 bg-[#0E1412]/95 px-4 py-1.5 text-[11px] font-bold text-primary shadow-lg backdrop-blur"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <Arrow className="me-1 inline size-3.5" />
        {d.landing.hero.phoneChip3}
      </motion.div>
    </div>
  );
}

/* ==================== Hero ==================== */
function Hero() {
  const { d, lang } = useLang();
  return (
    <section className="bg-hero-glow relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(75%_60%_at_50%_35%,black,transparent)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:px-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="text-center lg:text-start"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1.5 text-xs font-bold text-primary">
            <SparklesIcon />
            {d.landing.hero.badge}
          </span>
          <h1 className="mt-5 font-display text-4xl leading-[1.25] font-extrabold text-foreground sm:text-5xl md:text-[3.4rem]">
            {d.landing.hero.titleA}{" "}
            <span className="text-gradient">{d.landing.hero.titleB}</span>{" "}
            {d.landing.hero.titleC}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg lg:mx-0">
            {d.landing.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Button
              size="lg"
              onClick={() => navigate("#/new")}
              className="glow-neon rounded-xl bg-primary px-7 text-base font-bold text-primary-foreground hover:bg-[#3CF0B5]"
            >
              <Rocket className="size-4.5" />
              {d.landing.hero.ctaPrimary}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("#/dashboard")}
              className="rounded-xl border-white/15 bg-white/5 px-6 text-base font-semibold hover:bg-white/10"
            >
              <MonitorSmartphone className="size-4.5" />
              {d.landing.hero.ctaSecondary}
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">{d.landing.hero.trust}</p>
          {/* stats */}
          <div className="mt-10 grid grid-cols-3 gap-3 text-center lg:text-start">
            {[
              { v: d.landing.hero.stat1v, t: d.landing.hero.stat1t },
              { v: d.landing.hero.stat2v, t: d.landing.hero.stat2t },
              { v: d.landing.hero.stat3v, t: d.landing.hero.stat3t },
            ].map((s) => (
              <div key={s.t} className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-4">
                <div className="font-display text-xl font-extrabold text-primary md:text-2xl" dir="ltr">
                  {s.v}
                </div>
                <div className="mt-1 text-[11px] font-medium text-muted-foreground md:text-xs">{s.t}</div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.15 }}
        >
          <HeroPhone />
        </motion.div>
      </div>
    </section>
  );
}

function SparklesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l2.1 6.1L20 10l-5.9 1.9L12 18l-2.1-6.1L4 10l5.9-1.9L12 2z" fill="currentColor" />
    </svg>
  );
}

/* ==================== Flow (7 steps) ==================== */
function FlowSection() {
  const { d, lang } = useLang();
  const icons = [Globe, Link2, SlidersHorizontal, Smartphone, Hammer, MonitorSmartphone, Rocket];
  return (
    <section id="how" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold md:text-4xl">{d.landing.flow.title}</h2>
          <p className="mt-3 text-muted-foreground md:text-lg">{d.landing.flow.subtitle}</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {d.landing.flow.steps.map((step, i) => {
            const Icon = icons[i] ?? Rocket;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.07 }}
                className="group relative rounded-2xl border border-white/8 bg-card p-5 transition-colors hover:border-primary/30"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-display text-3xl font-extrabold text-white/8" dir="ltr">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-base font-bold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                {i < d.landing.flow.steps.length - 1 && (
                  <span className="absolute top-1/2 -end-2.5 hidden -translate-y-1/2 text-white/15 lg:block" aria-hidden="true">
                    {lang === "ar" ? "◀" : "▶"}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ==================== Architecture ==================== */
function ArchSection() {
  const { d, lang } = useLang();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-extrabold md:text-4xl">{d.landing.arch.title}</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground md:text-lg">{d.landing.arch.subtitle}</p>
        </div>
        <div className="mt-12 grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
          {/* website box */}
          <div className="rounded-3xl border border-white/10 bg-card p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-white/8 text-foreground">
                <Globe className="size-5" />
              </span>
              <h3 className="font-display text-lg font-bold">{d.landing.arch.websiteBox}</h3>
            </div>
            <ul className="mt-5 space-y-2.5">
              {d.landing.arch.websiteItems.map((it) => (
                <li key={it} className="flex items-center gap-2.5 rounded-xl border border-white/6 bg-white/[0.03] px-3.5 py-2.5 text-sm">
                  <span className="size-1.5 rounded-full bg-muted-foreground" />
                  {it}
                </li>
              ))}
            </ul>
          </div>
          {/* arrow */}
          <div className="flex flex-col items-center gap-1 text-primary">
            <div className="hidden h-px w-16 bg-gradient-to-r from-transparent via-primary/50 to-transparent lg:block" />
            <span className="flex size-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 glow-neon">
              <Arrow className="size-5" />
            </span>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">Live</span>
          </div>
          {/* app box */}
          <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-[#0E1A15] to-[#12121C] p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Smartphone className="size-5" />
              </span>
              <h3 className="font-display text-lg font-bold">{d.landing.arch.appBox}</h3>
            </div>
            <ul className="mt-5 space-y-2.5">
              {d.landing.arch.appItems.map((it) => (
                <li key={it} className="flex items-center gap-2.5 rounded-xl border border-primary/12 bg-primary/[0.06] px-3.5 py-2.5 text-sm font-medium">
                  <CheckCircle2 className="size-4 text-primary" />
                  {it}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* 3 points */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { t: d.landing.arch.point1t, dd: d.landing.arch.point1d, icon: RefreshCcw },
            { t: d.landing.arch.point2t, dd: d.landing.arch.point2d, icon: Palette },
            { t: d.landing.arch.point3t, dd: d.landing.arch.point3d, icon: Bell },
          ].map((p) => (
            <div key={p.t} className="rounded-2xl border border-white/8 bg-card p-5">
              <p className="flex size-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <p.icon className="size-4.5" />
              </p>
              <h4 className="mt-3 font-display font-bold">{p.t}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.dd}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== Features grid ==================== */
function FeaturesSection() {
  const { d } = useLang();
  const icons = [Layers, Bell, Navigation, Menu, MessageSquareCode, Fingerprint, Link2, Camera, Palette, BadgeDollarSign, BarChart3, PackageCheck];
  return (
    <section id="features" className="bg-hero-glow py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold md:text-4xl">{d.landing.features.title}</h2>
          <p className="mt-3 text-muted-foreground md:text-lg">{d.landing.features.subtitle}</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {d.landing.features.items.map((f, i) => {
            const Icon = icons[i] ?? Layers;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: (i % 4) * 0.06 }}
                className="group rounded-2xl border border-white/8 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_10px_40px_rgba(46,230,168,0.07)]"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-[15px] font-bold">{f.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ==================== JS Bridge section ==================== */
function BridgeSection() {
  const { d, lang } = useLang();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const code = `// داخل صفحة الدفع في موقعك — Inside your checkout page
AppifyBridge.startBiometricAuthentication({
  title: "تأكيد الدفع",
}).then((result) => {
  if (result.success) {
    completePayment(result.method); // fingerprint / face
  }
});

// فتح ماسح QR أصلي — Native QR scanner
AppifyBridge.openQRScanner({ onResult: (code) => applyCoupon(code) });

// تحديث شريط التنقل أثناء التشغيل — Runtime nav update
AppifyBridge.updateBottomNavigationBar({
  items: [
    { label: "Home", url: "/", icon: "home" },
    { label: "Offers", url: "/offers", icon: "percent" },
  ],
  activeColor: "#2EE6A8",
});`;
  return (
    <section id="bridge" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-extrabold md:text-4xl">{d.landing.bridge.title}</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground md:text-lg">{d.landing.bridge.subtitle}</p>
        </div>
        {/* flow diagram */}
        <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-3 md:flex-row md:justify-center">
          {[
            { label: d.landing.bridge.flowWeb, cls: "border-white/15 bg-card" },
            { label: d.landing.bridge.flowBridge, cls: "border-primary/40 bg-primary/10 text-primary" },
            { label: d.landing.bridge.flowNative, cls: "border-white/15 bg-card" },
          ].map((node, i) => (
            <div key={node.label} className="flex items-center gap-3">
              <span className={cn("rounded-2xl border px-5 py-3 font-display text-sm font-bold", node.cls)}>
                {node.label}
              </span>
              {i < 2 && <Arrow className="size-5 shrink-0 text-primary/70" />}
            </div>
          ))}
        </div>
        <div className="mt-10 grid items-start gap-6 lg:grid-cols-2">
          <div>
            <div className="rounded-2xl border border-white/8 bg-card p-5">
              <h3 className="font-display font-bold">{d.landing.bridge.codeTitle}</h3>
            </div>
            <div className="mt-3">
              <CodeHero code={code} />
            </div>
            <Button
              onClick={() => navigate("#/dashboard")}
              variant="outline"
              className="mt-4 w-full rounded-xl border-primary/25 bg-primary/8 font-semibold text-primary hover:bg-primary/15"
            >
              <MessageSquareCode className="size-4" />
              {d.landing.bridge.tryLabel}
            </Button>
          </div>
          <div className="rounded-2xl border border-white/8 bg-card p-5">
            <h3 className="mb-4 font-display font-bold">{d.landing.bridge.methodsTitle}</h3>
            <div className="scrollbar-thin max-h-[420px] space-y-2 overflow-y-auto pe-1">
              {d.landing.bridge.methods.map((m) => (
                <div key={m.name} className="rounded-xl border border-white/6 bg-white/[0.02] px-3.5 py-2.5 transition-colors hover:border-primary/25">
                  <code className="block text-left font-mono text-xs font-bold text-primary" dir="ltr">
                    {m.name}
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

function CodeHero({ code }: { code: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0C0E11]">
      <div className="flex items-center gap-1.5 border-b border-white/8 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#FF5F57]" />
        <span className="size-2.5 rounded-full bg-[#FFBD2E]" />
        <span className="size-2.5 rounded-full bg-[#28C840]" />
        <span className="ms-2 text-[11px] font-medium text-muted-foreground" dir="ltr">app-bridge.js</span>
      </div>
      <pre className="overflow-x-auto p-5 text-left font-mono text-xs leading-relaxed text-[#BFE9D6]" dir="ltr">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ==================== Navigation showcase ==================== */
function NavShowcaseSection() {
  const { d, lang } = useLang();
  const [active, setActive] = useState(0);
  const icons = [Navigation, Store, Search, UserRound];
  const items = d.landing.navShow.demoNav;
  const cards = [
    { t: d.landing.navShow.bottomNavT, dd: d.landing.navShow.bottomNavD, icon: Navigation },
    { t: d.landing.navShow.drawerT, dd: d.landing.navShow.drawerD, icon: Menu },
    { t: d.landing.navShow.fabT, dd: d.landing.navShow.fabD, icon: Plus },
    { t: d.landing.navShow.rulesT, dd: d.landing.navShow.rulesD, icon: EyeOff },
  ];
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold md:text-4xl">{d.landing.navShow.title}</h2>
          <p className="mt-3 text-muted-foreground md:text-lg">{d.landing.navShow.subtitle}</p>
        </div>
        <div className="mt-12 grid items-center gap-8 lg:grid-cols-[auto_1fr]">
          {/* interactive phone */}
          <div className="mx-auto w-[270px]" dir="ltr">
            <div className="rounded-[2.2rem] border border-white/15 bg-[#0E0F12] p-2 shadow-2xl">
              <div className="overflow-hidden rounded-[1.9rem] bg-[#F5F6F8]" dir={lang === "ar" ? "rtl" : "ltr"}>
                <div className="p-4">
                  <div className="h-3 w-28 rounded-full bg-black/15" />
                  <div className="mt-3 h-24 rounded-xl bg-gradient-to-br from-[#2EE6A8]/25 to-[#8B7CFF]/20" />
                  <div className="mt-3 grid grid-cols-2 gap-2.5">
                    <div className="h-16 rounded-xl bg-black/6" />
                    <div className="h-16 rounded-xl bg-black/6" />
                  </div>
                  <div className="mt-3 h-8 rounded-xl bg-black/6" />
                </div>
                <div className="flex items-center justify-around border-t border-black/8 bg-white px-2 py-2.5">
                  {items.map((label, i) => {
                    const Icon = icons[i] ?? Navigation;
                    return (
                      <button
                        key={label}
                        onClick={() => setActive(i)}
                        className={cn(
                          "flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 transition-all",
                          active === i ? "text-[#0A8F63]" : "text-black/40 hover:text-black/70",
                        )}
                      >
                        <Icon className="size-5" strokeWidth={active === i ? 2.5 : 1.8} />
                        <span className={cn("text-[10px] font-bold", active === i && "scale-105")}>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">↓ {d.landing.navShow.bottomNavT}</p>
          </div>
          {/* cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((c) => (
              <div key={c.t} className="rounded-2xl border border-white/8 bg-card p-5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <c.icon className="size-5" />
                </span>
                <h3 className="mt-3.5 font-display font-bold">{c.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.dd}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Plus(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={props.className} aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function EyeOff(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className} aria-hidden="true">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

/* ==================== Pricing ==================== */
function PricingSection() {
  const { d } = useLang();
  return (
    <section id="pricing" className="bg-hero-glow py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold md:text-4xl">{d.landing.pricing.title}</h2>
          <p className="mt-3 text-muted-foreground md:text-lg">{d.landing.pricing.subtitle}</p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {d.landing.pricing.plans.map((plan, i) => {
            const featured = i === 1;
            return (
              <div
                key={plan.name}
                className={cn(
                  "relative rounded-3xl border p-6 md:p-7",
                  featured
                    ? "animate-pulse-glow border-primary/40 bg-gradient-to-b from-[#0F1D17] to-[#101018]"
                    : "border-white/8 bg-card",
                )}
              >
                {featured && (
                  <span className="absolute -top-3.5 start-1/2 -translate-x-1/2 rounded-full bg-primary px-3.5 py-1 text-xs font-extrabold text-primary-foreground">
                    {d.landing.pricing.popular}
                  </span>
                )}
                <h3 className="font-display text-lg font-bold">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-extrabold" dir="ltr">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{d.landing.pricing.month}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>
                <ul className="mt-5 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className={cn("mt-0.5 size-4 shrink-0", featured ? "text-primary" : "text-muted-foreground")} />
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => navigate("#/new")}
                  className={cn(
                    "mt-6 w-full rounded-xl font-bold",
                    featured
                      ? "glow-neon bg-primary text-primary-foreground hover:bg-[#3CF0B5]"
                      : "border border-white/12 bg-white/5 hover:bg-white/10",
                  )}
                  variant={featured ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </div>
            );
          })}
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground">{d.landing.pricing.note}</p>
      </div>
    </section>
  );
}

/* ==================== FAQ ==================== */
function FaqSection() {
  const { d } = useLang();
  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold md:text-4xl">{d.landing.faq.title}</h2>
        <Accordion type="single" collapsible className="mt-10 space-y-3">
          {d.landing.faq.items.map((item, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="rounded-2xl border border-white/8 bg-card px-5 last:border-b"
            >
              <AccordionTrigger className="py-4 text-start font-display text-[15px] font-bold hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ==================== CTA band ==================== */
function CtaBand() {
  const { d } = useLang();
  return (
    <section className="px-4 pb-16 md:px-6 md:pb-24">
      <div className="bg-grid relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-[#0D1C16] via-[#0E0E14] to-[#12101F] px-6 py-14 text-center md:py-16">
        <div className="absolute -top-20 start-1/2 h-56 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <h2 className="relative font-display text-3xl font-extrabold md:text-4xl">{d.landing.cta.title}</h2>
        <p className="relative mx-auto mt-3 max-w-xl text-muted-foreground">{d.landing.cta.subtitle}</p>
        <Button
          size="lg"
          onClick={() => navigate("#/new")}
          className="glow-neon relative mt-8 rounded-xl bg-primary px-8 text-base font-bold text-primary-foreground hover:bg-[#3CF0B5]"
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
  const cols = [
    { title: d.landing.footer.product, links: d.landing.footer.productLinks, targets: ["how", "features", "pricing", "faq"] },
    { title: d.landing.footer.resources, links: d.landing.footer.resourcesLinks, targets: ["how", "bridge", "how", "how"] },
    { title: d.landing.footer.legal, links: d.landing.footer.legalLinks, targets: ["faq", "faq", "faq"] },
  ];
  return (
    <footer className="mt-auto border-t border-white/8 bg-[#08080A]">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <AppifyLogo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">{d.landing.footer.desc}</p>
            <span className="mt-4 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-muted-foreground">
              {d.landing.footer.builtNote}
            </span>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-bold">{col.title}</h4>
              <ul className="mt-3.5 space-y-2.5">
                {col.links.map((l, i) => (
                  <li key={l}>
                    <button
                      onClick={() => scrollToSection(col.targets[i] ?? "how")}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/6 pt-6 text-xs text-muted-foreground md:flex-row">
          <span>{d.landing.footer.rights}</span>
          <span className="flex items-center gap-1.5">
            <QrCode className="size-3.5" />
            Appify — {d.common.tagline}
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ==================== Page ==================== */
export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <FlowSection />
        <ArchSection />
        <FeaturesSection />
        <BridgeSection />
        <NavShowcaseSection />
        <PricingSection />
        <FaqSection />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
