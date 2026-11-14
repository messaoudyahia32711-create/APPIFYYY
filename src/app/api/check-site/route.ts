import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type CheckResult = {
  ok: boolean;
  reachable: boolean;
  status?: number;
  https: boolean;
  title: string | null;
  icon: string | null;
  error?: string;
};

export async function POST(req: NextRequest) {
  let rawUrl = "";
  try {
    const body = (await req.json()) as { url?: string };
    rawUrl = (body.url ?? "").trim();
  } catch {
    return NextResponse.json({ ok: false, reachable: false, https: false, title: null, icon: null, error: "bad request" } satisfies CheckResult, { status: 400 });
  }

  let normalized = rawUrl;
  if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;

  let parsed: URL;
  try {
    parsed = new URL(normalized);
    if (!parsed.hostname.includes(".")) throw new Error("invalid host");
  } catch {
    return NextResponse.json({ ok: false, reachable: false, https: false, title: null, icon: null, error: "invalid url" } satisfies CheckResult, { status: 200 });
  }

  try {
    const res = await fetch(parsed.toString(), {
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; AppifyBot/1.0; +https://appify.demo)",
        accept: "text/html,application/xhtml+xml",
      },
    });
    const html = (await res.text()).slice(0, 300_000);

    let title: string | null = null;
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
      title = titleMatch[1].replace(/\s+/g, " ").trim().slice(0, 120) || null;
    }

    let icon: string | null = null;
    const iconTag =
      html.match(/<link[^>]+rel=["'][^"']*(apple-touch-icon|shortcut icon|icon)[^"']*["'][^>]*>/i)?.[0] ?? null;
    if (iconTag) {
      const href = iconTag.match(/href=["']([^"']+)["']/i)?.[1] ?? null;
      if (href) {
        try {
          icon = new URL(href, res.url || parsed).toString();
        } catch {
          icon = null;
        }
      }
    }
    if (!icon) {
      try {
        icon = new URL("/favicon.ico", res.url || parsed).toString();
      } catch {
        icon = null;
      }
    }

    return NextResponse.json({
      ok: true,
      reachable: res.ok,
      status: res.status,
      https: parsed.protocol === "https:",
      title,
      icon,
    } satisfies CheckResult);
  } catch (e) {
    return NextResponse.json({
      ok: true,
      reachable: false,
      https: parsed.protocol === "https:",
      title: null,
      icon: null,
      error: e instanceof Error ? e.message : "fetch failed",
    } satisfies CheckResult);
  }
}
