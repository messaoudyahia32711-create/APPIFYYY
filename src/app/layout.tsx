import type { Metadata, Viewport } from "next";
import "@fontsource-variable/cairo";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Appify — حوّل موقعك إلى تطبيق جوال أصلي",
  description:
    "منصة Appify تحوّل موقعك الإلكتروني إلى تطبيق Android وiOS أصلي داخل Native App Shell، مع إشعارات فورية، تنقّل أصلي، مصادقة بيومترية، جسر JavaScript، وتحقيق دخل عبر AdMob — دون كتابة سطر كود واحد.",
  keywords: [
    "تحويل موقع إلى تطبيق",
    "Appify",
    "WebView",
    "تطبيقات جوال",
    "Android",
    "iOS",
    "website to app",
    "native app shell",
  ],
  authors: [{ name: "Appify" }],
  icons: {
    icon: "/appify-icon.svg",
  },
  openGraph: {
    title: "Appify — من موقع إلكتروني إلى تطبيق جوال أصلي",
    description:
      "أدخل رابط موقعك، خصّص شريط التنقل والإشعارات والجسر البرمجي، ثم ابنِ تطبيقك لـ Android وiOS خلال دقائق.",
    siteName: "Appify",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
