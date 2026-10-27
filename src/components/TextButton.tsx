import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";
import Asset, { type AssetSize } from "@/components/Asset";
import Satets from "@/components/Satets";
import IconRight from "@/assets/icons/icon-right.svg?react";

type TextButtonColor = "neutral" | "brand" | "danger";
type TextButtonSize = "small" | "medium" | "large";

type TextButtonOwnProps = {
  color?: TextButtonColor;
  size?: TextButtonSize;
  disabled?: boolean;
  rightIcon?: boolean;
  label: string;
};

type TextButtonProps = TextButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof TextButtonOwnProps>;

type SizeStyle = {
  font: string;
  iconSize: AssetSize;
};

// Figma 실측: small·medium 아이콘은 동일하게 16px, large만 20px
const SIZE_STYLE: Record<TextButtonSize, SizeStyle> = {
  small: { font: "[font:var(--semantic-label-x-small)]", iconSize: "xsmall" },
  medium: { font: "[font:var(--semantic-label-small)]", iconSize: "xsmall" },
  large: { font: "[font:var(--semantic-label-medium)]", iconSize: "small" },
};

const COLOR_TEXT: Record<TextButtonColor, string> = {
  neutral: "text-semantic-text-primary",
  brand: "text-semantic-text-brand",
  danger: "text-semantic-text-danger",
};

export default function TextButton({
  color = "neutral",
  size = "small",
  disabled = false,
  rightIcon = true,
  className,
  label,
  ...props
}: TextButtonProps) {
  const sizeStyle = SIZE_STYLE[size];

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "group rounded-x-small relative inline-flex items-center overflow-clip pl-px whitespace-nowrap",
        "cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed",
        disabled && "opacity-30",
        "before:absolute before:inset-x-0 before:top-1/2 before:h-10 before:-translate-y-1/2 before:content-['']",
        sizeStyle.font,
        "[letter-spacing:var(--letter-spacing-default)]",
        COLOR_TEXT[color],
        className,
      )}
      {...props}>
      <Satets color="black" />
      <span className="relative z-10">{label}</span>
      {rightIcon && (
        <Asset icon={<IconRight />} size={sizeStyle.iconSize} className="relative z-10 shrink-0" />
      )}
    </button>
  );
}
