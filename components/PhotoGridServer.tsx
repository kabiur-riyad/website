import { Photo } from "@/lib/types";
import { urlFor, getImageDimensions } from "@/lib/sanity.image";
import { getPhotoAlt } from "@/lib/photo.seo";

interface Props {
  photos: Photo[];
}

export default function PhotoGridServer({ photos }: Props) {
  return (
    <section className="seo-photo-grid" aria-label="Photo gallery">
      <h2 className="visually-hidden">Photography Portfolio</h2>
      <ul className="seo-photo-list">
        {photos.map((photo) => {
          if (!photo.image) return null;
          const builder = urlFor(photo.image);
          if (!builder) return null;

          const dims = getImageDimensions(photo.image);
          const width = dims?.width ?? 1200;
          const height = dims?.height ?? 1500;

          const src = builder
            .width(800)
            .height(Math.round((800 * height) / width))
            .fit("max")
            .auto("format")
            .quality(80)
            .url();

          if (!src) return null;

          return (
            <li key={photo._id} className="seo-photo-item">
              <a href={`/photos/${photo._id}`} className="seo-photo-link">
                <figure className="seo-photo-figure">
                  <img
                    src={src}
                    alt={getPhotoAlt(photo)}
                    width={800}
                    height={Math.round((800 * height) / width)}
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption className="seo-photo-caption">
                    {photo.title && <span className="seo-photo-title">{photo.title}</span>}
                    {photo.location && (
                      <span className="seo-photo-location">{photo.location}</span>
                    )}
                    {photo.year && (
                      <span className="seo-photo-year">{photo.year}</span>
                    )}
                  </figcaption>
                </figure>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
