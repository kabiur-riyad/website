import Image from "next/image";
import { PortableText } from "@portabletext/react";
import ContactForm from "@/components/ContactForm";
import { sanityClient, hasSanityConfig } from "@/lib/sanity.client";
import { siteSettingsQuery } from "@/lib/sanity.queries";
import { SiteSettings } from "@/lib/types";
import { getImageDimensions, urlFor } from "@/lib/sanity.image";

export const revalidate = 60;

export async function generateMetadata() {
  return { title: "About - Kabiur Rahman Riyad" };
}

async function getSettings() {
  if (!hasSanityConfig || !sanityClient) return null;
  return sanityClient.fetch<SiteSettings | null>(siteSettingsQuery);
}

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <main className="page">
      <div className="container">
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
              </div>
              {settings.portrait ? (
                <div className="about-portrait">
                  {(() => {
                    const builder = urlFor(settings.portrait);
                    if (!builder) return null;
                    const dims = getImageDimensions(settings.portrait);
                    const width = dims?.width ?? 900;
                    const height = dims?.height ?? 1100;
                    const src = builder
                      .width(1000)
                      .height(Math.round((1000 * height) / width))
                      .fit("max")
                      .auto("format")
                      .quality(80)
                      .url();
                    if (!src) return null;
                    return (
                      <Image
                        src={src}
                        alt="Photographer portrait"
                        width={width}
                        height={height}
                        sizes="(max-width: 768px) 90vw, 40vw"
                      />
                    );
                  })()}
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
