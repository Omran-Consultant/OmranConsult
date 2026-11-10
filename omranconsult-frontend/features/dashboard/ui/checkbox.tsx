import { classNames } from "@/core/ui/class-names";
import { controlLgClass } from "@/features/dashboard/ui/control-styles";

export function DashboardCheckbox({
  id,
  label,
  checked,
  onChange,
  description,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  description?: string;
}) {
  return (
    <label
      className={classNames(controlLgClass, "flex cursor-pointer items-center justify-between gap-3 px-4")}
      htmlFor={id}
    >
      <span>
        <span className="block text-label-s">{label}</span>
        {description ? <span className="text-caption text-muted">{description}</span> : null}
      </span>
      <input
        checked={checked}
        className="size-5 shrink-0 appearance-none rounded border border-line bg-elevated checked:border-accent checked:bg-accent checked:bg-[length:100%_100%] checked:bg-center checked:bg-no-repeat focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/20 dark:border-line dark:bg-transparent"
        id={id}
        onChange={(event) => onChange(event.target.checked)}
        style={checked ? { backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M3.5 8.5 6.5 11.5 12.5 4.5' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")" } : undefined}
        type="checkbox"
      />
    </label>
  );
}
