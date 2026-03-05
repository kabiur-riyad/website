import type { Metadata } from "next";
import ProjectGrid from "@/components/ProjectGrid";
import { sanityClient, hasSanityConfig } from "@/lib/sanity.client";
import { projectsQuery } from "@/lib/sanity.queries";
import { Project } from "@/lib/types";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Collections",
    description: "Explore photography collections and series by Kabiur Rahman Riyad.",
  };
}

async function getProjects() {
  if (!hasSanityConfig || !sanityClient) return [];
  return sanityClient.fetch<Project[]>(projectsQuery);
}

export default async function CollectionsPage() {
  const projects = await getProjects();

  return (
    <main className="page">
      <div className="container">
        <section className="hero">
          <h1>Collections</h1>
        </section>

        {hasSanityConfig ? (
          <ProjectGrid projects={projects} />
        ) : (
          <p>Connect Sanity to publish your collections.</p>
        )}
      </div>
    </main>
  );
}
