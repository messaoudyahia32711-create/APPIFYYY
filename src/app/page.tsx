"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { LangProvider, useLang } from "@/lib/appify/i18n";
import { useAppifyStore } from "@/lib/appify/store";
import { useRoute } from "@/lib/appify/router";
import { LandingPage } from "@/components/appify/landing";
import { DashboardPage } from "@/components/appify/dashboard";
import { WizardPage } from "@/components/appify/wizard";
import { WorkspacePage } from "@/components/appify/workspace";
import { PreviewPage } from "@/components/appify/preview";
import { AppifyLogo } from "@/components/appify/ui";

function AppifyApp() {
  const route = useRoute();
  const { d } = useLang();
  const seedIfEmpty = useAppifyStore((s) => s.seedIfEmpty);
  const [hydrated, setHydrated] = useState(false);

  // wait for zustand persist rehydration, then seed demo app on first run
  useEffect(() => {
    const t = window.setTimeout(() => {
      seedIfEmpty();
      setHydrated(true);
    }, 60);
    return () => window.clearTimeout(t);
     
  }, []);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background">
        <AppifyLogo size={52} />
        <Loader2 className="size-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">{d.common.loading}</span>
      </div>
    );
  }

  switch (route.view) {
    case "dashboard":
      return <DashboardPage />;
    case "wizard":
      return <WizardPage />;
    case "workspace":
      return <WorkspacePage key={route.appId} appId={route.appId} tab={route.tab} />;
    case "preview":
      return <PreviewPage key={route.appId} appId={route.appId} />;
    default:
      return <LandingPage />;
  }
}

export default function Home() {
  return (
    <LangProvider>
      <AppifyApp />
    </LangProvider>
  );
}
