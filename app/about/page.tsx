import type { Metadata } from "next";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import ContactForm from "@/components/ContactForm";
import { sanityClient, hasSanityConfig } from "@/lib/sanity.client";
import { siteSettingsQuery } from "@/lib/sanity.queries";
import { SiteSettings } from "@/lib/types";
import { getImageDimensions, urlFor } from "@/lib/sanity.image";

export const revalidate = 60;

async function getSettings() {
  if (!hasSanityConfig || !sanityClient) return null;
  return sanityClient.fetch<SiteSettings | null>(siteSettingsQuery);
}

function getPortraitData(settings: SiteSettings | null) {
  if (!settings?.portrait) return null;
  const builder = urlFor(settings.portrait);
  if (!builder) return null;

  const dims = getImageDimensions(settings.portrait);
  const width = dims?.width ?? 900;
  const height = dims?.height ?? 1100;
  const src = builder
    .width(1200)
    .height(Math.round((1200 * height) / width))
    .fit("max")
    .auto("format")
    .quality(82)
    .url();

  if (!src) return null;

  return {
    src,
    width,
    height,
    alt: "Portrait of Kabiur Rahman Riyad",
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const portrait = getPortraitData(settings);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://riyad.pro.bd";
  const title = "About";
  const description = "Learn more about Kabiur Rahman Riyad, a street, travel, and documentary photographer.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/about`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/about`,
      images: portrait
        ? [
            {
              url: portrait.src,
              width: portrait.width,
              height: portrait.height,
              alt: portrait.alt,
            },
          ]
        : [],
    },
    twitter: {
      card: portrait ? "summary_large_image" : "summary",
      title,
      description,
      images: portrait ? [portrait.src] : [],
    },
  };
}

export default async function AboutPage() {
  const settings = await getSettings();
  const portrait = getPortraitData(settings);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://riyad.pro.bd";
  const portraitSchema = portrait
    ? {
        "@context": "https://schema.org",
        "@type": "ImageObject",
        contentUrl: portrait.src,
        url: `${baseUrl}/about`,
        width: portrait.width,
        height: portrait.height,
        caption: portrait.alt,
        creator: {
          "@type": "Person",
          name: "Kabiur Rahman Riyad",
        },
      }
    : null;

  return (
    <main className="page">
      <div className="container">
        {portraitSchema ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(portraitSchema) }}
          />
        ) : null}
        <section className="hero">
          <h1>About</h1>
        </section>

        {settings ? (
          <>
            <section className="about-grid">
              <div>
                {settings.bio ? (
                  <PortableText value={settings.bio} />
                ) : (
                  <p>Add your About content in Site Settings.</p>
                )}
                <p style={{ marginTop: "1rem" }}>
                  <a href="/cv.html">View CV</a>
                </p>
              </div>
              {portrait ? (
                <div className="about-portrait">
                  <Image
                    src={portrait.src}
                    alt={portrait.alt}
                    width={portrait.width}
                    height={portrait.height}
                    sizes="(max-width: 768px) 90vw, 40vw"
                  />
                </div>
              ) : null}
            </section>

            <section className="contact-card contact-seamless">
              {settings?.contactBlurb ? (
                <PortableText value={settings.contactBlurb} />
              ) : (
                <h1 className="contact-heading">Contact</h1>
              )}
              {settings?.email ? (
                <p>
                  <a href={`mailto:${settings.email}`}>{settings.email}</a>
                </p>
              ) : null}
              <ContactForm
                email={settings?.email}
                enabled={settings?.contactFormEnabled ?? false}
              />
            </section>
          </>
        ) : (
          <p>Connect Sanity to publish your bio and portrait.</p>
        )}
      </div>
    </main>
  );
}
