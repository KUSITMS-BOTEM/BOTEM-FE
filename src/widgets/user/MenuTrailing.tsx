import Asset from "@/components/Asset";
import { cn } from "@/utils/cn";
import IconRight from "@/assets/icons/icon-right.svg?react";

type MenuTrailingProps = {
  label: string;
  className?: string;
};

export default function MenuTrailing({ label, className }: MenuTrailingProps) {
  return (
    <span
      className={cn(
        "text-semantic-text-secondary inline-flex items-center [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-label-small)]",
        className,
      )}>
      <span className="truncate">{label}</span>
      <Asset icon={<IconRight aria-hidden />} size="xsmall" className="shrink-0" />
    </span>
  );
}
