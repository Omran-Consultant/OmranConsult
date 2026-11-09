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
        className="size-5 accent-accent"
        id={id}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
    </label>
  );
}
