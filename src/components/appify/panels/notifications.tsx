"use client";

import { useState } from "react";
import {
  Bell,
  KeyRound,
  Send,
  Loader2,
  Megaphone,
  History,
  CheckCircle2,
  MailOpen,
  MousePointerClick,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LabeledField, SaveBar, SectionCard } from "../ui";
import { useLang } from "@/lib/appify/i18n";
import { useAppifyStore } from "@/lib/appify/store";
import { toast } from "@/hooks/use-toast";
import { uid, formatTime } from "@/lib/appify/defaults";
import type { AppRecord, Audience } from "@/lib/appify/types";
import { cn } from "@/lib/utils";

const AUDIENCE_BASE: Record<Audience, number> = { all: 2847, android: 1912, ios: 935 };

export function NotificationsPanel({ app }: { app: AppRecord }) {
  const { d, lang } = useLang();
  const updateApp = useAppifyStore((s) => s.updateApp);
  const addNotification = useAppifyStore((s) => s.addNotification);

  const [keyDraft, setKeyDraft] = useState(app.firebaseServerKey);
  const keyDirty = keyDraft !== app.firebaseServerKey;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [deepLink, setDeepLink] = useState("");
  const [audience, setAudience] = useState<Audience>("all");
  const [sending, setSending] = useState(false);

  const saveKey = () => {
    updateApp(app.id, (a) => ({ ...a, firebaseServerKey: keyDraft, updatedAt: Date.now() }));
    toast({ title: d.toast.saved });
  };

  const send = () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    setTimeout(() => {
      const base = AUDIENCE_BASE[audience];
      const sent = Math.round(base * (0.85 + Math.random() * 0.12));
      const delivered = Math.round(sent * (0.92 + Math.random() * 0.05));
      const opened = Math.round(delivered * (0.3 + Math.random() * 0.14));
      addNotification(app.id, {
        id: uid(),
        title: title.trim(),
        body: body.trim(),
        audience,
        deepLink: deepLink.trim() || undefined,
        sentAt: Date.now(),
        sent,
        delivered,
        opened,
      });
      setSending(false);
      setTitle("");
      setBody("");
      setDeepLink("");
      toast({ title: d.p.notifications.sentToast });
    }, 1400);
  };

  const connected = app.firebaseServerKey.trim().length > 0;
  const last = app.notifications[0];

  return (
    <div className="space-y-5">
      {/* Firebase config */}
      <SectionCard
        title={d.p.notifications.firebase}
        icon={<KeyRound className="size-4.5" />}
        actions={
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
              connected ? "bg-primary/12 text-primary" : "bg-amber-500/15 text-amber-400",
            )}
          >
            <span className={cn("size-1.5 rounded-full", connected ? "bg-primary" : "bg-amber-400")} />
            {connected ? d.p.notifications.connected : d.p.notifications.notConnected}
          </span>
        }
      >
        <LabeledField label={d.p.notifications.serverKey} hint={d.p.notifications.serverKeyHint}>
          <Input
            value={keyDraft}
            onChange={(e) => setKeyDraft(e.target.value)}
            placeholder={d.p.notifications.keyPlaceholder}
            dir="ltr"
            className="h-11 font-mono text-sm"
            type="password"
          />
        </LabeledField>
        <SaveBar dirty={keyDirty} onSave={saveKey} />
      </SectionCard>

      {/* Compose */}
      <SectionCard title={d.p.notifications.compose} desc={d.p.notifications.bridgeNote} icon={<Megaphone className="size-4.5" />}>
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <LabeledField label={d.p.notifications.nTitle}>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={d.p.notifications.nTitlePh} className="h-11" maxLength={64} />
            </LabeledField>
            <LabeledField label={d.p.notifications.nBody}>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={d.p.notifications.nBodyPh} rows={3} maxLength={200} />
            </LabeledField>
            <LabeledField label={d.p.notifications.nLink}>
              <Input value={deepLink} onChange={(e) => setDeepLink(e.target.value)} placeholder={d.p.notifications.nLinkPh} dir="ltr" className="h-11 font-mono text-sm" />
            </LabeledField>
            <div>
              <div className="mb-2.5 text-sm font-semibold">{d.p.notifications.audience}</div>
              <RadioGroup value={audience} onValueChange={(v) => setAudience(v as Audience)} className="flex flex-wrap gap-2.5">
                {(
                  [
                    { v: "all", label: d.p.notifications.audAll, n: AUDIENCE_BASE.all },
                    { v: "android", label: d.p.notifications.audAndroid, n: AUDIENCE_BASE.android },
                    { v: "ios", label: d.p.notifications.audIos, n: AUDIENCE_BASE.ios },
                  ] as const
                ).map((o) => (
                  <label
                    key={o.v}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors",
                      audience === o.v ? "border-primary/40 bg-primary/10 text-primary" : "border-white/10 bg-white/[0.02] text-muted-foreground",
                    )}
                  >
                    <RadioGroupItem value={o.v} className="sr-only" />
                    {o.label}
                    <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px]" dir="ltr">{o.n.toLocaleString("en")}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
            <Button
              onClick={send}
              disabled={sending || !title.trim() || !body.trim()}
              className="glow-neon h-12 w-full rounded-xl bg-primary text-base font-bold text-primary-foreground"
            >
              {sending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-4.5 rtl:-scale-x-100" />}
              {sending ? d.p.notifications.sending : d.p.notifications.send}
            </Button>
            <p className="text-[11px] text-muted-foreground">{d.p.notifications.simulated}</p>
          </div>

          {/* phone-style notification preview */}
          <div className="flex items-start justify-center rounded-2xl border border-white/8 bg-gradient-to-b from-[#12141A] to-[#0C0D10] p-5">
            <div className="w-full max-w-64 rounded-2xl border border-white/12 bg-[#1A1C22] p-3.5 shadow-2xl">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                <span className="flex size-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#2EE6A8] to-[#8B7CFF] text-[10px] font-extrabold text-[#04120C]">
                  {app.name[0] ?? "A"}
                </span>
                {app.name}
                <span className="ms-auto">now</span>
              </div>
              <div className="mt-2 font-bold text-[13px] text-foreground">{title || d.p.notifications.nTitlePh}</div>
              <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{body || d.p.notifications.nBodyPh}</div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Last stats */}
      {last && (
        <SectionCard title={d.p.notifications.lastStats} icon={<CheckCircle2 className="size-4.5" />}>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Send, label: d.p.notifications.stSent, value: last.sent },
              { icon: MailOpen, label: d.p.notifications.stDelivered, value: last.delivered },
              { icon: MousePointerClick, label: d.p.notifications.stOpened, value: last.opened },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-center">
                <s.icon className="mx-auto size-5 text-primary" />
                <div className="mt-2 font-display text-2xl font-extrabold" dir="ltr">
                  {s.value.toLocaleString("en")}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* History */}
      <SectionCard title={d.p.notifications.history} icon={<History className="size-4.5" />}>
        {app.notifications.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
            {d.p.notifications.noHistory}
          </p>
        ) : (
          <div className="space-y-2.5">
            {app.notifications.map((n) => (
              <div key={n.id} className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-bold">
                    <Bell className="size-4 text-primary" />
                    {n.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white/8 px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                      {n.audience === "all" ? d.p.notifications.audAll : n.audience === "android" ? d.p.notifications.audAndroid : d.p.notifications.audIos}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{formatTime(n.sentAt, lang)}</span>
                  </div>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{n.body}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground" dir="ltr">
                  <span><b className="text-foreground">{n.sent.toLocaleString("en")}</b> {d.p.notifications.stSent}</span>
                  <span><b className="text-foreground">{n.delivered.toLocaleString("en")}</b> {d.p.notifications.stDelivered}</span>
                  <span><b className="text-foreground">{n.opened.toLocaleString("en")}</b> {d.p.notifications.stOpened}</span>
                  {n.deepLink && <span className="rounded bg-white/8 px-2 py-0.5 font-mono">{n.deepLink}</span>}
                </div>
              </div>
            ))}
            <p className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-3 text-primary" />
              {d.p.notifications.simulated}
            </p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
