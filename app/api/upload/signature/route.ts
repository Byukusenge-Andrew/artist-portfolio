// Cloudinary support removed from UI, but keep endpoint harmless if hit
import { NextResponse } from "next/server";

function parseFromUrl(url?: string) {
  if (!url) return {} as { cloudName?: string; apiKey?: string; apiSecret?: string };
  try {
    const u = new URL(url);
    // cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    const cloudName = u.hostname;
    const apiKey = decodeURIComponent(u.username);
    const apiSecret = decodeURIComponent(u.password);
    return { cloudName, apiKey, apiSecret };
  } catch {
    return {} as { cloudName?: string; apiKey?: string; apiSecret?: string };
  }
}

async function handleSign(req: Request) {
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  let apiKey = process.env.CLOUDINARY_API_KEY;
  let apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    const parsed = parseFromUrl(process.env.CLOUDINARY_URL);
    cloudName = cloudName || parsed.cloudName;
    apiKey = apiKey || parsed.apiKey;
    apiSecret = apiSecret || parsed.apiSecret;
  }

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary env vars not set (require CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET)" },
      { status: 500 }
    );
  }

  // Gather params coming from the widget (GET query or POST JSON)
  let params: Record<string, any> = {};
  try {
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      if (body && typeof body === "object") params = body;
    } else {
      const search = new URL(req.url).searchParams;
      search.forEach((value, key) => {
        params[key] = value;
      });
    }
  } catch {
    // ignore
  }

  if (!params.timestamp) {
    params.timestamp = Math.floor(Date.now() / 1000);
  }

  // No signing when Cloudinary not configured
  if (!apiSecret) {
    return NextResponse.json({ error: "Cloudinary not configured" }, { status: 400 });
  }
  // Minimal SHA1 sign (to avoid importing cloudinary if not needed)
  const crypto = await import("crypto");
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const signature = crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");

  return NextResponse.json({
    timestamp: params.timestamp,
    signature,
    apiKey,
    cloudName,
  });
}

export async function GET(req: Request) {
  return handleSign(req);
}

export async function POST(req: Request) {
  return handleSign(req);
}


