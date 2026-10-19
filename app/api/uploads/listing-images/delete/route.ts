import { createHash } from "crypto";
import { NextResponse } from "next/server";

function createSignature(params: Record<string, string>, apiSecret: string) {
  const serializedParams = Object.entries(params)
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${serializedParams}${apiSecret}`)
    .digest("hex");
}

function getPublicIdFromUrl(imageUrl: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return undefined;
  }

  if (parsedUrl.hostname !== "res.cloudinary.com") {
    return undefined;
  }

  const uploadIndex = parsedUrl.pathname.split("/").indexOf("upload");
  if (uploadIndex === -1) {
    return undefined;
  }

  const pathParts = parsedUrl.pathname.split("/").slice(uploadIndex + 1);
  if (pathParts[0]?.startsWith("v") && /^v\d+$/.test(pathParts[0])) {
    pathParts.shift();
  }

  const lastPart = pathParts.pop();
  if (!lastPart) {
    return undefined;
  }

  pathParts.push(lastPart.replace(/\.[^.]+$/, ""));
  return pathParts.join("/");
}

export async function DELETE(request: Request) {
  try {
    const { url } = (await request.json()) as { url?: string };
    const publicId = url ? getPublicIdFromUrl(url) : undefined;

    if (!publicId) {
      return NextResponse.json({ deleted: false }, { status: 200 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary upload is not configured");
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = new URLSearchParams({
      api_key: apiKey,
      public_id: publicId,
      signature: createSignature({ public_id: publicId, timestamp }, apiSecret),
      timestamp,
    });
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      { body, headers: { "Content-Type": "application/x-www-form-urlencoded" }, method: "POST" },
    );
    const payload = (await response.json()) as { result?: string };

    if (!response.ok || !["ok", "not found"].includes(payload.result ?? "")) {
      throw new Error("Cloudinary image deletion failed");
    }

    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete image" },
      { status: 400 },
    );
  }
}
