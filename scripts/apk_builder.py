#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Appify — real signed APK builder.

Takes a build-config JSON file (see api route) and produces an installable,
signed .apk using the raw Android toolchain (aapt2 -> javac -> d8 ->
zipalign -> apksigner). No Gradle, no AndroidX — framework-only WebView app
shell generated from the user's Appify dashboard configuration.

Usage: python3 apk_builder.py <config.json> <out.apk>
Prints a JSON result line on success/failure.
"""

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile
from io import BytesIO

from PIL import Image, ImageDraw

SDK = "/home/z/my-project/android-sdk"
AAPT2 = os.path.join(SDK, "build-tools", "aapt2")
D8_JAR = os.path.join(SDK, "build-tools", "lib", "d8.jar")
ECJ_JAR = os.path.join(SDK, "ecj.jar")
ANDROID_JAR = os.path.join(SDK, "platform", "android.jar")
KEYSTORE = "/home/z/my-project/android-template/appify-release.jks"
KS_ALIAS = "appify"
KS_PASS = "appify-store-pass"

# icon key -> emoji used inside the native bottom nav / drawer / FAB
EMOJI = {
    "home": "\U0001F3E0", "store": "\U0001F3EA", "shoppingBag": "\U0001F6CD",
    "shoppingCart": "\U0001F6D2", "search": "\U0001F50D", "user": "\U0001F464",
    "heart": "\u2764\uFE0F", "bell": "\U0001F514", "settings": "\u2699\uFE0F",
    "grid": "\U0001F5C2\uFE0F", "tag": "\U0001F3F7\uFE0F", "phone": "\U0001F4DE",
    "mail": "\u2709\uFE0F", "info": "\u2139\uFE0F", "star": "\u2B50",
    "package": "\U0001F4E6", "gift": "\U0001F381", "calendar": "\U0001F4C5",
    "file": "\U0001F4C4", "image": "\U0001F5BC\uFE0F", "play": "\u25B6\uFE0F",
    "news": "\U0001F4F0", "help": "\u2753", "map": "\U0001F4CD",
    "message": "\U0001F4AC", "wallet": "\U0001F45B", "card": "\U0001F4B3",
    "trend": "\U0001F4C8", "zap": "\u26A1", "camera": "\U0001F4F7",
    "qrCode": "\U0001F576\uFE0F", "truck": "\U0001F69A", "headphones": "\U0001F3A7",
    "users": "\U0001F465", "bookmark": "\U0001F516", "compass": "\U0001F9ED",
    "percent": "\U0001F4B9", "plus": "\u2795", "globe": "\U0001F310",
    "menu": "\U0001F4CB", "eye": "\U0001F441\uFE0F", "lock": "\U0001F512",
    "refresh": "\U0001F504", "download": "\U0001F4E5", "upload": "\U0001F4E4",
}


def esc_xml(s: str) -> str:
    return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;").replace("'", "&apos;")


def esc_js(s: str) -> str:
    return (s or "").replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n").replace("\r", "")


def sanitize_package(p: str) -> str:
    p = (p or "").strip().lower()
    p = re.sub(r"[^a-z0-9_.]", "", p)
    segs = [s for s in p.split(".") if s]
    segs = [s if s[0].isalpha() else ("a" + s) for s in segs]
    while len(segs) < 2:
        segs.append("app")
    return ".".join(segs[:6])


def sanitize_dir(s: str) -> str:
    s = re.sub(r"[\\/:*?\"<>|\x00-\x1f]", "-", (s or "app")).strip(". ")
    return (s or "app")[:64]


def parse_color(c: str, fallback: str) -> str:
    c = (c or "").strip()
    if re.fullmatch(r"#[0-9a-fA-F]{6}", c):
        return c
    if re.fullmatch(r"#[0-9a-fA-F]{8}", c):
        return "#" + c[3:]
    return fallback


# ---------------------------------------------------------------- icons ---
def make_icons(res_dir: str, icon_dataurl, name: str):
    """Generate legacy launcher icons + adaptive (API26+) foreground icons."""
    icon_img = None
    if icon_dataurl and isinstance(icon_dataurl, str) and icon_dataurl.startswith("data:"):
        try:
            import base64
            b64 = icon_dataurl.split(",", 1)[1]
            raw = base64.b64decode(b64)
            img = Image.open(BytesIO(raw)).convert("RGBA")
            icon_img = img.resize((512, 512), Image.LANCZOS)
        except Exception:
            icon_img = None

    if icon_img is None:
        # default: purple gradient rounded square with a white bolt glyph
        img = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
        top, bottom = (109, 40, 217), (139, 92, 246)
        for y in range(512):
            t = y / 511.0
            row = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
            ImageDraw.Draw(img).rectangle([0, y, 512, y], fill=row + (255,))
        mask = Image.new("L", (512, 512), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, 511, 511], radius=96, fill=255)
        icon_img = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
        icon_img.paste(img, (0, 0), mask)
        d = ImageDraw.Draw(icon_img)
        # lightning bolt
        bolt = [(300, 92), (188, 280), (258, 280), (212, 420), (330, 238), (256, 238)]
        d.polygon(bolt, fill=(255, 255, 255, 255))

    densities = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
    fg = {"mdpi": 108, "hdpi": 162, "xhdpi": 216, "xxhdpi": 324, "xxxhdpi": 432}

    for dpi, size in densities.items():
        d = os.path.join(res_dir, "mipmap-" + dpi)
        os.makedirs(d, exist_ok=True)
        icon_img.resize((size, size), Image.LANCZOS).save(os.path.join(d, "ic_launcher.png"))

    for dpi, canvas in fg.items():
        d = os.path.join(res_dir, "mipmap-" + dpi)
        content = int(canvas * 0.62)
        icon = icon_img.resize((content, content), Image.LANCZOS)
        layer = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
        off = (canvas - content) // 2
        layer.paste(icon, (off, off), icon)
        layer.save(os.path.join(d, "ic_launcher_fg.png"))

    ad = os.path.join(res_dir, "mipmap-anydpi-v26")
    os.makedirs(ad, exist_ok=True)
    with open(os.path.join(ad, "ic_launcher.xml"), "w", encoding="utf-8") as f:
        f.write(
            '<?xml version="1.0" encoding="utf-8"?>\n'
            '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
            '    <background android:drawable="@color/adaptiveBg"/>\n'
            '    <foreground android:drawable="@mipmap/ic_launcher_fg"/>\n'
            "</adaptive-icon>\n"
        )

    # plain PNG for the splash windowBackground — a <bitmap> element must
    # never reference the adaptive-icon XML (crashes on some Android builds)
    nd = os.path.join(res_dir, "drawable-nodpi")
    os.makedirs(nd, exist_ok=True)
    icon_img.resize((160, 160), Image.LANCZOS).save(os.path.join(nd, "splash_icon.png"))


# ------------------------------------------------------------------ res ---
def write_res(res_dir: str, cfg: dict, pkg: str, name: str, orient: str):
    style = cfg.get("style") or {}
    settings = cfg.get("settings") or {}
    status = parse_color(style.get("statusBarColor"), "#1F2937")
    splash_bg = parse_color(style.get("splashBg"), status)
    adaptive_bg = status

    os.makedirs(os.path.join(res_dir, "values"), exist_ok=True)
    with open(os.path.join(res_dir, "values", "colors.xml"), "w", encoding="utf-8") as f:
        f.write(
            '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
            f'    <color name="statusBar">{status}</color>\n'
            f'    <color name="splashBg">{splash_bg}</color>\n'
            f'    <color name="adaptiveBg">{adaptive_bg}</color>\n'
            "</resources>\n"
        )
    with open(os.path.join(res_dir, "values", "strings.xml"), "w", encoding="utf-8") as f:
        f.write(
            '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
            f'    <string name="app_name">{esc_xml(name)}</string>\n'
            "</resources>\n"
        )
    light = "true" if style.get("statusBarContent") == "dark" else "false"
    with open(os.path.join(res_dir, "values", "styles.xml"), "w", encoding="utf-8") as f:
        f.write(
            '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
            '    <style name="AppifyTheme" parent="android:Theme.Material.Light.NoActionBar">\n'
            '        <item name="android:statusBarColor">@color/statusBar</item>\n'
            f'        <item name="android:windowLightStatusBar">{light}</item>\n'
            '        <item name="android:windowBackground">@drawable/splash</item>\n'
            "    </style>\n</resources>\n"
        )
    dr = os.path.join(res_dir, "drawable")
    os.makedirs(dr, exist_ok=True)
    with open(os.path.join(dr, "splash.xml"), "w", encoding="utf-8") as f:
        f.write(
            '<?xml version="1.0" encoding="utf-8"?>\n'
            '<layer-list xmlns:android="http://schemas.android.com/apk/res/android">\n'
            '    <item android:drawable="@color/splashBg"/>\n'
            '    <item android:gravity="center">\n'
            '        <bitmap android:src="@drawable/splash_icon" android:gravity="center"/>\n'
            "    </item>\n"
            "</layer-list>\n"
        )


# ------------------------------------------------------------- manifest ---
def write_manifest(build_dir: str, cfg: dict, pkg: str, name: str, ver_name: str, ver_code: int):
    st = cfg.get("settings") or {}
    style = cfg.get("style") or {}
    deeplink = cfg.get("deepLink") or {}
    mon = cfg.get("monetization") or {}

    perms = [
        '    <uses-permission android:name="android.permission.INTERNET"/>',
        '    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>',
        '    <uses-permission android:name="android.permission.USE_BIOMETRIC"/>',
    ]
    if st.get("camera") or st.get("qrScanner"):
        perms.append('    <uses-permission android:name="android.permission.CAMERA"/>')
        perms.append('    <uses-feature android:name="android.hardware.camera" android:required="false"/>')
    if st.get("microphone"):
        perms.append('    <uses-permission android:name="android.permission.RECORD_AUDIO"/>')
        perms.append('    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS"/>')
    if st.get("location"):
        perms.append('    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>')
        perms.append('    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>')
    if st.get("vibration"):
        perms.append('    <uses-permission android:name="android.permission.VIBRATE"/>')
    if cfg.get("hasNotifications"):
        perms.append('    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>')

    orientation = {"landscape": "landscape", "auto": "fullSensor"}.get(style.get("orientation"), "portrait")

    meta = ""
    if mon.get("admobEnabled") and (mon.get("admobAppIdAndroid") or "").strip():
        meta = (
            '        <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID"\n'
            f'            android:value="{esc_xml(mon["admobAppIdAndroid"])}"/>\n'
        )

    deeplink_xml = ""
    scheme = (deeplink.get("scheme") or "").strip()
    host = (deeplink.get("host") or "").strip()
    if scheme:
        host_attr = f' android:host="{esc_xml(host)}"' if host else ""
        deeplink_xml = (
            '            <intent-filter android:autoVerify="false">\n'
            '                <action android:name="android.intent.action.VIEW"/>\n'
            '                <category android:name="android.intent.category.DEFAULT"/>\n'
            '                <category android:name="android.intent.category.BROWSABLE"/>\n'
            f'                <data android:scheme="{esc_xml(scheme)}"{host_attr}/>\n'
            "            </intent-filter>\n"
        )

    cleartext = "true" if (cfg.get("startUrl") or "").startswith("http://") else "false"

    manifest = (
        '<?xml version="1.0" encoding="utf-8"?>\n'
        '<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n'
        f'    package="{pkg}"\n'
        f'    android:versionCode="{ver_code}"\n'
        f'    android:versionName="{esc_xml(ver_name)}">\n\n'
        # Modern SDK contract: Android 14+ (API 34) REFUSES to install apps
        # whose targetSdkVersion < 23 ("built for an older version of Android").
        # Without this element aapt2 would default to targetSdk=1 (Android 1.0).
        '    <uses-sdk\n'
        '        android:minSdkVersion="24"\n'
        '        android:targetSdkVersion="34"/>\n\n'
        + "\n".join(perms)
        + f'\n\n    <application\n        android:label="@string/app_name"\n'
        '        android:icon="@mipmap/ic_launcher"\n'
        '        android:theme="@style/AppifyTheme"\n'
        f'        android:usesCleartextTraffic="{cleartext}"\n'
        '        android:hardwareAccelerated="true"\n'
        '        android:supportsRtl="true">\n'
        + meta
        + '        <activity\n            android:name=".MainActivity"\n'
        '            android:exported="true"\n'
        f'            android:screenOrientation="{orientation}"\n'
        '            android:configChanges="orientation|screenSize|keyboardHidden|screenLayout|smallestScreenSize|uiMode"\n'
        '            android:windowSoftInputMode="adjustResize">\n'
        '            <intent-filter>\n'
        '                <action android:name="android.intent.action.MAIN"/>\n'
        '                <category android:name="android.intent.category.LAUNCHER"/>\n'
        "            </intent-filter>\n"
        + deeplink_xml
        + "        </activity>\n"
        '        <service android:name=".AppifyMessagingService" android:exported="false"/>\n'
        "    </application>\n</manifest>\n"
    )
    with open(os.path.join(build_dir, "AndroidManifest.xml"), "w", encoding="utf-8") as f:
        f.write(manifest)


# ----------------------------------------------------------------- java ---
def write_java(build_dir: str, cfg: dict):
    src = os.path.join(build_dir, "src")
    os.makedirs(src, exist_ok=True)
    with open(os.path.join(src, "MainActivity.java"), "w", encoding="utf-8") as f:
        f.write(JAVA_MAIN)
    with open(os.path.join(src, "AppifyBridge.java"), "w", encoding="utf-8") as f:
        f.write(JAVA_BRIDGE)
    with open(os.path.join(src, "AppifyMessagingService.java"), "w", encoding="utf-8") as f:
        f.write(JAVA_SERVICE)


def write_assets(build_dir: str, cfg: dict):
    assets = os.path.join(build_dir, "assets")
    os.makedirs(assets, exist_ok=True)
    with open(os.path.join(assets, "appify.json"), "w", encoding="utf-8") as f:
        json.dump(cfg, f, ensure_ascii=False)


# ------------------------------------------------------- java sources ---
JAVA_MAIN = r"""package __PACKAGE__;

import android.Manifest;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.GeolocationPermissions;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;

/**
 * Appify — native WebView app shell (framework-only, no external deps).
 * All configuration comes from assets/appify.json produced by the Appify
 * dashboard at build time. The JS bridge is exposed as window.AppifyBridge.
 */
public class MainActivity extends Activity {

    static final int REQ_PERMS = 41;
    static final int REQ_FILE = 42;

    JSONObject cfg;
    JSONObject styleCfg;
    JSONObject navCfg;
    JSONObject settingsCfg;

    WebView webView;
    LinearLayout root;
    LinearLayout appBar;
    TextView appBarTitle;
    LinearLayout bottomNav;
    FrameLayout contentFrame;
    FrameLayout drawerScrim;
    LinearLayout drawerList;
    TextView fab;
    String startUrl;
    String lastGoodUrl;
    String currentUrl;
    String pendingNavJson;
    String pendingDrawerJson;
    ValueCallback<Uri[]> fileCallback;
    String deeplinkScheme = "appify";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            loadConfig();
            applyWindowFlags();
            buildUi();
            setupWebView();
            String viaLink = getIntentDeepLink();
            webView.loadUrl(viaLink != null ? viaLink : startUrl);
            if (cfg.optBoolean("hasNotifications", false)) {
                AppifyMessagingService.ensureChannel(this);
            }
            requestNeededPermissions();
        } catch (Throwable t) {
            // never close silently — show a diagnostic screen instead
            showFatalScreen(t);
        }
    }

    void showFatalScreen(Throwable t) {
        try {
            android.util.Log.e("AppifyCrash", "startup failure", t);
            LinearLayout fb = new LinearLayout(this);
            fb.setOrientation(LinearLayout.VERTICAL);
            fb.setGravity(Gravity.CENTER);
            fb.setBackgroundColor(Color.WHITE);
            fb.setPadding(dp(28), dp(28), dp(28), dp(28));
            TextView ic = new TextView(this);
            ic.setText("⚠️");
            ic.setTextSize(38);
            ic.setGravity(Gravity.CENTER);
            fb.addView(ic, new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
            TextView t1 = new TextView(this);
            t1.setText("تعذر فتح التطبيق");
            t1.setTextSize(16);
            t1.setTypeface(Typeface.DEFAULT_BOLD);
            t1.setGravity(Gravity.CENTER);
            fb.addView(t1, new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
            TextView t2 = new TextView(this);
            t2.setText(t == null ? "unknown"
                    : t.getClass().getSimpleName() + ": " + (t.getMessage() == null ? "" : t.getMessage()));
            t2.setTextSize(11);
            t2.setTextColor(Color.parseColor("#6B7280"));
            t2.setGravity(Gravity.CENTER);
            fb.addView(t2, new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
            android.widget.Button retry = new android.widget.Button(this);
            retry.setText("إعادة المحاولة");
            retry.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) {
                    android.os.Process.killProcess(android.os.Process.myPid());
                }
            });
            fb.addView(retry, new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT));
            setContentView(fb);
        } catch (Throwable ignored) {
            finish();
        }
    }

    /* ------------------------------------------------------------ config */
    void loadConfig() {
        cfg = new JSONObject();
        try {
            InputStream is = getAssets().open("appify.json");
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = is.read(buf)) > 0) out.write(buf, 0, n);
            is.close();
            cfg = new JSONObject(new String(out.toByteArray(), "UTF-8"));
        } catch (Exception e) {
            // keep empty config — app still runs with safe defaults
        }
        styleCfg = cfg.optJSONObject("style");
        navCfg = cfg.optJSONObject("navigation");
        settingsCfg = cfg.optJSONObject("settings");
        if (styleCfg == null) styleCfg = new JSONObject();
        if (navCfg == null) navCfg = new JSONObject();
        if (settingsCfg == null) settingsCfg = new JSONObject();
        startUrl = cfg.optString("startUrl", "https://example.com");
        lastGoodUrl = startUrl;
        currentUrl = startUrl;
        JSONObject dl = cfg.optJSONObject("deepLink");
        if (dl != null && dl.optString("scheme", "").length() > 1) {
            deeplinkScheme = dl.optString("scheme");
        }
        pendingNavJson = navCfg.optJSONArray("bottomNavItems") == null
                ? "[]" : navCfg.optJSONArray("bottomNavItems").toString();
        pendingDrawerJson = navCfg.optJSONArray("drawerItems") == null
                ? "[]" : navCfg.optJSONArray("drawerItems").toString();
    }

    void applyWindowFlags() {
        if (settingsCfg.optBoolean("screenshotBlocking", false)
                || settingsCfg.optBoolean("secureSwitcher", false)) {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        }
    }

    /* ---------------------------------------------------------------- ui */
    int dp(float v) {
        return Math.round(TypedValue.applyDimension(
                TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics()));
    }

    int color(String hex, String fallback) {
        try {
            String c = (hex == null || hex.length() < 7) ? fallback : hex;
            if (c.length() == 9) c = "#" + c.substring(3);
            return Color.parseColor(c);
        } catch (Exception e) {
            try { return Color.parseColor(fallback); } catch (Exception e2) { return Color.parseColor("#6D28D9"); }
        }
    }

    void buildUi() {
        boolean appBarEnabled = styleCfg.optBoolean("appBarEnabled", false);
        boolean bottomNavEnabled = navCfg.optBoolean("bottomNavEnabled", false);
        boolean drawerEnabled = navCfg.optBoolean("drawerEnabled", false);
        boolean fabEnabled = navCfg.optBoolean("fabEnabled", false);

        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(color(styleCfg.optString("appBgColor"), "#FFFFFF"));

        if (appBarEnabled) {
            appBar = new LinearLayout(this);
            appBar.setOrientation(LinearLayout.HORIZONTAL);
            appBar.setGravity(Gravity.CENTER_VERTICAL);
            appBar.setPadding(dp(12), dp(6), dp(12), dp(6));
            appBar.setBackgroundColor(color(styleCfg.optString("appBarColor"), "#6D28D9"));
            if (drawerEnabled) {
                TextView burger = new TextView(this);
                burger.setText("☰");
                burger.setTextSize(22);
                burger.setTextColor(Color.WHITE);
                burger.setPadding(dp(10), dp(4), dp(10), dp(4));
                burger.setOnClickListener(new View.OnClickListener() {
                    @Override public void onClick(View v) { openDrawer(); }
                });
                appBar.addView(burger);
            }
            appBarTitle = new TextView(this);
            appBarTitle.setText(styleCfg.optString("appBarTitle", cfg.optString("name", "")));
            appBarTitle.setTextSize(17);
            appBarTitle.setTypeface(Typeface.DEFAULT_BOLD);
            appBarTitle.setTextColor(Color.WHITE);
            appBarTitle.setSingleLine(true);
            LinearLayout.LayoutParams tp = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1);
            tp.setMargins(dp(8), 0, dp(8), 0);
            appBar.addView(appBarTitle, tp);
            root.addView(appBar, new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, dp(54)));
        }

        contentFrame = new FrameLayout(this);
        webView = new WebView(this);
        contentFrame.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        // drawer overlay (hidden by default)
        drawerScrim = new FrameLayout(this);
        drawerScrim.setBackgroundColor(0x73000000);
        drawerScrim.setVisibility(View.GONE);
        drawerScrim.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { drawerScrim.setVisibility(View.GONE); }
        });
        drawerList = new LinearLayout(this);
        drawerList.setOrientation(LinearLayout.VERTICAL);
        drawerList.setBackgroundColor(Color.WHITE);
        FrameLayout.LayoutParams dlp = new FrameLayout.LayoutParams(
                dp(280), ViewGroup.LayoutParams.MATCH_PARENT,
                isRtlLayout() ? Gravity.END : Gravity.START);
        drawerScrim.addView(drawerList, dlp);
        renderDrawer();
        contentFrame.addView(drawerScrim, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        if (fabEnabled) {
            fab = new TextView(this);
            fab.setText(navCfg.optString("fabEmoji", "➕"));
            fab.setTextSize(24);
            fab.setGravity(Gravity.CENTER);
            GradientDrawable fbg = new GradientDrawable();
            fbg.setShape(GradientDrawable.OVAL);
            fbg.setColor(color(navCfg.optString("fabColor"), "#6D28D9"));
            fab.setBackground(fbg);
            int fabSize = dp(56);
            FrameLayout.LayoutParams flp = new FrameLayout.LayoutParams(fabSize, fabSize);
            flp.gravity = Gravity.BOTTOM | ("start".equals(navCfg.optString("fabPosition")) ? Gravity.START : Gravity.END);
            flp.setMargins(dp(16), dp(16), dp(16), dp(16));
            fab.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) {
                    String u = navCfg.optString("fabUrl");
                    if (u.length() > 0) webView.loadUrl(u);
                }
            });
            contentFrame.addView(fab, flp);
        }

        root.addView(contentFrame, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));

        if (bottomNavEnabled && navCfg.optJSONArray("bottomNavItems") != null
                && navCfg.optJSONArray("bottomNavItems").length() > 0) {
            bottomNav = new LinearLayout(this);
            bottomNav.setOrientation(LinearLayout.HORIZONTAL);
            bottomNav.setGravity(Gravity.CENTER);
            bottomNav.setBackgroundColor(color(navCfg.optString("navBgColor"), "#FFFFFF"));
            int h = navCfg.optInt("navHeight", 60);
            root.addView(bottomNav, new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, dp(Math.max(48, Math.min(90, h)))));
            renderBottomNav();
        }

        setContentView(root);
    }

    boolean isRtlLayout() {
        return getResources().getConfiguration().getLayoutDirection() == View.LAYOUT_DIRECTION_RTL;
    }

    /* --------------------------------------------------- bottom nav bar */
    int navActive() { return color(navCfg.optString("navActiveColor"), "#6D28D9"); }
    int navInactive() { return color(navCfg.optString("navInactiveColor"), "#9AA0AE"); }

    void renderBottomNav() {
        if (bottomNav == null) return;
        bottomNav.removeAllViews();
        boolean showLabels = navCfg.optBoolean("navShowLabels", true);
        JSONArray items = parseJsonArray(pendingNavJson);
        for (int i = 0; i < items.length() && i < 6; i++) {
            final JSONObject it = items.optJSONObject(i);
            if (it == null) continue;
            boolean active = it.optString("url", "").equals(currentUrl);
            LinearLayout cell = new LinearLayout(this);
            cell.setOrientation(LinearLayout.VERTICAL);
            cell.setGravity(Gravity.CENTER);
            int col = active ? navActive() : navInactive();
            TextView ic = new TextView(this);
            ic.setText(it.optString("emoji", "📱"));
            ic.setTextSize(20);
            ic.setGravity(Gravity.CENTER);
            cell.addView(ic);
            if (showLabels) {
                TextView lb = new TextView(this);
                lb.setText(it.optString("label", "•"));
                lb.setTextSize(10);
                lb.setTypeface(Typeface.DEFAULT_BOLD);
                lb.setTextColor(col);
                lb.setSingleLine(true);
                cell.addView(lb);
            }
            cell.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) {
                    String u = it.optString("url");
                    if (u.length() > 0) webView.loadUrl(u);
                }
            });
            bottomNav.addView(cell, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1f));
        }
    }

    void updateBottomNav(String json) {
        if (json != null && json.length() > 0) pendingNavJson = json;
        runOnUiThread(new Runnable() {
            @Override public void run() { renderBottomNav(); }
        });
    }

    /* ------------------------------------------------------------ drawer */
    void openDrawer() {
        renderDrawer();
        drawerScrim.setVisibility(View.VISIBLE);
    }

    void renderDrawer() {
        if (drawerList == null) return;
        drawerList.removeAllViews();
        TextView head = new TextView(this);
        GradientDrawable headBg = new GradientDrawable();
        headBg.setColor(color(styleCfg.optString("appBarColor"), "#6D28D9"));
        head.setBackground(headBg);
        head.setText(styleCfg.optString("appBarTitle", cfg.optString("name", "Appify")) + "\n"
                + navCfg.optString("drawerTitle", "Menu"));
        head.setTextColor(Color.WHITE);
        head.setTypeface(Typeface.DEFAULT_BOLD);
        head.setTextSize(15);
        head.setPadding(dp(16), dp(20), dp(16), dp(20));
        drawerList.addView(head, new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        JSONArray items = parseJsonArray(pendingDrawerJson);
        for (int i = 0; i < items.length(); i++) {
            final JSONObject it = items.optJSONObject(i);
            if (it == null) continue;
            TextView row = new TextView(this);
            row.setText("  " + it.optString("emoji", "📱") + "   " + it.optString("label", "•"));
            row.setTextSize(14);
            row.setTextColor(Color.parseColor("#374151"));
            row.setPadding(dp(12), dp(14), dp(12), dp(14));
            row.setOnClickListener(new View.OnClickListener() {
                @Override public void onClick(View v) {
                    drawerScrim.setVisibility(View.GONE);
                    String u = it.optString("url");
                    if (u.length() > 0) webView.loadUrl(u);
                }
            });
            drawerList.addView(row, new LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        }
    }

    void updateDrawer(String json) {
        if (json != null && json.length() > 0) pendingDrawerJson = json;
        runOnUiThread(new Runnable() {
            @Override public void run() { renderDrawer(); }
        });
    }

    void updateAppBar(String title, String barColor) {
        runOnUiThread(new Runnable() {
            @Override public void run() {
                if (title != null && title.length() > 0 && appBarTitle != null) appBarTitle.setText(title);
                if (barColor != null && barColor.length() > 0 && appBar != null) {
                    try { appBar.setBackgroundColor(Color.parseColor(barColor)); } catch (Exception ignored) {}
                }
            }
        });
    }

    /* ----------------------------------------------------------- webview */
    void setupWebView() {
        boolean zoom = settingsCfg.optBoolean("zoom", false);
        boolean autoplay = settingsCfg.optBoolean("autoplayMedia", true);
        boolean popups = settingsCfg.optBoolean("popups", false);
        boolean caching = settingsCfg.optBoolean("caching", true);
        boolean fileUpload = settingsCfg.optBoolean("fileUpload", false);
        boolean fileDownload = settingsCfg.optBoolean("fileDownload", false);
        boolean location = settingsCfg.optBoolean("location", false);
        boolean mic = settingsCfg.optBoolean("microphone", false);
        boolean cam = settingsCfg.optBoolean("camera", false);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setMediaPlaybackRequiresUserGesture(!autoplay);
        s.setSupportZoom(zoom);
        s.setBuiltInZoomControls(zoom);
        s.setDisplayZoomControls(false);
        s.setJavaScriptCanOpenWindowsAutomatically(popups);
        s.setCacheMode(caching ? WebSettings.LOAD_DEFAULT : WebSettings.LOAD_NO_CACHE);
        s.setAllowFileAccess(fileUpload);
        s.setAllowContentAccess(true);
        s.setGeolocationEnabled(true);
        s.setTextZoom(100);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView v, String url) {
                return handleNavigation(url);
            }
            @Override public void onPageStarted(WebView v, String url, Bitmap favicon) {
                super.onPageStarted(v, url, favicon);
                lastGoodUrl = url;
                currentUrl = url;
                updateNavVisibilityForUrl(url);
                renderBottomNav();
            }
            @Override public void onPageFinished(WebView v, String url) {
                super.onPageFinished(v, url);
                injectCustomJs();
            }
            @Override public void onReceivedError(WebView v, WebResourceRequest req, WebResourceError err) {
                super.onReceivedError(v, req, err);
                if (req.isForMainFrame()) showErrorPage();
            }
            @Override public void onReceivedHttpError(WebView v, WebResourceRequest req, WebResourceResponse resp) {
                super.onReceivedHttpError(v, req, resp);
                if (req.isForMainFrame()) showErrorPage();
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback cb) {
                cb.invoke(origin, location, false);
            }
            @Override public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (!fileUpload) return false;
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                try {
                    Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                    i.addCategory(Intent.CATEGORY_OPENABLE);
                    i.setType("*/*");
                    startActivityForResult(Intent.createChooser(i, ""), REQ_FILE);
                    return true;
                } catch (Exception e) {
                    fileCallback = null;
                    return false;
                }
            }
            @Override public void onPermissionRequest(final android.webkit.PermissionRequest request) {
                runOnUiThread(new Runnable() {
                    @Override public void run() {
                        if (mic || cam) request.grant(request.getResources());
                        else request.deny();
                    }
                });
            }
        });

        webView.addJavascriptInterface(new AppifyBridge(this), "AppifyBridge");

        webView.setDownloadListener(new android.webkit.DownloadListener() {
            @Override public void onDownloadStart(String url, String ua, String cd, String mime, long len) {
                if (!fileDownload) return;
                try {
                    DownloadManager.Request r = new DownloadManager.Request(Uri.parse(url));
                    String name = URLUtil.guessFileName(url, cd, mime);
                    r.setTitle(name);
                    r.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    r.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, name);
                    DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
                    if (dm != null) {
                        dm.enqueue(r);
                        toast("بدأ التنزيل: " + name);
                    }
                } catch (Exception e) {
                    openExternal(url);
                }
            }
        });
    }

    /* --------------------------------------------------------- routing */
    boolean handleNavigation(String url) {
        Uri u = Uri.parse(url);
        String scheme = u.getScheme() == null ? "" : u.getScheme().toLowerCase();
        if (scheme.equals("http") || scheme.equals("https")) {
            JSONArray pats = settingsCfg.optJSONArray("externalUrlPatterns");
            if (pats != null) {
                for (int i = 0; i < pats.length(); i++) {
                    if (wildcardMatch(pats.optString(i), url)) { openExternal(url); return true; }
                }
            }
            return false;
        }
        if (scheme.equals(deeplinkScheme.toLowerCase())) { handleDeepLink(url); return true; }
        if (scheme.equals("mailto") || scheme.equals("tel") || scheme.equals("sms")
                || scheme.equals("whatsapp") || scheme.equals("intent")) {
            openExternal(url);
            return true;
        }
        return false;
    }

    boolean wildcardMatch(String pattern, String url) {
        if (pattern == null || pattern.length() == 0) return false;
        String rx = pattern.replace("\\", "\\\\").replace(".", "\\.").replace("*", ".*");
        try { return url.toLowerCase().matches("(?i).*" + rx + ".*"); }
        catch (Exception e) { return false; }
    }

    void openExternal(String url) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
        } catch (Exception e) {
            toast("لا يوجد تطبيق يفتح هذا الرابط");
        }
    }

    void handleDeepLink(String input) {
        try {
            String target = input;
            if (!input.contains("://")) {
                String host = "";
                JSONObject dl = cfg.optJSONObject("deepLink");
                if (dl != null) host = dl.optString("host", "");
                target = deeplinkScheme + "://" + host + (input.startsWith("/") ? input : "/" + input);
            }
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(target)));
        } catch (Exception e) {
            toast("رابط غير صالح");
        }
    }

    String getIntentDeepLink() {
        Uri d = getIntent() == null ? null : getIntent().getData();
        return d != null ? d.toString() : null;
    }

    void updateNavVisibilityForUrl(String url) {
        if (bottomNav == null) return;
        JSONArray pats = navCfg.optJSONArray("hideOnPatterns");
        boolean hide = false;
        if (pats != null) {
            for (int i = 0; i < pats.length(); i++) {
                if (wildcardMatch(pats.optString(i), url)) { hide = true; break; }
            }
        }
        bottomNav.setVisibility(hide ? View.GONE : View.VISIBLE);
    }

    void showErrorPage() {
        String accent = styleCfg.optString("appBarColor", "#6D28D9");
        String html = "<html><head><meta name='viewport' content='width=device-width,initial-scale=1'>"
            + "<style>body{background:#fff;font-family:sans-serif;display:flex;align-items:center;"
            + "justify-content:center;height:100vh;margin:0}.box{text-align:center;padding:24px}"
            + ".icon{font-size:44px}h2{color:#111827;font-size:18px;margin:8px 0}"
            + "p{color:#6b7280;font-size:14px;margin:4px 0 20px}"
            + "a.btn{display:inline-block;background:" + accent + ";color:#fff;padding:12px 30px;"
            + "border-radius:14px;text-decoration:none;font-weight:bold;font-size:14px}</style></head>"
            + "<body><div class='box'><div class='icon'>&#128225;</div>"
            + "<h2>No connection</h2><p>The page could not be loaded.<br>Check your connection and retry.</p>"
            + "<a class='btn' href=\"" + lastGoodUrl + "\">Retry</a></div></body></html>";
        webView.loadDataWithBaseURL(null, html, "text/html", "utf-8", lastGoodUrl);
    }

    void injectCustomJs() {
        final String js = cfg.optString("customJs", "");
        if (js.length() > 0) {
            runOnUiThread(new Runnable() {
                @Override public void run() { webView.evaluateJavascript(js, null); }
            });
        }
    }

    /* ------------------------------------------------------ permissions */
    void requestNeededPermissions() {
        ArrayList<String> perms = new ArrayList<String>();
        if (settingsCfg.optBoolean("camera", false) || settingsCfg.optBoolean("qrScanner", false))
            perms.add(Manifest.permission.CAMERA);
        if (settingsCfg.optBoolean("microphone", false))
            perms.add(Manifest.permission.RECORD_AUDIO);
        if (settingsCfg.optBoolean("location", false)) {
            perms.add(Manifest.permission.ACCESS_FINE_LOCATION);
            perms.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        }
        if (Build.VERSION.SDK_INT >= 33 && cfg.optBoolean("hasNotifications", false))
            perms.add("android.permission.POST_NOTIFICATIONS");
        if (perms.size() > 0) {
            requestPermissions(perms.toArray(new String[0]), REQ_PERMS);
        }
    }

    boolean requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= 33) {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, REQ_PERMS);
                }
            });
        }
        return true;
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] results) {
        super.onRequestPermissionsResult(code, perms, results);
        if (code == REQ_PERMS && webView != null) {
            webView.reload();
        }
    }

    /* -------------------------------------------------------- biometric */
    void startBiometricAuth(final String title) {
        if (Build.VERSION.SDK_INT < 28) {
            toast("المصادقة الحيوية غير مدعومة على هذا الجهاز");
            return;
        }
        try {
            android.hardware.biometrics.BiometricPrompt bp =
                new android.hardware.biometrics.BiometricPrompt.Builder(this)
                    .setTitle(title == null || title.length() == 0 ? "تأكيد الهوية" : title)
                    .setNegativeButton("إلغاء", getMainExecutor(), new DialogInterface.OnClickListener() {
                        @Override public void onClick(DialogInterface d, int w) { }
                    })
                    .build();
            bp.authenticate(new android.os.CancellationSignal(),
                getMainExecutor(),
                new android.hardware.biometrics.BiometricPrompt.AuthenticationCallback() {
                    @Override public void onAuthenticationSucceeded(
                            android.hardware.biometrics.BiometricPrompt.AuthenticationResult result) {
                        evaluateJs("if(window.AppifyBridge&&AppifyBridge.onBiometricResult)" +
                                "AppifyBridge.onBiometricResult('success')");
                    }
                    @Override public void onAuthenticationError(int code, CharSequence err) {
                        evaluateJs("if(window.AppifyBridge&&AppifyBridge.onBiometricResult)" +
                                "AppifyBridge.onBiometricResult('error')");
                    }
                });
        } catch (Exception e) {
            toast("تعذر تشغيل المصادقة الحيوية");
        }
    }

    void evaluateJs(final String js) {
        runOnUiThread(new Runnable() {
            @Override public void run() {
                if (webView != null) webView.evaluateJavascript(js, null);
            }
        });
    }

    /* ------------------------------------------------------------ misc */
    void toast(String msg) {
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show();
    }

    void vibratePattern(String pattern) {
        try {
            if (!settingsCfg.optBoolean("vibration", false)) return;
            Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (v == null) return;
            long[] ms = parsePattern(pattern);
            if (Build.VERSION.SDK_INT >= 26) {
                v.vibrate(VibrationEffect.createWaveform(ms, -1));
            } else {
                v.vibrate(ms, -1);
            }
        } catch (Exception ignored) { }
    }

    long[] parsePattern(String pattern) {
        long[] def = {40, 60, 40};
        try {
            JSONArray a = new JSONArray(pattern == null || pattern.length() == 0 ? "[40,60,40]" : pattern);
            long[] out = new long[a.length()];
            for (int i = 0; i < a.length(); i++) out[i] = Math.max(10, Math.min(3000, a.optLong(i, 40)));
            return out.length > 0 ? out : def;
        } catch (Exception e) { return def; }
    }

    String getDeviceInfoJson() {
        JSONObject o = new JSONObject();
        try {
            o.put("platform", "android");
            o.put("app", cfg.optString("name"));
            o.put("packageName", cfg.optString("packageName"));
            o.put("version", cfg.optString("version"));
            o.put("versionCode", cfg.optInt("versionCode"));
            o.put("osVersion", Build.VERSION.RELEASE);
            o.put("sdk", Build.VERSION.SDK_INT);
            o.put("model", Build.MANUFACTURER + " " + Build.MODEL);
            o.put("language", getResources().getConfiguration().locale.getLanguage());
            o.put("screenWidth", getResources().getDisplayMetrics().widthPixels);
            o.put("screenHeight", getResources().getDisplayMetrics().heightPixels);
        } catch (Exception ignored) { }
        return o.toString();
    }

    JSONArray parseJsonArray(String json) {
        try { return new JSONArray(json == null || json.length() == 0 ? "[]" : json); }
        catch (Exception e) { return new JSONArray(); }
    }

    @Override
    public void onBackPressed() {
        if (drawerScrim != null && drawerScrim.getVisibility() == View.VISIBLE) {
            drawerScrim.setVisibility(View.GONE);
            return;
        }
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }
        moveTaskToBack(true);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQ_FILE && fileCallback != null) {
            fileCallback.onReceiveValue(
                    WebChromeClient.FileChooserParams.parseResult(resultCode, data));
            fileCallback = null;
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }
}"""

JAVA_BRIDGE = r"""package __PACKAGE__;

import android.webkit.JavascriptInterface;

/**
 * Appify — JavaScript bridge exposed to the page as window.AppifyBridge.
 * The page (or injected custom JS) calls these methods to use native
 * device features, exactly like the AppifyBridge contract in the dashboard.
 */
public class AppifyBridge {

    private final MainActivity activity;

    public AppifyBridge(MainActivity activity) {
        this.activity = activity;
    }

    @JavascriptInterface
    public String getDeviceInfo() {
        return activity.getDeviceInfoJson();
    }

    @JavascriptInterface
    public void showToast(String msg) {
        if (msg != null && msg.length() > 0) activity.toast(msg);
    }

    @JavascriptInterface
    public void vibrate(String pattern) {
        activity.vibratePattern(pattern);
    }

    @JavascriptInterface
    public void share(String title, String url) {
        try {
            android.content.Intent i = new android.content.Intent(android.content.Intent.ACTION_SEND);
            i.setType("text/plain");
            i.putExtra(android.content.Intent.EXTRA_SUBJECT, title == null ? "" : title);
            i.putExtra(android.content.Intent.EXTRA_TEXT, url == null ? "" : url);
            activity.startActivity(android.content.Intent.createChooser(i, "مشاركة عبر"));
        } catch (Exception ignored) { }
    }

    @JavascriptInterface
    public void openExternal(String url) {
        if (url != null && url.length() > 0) activity.openExternal(url);
    }

    @JavascriptInterface
    public void exitApp() {
        activity.runOnUiThread(new Runnable() {
            @Override public void run() { activity.finish(); }
        });
    }

    @JavascriptInterface
    public void updateBottomNavigationBar(String itemsJson) {
        activity.updateBottomNav(itemsJson);
    }

    @JavascriptInterface
    public void updateNavigationDrawer(String itemsJson) {
        activity.updateDrawer(itemsJson);
    }

    @JavascriptInterface
    public void updateAppBar(String title, String color) {
        activity.updateAppBar(title, color);
    }

    @JavascriptInterface
    public void openDeepLink(String path) {
        if (path != null && path.length() > 0) activity.handleDeepLink(path);
    }

    @JavascriptInterface
    public boolean requestPushPermission() {
        return activity.requestNotificationPermission();
    }

    @JavascriptInterface
    public boolean startBiometricAuthentication(String title) {
        activity.startBiometricAuth(title);
        return true;
    }

    @JavascriptInterface
    public void logAnalyticsEvent(String name) {
        android.util.Log.i("AppifyAnalytics", name == null ? "" : name);
    }

    @JavascriptInterface
    public String openQRScanner() {
        activity.toast("الماسح الضوئي يتطلب تفعيل الكاميرا من إعدادات التطبيق");
        return "qr:unavailable";
    }
}"""


JAVA_SERVICE = r"""package __PACKAGE__;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;

/**
 * Appify — lightweight in-app notification service (framework-only).
 * The class is declared in the manifest, so it MUST exist in the dex;
 * some OEM Android builds validate components at first launch.
 */
public class AppifyMessagingService extends Service {

    public static final String CHANNEL_ID = "appify_general";

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String title = intent == null ? "" : intent.getStringExtra("title");
        String body = intent == null ? "" : intent.getStringExtra("body");
        showNotification(this, title, body);
        return START_NOT_STICKY;
    }

    public static void ensureChannel(Context ctx) {
        if (Build.VERSION.SDK_INT < 26) return;
        try {
            NotificationManager nm =
                (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null && nm.getNotificationChannel(CHANNEL_ID) == null) {
                NotificationChannel ch = new NotificationChannel(
                    CHANNEL_ID, "General", NotificationManager.IMPORTANCE_DEFAULT);
                ch.setDescription("Appify notifications");
                nm.createNotificationChannel(ch);
            }
        } catch (Exception ignored) { }
    }

    public static void showNotification(Context ctx, String title, String body) {
        try {
            ensureChannel(ctx);
            NotificationManager nm =
                (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;
            Notification.Builder b = Build.VERSION.SDK_INT >= 26
                ? new Notification.Builder(ctx, CHANNEL_ID)
                : new Notification.Builder(ctx);
            int icon = ctx.getApplicationInfo().icon;
            b.setSmallIcon(icon != 0 ? icon : android.R.drawable.ic_dialog_info)
                .setContentTitle(title == null || title.length() == 0
                    ? ctx.getString(ctx.getApplicationInfo().labelRes)
                    : title)
                .setContentText(body == null ? "" : body)
                .setAutoCancel(true);
            nm.notify((int) System.currentTimeMillis() % 100000, b.build());
        } catch (Exception ignored) { }
    }
}"""


# -------------------------------------------------------------- build ---
class BuildError(Exception):
    pass


def run(cmd, **kw):
    cmd = [str(c) for c in cmd]
    p = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if p.returncode != 0:
        raise BuildError(
            "command failed: " + " ".join(cmd[:6]) + "\n--- stdout ---\n" +
            (p.stdout or "")[-1500:] + "\n--- stderr ---\n" + (p.stderr or "")[-3500:]
        )
    return p


def fix_nav_items(items):
    out = []
    if not isinstance(items, list):
        return out
    for it in items:
        if not isinstance(it, dict):
            continue
        entry = {
            "label": str(it.get("label") or "•")[:40],
            "url": it.get("url") or "",
            "emoji": EMOJI.get(it.get("icon"), "\U0001F4F1"),
        }
        out.append(entry)
    return out


def normalize_urls(items, start_url):
    for it in items:
        u = it.get("url") or ""
        if not u.startswith(("http://", "https://")):
            it["url"] = start_url
    return items


def build(config_path: str, out_path: str) -> dict:
    with open(config_path, encoding="utf-8") as f:
        raw = json.load(f)

    app = raw.get("app") or {}
    b = raw.get("build") or {}

    name = (str(app.get("name") or "App").strip() or "App")[:40]
    pkg = sanitize_package(str(app.get("packageName") or "com.appify.demo"))
    ver_name = re.sub(r"[^0-9A-Za-z.\-_]", "", str(b.get("version") or app.get("version") or "1.0.0")) or "1.0.0"
    try:
        ver_code = max(1, int(b.get("versionCode") or app.get("versionCode") or 1))
    except Exception:
        ver_code = 1

    url = str(app.get("url") or "").strip()
    if not url.startswith(("http://", "https://")):
        url = "https://example.com"  # internal demo URLs (sample://) have no meaning in a real APK

    settings = app.get("settings") or {}
    nav = app.get("navigation") or {}
    style = app.get("style") or {}

    nav_items = normalize_urls(fix_nav_items(nav.get("bottomNavItems")), url)
    drawer_items = normalize_urls(fix_nav_items(nav.get("drawerItems")), url)
    fab_url = url if not str(nav.get("fabUrl") or "").startswith(("http://", "https://")) else nav.get("fabUrl")

    nav = dict(nav)
    nav["bottomNavItems"] = nav_items
    nav["drawerItems"] = drawer_items
    if not nav.get("bottomNavEnabled"):
        nav["bottomNavItems"] = []
    nav["fabUrl"] = fab_url
    nav["fabEmoji"] = EMOJI.get(nav.get("fabIcon"), "\u2795")

    cfg = {
        "name": name,
        "packageName": pkg,
        "startUrl": url,
        "version": ver_name,
        "versionCode": ver_code,
        "settings": settings,
        "style": style,
        "navigation": nav,
        "deepLink": app.get("deepLink") or {},
        "customJs": str((app.get("customCode") or {}).get("js") or "").strip(),
        "hasNotifications": bool(app.get("notifications")) or bool(app.get("firebaseServerKey")),
    }

    work = tempfile.mkdtemp(prefix="appify-apk-")
    try:
        res_dir = os.path.join(work, "res")
        os.makedirs(res_dir, exist_ok=True)
        make_icons(res_dir, app.get("icon"), name)
        write_res(res_dir, cfg, pkg, name, style.get("orientation", "portrait"))
        write_assets(work, cfg)
        write_java(work, cfg)
        write_manifest(work, cfg, pkg, name, ver_name, ver_code)

        # patch package name into java sources
        for jf in ("MainActivity.java", "AppifyBridge.java", "AppifyMessagingService.java"):
            p = os.path.join(work, "src", jf)
            with open(p, encoding="utf-8") as f:
                src = f.read()
            src = src.replace("package __PACKAGE__;", f"package {pkg};")
            with open(p, "w", encoding="utf-8") as f:
                f.write(src)

        gen_dir = os.path.join(work, "gen")
        classes_dir = os.path.join(work, "classes")
        dex_dir = os.path.join(work, "dex")
        os.makedirs(gen_dir, exist_ok=True)
        os.makedirs(classes_dir, exist_ok=True)
        os.makedirs(dex_dir, exist_ok=True)

        res_zip = os.path.join(work, "res.zip")
        run([AAPT2, "compile", "--dir", res_dir, "-o", res_zip])

        base_apk = os.path.join(work, "base.apk")
        run([AAPT2, "link", "-o", base_apk, "-I", ANDROID_JAR,
             "--manifest", os.path.join(work, "AndroidManifest.xml"),
             "--min-sdk-version", "24",
             "--target-sdk-version", "34",
             "-A", os.path.join(work, "assets"),
             "--java", gen_dir, "--auto-add-overlay", res_zip])

        java_files = []
        for root_dir, _, files in os.walk(gen_dir):
            for f in files:
                if f.endswith(".java"):
                    java_files.append(os.path.join(root_dir, f))
        for f in os.listdir(os.path.join(work, "src")):
            if f.endswith(".java"):
                java_files.append(os.path.join(work, "src", f))

        # Eclipse batch compiler (works on a JRE; no JDK needed)
        run(["java", "-jar", ECJ_JAR, "-source", "1.8", "-target", "1.8",
             "-encoding", "UTF-8", "-nowarn", "-proc:none",
             "-classpath", ANDROID_JAR, "-d", classes_dir] + java_files)

        classes_zip = os.path.join(work, "classes.zip")
        with zipfile.ZipFile(classes_zip, "w", zipfile.ZIP_DEFLATED) as z:
            for root_dir, _, files in os.walk(classes_dir):
                for f in files:
                    fp = os.path.join(root_dir, f)
                    z.write(fp, os.path.relpath(fp, classes_dir))

        run(["java", "-cp", D8_JAR, "com.android.tools.r8.D8", "--release",
             "--lib", ANDROID_JAR, "--min-api", "24", "--output", dex_dir, classes_zip])

        # append classes.dex to the linked APK (keeps resources.arsc stored)
        with zipfile.ZipFile(base_apk, "a", zipfile.ZIP_DEFLATED) as z:
            z.write(os.path.join(dex_dir, "classes.dex"), "classes.dex")

        aligned = os.path.join(work, "aligned.apk")
        run([os.path.join(SDK, "build-tools", "zipalign"), "-f", "-p", "4", base_apk, aligned])

        final_tmp = out_path + ".part"
        run([os.path.join(SDK, "build-tools", "apksigner"), "sign",
             "--ks", KEYSTORE, "--ks-key-alias", KS_ALIAS,
             "--ks-pass", f"pass:{KS_PASS}", "--key-pass", f"pass:{KS_PASS}",
             "--out", final_tmp, aligned])

        run([os.path.join(SDK, "build-tools", "apksigner"), "verify", final_tmp])
        shutil.move(final_tmp, out_path)

        size = os.path.getsize(out_path)
        return {"ok": True, "path": out_path, "sizeBytes": size, "package": pkg}
    finally:
        shutil.rmtree(work, ignore_errors=True)


def main():
    if len(sys.argv) < 3:
        print(json.dumps({"ok": False, "error": "usage: apk_builder.py <config.json> <out.apk>"}))
        sys.exit(2)
    try:
        result = build(sys.argv[1], sys.argv[2])
        print(json.dumps(result))
        sys.exit(0)
    except BuildError as e:
        print(json.dumps({"ok": False, "error": str(e)[:4000]}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"ok": False, "error": f"{type(e).__name__}: {e}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
