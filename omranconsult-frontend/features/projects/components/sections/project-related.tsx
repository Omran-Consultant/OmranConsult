import { Container } from "@/core/ui/container";
import { ProjectCard } from "@/core/ui/project-card";
import { SectionHeader } from "@/core/ui/section-header";
import type { ProjectDetailView } from "@/features/projects/services/get-project-detail-data";

/** Figma "Related": three 411×440 cards (API order: same sector first, then the same owner). */
export function ProjectRelated({ project }: { readonly project: ProjectDetailView }) {
  if (project.related.length === 0 || !project.copy.related_title) {
    return null;
  }

  return (
    <section aria-labelledby="related-projects-title" className="bg-surface py-16 lg:py-25" data-reveal data-section="related">
      <Container className="flex flex-col gap-8 lg:gap-12">
        <SectionHeader overline={project.copy.related_overline} title={project.copy.related_title} titleId="related-projects-title" />
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {project.related.map((related) => (
            <li className="h-full min-w-0" key={related.slug}>
              <ProjectCard
                category={related.category}
                client={related.client}
                href={`/projects/${related.slug}`}
                image={related.image}
                region={related.region}
                sizes="(min-width: 1024px) 411px, (min-width: 768px) 50vw, 100vw"
                title={related.title}
                year={related.year}
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
