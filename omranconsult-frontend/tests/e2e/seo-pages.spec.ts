import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

/**
 * SITE_POLISH P4b: search and sharing tags per page type, both locales, every published project
 * and article. The robots/noindex behaviour of non-production hosts is covered in seo.spec.ts.
 */
type Kind = "home" | "listing" | "project" | "article";
type Target = { readonly path: string; readonly kind: Kind };

const LOCALES = ["ar", "en"] as const;
const BREADCRUMB_LABEL = { ar: "مسار التنقل", en: "Breadcrumb" } as const;
const ARABIC = /[؀-ۿ]/;

async function publishedSlugs(request: APIRequestContext) {
  const projects = (await (await request.get("/api/projects?per_page=100")).json()) as { data: { slug: string }[] };
  const news = (await (await request.get("/api/news?per_page=50")).json()) as { data: { slug: string; date: string | null }[] };
  const featured = (await (await request.get("/api/news?featured=1&per_page=50")).json()) as { data: { slug: string; date: string | null }[] };
  const articles = new Map([...news.data, ...featured.data].map((post) => [post.slug, post]));
  return { projects: projects.data.map((project) => project.slug), articles: [...articles.values()] };
}

async function head(page: Page) {
  return page.evaluate(() => {
    const meta = (selector: string) => document.querySelector(selector)?.getAttribute("content") ?? null;
    const link = (selector: string) => document.querySelector(selector)?.getAttribute("href") ?? null;
    return {
      title: document.title,
      description: meta('meta[name="description"]'),
      canonical: link('link[rel="canonical"]'),
      ar: link('link[rel="alternate"][hreflang="ar"]'),
      en: link('link[rel="alternate"][hreflang="en"]'),
      xDefault: link('link[rel="alternate"][hreflang="x-default"]'),
      ogTitle: meta('meta[property="og:title"]'),
      ogDescription: meta('meta[property="og:description"]'),
      ogImage: meta('meta[property="og:image"]'),
      ogUrl: meta('meta[property="og:url"]'),
      ogType: meta('meta[property="og:type"]'),
      twitterCard: meta('meta[name="twitter:card"]'),
      twitterImage: meta('meta[name="twitter:image"]'),
      jsonLd: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((node) => node.textContent ?? ""),
      h1: Array.from(document.querySelectorAll("h1")).map((node) => node.textContent?.trim() ?? ""),
      images: Array.from(document.querySelectorAll("main img")).map((image) => ({
        alt: image.getAttribute("alt"),
        decorative: image.getAttribute("alt") === "" || image.closest('[aria-hidden="true"]') !== null,
        src: image.getAttribute("src") ?? "",
      })),
    };
  });
}

async function checkPage(page: Page, baseURL: string, locale: (typeof LOCALES)[number], target: Target) {
  const url = `${baseURL}/${locale}${target.path}`;
  const response = await page.goto(`/${locale}${target.path}`);
  expect(response?.status(), url).toBe(200);
  const tags = await head(page);
  const where = `${locale}${target.path || "/"}`;

  expect(tags.title, where).not.toBe("");
  expect(tags.description?.length ?? 0, `${where} description`).toBeGreaterThan(20);
  expect(tags.description?.length ?? 0, `${where} description`).toBeLessThanOrEqual(170);
  expect(tags.canonical, where).toBe(url);
  expect(tags.ar, where).toBe(`${baseURL}/ar${target.path}`);
  expect(tags.en, where).toBe(`${baseURL}/en${target.path}`);
  expect(tags.xDefault, where).toBe(`${baseURL}/en${target.path}`);
  expect(tags.ogTitle, where).toBe(tags.title);
  expect(tags.ogDescription, where).toBe(tags.description);
  expect(tags.ogUrl, where).toBe(url);
  expect(tags.ogImage ?? "", where).toMatch(/^https?:\/\//);
  expect(tags.twitterCard, where).toBe("summary_large_image");
  expect(tags.twitterImage ?? "", where).toMatch(/^https?:\/\//);
  if (target.kind === "project" || target.kind === "article") {
    // A detail page shares its own cover, never the default image.
    expect(tags.ogImage, where).not.toContain("og-default");
  }
  expect(tags.h1, where).toHaveLength(1);

  const graphs = tags.jsonLd.map((text) => JSON.parse(text) as { "@type": string; headline?: string; itemListElement?: { item: string }[] });
  const types = graphs.map((graph) => graph["@type"]);
  expect(types, where).toContain("Organization");
  if (target.kind === "article") {
    const article = graphs.find((graph) => graph["@type"] === "NewsArticle");
    expect(article?.headline, where).toBe(tags.h1[0]);
  }
  if ((await page.locator(`nav[aria-label="${BREADCRUMB_LABEL[locale]}"]`).count()) > 0) {
    const crumbs = graphs.find((graph) => graph["@type"] === "BreadcrumbList");
    expect(crumbs?.itemListElement?.at(-1)?.item, `${where} breadcrumbs`).toBe(url);
  }

  for (const image of tags.images) {
    expect(image.alt, `${where} ${image.src}`).not.toBeNull();
    if (image.decorative) {
      continue;
    }
    // A content image has text in the page language: no Arabic left on English pages, and
    // Arabic on Arabic pages unless it is a Latin brand name (client and partner logos).
    if (locale === "en") {
      expect(image.alt, `${where} ${image.src}`).not.toMatch(ARABIC);
    } else {
      expect(ARABIC.test(image.alt ?? "") || /^[A-Za-z0-9 .&'’—-]+$/.test(image.alt ?? ""), `${where} ${image.src}: ${image.alt}`).toBe(true);
    }
  }
  return tags.title;
}

test("every public page has its own title, description, canonical, sharing tags and JSON-LD", async ({ page, request, baseURL }) => {
  test.setTimeout(600_000);
  const { projects, articles } = await publishedSlugs(request);
  const targets: Target[] = [
    { path: "", kind: "home" },
    ...["/about", "/services", "/projects", "/contact", "/media"].map((path) => ({ path, kind: "listing" as const })),
    ...projects.map((slug) => ({ path: `/projects/${slug}`, kind: "project" as const })),
    ...articles.map((post) => ({ path: `/media/${post.slug}`, kind: "article" as const })),
  ];

  for (const locale of LOCALES) {
    const titles = new Map<string, string>();
    for (const target of targets) {
      const title = await checkPage(page, baseURL ?? "", locale, target);
      expect(titles.get(title), `${locale}${target.path} repeats the title of ${titles.get(title)}`).toBeUndefined();
      titles.set(title, `${locale}${target.path}`);
    }
  }
});

test("the sitemap lists every published project and article in both locales with lastmod", async ({ request, baseURL }) => {
  const { projects, articles } = await publishedSlugs(request);
  const xml = await (await request.get("/sitemap.xml")).text();
  const entries = new Map(
    Array.from(xml.matchAll(/<url>([\s\S]*?)<\/url>/g)).map(([, body]) => [/<loc>(.*?)<\/loc>/.exec(body ?? "")?.[1] ?? "", /<lastmod>(.*?)<\/lastmod>/.exec(body ?? "")?.[1]]),
  );
  for (const locale of LOCALES) {
    for (const slug of projects) {
      expect(entries.get(`${baseURL}/${locale}/projects/${slug}`), `${locale} project ${slug}`).toBeTruthy();
    }
    for (const post of articles) {
      const lastmod = entries.get(`${baseURL}/${locale}/media/${post.slug}`);
      expect(lastmod, `${locale} article ${post.slug}`).toBeTruthy();
      if (post.date) {
        expect(lastmod?.slice(0, 10), `${locale} article ${post.slug}`).toBe(post.date);
      }
    }
  }
});
