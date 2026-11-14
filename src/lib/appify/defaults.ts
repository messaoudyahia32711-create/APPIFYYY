// Appify — defaults, factories and helpers
import type {
  AppRecord,
  AppSettings,
  AppStyle,
  NavigationConfig,
  Integrations,
  Monetization,
  DeepLinkConfig,
  CustomCode,
  NavItem,
} from "./types";

export const SAMPLE_URL = "sample://store";

export function uid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function defaultSettings(): AppSettings {
  return {
    zoom: true,
    textSelection: true,
    popups: false,
    pullToRefresh: true,
    screenshotBlocking: false,
    secureSwitcher: false,
    caching: true,
    cacheTtl: 24,
    autoplayMedia: false,
    camera: true,
    microphone: false,
    location: true,
    fileUpload: true,
    fileDownload: true,
    vibration: true,
    qrScanner: true,
    externalUrlPatterns: [],
  };
}

export function defaultStyle(): AppStyle {
  return {
    statusBarColor: "#6D28D9",
    statusBarContent: "light",
    appBgColor: "#FFFFFF",
    splashBg: "#6D28D9",
    splashLogoColor: "#FFFFFF",
    splashDuration: 1600,
    orientation: "portrait",
    fullscreen: false,
    theme: "auto",
    appBarEnabled: false,
    appBarTitle: "",
    appBarColor: "#6D28D9",
  };
}

export function defaultNavigation(url: string): NavigationConfig {
  return {
    bottomNavEnabled: true,
    bottomNavItems: [
      { id: uid(), label: "الرئيسية", url, icon: "home" },
    ],
    navBgColor: "#FFFFFF",
    navActiveColor: "#6D28D9",
    navInactiveColor: "#9AA0AE",
    navIconSize: 24,
    navHeight: 62,
    navShowLabels: true,
    hideOnPatterns: [],
    drawerEnabled: false,
    drawerTitle: "القائمة",
    drawerItems: [],
    fabEnabled: false,
    fabIcon: "messageCircle",
    fabUrl: url,
    fabColor: "#6D28D9",
    fabPosition: "end",
  };
}

export function defaultIntegrations(): Integrations {
  return {
    appsflyerEnabled: false,
    appsflyerDevKey: "",
    appsflyerAppId: "",
    metaEnabled: false,
    metaAppId: "",
    metaClientToken: "",
    attRequest: false,
  };
}

export function defaultMonetization(): Monetization {
  return {
    admobEnabled: false,
    admobAppIdAndroid: "",
    admobAppIdIos: "",
    bannerUnitAndroid: "",
    bannerUnitIos: "",
    interstitialUnitAndroid: "",
    interstitialUnitIos: "",
    iapEnabled: false,
    iapProducts: [],
  };
}

export function defaultDeepLink(): DeepLinkConfig {
  return {
    scheme: "appify",
    host: "open",
    patterns: [],
  };
}

export function defaultCustomCode(): CustomCode {
  return { css: "", js: "" };
}

// Official AdMob Google test IDs (public, documented values)
export const ADMOB_TEST_IDS = {
  appIdAndroid: "ca-app-pub-3940256099942544~3347511713",
  appIdIos: "ca-app-pub-3940256099942544~1458002511",
  bannerAndroid: "ca-app-pub-3940256099942544/6300978111",
  bannerIos: "ca-app-pub-3940256099942544/2934735716",
  interstitialAndroid: "ca-app-pub-3940256099942544/1033173712",
  interstitialIos: "ca-app-pub-3940256099942544/4411468910",
};

export function generatePackageName(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    const host = u.hostname.replace(/^www\./, "");
    const parts = host
      .split(".")
      .filter(Boolean)
      .map((p) => p.replace(/[^a-zA-Z0-9]/g, "").toLowerCase())
      .filter((p) => p.length > 0);
    if (parts.length < 2) return `com.myapp.app`;
    const [tld, domain] = [parts[parts.length - 1], parts[parts.length - 2]];
    return `com.${domain}.${tld === "com" ? "app" : tld}`;
  } catch {
    return "com.myapp.app";
  }
}

export function nowTs(): number {
  return Date.now();
}

// Factory used by the wizard
export function createAppRecord(input: {
  name: string;
  url: string;
  icon?: string;
  packageName: string;
  bundleId: string;
  splashBg?: string;
  statusBarColor?: string;
}): AppRecord {
  const t = nowTs();
  return {
    id: uid(),
    name: input.name,
    url: input.url,
    icon: input.icon,
    packageName: input.packageName,
    bundleId: input.bundleId,
    createdAt: t,
    updatedAt: t,
    version: "1.0.0",
    versionCode: 1,
    firebaseServerKey: "",
    settings: defaultSettings(),
    style: {
      ...defaultStyle(),
      splashBg: input.splashBg ?? defaultStyle().splashBg,
      statusBarColor: input.statusBarColor ?? defaultStyle().statusBarColor,
    },
    navigation: defaultNavigation(input.url),
    integrations: defaultIntegrations(),
    monetization: defaultMonetization(),
    deepLink: defaultDeepLink(),
    customCode: defaultCustomCode(),
    notifications: [],
    builds: [],
  };
}

// Ready-made demo app so the dashboard is never empty and the preview always works
export function createDemoApp(): AppRecord {
  const t = nowTs();
  const navItems: NavItem[] = [
    { id: uid(), label: "الرئيسية", url: `${SAMPLE_URL}/home`, icon: "home" },
    { id: uid(), label: "المتجر", url: `${SAMPLE_URL}/shop`, icon: "shoppingBag" },
    { id: uid(), label: "السلة", url: `${SAMPLE_URL}/cart`, icon: "shoppingCart" },
    { id: uid(), label: "حسابي", url: `${SAMPLE_URL}/profile`, icon: "user" },
  ];
  return {
    id: "demo-elite-store",
    name: "متجر النخبة",
    url: SAMPLE_URL,
    icon: undefined,
    packageName: "com.elite.store",
    bundleId: "com.elite.store",
    createdAt: t - 1000 * 60 * 60 * 72,
    updatedAt: t - 1000 * 60 * 22,
    version: "1.2.0",
    versionCode: 14,
    firebaseServerKey: "AAAA-demo-****:APA91b-****",
    settings: {
      ...defaultSettings(),
      externalUrlPatterns: ["whatsapp://*"],
    },
    style: {
      ...defaultStyle(),
      statusBarColor: "#6D28D9",
      statusBarContent: "light",
      appBgColor: "#F7F8FA",
      splashBg: "#6D28D9",
      splashLogoColor: "#FFFFFF",
      splashDuration: 1600,
      theme: "auto",
      appBarEnabled: true,
      appBarTitle: "متجر النخبة",
      appBarColor: "#6D28D9",
    },
    navigation: {
      bottomNavEnabled: true,
      bottomNavItems: navItems,
      navBgColor: "#FFFFFF",
      navActiveColor: "#6D28D9",
      navInactiveColor: "#9AA0AE",
      navIconSize: 24,
      navHeight: 62,
      navShowLabels: true,
      hideOnPatterns: [],
      drawerEnabled: true,
      drawerTitle: "القائمة",
      drawerItems: [
        { id: uid(), label: "العروض", url: `${SAMPLE_URL}/shop`, icon: "percent" },
        { id: uid(), label: "الطلبات", url: `${SAMPLE_URL}/profile`, icon: "package" },
        { id: uid(), label: "الدعم", url: `${SAMPLE_URL}/profile`, icon: "headphones" },
      ],
      fabEnabled: true,
      fabIcon: "qrCode",
      fabUrl: `${SAMPLE_URL}/shop`,
      fabColor: "#6D28D9",
      fabPosition: "end",
    },
    integrations: {
      appsflyerEnabled: true,
      appsflyerDevKey: "af-demo-KEY-****",
      appsflyerAppId: "af-app-****",
      metaEnabled: true,
      metaAppId: "meta-app-****",
      metaClientToken: "meta-token-****",
      attRequest: true,
    },
    monetization: {
      admobEnabled: true,
      admobAppIdAndroid: ADMOB_TEST_IDS.appIdAndroid,
      admobAppIdIos: ADMOB_TEST_IDS.appIdIos,
      bannerUnitAndroid: ADMOB_TEST_IDS.bannerAndroid,
      bannerUnitIos: ADMOB_TEST_IDS.bannerIos,
      interstitialUnitAndroid: ADMOB_TEST_IDS.interstitialAndroid,
      interstitialUnitIos: ADMOB_TEST_IDS.interstitialIos,
      iapEnabled: true,
      iapProducts: [
        { id: uid(), name: "اشتراك VIP شهري", productId: "vip_monthly", price: "29 ر.س" },
      ],
    },
    deepLink: {
      scheme: "elite-store",
      host: "open",
      patterns: ["/product/*", "/offers/*"],
    },
    customCode: { css: "", js: "" },
    notifications: [
      {
        id: uid(),
        title: "خصم 30% هذا الأسبوع",
        body: "تسوّق الآن واستفد من العرض قبل انتهائه الجمعة القادمة.",
        audience: "all",
        deepLink: "/offers/summer",
        sentAt: t - 1000 * 60 * 60 * 5,
        sent: 2847,
        delivered: 2712,
        opened: 1046,
      },
    ],
    builds: [
      {
        id: uid(),
        platform: "android",
        output: "apk",
        version: "1.2.0",
        versionCode: 14,
        status: "success",
        progress: 100,
        startedAt: t - 1000 * 60 * 60 * 26,
        finishedAt: t - 1000 * 60 * 60 * 26 + 21000,
        sizeMb: 24.6,
        durationSec: 21,
        siteCheckOk: true,
      },
      {
        id: uid(),
        platform: "android",
        output: "aab",
        version: "1.1.0",
        versionCode: 13,
        status: "success",
        progress: 100,
        startedAt: t - 1000 * 60 * 60 * 70,
        finishedAt: t - 1000 * 60 * 60 * 70 + 19000,
        sizeMb: 23.1,
        durationSec: 19,
        siteCheckOk: true,
      },
    ],
  };
}

export function isSampleUrl(url: string): boolean {
  return url === SAMPLE_URL || url.startsWith(`${SAMPLE_URL}/`);
}

export function samplePageFromUrl(url: string): string {
  if (url === SAMPLE_URL) return "home";
  const suffix = url.replace(`${SAMPLE_URL}/`, "");
  return suffix || "home";
}

export function formatBytes(mb: number): string {
  return `${mb.toFixed(1)} MB`;
}

export function formatTime(ts: number, lang: string = "ar"): string {
  const d = new Date(ts);
  return d.toLocaleString(lang === "ar" ? "ar-u-nu-latn" : "en", {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
}
