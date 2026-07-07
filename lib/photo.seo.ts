import { Photo } from "./types";

const SITE_NAME = "Kabiur Rahman Riyad";

function hasSpecificTitle(photo: Photo) {
  return Boolean(photo.title && photo.title.trim().toLowerCase() !== "untitled");
}

export function getPhotoTitle(photo: Photo) {
  if (hasSpecificTitle(photo)) return photo.title!.trim();
  if (photo.location && photo.year) return `Photograph from ${photo.location}, ${photo.year}`;
  if (photo.location) return `Photograph from ${photo.location}`;
  if (photo.year) return `Photograph from ${photo.year}`;
  return `Photograph by ${SITE_NAME}`;
}

export function getPhotoDescription(photo: Photo) {
  if (photo.caption) return photo.caption;

  const parts = [hasSpecificTitle(photo) ? photo.title : null, photo.location, photo.year]
    .filter(Boolean)
    .join(", ");

  return parts
    ? `${parts}. Photography by ${SITE_NAME}.`
    : `Street, travel, and documentary photography by ${SITE_NAME}.`;
}

export function getPhotoAlt(photo: Photo) {
  if (photo.caption) return photo.caption;

  const title = hasSpecificTitle(photo) ? photo.title!.trim() : "Photograph";
  const meta = [photo.location, photo.year].filter(Boolean).join(", ");

  return meta ? `${title} - ${meta} by ${SITE_NAME}` : `${title} by ${SITE_NAME}`;
}

export function getPhotoPageUrl(baseUrl: string, photoId: string) {
  return `${baseUrl.replace(/\/$/, "")}/photos/${photoId}`;
}

export function getPhotoLicenseUrl(photo: Photo, baseUrl: string) {
  const licenseUrlMap: Record<string, string> = {
    unsplash: "https://unsplash.com/license",
    "cc-by-nc": "https://creativecommons.org/licenses/by-nc/4.0/",
  };

  if (photo.license && photo.license !== "all-rights-reserved") {
    return licenseUrlMap[photo.license] || `${baseUrl.replace(/\/$/, "")}/about`;
  }

  return `${baseUrl.replace(/\/$/, "")}/about`;
}

export function getPhotoAcquireLicenseUrl(photo: Photo, baseUrl: string) {
  if (photo.license === "unsplash") {
    return "https://unsplash.com/license";
  }
  return `${baseUrl.replace(/\/$/, "")}/about`;
}

