"use client";

import Image from "next/image";
import {
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

export type HeroSlide = {
  src: string;
  alt: string;
};

type HeroCarouselProps = {
  children: ReactNode;
  slides: HeroSlide[];
};

type SwipeStart = {
  x: number;
  y: number;
};

export function HeroCarousel({ children, slides }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const swipeStart = useRef<SwipeStart | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    if (slides.length < 2) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5200);

    return () => window.clearTimeout(timer);
  }, [activeIndex, slides.length]);

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse") {
      return;
    }

    swipeStart.current = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handlePointerEnd = (event: PointerEvent<HTMLElement>) => {
    const start = swipeStart.current;

    if (start === null) {
      return;
    }

    const swipeX = event.clientX - start.x;
    const swipeY = event.clientY - start.y;
    const isHorizontalSwipe =
      Math.abs(swipeX) > 52 && Math.abs(swipeX) > Math.abs(swipeY) * 1.35;

    if (isHorizontalSwipe) {
      suppressClick.current = true;

      if (swipeX > 0) {
        goToPrevious();
      } else {
        goToNext();
      }

      window.setTimeout(() => {
        suppressClick.current = false;
      }, 0);
    }

    swipeStart.current = null;
  };

  return (
    <section
      className="relative isolate h-auto min-h-[400px] touch-pan-y overflow-hidden bg-[#102139] text-white md:min-h-[460px]"
      onClickCapture={(event) => {
        if (suppressClick.current) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      onPointerCancel={() => {
        swipeStart.current = null;
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerEnd}
    >
      <div
        aria-label="Featured commercial property images"
        className="absolute inset-0 overflow-hidden"
      >
        <div
          className="flex h-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div className="relative h-full w-full shrink-0" key={slide.src}>
              <Image
                alt={slide.alt}
                className="object-cover"
                fill
                priority={index === 0}
                sizes="100vw"
                src={slide.src}
              />
            </div>
          ))}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,22,38,0.96)_0%,rgba(8,22,38,0.74)_34%,rgba(8,22,38,0.34)_72%,rgba(8,22,38,0.62)_100%)]"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/30 md:hidden" />

      {children}
    </section>
  );
}
