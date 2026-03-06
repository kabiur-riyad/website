import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { sanityClient, hasSanityConfig } from "@/lib/sanity.client";
import { projectBySlugQuery, siteSettingsQuery } from "@/lib/sanity.queries";
import { Project, SiteSettings } from "@/lib/types";
import PhotoGridClient from "@/components/PhotoGridClient";
import { Metadata } from "next";
import { urlFor } from "@/lib/sanity.image";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return {
      title: "Collection",
    };
  }

  const title = project.title;
  const description = project.excerpt || `Photography collection: ${project.title}`;
  const ogImage = project.coverImage ? urlFor(project.coverImage)?.width(1200).height(630).url() : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : [],
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

async function getProject(slug: string) {
  if (!hasSanityConfig || !sanityClient) return null;
  return sanityClient.fetch<Project | null>(projectBySlugQuery, { slug });
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([
    getProject(slug),
    hasSanityConfig && sanityClient
      ? sanityClient.fetch<SiteSettings | null>(siteSettingsQuery)
      : Promise.resolve(null),
  ]);

  if (!project) {
    notFound();
  }

  const mergedPhotos = [...(project.photos ?? []), ...(project.relatedPhotos ?? [])];
  const seen = new Set<string>();
  const collectionPhotos = mergedPhotos
    .filter((photo) => {
      const ref = photo.image?.asset?._ref;
      if (!ref) return false;
      if (seen.has(ref)) return false;
      seen.add(ref);
      return true;
    })
    .map((photo, index) => ({
      _id:
        "_id" in photo && photo._id
          ? photo._id
          : "_key" in photo
            ? photo._key
            : `${project._id}-${index}`,
      title: "title" in photo ? photo.title : undefined,
      caption: photo.caption,
      image: photo.image,
    }));

  return (
    <main className="page">
      <div className="container">
        <section className="project-hero">
          <div>
            <h1>{project.title}</h1>
            {project.description ? (
              <div>
                <PortableText value={project.description} />
              </div>
            ) : null}
          </div>
        </section>

        {collectionPhotos.length === 0 ? (
          <section className="photo-series">
            <p>No photos in this collection yet.</p>
          </section>
        ) : (
          <PhotoGridClient
            photos={collectionPhotos}
            defaultViewMode="carousel"
          />
        )}
      </div>
    </main>
  );
}
