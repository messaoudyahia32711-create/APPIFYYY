import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promises as fs } from "fs";
import { promisify } from "util";
import path from "path";
import os from "os";

export const runtime = "nodejs";
export const maxDuration = 300;

const run = promisify(execFile);

type BuildPayload = {
  app?: {
    name?: string;
    packageName?: string;
    icon?: string | null;
    [key: string]: unknown;
  };
  build?: { version?: string; versionCode?: number };
};

function asciiFallback(name: string): string {
  const cleaned = name.replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return cleaned && /[a-z0-9]/i.test(cleaned) ? cleaned.slice(0, 48) : "appify-app";
}

export async function POST(req: NextRequest) {
  let payload: BuildPayload;
  try {
    payload = (await req.json()) as BuildPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON body" }, { status: 400 });
  }

  if (!payload?.app) {
    return NextResponse.json({ ok: false, error: "missing app config" }, { status: 400 });
  }

  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const tmp = path.join(os.tmpdir(), `appify-apk-${stamp}`);
  const cfgPath = path.join(tmp, "config.json");
  const apkPath = path.join(tmp, "app.apk");

  try {
    await fs.mkdir(tmp, { recursive: true });
    await fs.writeFile(cfgPath, JSON.stringify(payload), "utf8");

    try {
      await run(
        "python3",
        ["/home/z/my-project/scripts/apk_builder.py", cfgPath, apkPath],
        { timeout: 280_000, maxBuffer: 96 * 1024 * 1024 },
      );
    } catch (e) {
      const err = e as { stderr?: string; stdout?: string; message?: string };
      const detail =
        (err.stderr ?? "").slice(-1800) || (err.stdout ?? "").slice(-800) || err.message || "unknown error";
      return NextResponse.json({ ok: false, error: detail }, { status: 500 });
    }

    let stat;
    try {
      stat = await fs.stat(apkPath);
    } catch {
      return NextResponse.json({ ok: false, error: "builder produced no APK" }, { status: 500 });
    }

    const buf = await fs.readFile(apkPath);
    const name = asciiFallback(payload.app.name ?? "appify-app");
    const version = (payload.build?.version ?? "1.0.0").toString().replace(/[^\w.-]/g, "");
    const code = (payload.build?.versionCode ?? 1).toString().replace(/[^\d]/g, "") || "1";
    const filename = `${name}-v${version}-${code}.apk`;

    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "content-type": "application/vnd.android.package-archive",
        "content-length": String(stat.size),
        "content-disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "build failed" },
      { status: 500 },
    );
  } finally {
    fs.rm(tmp, { recursive: true, force: true }).catch(() => {});
  }
}
