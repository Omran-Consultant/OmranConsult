import { classNames } from "@/core/ui/class-names";
import { controlMdClass } from "@/features/dashboard/ui/control-styles";

export type DashboardTab = { id: string; label: string; count?: number };

export function DashboardTabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: DashboardTab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={classNames("flex flex-wrap gap-2", className)} data-dashboard-tabs role="tablist">
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            aria-selected={selected}
            className={classNames(
              controlMdClass,
              "px-4",
              selected ? "border-accent bg-tint text-accent" : "text-secondary hover:bg-highlight",
            )}
            key={tab.id}
            onClick={() => onChange(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
            {typeof tab.count === "number" ? (
              <span className="rounded-full bg-highlight px-2 py-0.5 text-caption">{tab.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
