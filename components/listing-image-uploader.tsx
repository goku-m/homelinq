"use client";

import Image from "next/image";
import {
  type ChangeEvent,
  type DragEvent,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

export type ListingImageSelection = {
  gallery: string[];
  image: string;
};

type ListingImageUploaderProps = {
  gallery: string[];
  image: string;
  label?: string;
  onBusyChange?: (isBusy: boolean) => void;
  onChange: (selection: ListingImageSelection) => void;
  required?: boolean;
};

function uniqueImages(images: string[]) {
  return images.filter((image, index) => image !== "" && images.indexOf(image) === index);
}

export function ListingImageUploader({
  gallery,
  image,
  label = "Property images",
  onBusyChange,
  onChange,
  required = false,
}: ListingImageUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const images = useMemo(() => uniqueImages([image, ...gallery]), [gallery, image]);

  const commitImages = (nextImages: string[], preferredMainImage: string) => {
    const normalizedImages = uniqueImages(nextImages);
    const mainImage = normalizedImages.includes(preferredMainImage)
      ? preferredMainImage
      : normalizedImages[0] ?? "";

    onChange({
      gallery: normalizedImages.filter((candidate) => candidate !== mainImage),
      image: mainImage,
    });
  };

  const setBusy = (isBusy: boolean) => {
    setIsUploading(isBusy);
    onBusyChange?.(isBusy);
  };

  const uploadFiles = async (fileList: File[]) => {
    const imageFiles = fileList.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      setError("Choose one or more image files.");
      return;
    }

    setError("");
    setBusy(true);

    try {
      const formData = new FormData();

      imageFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/uploads/listing-images", {
        body: formData,
        method: "POST",
      });
      const payload = (await response.json()) as {
        error?: string;
        images?: string[];
      };

      if (!response.ok || !payload.images) {
        throw new Error(payload.error ?? "Unable to upload images");
      }

      commitImages([...images, ...payload.images], image || payload.images[0] || "");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload images");
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

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void uploadFiles(Array.from(event.dataTransfer.files));
  };

  const removeImage = async (imageToRemove: string) => {
    setError("");
    setBusy(true);

    try {
      const response = await fetch("/api/uploads/listing-images/delete", {
        body: JSON.stringify({ url: imageToRemove }),
        headers: { "Content-Type": "application/json" },
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete image");
      }

      commitImages(
        images.filter((candidate) => candidate !== imageToRemove),
        image === imageToRemove ? "" : image,
      );
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to delete image");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-black uppercase tracking-normal text-slate-500">
          {label}
        </span>
        <span className="text-xs font-bold text-slate-500">
          {images.length} image{images.length === 1 ? "" : "s"}
        </span>
      </div>

      <label
        className={`grid min-h-36 cursor-pointer place-items-center rounded-lg border border-dashed px-4 py-6 text-center transition ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/60"
        }`}
        htmlFor={inputId}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          accept="image/*"
          className="sr-only"
          id={inputId}
          multiple
          onChange={handleFileChange}
          ref={inputRef}
          type="file"
        />
        <span className="grid gap-1">
          <span className="text-sm font-black text-slate-800">
            {isUploading ? "Uploading images" : "Drop images or browse"}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            JPG, PNG, WebP, GIF, or AVIF
          </span>
        </span>
      </label>

      {required && images.length === 0 ? (
        <p className="text-sm font-bold text-rose-600">At least one image is required.</p>
      ) : null}

      {error ? <p className="text-sm font-bold text-rose-600">{error}</p> : null}

      {images.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((candidate) => {
            const isMainImage = candidate === image;

            return (
              <article
                className={`overflow-hidden rounded-lg border bg-white ${
                  isMainImage ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"
                }`}
                key={candidate}
              >
                <div className="relative aspect-[4/3] bg-slate-100">
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    src={candidate}
                    unoptimized
                  />
                  {isMainImage ? (
                    <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-black text-white">
                      Main image
                    </span>
                  ) : null}
                </div>
                <div className="grid gap-2 p-3">
                  <button
                    className={`h-9 rounded-lg px-3 text-sm font-black ${
                      isMainImage
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                    disabled={isMainImage}
                    onClick={() => commitImages(images, candidate)}
                    type="button"
                  >
                    {isMainImage ? "Selected as main" : "Set as main image"}
                  </button>
                  <button
                    className="h-9 rounded-lg px-3 text-sm font-black text-rose-600 hover:bg-rose-50"
                    onClick={() => removeImage(candidate)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
