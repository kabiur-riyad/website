import imageUrlBuilder from "@sanity/image-url";
import { sanityClient } from "./sanity.client";

const builder = sanityClient ? imageUrlBuilder(sanityClient) : null;

export const urlFor = (source: any) => {
  const ref = source?.asset?._ref;
  if (!builder || !ref || typeof ref !== "string" || ref.length === 0) {
    return null;
  }
  return builder.image(source);
};

export const getImageDimensions = (source: any) => {
  const dims = source?.assetMeta?.dimensions;
  if (dims?.width && dims?.height) return dims;
  const ref = source?.asset?._ref;
  if (typeof ref !== "string") return null;
  const match = /-(\d+)x(\d+)-/.exec(ref);
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
  return { width, height };
};
