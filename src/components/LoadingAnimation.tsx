import { cn } from "@/utils/cn";

type LoadingAnimationSize = "large" | "small";
type LoadingAnimationColor = "black" | "white" | "brand" | "danger";

type LoadingAnimationProps = {
  size?: LoadingAnimationSize;
  color?: LoadingAnimationColor;
  className?: string;
};

const GAP_CLASS: Record<LoadingAnimationSize, string> = {
  large: "gap-1.5",
  small: "gap-1",
};

// [첫 번째 dot 크기, 나머지 dot 크기] — Figma에서 첫 dot만 한 단계 크다
const DOT_SIZE_CLASS: Record<LoadingAnimationSize, [string, string]> = {
  large: ["size-2.5", "size-2"],
  small: ["size-2", "size-1.5"],
};

const COLOR_CLASS: Record<LoadingAnimationColor, string> = {
  black: "bg-semantic-fill-neutral",
  white: "bg-semantic-icon-on-fill",
  brand: "bg-semantic-fill-brand",
  danger: "bg-semantic-fill-danger",
};

// ponytail: Figma는 dot마다 다른 width/opacity keyframe을 썼지만, 동일 keyframe + stagger로 근사(시각적 동일, 유지보수 비용 낮음)
const DOT_DELAY_CLASS = ["", "[animation-delay:0.2s]", "[animation-delay:0.4s]"];

export default function LoadingAnimation({
  size = "large",
  color = "black",
  className,
}: LoadingAnimationProps) {
  const [firstDotSize, restDotSize] = DOT_SIZE_CLASS[size];

  return (
    <div className={cn("flex items-center", GAP_CLASS[size], className)}>
      {DOT_DELAY_CLASS.map((delayClass, index) => (
        <span
          key={index}
          className={cn(
            "animate-[dot-pulse_1.2s_ease-in-out_infinite] rounded-full",
            index === 0 ? firstDotSize : restDotSize,
            COLOR_CLASS[color],
            delayClass,
          )}
        />
      ))}
    </div>
  );
}
