import Image from "next/image";
import Link from "next/link";
import { Project } from "@/lib/types";
import { getImageDimensions, urlFor } from "@/lib/sanity.image";

type Props = {
  projects: Project[];
};

export default function ProjectGrid({ projects }: Props) {
  return (
    <div className="grid projects-grid">
      {projects.map((project) => (
        <Link
          key={project._id}
          className="project-card"
          href={`/collections/${project.slug.current}`}
        >
          {project.coverImage ? (
            (() => {
              const builder = urlFor(project.coverImage);
              if (!builder) return null;
              const dims = getImageDimensions(project.coverImage);
              const width = dims?.width ?? 1200;
              const height = dims?.height ?? 900;
              const src = builder
                .width(1600)
                .height(Math.round((1600 * height) / width))
                .fit("max")
                .auto("format")
                .quality(80)
                .url();
              if (!src) return null;
              return (
                <Image
                  src={src}
                  alt={project.title}
                  width={width}
                  height={height}
                  sizes="(max-width: 768px) 92vw, 45vw"
                />
              );
            })()
          ) : null}
          <div className="project-meta">
            <h3>{project.title}</h3>
            {project.excerpt ? <p>{project.excerpt}</p> : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
