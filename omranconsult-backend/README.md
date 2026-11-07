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

Health: `GET /up` (Laravel). API connectivity: `GET /api/health` (JSON `{ "status": "ok" }`).

Sanctum (SPA session) and Spatie Permission are installed; admin auth routes land in Phase 0.5.
