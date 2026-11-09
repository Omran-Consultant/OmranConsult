# omranconsult backend (Laravel)

JSON API and CMS backend for omranconsult. Product rules: workspace [`CLAUDE.md`](../CLAUDE.md) and [`SYSTEM_DESIGN.md`](../SYSTEM_DESIGN.md) v1.5.

## Local MySQL (MAMP)

Approved local defaults (SDD A11–A13):

| Setting | Value |
|---------|--------|
| Host | `127.0.0.1` |
| Port | `8889` (MAMP — not a production default) |
| Development database | `omranconsult` |
| Test database (PHPUnit MySQL suite, Phase 0.6+) | `omranconsult_test` |
| Charset / collation | `utf8mb4` / `utf8mb4_unicode_ci` |

1. Copy `.env.example` to `.env` and set **`DB_USERNAME`** / **`DB_PASSWORD`** for your MAMP MySQL user (never commit `.env`).
2. Create databases if needed (same charset/collation as above).
3. Run **`php artisan migrate`** against the **development** database only.

### Database safety

- **Never** run `migrate:fresh`, `migrate:refresh`, or `db:wipe` on the development database `omranconsult`.
- **Never** run destructive migrations against `omranconsult_test` except from the isolated PHPUnit MySQL configuration (Phase 0.6+).
- PHPUnit’s default `phpunit.xml` uses in-memory SQLite; it does not use `omranconsult` unless you change that file.

## Sessions

- **`SESSION_DRIVER=database`** with **`SESSION_LIFETIME=120`** (minutes).
- The `sessions` table is created by the default Laravel users migration.

## Commands

```bash
composer install
php artisan migrate
php artisan test
vendor/bin/pint --test
```

### Local development (API + queue)

Day-to-day work runs **both** the HTTP server and the queue worker together:

```bash
composer run dev
```

**MAMP MySQL 8 must be running** before `composer run dev`, `php artisan migrate`, or `php artisan test` against MySQL. Default port **8889** — see the table above.

Normal development keeps `QUEUE_CONNECTION=database` so published changes are revalidated by the worker in that `dev` process.

### Playwright E2E

The frontend test harness sets `OMRAN_E2E=1` and `QUEUE_CONNECTION=sync` (it does not edit your `.env`). Start the API for E2E with:

```bash
composer run dev
```

`globalSetup` creates/migrates/seeds the isolated database `omranconsult_e2e` (`php artisan e2e:prepare-database`), arms the running API (`php artisan e2e:arm-harness`), then calls `GET /api/e2e/preflight` before browser tests. The API `.env` keeps `DB_DATABASE=omranconsult`; only the harness switches the HTTP app to `E2E_DATABASE` (default `omranconsult_e2e`). Create that database in MAMP MySQL with the same user as dev if it does not exist yet (the prepare command creates it when permissions allow).

After polluting the dev dashboard, run `php artisan e2e:purge-dev` (local only).

Health: `GET /up` (Laravel). API connectivity: `GET /api/health` (JSON `{ "status": "ok" }`).

Sanctum (SPA session) and Spatie Permission are installed; admin auth routes land in Phase 0.5.

## Production checklist

- Serve the frontend and API over HTTPS only. Keep `SESSION_SECURE_COOKIE=true`.
- Restrict the deployed `.env` to the application user (for example mode `600`). Give the web/application user only the write access Laravel needs under `storage/` and `bootstrap/cache/`; do not make either world-writable.
- Set the real production frontend/API domains in `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN`, `APP_URL`, `API_BASE_URL`, and `NEXT_PUBLIC_SITE_URL`. Set the same `FRONTEND_SERVER_KEY` on the API `.env` and the Next.js `.env.local` (or a host env in production), and/or add stable frontend-server egress IPs to `PUBLIC_READ_TRUSTED_IPS`.
- After environment configuration and each release, run `php artisan config:cache`, `php artisan route:cache`, and `php artisan optimize`.
- Create the first Super Admin only with `omranconsult:install-super-admin` and an operator-supplied password. The command rejects empty, shorter-than-12, and weak passwords; never ship or reuse a default password.
- Configure and regularly test restorable MySQL backups before storing production content. The backup provider and off-site copy remain deployment decisions.
