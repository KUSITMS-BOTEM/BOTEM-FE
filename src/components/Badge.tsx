import { type HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type BadgeSize = "small" | "medium";

type BadgeColorProps =
  | { color?: "neutral" | "brand" | "danger"; variant?: "fill" | "weak" }
  | { color: "ghost"; variant?: "fill" };

type BadgeOwnProps = BadgeColorProps & {
  size?: BadgeSize;
  label: string;
};

type BadgeProps = BadgeOwnProps &
  Omit<HTMLAttributes<HTMLSpanElement>, "color" | keyof BadgeOwnProps>;

type BadgeTone =
  `${NonNullable<BadgeColorProps["color"]>}-${NonNullable<BadgeColorProps["variant"]>}`;

const TONE_STYLE: Record<Exclude<BadgeTone, "ghost-weak">, string> = {
  "neutral-fill": "bg-semantic-fill-neutral text-semantic-text-on-fill",
  "neutral-weak": "bg-semantic-fill-neutral-weak text-semantic-text-primary",
  "ghost-fill": "bg-semantic-fill-default text-semantic-text-primary",
  "brand-fill": "bg-semantic-fill-brand text-semantic-text-on-fill",
  "brand-weak": "bg-semantic-fill-brand-weak text-semantic-text-brand",
  "danger-fill": "bg-semantic-fill-danger text-semantic-text-on-fill",
  "danger-weak": "bg-semantic-fill-danger-weak text-semantic-text-danger",
};

const SIZE_STYLE: Record<BadgeSize, string> = {
  small: "[font:var(--semantic-label-x-small)]",
  medium: "[font:var(--semantic-label-small)]",
};

export default function Badge({
  color = "neutral",
  variant = "fill",
  size = "small",
  label,
  className,
  ...props
}: BadgeProps) {
  const tone = `${color}-${variant}` as keyof typeof TONE_STYLE;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg px-2 py-1 whitespace-nowrap",
        "[letter-spacing:var(--letter-spacing-default)]",
        TONE_STYLE[tone],
        SIZE_STYLE[size],
        className,
      )}
      {...props}>
      {label}
    </span>
  );
}
