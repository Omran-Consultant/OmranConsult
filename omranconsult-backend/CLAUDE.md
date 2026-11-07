# omranconsult backend (Laravel)

Scope: `omranconsult-backend/` only.

Obey the workspace `CLAUDE.md` for product boundaries, architecture, separation of concerns, secrets, and Git. This file owns Laravel modules, layers, MySQL, the JSON API, auth, content storage, uploads, and PHP tests. Presentation, RTL, and dashboard layout belong in `omranconsult-frontend/CLAUDE.md`. Schema, endpoint catalogs, and CMS state details are in `SYSTEM_DESIGN.md` v1.6.

<!-- Golden test: "Would removing this rule cause an agent to make mistakes?" If not, cut it. -->

The previous `CLAUDE.md` was the Laravel Boost installer stub. It told agents to install PHP 8.5 and `laravel/boost` before any work. That stub is retired. This app requires PHP ^8.3 and Laravel ^13.17. Boost is not installed. Do not install it, and do not curl a new PHP, unless asked. If Boost is installed later, merge its generated notes without deleting these rules.

Read the installed Laravel 13 docs before adding framework code. This skeleton configures the app in `bootstrap/app.php`. Do not recreate `app/Http/Kernel.php` or other pre-Laravel-11 structure.

## What exists today

**Phase 0 foundation (implemented).** Do not describe the items below as missing.

* **Routing:** `routes/api.php` registered in `bootstrap/app.php` with `statefulApi()`. JSON errors render for `api/*` and JSON-expecting clients. Framework health **`GET /up`** unchanged. **`routes/web.php`** still serves the stock welcome view (scaffold only).
* **Phase 0 API routes** (see `SYSTEM_DESIGN.md` v1.6 §7, §10.5):
  * `GET /api/health` → `{ "status": "ok" }`
  * `POST /api/admin/login` (rate-limited)
  * `POST /api/admin/logout` (session)
  * `GET /api/admin/me` and `GET /api/admin/ping` (`auth:sanctum` + **`super_admin`** role)
  * Sanctum **`GET /sanctum/csrf-cookie`** (web middleware; not in `routes/api.php`)
* **Auth (A7–A10):** Laravel **Sanctum SPA** session on the **`web`** guard. **No** `HasApiTokens`, **no** personal access token migration, **no** `Gate::before` bypass. **`POST /api/admin/users` is deferred** beyond Phase 0.
* **Permissions (Phase 0):** **`spatie/laravel-permission`** installed. Seed **`super_admin`** role only (`SuperAdminRoleSeeder`, `guard_name` **`web`**). Admin routes use **`auth:sanctum`** + **`role:super_admin`** (**401** guest, **403** authenticated non-admin). **Do not** seed speculative CMS permission names.
* **Super Admin bootstrap:** Artisan command **`omranconsult:install-super-admin`** reads **`ADMIN_EMAIL`** / **`ADMIN_PASSWORD`** from environment (never commit). Creates one user only when the **`users`** table is empty; fail-closed if any user exists; assigns **`super_admin`** via Spatie.
* **Models / controllers:** `app/Models/User.php` uses `HasRoles` (not Sanctum tokens), `#[Fillable]`, `#[Hidden]`, hashed password cast. Admin auth lives under `app/Http/Controllers/Api/Admin/` with Form Requests and `AdminUserResource`.
* **Config (published):** `config/sanctum.php`, `config/cors.php`, `config/permission.php`. CORS allows configured **`FRONTEND_URL`** with **`supports_credentials`**. **`SANCTUM_STATEFUL_DOMAINS`** defaults include **`localhost:3000`**.
* **Database:** Migrations ran on local dev MySQL **`omranconsult`** (users, password reset tokens, **sessions**, cache, jobs, Spatie permission tables). **`.env.example`** documents MySQL 8 (MAMP **`127.0.0.1:8889`**, **`utf8mb4_unicode_ci`**) and **`SESSION_DRIVER=database`**, **`SESSION_LIFETIME=120`**. **PHPUnit** still uses in-memory SQLite (`phpunit.xml`); do not migrate **`omranconsult_test`** unless a task says so. Never commit **`database/database.sqlite`** or local **`.env`**.
* **Tests:** `php artisan test` — Feature coverage includes API health, Sanctum/CORS configuration, Super Admin bootstrap safety, admin login/logout/me authorization, and **`/api/admin/ping`** gates (not only scaffold examples). Style: **`vendor/bin/pint --test`**.

**Phase 3 content (implemented 2026-11-07, SDD A25–A27).**

* **Content tables** per `SYSTEM_DESIGN.md` §6.7 (supersedes §6.2 for these tables): `site_settings`, `hero_slides`, `statistics`, `content_blocks`, `service_categories`, `services`, `clients`, `regions`, `projects`, `project_region`, `team_members`, `org_positions`, `documents`, `partners`, `content_disputes`. Bilingual JSON columns follow "Bilingual storage" below.
* **Modules:** `app/Modules/{Content,Services,Projects,Team,Documents,Partners}`; shared `app/Support/Content` (`PublicationStatus`, `Publishable` trait with `published()` scope and soft deletes, `PublicLocale`) and `app/Http/Middleware/SetPublicLocale.php`.
* **Public read API** (`SYSTEM_DESIGN.md` §7.1): `GET /api/settings`, `/home`, `/services`, `/projects`, `/projects/{slug}`, `/clients`, `/regions`, `/experts`, `/org-chart`, `/documents`, `/partners`.
* **Seeders:** `database/seeders/Profile/` imports the whole profile as **published** demo data with Claude's unreviewed English (A25); profile errors are stored as printed and recorded in `content_disputes`, which do not hide content (A26). `DatabaseSeeder` runs them; they skip if content exists.
* **Tests:** `tests/Feature/Content/`, `tests/Unit/Content/`.

**Not built (planned / proposed — do not implement without approval).**

* Admin content endpoints, CMS drafts and publish/dispute workflow, publish gate, audit log, uploads and media (images and logos are not stored yet).
* Granular Spatie **permissions** (added with each CMS module per §10.4).
* **`POST /api/admin/users`** and user-management module (§7.6 module 11).
* Production deployment, backups jobs, MySQL CI integration job (proposed P7).

## Architecture

Combine **Clean Architecture** with **feature-based modules**. Business areas align with the product (for example **Projects**, **Services**, **Careers**, **Media**, **Contact**, **Content**, **Users**). Each module owns its rules and persistence for that area.

### Layer responsibilities

| Layer | Responsibility | Examples |
| --- | --- | --- |
| **Domain** | Business rules, invariants, core entities/value objects independent of Laravel and HTTP | Publish eligibility, slug rules, locale field shape as domain concepts |
| **Application** | Use cases, orchestration, transaction boundaries | Publish page, submit contact message, attach media to project |
| **Infrastructure** | Eloquent models, migrations, queries, filesystem, mail, external APIs | Models, repositories only if a use case truly needs them |
| **Presentation** | HTTP entry points, validation wiring, JSON shape | `routes/api.php`, Form Requests, controllers, API Resources |

Keep business rules out of controllers and out of Blade. The backend does not render the public site or the dashboard. Leave the stock welcome view alone unless a task is about removing the scaffold.

### Module layout (guidance, not a mandatory scaffold)

When a feature needs new backend code, prefer:

```
app/Modules/{Feature}/
  Domain/
  Application/
  Infrastructure/
  Presentation/
```

Register routes and bind implementations pragmatically. **Do not** create empty modules, layers, repository interfaces, or DTO trees by default. A thin controller + Form Request + model is fine until a use case outgrows it.

Shared cross-module concerns (audit logging, locale resolution helpers, media guards) live in small shared classes or a `Shared` module — not duplicated inside every controller.

Legacy skeleton paths (`app/Models`, `app/Http/Controllers`) may remain until a migration task moves a feature into `app/Modules/`. New product features should start in modules when the first use case lands. `SYSTEM_DESIGN.md` §5.1 describes public/admin API surfaces and route groups; implement controllers and Form Requests in each module's **Presentation** layer (or under `app/Http/Controllers/Api/...` until a module exists).

No business rule lives in the frontend. If a rule decides who may publish, what is visible, or how a record is stored, it belongs here (Domain or Application), enforced again in Presentation via policies and validation.

## MySQL

Application data uses **MySQL 8**, InnoDB, **`utf8mb4` / `utf8mb4_unicode_ci`**, on the local dev database per **`SYSTEM_DESIGN.md` v1.6** (A11–A13). **`.env.example`** documents the approved local target; operators configure a local **`.env`** (not committed). Do not change **`.env`**, **`phpunit.xml`**, or migrations as a drive-by unless the task is explicitly about database configuration.

* Schema changes go through migrations only. Migrations must have a working `down` unless the table is irreversible, in which case say why.
* Foreign keys express real relationships. Do not store a second copy of a parent row to represent a language.
* Index columns used for lookup, uniqueness, and public filters.
* Timestamps use Laravel's `timestamps()`. **Soft delete** applies to CMS entities per `SYSTEM_DESIGN.md` §6.5 (slug reservation, category guards, media guards, parent/child project images). Implement those rules in Application/Domain, not only in controllers. Users are not soft-deleted at launch — deactivate with `is_active=false`.
* PHPUnit may keep in-memory SQLite until a task is specifically about the test database. Write queries that both engines accept. Do not use MySQL-only SQL without a stated reason and a test plan.
* Never commit `database/database.sqlite`.

## API contract

**Phase 0 endpoints are implemented** (listed under “What exists today”). Each **new** product endpoint still needs the same change discipline: method, path, auth, request, response, and errors recorded beside the code. Do not invent a version prefix. Paths stay under **`/api`** until versioning is decided.

* JSON only. Use API Resources so response fields are explicit.
* Public reads accept `Accept-Language: ar` or `Accept-Language: en`. Missing or unknown language means **`en`** (English default per SDD §1.5).
* A public response resolves translatable strings to that one locale and includes `locale`. It returns published records only.
* A dashboard response returns both locales on the same object so the editor can save one record. It does not return a duplicated row per locale.
* Do not invent missing copy. If a locale string is absent, return `null` for that string. Do not machine-translate and do not copy the other language into it.
* Writes accept both locales in one body, using the storage shape below.
* Errors use Laravel's JSON shape: `{ "message": string, "errors": { "field": [string, ...] } }` with 401, 403, 404, 422, or 429 as appropriate. `message` and field errors are stable codes or short server messages intended for mapping. The frontend localizes them. Never return exception text, SQL, or stack traces.
* List endpoints that can grow use pagination. Record the query parameters in the endpoint contract. Do not choose cursor versus page pagination in the abstract; use length-aware pagination unless an endpoint's contract says otherwise.
* Idempotent reads may be retried by clients. Do not imply retries for creates.

## Bilingual storage

One business row per website entity. Locale is not a second entity.

* Translatable text is a JSON object on that row, keyed by locale: `{ "ar": "...", "en": "..." }`.
* Non-text facts stay single columns: ids, status, dates, sort order, relations, and file references.
* A slug is one column when the reference site uses one slug. It is a locale map on the same row when the reference site uses two. Look at the reference before choosing. Do not guess.
* Relations point at the business row, not at a language copy. An image shared by both languages is one file relation.
* Unique indexes account for the real public identity. Do not enforce uniqueness on a single language while ignoring the other if both are public.

This JSON shape is the rule for content tables (implemented in Phase 3).

## Auth and permissions

**Phase 0 admin auth is implemented** (Sanctum SPA + **`super_admin`** role only). See “What exists today” and **`SYSTEM_DESIGN.md` v1.6** §10.1, §10.4, §10.5.

* Admin **`/api/admin/*`** routes (except **`POST /api/admin/login`**) require an authenticated session and the **`super_admin`** role. **401** when unauthenticated; **403** when authenticated without the role.
* Login uses the **`web`** guard, regenerates the session on success, and applies **`throttle:admin-login`** (**5** attempts / minute / IP + normalized email) — limiter registered in **`AppServiceProvider`**, declared on the route in **`routes/api.php`**.
* Failed login and valid credentials without **`super_admin`** return the same generic validation shape on **`email`** (no account/role leakage). Passwords stay hashed via the User cast; never log or return passwords.
* **Do not** add **`Gate::before`**, personal access tokens, or **`POST /api/admin/users`** in unrelated work.

**When CMS admin modules are added (later phases):**

* Every mutating route and unpublished read requires authentication plus an explicit **permission** check (policy or permission middleware), not ad-hoc role string checks.
* Introduce granular **`permissions`** in the same change as each CMS module; assign them to **`super_admin`**; **do not** pre-seed speculative permission names in Phase 0 style.
* Public visitors read published content only. There are no customer accounts or customer portal.
* UI confirmation is not authorization. The API rejects unauthorized actions even if the client skips the dialog.

## Validation, errors, and abuse

* Form Requests validate every write. Controllers do not reimplement rules inline.
* Return 422 with the error shape above. Do not redirect API clients to an HTML error page.
* Rate-limit **`POST /api/admin/login`** (configured). Rate-limit other public write routes when those routes are added. Write the numeric limit next to the route definition.
* Authorization failures are 403. Missing authentication is 401. Unknown records are 404. Do not use 404 to hide a record the user is allowed to know about, and do not use 403 to reveal a draft to the public; unpublished public reads are 404.

## CMS workflow

Not built. Build it only for content in `docs/PROFILE_INVENTORY.md` and `SYSTEM_DESIGN.md` §1.2, plus careers and the Phase 4C types (SDD A29): sectors, inquiries (replace contact messages), newsletter subscribers, news, and design copy. Expected areas include pages, services (and categories), projects (and images), client logos, careers, contact messages, site settings, homepage sections, documents/licenses, leadership/board, and related media. Do not add content types that are not in scope.

When those models are added, follow **`SYSTEM_DESIGN.md` §6–§9** for publish gates, disputes, soft delete/restore, slug reservation, and audit. Summary rules:

* A record is `draft` or `published`. Public queries include `published` only.
* Publish and unpublish are explicit actions, not a side effect of saving a draft.
* Soft delete and restore are explicit authorized actions; slugs stay reserved while soft-deleted unless SDD force-delete rules apply.
* Delete is distinct from unpublish.
* Saving a dashboard edit writes both locales onto the same row.
* An audit record is written for create, update, publish, unpublish, delete/restore/force-delete, and dispute resolution actions per SDD. Store actor id, action, subject type, subject id, timestamp, and a before/after summary of changed fields. Do not store passwords, tokens, or raw request dumps.
* The audit table does not exist. Add it with the first content write, not before.

## Files

`FILESYSTEM_DISK` is `local`. Production storage is not chosen. Do not switch disks or add S3 as a drive-by. The downloadable company profile is a manual copy in the git-ignored `storage/app/public/files/` (served through `php artisan storage:link`) until the Phase 5 media library.

When uploads are added:

* Accept only the image types the reference site uses. Deny SVG until a sanitizer is an explicit task.
* Limit size in the Form Request and record the number there.
* Generate the stored name. Do not trust the client filename or put user files in the Git tree.
* Store files on the filesystem disk, not as database blobs.
* Return a URL produced by the storage API. Do not hardcode `/storage/...` in responses if the disk can change.
* No thumbnail generator exists. Add sizes only when the frontend gallery contract needs them, and document those sizes beside the endpoint.

## Logging and operations

* Use the configured Laravel log stack. Log the action, subject id, and failure code. Do not log passwords, tokens, cookies, or form bodies.
* `APP_DEBUG` stays off outside local development.
* Backups are required before production content lives in MySQL. No backup command or host is configured. Do not invent one.
* Deployment is undecided. Do not add Forge, Vapor, or Docker config unless asked.

## Tests

Runner: `php artisan test`. Style check when PHP changes: `vendor/bin/pint --test`.

* Unit tests for mapping, locale resolution, and publish rules.
* Feature tests for HTTP behavior.
* API integration tests hit the route, the database, and the resource together.
* Authorization tests prove a guest receives 401, a user without the permission receives 403, and a permitted user succeeds. Deleting or publishing without permission must fail.
* A bug fix starts with a failing test when the behavior is deterministic.
* Do not treat **Example** tests alone as product coverage. Phase 0 Feature tests cover health, Sanctum config, bootstrap, and admin auth. Do not report PHPUnit or Pint as passed unless they were run.

## Change discipline

* Smallest change. No unrelated refactors. Match existing PHP style and let Pint format it.
* Do not add a package without a reason and approval. The platform already has validation, hashing, queues, and the test runner.
* State assumptions when the reference content or the auth mechanism is unclear. Do not invent either.
* Preserve unrelated working-tree changes, including the local `.env` and sqlite file. Never commit them.
