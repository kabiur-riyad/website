import Image from "next/image";
import Link from "next/link";
import { Project } from "@/lib/types";
import { getImageDimensions, urlFor } from "@/lib/sanity.image";

type Props = {
  projects: Project[];
};

export default function ProjectGrid({ projects }: Props) {
  return (
    <div className="projects-grid">
      {projects.map((project) => (
        <Link
          key={project._id}
          className="project-card"
          href={`/collections/${project.slug.current}`}
        >
          <div className="project-cover">
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
                    style={{ width: "100%", height: "auto" }}
                  />
                );
              })()
            ) : null}
            <h3 className="project-cover-title">{project.title}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}
