"use client";

import { useState } from "react";
import { ChevronDown, LogOut, LayoutDashboard, MailCheck, UserRoundPlus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLang } from "@/lib/appify/i18n";
import { useAuthStore, type AppifyUser } from "@/lib/appify/auth";
import { navigate } from "@/lib/appify/router";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/* ---------- official multicolor Google "G" ---------- */
export function GoogleG({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={cn("shrink-0", className)} aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
        fill="#34A853"
      />
      <path d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" fill="#FBBC05" />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

/* ---------- suggested demo accounts (local, never sent anywhere) ---------- */
function suggestedAccounts(lang: string): { name: string; email: string }[] {
  return lang === "ar"
    ? [
        { name: "سارة محمد", email: "sara.mohammed@gmail.com" },
        { name: "أحمد خالد", email: "ahmed.khaled@gmail.com" },
      ]
    : [
        { name: "Sara Mohammed", email: "sara.mohammed@gmail.com" },
        { name: "Ahmed Khaled", email: "ahmed.khaled@gmail.com" },
      ];
}

function avatarHue(email: string): string {
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) % 360;
  return `hsl(${h} 62% 46%)`;
}

export function AvatarBubble({ name, email, size = 34 }: { name: string; email: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-display font-extrabold text-white"
      style={{ width: size, height: size, background: avatarHue(email), fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {name.trim()?.[0]?.toUpperCase() ?? "G"}
    </span>
  );
}

/* ---------- Google-style account chooser ---------- */
function GoogleSignInModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { d, lang } = useLang();
  const signIn = useAuthStore((s) => s.signIn);
  const [step, setStep] = useState<"choose" | "other">("choose");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const doSignIn = (user: AppifyUser) => {
    signIn({ ...user, provider: "google" });
    toast({ title: d.auth.signedInToast });
    setStep("choose");
    setName("");
    setEmail("");
    setError(null);
    onClose();
  };

  const submitOther = () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(trimmedEmail)) {
      setError(d.auth.emailInvalid);
      return;
    }
    if (!name.trim()) {
      setError(d.auth.nameRequired);
      return;
    }
    setError(null);
    doSignIn({ name: name.trim(), email: trimmedEmail });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); setStep("choose"); setError(null); } }}>
      <DialogContent className="rounded-3xl border-border bg-white p-0 sm:max-w-[400px] sm:rounded-3xl" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="px-7 pb-7 pt-8">
          <DialogHeader className="items-center text-center">
            <GoogleG size={40} className="mb-3" />
            <DialogTitle className="text-[21px] font-bold leading-snug text-foreground">
              {step === "choose" ? d.auth.title : d.auth.useOther}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-muted-foreground">
              {step === "choose" ? d.auth.subtitle : d.auth.title}
            </DialogDescription>
          </DialogHeader>

          {step === "choose" ? (
            <div className="mt-6">
              <p className="mb-2 text-[13px] font-bold text-foreground">{d.auth.chooseAccount}</p>
              <div className="space-y-1">
                {suggestedAccounts(lang).map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => doSignIn(acc)}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-start transition-colors hover:bg-muted"
                  >
                    <AvatarBubble name={acc.name} email={acc.email} size={38} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-foreground">{acc.name}</span>
                      <span className="block truncate text-xs text-muted-foreground" dir="ltr">{acc.email}</span>
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => { setStep("other"); setError(null); }}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-start transition-colors hover:bg-muted"
                >
                  <span className="flex size-[38px] shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                    <UserRoundPlus className="size-4.5" />
                  </span>
                  <span className="text-sm font-semibold text-foreground">{d.auth.useOther}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ga-name" className="text-[13px] font-semibold">{d.auth.nameLabel}</Label>
                <Input
                  id="ga-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={d.auth.namePh}
                  className="h-11 rounded-xl"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ga-email" className="text-[13px] font-semibold">{d.auth.emailLabel}</Label>
                <Input
                  id="ga-email"
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitOther()}
                  placeholder={d.auth.emailPh}
                  dir="ltr"
                  className="h-11 rounded-xl text-start"
                />
              </div>
              {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">{error}</p>}
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setStep("choose")} className="h-10 flex-1 rounded-xl border-border bg-card font-semibold">
                  {d.auth.backToAccounts}
                </Button>
                <Button onClick={submitOther} className="h-10 flex-1 rounded-xl bg-primary font-bold text-primary-foreground hover:bg-primary/90">
                  {d.auth.continueBtn}
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-start gap-2 rounded-xl bg-muted/70 px-3 py-2.5">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">{d.auth.demoNote}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- header widget: sign-in button OR user menu ---------- */
export function GoogleAuthButton({ full = false }: { full?: boolean }) {
  const { d } = useLang();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [open, setOpen] = useState(false);

  if (user) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-full border border-border bg-card py-1 ps-1 pe-2.5 shadow-none transition-colors hover:bg-muted"
              aria-label={d.auth.myAccount}
            >
              <AvatarBubble name={user.name} email={user.email} size={28} />
              <span className="hidden max-w-28 truncate text-xs font-bold text-foreground sm:block">{user.name}</span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-2xl border-border bg-popover">
            <DropdownMenuLabel className="px-3 py-3">
              <div className="flex items-center gap-3">
                <AvatarBubble name={user.name} email={user.email} size={38} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-foreground">{user.name}</div>
                  <div className="truncate text-xs text-muted-foreground" dir="ltr">{user.email}</div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2 py-1.5 text-[11px] font-semibold text-emerald-700">
                <MailCheck className="size-3" />
                {d.auth.linkedNote}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={() => navigate("#/dashboard")} className="gap-2.5 rounded-xl py-2.5 text-sm font-semibold">
              <LayoutDashboard className="size-4 text-primary" />
              {d.auth.gotoDash}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                signOut();
                toast({ title: d.auth.signedOutToast });
              }}
              className="gap-2.5 rounded-xl py-2.5 text-sm font-semibold text-destructive focus:text-destructive"
            >
              <LogOut className="size-4" />
              {d.auth.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={cn(
          "gap-2 rounded-full border-border bg-card font-bold shadow-none hover:bg-muted",
          full ? "h-10 px-4 text-sm" : "px-3",
        )}
        aria-label={d.auth.signInGoogle}
      >
        <GoogleG size={16} />
        <span className="hidden sm:inline">{full ? d.auth.signInGoogle : d.auth.signInShort}</span>
        <span className="sm:hidden">{d.auth.signInShort}</span>
      </Button>
      <GoogleSignInModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
