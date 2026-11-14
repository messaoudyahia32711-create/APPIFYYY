"use client";

import { useRef, useState } from "react";
import { ImagePlus, Info, RefreshCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppIconBadge, LabeledField, SaveBar, SectionCard } from "../ui";
import { useLang } from "@/lib/appify/i18n";
import { useAppifyStore } from "@/lib/appify/store";
import { toast } from "@/hooks/use-toast";
import { generatePackageName, isSampleUrl } from "@/lib/appify/defaults";
import type { AppRecord } from "@/lib/appify/types";

export function GeneralPanel({ app }: { app: AppRecord }) {
  const { d } = useLang();
  const updateApp = useAppifyStore((s) => s.updateApp);

  const [draft, setDraft] = useState(() => ({
    name: app.name,
    url: app.url,
    packageName: app.packageName,
    bundleId: app.bundleId,
    version: app.version,
    versionCode: app.versionCode,
  }));
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify({
    name: app.name,
    url: app.url,
    packageName: app.packageName,
    bundleId: app.bundleId,
    version: app.version,
    versionCode: app.versionCode,
  });

  const save = () => {
    updateApp(app.id, (a) => ({ ...a, ...draft, updatedAt: Date.now() }));
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
      <SectionCard title={d.p.general.logo} desc={d.p.general.logoHint} icon={<Info className="size-4.5" />}>
        <div className="flex items-center gap-5">
          <AppIconBadge name={app.name} icon={app.icon} size={72} className="shadow-xl" />
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onIconFile(f);
              }}
            />
            <Button variant="outline" size="sm" className="rounded-xl border-white/12 bg-white/5" onClick={() => fileRef.current?.click()}>
              <ImagePlus className="size-4 text-primary" />
              {d.p.general.changeIcon}
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
        </div>
      </SectionCard>

      <SectionCard>
        <div className="grid gap-5 md:grid-cols-2">
          <LabeledField label={d.p.general.websiteUrl} hint={d.p.general.websiteUrlHint}>
            <Input
              value={draft.url}
              onChange={(e) => setDraft((p) => ({ ...p, url: e.target.value }))}
              dir="ltr"
              className="h-11"
              readOnly={isSampleUrl(app.url)}
            />
          </LabeledField>
          <LabeledField label={d.p.general.appName} hint={d.wizard.nameHint}>
            <Input
              value={draft.name}
              onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
              className="h-11"
            />
          </LabeledField>
          <LabeledField label={d.p.general.pkg}>
            <div className="flex gap-2">
              <Input
                value={draft.packageName}
                onChange={(e) => setDraft((p) => ({ ...p, packageName: e.target.value }))}
                dir="ltr"
                className="h-11 font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-xl border-white/12 bg-white/5"
                onClick={() => setDraft((p) => ({ ...p, packageName: generatePackageName(p.url) }))}
                aria-label={d.wizard.regenerate}
              >
                <RefreshCcw className="size-4" />
              </Button>
            </div>
          </LabeledField>
          <LabeledField label={d.p.general.bundle}>
            <Input
              value={draft.bundleId}
              onChange={(e) => setDraft((p) => ({ ...p, bundleId: e.target.value }))}
              dir="ltr"
              className="h-11 font-mono text-sm"
            />
          </LabeledField>
          <LabeledField label={d.p.general.version} hint={d.p.general.versionHint}>
            <Input
              value={draft.version}
              onChange={(e) => setDraft((p) => ({ ...p, version: e.target.value }))}
              dir="ltr"
              className="h-11 font-mono text-sm"
            />
          </LabeledField>
          <LabeledField label={d.p.general.versionCode} hint={d.p.general.versionCodeHint}>
            <Input
              value={String(draft.versionCode)}
              onChange={(e) => {
                const n = parseInt(e.target.value.replace(/\D/g, "") || "0", 10);
                setDraft((p) => ({ ...p, versionCode: n }));
              }}
              dir="ltr"
              inputMode="numeric"
              className="h-11 font-mono text-sm"
            />
          </LabeledField>
        </div>
        <SaveBar dirty={dirty} onSave={save} />
      </SectionCard>
    </div>
  );
}
