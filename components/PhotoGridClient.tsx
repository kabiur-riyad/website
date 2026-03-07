"use client";

import { CSSProperties, TouchEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Photo } from "@/lib/types";
import { getImageDimensions, urlFor } from "@/lib/sanity.image";
import Lightbox from "./Lightbox";

type Props = {
  photos: Photo[];
  defaultViewMode?: "grid" | "carousel";
  hideViewToggle?: boolean;
};

type CarouselTransition = {
  from: number;
  to: number;
  direction: "left" | "right";
  mode: "auto" | "resume";
  durationMs: number;
  startOffset: number;
};

export default function PhotoGridClient({
  photos,
  defaultViewMode = "carousel",
  hideViewToggle = false,
}: Props) {
  const CAROUSEL_TRANSITION_MS = 360;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "carousel">(defaultViewMode);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [transition, setTransition] = useState<CarouselTransition | null>(null);
  const [resumePhase, setResumePhase] = useState<"idle" | "running">("idle");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<HTMLButtonElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [carouselWidth, setCarouselWidth] = useState(0);
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const swipeStartX = useRef<number | null>(null);
  const swipeStartY = useRef<number | null>(null);
  const swipeCurrentX = useRef<number | null>(null);
  const dragModeRef = useRef<"pending" | "horizontal" | "vertical">("pending");
  const VIEW_MODE_KEY = "photo_view_mode";
  const isTransitioning = transition !== null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || hideViewToggle) return;
    const saved = window.localStorage.getItem(VIEW_MODE_KEY);
    if (saved === "grid" || saved === "carousel") {
      setViewMode(saved);
    }
  }, [mounted, defaultViewMode, hideViewToggle]);

  useEffect(() => {
    if (!mounted || hideViewToggle) return;
    window.localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [mounted, hideViewToggle, viewMode]);

  useEffect(() => {
    if (!transition) return;
    if (transition.mode === "resume" && resumePhase === "idle") {
      const rafId = window.requestAnimationFrame(() => setResumePhase("running"));
      return () => window.cancelAnimationFrame(rafId);
    }
    const timeoutId = window.setTimeout(() => {
      setCarouselIndex(transition.to);
      setTransition(null);
      setResumePhase("idle");
    }, transition.durationMs);
    return () => window.clearTimeout(timeoutId);
  }, [transition, resumePhase]);

  useEffect(() => {
    if (!carouselRef.current || viewMode !== "carousel") return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setCarouselWidth(entry.contentRect.width);
    });
    observer.observe(carouselRef.current);
    return () => observer.disconnect();
  }, [viewMode]);

  const goPrev = useCallback(() => {
    if (isTransitioning || isDragging || photos.length < 2) return;
    const prevIndex = carouselIndex === 0 ? photos.length - 1 : carouselIndex - 1;
    setTransition({
      from: carouselIndex,
      to: prevIndex,
      direction: "left",
      mode: "auto",
      durationMs: CAROUSEL_TRANSITION_MS,
      startOffset: 0,
    });
  }, [carouselIndex, photos.length, isTransitioning, isDragging, CAROUSEL_TRANSITION_MS]);

  const goNext = useCallback(() => {
    if (isTransitioning || isDragging || photos.length < 2) return;
    const nextIndex = carouselIndex === photos.length - 1 ? 0 : carouselIndex + 1;
    setTransition({
      from: carouselIndex,
      to: nextIndex,
      direction: "right",
      mode: "auto",
      durationMs: CAROUSEL_TRANSITION_MS,
      startOffset: 0,
    });
  }, [carouselIndex, photos.length, isTransitioning, isDragging, CAROUSEL_TRANSITION_MS]);

  useEffect(() => {
    if (viewMode !== "grid") return;
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [viewMode]);

  const columns = useMemo(() => {
    if (containerWidth >= 1200) return 3;
    if (containerWidth >= 800) return 2;
    return 1;
  }, [containerWidth]);

  const gap = useMemo(() => {
    if (containerWidth >= 1200) return 28;
    if (containerWidth >= 800) return 22;
    return 28;
  }, [containerWidth]);

  const sideInset = useMemo(() => {
    if (containerWidth >= 1200) return 0;
    if (containerWidth >= 800) return 6;
    return 12;
  }, [containerWidth]);

  const itemWidth = useMemo(() => {
    const effectiveWidth =
      containerWidth ||
      (typeof window !== "undefined" ? window.innerWidth - sideInset * 2 : 0);
    if (!effectiveWidth) return 0;
    return (effectiveWidth - sideInset * 2 - gap * (columns - 1)) / columns;
  }, [columns, containerWidth, gap, sideInset]);

  const layout = useMemo(() => {
    if (!itemWidth) return { positions: [], totalHeight: 0 };
    const colHeights = Array(columns).fill(0);
    const positions = photos.map((photo) => {
      const dims = getImageDimensions(photo.image);
      const width = dims?.width ?? 1200;
      const height = dims?.height ?? 1500;
      const renderedHeight = Math.round((itemWidth * height) / width);
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = sideInset + col * (itemWidth + gap);
      const y = colHeights[col];
      colHeights[col] += renderedHeight + gap;
      return { x, y };
    });
    const totalHeight = colHeights.length ? Math.max(...colHeights) : 0;
    return { positions, totalHeight };
  }, [photos, columns, gap, itemWidth, sideInset]);

  useEffect(() => {
    if (itemWidth && layout.positions.length === photos.length) {
      const id = window.requestAnimationFrame(() => setReady(true));
      return () => window.cancelAnimationFrame(id);
    }
    setReady(false);
  }, [itemWidth, layout.positions.length, photos.length]);

  useEffect(() => {
    if (viewMode !== "carousel" || selectedIndex !== null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewMode, selectedIndex, goPrev, goNext]);

  useEffect(() => {
    if (!transition) {
      setResumePhase("idle");
      return;
    }
    setIsDragging(false);
    setDragOffset(0);
    dragModeRef.current = "pending";
    setResumePhase(transition.mode === "resume" ? "idle" : "running");
  }, [transition]);

  const buildCarouselSlide = useCallback(
    (index: number) => {
      const photo = photos[index];
      if (!photo?.image) return null;
      const builder = urlFor(photo.image);
      if (!builder) return null;
      const dims = getImageDimensions(photo.image);
      const width = dims?.width ?? 1200;
      const height = dims?.height ?? 1500;
      const src =
        builder
          .width(2200)
          .height(Math.round((2200 * height) / width))
          .fit("max")
          .auto("format")
          .quality(82)
          .url() || null;
      if (!src) return null;
      return {
        id: photo._id,
        title: photo.title,
        src,
        width,
        height,
      };
    },
    [photos]
  );

  const settledSlide = useMemo(() => buildCarouselSlide(carouselIndex), [buildCarouselSlide, carouselIndex]);
  const prevCarouselIndex = carouselIndex === 0 ? photos.length - 1 : carouselIndex - 1;
  const nextCarouselIndex = carouselIndex === photos.length - 1 ? 0 : carouselIndex + 1;
  const dragNeighborIndex = dragOffset < 0 ? nextCarouselIndex : prevCarouselIndex;
  const dragNeighborSlide = useMemo(() => {
    if (!isDragging || dragOffset === 0 || photos.length < 2) return null;
    return buildCarouselSlide(dragNeighborIndex);
  }, [isDragging, dragOffset, photos.length, buildCarouselSlide, dragNeighborIndex]);
  const fromSlide = useMemo(() => {
    if (!transition) return null;
    return buildCarouselSlide(transition.from);
  }, [buildCarouselSlide, transition]);
  const toSlide = useMemo(() => {
    if (!transition) return null;
    return buildCarouselSlide(transition.to);
  }, [buildCarouselSlide, transition]);

  const preloadCenterIndex = transition?.to ?? carouselIndex;
  const dragTrackWidth = carouselWidth || (typeof window !== "undefined" ? window.innerWidth : 0);
  const dragGapPx = dragTrackWidth <= 720 ? 32 : 56;
  const transitionDistancePx = dragTrackWidth + dragGapPx;

  useEffect(() => {
    if (viewMode !== "carousel" || !photos.length) return;
    const prevIndex = preloadCenterIndex === 0 ? photos.length - 1 : preloadCenterIndex - 1;
    const nextIndex = preloadCenterIndex === photos.length - 1 ? 0 : preloadCenterIndex + 1;
    const neighbors = [photos[prevIndex], photos[nextIndex]];
    neighbors.forEach((photo) => {
      if (!photo?.image) return;
      const builder = urlFor(photo.image);
      if (!builder) return;
      const dims = getImageDimensions(photo.image);
      const width = dims?.width ?? 1200;
      const height = dims?.height ?? 1500;
      const src = builder
        .width(2200)
        .height(Math.round((2200 * height) / width))
        .fit("max")
        .auto("format")
        .quality(82)
        .url();
      if (!src) return;
      const preloader = new window.Image();
      preloader.src = src;
    });
  }, [viewMode, preloadCenterIndex, photos]);

  const renderSlide = useCallback(
    (
      slide: { id: string; title?: string | null; src: string; width: number; height: number } | null,
      className: string,
      priority = false,
      style?: CSSProperties
    ) => {
      if (!slide) return null;
      return (
        <div className={className} style={style}>
          <Image
            key={`${slide.id}-${className}`}
            src={slide.src}
            alt={slide.title || "Photography"}
            width={slide.width}
            height={slide.height}
            sizes="(max-width: 768px) 90vw, 72vw"
            priority={priority}
            draggable={false}
          />
        </div>
      );
    },
    []
  );

  const onCarouselTouchStart = (event: TouchEvent<HTMLButtonElement>) => {
    if (isTransitioning || photos.length < 2) return;
    swipeStartX.current = event.touches[0]?.clientX ?? null;
    swipeStartY.current = event.touches[0]?.clientY ?? null;
    swipeCurrentX.current = swipeStartX.current;
    dragModeRef.current = "pending";
    setIsDragging(false);
    setDragOffset(0);
  };

  const onCarouselTouchMove = (event: TouchEvent<HTMLButtonElement>) => {
    if (swipeStartX.current === null || isTransitioning || photos.length < 2) return;
    const point = event.touches[0];
    if (!point) return;
    const deltaX = point.clientX - swipeStartX.current;
    const deltaY = (swipeStartY.current ?? point.clientY) - point.clientY;

    if (dragModeRef.current === "pending") {
      if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return;
      dragModeRef.current = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
    }

    if (dragModeRef.current !== "horizontal") return;
    event.preventDefault();
    const width = dragTrackWidth || 1;
    const limit = width * 0.98;
    const clamped = Math.max(-limit, Math.min(limit, deltaX));
    swipeCurrentX.current = point.clientX;
    setIsDragging(true);
    setDragOffset(clamped);
  };

  const onCarouselTouchEnd = (event: TouchEvent<HTMLButtonElement>) => {
    if (swipeStartX.current === null || isTransitioning || photos.length < 2) return;
    if (dragModeRef.current !== "horizontal") {
      setIsDragging(false);
      setDragOffset(0);
      swipeStartX.current = null;
      swipeStartY.current = null;
      swipeCurrentX.current = null;
      dragModeRef.current = "pending";
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? swipeCurrentX.current ?? swipeStartX.current;
    const finalDelta = endX - swipeStartX.current;
    const width = dragTrackWidth || 1;
    const threshold = Math.max(52, width * 0.18);
    const shouldNavigate = Math.abs(finalDelta) >= threshold;
    const direction = finalDelta > 0 ? "left" : "right";
    const transitionDistance = transitionDistancePx;
    const targetOffset = direction === "right" ? -transitionDistance : transitionDistance;
    const remainingDistance = Math.max(0, Math.abs(targetOffset - finalDelta));
    const durationMs = Math.max(
      120,
      Math.round((CAROUSEL_TRANSITION_MS * remainingDistance) / Math.max(1, transitionDistance))
    );

    setIsDragging(false);
    setDragOffset(0);
    swipeStartX.current = null;
    swipeStartY.current = null;
    swipeCurrentX.current = null;
    dragModeRef.current = "pending";

    if (!shouldNavigate) return;
    if (direction === "left") {
      const prevIndex = carouselIndex === 0 ? photos.length - 1 : carouselIndex - 1;
      setTransition({
        from: carouselIndex,
        to: prevIndex,
        direction: "left",
        mode: "resume",
        durationMs,
        startOffset: finalDelta,
      });
      return;
    }
    const nextIndex = carouselIndex === photos.length - 1 ? 0 : carouselIndex + 1;
    setTransition({
      from: carouselIndex,
      to: nextIndex,
      direction: "right",
      mode: "resume",
      durationMs,
      startOffset: finalDelta,
    });
  };

  const onCarouselTouchCancel = () => {
    setIsDragging(false);
    setDragOffset(0);
    swipeStartX.current = null;
    swipeStartY.current = null;
    swipeCurrentX.current = null;
    dragModeRef.current = "pending";
  };

  const isResumeTransition = transition?.mode === "resume";
  const resumeFromStart = transition?.startOffset ?? 0;
  const resumeFromEnd = transition?.direction === "right" ? -transitionDistancePx : transitionDistancePx;
  const resumeToStart =
    (transition?.direction === "right" ? transitionDistancePx : -transitionDistancePx) + resumeFromStart;
  const resumeDurationMs = transition?.durationMs ?? CAROUSEL_TRANSITION_MS;
  const resumeSlideStyle: CSSProperties =
    isResumeTransition && resumePhase === "running"
      ? { transition: `transform ${resumeDurationMs}ms ease` }
      : { transition: "none" };

  return (
    <>
      {!hideViewToggle ? (
        <button
          type="button"
          className={`view-toggle-icon ${viewMode === "grid" ? "active" : ""}`}
          onClick={() => setViewMode(viewMode === "grid" ? "carousel" : "grid")}
          aria-label={viewMode === "grid" ? "Switch to carousel view" : "Switch to grid view"}
          title={viewMode === "grid" ? "Carousel view" : "Grid view"}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="6" cy="6" r="1.5" />
            <circle cx="12" cy="6" r="1.5" />
            <circle cx="18" cy="6" r="1.5" />
            <circle cx="6" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="18" cy="12" r="1.5" />
            <circle cx="6" cy="18" r="1.5" />
            <circle cx="12" cy="18" r="1.5" />
            <circle cx="18" cy="18" r="1.5" />
          </svg>
        </button>
      ) : null}

      {viewMode === "grid" ? (
        <div
          className="photo-grid"
          ref={containerRef}
          style={{ height: layout.totalHeight, opacity: ready ? 1 : 0 }}
        >
          {photos.map((photo, index) => (
            <button
              key={photo._id}
              type="button"
              className="photo-card"
              onClick={() => setSelectedIndex(index)}
              onContextMenu={(event) => event.preventDefault()}
              style={{
                position: "absolute",
                left: layout.positions[index]?.x ?? 0,
                top: layout.positions[index]?.y ?? 0,
                width: itemWidth || "100%",
              }}
            >
              {(() => {
                if (!photo.image) return null;
                const builder = urlFor(photo.image);
                if (!builder) return null;
                const dims = getImageDimensions(photo.image);
                const width = dims?.width ?? 1200;
                const height = dims?.height ?? 1500;
                const src = builder
                  .width(2000)
                  .height(Math.round((2000 * height) / width))
                  .fit("max")
                  .auto("format")
                  .quality(80)
                  .url();
                if (!src) return null;
                return (
                  <Image
                    src={src}
                    alt={photo.title || "Photography"}
                    width={width}
                    height={height}
                    sizes="(max-width: 768px) 92vw, (max-width: 1200px) 45vw, 30vw"
                    priority={false}
                    draggable={false}
                  />
                );
              })()}
            </button>
          ))}
        </div>
      ) : (
        <div className="photo-carousel" aria-label="Carousel view">
          <button
            type="button"
            className="carousel-nav left"
            onClick={goPrev}
            aria-label="Previous photo"
            disabled={isTransitioning}
          >
            {"<"}
          </button>
          <button
            type="button"
            className="carousel-nav right"
            onClick={goNext}
            aria-label="Next photo"
            disabled={isTransitioning}
          >
            {">"}
          </button>
          <button
            type="button"
            className="photo-carousel-item"
            ref={carouselRef}
            onContextMenu={(event) => event.preventDefault()}
            onTouchStart={onCarouselTouchStart}
            onTouchMove={onCarouselTouchMove}
            onTouchEnd={onCarouselTouchEnd}
            onTouchCancel={onCarouselTouchCancel}
          >
            {isDragging && dragNeighborSlide && settledSlide ? (
              <>
                {renderSlide(settledSlide, "carousel-slide carousel-slide-active", true, {
                  transform: `translateX(${dragOffset}px)`,
                  transition: "none",
                })}
                {renderSlide(dragNeighborSlide, "carousel-slide", true, {
                  transform: `translateX(${
                    (dragOffset < 0 ? 1 : -1) * (dragTrackWidth + dragGapPx) +
                    dragOffset
                  }px)`,
                  transition: "none",
                })}
              </>
            ) : transition && fromSlide && toSlide ? (
              <>
                {isResumeTransition
                  ? renderSlide(fromSlide, "carousel-slide carousel-slide-from", true, {
                      ...resumeSlideStyle,
                      transform: `translateX(${
                        resumePhase === "running" ? resumeFromEnd : resumeFromStart
                      }px)`,
                    })
                  : renderSlide(
                      fromSlide,
                      `carousel-slide carousel-slide-from ${
                        transition.direction === "right" ? "slide-out-left" : "slide-out-right"
                      }`
                    )}
                {isResumeTransition
                  ? renderSlide(toSlide, "carousel-slide carousel-slide-to", true, {
                      ...resumeSlideStyle,
                      transform: `translateX(${
                        resumePhase === "running" ? 0 : resumeToStart
                      }px)`,
                    })
                  : renderSlide(
                      toSlide,
                      `carousel-slide carousel-slide-to ${
                        transition.direction === "right" ? "slide-in-right" : "slide-in-left"
                      }`,
                      true
                    )}
              </>
            ) : (
              renderSlide(settledSlide, "carousel-slide carousel-slide-active", true)
            )}
          </button>
        </div>
      )}
      {selectedIndex !== null ? (
        <Lightbox
          photos={photos}
          startIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      ) : null}
    </>
  );
}
