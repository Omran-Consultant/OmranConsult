# omranconsult frontend (Next.js)

Scope: `omranconsult-frontend/` only.

Obey the workspace `CLAUDE.md` for product boundaries, architecture, separation of concerns, the API contract, secrets, and Git. This file owns Next.js structure, the public website, and the admin dashboard UI. Do not copy Laravel module or persistence rules into this file.

<!-- Golden test: "Would removing this rule cause an agent to make mistakes?" If not, cut it. -->

Stack to use when building: Next.js App Router · TypeScript strict · Tailwind CSS · next-intl · Zod · Vitest + React Testing Library · Playwright. Backend: the Laravel API in `omranconsult-backend/`. Always read the installed Next.js docs before relying on caching, params, or metadata. This app is Next.js 16.4.3. Also follow `AGENTS.md`; `next dev` rewrites that file.

## What exists today

**Implemented (Phase 4C, Figma design).** Do not describe the items below as missing.

* **Routes and i18n:** `next-intl` with locales `en` (default) and `ar`, `localePrefix: "always"`, cookie `NEXT_LOCALE` (`i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`). **`proxy.ts`** runs the next-intl middleware, so `/` redirects to `/en`. **`app/[locale]/layout.tsx`** sets `lang` and `dir`, loads messages, metadata with `alternates` and `x-default` → `en` (`core/seo/locale-metadata.ts`), and the theme pre-paint script.
* **Public pages:** `/{locale}` home, `/about`, `/services`, `/projects`, `/projects/[slug]`, `/contact`, `/media`, `/media/[slug]`, and a localized 404 (`not-found.tsx`, catch-all `[...rest]`). Careers stays hidden. Pages are thin; data flows `app/` → `features/<page>/services` → `lib/api/public-content.ts` (cached `"use cache"` fetchers with `cacheLife("hours")` and `cacheTag`). Detail fetchers return `null` on 404, because an error thrown inside `"use cache"` loses its class. `proxy.ts` confirms an unknown project or news slug before the shell streams and rewrites to the localized not-found page, so the status is HTTP 404. `app/[locale]/error.tsx` (localized retry), `app/global-error.tsx` (inline styles only), and route `loading.tsx` files cover error and loading.
* **Features:** `home`, `about`, `services`, `projects` (list, filters in the URL, detail, project inquiry), `contact` (inquiry form), `news` (Media Center tabs, load more, article, share links), `layout` (header, footer, mobile menu). `features/public-content` (Zod API schemas, mappers, and the shared Home design-copy schema whose CTA the inner pages reuse) and `features/media` (site image registry, brand logos) are the shared content modules every page feature reads.
* **Design copy:** marketing text the design adds comes from the API (`design_copy` with a `design_copy_review` dispute) and is parsed with lenient Zod schemas, so a missing string hides its element. UI labels live in `messages/{ar,en}.json`.
* **Shared UI (`core/ui/`):** buttons, cards, inputs, section header, page hero, breadcrumb, chips, status badge, partner cards, CTA box, newsletter form (inline and block), skeleton, spinner, count-up, reveal observer. Pure helpers in `core/format/` (dates, statistics, standard codes) and `core/validation/` (inquiry limits, email, Saudi mobile).
* **SEO and crawling:** locale-aware metadata, `app/sitemap.ts` (static routes, project and news slugs), `app/robots.ts`, Organization JSON-LD on home, BreadcrumbList JSON-LD on inner pages.
* **Testing:** `npm test` (Node test runner, pure modules only: no `@/` value imports). `npm run test:e2e` runs Playwright + `@axe-core/playwright` against a production build (`E2E_PORT` when 3000 is taken): every route × locale smoke + axe, no horizontal scroll at 390, and the flows (contact, project inquiry, newsletter, sector filter and search, mobile menu focus trap and Esc, carousel keyboard, media tabs). `scripts/parity-sheets.mjs` (Figma vs implementation) and `scripts/route-screenshots.mjs` (§9.2 captures) write to the git-ignored `review-shots/`.
* **Layout shell (`features/layout/`):** header (active link `aria-current`), footer with newsletter, mobile menu (focus trap in `core/hooks/use-focus-trap.ts`), `navigation.ts`. Locale switcher in `core/i18n/`; light/dark theme in `core/theme/` (light is the default, A35).
* **Identity (Figma handoff, SDD A30):** semantic tokens, the light theme and the type scale in `app/globals.css`; Somar (`app/fonts/somar/`, `next/font/local`) for Arabic, Rubik for English and Montserrat for Latin overlines and numbers (`next/font/google`) in `core/fonts/public.ts`; logos in `public/images/brand/` via `features/layout/components/brand-logo.tsx`; site photos in `public/images/site/`. Values are recorded in `docs/DESIGN_BASELINE.md`.
* **Next config:** `cacheComponents` and `partialPrefetching` enabled. **`next.config.ts`** rewrites **`/api/*`** and **`/sanctum/*`** to **`API_BASE_URL`** (default **`http://localhost:8000`**) so browser calls stay same-origin for Sanctum cookies and CSRF.
* **API client (`lib/api/`):** Typed **`ApiError`**, **`server-client.ts`** (server-only **`API_BASE_URL`**), **`public-content.ts`** (public read API), **`browser-client.ts`** (**`credentials: 'include'`**, Sanctum CSRF init, **`X-XSRF-TOKEN`**), **`public-writes.ts`** (`postInquiry`, `postNewsletterSubscription` on top of the browser client), **`admin-browser.ts`** (**`adminLogin`**, **`adminLogout`**, **`adminMe`**; no dashboard UI calls these yet).
* **Env (`core/env/`):** **`public.ts`** — **`NEXT_PUBLIC_SITE_URL`**, **`getBrowserApiBaseUrl()`** (same-origin by default; optional **`NEXT_PUBLIC_API_BASE_URL`** for direct cross-origin). **`server.ts`** — **`import "server-only"`**, **`getServerApiBaseUrl()`**. Env values are not Zod-validated at startup.
* **Tooling:** TypeScript **`strict`**. ESLint **`eslint-config-next`**. Dependencies beyond the scaffold: `next-intl`, `zod`; dev: `@playwright/test`, `@axe-core/playwright`. Scripts: **`dev`**, **`build`**, **`start`**, **`lint`**, **`typecheck`**, **`test`**, **`test:e2e`**. Vitest, React Testing Library and Prettier are not installed.
* **`.env.example`:** **`API_BASE_URL`**, **`NEXT_PUBLIC_SITE_URL`**; documents leaving **`NEXT_PUBLIC_API_BASE_URL`** unset for rewrite mode.

**Not built (planned — do not claim present).**

* Admin dashboard, **`/api/revalidate`**, and CMS publishing integrations.

The sections below are the required shape for **future** work. Do not scaffold empty trees unless a task needs them.

## Resolved conflicts

- **Default public locale:** English (`en`) is default. Root **`/`** redirects to **`/en`** through **`proxy.ts`** (next-intl middleware, **`SYSTEM_DESIGN.md` v1.6** §4.2). Every public page sets **`generateMetadata` alternates** with **`x-default` → `en`**. Arabic (`ar`) has the same copy, validation, navigation, metadata, and layout coverage as English.
- **Tokens come from the Figma handoff** (SDD A30, Phase 4C): `docs/design-reference/figma-handoff/02-Design-Tokens/`, recorded in `docs/DESIGN_BASELINE.md`. They supersede the profile-sampled palette and gradients. Do not invent a palette, and do not take tokens from any earlier website. No raw hex outside `app/globals.css`.
- "Locale lives in the route" applies to the public website only. The dashboard locale is a separate preference and must not read or write the public locale.
- **Design vs data:** CMS and API models are independent of the current public UI. Dashboard and public presentation may change without altering backend content shape beyond documented API fields.

## A. Engineering rules

### 1) Architecture

**Feature-based + component-based UI.** Group product code by business responsibility (for example `home`, `about`, `services`, `projects`, `careers`, `contact`, `media`, `dashboard`). Each feature owns its components, schemas, types, and **services** (mapping and orchestration). Shared presentation primitives live in `core/ui` (and layout chrome in feature or `core/` as needed). Do not import one feature's internals from another; share through `core/`.

**Clean Architecture (pragmatic):** apply separation where it helps — thin routes, services that map API JSON to UI models, HTTP only in `lib/api`. Do not force Domain/Application/Infrastructure folders on the frontend or mirror the backend module tree literally.

* Data flow for new product code: `app/` (routes, layouts, page composition) → `features/*/services` (logic, mapping) → `lib/api` (HTTP only). Never skip a layer.
* Pages are thin: compose components and call services.
* Components render and handle interaction only. No fetch, no business rules, no API-shape knowledge.
* Map API JSON to UI models in services. Components never consume raw API responses.
* No new abstraction, pattern, or folder convention without a stated reason.
* Do not implement authorization. Ask the API and render the result. The backend is the authority.
* **State management:** prefer server data, URL state, and local component state. Add a client store only when distant client components truly need shared mutable state; justify the dependency. Do not add a global store for data the server can render.

### 2) Shared code

* Used in 2+ places → `core/`. Check `core/` first; never duplicate.
* Feature code never imports another feature's internals. Share via `core/`.
* No barrel files (`index.ts` re-exports) in large folders.

### 3) Change discipline

* Smallest change that solves the problem. Fix root causes, not symptoms.
* No unrelated refactors, renames, or reformatting. Don't touch files outside the task.
* Never break existing URLs, SEO metadata, redirects, or API contracts unless instructed.
* Read the code and the root `CLAUDE.md` first. State assumptions when requirements are unclear.
* Preserve unrelated working-tree changes.
* Do not redesign, remove, or alter existing website content or behavior without approval. The scaffold page is not the corporate site. Do not treat it as content to preserve, and do not replace it with an invented design.

### 4) Error handling

* Handle loading, empty, error, and not-found states explicitly (`loading.tsx`, `error.tsx`, `not-found.tsx`, `global-error.tsx`).
* Catch at the boundary (`lib/api`) and map to typed errors (`ApiError` with status, code, message). No silent `catch {}`.
* User-facing messages are localized. Never expose stack traces or raw server messages.
* Never swallow errors in Server Actions or route handlers. Return typed results.

### 5) Dependencies

* Justify every package (bundle size, maintenance, alternatives). Prefer platform and Next built-ins.
* `next-intl`, Zod, Vitest, React Testing Library, and Playwright are the approved tools when i18n and tests are actually added. Do not add them as a drive-by, and do not substitute other i18n, validation, or test libraries.
* Latest stable, actively maintained, production-grade only. Pin via the lockfile and commit it when dependency changes are requested.
* No duplicate-purpose libraries (one date lib, one animation lib, one icon set).

### 6) Security

* No secrets in code or in `NEXT_PUBLIC_*`. Server-only values stay server-side (`import "server-only"`).
* Phase 0 env: **`core/env/public.ts`** and **`core/env/server.ts`** (server-only). Manual validation on **`API_BASE_URL`** hostname for local integration. When the env surface grows, add Zod startup validation (e.g. consolidated **`core/env.ts`**) and fail fast per **`SYSTEM_DESIGN.md` v1.5** §4.6.
* Validate external input (forms, query params, API responses) with Zod.
* No `dangerouslySetInnerHTML` with unsanitized content. No `eval` / `new Function`.
* Security headers are set in `next.config.ts` (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`). `script-src` and `style-src` include `'unsafe-inline'` because Next injects the theme pre-paint script and style attributes. Do not add `'unsafe-eval'`; the production policy does not include it.
* Protect `/api/revalidate` and any webhook with a secret and constant-time comparison. The route does not exist yet.
* External links to untrusted URLs use `rel="noopener noreferrer"`.
* Never log PII, tokens, or form contents.

### 7) Code quality

* ESLint (`next/core-web-vitals` + typescript-eslint) must pass with zero warnings. Prettier is not part of the current toolchain.
* Functions do one thing. Split components that grow past the point where the file is hard to scan (about 150 lines).
* No dead code, commented-out code, `console.log`, or TODOs without an owner.
* Naming: components PascalCase, hooks `useX`, files kebab-case, constants `UPPER_SNAKE_CASE`, types PascalCase without an `I` prefix.
* Comments explain why, never what.

### 8) Testing

* Pyramid once the runners exist: many unit tests (services, mappers, utils) → component tests → few Playwright E2E tests for critical flows.
* Bug fixes include a reproducing test first.
* Deterministic only: no real network, no real timers, no sleeps. Mock at `lib/api`.
* One behavior per test. Query by role or label. Do not query by CSS class or test id unless unavoidable.
* Every user-facing change covers Arabic and English. Layout-sensitive components cover RTL and LTR.
* Dashboard tests must show that changing the dashboard language does not change the public website language, and the reverse.
* Visual changes need screenshot comparison against the approved baseline for the affected pages (profile identity in `docs/DESIGN_BASELINE.md`, section order in `docs/PROFILE_INVENTORY.md`), in both languages, at 390, 768, and 1440. Playwright owns this once it is installed. A green `npm run build` is not visual proof. If the baseline is missing, say that visual accuracy was not verified.

### 9) Workflow

* Before implementing, read the nearest existing feature and copy its patterns. Until a feature exists, follow this file and the root file rather than inventing a third pattern.
* Definition of done, as far as the toolchain allows:
    1. `npm run typecheck`
    2. `npm run lint`
    3. Tests that exist for the change (`npm run test` for Phase 0 unit helpers; Vitest/Playwright when those runners are installed). Do not report Vitest or Playwright as passed while they are not installed. If a critical flow changed and the runner is missing, say so.
    4. `npm run build` succeeds with no new warnings.
    5. Manually verified at 390 / 768 / 1440 in both `ar` and `en` when the UI has those locales. Until **`/ar`** and locale routing exist, do not claim bilingual visual QA.
* Report what changed, what was tested, and what was not verified.
* Do not commit, branch, or open PRs unless asked. Conventional Commits when asked.

## B. Next.js and TypeScript

### 1) Server vs client

* Default to Server Components. Add `"use client"` only for state, effects, event handlers, or browser APIs, on the smallest leaf possible.
* Never import server-only code into client components. Pass serializable props only.
* Fetch in Server Components, in parallel (`Promise.all`). Use Suspense to stream slow sections.
* No data fetching in `useEffect` unless it is genuinely user-driven client-side.
* Follow the installed version's conventions for async `params`, `searchParams`, and `cookies()`. Read `node_modules/next/dist/docs/` before writing that code.

### 2) Caching and revalidation

* Be explicit about caching on every fetch. Never rely on a default. Recheck the rule against Next 16 `cacheComponents` before copying an older `revalidate` snippet.
* Content pages use tag-based revalidation. The Laravel backend calls `/api/revalidate` after a real publish change. That route is not built. When it is added, require a secret and constant-time comparison.
* Use `generateStaticParams` for known slugs (services, projects) once those resources exist. Call `notFound()` for unknown ones.
* Never cache personalized or form-submission responses. Never cache dashboard drafts as public pages.

### 3) State

* Priority: server data → URL search params → local `useState` / `useReducer` → Zustand only for state shared across distant client components.
* Filters, pagination, and an open gallery image live in the URL so they are shareable and back-button safe.
* No global state for data the server can render.
* The public locale is the `[locale]` segment. The dashboard locale is its own preference (a dashboard cookie or the signed-in user setting). It must not reuse the public locale cookie or segment.

### 4) TypeScript

* Required standard: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`. Only `strict` is enabled today. Enable the other two in a dedicated change, not beside an unrelated edit.
* No `any`, no non-null `!`, no `@ts-ignore`. `@ts-expect-error` needs a reason.
* `unknown` plus Zod narrowing at boundaries. Infer types from schemas.
* Discriminated unions and an exhaustive switch (with a `never` check) for variants.
* Prefer `type` for unions and props. `interface` only for extendable contracts. Props are `readonly` where reasonable.

### 5) Folder structure for new product code

Organizational guidance (adapt to the task; do not scaffold empty trees):

* **`app/[locale]/…`** for public pages; `(admin)/dashboard/…` outside the public locale segment when the dashboard ships
* `features/{name}/components | services | schemas | types` — business modules aligned with reference areas
* `core/ui | hooks | utils | constants | env` — shared primitives and cross-feature utilities (equivalent to grouped `components/ui`, `hooks/`, shared helpers)
* `lib/api` — one HTTP client (base URL, `Accept-Language`, timeouts, typed errors, no retries on non-idempotent calls)
* `messages/{ar,en}.json` — all UI copy, namespaced per feature

Optional groupings from SDD (`components/layout/`, `components/shared/`, `styles/`) may appear when volume warrants; prefer `core/` and feature folders until then. The app may use `app/` at the project root (no `src/` wrapper) per Next.js scaffold.

### 6) i18n and RTL

Applies to the public website and the admin dashboard. Both languages are complete.

* No hardcoded user-facing strings, including validation, empty states, errors, navigation, table headers, dialogs, and notifications. All of that goes through next-intl. Keys are namespaced per feature.
* Public locale lives in the route. Set `lang` and `dir` from that locale.
* Dashboard locale is independent. Set `lang` and `dir` on the dashboard shell from the dashboard locale only. Switching it must not change the public site, and switching the public site must not change the dashboard.
* Logical Tailwind only: `ms-` / `me-` / `ps-` / `pe-` / `start-` / `end-` / `text-start` / `text-end`. Never `ml-` / `mr-` / `pl-` / `pr-` / `left-` / `right-` for layout.
* Flip directional icons and chevrons in RTL. Never flip logos, numbers, phone numbers, or media.
* Format numbers, dates, and phone numbers with `Intl` using the active locale.
* Arabic text needs generous line-height. Test with long Arabic strings for overflow.
* Editors work on one content record with Arabic and English fields together. The form must not create a second business record for the other language.

### 7) Design

* The Corporate Profile 2029 is the source for public content; the Figma design is the source for visuals (root `CLAUDE.md` § Reference, SDD A30). Phase 4C follows `docs/briefs/PHASE4C_FIGMA.md` and `PHASE4C_DECISIONS.md`. Design copy is seeded through the API, never hard-coded; UI labels live in `messages/`. Other old-site interactions (hero carousel, logo marquee, WhatsApp button, social links) wait for a decision (SDD U26).
* **Design independence:** stored content and API field shapes must not assume a specific page layout. Use tokens and reusable components so a future redesign can swap presentation without CMS re-entry.
* **Design tokens:** semantic colors (`bg-base`, `text-primary`, `text-accent`, `border-line`, …), type scale (`text-display-xl` … `text-overline`), spacing, radii, motion, and shadows live in the Tailwind theme (`@theme`, the default palette is removed). No raw hex and no magic pixel values inside components. **Light is the default theme** (SDD A35); dark remains available through the toggle, and both themes map the same semantic names onto their primitives so components use tokens instead of `dark:` variants. Photographic heroes and CTA boxes stay dark in both themes (`scheme-dark`).
* **Typography:** public — **Somar** for all Arabic text via `next/font/local` (WOFF2, only the weights in `docs/DESIGN_BASELINE.md`; it stands in for DIN Next LT Arabic behind `--font-ar`), **Rubik** for English text, **Montserrat** for Latin overlines and decorative numbers, both via `next/font/google` (SDD A24, A30). Admin dashboard — **IBM Plex Sans Arabic** (ar), **Inter** (en), unchanged. All via `next/font` with `display: swap`. Geist is scaffold only.
* Mobile-first. Check 390, 768, and 1440. No horizontal page scroll at any width.
* Reuse `core/ui` primitives (`Button`, `Card`, `Input`, `Dialog`) once they exist. Don't restyle ad hoc.
* Use `cva` / `clsx` + `tailwind-merge` for variants when those utilities are added. No inline style except dynamic values.
* Respect `prefers-reduced-motion`. Do not drop a reference animation unless the reference itself respects reduced motion and the task is to match it.

### 8) Performance

* Targets (mobile, 75th percentile): LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.
* `next/image` for raster images with accurate `sizes`. `priority` only for the LCP image. Always set dimensions or `fill` with a sized parent.
* Galleries use backend thumbnails and lazy loading once the backend contract defines those thumbnails. Full-size images load only in the lightbox. No thumbnail contract exists today.
* Fonts via `next/font` with `display: swap` and subsets for Arabic when Arabic ships. No render-blocking third-party fonts. Use approved brand fonts (§7 Design), not Geist, on shipped pages.
* Dynamic-import heavy client pieces (lightbox, maps, animation libs). Watch bundle size on every new dependency.
* Animate transform and opacity only.
* No third-party scripts without justification. Load them with `next/script` (`lazyOnload` / `afterInteractive`).

### 9) SEO

* Every public page exports `generateMetadata`: unique title, description, canonical, `alternates.languages` (hreflang), Open Graph, and Twitter images.
* One `h1` per page, logical heading order, semantic landmarks, meaningful alt text. Empty alt for decorative images.
* Maintain `sitemap.ts` (all locales and dynamic slugs) and `robots.ts` once real routes exist.
* JSON-LD (`Organization` / `LocalBusiness`, `BreadcrumbList`) rendered server-side from typed helpers, using reference content only. Do not invent business facts.

### 10) Accessibility (WCAG 2.2 AA)

* Native elements first (`button`, `a`, form controls). ARIA only when native is not enough.
* Touch targets ≥ 44px. Visible `:focus-visible` states. Color contrast ≥ 4.5:1 for every token pair in both themes (table in `docs/DESIGN_BASELINE.md` §2.2); the primary button hover is green/700, a recorded deviation from Figma for AA.
* Dialogs and lightboxes: focus trap, return focus on close, Esc closes, arrow keys navigate where a set of items exists, `aria-modal`, labelled.
* Forms: associated labels, error text linked with `aria-describedby`, errors announced (`aria-live`).
* Never convey meaning by color alone.
* RTL and LTR both remain operable by keyboard. Directional keyboard hints must follow `dir`.

### 11) Forms and Server Actions

* One Zod schema per form, shared by client and server validation.
* States: idle, submitting (disabled + spinner), success, field errors, server error. All localized in the active locale.
* Prevent double submit. Spam protection for public forms is a honeypot here plus rate limiting on the API.
* Server Actions validate input, authorize through the API, and return typed results. Never throw raw errors to the client.

### 12) Dashboard UI

The dashboard is not built. When it is built, use **modular CMS architecture**:

* One module per CMS responsibility (pages, services, projects, media, careers, contact messages, settings, disputes/inbox where applicable). Modules share admin shell, tables, and form primitives through `core/ui` — not through importing public-site feature components.
* Arabic and English are complete, including navigation, forms, tables, dialogs, notifications, and validation.
* `dir` follows the dashboard locale on every component, not only the shell.
* Content editing writes both locales on one record. The field shape is the backend contract.
* CMS screens cover content in `docs/PROFILE_INVENTORY.md` and `SYSTEM_DESIGN.md` §1.2, plus careers and contact messages. Do not add ERP, project-management, customer-portal, or performance/KPI screens (SDD A16).
* Hide actions the current user cannot perform, and still expect the API to reject them.
* Destructive actions use a confirmation dialog that names the record. Do not delete from a single unlabeled click.
* Every view has loading, empty, success, and error states, in both languages.

### 13) Observability

* A central error report (for example Sentry) in `error.tsx` / `global-error.tsx`, with PII scrubbed, when error reporting is added. Do not add a vendor as a drive-by.
* No `console.log` in committed code.
* Track Web Vitals when a real measurement path exists. Do not claim a budget passed without a measurement.

### 14) Anti-patterns

* `useEffect` to derive state or fetch initial data
* Prop drilling more than 2 levels
* Index as key for dynamic lists
* Creating components inside components
* Fetching in client components what the server can render
* Fixed pixel widths that break at 390px
* `any`, `!`, or `eslint-disable` without a written reason
* Direction-specific Tailwind classes (`ml-4`) in layout code
* Tying dashboard language to the public `[locale]` segment
* Treating a production build as proof that the screen matches the approved baseline
* Inventing or rewriting reference copy because a translation is missing
