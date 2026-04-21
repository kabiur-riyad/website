"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Photo } from "@/lib/types";
import { getImageDimensions, urlFor } from "@/lib/sanity.image";

type Props = {
  photos: Photo[];
  startIndex: number;
  onClose: () => void;
  hideTitles?: boolean;
};

function formatPhotoMeta(location?: string, year?: number) {
  if (location && year) return `${location} | ${year}`;
  if (location) return location;
  if (year) return String(year);
  return null;
}

export default function Lightbox({ photos, startIndex, onClose, hideTitles = false }: Props) {
  const [index, setIndex] = useState(startIndex);
  const startX = useRef<number | null>(null);
  const [cursorHalf, setCursorHalf] = useState<"left" | "right" | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIndex(startIndex);
  }, [startIndex]);

  const photo = photos[index];

  const goPrev = useCallback(() => {
    setIndex((current) => (current - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % photos.length);
  }, [photos.length]);

  // Handle closing - remove photo param from URL
  const handleClose = useCallback(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("photo");
      window.history.replaceState({}, "", url.toString());
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, handleClose]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyTouchAction = document.body.style.touchAction;
    const previousHtmlTouchAction = document.documentElement.style.touchAction;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.documentElement.style.touchAction = "none";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
      document.documentElement.style.touchAction = previousHtmlTouchAction;
    };
  }, []);

  // Update URL when photo changes in lightbox for shareable links
  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentPhoto = photos[index];
    if (!currentPhoto) return;

    const url = new URL(window.location.href);
    url.searchParams.set("photo", currentPhoto._id);
    window.history.replaceState({}, "", url.toString());
  }, [index, photos]);

  const src = useMemo(() => {
    if (!photo?.image) return null;
    const builder = urlFor(photo.image);
    if (!builder) return null;
    const dims = getImageDimensions(photo.image);
    const width = dims?.width ?? 1600;
    const height = dims?.height ?? 2000;
    return {
      width,
      height,
      url: builder
        .width(2400)
        .height(Math.round((2400 * height) / width))
        .fit("max")
        .auto("format")
        .quality(85)
        .url(),
    };
  }, [photo]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true">
      <button type="button" className="lightbox-close" onClick={handleClose} aria-label="Close">
        ×
      </button>
      <button type="button" className={`lightbox-arrow left${cursorHalf === "left" ? " visible" : ""}`} onClick={goPrev}>
        ←
      </button>
      <button type="button" className={`lightbox-arrow right${cursorHalf === "right" ? " visible" : ""}`} onClick={goNext}>
        →
      </button>
      <div
        className="lightbox-content"
        onMouseMove={(event) => {
          const half = event.clientX < window.innerWidth / 2 ? "left" : "right";
          setCursorHalf(half);
          if (hideTimer.current) clearTimeout(hideTimer.current);
          hideTimer.current = setTimeout(() => setCursorHalf(null), 1500);
        }}
        onMouseLeave={() => {
          setCursorHalf(null);
          if (hideTimer.current) clearTimeout(hideTimer.current);
        }}
        onContextMenu={(event) => event.preventDefault()}
        onTouchStart={(event) => {
          startX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (startX.current === null) return;
          const endX = event.changedTouches[0]?.clientX ?? startX.current;
          const delta = endX - startX.current;
          if (Math.abs(delta) > 40) {
            if (delta > 0) goPrev();
            else goNext();
          }
          startX.current = null;
        }}
      >
        {src ? (
          <div className="photo-display-frame lightbox-photo-frame">
            <div className="photo-media">
              <Image
                src={src.url}
                alt={photo?.title || "Photography"}
                width={src.width}
                height={src.height}
                sizes="92vw"
                onContextMenu={(event) => event.preventDefault()}
              />
            </div>
          </div>
        ) : null}
        <div className="lightbox-meta">
          {!hideTitles && photo?.title ? <span>{photo.title}</span> : null}
          {formatPhotoMeta(photo?.location, photo?.year) ? (
            <span>{formatPhotoMeta(photo?.location, photo?.year)}</span>
          ) : null}
        </div>
        {photo?.caption ? (
          <div className="lightbox-caption">{photo.caption}</div>
        ) : null}
        {photo?.license && photo.license !== "all-rights-reserved" && (
          <div className="lightbox-copyright">
            <a
              href={
                photo.license === "unsplash"
                  ? "https://unsplash.com/license"
                  : photo.license === "cc-by-nc"
                    ? "https://creativecommons.org/licenses/by-nc/4.0/"
                    : "#"
              }
              target="_blank"
              rel="noreferrer"
              className="lightbox-license-link"
            >
              License
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
