import { type ReactNode } from "react";
import { cn } from "@/utils/cn";
import TooltipTail from "@/assets/icons/multicolor/tooltip-tail.svg?react";

type TooltipDirection = "right" | "up" | "down";

type TooltipProps = {
  children: ReactNode;
  direction?: TooltipDirection;
  className?: string;
};

const BUBBLE_STYLE =
  "rounded-lg px-3 py-2 [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-x-small-weak)]";

// right: 꼬리가 오른쪽을 가리키는 밝은 말풍선. 가리킬 대상 왼쪽에 나란히 놓는다
// up: 꼬리가 위를 가리키는 어두운 말풍선. 가리킬 대상 아래에 놓는다
// down: 꼬리가 아래 가운데를 가리키는 검은 말풍선. 가리킬 대상 위에 놓는다
export default function Tooltip({ children, direction = "right", className }: TooltipProps) {
  if (direction === "down") {
    return (
      <div className={cn("relative z-10", className)}>
        <p className="bg-semantic-fill-neutral text-semantic-text-on-fill rounded-lg px-3 py-2 [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-label-x-small)]">
          {children}
        </p>
        {/* 6×12 꼬리를 90° 돌리면 레이아웃 박스 중심 기준으로 위아래 3px씩 줄어 3px 올린다.
            말풍선 높이가 소수점(13px×1.252)이라 경계가 딱 맞으면 안티에일리어싱으로 흰 선이 보여, 1px 더 올려 본체와 겹친다 */}
        <TooltipTail
          aria-hidden
          className="text-semantic-fill-neutral absolute top-[calc(100%-4px)] left-1/2 h-3 w-1.5 -translate-x-1/2 rotate-90"
        />
      </div>
    );
  }

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
