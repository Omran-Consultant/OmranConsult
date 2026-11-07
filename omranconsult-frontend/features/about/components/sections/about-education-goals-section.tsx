import { asObject, asString } from "@/features/home/lib/block-helpers";
import { EducationGoalsStepper } from "@/features/about/components/education-goals-stepper";
import type { AppLocale } from "@/i18n/routing";

type AboutEducationGoalsSectionProps = {
  readonly locale: AppLocale;
  readonly educationGoalsBlock: unknown;
};

type GoalRecord = {
  readonly lead?: string;
  readonly body?: string;
};

function mapGoalItems(block: Record<string, unknown> | undefined): readonly GoalRecord[] {
  const raw = block?.items;
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((item) => {
    const record = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
    return {
      lead: asString(record.lead),
      body: asString(record.body),
    };
  });
}

export function AboutEducationGoalsSection({ educationGoalsBlock, locale }: AboutEducationGoalsSectionProps) {
  const block = asObject(educationGoalsBlock);
  const items = mapGoalItems(block);

  if (items.length === 0) {
    return null;
  }

  return (
    <section data-section="education-goals" id="education-goals">
      <EducationGoalsStepper items={items} locale={locale} sectionTitle={asString(block?.section_title)} />
    </section>
  );
}
