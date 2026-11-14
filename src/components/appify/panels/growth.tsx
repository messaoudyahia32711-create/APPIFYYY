"use client";

import { useState } from "react";
import {
  BadgeDollarSign,
  BarChart3,
  Link2,
  FileCode2,
  Plus,
  X,
  ShoppingBag,
  Copy,
  ExternalLink,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CodeBlock, LabeledField, SaveBar, SectionCard, ToggleRow } from "../ui";
import { useLang } from "@/lib/appify/i18n";
import { useAppifyStore } from "@/lib/appify/store";
import { navigate } from "@/lib/appify/router";
import { toast } from "@/hooks/use-toast";
import { ADMOB_TEST_IDS, uid } from "@/lib/appify/defaults";
import type { AppRecord } from "@/lib/appify/types";

/* ==================== Monetization ==================== */
export function MonetizationPanel({ app }: { app: AppRecord }) {
  const { d } = useLang();
  const updateApp = useAppifyStore((s) => s.updateApp);
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(app.monetization)));

  const dirty = JSON.stringify(draft) !== JSON.stringify(app.monetization);
  const save = () => {
    updateApp(app.id, (a) => ({ ...a, monetization: draft, updatedAt: Date.now() }));
    toast({ title: d.toast.saved });
  };

  const setProduct = (id: string, patch: Partial<{ name: string; productId: string; price: string }>) => {
    setDraft((p: typeof draft) => ({ ...p, iapProducts: p.iapProducts.map((it: { id: string }) => (it.id === id ? { ...it, ...patch } : it)) }));
  };

  return (
    <div className="space-y-5">
      <SectionCard title={d.p.monetization.admob} desc={d.p.monetization.admobD} icon={<BadgeDollarSign className="size-4.5" />}>
        <ToggleRow label={d.p.monetization.enable} checked={draft.admobEnabled} onChange={(v) => setDraft((p: typeof draft) => ({ ...p, admobEnabled: v }))} />
        {draft.admobEnabled && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <LabeledField label={d.p.monetization.appIdAndroid}>
                <Input value={draft.admobAppIdAndroid} onChange={(e) => setDraft((p: typeof draft) => ({ ...p, admobAppIdAndroid: e.target.value }))} dir="ltr" className="h-10 font-mono text-xs" placeholder="ca-app-pub-xxxx~xxxx" />
              </LabeledField>
              <LabeledField label={d.p.monetization.appIdIos}>
                <Input value={draft.admobAppIdIos} onChange={(e) => setDraft((p: typeof draft) => ({ ...p, admobAppIdIos: e.target.value }))} dir="ltr" className="h-10 font-mono text-xs" placeholder="ca-app-pub-xxxx~xxxx" />
              </LabeledField>
              <LabeledField label={d.p.monetization.banner}>
                <Input value={draft.bannerUnitAndroid} onChange={(e) => setDraft((p: typeof draft) => ({ ...p, bannerUnitAndroid: e.target.value }))} dir="ltr" className="h-10 font-mono text-xs" placeholder="ca-app-pub-xxxx/xxxx" />
              </LabeledField>
              <LabeledField label={d.p.monetization.bannerIos}>
                <Input value={draft.bannerUnitIos} onChange={(e) => setDraft((p: typeof draft) => ({ ...p, bannerUnitIos: e.target.value }))} dir="ltr" className="h-10 font-mono text-xs" placeholder="ca-app-pub-xxxx/xxxx" />
              </LabeledField>
              <LabeledField label={d.p.monetization.interstitial}>
                <Input value={draft.interstitialUnitAndroid} onChange={(e) => setDraft((p: typeof draft) => ({ ...p, interstitialUnitAndroid: e.target.value }))} dir="ltr" className="h-10 font-mono text-xs" placeholder="ca-app-pub-xxxx/xxxx" />
              </LabeledField>
              <LabeledField label={d.p.monetization.interstitialIos}>
                <Input value={draft.interstitialUnitIos} onChange={(e) => setDraft((p: typeof draft) => ({ ...p, interstitialUnitIos: e.target.value }))} dir="ltr" className="h-10 font-mono text-xs" placeholder="ca-app-pub-xxxx/xxxx" />
              </LabeledField>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setDraft((p: typeof draft) => ({
                  ...p,
                  admobAppIdAndroid: ADMOB_TEST_IDS.appIdAndroid,
                  admobAppIdIos: ADMOB_TEST_IDS.appIdIos,
                  bannerUnitAndroid: ADMOB_TEST_IDS.bannerAndroid,
                  bannerUnitIos: ADMOB_TEST_IDS.bannerIos,
                  interstitialUnitAndroid: ADMOB_TEST_IDS.interstitialAndroid,
                  interstitialUnitIos: ADMOB_TEST_IDS.interstitialIos,
                }));
                toast({ title: d.toast.testIdsApplied });
              }}
              className="w-full rounded-xl border-primary/25 bg-primary/8 font-bold text-primary hover:bg-primary/15"
            >
              <Wand2 className="size-4" />
              {d.p.monetization.testIds}
            </Button>
          </div>
        )}
      </SectionCard>

      <SectionCard title={d.p.monetization.iap} desc={d.p.monetization.iapD} icon={<ShoppingBag className="size-4.5" />}>
        <ToggleRow label={d.p.monetization.iapEnable} checked={draft.iapEnabled} onChange={(v) => setDraft((p: typeof draft) => ({ ...p, iapEnabled: v }))} />
        {draft.iapEnabled && (
          <div className="mt-4 space-y-3">
            {draft.iapProducts.length === 0 && (
              <p className="rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-muted-foreground">
                {d.p.monetization.noProducts}
              </p>
            )}
            {draft.iapProducts.map((prod: { id: string; name: string; productId: string; price: string }) => (
              <div key={prod.id} className="flex flex-wrap items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.02] p-3">
                <Input value={prod.name} onChange={(e) => setProduct(prod.id, { name: e.target.value })} placeholder={d.p.monetization.productName} className="h-10 w-36 flex-1" />
                <Input value={prod.productId} onChange={(e) => setProduct(prod.id, { productId: e.target.value })} placeholder={d.p.monetization.productId} dir="ltr" className="h-10 min-w-28 flex-1 font-mono text-xs" />
                <Input value={prod.price} onChange={(e) => setProduct(prod.id, { price: e.target.value })} placeholder={d.p.monetization.price} className="h-10 w-24" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  onClick={() => setDraft((p: typeof draft) => ({ ...p, iapProducts: p.iapProducts.filter((it: { id: string }) => it.id !== prod.id) }))}
                  aria-label={d.common.remove}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => setDraft((p: typeof draft) => ({ ...p, iapProducts: [...p.iapProducts, { id: uid(), name: "", productId: "", price: "" }] }))}
              className="w-full rounded-xl border-dashed border-white/20 bg-white/[0.02] font-semibold text-muted-foreground hover:text-primary"
            >
              <Plus className="size-4" />
              {d.p.monetization.addProduct}
            </Button>
            <p className="text-xs leading-relaxed text-muted-foreground">{d.p.monetization.appleNote}</p>
          </div>
        )}
        <SaveBar dirty={dirty} onSave={save} />
      </SectionCard>
    </div>
  );
}

/* ==================== Analytics ==================== */
export function AnalyticsPanel({ app }: { app: AppRecord }) {
  const { d } = useLang();
  const updateApp = useAppifyStore((s) => s.updateApp);
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(app.integrations)));

  const dirty = JSON.stringify(draft) !== JSON.stringify(app.integrations);
  const save = () => {
    updateApp(app.id, (a) => ({ ...a, integrations: draft, updatedAt: Date.now() }));
    toast({ title: d.toast.saved });
  };

  return (
    <div className="space-y-5">
      <SectionCard title={d.p.analytics.appsflyer} desc={d.p.analytics.appsflyerD} icon={<BarChart3 className="size-4.5" />}>
        <ToggleRow label={d.p.analytics.enable} checked={draft.appsflyerEnabled} onChange={(v) => setDraft((p: typeof draft) => ({ ...p, appsflyerEnabled: v }))} />
        {draft.appsflyerEnabled && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <LabeledField label={d.p.analytics.devKey}>
              <Input value={draft.appsflyerDevKey} onChange={(e) => setDraft((p: typeof draft) => ({ ...p, appsflyerDevKey: e.target.value }))} dir="ltr" className="h-10 font-mono text-xs" placeholder="af-dev-key-xxxx" />
            </LabeledField>
            <LabeledField label={d.p.analytics.afAppId}>
              <Input value={draft.appsflyerAppId} onChange={(e) => setDraft((p: typeof draft) => ({ ...p, appsflyerAppId: e.target.value }))} dir="ltr" className="h-10 font-mono text-xs" placeholder="id123456789" />
            </LabeledField>
          </div>
        )}
      </SectionCard>

      <SectionCard title={d.p.analytics.meta} desc={d.p.analytics.metaD} icon={<BadgeDollarSign className="size-4.5" />}>
        <ToggleRow label={d.p.analytics.metaEnable} checked={draft.metaEnabled} onChange={(v) => setDraft((p: typeof draft) => ({ ...p, metaEnabled: v }))} />
        {draft.metaEnabled && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <LabeledField label={d.p.analytics.metaAppId}>
              <Input value={draft.metaAppId} onChange={(e) => setDraft((p: typeof draft) => ({ ...p, metaAppId: e.target.value }))} dir="ltr" className="h-10 font-mono text-xs" placeholder="1234567890" />
            </LabeledField>
            <LabeledField label={d.p.analytics.clientToken}>
              <Input value={draft.metaClientToken} onChange={(e) => setDraft((p: typeof draft) => ({ ...p, metaClientToken: e.target.value }))} dir="ltr" className="h-10 font-mono text-xs" placeholder="client-token-xxxx" />
            </LabeledField>
          </div>
        )}
      </SectionCard>

      <SectionCard title={d.p.analytics.att} desc={d.p.analytics.attD} icon={<BadgeDollarSign className="size-4.5" />}>
        <ToggleRow label={d.p.analytics.attEnable} checked={draft.attRequest} onChange={(v) => setDraft((p: typeof draft) => ({ ...p, attRequest: v }))} />
        <p className="mt-4 rounded-xl bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          {d.p.analytics.eventsNote}
        </p>
        <SaveBar dirty={dirty} onSave={save} />
      </SectionCard>
    </div>
  );
}

/* ==================== Deep linking ==================== */
export function DeepLinkPanel({ app }: { app: AppRecord }) {
  const { d } = useLang();
  const updateApp = useAppifyStore((s) => s.updateApp);
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(app.deepLink)));
  const [newPattern, setNewPattern] = useState("");

  const dirty = JSON.stringify(draft) !== JSON.stringify(app.deepLink);
  const save = () => {
    updateApp(app.id, (a) => ({ ...a, deepLink: draft, updatedAt: Date.now() }));
    toast({ title: d.toast.saved });
  };

  const sampleLink = `${draft.scheme}://${draft.host}?path=/product/123`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(sampleLink);
      toast({ title: d.toast.copied });
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-5">
      <SectionCard title={d.p.deeplink.title} desc={d.p.deeplink.desc} icon={<Link2 className="size-4.5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledField label={d.p.deeplink.scheme}>
            <Input value={draft.scheme} onChange={(e) => setDraft((p: typeof draft) => ({ ...p, scheme: e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase() }))} dir="ltr" className="h-11 font-mono text-sm" />
          </LabeledField>
          <LabeledField label={d.p.deeplink.host}>
            <Input value={draft.host} onChange={(e) => setDraft((p: typeof draft) => ({ ...p, host: e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase() }))} dir="ltr" className="h-11 font-mono text-sm" />
          </LabeledField>
        </div>

        <div className="mt-5">
          <div className="mb-2.5 text-sm font-semibold">{d.p.deeplink.patterns}</div>
          <div className="flex gap-2">
            <Input
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              placeholder={d.p.deeplink.patternPh}
              dir="ltr"
              className="h-11 flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newPattern.trim()) {
                  setDraft((p: typeof draft) => ({ ...p, patterns: [...p.patterns, newPattern.trim()] }));
                  setNewPattern("");
                }
              }}
            />
            <Button
              onClick={() => {
                if (!newPattern.trim()) return;
                setDraft((p: typeof draft) => ({ ...p, patterns: [...p.patterns, newPattern.trim()] }));
                setNewPattern("");
              }}
              className="h-11 rounded-xl bg-primary font-bold text-primary-foreground"
            >
              <Plus className="size-4" />
              {d.p.deeplink.addPattern}
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {draft.patterns.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-muted-foreground">
                {d.p.deeplink.noPatterns}
              </p>
            ) : (
              draft.patterns.map((pat: string, i: number) => (
                <div key={`${pat}-${i}`} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2.5">
                  <code className="font-mono text-sm text-primary" dir="ltr">{pat}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setDraft((p: typeof draft) => ({ ...p, patterns: p.patterns.filter((_: string, idx: number) => idx !== i) }))}
                    aria-label={d.common.remove}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/[0.05] px-4 py-3.5">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-muted-foreground">{d.p.deeplink.previewLink}</div>
            <code className="mt-0.5 block truncate font-mono text-sm font-bold text-primary" dir="ltr">{sampleLink}</code>
          </div>
          <Button variant="outline" size="sm" onClick={copyLink} className="rounded-lg border-white/12 bg-white/5">
            <Copy className="size-3.5" />
            {d.common.copy}
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{d.p.deeplink.useCases}</p>
        <SaveBar dirty={dirty} onSave={save} />
      </SectionCard>
    </div>
  );
}

/* ==================== Custom code ==================== */
export function CustomCodePanel({ app }: { app: AppRecord }) {
  const { d } = useLang();
  const updateApp = useAppifyStore((s) => s.updateApp);
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(app.customCode)));

  const dirty = JSON.stringify(draft) !== JSON.stringify(app.customCode);
  const save = () => {
    updateApp(app.id, (a) => ({ ...a, customCode: draft, updatedAt: Date.now() }));
    toast({ title: d.toast.saved });
  };

  return (
    <div className="space-y-5">
      <SectionCard
        title={d.p.code.cssTitle}
        desc={d.p.code.cssDesc}
        icon={<FileCode2 className="size-4.5" />}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(`#/app/${app.id}/preview`)} className="rounded-lg border-primary/25 bg-primary/8 font-bold text-primary hover:bg-primary/15">
            <ExternalLink className="size-3.5" />
            {d.p.code.openPreview}
          </Button>
        }
      >
        <Textarea
          value={draft.css}
          onChange={(e) => setDraft((p: typeof draft) => ({ ...p, css: e.target.value }))}
          placeholder={d.p.code.cssPh}
          rows={7}
          className="resize-y bg-[#0C0E11] font-mono text-[13px] text-[#C9E8D8]"
          dir="ltr"
        />
      </SectionCard>

      <SectionCard title={d.p.code.jsTitle} desc={d.p.code.jsDesc} icon={<FileCode2 className="size-4.5" />}>
        <Textarea
          value={draft.js}
          onChange={(e) => setDraft((p: typeof draft) => ({ ...p, js: e.target.value }))}
          placeholder={d.p.code.jsPh}
          rows={7}
          className="resize-y bg-[#0C0E11] font-mono text-[13px] text-[#C9E8D8]"
          dir="ltr"
        />
        <CodeBlock
          title="available-global.js"
          code={`// متاح عالمياً داخل التطبيق — globally available inside the app
AppifyBridge.vibrate(30);
AppifyBridge.showInterstitialAd();
AppifyBridge.logAnalyticsEvent("custom_event", { value: 1 });`}
        />
        <p className="mt-3 text-xs text-muted-foreground">{d.p.code.applyNote}</p>
        <SaveBar dirty={dirty} onSave={save} />
      </SectionCard>
    </div>
  );
}
