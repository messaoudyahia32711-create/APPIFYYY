"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy, Languages, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/appify/i18n";
import { useAppifyStore } from "@/lib/appify/store";
import { toast } from "@/hooks/use-toast";

/* ---------- Logo ---------- */
export function AppifyLogo({ size = 34, withText = true }: { size?: number; withText?: boolean }) {
  const { d } = useLang();
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="appify-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2EE6A8" />
            <stop offset="1" stopColor="#8B7CFF" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="60" height="60" rx="16" fill="#0A0A0B" />
        <rect x="2" y="2" width="60" height="60" rx="16" fill="none" stroke="url(#appify-g)" strokeWidth="3" />
        <path d="M20 44 L32 20 L44 44" fill="none" stroke="url(#appify-g)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M26 36 H38" stroke="#2EE6A8" strokeWidth="5" strokeLinecap="round" />
      </svg>
      {withText && (
        <span className="font-display font-extrabold text-xl tracking-tight text-foreground" dir="ltr">
          Appify
        </span>
      )}
      {withText && <span className="sr-only">{d.common.appName}</span>}
    </span>
  );
}

/* ---------- Language toggle ---------- */
export function LangToggle() {
  const { lang, toggleLang } = useLang();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLang}
      className="gap-1.5 rounded-full border-white/10 bg-white/5 hover:bg-white/10"
      aria-label="Switch language"
    >
      <Languages className="size-3.5" />
      <span className="font-semibold text-xs" dir="ltr">
        {lang === "ar" ? "EN" : "عربي"}
      </span>
    </Button>
  );
}

/* ---------- Section card ---------- */
export function SectionCard({
  title,
  desc,
  icon,
  actions,
  children,
  className,
}: {
  title?: string;
  desc?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-white/8 bg-card p-5 md:p-6", className)}>
      {(title || actions) && (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {icon && (
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {icon}
              </span>
            )}
            <div>
              {title && <h3 className="font-display text-base font-bold text-foreground md:text-lg">{title}</h3>}
              {desc && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/* ---------- Toggle row ---------- */
export function ToggleRow({
  label,
  desc,
  checked,
  onChange,
  icon,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3.5 transition-colors hover:bg-white/[0.04]">
      <div className="flex min-w-0 items-center gap-3">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">{label}</div>
          {desc && <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{desc}</div>}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} className="shrink-0" />
    </div>
  );
}

/* ---------- Labeled field ---------- */
export function LabeledField({
  label,
  hint,
  children,
  className,
  dir,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  dir?: "rtl" | "ltr" | "auto";
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      <div dir={dir}>{children}</div>
      {hint && <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ---------- Color field ---------- */
export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 rounded-lg"
          aria-label={label}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 font-mono text-xs"
          dir="ltr"
          maxLength={9}
        />
      </div>
    </div>
  );
}

/* ---------- Code block with copy ---------- */
export function CodeBlock({ code, title }: { code: string; title?: string }) {
  const { d } = useLang();
  const [copied, setCopied] = useState(false);
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    toast({ title: d.toast.copied });
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0C0E11]">
      <div className="flex items-center justify-between border-b border-white/8 px-3.5 py-2">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#FF5F57]" />
          <span className="size-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="size-2.5 rounded-full bg-[#28C840]" />
          {title && <span className="ms-2 text-xs font-medium text-muted-foreground">{title}</span>}
        </div>
        <button
          onClick={doCopy}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-white/8 hover:text-foreground"
          aria-label={d.common.copy}
        >
          {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
          <span>{copied ? d.common.copied : d.common.copy}</span>
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-left font-mono text-[13px] leading-relaxed text-[#C9E8D8]" dir="ltr">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ---------- Save bar ---------- */
export function SaveBar({ dirty, onSave, saving }: { dirty: boolean; onSave: () => void; saving?: boolean }) {
  const { d } = useLang();
  return (
    <div className="sticky bottom-4 z-20 mt-6 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-popover/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <span className={cn("text-sm font-medium", dirty ? "text-amber-400" : "text-muted-foreground")}>
        {dirty ? d.ws.dirty : `✓ ${d.common.saved}`}
      </span>
      <Button onClick={onSave} disabled={!dirty || saving} className="rounded-xl font-semibold">
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        {saving ? d.common.saving : d.common.save}
      </Button>
    </div>
  );
}

/* ---------- App icon badge ---------- */
export function AppIconBadge({ name, icon, size = 44, className }: { name: string; icon?: string; size?: number; className?: string }) {
  const initial = name?.trim()?.[0] ?? "A";
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#2EE6A8] to-[#8B7CFF] font-display font-extrabold text-[#04120C]", className)}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {icon ? (
         
        <img src={icon} alt="" className="size-full object-cover" />
      ) : (
        initial
      )}
    </span>
  );
}

/* ---------- Platform badges ---------- */
export function PlatformChips({ platforms, className }: { platforms: ("android" | "ios")[]; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="inline-flex items-center gap-1 rounded-full bg-white/8 px-2 py-0.5 text-[11px] font-semibold text-foreground">
        <span aria-hidden="true">🤖</span> Android
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-white/8 px-2 py-0.5 text-[11px] font-semibold text-foreground">
        <span aria-hidden="true">🍎</span> iOS
      </span>
    </span>
  );
}

/* ---------- Empty state ---------- */
export function EmptyState({ icon, title, desc, action }: { icon: ReactNode; title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-14 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-white/6 text-muted-foreground">{icon}</span>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      {desc && <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------- Stat card ---------- */
export function StatCard({ label, value, icon }: { label: string; value: ReactNode; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-card p-4 md:p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground md:text-sm">{label}</span>
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      </div>
      <div className="mt-2 font-display text-2xl font-extrabold text-foreground md:text-3xl">{value}</div>
    </div>
  );
}

/* ---------- Page header for panels ---------- */
export function PanelHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-xl font-extrabold text-foreground md:text-2xl">{title}</h2>
      {desc && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>}
    </div>
  );
}
