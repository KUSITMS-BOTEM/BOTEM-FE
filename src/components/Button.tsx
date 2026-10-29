import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import Asset, { type AssetSize } from "@/components/Asset";
import LoadingAnimation from "@/components/LoadingAnimation";
import Satets, { type SatetsColor } from "@/components/Satets";

type ButtonSize = "small" | "medium" | "large" | "xlarge";
type ButtonStates = "default" | "loading";

type NeutralButtonColorProps = {
  color?: "neutral";
  variant?: "fill" | "weak" | "ghost" | "stroke";
};

type AccentButtonColorProps = {
  color: "brand" | "danger";
  variant?: "fill" | "weak";
};

type ButtonColorProps = NeutralButtonColorProps | AccentButtonColorProps;

type ButtonOwnProps = ButtonColorProps & {
  size?: ButtonSize;
  disabled?: boolean;
  states?: ButtonStates;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  iconSize?: AssetSize;
  children: ReactNode;
};

type ButtonProps = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps>;

type ColorVariantKey = `${"neutral" | "brand" | "danger"}-${"fill" | "weak" | "ghost" | "stroke"}`;

type ColorVariantStyle = {
  background: string;
  text: string;
  icon: string;
  loadingColor: "black" | "white" | "brand" | "danger";
};

// brand·danger는 Figma에 fill·weak variant만 정의돼 있어 ghost·stroke 조합은 존재하지 않는다
const COLOR_VARIANT_STYLE: Partial<Record<ColorVariantKey, ColorVariantStyle>> = {
  "neutral-fill": {
    background: "bg-semantic-fill-neutral",
    text: "text-semantic-text-on-fill",
    icon: "text-semantic-icon-on-fill",
    loadingColor: "white",
  },
  "neutral-weak": {
    background: "bg-semantic-fill-neutral-weak",
    text: "text-semantic-text-primary",
    icon: "text-semantic-icon-default",
    loadingColor: "black",
  },
  "neutral-ghost": {
    background: "bg-semantic-fill-default",
    text: "text-semantic-text-primary",
    icon: "text-semantic-icon-default",
    loadingColor: "black",
  },
  "neutral-stroke": {
    background: "bg-semantic-fill-default border border-semantic-border-default",
    text: "text-semantic-text-primary",
    icon: "text-semantic-icon-default",
    loadingColor: "black",
  },
  "brand-fill": {
    background: "bg-semantic-fill-brand",
    text: "text-semantic-text-on-fill",
    icon: "text-semantic-icon-on-fill",
    loadingColor: "white",
  },
  "brand-weak": {
    background: "bg-semantic-fill-brand-weak",
    text: "text-semantic-text-brand",
    icon: "text-semantic-icon-brand",
    loadingColor: "brand",
  },
  "danger-fill": {
    background: "bg-semantic-fill-danger",
    text: "text-semantic-text-on-fill",
    icon: "text-semantic-icon-on-fill",
    loadingColor: "white",
  },
  "danger-weak": {
    background: "bg-semantic-fill-danger-weak",
    text: "text-semantic-text-danger",
    icon: "text-semantic-icon-danger",
    loadingColor: "danger",
  },
};

type SizeStyle = {
  height: string;
  padding: string;
  gap: string;
  font: string;
  touchArea: string;
  loadingAnimationSize: "small" | "large";
};

// touchArea: Figma Touch Area 레이어 기준 — small/medium은 시각 크기(32/38px)가 작아 높이 40px로 클릭 영역을 넓히고, large/xlarge는 시각 크기 자체가 넓어 별도 확장이 없다
const SIZE_STYLE: Record<ButtonSize, SizeStyle> = {
  small: {
    height: "h-8",
    padding: "px-2",
    gap: "[gap:var(--gap-xx-small)]",
    font: "[font:var(--semantic-label-x-small)]",
    touchArea:
      "before:absolute before:inset-x-0 before:-top-1 before:-bottom-1 before:content-['']",
    loadingAnimationSize: "small",
  },
  medium: {
    height: "h-[38px]",
    padding: "px-3",
    gap: "[gap:var(--gap-x-small)]",
    font: "[font:var(--semantic-label-small)]",
    touchArea:
      "before:absolute before:inset-x-0 before:-top-px before:-bottom-px before:content-['']",
    loadingAnimationSize: "large",
  },
  large: {
    height: "h-12",
    padding: "px-4",
    gap: "[gap:var(--gap-x-small)]",
    font: "[font:var(--semantic-label-medium)]",
    touchArea: "",
    loadingAnimationSize: "large",
  },
  xlarge: {
    height: "h-14",
    padding: "px-6",
    gap: "[gap:var(--gap-x-small)]",
    font: "[font:var(--semantic-label-medium)]",
    touchArea: "",
    loadingAnimationSize: "large",
  },
};

// Figma 기준 small은 size-4(xsmall), medium 이상은 size-5(small)
const ICON_SIZE_BY_BUTTON_SIZE: Record<ButtonSize, AssetSize> = {
  small: "xsmall",
  medium: "small",
  large: "small",
  xlarge: "small",
};

export default function Button({
  color = "neutral",
  variant = "fill",
  size = "medium",
  disabled = false,
  states = "default",
  leftIcon,
  rightIcon,
  iconSize,
  className,
  children,
  ...props
}: ButtonProps) {
  const colorVariant = COLOR_VARIANT_STYLE[`${color}-${variant}` as ColorVariantKey]!;
  const sizeStyle = SIZE_STYLE[size];
  const isLoading = states === "loading";
  const isDisabled = disabled || isLoading;
  const satetsColor: SatetsColor =
    color === "neutral"
      ? variant === "fill"
        ? "white"
        : "black"
      : variant === "weak"
        ? color
        : "black";

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-busy={isLoading}
      className={cn(
        "group relative inline-flex items-center justify-center rounded-full whitespace-nowrap transition-[colors,transform] disabled:pointer-events-none",
        "cursor-pointer active:scale-95 disabled:cursor-not-allowed",
        disabled && "opacity-30",
        sizeStyle.height,
        sizeStyle.padding,
        sizeStyle.gap,
        sizeStyle.font,
        sizeStyle.touchArea,
        "[letter-spacing:var(--letter-spacing-default)]",
        colorVariant.background,
        colorVariant.text,
        className,
      )}
      {...props}>
      <Satets color={satetsColor} className="rounded-full" />
      <span className={cn("relative z-10 inline-flex items-center", sizeStyle.gap)}>
        {isLoading && (
          <span aria-hidden>
            <LoadingAnimation
              size={sizeStyle.loadingAnimationSize}
              color={colorVariant.loadingColor}
            />
          </span>
        )}
        {/* 로딩 중에도 접근 가능한 이름 유지를 위해 children은 시각적으로만 숨김(sr-only) */}
        <span className={cn("inline-flex items-center", sizeStyle.gap, isLoading && "sr-only")}>
          {!isLoading && leftIcon && (
            <Asset
              icon={leftIcon}
              size={iconSize ?? ICON_SIZE_BY_BUTTON_SIZE[size]}
              className={colorVariant.icon}
            />
          )}
          {children}
          {!isLoading && rightIcon && (
            <Asset
              icon={rightIcon}
              size={iconSize ?? ICON_SIZE_BY_BUTTON_SIZE[size]}
              className={colorVariant.icon}
            />
          )}
        </span>
      </span>
    </button>
  );
}
