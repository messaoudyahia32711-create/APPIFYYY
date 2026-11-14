"use client";

import { MessageSquareCode, Play, Fingerprint, Navigation, Smartphone, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock, SectionCard } from "../ui";
import { useLang } from "@/lib/appify/i18n";
import { useAppifyStore } from "@/lib/appify/store";
import { navigate } from "@/lib/appify/router";
import type { AppRecord } from "@/lib/appify/types";

const CAT_META: Record<string, { labelKey: "identity" | "ui" | "device" | "growth"; icon: typeof Fingerprint }> = {
  identity: { labelKey: "identity", icon: Fingerprint },
  ui: { labelKey: "ui", icon: Navigation },
  device: { labelKey: "device", icon: Smartphone },
  growth: { labelKey: "growth", icon: BarChart3 },
};

const METHOD_TO_EVENT: Record<string, string> = {
  "AppifyBridge.startBiometricAuthentication": "biometric",
  "AppifyBridge.requestUserIdentification": "identify",
  "AppifyBridge.signInWithGoogle": "google",
  "AppifyBridge.signInWithApple": "apple",
  "AppifyBridge.updateBottomNavigationBar": "updateNav",
  "AppifyBridge.updateNavigationDrawer": "updateDrawer",
  "AppifyBridge.updateAppBar": "updateAppBar",
  "AppifyBridge.openDeepLink": "deeplink",
  "AppifyBridge.openQRScanner": "qr",
  "AppifyBridge.vibrate": "vibrate",
  "AppifyBridge.share": "share",
  "AppifyBridge.showInterstitialAd": "interstitial",
  "AppifyBridge.logAnalyticsEvent": "analytics",
  "AppifyBridge.requestPushPermission": "push",
};

export function BridgePanel({ app }: { app: AppRecord }) {
  const { d } = useLang();
  const queueBridgeDemo = useAppifyStore((s) => s.queueBridgeDemo);

  const tryInPreview = (sig: string) => {
    const method = Object.entries(METHOD_TO_EVENT).find(([k]) => sig.startsWith(k))?.[1] ?? "identify";
    queueBridgeDemo(method);
    navigate(`#/app/${app.id}/preview`);
  };

  const cats = ["identity", "ui", "device", "growth"] as const;

  return (
    <div className="space-y-5">
      <SectionCard title={d.ws.sections.bridge} desc={d.p.bridge.intro} icon={<MessageSquareCode className="size-4.5" />}>
        <CodeBlock
          title="how-it-works.js"
          code={`// 1) صفحة موقعك تستدعي الجسر — your site page calls the bridge
AppifyBridge.startBiometricAuthentication({ title: "تأكيد الدفع" })
       │
       ▼  (JavaScript Bridge — مُعرَّف تلقائياً في كل صفحة)
// 2) الغلاف الأصلي ينفّذ الوظيفة على الهاتف — the native shell executes it
   📱 Fingerprint / Face ID prompt appears natively
       │
       ▼
// 3) النتيجة تعود إلى كود موقعك — the result resolves back to your site
   .then((result) => { if (result.success) completePayment(); });`}
        />
        <p className="mt-3 text-sm text-muted-foreground">{d.p.bridge.tryHint}</p>
      </SectionCard>

      {cats.map((cat) => {
        const meta = CAT_META[cat];
        const methods = d.p.bridge.methods.filter((m) => m.cat === cat);
        if (methods.length === 0) return null;
        return (
          <SectionCard key={cat} title={d.p.bridge.cats[meta.labelKey]} icon={<meta.icon className="size-4.5" />}>
            <div className="space-y-3">
              {methods.map((m) => (
                <div key={m.sig} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5 transition-colors hover:border-primary/25">
                  <div className="min-w-0 flex-1">
                    <code className="block text-left font-mono text-[13px] font-bold text-primary" dir="ltr">
                      {m.sig}
                    </code>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{m.desc}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => tryInPreview(m.sig)}
                    className="shrink-0 rounded-lg border-primary/25 bg-primary/8 font-bold text-primary hover:bg-primary/15"
                  >
                    <Play className="size-3.5" />
                    {d.p.bridge.tryBtn}
                  </Button>
                </div>
              ))}
            </div>
          </SectionCard>
        );
      })}
    </div>
  );
}
