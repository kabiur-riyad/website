import ProjectGrid from "@/components/ProjectGrid";
import { sanityClient, hasSanityConfig } from "@/lib/sanity.client";
import { projectsQuery } from "@/lib/sanity.queries";
import { Project } from "@/lib/types";

export const revalidate = 60;

export async function generateMetadata() {
  return { title: "Projects - Kabiur Rahman Riyad" };
}

async function getProjects() {
  if (!hasSanityConfig || !sanityClient) return [];
  return sanityClient.fetch<Project[]>(projectsQuery);
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <main className="page">
      <div className="container">
        <section className="hero">
          <h1>Projects</h1>
          <p>
            Long-form stories and photographic series, curated with deliberate pacing.
          </p>
        </section>

        {hasSanityConfig ? (
          <ProjectGrid projects={projects} />
        ) : (
          <p>Connect Sanity to publish your project archive.</p>
        )}
      </div>
    </main>
  );
}
