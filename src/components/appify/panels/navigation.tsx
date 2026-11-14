"use client";

import { useState, createElement } from "react";
import {
  Navigation,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Menu,
  Square,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ColorField, LabeledField, SaveBar, SectionCard, ToggleRow } from "../ui";
import { useLang } from "@/lib/appify/i18n";
import { useAppifyStore } from "@/lib/appify/store";
import { toast } from "@/hooks/use-toast";
import { getIcon, ICON_NAMES } from "@/lib/appify/icons";
import { uid } from "@/lib/appify/defaults";
import type { AppRecord, NavigationConfig, NavItem } from "@/lib/appify/types";
import { cn } from "@/lib/utils";

function IconPicker({ value, onChange, color }: { value: string; onChange: (v: string) => void; color?: string }) {
  const { d } = useLang();
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/5 transition-colors hover:border-primary/40"
          aria-label="pick icon"
        >
          {createElement(getIcon(value), {
            className: "size-5",
            style: { color: color ?? "#2EE6A8" },
          })}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 rounded-2xl border-white/10 bg-popover p-3" side="top">
        <div className="scrollbar-thin grid max-h-56 grid-cols-6 gap-1.5 overflow-y-auto">
          {ICON_NAMES.map((name) => {
            const Icon = getIcon(name);
            return (
              <button
                key={name}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg transition-colors",
                  name === value ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-white/8 hover:text-foreground",
                )}
                aria-label={name}
              >
                <Icon className="size-4.5" />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function NavigationPanel({ app }: { app: AppRecord }) {
  const { d } = useLang();
  const updateApp = useAppifyStore((s) => s.updateApp);

  const [draft, setDraft] = useState<NavigationConfig>(() => JSON.parse(JSON.stringify(app.navigation)));

  const dirty = JSON.stringify(draft) !== JSON.stringify(app.navigation);

  const save = () => {
    updateApp(app.id, (a) => ({ ...a, navigation: draft, updatedAt: Date.now() }));
    toast({ title: d.toast.saved });
  };

  const updateItem = (id: string, patch: Partial<NavItem>) => {
    setDraft((p) => ({ ...p, bottomNavItems: p.bottomNavItems.map((it) => (it.id === id ? { ...it, ...patch } : it)) }));
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    setDraft((p) => {
      const items = [...p.bottomNavItems];
      const target = idx + dir;
      if (target < 0 || target >= items.length) return p;
      [items[idx], items[target]] = [items[target], items[idx]];
      return { ...p, bottomNavItems: items };
    });
  };

  return (
    <div className="space-y-5">
      {/* ===== Bottom nav ===== */}
      <SectionCard title={d.p.navigation.bottomNav} desc={d.p.navigation.bottomNavD} icon={<Navigation className="size-4.5" />}>
        <ToggleRow label={d.p.navigation.enable} checked={draft.bottomNavEnabled} onChange={(v) => setDraft((p) => ({ ...p, bottomNavEnabled: v }))} />

        {draft.bottomNavEnabled && (
          <div className="mt-4 space-y-4">
            {/* live bar preview */}
            <div className="rounded-2xl border border-white/8 p-3" dir="ltr">
              <div
                className="flex items-end justify-around overflow-hidden rounded-t-2xl border-x border-t border-white/8"
                style={{ background: draft.navBgColor, height: draft.navHeight }}
              >
                {draft.bottomNavItems.map((item, i) => {
                  const Icon = getIcon(item.icon);
                  const active = i === 0;
                  return (
                    <div key={item.id} className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1">
                      <Icon className={cn(active && "scale-110")} style={{ width: draft.navIconSize, height: draft.navIconSize, color: active ? draft.navActiveColor : draft.navInactiveColor }} />
                      {draft.navShowLabels && (
                        <span className="max-w-20 truncate text-[10px] font-bold" style={{ color: active ? draft.navActiveColor : draft.navInactiveColor }}>
                          {item.label || "—"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* items */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">{d.p.navigation.items}</span>
              <span className="text-xs text-muted-foreground" dir="ltr">{draft.bottomNavItems.length}/5</span>
            </div>
            <div className="space-y-3">
              {draft.bottomNavItems.map((item, i) => {
                const Icon = getIcon(item.icon);
                return (
                  <div key={item.id} className="flex flex-wrap items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.02] p-3">
                    <IconPicker value={item.icon} onChange={(v) => updateItem(item.id, { icon: v })} />
                    <Input
                      value={item.label}
                      onChange={(e) => updateItem(item.id, { label: e.target.value })}
                      placeholder={d.p.navigation.itemLabel}
                      className="h-10 w-28 flex-1 sm:w-32"
                    />
                    <Input
                      value={item.url}
                      onChange={(e) => updateItem(item.id, { url: e.target.value })}
                      placeholder={d.p.navigation.itemUrl}
                      dir="ltr"
                      className="h-10 min-w-40 flex-[2] font-mono text-xs"
                    />
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground" disabled={i === 0} onClick={() => moveItem(i, -1)} aria-label="up">
                        <ChevronUp className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-foreground" disabled={i === draft.bottomNavItems.length - 1} onClick={() => moveItem(i, 1)} aria-label="down">
                        <ChevronDown className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        onClick={() => setDraft((p) => ({ ...p, bottomNavItems: p.bottomNavItems.filter((it) => it.id !== item.id) }))}
                        aria-label={d.common.remove}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button
              variant="outline"
              disabled={draft.bottomNavItems.length >= 5}
              onClick={() => setDraft((p) => ({ ...p, bottomNavItems: [...p.bottomNavItems, { id: uid(), label: "New", url: app.url, icon: "star" }] }))}
              className="w-full rounded-xl border-dashed border-primary/30 bg-primary/[0.04] font-bold text-primary hover:bg-primary/10"
            >
              <Plus className="size-4" />
              {d.p.navigation.addItem}
              {draft.bottomNavItems.length >= 5 && <span className="text-xs font-normal text-muted-foreground">({d.p.navigation.maxItems})</span>}
            </Button>

            {/* colors & sizes */}
            <div className="border-t border-white/6 pt-4">
              <div className="mb-3 text-sm font-bold">{d.p.navigation.colors}</div>
              <div className="grid gap-4 sm:grid-cols-3">
                <ColorField label={d.p.navigation.navBg} value={draft.navBgColor} onChange={(v) => setDraft((p) => ({ ...p, navBgColor: v }))} />
                <ColorField label={d.p.navigation.navActive} value={draft.navActiveColor} onChange={(v) => setDraft((p) => ({ ...p, navActiveColor: v }))} />
                <ColorField label={d.p.navigation.navInactive} value={draft.navInactiveColor} onChange={(v) => setDraft((p) => ({ ...p, navInactiveColor: v }))} />
              </div>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">{d.p.navigation.iconSize}</span>
                    <span className="text-xs font-bold text-primary" dir="ltr">{draft.navIconSize}px</span>
                  </div>
                  <Slider value={[draft.navIconSize]} onValueChange={(v) => setDraft((p) => ({ ...p, navIconSize: v[0] }))} min={16} max={36} step={1} aria-label={d.p.navigation.iconSize} />
                </div>
                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">{d.p.navigation.navHeight}</span>
                    <span className="text-xs font-bold text-primary" dir="ltr">{draft.navHeight}px</span>
                  </div>
                  <Slider value={[draft.navHeight]} onValueChange={(v) => setDraft((p) => ({ ...p, navHeight: v[0] }))} min={48} max={90} step={1} aria-label={d.p.navigation.navHeight} />
                </div>
              </div>
              <div className="mt-3">
                <ToggleRow label={d.p.navigation.showLabels} checked={draft.navShowLabels} onChange={(v) => setDraft((p) => ({ ...p, navShowLabels: v }))} icon={<Menu className="size-4" />} />
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ===== Visibility rules ===== */}
      {draft.bottomNavEnabled && (
        <SectionCard title={d.p.navigation.visibility} desc={d.p.navigation.visibilityD} icon={<Square className="size-4.5" />}>
          <HidePatternInput
            onAdd={(v) => setDraft((p) => ({ ...p, hideOnPatterns: [...p.hideOnPatterns, v] }))}
          />
          <div className="mt-3 space-y-2">
            {draft.hideOnPatterns.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-muted-foreground" dir="ltr">
                {d.p.navigation.hidePh}
              </p>
            ) : (
              draft.hideOnPatterns.map((pat, i) => (
                <div key={`${pat}-${i}`} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2.5">
                  <code className="font-mono text-sm text-amber-400" dir="ltr">{pat}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setDraft((p) => ({ ...p, hideOnPatterns: p.hideOnPatterns.filter((_, idx) => idx !== i) }))}
                    aria-label={d.common.remove}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      )}

      {/* ===== Drawer ===== */}
      <SectionCard title={d.p.navigation.drawer} desc={d.p.navigation.drawerD} icon={<Menu className="size-4.5" />}>
        <ToggleRow label={d.p.navigation.drawerEnable} checked={draft.drawerEnabled} onChange={(v) => setDraft((p) => ({ ...p, drawerEnabled: v }))} />
        {draft.drawerEnabled && (
          <div className="mt-4 space-y-3">
            <LabeledField label={d.p.navigation.drawerTitle}>
              <Input
                value={draft.drawerTitle}
                onChange={(e) => setDraft((p) => ({ ...p, drawerTitle: e.target.value }))}
                className="h-10"
              />
            </LabeledField>
            <div className="space-y-2.5">
              {draft.drawerItems.map((item) => {
                const Icon = getIcon(item.icon);
                return (
                  <div key={item.id} className="flex flex-wrap items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.02] p-3">
                    <IconPicker value={item.icon} onChange={(v) => setDraft((p) => ({ ...p, drawerItems: p.drawerItems.map((it) => (it.id === item.id ? { ...it, icon: v } : it)) }))} />
                    <Input
                      value={item.label}
                      onChange={(e) => setDraft((p) => ({ ...p, drawerItems: p.drawerItems.map((it) => (it.id === item.id ? { ...it, label: e.target.value } : it)) }))}
                      placeholder={d.p.navigation.itemLabel}
                      className="h-10 w-28 flex-1"
                    />
                    <Input
                      value={item.url}
                      onChange={(e) => setDraft((p) => ({ ...p, drawerItems: p.drawerItems.map((it) => (it.id === item.id ? { ...it, url: e.target.value } : it)) }))}
                      placeholder={d.p.navigation.itemUrl}
                      dir="ltr"
                      className="h-10 min-w-36 flex-[2] font-mono text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => setDraft((p) => ({ ...p, drawerItems: p.drawerItems.filter((it) => it.id !== item.id) }))}
                      aria-label={d.common.remove}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                );
              })}
              <Button
                variant="outline"
                onClick={() => setDraft((p) => ({ ...p, drawerItems: [...p.drawerItems, { id: uid(), label: "Section", url: app.url, icon: "compass" }] }))}
                className="w-full rounded-xl border-dashed border-white/20 bg-white/[0.02] font-semibold text-muted-foreground hover:text-primary"
              >
                <Plus className="size-4" />
                {d.p.navigation.addItem}
              </Button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ===== FAB ===== */}
      <SectionCard title={d.p.navigation.fab} desc={d.p.navigation.fabD} icon={<Plus className="size-4.5" />}>
        <ToggleRow label={d.p.navigation.fabEnable} checked={draft.fabEnabled} onChange={(v) => setDraft((p) => ({ ...p, fabEnabled: v }))} />
        {draft.fabEnabled && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="flex items-end gap-3">
              <IconPicker value={draft.fabIcon} onChange={(v) => setDraft((p) => ({ ...p, fabIcon: v }))} color={draft.fabColor} />
              <LabeledField label={d.p.navigation.fabUrl} className="flex-1">
                <Input
                  value={draft.fabUrl}
                  onChange={(e) => setDraft((p) => ({ ...p, fabUrl: e.target.value }))}
                  dir="ltr"
                  className="h-10 font-mono text-xs"
                />
              </LabeledField>
            </div>
            <ColorField label={d.p.navigation.fabColor} value={draft.fabColor} onChange={(v) => setDraft((p) => ({ ...p, fabColor: v }))} />
            <div className="md:col-span-2">
              <div className="mb-2.5 text-xs font-semibold text-muted-foreground">{d.p.navigation.fabPosition}</div>
              <RadioGroup
                value={draft.fabPosition}
                onValueChange={(v) => setDraft((p) => ({ ...p, fabPosition: v as "start" | "end" }))}
                className="flex gap-3"
              >
                {(
                  [
                    { v: "start", label: d.p.navigation.posStart },
                    { v: "end", label: d.p.navigation.posEnd },
                  ] as const
                ).map((o) => (
                  <label
                    key={o.v}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors",
                      draft.fabPosition === o.v ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 bg-white/[0.02] text-muted-foreground",
                    )}
                  >
                    <RadioGroupItem value={o.v} className="sr-only" />
                    {o.label}
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        )}
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-white/[0.03] px-4 py-3 text-xs text-muted-foreground">
          <Info className="size-3.5 shrink-0 text-primary" />
          {d.p.navigation.bridgeHint}
        </p>
      </SectionCard>

      <SaveBar dirty={dirty} onSave={save} />
    </div>
  );
}

function HidePatternInput({ onAdd }: { onAdd: (v: string) => void }) {
  const { d } = useLang();
  const [val, setVal] = useState("");
  const submit = () => {
    const v = val.trim();
    if (!v) return;
    onAdd(v);
    setVal("");
  };
  return (
    <div className="flex w-full gap-2">
      <Input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={d.p.navigation.hidePh}
        dir="ltr"
        className="h-11 flex-1"
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <Button onClick={submit} className="h-11 rounded-xl bg-primary font-bold text-primary-foreground">
        <Plus className="size-4" />
        {d.p.settings.addRule}
      </Button>
    </div>
  );
}
