"use client";

import { useState } from "react";
import {
  ZoomIn,
  TextCursorInput,
  AppWindow,
  RefreshCcw,
  CameraOff,
  Layers,
  Database,
  PlayCircle,
  Camera,
  Mic,
  MapPin,
  FileUp,
  FileDown,
  Vibrate,
  ScanLine,
  Link2,
  Plus,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SectionCard, ToggleRow } from "../ui";
import { useLang } from "@/lib/appify/i18n";
import { useAppifyStore } from "@/lib/appify/store";
import { toast } from "@/hooks/use-toast";
import type { AppRecord } from "@/lib/appify/types";

export function SettingsPanel({ app }: { app: AppRecord }) {
  const { d } = useLang();
  const updateApp = useAppifyStore((s) => s.updateApp);
  const [newPattern, setNewPattern] = useState("");

  const set = <K extends keyof AppRecord["settings"]>(key: K, value: AppRecord["settings"][K]) => {
    updateApp(app.id, (a) => ({ ...a, settings: { ...a.settings, [key]: value }, updatedAt: Date.now() }));
  };

  const addPattern = () => {
    const p = newPattern.trim();
    if (!p) return;
    set("externalUrlPatterns", [...app.settings.externalUrlPatterns, p]);
    setNewPattern("");
    toast({ title: d.toast.saved });
  };

  const removePattern = (idx: number) => {
    set(
      "externalUrlPatterns",
      app.settings.externalUrlPatterns.filter((_, i) => i !== idx),
    );
  };

  return (
    <div className="space-y-5">
      <SectionCard title={d.p.settings.gInteractions} desc={d.p.settings.gInteractionsD} icon={<RefreshCcw className="size-4.5" />}>
        <div className="grid gap-3 lg:grid-cols-2">
          <ToggleRow label={d.p.settings.zoom} desc={d.p.settings.zoomD} checked={app.settings.zoom} onChange={(v) => set("zoom", v)} icon={<ZoomIn className="size-4" />} />
          <ToggleRow label={d.p.settings.textSelection} desc={d.p.settings.textSelectionD} checked={app.settings.textSelection} onChange={(v) => set("textSelection", v)} icon={<TextCursorInput className="size-4" />} />
          <ToggleRow label={d.p.settings.popups} desc={d.p.settings.popupsD} checked={app.settings.popups} onChange={(v) => set("popups", v)} icon={<AppWindow className="size-4" />} />
          <ToggleRow label={d.p.settings.pullToRefresh} desc={d.p.settings.pullToRefreshD} checked={app.settings.pullToRefresh} onChange={(v) => set("pullToRefresh", v)} icon={<RefreshCcw className="size-4" />} />
        </div>
      </SectionCard>

      <SectionCard title={d.p.settings.gPrivacy} icon={<CameraOff className="size-4.5" />}>
        <div className="grid gap-3 lg:grid-cols-2">
          <ToggleRow label={d.p.settings.screenshotBlocking} desc={d.p.settings.screenshotBlockingD} checked={app.settings.screenshotBlocking} onChange={(v) => set("screenshotBlocking", v)} icon={<CameraOff className="size-4" />} />
          <ToggleRow label={d.p.settings.secureSwitcher} desc={d.p.settings.secureSwitcherD} checked={app.settings.secureSwitcher} onChange={(v) => set("secureSwitcher", v)} icon={<Layers className="size-4" />} />
        </div>
      </SectionCard>

      <SectionCard title={d.p.settings.gPerf} icon={<Database className="size-4.5" />}>
        <div className="space-y-4">
          <ToggleRow label={d.p.settings.caching} desc={d.p.settings.cachingD} checked={app.settings.caching} onChange={(v) => set("caching", v)} icon={<Database className="size-4" />} />
          <div className="rounded-xl border border-white/6 bg-white/[0.02] px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">{d.p.settings.cacheTtl}</span>
              <span className="rounded-full bg-primary/12 px-3 py-1 text-xs font-bold text-primary" dir="ltr">
                {app.settings.cacheTtl} {d.common.hours}
              </span>
            </div>
            <Slider
              value={[app.settings.cacheTtl]}
              onValueChange={(v) => set("cacheTtl", v[0])}
              min={1}
              max={168}
              step={1}
              className="mt-1"
              aria-label={d.p.settings.cacheTtl}
            />
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground" dir="ltr">
              <span>1h</span>
              <span>168h</span>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title={d.p.settings.gMedia} icon={<Camera className="size-4.5" />}>
        <div className="grid gap-3 lg:grid-cols-2">
          <ToggleRow label={d.p.settings.autoplay} desc={d.p.settings.autoplayD} checked={app.settings.autoplayMedia} onChange={(v) => set("autoplayMedia", v)} icon={<PlayCircle className="size-4" />} />
          <ToggleRow label={d.p.settings.camera} desc={d.p.settings.cameraD} checked={app.settings.camera} onChange={(v) => set("camera", v)} icon={<Camera className="size-4" />} />
          <ToggleRow label={d.p.settings.microphone} desc={d.p.settings.microphoneD} checked={app.settings.microphone} onChange={(v) => set("microphone", v)} icon={<Mic className="size-4" />} />
          <ToggleRow label={d.p.settings.location} desc={d.p.settings.locationD} checked={app.settings.location} onChange={(v) => set("location", v)} icon={<MapPin className="size-4" />} />
          <ToggleRow label={d.p.settings.fileUpload} desc={d.p.settings.fileUploadD} checked={app.settings.fileUpload} onChange={(v) => set("fileUpload", v)} icon={<FileUp className="size-4" />} />
          <ToggleRow label={d.p.settings.fileDownload} desc={d.p.settings.fileDownloadD} checked={app.settings.fileDownload} onChange={(v) => set("fileDownload", v)} icon={<FileDown className="size-4" />} />
          <ToggleRow label={d.p.settings.vibration} desc={d.p.settings.vibrationD} checked={app.settings.vibration} onChange={(v) => set("vibration", v)} icon={<Vibrate className="size-4" />} />
          <ToggleRow label={d.p.settings.qrScanner} desc={d.p.settings.qrScannerD} checked={app.settings.qrScanner} onChange={(v) => set("qrScanner", v)} icon={<ScanLine className="size-4" />} />
        </div>
      </SectionCard>

      <SectionCard title={d.p.settings.gUrls} desc={d.p.settings.gUrlsD} icon={<Link2 className="size-4.5" />}>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={newPattern}
            onChange={(e) => setNewPattern(e.target.value)}
            placeholder={d.p.settings.rulePatternPh}
            dir="ltr"
            className="h-11 flex-1"
            onKeyDown={(e) => e.key === "Enter" && addPattern()}
          />
          <Button onClick={addPattern} className="h-11 rounded-xl bg-primary font-bold text-primary-foreground">
            <Plus className="size-4" />
            {d.p.settings.addRule}
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          {app.settings.externalUrlPatterns.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 px-4 py-3.5 text-sm text-muted-foreground">
              {d.p.settings.noRules}
            </p>
          ) : (
            app.settings.externalUrlPatterns.map((pattern, i) => (
              <div key={`${pattern}-${i}`} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2.5">
                <code className="font-mono text-sm text-primary" dir="ltr">{pattern}</code>
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" onClick={() => removePattern(i)} aria-label={d.common.remove}>
                  <X className="size-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}
