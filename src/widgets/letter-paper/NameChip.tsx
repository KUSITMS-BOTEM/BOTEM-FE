import { cn } from "@/utils/cn";
import { NAME_CHIP_CLASS, type Color } from "@/constants/color";

type NameChipProps = {
  name: string;
  color?: Color;
  className?: string;
};

export default function NameChip({ name, color = "orange", className }: NameChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-[7px] tracking-[-0.02em] whitespace-nowrap [font:var(--semantic-label-small)]",
        NAME_CHIP_CLASS[color],
        className,
      )}>
      {name}
    </span>
  );
}
