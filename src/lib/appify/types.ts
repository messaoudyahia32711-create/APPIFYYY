// Appify — data model types
export type NavItem = { id: string; label: string; url: string; icon: string };
export type DrawerItem = { id: string; label: string; url: string; icon: string };

export type AppSettings = {
  zoom: boolean;
  textSelection: boolean;
  popups: boolean;
  pullToRefresh: boolean;
  screenshotBlocking: boolean;
  secureSwitcher: boolean;
  caching: boolean;
  cacheTtl: number;
  autoplayMedia: boolean;
  camera: boolean;
  microphone: boolean;
  location: boolean;
  fileUpload: boolean;
  fileDownload: boolean;
  vibration: boolean;
  qrScanner: boolean;
  externalUrlPatterns: string[];
};

export type AppStyle = {
  statusBarColor: string;
  statusBarContent: "dark" | "light";
  appBgColor: string;
  splashBg: string;
  splashLogoColor: string;
  splashDuration: number;
  orientation: "portrait" | "landscape" | "auto";
  fullscreen: boolean;
  theme: "light" | "dark" | "auto";
  appBarEnabled: boolean;
  appBarTitle: string;
  appBarColor: string;
};

export type NavigationConfig = {
  bottomNavEnabled: boolean;
  bottomNavItems: NavItem[];
  navBgColor: string;
  navActiveColor: string;
  navInactiveColor: string;
  navIconSize: number;
  navHeight: number;
  navShowLabels: boolean;
  hideOnPatterns: string[];
  drawerEnabled: boolean;
  drawerTitle: string;
  drawerItems: DrawerItem[];
  fabEnabled: boolean;
  fabIcon: string;
  fabUrl: string;
  fabColor: string;
  fabPosition: "start" | "end";
};

export type Audience = "all" | "android" | "ios";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  audience: Audience;
  deepLink?: string;
  sentAt: number;
  sent: number;
  delivered: number;
  opened: number;
};

export type Integrations = {
  appsflyerEnabled: boolean;
  appsflyerDevKey: string;
  appsflyerAppId: string;
  metaEnabled: boolean;
  metaAppId: string;
  metaClientToken: string;
  attRequest: boolean;
};

export type IapProduct = { id: string; name: string; productId: string; price: string };

export type Monetization = {
  admobEnabled: boolean;
  admobAppIdAndroid: string;
  admobAppIdIos: string;
  bannerUnitAndroid: string;
  bannerUnitIos: string;
  interstitialUnitAndroid: string;
  interstitialUnitIos: string;
  iapEnabled: boolean;
  iapProducts: IapProduct[];
};

export type DeepLinkConfig = {
  scheme: string;
  host: string;
  patterns: string[];
};

export type CustomCode = {
  css: string;
  js: string;
};

export type BuildPlatform = "android" | "ios";
export type BuildOutput = "apk" | "aab" | "ipa";

export type BuildRecord = {
  id: string;
  platform: BuildPlatform;
  output: BuildOutput;
  version: string;
  versionCode: number;
  status: "running" | "success" | "failed";
  progress: number;
  startedAt: number;
  finishedAt?: number;
  sizeMb?: number;
  durationSec?: number;
  siteCheckOk?: boolean;
};

export type AppRecord = {
  id: string;
  name: string;
  url: string; // external https URL, or "sample://store" for the built-in demo site
  icon?: string; // dataURL
  packageName: string;
  bundleId: string;
  createdAt: number;
  updatedAt: number;
  version: string;
  versionCode: number;
  firebaseServerKey: string;
  keystoreReady?: boolean;
  keystoreAlias?: string;
  iosTeamId?: string;
  settings: AppSettings;
  style: AppStyle;
  navigation: NavigationConfig;
  integrations: Integrations;
  monetization: Monetization;
  deepLink: DeepLinkConfig;
  customCode: CustomCode;
  notifications: NotificationItem[];
  builds: BuildRecord[];
};

export type BridgeEvent = {
  id: string;
  method: string;
  result: string; // i18n key of the toast text
  at: number;
};
