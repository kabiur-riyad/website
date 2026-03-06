"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Photo } from "@/lib/types";
import { getImageDimensions, urlFor } from "@/lib/sanity.image";
import Lightbox from "./Lightbox";

type Props = {
  photos: Photo[];
  defaultViewMode?: "grid" | "carousel";
  hideViewToggle?: boolean;
};

export default function PhotoGridClient({
  photos,
  defaultViewMode = "carousel",
  hideViewToggle = false,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "carousel">(defaultViewMode);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [ready, setReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const swipeStartX = useRef<number | null>(null);
  const VIEW_MODE_KEY = "photo_view_mode";

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

  const goPrev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCarouselIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 300);
  }, [photos.length, isTransitioning]);

  const goNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCarouselIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 300);
  }, [photos.length, isTransitioning]);

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

  const currentPhoto = photos[carouselIndex];

  const currentDims = useMemo(() => {
    if (!currentPhoto?.image) return { width: 1200, height: 1500 };
    const dims = getImageDimensions(currentPhoto.image);
    return { width: dims?.width ?? 1200, height: dims?.height ?? 1500 };
  }, [currentPhoto]);

  const currentSrc = useMemo(() => {
    if (!currentPhoto?.image) return null;
    const builder = urlFor(currentPhoto.image);
    if (!builder) return null;
    return (
      builder
        .width(2200)
        .height(Math.round((2200 * currentDims.height) / currentDims.width))
        .fit("max")
        .auto("format")
        .quality(82)
        .url() || null
    );
  }, [currentPhoto, currentDims.height, currentDims.width]);

  useEffect(() => {
    if (viewMode !== "carousel" || !photos.length) return;
    const prevIndex = carouselIndex === 0 ? photos.length - 1 : carouselIndex - 1;
    const nextIndex = carouselIndex === photos.length - 1 ? 0 : carouselIndex + 1;
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
  }, [viewMode, carouselIndex, photos]);

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
            onContextMenu={(event) => event.preventDefault()}
          >
            {currentPhoto && currentSrc ? (
              <Image
                src={currentSrc}
                alt={currentPhoto.title || "Photography"}
                width={currentDims.width}
                height={currentDims.height}
                sizes="(max-width: 768px) 90vw, 72vw"
                priority
                draggable={false}
                onTouchStart={(event) => {
                  swipeStartX.current = event.touches[0]?.clientX ?? null;
                }}
                onTouchEnd={(event) => {
                  if (swipeStartX.current === null || isTransitioning) return;
                  const endX =
                    event.changedTouches[0]?.clientX ?? swipeStartX.current;
                  const delta = endX - swipeStartX.current;
                  if (Math.abs(delta) > 40) {
                    if (delta > 0) goPrev();
                    else goNext();
                  }
                  swipeStartX.current = null;
                }}
              />
            ) : null}
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
