import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import { controlMdClass } from "@/features/dashboard/ui/control-styles";

export function ViewToggle({
  value,
  onChange,
  tableLabel,
  gridLabel,
}: {
  value: "table" | "grid";
  onChange: (mode: "table" | "grid") => void;
  tableLabel: string;
  gridLabel: string;
}) {
  return (
    <div className="inline-flex rounded-[var(--control-radius)] border border-line p-0.5" data-dashboard-view-toggle>
      <button
        aria-pressed={value === "table"}
        className={classNames(controlMdClass, "border-0", value === "table" ? "bg-tint text-accent" : "bg-transparent")}
        onClick={() => onChange("table")}
        type="button"
      >
        <Icon name="list" />
        <span className="sr-only">{tableLabel}</span>
      </button>
      <button
        aria-pressed={value === "grid"}
        className={classNames(controlMdClass, "border-0", value === "grid" ? "bg-tint text-accent" : "bg-transparent")}
        onClick={() => onChange("grid")}
        type="button"
      >
        <Icon name="grid" />
        <span className="sr-only">{gridLabel}</span>
      </button>
    </div>
  );
}
