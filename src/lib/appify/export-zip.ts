"use client";

import JSZip from "jszip";
import type { AppRecord, BuildRecord } from "./types";

/* ------------------------------------------------------------------ */
/*  Builds the deliverable configuration package (a real .zip file)    */
/*  for a finished build. In this demo environment the native binary   */
/*  itself is simulated — the ZIP hands the developer everything the   */
/*  real build pipeline would need (config, manifest, gradle, shell).  */
/*  It NEVER mutates the app record: downloading is side-effect free.  */
/* ------------------------------------------------------------------ */

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] ?? c);
}

function dataUrlToBase64(dataUrl: string): { b64: string; mime: string } | null {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return null;
  return { mime: m[1], b64: m[2] };
}

function generateManifest(app: AppRecord): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<!-- Appify — generated AndroidManifest for ${escapeXml(app.name)} -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${app.packageName}"
    android:versionCode="${app.versionCode}"
    android:versionName="${app.version}">

    <uses-permission android:name="android.permission.INTERNET" />
${app.settings.camera ? '    <uses-permission android:name="android.permission.CAMERA" />\n' : ""}${app.settings.microphone ? '    <uses-permission android:name="android.permission.RECORD_AUDIO" />\n' : ""}${app.settings.location ? '    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />\n' : ""}${app.settings.vibration ? '    <uses-permission android:name="android.permission.VIBRATE" />\n' : ""}${app.notifications.length > 0 || app.firebaseServerKey ? '    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />\n' : ""}
    <application
        android:label="${escapeXml(app.name)}"
        android:usesCleartextTraffic="false"
        android:theme="@style/AppifyTheme">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="${app.style.orientation === "landscape" ? "landscape" : app.style.orientation === "auto" ? "fullSensor" : "portrait"}"
            android:configChanges="orientation|screenSize|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <!-- Appify deep links -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="${app.deepLink.scheme}" android:host="${app.deepLink.host}" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`;
}

function generateGradle(app: AppRecord, build: BuildRecord): string {
  return `// Appify — app/build.gradle for ${app.name}
plugins {
    id 'com.android.application'
}

android {
    namespace '${app.packageName}'
    compileSdk 34

    defaultConfig {
        applicationId "${app.packageName}"
        minSdk 23
        targetSdk 34
        versionCode ${build.versionCode}
        versionName "${build.version}"
    }

    signingConfigs {
        release {
            storeFile file('keystore/appify-release.jks')
            storePassword System.getenv("APIFY_STORE_PASS")
            keyAlias '${app.keystoreAlias || "appify-release"}'
            keyPassword System.getenv("APIFY_STORE_PASS")
        }
    }

    buildTypes {
        release {
            minifyEnabled true
            signingConfig signingConfigs.release
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.7.0'
    implementation 'androidx.webkit:webkit:1.11.0'
${app.monetization.admobEnabled ? "    implementation 'com.google.android.gms:play-services-ads:23.0.0'\n" : ""}${app.firebaseServerKey ? "    implementation platform('com.google.firebase:firebase-bom:33.0.0')\n    implementation 'com.google.firebase:firebase-messaging'\n" : ""}
}
`;
}

function generateMainActivity(app: AppRecord): string {
  return `// Appify — WebView Native App Shell
package ${app.packageName}

import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebSettings
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        setContentView(webView)

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = ${!app.settings.autoplayMedia}
            allowFileAccess = ${app.settings.fileUpload}
            setSupportZoom(${app.settings.zoom})
            cacheMode = if (${app.settings.caching}) WebSettings.LOAD_DEFAULT else WebSettings.LOAD_NO_CACHE
        }

        WebView.setWebContentsDebuggingEnabled(false)
        webView.addJavascriptInterface(AppifyBridge(this), "AppifyBridge")
        webView.loadUrl("${app.url}")
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) webView.goBack() else super.onBackPressed()
    }
}
`;
}

function generateBridgeStub(app: AppRecord): string {
  return `// Appify — JavaScript bridge stub (AppifyBridge)
// Exposed to the page as window.AppifyBridge
package ${app.packageName}

import android.content.Context
import android.webkit.JavascriptInterface

class AppifyBridge(private val context: Context) {

    @JavascriptInterface
    fun requestUserIdentification(): String = "identity:granted"

    @JavascriptInterface
    fun startBiometricAuthentication(title: String?): Boolean = true

    @JavascriptInterface
    fun signInWithGoogle(): String = "google:pending"

    @JavascriptInterface
    fun signInWithApple(): String = "apple:pending"

    @JavascriptInterface
    fun showInterstitialAd() { /* AdMob interstitial */ }

    @JavascriptInterface
    fun requestPushPermission(): Boolean = true

    @JavascriptInterface
    fun vibrate(pattern: String?) { /* Vibrator service */ }

    @JavascriptInterface
    fun openQRScanner(onResult: String?) { /* ML Kit scanner */ }

    @JavascriptInterface
    fun updateBottomNavigationBar(items: String?) { /* runtime nav update */ }

    @JavascriptInterface
    fun updateNavigationDrawer(items: String?) { /* runtime drawer update */ }

    @JavascriptInterface
    fun updateAppBar(title: String?, color: String?) { /* runtime app bar update */ }

    @JavascriptInterface
    fun logAnalyticsEvent(name: String?) { /* Firebase / AppsFlyer / Meta */ }

    @JavascriptInterface
    fun openDeepLink(path: String?) { /* deep link router */ }
}
`;
}

function generateReadme(app: AppRecord, build: BuildRecord, lang: string): string {
  const ar = lang === "ar";
  const lines = ar
    ? [
        `# ${app.name} — حزمة تكوين Appify`,
        "",
        `الإصدار: ${build.version} (${build.versionCode}) — ${build.output.toUpperCase()} — ${build.platform === "ios" ? "iOS" : "Android"}`,
        "",
        "هذه الحزمة تُنتَج عند كل بناء ناجح ولا تؤثر على مشروعك في لوحة التحكم.",
        "",
        "## المحتويات",
        "- `appify-config.json` — التكوين الكامل للتطبيق كما هو في لوحة التحكم",
        "- `AndroidManifest.xml` — بيان الأذونات والروابط العميقة",
        "- `app/build.gradle` — إعداد البناء والتوقيع",
        "- `MainActivity.kt` — غلاف WebView الأصلي (Native App Shell)",
        "- `AppifyBridge.kt` — جسر JavaScript بين موقعك والتطبيق",
        "- `assets/www/index.html` — نقطة تحميل موقعك",
        app.icon ? "- `icon.png` — أيقونة التطبيق (512×512)" : "",
        "",
        "## ملاحظة",
        "في هذه البيئة التجريبية يُحاكى الملف الثنائي النهائي؛ عند ربط حساب البناء السحابي تُستخدم هذه الحزمة نفسها لإنتاج APK/AAB/IPA موقّع جاهز للرفع على المتاجر بحسابك أنت.",
      ].filter(Boolean)
    : [
        `# ${app.name} — Appify configuration package`,
        "",
        `Version: ${build.version} (${build.versionCode}) — ${build.output.toUpperCase()} — ${build.platform === "ios" ? "iOS" : "Android"}`,
        "",
        "This package is produced on every successful build and never mutates your project in the dashboard.",
        "",
        "## Contents",
        "- `appify-config.json` — full app configuration exactly as configured",
        "- `AndroidManifest.xml` — permissions and deep links",
        "- `app/build.gradle` — build and signing setup",
        "- `MainActivity.kt` — the native WebView App Shell",
        "- `AppifyBridge.kt` — JavaScript bridge between your site and the app",
        "- `assets/www/index.html` — your site entry point",
        app.icon ? "- `icon.png` — app icon (512×512)" : "",
        "",
        "## Note",
        "The final binary is simulated in this demo environment; when a cloud build account is connected, this same package produces a signed APK/AAB/IPA ready to upload to the stores under your own developer account.",
      ].filter(Boolean);
  return lines.join("\n") + "\n";
}

export async function downloadBuildPackage(app: AppRecord, build: BuildRecord, lang: string): Promise<void> {
  const zip = new JSZip();

  zip.file("appify-config.json", JSON.stringify({ ...app, builds: app.builds }, null, 2));
  if (build.platform === "android") {
    zip.file("AndroidManifest.xml", generateManifest(app));
    zip.file("app/build.gradle", generateGradle(app, build));
    zip.file("app/src/main/java/MainActivity.kt", generateMainActivity(app));
    zip.file("app/src/main/java/AppifyBridge.kt", generateBridgeStub(app));
  }
  zip.file("assets/www/index.html", `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${app.url}"><title>${escapeXml(app.name)}</title></head><body>Redirecting to ${escapeXml(app.url)}…</body></html>\n`);
  zip.file("README.md", generateReadme(app, build, lang));

  if (app.icon) {
    const icon = dataUrlToBase64(app.icon);
    if (icon && icon.mime === "image/png") {
      zip.file("icon.png", icon.b64, { base64: true });
    }
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const safeName = (app.name || "app").replace(/[^\p{L}\p{N}._-]+/gu, "-");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName}-v${build.version}-${build.versionCode}-${build.output}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}
