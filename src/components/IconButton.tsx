import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import Asset, { type AssetSize } from "@/components/Asset";
import Satets from "@/components/Satets";

type IconButtonSize = "small" | "medium" | "large" | "xlarge";
type IconButtonVariant = "ghost" | "stroke";

type IconButtonOwnProps = {
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  disabled?: boolean;
  icon: ReactNode;
  "aria-label": string;
};

type IconButtonProps = IconButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof IconButtonOwnProps>;

type SizeStyle = {
  container: string;
  iconSize: AssetSize;
};

// Figma 소스에서 Large+Default+Disabled 조합만 아이콘 28px로 측정됐으나 나머지 Large 조합은 전부 20px라 이상치로 보고 20px로 통일
const SIZE_STYLE: Record<IconButtonSize, SizeStyle> = {
  small: { container: "size-6", iconSize: "xsmall" },
  medium: { container: "size-7", iconSize: "small" },
  large: { container: "size-9", iconSize: "small" },
  xlarge: { container: "size-10", iconSize: "medium" },
};

// Touch Area: Figma 기준 높이 40px 고정, 좌우 확장폭만 variant별로 다름
const VARIANT_STYLE: Record<IconButtonVariant, { background: string; touchArea: string }> = {
  ghost: {
    background: "",
    touchArea:
      "before:absolute before:-left-1.5 before:-right-1.5 before:top-1/2 before:h-10 before:-translate-y-1/2 before:content-['']",
  },
  stroke: {
    background: "border border-semantic-border-weak bg-semantic-fill-default/80 backdrop-blur-sm",
    touchArea:
      "before:absolute before:-left-[7px] before:-right-[7px] before:top-1/2 before:h-10 before:-translate-y-1/2 before:content-['']",
  },
};

export default function IconButton({
  size = "small",
  variant = "ghost",
  disabled = false,
  icon,
  className,
  ...props
}: IconButtonProps) {
  const sizeStyle = SIZE_STYLE[size];
  const variantStyle = VARIANT_STYLE[variant];

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "group relative inline-flex items-center justify-center rounded-full transition-colors disabled:pointer-events-none",
        "cursor-pointer disabled:cursor-not-allowed",
        disabled && "opacity-30",
        sizeStyle.container,
        variantStyle.background,
        variantStyle.touchArea,
        className,
      )}
      {...props}>
      <Satets color="black" className="rounded-full" />
      <Asset
        icon={icon}
        size={sizeStyle.iconSize}
        className="text-semantic-icon-default relative z-10"
      />
    </button>
  );
}
