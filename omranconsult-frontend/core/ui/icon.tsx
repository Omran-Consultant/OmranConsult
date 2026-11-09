import type { IconProps, IconWeight } from "@phosphor-icons/react";
import { ArrowUpLeft } from "@phosphor-icons/react/dist/ssr/ArrowUpLeft";
import { Bell } from "@phosphor-icons/react/dist/ssr/Bell";
import { Blueprint } from "@phosphor-icons/react/dist/ssr/Blueprint";
import { Buildings } from "@phosphor-icons/react/dist/ssr/Buildings";
import { Car } from "@phosphor-icons/react/dist/ssr/Car";
import { CaretDown } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr/CaretLeft";
import { CaretRight } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { ChartBar } from "@phosphor-icons/react/dist/ssr/ChartBar";
import { Check } from "@phosphor-icons/react/dist/ssr/Check";
import { ClipboardText } from "@phosphor-icons/react/dist/ssr/ClipboardText";
import { Clock } from "@phosphor-icons/react/dist/ssr/Clock";
import { CompassTool } from "@phosphor-icons/react/dist/ssr/CompassTool";
import { Copy } from "@phosphor-icons/react/dist/ssr/Copy";
import { Cpu } from "@phosphor-icons/react/dist/ssr/Cpu";
import { Crosshair } from "@phosphor-icons/react/dist/ssr/Crosshair";
import { Desktop } from "@phosphor-icons/react/dist/ssr/Desktop";
import { DotsThree } from "@phosphor-icons/react/dist/ssr/DotsThree";
import { Drone } from "@phosphor-icons/react/dist/ssr/Drone";
import { Envelope } from "@phosphor-icons/react/dist/ssr/Envelope";
import { Eye } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeSlash } from "@phosphor-icons/react/dist/ssr/EyeSlash";
import { File } from "@phosphor-icons/react/dist/ssr/File";
import { Fingerprint } from "@phosphor-icons/react/dist/ssr/Fingerprint";
import { Funnel } from "@phosphor-icons/react/dist/ssr/Funnel";
import { Gear } from "@phosphor-icons/react/dist/ssr/Gear";
import { Globe } from "@phosphor-icons/react/dist/ssr/Globe";
import { Gps } from "@phosphor-icons/react/dist/ssr/Gps";
import { GraduationCap } from "@phosphor-icons/react/dist/ssr/GraduationCap";
import { HardHat } from "@phosphor-icons/react/dist/ssr/HardHat";
import { Image } from "@phosphor-icons/react/dist/ssr/Image";
import { Jeep } from "@phosphor-icons/react/dist/ssr/Jeep";
import { Link } from "@phosphor-icons/react/dist/ssr/Link";
import { Lock } from "@phosphor-icons/react/dist/ssr/Lock";
import { List } from "@phosphor-icons/react/dist/ssr/List";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { MapPin } from "@phosphor-icons/react/dist/ssr/MapPin";
import { Monitor } from "@phosphor-icons/react/dist/ssr/Monitor";
import { Moon } from "@phosphor-icons/react/dist/ssr/Moon";
import { Mountains } from "@phosphor-icons/react/dist/ssr/Mountains";
import { PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr/PaperPlaneTilt";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { Phone } from "@phosphor-icons/react/dist/ssr/Phone";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import { Printer } from "@phosphor-icons/react/dist/ssr/Printer";
import { Quotes } from "@phosphor-icons/react/dist/ssr/Quotes";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { SignOut } from "@phosphor-icons/react/dist/ssr/SignOut";
import { SquaresFour } from "@phosphor-icons/react/dist/ssr/SquaresFour";
import { Stack } from "@phosphor-icons/react/dist/ssr/Stack";
import { Sun } from "@phosphor-icons/react/dist/ssr/Sun";
import { Target } from "@phosphor-icons/react/dist/ssr/Target";
import { Trash } from "@phosphor-icons/react/dist/ssr/Trash";
import { Tray } from "@phosphor-icons/react/dist/ssr/Tray";
import { TrendUp } from "@phosphor-icons/react/dist/ssr/TrendUp";
import { Upload } from "@phosphor-icons/react/dist/ssr/Upload";
import { Users } from "@phosphor-icons/react/dist/ssr/Users";
import { X } from "@phosphor-icons/react/dist/ssr/X";
import type { ComponentType } from "react";

import { classNames } from "@/core/ui/class-names";

/**
 * One semantic map (A36). Swap the family here only.
 * Duotone belongs inside a tile; inline icons stay regular.
 * `arrow` is drawn toward the Arabic reading direction and mirrored in LTR.
 * Chevrons keep an absolute direction so pagination can place previous/next.
 */
const ICONS = {
  arrow: ArrowUpLeft,
  bell: Bell,
  blueprint: Blueprint,
  building: Buildings,
  buildings: Buildings,
  car: Car,
  chart: ChartBar,
  check: Check,
  clipboard: ClipboardText,
  clock: Clock,
  close: X,
  cog: Gear,
  compass: CompassTool,
  copy: Copy,
  cpu: Cpu,
  desktop: Desktop,
  dots: DotsThree,
  drone: Drone,
  edit: PencilSimple,
  eye: Eye,
  "eye-slash": EyeSlash,
  file: File,
  filter: Funnel,
  fingerprint: Fingerprint,
  globe: Globe,
  gps: Gps,
  graduation: GraduationCap,
  grid: SquaresFour,
  "hard-hat": HardHat,
  image: Image,
  inbox: Tray,
  jeep: Jeep,
  layers: Stack,
  link: Link,
  list: List,
  lock: Lock,
  logout: SignOut,
  mail: Envelope,
  menu: List,
  monitor: Monitor,
  moon: Moon,
  mountain: Mountains,
  phone: Phone,
  plus: Plus,
  printer: Printer,
  quote: Quotes,
  search: MagnifyingGlass,
  "shield-check": ShieldCheck,
  send: PaperPlaneTilt,
  sun: Sun,
  target: Target,
  "total-station": Crosshair,
  trash: Trash,
  "trending-up": TrendUp,
  upload: Upload,
  users: Users,
  "map-pin": MapPin,
  "chevron-down": CaretDown,
  "chevron-left": CaretLeft,
  "chevron-right": CaretRight,
} satisfies Record<string, ComponentType<IconProps>>;

export type IconName = keyof typeof ICONS;

export function isIconName(value: string): value is IconName {
  return Object.hasOwn(ICONS, value);
}

/** Forward arrow only. Drawn for RTL; `flip-ltr` turns it toward the English reading direction. */
const DIRECTIONAL: ReadonlySet<IconName> = new Set(["arrow"]);

type IconViewProps = {
  readonly name: IconName;
  readonly className?: string;
  /** Accessible name; omit for decorative icons (the default). */
  readonly label?: string;
  /** Duotone inside tiles; regular everywhere else. */
  readonly weight?: IconWeight;
};

export function Icon({ name, className, label, weight = "regular" }: IconViewProps) {
  const Glyph = ICONS[name];
  return (
    <Glyph
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={classNames("size-5 shrink-0", DIRECTIONAL.has(name) && "flip-ltr", className)}
      focusable="false"
      role={label ? "img" : undefined}
      size="1em"
      weight={weight}
    />
  );
}
