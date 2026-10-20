"use client";

import Image from "next/image";
import { type ChangeEvent, useId, useRef, useState } from "react";
import type { ListingPanorama } from "@/types/listing";

type Listing360UploaderProps = {
  onBusyChange?: (isBusy: boolean) => void;
  onChange: (panoramas: ListingPanorama[]) => void;
  panoramas: ListingPanorama[];
};

type UploadedPanorama = {
  name: string;
  url: string;
};

export function Listing360Uploader({
  onBusyChange,
  onChange,
  panoramas,
}: Listing360UploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const setBusy = (isBusy: boolean) => {
    setIsUploading(isBusy);
    onBusyChange?.(isBusy);
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    setError("");
    setBusy(true);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/uploads/listing-360", {
        body: formData,
        method: "POST",
      });
      const payload = (await response.json()) as {
        error?: string;
        images?: UploadedPanorama[];
      };

      if (!response.ok || !payload.images) {
        throw new Error(payload.error ?? "Unable to upload 360 images");
      }

      onChange([
        ...panoramas,
        ...payload.images.map((image) => ({
          label: image.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
          url: image.url,
        })),
      ]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload 360 images");
    } finally {
      setBusy(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    void uploadFiles(Array.from(event.target.files ?? []));
  };

  const removePanorama = async (panorama: ListingPanorama) => {
    setError("");
    setBusy(true);

    try {
      const response = await fetch("/api/uploads/listing-images/delete", {
        body: JSON.stringify({ url: panorama.url }),
        headers: { "Content-Type": "application/json" },
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete 360 image");
      }

      onChange(panoramas.filter((candidate) => candidate.url !== panorama.url));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to delete 360 image");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-3 rounded-lg border border-[var(--theme-border)] bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-normal text-slate-500">360 views</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Upload equirectangular panoramas and label each room or area.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-500">
          {panoramas.length} view{panoramas.length === 1 ? "" : "s"}
        </span>
      </div>

      <label
        className="grid min-h-24 cursor-pointer place-items-center rounded-lg border border-dashed border-slate-300 bg-white px-4 py-5 text-center hover:border-blue-400 hover:bg-blue-50/60"
        htmlFor={inputId}
      >
        <input
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          id={inputId}
          multiple
          onChange={handleFileChange}
          ref={inputRef}
          type="file"
        />
        <span className="grid gap-1">
          <span className="text-sm font-black text-slate-800">
            {isUploading ? "Uploading 360 views" : "Upload 360 views"}
          </span>
          <span className="text-xs font-semibold text-slate-500">JPG, PNG, WebP, or AVIF · up to 25 MB each</span>
        </span>
      </label>

      {error ? <p className="text-sm font-bold text-rose-600">{error}</p> : null}

      {panoramas.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {panoramas.map((panorama) => (
            <article className="overflow-hidden rounded-lg border border-slate-200 bg-white" key={panorama.url}>
              <div className="relative aspect-[2/1] bg-slate-100">
                <Image
                  alt={`${panorama.label} 360 preview`}
                  className="object-cover"
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  src={panorama.url}
                  unoptimized
                />
                <span className="absolute left-2 top-2 rounded-full bg-slate-950/75 px-2.5 py-1 text-xs font-black text-white">
                  360°
                </span>
              </div>
              <div className="grid gap-2 p-3">
                <label className="grid gap-1">
                  <span className="text-xs font-black uppercase tracking-normal text-slate-500">Room or area</span>
                  <input
                    className="h-9 rounded-lg border border-[var(--theme-border)] px-3 text-sm outline-none focus:border-[var(--theme-primary)]"
                    onChange={(event) =>
                      onChange(
                        panoramas.map((candidate) =>
                          candidate.url === panorama.url
                            ? { ...candidate, label: event.target.value }
                            : candidate,
                        ),
                      )
                    }
                    required
                    value={panorama.label}
                  />
                </label>
                <button
                  className="h-9 rounded-lg px-3 text-sm font-black text-rose-600 hover:bg-rose-50"
                  onClick={() => void removePanorama(panorama)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
