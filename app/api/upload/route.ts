import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/session";

const FREEIMAGE_ENDPOINT = "https://freeimage.host/api/1/upload";

/**
 * Accepts a multipart form with a `file` field, forwards it to freeimage.host
 * as a base64 source, and returns the hosted CDN URL.
 */
export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.FREEIMAGE_HOST_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Image host not configured" },
      { status: 500 }
    );
  }

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image too large (max 8MB)" },
        { status: 400 }
      );
    }

    // Convert to base64 (freeimage.host accepts a base64 `source`)
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const body = new URLSearchParams();
    body.append("key", apiKey);
    body.append("action", "upload");
    body.append("source", base64);
    body.append("format", "json");

    const res = await fetch(FREEIMAGE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = await res.json();

    if (data?.status_code !== 200 || !data?.image?.url) {
      return NextResponse.json(
        { error: data?.error?.message || "Upload failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      url: data.image.url,
      thumb: data.image.thumb?.url ?? data.image.url,
      displayUrl: data.image.display_url ?? data.image.url,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
