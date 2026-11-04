import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import Asset, { type AssetSize } from "@/components/Asset";

type ChipSize = "small" | "medium";

type ChipOwnProps = {
  size?: ChipSize;
  selected?: boolean;
  logo?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  label: string;
};

type ChipProps = ChipOwnProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ChipOwnProps>;

const SIZE_STYLE: Record<ChipSize, { container: string; logo: string; iconSize: AssetSize }> = {
  small: {
    container: "h-8 px-2 [font:var(--semantic-label-x-small)]",
    logo: "size-5",
    iconSize: "xsmall",
  },
  medium: {
    container: "h-[38px] px-3 [font:var(--semantic-label-small)]",
    logo: "size-6",
    iconSize: "small",
  },
};

export default function Chip({
  size = "medium",
  selected = false,
  logo,
  leftIcon,
  rightIcon,
  label,
  className,
  ...props
}: ChipProps) {
  const sizeStyle = SIZE_STYLE[size];

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full border whitespace-nowrap",
        "text-semantic-text-primary [letter-spacing:var(--letter-spacing-default)] disabled:cursor-not-allowed",
        // Touch Area: Figma 기준 높이 40px, 좌우 1px 확장
        "before:absolute before:top-1/2 before:-right-px before:-left-px before:h-10 before:-translate-y-1/2 before:content-['']",
        selected
          ? "border-semantic-border-strong bg-semantic-fill-neutral-weak"
          : "border-semantic-border-default bg-semantic-fill-default",
        sizeStyle.container,
        className,
      )}
      {...props}>
      {logo && (
        <span
          className={cn(
            "bg-semantic-fill-default flex shrink-0 items-center justify-center overflow-clip rounded-full",
            sizeStyle.logo,
          )}>
          {logo}
        </span>
      )}
      {leftIcon && <Asset icon={leftIcon} size={sizeStyle.iconSize} />}
      {label}
      {rightIcon && <Asset icon={rightIcon} size={sizeStyle.iconSize} />}
    </button>
  );
}
