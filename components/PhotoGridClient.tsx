"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Photo } from "@/lib/types";
import { getImageDimensions, urlFor } from "@/lib/sanity.image";
import Lightbox from "./Lightbox";

type Props = {
  photos: Photo[];
};

export default function PhotoGridClient({ photos }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [heights, setHeights] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const columns = useMemo(() => {
    if (containerWidth >= 1200) return 3;
    if (containerWidth >= 800) return 2;
    return 1;
  }, [containerWidth]);

  const gap = 18;
  const itemWidth = useMemo(() => {
    if (columns === 0) return 0;
    return (containerWidth - gap * (columns - 1)) / columns;
  }, [columns, containerWidth]);

  const layout = useMemo(() => {
    const colHeights = Array(columns).fill(0);
    const positions = photos.map((_, index) => {
      const height = heights[index] ?? 0;
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = col * (itemWidth + gap);
      const y = colHeights[col];
      colHeights[col] += height + gap;
      return { x, y };
    });
    const totalHeight = colHeights.length ? Math.max(...colHeights) : 0;
    return { positions, totalHeight };
  }, [photos, heights, columns, itemWidth]);

  return (
    <>
      <div
        className="photo-grid"
        ref={containerRef}
        style={{ height: layout.totalHeight }}
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
              const renderedHeight = itemWidth
                ? Math.round((itemWidth * height) / width)
                : 0;
              return (
                <Image
                  src={src}
                  alt={photo.title || "Photography"}
                  width={width}
                  height={height}
                  sizes="(max-width: 768px) 92vw, (max-width: 1200px) 45vw, 30vw"
                  priority={false}
                  onLoad={() => {
                    if (!renderedHeight) return;
                    setHeights((prev) =>
                      prev[index] === renderedHeight
                        ? prev
                        : { ...prev, [index]: renderedHeight }
                    );
                  }}
                />
              );
            })()}
          </button>
        ))}
      </div>
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
