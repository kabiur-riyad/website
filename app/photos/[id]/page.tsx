import { Metadata } from "next";
import { notFound } from "next/navigation";
import PhotoGridClient from "@/components/PhotoGridClient";
import PhotoGridServer from "@/components/PhotoGridServer";
import { sanityClient, hasSanityConfig } from "@/lib/sanity.client";
import { photoGridQuery, photoByIdQuery, siteSettingsQuery } from "@/lib/sanity.queries";
import { Photo, SiteSettings } from "@/lib/types";
import { getImageDimensions, urlFor } from "@/lib/sanity.image";
import {
  getPhotoAlt,
  getPhotoDescription,
  getPhotoPageUrl,
  getPhotoTitle,
} from "@/lib/photo.seo";

export const revalidate = 60;

type PhotoPageProps = {
  params: Promise<{ id: string }>;
};

async function getPhoto(id: string) {
  if (!hasSanityConfig || !sanityClient) return null;
  return sanityClient.fetch<Photo | null>(photoByIdQuery, { id });
}

async function getData() {
  if (!hasSanityConfig || !sanityClient) {
    return { photos: [], settings: null };
  }

  const [photos, settings] = await Promise.all([
    sanityClient.fetch<Photo[]>(photoGridQuery),
    sanityClient.fetch<SiteSettings | null>(siteSettingsQuery),
  ]);

  return { photos, settings };
}

function getLicenseUrl(photo: Photo, settings?: SiteSettings | null) {
  const licenseUrlMap: Record<string, string> = {
    unsplash: "https://unsplash.com/license",
    "cc-by-nc": "https://creativecommons.org/licenses/by-nc/4.0/",
  };

  if (photo.license && photo.license !== "all-rights-reserved") {
    return licenseUrlMap[photo.license];
  }

  return settings?.email ? `mailto:${settings.email}` : "https://riyad.pro.bd/about";
}

function buildPhotoImageData(photo: Photo, width = 1200) {
  if (!photo.image) return null;
  const builder = urlFor(photo.image);
  if (!builder) return null;

  const dims = getImageDimensions(photo.image);
  const sourceWidth = dims?.width ?? width;
  const sourceHeight = dims?.height ?? 800;
  const height = Math.round((width * sourceHeight) / sourceWidth);
  const url = builder
    .width(width)
    .height(height)
    .fit("max")
    .auto("format")
    .quality(85)
    .url();

  return { url, width, height };
}

export async function generateMetadata({ params }: PhotoPageProps): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://riyad.pro.bd";
  const photo = await getPhoto(id);

  if (!photo) {
    return {
      title: "Photo",
      alternates: {
        canonical: getPhotoPageUrl(baseUrl, id),
      },
    };
  }

  const title = getPhotoTitle(photo);
  const description = getPhotoDescription(photo);
  const image = buildPhotoImageData(photo);

  return {
    title,
    description,
    alternates: {
      canonical: getPhotoPageUrl(baseUrl, photo._id),
    },
    openGraph: {
      type: "article",
      url: getPhotoPageUrl(baseUrl, photo._id),
      title,
      description,
      images: image
        ? [
            {
              url: image.url,
              width: image.width,
              height: image.height,
              alt: getPhotoAlt(photo),
            },
          ]
        : [],
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image.url] : [],
    },
  };
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://riyad.pro.bd";
  const { photos, settings } = await getData();
  const photo = photos.find((item) => item._id === id) ?? (await getPhoto(id));

  if (!photo?.image) {
    notFound();
  }

  const image = buildPhotoImageData(photo, 1800);
  if (!image) {
    notFound();
  }

  const pageUrl = getPhotoPageUrl(baseUrl, photo._id);
  const title = getPhotoTitle(photo);
  const hasCustomLicense = photo.license && photo.license !== "all-rights-reserved";
  const imageObject = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": pageUrl,
    url: pageUrl,
    contentUrl: image.url,
    width: image.width,
    height: image.height,
    name: title,
    description: getPhotoDescription(photo),
    caption: photo.caption || title,
    contentLocation: photo.location
      ? {
          "@type": "Place",
          name: photo.location,
        }
      : undefined,
    datePublished: photo.year ? `${photo.year}` : undefined,
    author: {
      "@type": "Person",
      name: "Kabiur Rahman Riyad",
      url: baseUrl,
    },
    creator: {
      "@type": "Person",
      name: "Kabiur Rahman Riyad",
    },
    copyrightHolder: {
      "@type": "Person",
      name: "Kabiur Rahman Riyad",
    },
    license: getLicenseUrl(photo, settings),
    acquireLicensePage: hasCustomLicense ? undefined : "https://riyad.pro.bd/about",
    creditText: "Kabiur Rahman Riyad",
    copyrightNotice: `Copyright ${photo.year || new Date().getFullYear()} Kabiur Rahman Riyad. ${
      hasCustomLicense ? "Some rights reserved." : "All rights reserved."
    }`,
  };

  const galleryPhotos = photos.some((item) => item._id === photo._id) ? photos : [photo, ...photos];

  return (
    <main className="page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageObject) }}
      />
      <div className="container">
        <div className="seo-gallery-container" aria-hidden="true">
          <PhotoGridServer photos={galleryPhotos} />
        </div>
        <PhotoGridClient
          photos={galleryPhotos}
          defaultViewMode={settings?.defaultViewMode || "carousel"}
          initialPhotoId={photo._id}
          lightboxUrlMode="photoPath"
        />
      </div>
    </main>
  );
}
