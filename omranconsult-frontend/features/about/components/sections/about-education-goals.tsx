import { SectionHeader } from "@/core/ui/section-header";
import type { AboutView } from "@/features/about/services/get-about-page-data";

/** ✚ Education goals (D5) in the Approach-step style: rule, large number, lead, text. */
export function AboutEducationGoals({ view }: { readonly view: AboutView }) {
  const { education_goals: goals } = view.blocks;
  if (goals.items.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="about-goals-title" className="bg-surface py-section-y" data-section="education-goals" id="education-goals">
      <div className="container-page flex flex-col gap-section-gap">
        {goals.section_title ? (
          <SectionHeader overline={view.copy.education_goals.overline} title={goals.section_title} titleId="about-goals-title" />
        ) : null}
        <ol className="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
          {goals.items.map((item, index) => (
            <li
              className={index === 0 ? "border-t-2 border-accent pt-6" : "border-t-2 border-line-strong pt-6"}
              data-reveal=""
              key={`${item.lead}-${index}`}
              style={{ "--reveal-index": index % 4 } as React.CSSProperties}
            >
              <span className={`num-isolate font-latin text-[3rem] leading-none font-bold ${index === 0 ? "text-accent" : "text-muted"}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.lead ? <h3 className="mt-5 font-display text-h4 text-primary">{item.lead}</h3> : null}
              {item.body ? <p className="mt-2 text-body-s text-secondary">{item.body}</p> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
