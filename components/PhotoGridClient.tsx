"use client";

import { useState } from "react";
import Image from "next/image";
import { Photo } from "@/lib/types";
import { getImageDimensions, urlFor } from "@/lib/sanity.image";
import Lightbox from "./Lightbox";

type Props = {
  photos: Photo[];
};

export default function PhotoGridClient({ photos }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <>
      <div className="masonry">
        {photos.map((photo, index) => (
          <button
            key={photo._id}
            type="button"
            className="photo-card"
            onClick={() => setSelectedIndex(index)}
            onContextMenu={(event) => event.preventDefault()}
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
