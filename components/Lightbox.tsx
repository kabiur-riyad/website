"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Photo } from "@/lib/types";
import { getImageDimensions, urlFor } from "@/lib/sanity.image";

type Props = {
  photos: Photo[];
  startIndex: number;
  onClose: () => void;
};

export default function Lightbox({ photos, startIndex, onClose }: Props) {
  const [index, setIndex] = useState(startIndex);
  const startX = useRef<number | null>(null);

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

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, onClose]);

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
      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <button type="button" className="lightbox-arrow left" onClick={goPrev}>
        ←
      </button>
      <button type="button" className="lightbox-arrow right" onClick={goNext}>
        →
      </button>
      <div
        className="lightbox-content"
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
          <Image
            src={src.url}
            alt={photo?.title || "Photography"}
            width={src.width}
            height={src.height}
            sizes="92vw"
            onContextMenu={(event) => event.preventDefault()}
          />
        ) : null}
        {photo?.caption ? (
          <div className="lightbox-caption">{photo.caption}</div>
        ) : null}
      </div>
    </div>
  );
}
