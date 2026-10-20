"use client";

import Image from "next/image";
import { type PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Listing } from "@/types/listing";

function ChevronLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m15 18-6-6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function View360Icon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M4.5 12c0-3.1 3.4-5.6 7.5-5.6s7.5 2.5 7.5 5.6-3.4 5.6-7.5 5.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="m15.8 14.3 3.7-2.3-3.7-2.3M7.8 15.6H4.5v-2.4h2.4c.8 0 1.4-.6 1.4-1.3s-.6-1.3-1.4-1.3H4.5V8.4h3.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="M10.4 15.6V8.4h2.2c1.8 0 3.1 1.5 3.1 3.6s-1.3 3.6-3.1 3.6h-2.2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function uniqueImages(images: string[]) {
  return images.filter((image, index) => images.indexOf(image) === index);
}

function EquirectangularViewer({
  alt,
  url,
}: {
  alt: string;
  url: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewRef = useRef({ pitch: 0, yaw: 0 });
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { antialias: true });

    const fail = () => {
      window.setTimeout(() => setHasError(true), 0);
    };

    if (!canvas || !gl) {
      fail();
      return;
    }

    viewRef.current = { pitch: 0, yaw: 0 };

    const vertexShaderSource = `
      attribute vec2 position;
      varying vec2 uv;
      void main() {
        uv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;
    const fragmentShaderSource = `
      precision mediump float;
      uniform sampler2D panorama;
      uniform float yaw;
      uniform float pitch;
      uniform float aspect;
      varying vec2 uv;
      const float PI = 3.14159265359;

      void main() {
        float fov = radians(90.0);
        vec2 screen = (uv * 2.0) - 1.0;
        vec3 direction = normalize(vec3(
          screen.x * aspect * tan(fov * 0.5),
          -screen.y * tan(fov * 0.5),
          -1.0
        ));

        float cosPitch = cos(pitch);
        float sinPitch = sin(pitch);
        direction = vec3(
          direction.x,
          direction.y * cosPitch - direction.z * sinPitch,
          direction.y * sinPitch + direction.z * cosPitch
        );

        float cosYaw = cos(yaw);
        float sinYaw = sin(yaw);
        direction = vec3(
          direction.x * cosYaw - direction.z * sinYaw,
          direction.y,
          direction.x * sinYaw + direction.z * cosYaw
        );

        vec2 panoramaUv = vec2(
          fract(atan(direction.x, -direction.z) / (2.0 * PI) + 0.5),
          0.5 - asin(clamp(direction.y, -1.0, 1.0)) / PI
        );
        gl_FragColor = texture2D(panorama, panoramaUv);
      }
    `;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);

      if (!shader) {
        return null;
      }

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      fail();
      return;
    }

    const program = gl.createProgram();

    if (!program) {
      fail();
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      fail();
      return;
    }

    const positionLocation = gl.getAttribLocation(program, "position");
    const yawLocation = gl.getUniformLocation(program, "yaw");
    const pitchLocation = gl.getUniformLocation(program, "pitch");
    const aspectLocation = gl.getUniformLocation(program, "aspect");
    const texture = gl.createTexture();
    const buffer = gl.createBuffer();
    const image = new window.Image();
    let draw: (() => void) | null = null;

    if (!texture || !buffer) {
      fail();
      return;
    }

    image.crossOrigin = "anonymous";
    image.onload = () => {
      setHasError(false);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      } catch {
        fail();
        return;
      }

      draw = () => {
        const ratio = window.devicePixelRatio || 1;
        const width = canvas.clientWidth * ratio;
        const height = canvas.clientHeight * ratio;

        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLocation);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(gl.getUniformLocation(program, "panorama"), 0);
        gl.uniform1f(yawLocation, viewRef.current.yaw);
        gl.uniform1f(pitchLocation, viewRef.current.pitch);
        gl.uniform1f(aspectLocation, canvas.width / Math.max(canvas.height, 1));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        if (gl.getError() !== gl.NO_ERROR) {
          fail();
        }
      };

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW,
      );
      draw();

      canvas.addEventListener("panorama-view-change", draw);
      window.addEventListener("resize", draw);
    };
    image.onerror = () => {
      setHasError(true);
    };
    image.src = url;

    return () => {
      if (draw) {
        canvas.removeEventListener("panorama-view-change", draw);
        window.removeEventListener("resize", draw);
      }
      image.onload = null;
      image.onerror = null;
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [url]);

  return (
    <div className="absolute inset-0">
      <canvas
        aria-label={alt}
        className={`absolute inset-0 h-full w-full touch-none bg-slate-950 ${hasError ? "hidden" : ""}`}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          dragRef.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerMove={(event) => {
          const start = dragRef.current;

          if (!start) {
            return;
          }

          const view = viewRef.current;
          view.yaw -= (event.clientX - start.x) * 0.005;
          view.pitch = Math.max(
            -Math.PI / 2 + 0.05,
            Math.min(Math.PI / 2 - 0.05, view.pitch + (event.clientY - start.y) * 0.005),
          );
          dragRef.current = { x: event.clientX, y: event.clientY };
          event.currentTarget.dispatchEvent(new Event("panorama-view-change"));
        }}
        onPointerUp={() => {
          dragRef.current = null;
        }}
        ref={canvasRef}
        role="img"
      />
      {hasError ? (
        <Image
          alt={alt}
          className="object-contain"
          fill
          sizes="100vw"
          src={url}
          unoptimized
        />
      ) : null}
    </div>
  );
}

function PanoramaViewer({
  panoramas,
  title,
}: {
  panoramas: Listing["panoramas"];
  title: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const selectedPanorama = panoramas[selectedIndex];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
      if (event.key === "ArrowLeft") {
        setSelectedIndex((current) => (current - 1 + panoramas.length) % panoramas.length);
      }
      if (event.key === "ArrowRight") {
        setSelectedIndex((current) => (current + 1) % panoramas.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, panoramas.length]);

  if (!selectedPanorama) {
    return null;
  }

  return (
    <>
      <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
        <div className="grid gap-3">
          <button
            aria-label={`Open ${title} 360 view`}
            className="flex w-full items-center justify-between gap-4 rounded-xl border border-[var(--theme-primary)]/20 bg-[var(--theme-spring)]/45 px-4 py-4 text-left transition hover:border-[var(--theme-primary)]/45 hover:bg-[var(--theme-spring)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-primary)]/25"
            onClick={() => setIsOpen(true)}
            type="button"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-[var(--theme-primary)] shadow-sm">
                <View360Icon />
              </span>
              <span>
                <span className="block text-sm font-black uppercase tracking-normal text-[var(--theme-primary)]">
                  Explore 360 view
                </span>
                <span className="mt-1 block text-xs font-semibold text-slate-600">
                  Open full screen to look around {panoramas.length === 1 ? selectedPanorama.label : `${panoramas.length} spaces`}.
                </span>
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-[var(--theme-primary)] px-3 py-1.5 text-xs font-black text-white">
              Open
            </span>
          </button>

          {panoramas.length > 1 ? (
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {panoramas.map((panorama, index) => (
                <button
                  aria-label={`Open 360 view of ${panorama.label}`}
                  className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700 transition hover:bg-[var(--theme-spring)] hover:text-[var(--theme-deep-teal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]"
                  key={panorama.url}
                  onClick={() => {
                    setSelectedIndex(index);
                    setIsOpen(true);
                  }}
                  type="button"
                >
                  {panorama.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {isOpen ? (
        <div
          aria-label={`${title} fullscreen 360 view`}
          aria-modal="true"
          className="fixed inset-0 z-[10000] flex touch-pan-y items-center justify-center bg-slate-950/98 text-white"
          role="dialog"
        >
          <button
            aria-label="Close fullscreen 360 view"
            className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            <CloseIcon />
          </button>

          {panoramas.length > 1 ? (
            <>
              <button
                aria-label="Show previous 360 view"
                className="absolute left-4 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
                onClick={() => {
                  setSelectedIndex((current) => (current - 1 + panoramas.length) % panoramas.length);
                }}
                type="button"
              >
                <ChevronLeftIcon />
              </button>
              <button
                aria-label="Show next 360 view"
                className="absolute right-4 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
                onClick={() => {
                  setSelectedIndex((current) => (current + 1) % panoramas.length);
                }}
                type="button"
              >
                <ChevronRightIcon />
              </button>
            </>
          ) : null}

          <div className="relative h-full w-full overflow-hidden">
            <EquirectangularViewer
              alt={`${title} 360 view of ${selectedPanorama.label}`}
              url={selectedPanorama.url}
            />
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/70 px-4 py-2 text-xs font-black text-white backdrop-blur">
              Drag or swipe to explore {selectedPanorama.label}
            </span>
          </div>

          {panoramas.length > 1 ? (
            <div className="absolute bottom-4 left-1/2 z-30 flex max-w-[calc(100%-7rem)] -translate-x-1/2 gap-2 overflow-x-auto rounded-xl bg-slate-950/75 p-2 backdrop-blur">
              {panoramas.map((panorama, index) => {
                const isSelected = index === selectedIndex;

                return (
                  <button
                    aria-label={`Show 360 view of ${panorama.label}`}
                    aria-pressed={isSelected}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-900 ring-offset-2 ring-offset-slate-950 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${isSelected
                        ? "ring-2 ring-white"
                        : "opacity-70 hover:opacity-100"
                      }`}
                    key={panorama.url}
                    onClick={() => {
                      setSelectedIndex(index);
                    }}
                    type="button"
                  >
                    <Image
                      alt={`${panorama.label} 360 thumbnail`}
                      className="object-cover"
                      fill
                      sizes="80px"
                      src={panorama.url}
                      unoptimized
                    />
                    <span className="absolute inset-x-0 bottom-0 truncate bg-slate-950/75 px-1.5 py-1 text-[10px] font-black text-white">
                      {panorama.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

type SwipeStart = {
  x: number;
  y: number;
};

export function ListingGallery({ listing }: { listing: Listing }) {
  const images = useMemo(
    () => uniqueImages([listing.image, ...listing.gallery]),
    [listing.gallery, listing.image],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const swipeStart = useRef<SwipeStart | null>(null);
  const selectedImage = images[selectedIndex] ?? listing.image;

  const selectImage = (index: number) => {
    setSelectedIndex(index);
    thumbnailRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  };

  const goToPrevious = () => {
    selectImage((selectedIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    selectImage((selectedIndex + 1) % images.length);
  };

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
      if (event.key === "ArrowLeft") {
        goToPrevious();
      }
      if (event.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  const handleModalPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    swipeStart.current = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handleModalPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current;

    if (start === null) {
      return;
    }

    const swipeX = event.clientX - start.x;
    const swipeY = event.clientY - start.y;
    const isHorizontalSwipe =
      Math.abs(swipeX) > 48 && Math.abs(swipeX) > Math.abs(swipeY) * 1.25;

    if (isHorizontalSwipe) {
      if (swipeX > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }

    swipeStart.current = null;
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_24px_55px_rgba(15,23,42,0.09)] max-sm:rounded-none max-sm:border-x-0">
      <div className="p-2 sm:p-4">
        <div className="relative min-h-[370px] overflow-hidden rounded-lg bg-slate-100 sm:min-h-[420px] md:min-h-[510px]">
          <button
            aria-label="Open selected image fullscreen"
            className="absolute inset-0 cursor-zoom-in overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[var(--theme-primary)]/35"
            onClick={() => setIsModalOpen(true)}
            type="button"
          >
            <Image
              alt={`${listing.title} selected view`}
              className="object-contain transition-transform duration-500"
              fill
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              src={selectedImage}
              unoptimized
            />
          </button>

          {images.length > 1 ? (
            <>
              <button
                aria-label="Show previous image"
                className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/92 text-slate-950 shadow-[0_14px_30px_rgba(15,23,42,0.22)] ring-1 ring-white/70 transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-primary)]/35"
                onClick={goToPrevious}
                type="button"
              >
                <ChevronLeftIcon />
              </button>
              <button
                aria-label="Show next image"
                className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/92 text-slate-950 shadow-[0_14px_30px_rgba(15,23,42,0.22)] ring-1 ring-white/70 transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-primary)]/35"
                onClick={goToNext}
                type="button"
              >
                <ChevronRightIcon />
              </button>
            </>
          ) : null}

          <div className="absolute bottom-4 left-4 rounded-full bg-slate-950/72 px-3 py-1.5 text-xs font-black text-white backdrop-blur">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>

        <div className="mt-3">
          <div className="flex min-w-0 flex-1 justify-start gap-2 overflow-x-auto scroll-smooth pb-1">
            {images.map((image, index) => {
              const isSelected = index === selectedIndex;

              return (
                <button
                  aria-label={`Show image ${index + 1}`}
                  aria-pressed={isSelected}
                  className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-slate-100 ring-offset-2 transition sm:h-24 sm:w-36 ${
                    isSelected
                      ? "ring-2 ring-[var(--theme-primary)]"
                      : "opacity-72 ring-1 ring-slate-200 hover:opacity-100 hover:ring-[var(--theme-primary)]/45"
                  }`}
                  key={image}
                  onClick={() => selectImage(index)}
                  ref={(node) => {
                    thumbnailRefs.current[index] = node;
                  }}
                  type="button"
                >
                  <Image
                    alt={`${listing.title} thumbnail ${index + 1}`}
                    className="object-cover"
                    fill
                    sizes="144px"
                    src={image}
                    unoptimized
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {listing.panoramas.length > 0 ? (
        <PanoramaViewer panoramas={listing.panoramas} title={listing.title} />
      ) : (
        <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
          <span className="inline-flex items-center gap-3 rounded-full bg-[var(--theme-spring)] px-4 py-2 text-sm font-black uppercase tracking-normal text-[var(--theme-primary)]">
            <View360Icon />
            360 view not available for this Property
          </span>
        </div>
      )}

      {isModalOpen ? (
        <div
          aria-label={`${listing.title} fullscreen gallery`}
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex touch-pan-y items-center justify-center bg-slate-950/96 text-white"
          onPointerCancel={() => {
            swipeStart.current = null;
          }}
          onPointerDown={handleModalPointerDown}
          onPointerUp={handleModalPointerEnd}
          role="dialog"
        >
          <button
            aria-label="Close fullscreen image"
            className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
            onClick={() => setIsModalOpen(false)}
            type="button"
          >
            <CloseIcon />
          </button>

          {images.length > 1 ? (
            <>
              <button
                aria-label="Show previous image"
                className="absolute left-4 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
                onClick={goToPrevious}
                type="button"
              >
                <ChevronLeftIcon />
              </button>
              <button
                aria-label="Show next image"
                className="absolute right-4 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
                onClick={goToNext}
                type="button"
              >
                <ChevronRightIcon />
              </button>
            </>
          ) : null}

          <div className="relative h-full w-full">
            <Image
              alt={`${listing.title} fullscreen selected view`}
              className="object-contain"
              fill
              priority
              sizes="100vw"
              src={selectedImage}
              unoptimized
            />
          </div>

          <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/12 px-4 py-2 text-sm font-black backdrop-blur">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      ) : null}
    </div>
  );
}
