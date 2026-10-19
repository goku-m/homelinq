import { createHash } from "crypto";
import { NextResponse } from "next/server";

const maxFileSize = 8 * 1024 * 1024;
const maxFiles = 20;
const cloudinaryFolder = "homelinq/listings";

const allowedTypes = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function isFile(value: FormDataEntryValue): value is File {
  return typeof value === "object" && "arrayBuffer" in value && "name" in value;
}

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary upload is not configured");
  }

  return { apiKey, apiSecret, cloudName };
}

function createSignature(params: Record<string, string>, apiSecret: string) {
  const serializedParams = Object.entries(params)
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${serializedParams}${apiSecret}`)
    .digest("hex");
}

async function uploadToCloudinary(file: File) {
  const { apiKey, apiSecret, cloudName } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signatureParams = {
    folder: cloudinaryFolder,
    timestamp,
  };
  const body = new FormData();

  body.append("file", file, file.name);
  body.append("api_key", apiKey);
  body.append("folder", cloudinaryFolder);
  body.append("timestamp", timestamp);
  body.append("signature", createSignature(signatureParams, apiSecret));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { body, method: "POST" },
  );
  const payload = (await response.json()) as {
    error?: { message?: string };
    secure_url?: string;
  };

  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message ?? "Cloudinary image upload failed");
  }

  return payload.secure_url;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter(isFile);

    if (files.length === 0) {
      return NextResponse.json({ error: "No image files uploaded" }, { status: 400 });
    }

    if (files.length > maxFiles) {
      return NextResponse.json(
        { error: `Upload ${maxFiles} images or fewer at a time` },
        { status: 400 },
      );
    }

    for (const file of files) {
      if (!allowedTypes.has(file.type)) {
        throw new Error("Only JPG, PNG, WebP, GIF, and AVIF images are supported");
      }

      if (file.size > maxFileSize) {
        throw new Error("Each image must be 8 MB or smaller");
      }
    }

    const images = await Promise.all(files.map(uploadToCloudinary));

    return NextResponse.json({ images }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to upload images" },
      { status: 400 },
    );
  }
}
