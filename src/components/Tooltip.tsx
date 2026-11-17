import { type ReactNode } from "react";
import { cn } from "@/utils/cn";
import TooltipTail from "@/assets/icons/multicolor/tooltip-tail.svg?react";

type TooltipDirection = "right" | "up";

type TooltipProps = {
  children: ReactNode;
  direction?: TooltipDirection;
  className?: string;
};

const BUBBLE_STYLE =
  "rounded-lg px-3 py-2 [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-x-small-weak)]";

// right: 꼬리가 오른쪽을 가리키는 밝은 말풍선. 가리킬 대상 왼쪽에 나란히 놓는다
// up: 꼬리가 위를 가리키는 어두운 말풍선. 가리킬 대상 아래에 놓는다
export default function Tooltip({ children, direction = "right", className }: TooltipProps) {
  if (direction === "up") {
    return (
      <div className={cn("relative z-10", className)}>
        <p
          className={cn(
            BUBBLE_STYLE,
            "bg-semantic-icon-default text-semantic-text-on-fill whitespace-pre-line",
          )}>
          {children}
        </p>
        {/* 6×12 꼬리를 -90° 돌리면 12×6 영역(오른쪽 8px, 위 -6px)을 차지하도록 중심을 맞춘다 */}
        <TooltipTail
          aria-hidden
          className="text-semantic-icon-default absolute top-[-9px] right-[11px] h-3 w-1.5 -rotate-90"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative z-10 flex items-center", className)}>
      <p
        className={cn(
          BUBBLE_STYLE,
          "bg-semantic-border-inverted text-semantic-text-primary whitespace-nowrap shadow-[0_4px_8px_0_var(--color-semantic-shadow-weak)]",
        )}>
        {children}
      </p>
      <TooltipTail aria-hidden className="text-semantic-border-inverted h-3 w-1.5 shrink-0" />
    </div>
  );
}
