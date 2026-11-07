import { getTranslations } from "next-intl/server";

import { Badge } from "@/core/ui/badge";
import { buildBreadcrumbJsonLd } from "@/core/seo/breadcrumbs";
import { JsonLd } from "@/core/seo/json-ld";
import { Card } from "@/core/ui/card";
import { PageHeader } from "@/core/ui/page-header";
import { Section } from "@/core/ui/section";
import { ExpertsExplorer } from "@/features/about/components/experts-explorer";
import { PartnerLogo } from "@/features/media/partner-logo";
import { SECTION_BACKGROUND_IMAGES } from "@/features/media/profile-images";
import { resolveOrgGroupHeading } from "@/features/public-content/services/org-group-headings";
import type { AppLocale } from "@/i18n/routing";

type AboutPageData = Awaited<
  ReturnType<typeof import("@/features/about/services/get-about-page-data").getAboutPageData>
>;

type AboutPageContentProps = {
  readonly locale: AppLocale;
  readonly data: AboutPageData;
};

type OrgNode = AboutPageData["orgChart"][number] & {
  readonly children: OrgNode[];
};

function asObject(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function buildOrgTree(nodes: AboutPageData["orgChart"]): OrgNode[] {
  const byId = new Map<number, OrgNode>();

  for (const node of nodes) {
    byId.set(node.id, { ...node, children: [] });
  }

  const roots: OrgNode[] = [];
  for (const node of byId.values()) {
    if (node.parentId === null) {
      roots.push(node);
      continue;
    }

    const parent = byId.get(node.parentId);
    if (!parent) {
      roots.push(node);
      continue;
    }

    parent.children.push(node);
  }

  return roots;
}

function OrgNodeItem({ node }: { readonly node: OrgNode }) {
  return (
    <li className="rounded-lg border border-border bg-surface p-4">
      <p className="font-semibold text-heading">{node.title}</p>
      {node.person?.name ? <p className="text-sm text-muted">{node.person.name}</p> : null}
      {node.children.length > 0 ? (
        <ul className="mt-3 space-y-2 ps-4">
          {node.children.map((child) => (
            <OrgNodeItem key={child.id} node={child} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export async function AboutPageContent({ locale, data }: AboutPageContentProps) {
  const t = await getTranslations("AboutPage");
  const blocks = data.home.blocks;
  const aboutBlock = asObject(blocks.about);
  const strategy = asObject(blocks.strategy);
  const educationGoals = asObject(blocks.education_goals);
  const workStages = asObject(blocks.work_stages);
  const coverage = asObject(workStages?.coverage);
  const esg = asObject(blocks.esg);
  const tools = asObject(blocks.tools);
  const credentials = asObject(blocks.credentials);
  const sectionTitles = asObject(blocks.section_titles);
  const orgGroupTitles = asObject(sectionTitles?.org_groups);
  const slidesByKey = new Map(data.home.heroSlides.map((slide) => [slide.key, slide]));
  const aboutSlideSubline = slidesByKey.get("integrated_solutions")?.subline;
  const orgRoots = buildOrgTree(data.orgChart);
  const groupedOrg = new Map<string, OrgNode[]>();
  const pageTitle = asString(aboutBlock?.heading) ?? t("titleFallback");
  const breadcrumbs = buildBreadcrumbJsonLd(locale, [
    { name: locale === "ar" ? "الرئيسية" : "Home", path: "" },
    { name: pageTitle, path: "/about" },
  ]);

  for (const root of orgRoots) {
    const group = root.group;
    const groupList = groupedOrg.get(group) ?? [];
    groupList.push(root);
    groupedOrg.set(group, groupList);
  }

  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={breadcrumbs} />
      <PageHeader
        description={aboutSlideSubline ?? undefined}
        image={SECTION_BACKGROUND_IMAGES.about}
        locale={locale}
        title={pageTitle}
      />

      <Section>
        <div className="space-y-4 text-muted">
          {asStringList(aboutBlock?.body).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Section>

      <Section heading={asString(educationGoals?.section_title)}>
        <div className="grid gap-4 md:grid-cols-2">
          {(educationGoals?.items as Array<Record<string, unknown>> | undefined)?.map((item, index) => (
            <Card key={index}>
              <h3 className="font-display text-lg font-semibold text-heading">{asString(item.lead)}</h3>
              <p className="mt-2 text-muted">{asString(item.body)}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section heading={slidesByKey.get("vision")?.headline} tone="dark">
        <div className="grid gap-6 md:grid-cols-3">
          {(["vision", "mission", "objectives"] as const).map((key) => {
            const block = asObject(strategy?.[key]);
            return (
              <Card className="bg-white/5 text-white" key={key}>
                <h3 className="font-display text-2xl font-semibold">{asString(block?.title)}</h3>
                <p className="mt-2 text-muted-on-dark">{asString(block?.body)}</p>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section heading={asString(workStages?.section_title)}>
        <div className="grid gap-6 md:grid-cols-3">
          {(workStages?.stages as Array<Record<string, unknown>> | undefined)?.map((stage, index) => (
            <Card key={index}>
              <h3 className="font-display text-xl font-semibold text-heading">{asString(stage.title)}</h3>
              <ul className="mt-3 space-y-2 text-muted">
                {asStringList(stage.items).map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <Card>
          <h3 className="font-display text-xl font-semibold text-heading">{asString(coverage?.heading)}</h3>
          <p className="mt-2 text-muted">{asString(coverage?.body)}</p>
        </Card>
      </Section>

      <Section heading={asString(esg?.section_title)}>
        <div className="space-y-4 text-muted">
          {asStringList(esg?.body).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Section>

      <Section heading={asString(tools?.section_title)}>
        <div className="grid gap-4 md:grid-cols-2">
          {(tools?.items as Array<Record<string, unknown>> | undefined)?.map((item, index) => (
            <Card key={index}>
              <h3 className="font-display text-lg font-semibold text-heading">{asString(item.title)}</h3>
              <p className="mt-2 text-muted">{asString(item.body)}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="experts" heading={asString(sectionTitles?.experts)}>
        <ExpertsExplorer experts={data.experts} locale={locale} />
      </Section>

      <Section id="org-chart" heading={asString(sectionTitles?.org_chart)}>
        <div className="space-y-6">
          {Array.from(groupedOrg.entries()).map(([group, nodes]) => {
            const groupHeading = resolveOrgGroupHeading(orgGroupTitles, group);

            return (
            <div key={group}>
              {groupHeading ? (
                <h3 className="mb-3 font-display text-xl font-semibold text-heading">{groupHeading}</h3>
              ) : null}
              <ul className="space-y-3">
                {nodes.map((node) => (
                  <OrgNodeItem key={node.id} node={node} />
                ))}
              </ul>
            </div>
            );
          })}
        </div>
      </Section>

      <Section id="credentials" heading={asString(credentials?.certificates_title)}>
        <div className="space-y-6">
          {(["license", "iso_certificate"] as const).map((kind) => (
            <div key={kind}>
              <h3 className="font-display text-xl font-semibold text-heading">
                {kind === "license" ? asString(credentials?.licenses_title) : asString(credentials?.certificates_title)}
              </h3>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {data.documents
                  .filter((document) => document.kind === kind)
                  .map((document) => (
                    <Card key={document.id}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-heading">{document.title}</p>
                        {document.isExpired ? <Badge>{t("expiredBadge")}</Badge> : null}
                      </div>
                      {document.standardCode ? <p className="mt-2 text-sm text-muted">{document.standardCode}</p> : null}
                      {document.validUntil ? <p className="mt-1 text-sm text-muted">{document.validUntil}</p> : null}
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section heading={t("partnersHeading")}>
        <div className="grid gap-4 md:grid-cols-2">
          {data.partners.map((partner) => (
            <Card className="overflow-hidden p-0" key={partner.id}>
              <PartnerLogo name={partner.name} slug={partner.slug} />
              <div className="space-y-2 p-4">
                <h3 className="font-display text-lg font-semibold text-heading">{partner.name}</h3>
                <p className="text-muted">{partner.field}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}
