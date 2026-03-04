import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { sanityClient, hasSanityConfig } from "@/lib/sanity.client";
import { projectBySlugQuery } from "@/lib/sanity.queries";
import { Project } from "@/lib/types";
import { getImageDimensions, urlFor } from "@/lib/sanity.image";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Collection - Kabiur Rahman Riyad" };
  return { title: `${project.title} - Kabiur Rahman Riyad` };
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
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

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
          {project.coverImage ? (
            <div className="series-card">
              {(() => {
                const builder = urlFor(project.coverImage);
                if (!builder) return null;
                const dims = getImageDimensions(project.coverImage);
                const width = dims?.width ?? 1600;
                const height = dims?.height ?? 1100;
                const src = builder
                  .width(2000)
                  .height(Math.round((2000 * height) / width))
                  .fit("max")
                  .auto("format")
                  .quality(85)
                  .url();
                if (!src) return null;
                return (
                  <Image
                    src={src}
                    alt={project.title}
                    width={width}
                    height={height}
                    sizes="92vw"
                  />
                );
              })()}
            </div>
          ) : null}
        </section>

        <section className="photo-series">
          {[...(project.photos ?? []), ...(project.relatedPhotos ?? [])].map(
            (photo, index) => (
            <div
              className="series-card"
              key={"_key" in photo ? photo._key : photo._id ?? index}
            >
              {(() => {
                if (!photo.image) return null;
                const builder = urlFor(photo.image);
                if (!builder) return null;
                const dims = getImageDimensions(photo.image);
                const width = dims?.width ?? 1500;
                const height = dims?.height ?? 2000;
                const src = builder
                  .width(2000)
                  .height(Math.round((2000 * height) / width))
                  .fit("max")
                  .auto("format")
                  .quality(85)
                  .url();
                if (!src) return null;
                return (
                  <Image
                    src={src}
                    alt={photo.caption || project.title}
                    width={width}
                    height={height}
                    sizes="92vw"
                  />
                );
              })()}
              {photo.caption ? (
                <div className="photo-caption">{photo.caption}</div>
              ) : null}
            </div>
            )
          )}
        </section>
      </div>
    </main>
  );
}
