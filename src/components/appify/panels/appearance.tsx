"use client";

import { useRef, useState } from "react";
import {
  ImagePlus,
  Palette,
  MonitorSmartphone,
  PanelTop,
  Trash2,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ColorField, LabeledField, SaveBar, SectionCard, ToggleRow, AppIconBadge } from "../ui";
import { useLang } from "@/lib/appify/i18n";
import { useAppifyStore } from "@/lib/appify/store";
import { toast } from "@/hooks/use-toast";
import type { AppRecord, AppStyle } from "@/lib/appify/types";
import { cn } from "@/lib/utils";

export function AppearancePanel({ app }: { app: AppRecord }) {
  const { d } = useLang();
  const updateApp = useAppifyStore((s) => s.updateApp);
  const fileRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState<AppStyle>(() => JSON.parse(JSON.stringify(app.style)));

  const dirty = JSON.stringify(draft) !== JSON.stringify(app.style);

  const save = () => {
    updateApp(app.id, (a) => ({ ...a, style: draft, updatedAt: Date.now() }));
    toast({ title: d.toast.saved });
  };

  const onIconFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 512;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const side = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        const dataUrl = canvas.toDataURL("image/png");
        updateApp(app.id, (a) => ({ ...a, icon: dataUrl, updatedAt: Date.now() }));
        toast({ title: d.toast.saved });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      {/* icon */}
      <SectionCard title={d.p.appearance.iconSection} icon={<ImagePlus className="size-4.5" />}>
        <div className="flex items-center gap-5">
          <AppIconBadge name={app.name} icon={app.icon} size={64} className="shadow-xl" />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onIconFile(f); }} />
          <Button variant="outline" size="sm" className="rounded-xl border-white/12 bg-white/5" onClick={() => fileRef.current?.click()}>
            <ImagePlus className="size-4 text-primary" />
            {d.p.appearance.iconUpload}
          </Button>
          {app.icon && (
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg border-white/12 bg-white/5 hover:text-destructive"
              onClick={() => updateApp(app.id, (a) => ({ ...a, icon: undefined, updatedAt: Date.now() }))}
              aria-label={d.p.appearance.iconRemove}
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </SectionCard>

      {/* splash */}
      <SectionCard title={d.p.appearance.splashSection} icon={<Wand2 className="size-4.5" />}>
        <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
          {/* live splash preview */}
          <div
            className="flex h-40 w-64 flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 shadow-inner"
            style={{ background: draft.splashBg }}
          >
            <AppIconBadge name={app.name} icon={app.icon} size={56} />
            <span className="font-display text-sm font-bold" style={{ color: draft.splashLogoColor }}>
              {app.name}
            </span>
          </div>
          <div className="grid content-start gap-4 sm:grid-cols-2">
            <ColorField label={d.p.appearance.splashBg} value={draft.splashBg} onChange={(v) => setDraft((p) => ({ ...p, splashBg: v }))} />
            <ColorField label={d.p.appearance.splashLogo} value={draft.splashLogoColor} onChange={(v) => setDraft((p) => ({ ...p, splashLogoColor: v }))} />
            <div className="sm:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{d.p.appearance.splashDuration}</span>
                <span className="rounded-full bg-primary/12 px-3 py-1 text-xs font-bold text-primary" dir="ltr">
                  {(draft.splashDuration / 1000).toFixed(1)}s
                </span>
              </div>
              <Slider
                value={[draft.splashDuration]}
                onValueChange={(v) => setDraft((p) => ({ ...p, splashDuration: v[0] }))}
                min={400}
                max={4000}
                step={100}
                aria-label={d.p.appearance.splashDuration}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* colors & app bar */}
      <SectionCard title={d.p.appearance.colorsSection} icon={<Palette className="size-4.5" />}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ColorField label={d.p.appearance.statusBarColor} value={draft.statusBarColor} onChange={(v) => setDraft((p) => ({ ...p, statusBarColor: v }))} />
          <ColorField label={d.p.appearance.appBg} value={draft.appBgColor} onChange={(v) => setDraft((p) => ({ ...p, appBgColor: v }))} />
          <ColorField label={d.p.appearance.appBarColor} value={draft.appBarColor} onChange={(v) => setDraft((p) => ({ ...p, appBarColor: v }))} />
        </div>
        <div className="mt-4">
          <div className="mb-2.5 text-xs font-semibold text-muted-foreground">{d.p.appearance.statusBarContent}</div>
          <RadioGroup
            value={draft.statusBarContent}
            onValueChange={(v) => setDraft((p) => ({ ...p, statusBarContent: v as "dark" | "light" }))}
            className="flex gap-3"
          >
            {(["dark", "light"] as const).map((v) => (
              <label
                key={v}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors",
                  draft.statusBarContent === v ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 bg-white/[0.02] text-muted-foreground",
                )}
              >
                <RadioGroupItem value={v} className="sr-only" />
                <span className="size-4 rounded-full border-2" style={{ background: draft.statusBarColor, borderColor: v === "dark" ? "#111" : "#fff" }} />
                {v === "dark" ? d.p.appearance.contentDark : d.p.appearance.contentLight}
              </label>
            ))}
          </RadioGroup>
        </div>
        <div className="mt-5 space-y-3 border-t border-white/6 pt-5">
          <ToggleRow
            label={d.p.appearance.appBarEnable}
            checked={draft.appBarEnabled}
            onChange={(v) => setDraft((p) => ({ ...p, appBarEnabled: v }))}
            icon={<PanelTop className="size-4" />}
          />
          {draft.appBarEnabled && (
            <LabeledField label={d.p.appearance.appBarTitle}>
              <Input
                value={draft.appBarTitle}
                onChange={(e) => setDraft((p) => ({ ...p, appBarTitle: e.target.value }))}
                className="h-11"
                placeholder={app.name}
              />
            </LabeledField>
          )}
        </div>
      </SectionCard>

      {/* screen */}
      <SectionCard title={d.p.appearance.screenSection} icon={<MonitorSmartphone className="size-4.5" />}>
        <div className="space-y-5">
          <div>
            <div className="mb-2.5 text-xs font-semibold text-muted-foreground">{d.p.appearance.orientation}</div>
            <RadioGroup
              value={draft.orientation}
              onValueChange={(v) => setDraft((p) => ({ ...p, orientation: v as AppStyle["orientation"] }))}
              className="flex gap-3"
            >
              {(
                [
                  { v: "portrait", label: d.p.appearance.portrait },
                  { v: "landscape", label: d.p.appearance.landscape },
                  { v: "auto", label: d.p.appearance.auto },
                ] as const
              ).map((o) => (
                <label
                  key={o.v}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors",
                    draft.orientation === o.v ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 bg-white/[0.02] text-muted-foreground",
                  )}
                >
                  <RadioGroupItem value={o.v} className="sr-only" />
                  {o.label}
                </label>
              ))}
            </RadioGroup>
          </div>
          <ToggleRow label={d.p.appearance.fullscreen} desc={d.p.appearance.fullscreenD} checked={draft.fullscreen} onChange={(v) => setDraft((p) => ({ ...p, fullscreen: v }))} />
          <div>
            <div className="mb-2.5 text-xs font-semibold text-muted-foreground">{d.p.appearance.themeMode}</div>
            <RadioGroup
              value={draft.theme}
              onValueChange={(v) => setDraft((p) => ({ ...p, theme: v as AppStyle["theme"] }))}
              className="flex gap-3"
            >
              {(
                [
                  { v: "light", label: d.p.appearance.themeLight },
                  { v: "dark", label: d.p.appearance.themeDark },
                  { v: "auto", label: d.p.appearance.themeAuto },
                ] as const
              ).map((o) => (
                <label
                  key={o.v}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors",
                    draft.theme === o.v ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 bg-white/[0.02] text-muted-foreground",
                  )}
                >
                  <RadioGroupItem value={o.v} className="sr-only" />
                  {o.label}
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>
        <p className="mt-5 flex items-center gap-2 rounded-xl bg-primary/[0.06] px-4 py-3 text-xs font-semibold text-primary">
          <Wand2 className="size-3.5" />
          {d.p.appearance.applyNote}
        </p>
        <SaveBar dirty={dirty} onSave={save} />
      </SectionCard>
    </div>
  );
}
