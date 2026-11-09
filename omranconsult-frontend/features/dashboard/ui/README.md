# Dashboard UI (PHASE5A U1)

Shared presentation for the CMS dashboard. Use these before adding one-off styles in a page.

## Controls

- `control-md` (44px): toolbars, tabs, filters, icon buttons, topbar search.
- `control-lg` (48px): form fields (`dashboard-field.tsx`).

## Components

| Component | Purpose |
| --- | --- |
| `PageHeader` | Title, subtitle, breadcrumbs, primary actions |
| `KpiCard` | Owner-approved KPI layout with accent stripe |
| `StatusPill` / `RoleBadge` / `Avatar` | Entity metadata |
| `DataTable` | Desktop table + mobile cards, sticky header |
| `FilterBar`, `Tabs`, `Pagination`, `ViewToggle` | List toolbars |
| `Drawer`, `Modal`, `ConfirmDialog`, `Toast` | Overlays and feedback |
| `DonutChart`, `BarChart`, `Sparkline` | Accessible SVG charts |
| `RelativeTime` | No raw ISO in the UI |

## Gallery

Super admins can open `/dashboard/ui-gallery` (noindex) to preview every component in light/dark and ar/en.

## Labels

Localized audit actions, roles, and statuses live in `features/dashboard/labels/`. Pages must not render raw API keys.
