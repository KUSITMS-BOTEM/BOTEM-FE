import { type ReactNode } from "react";
import { cn } from "@/utils/cn";
import TooltipTail from "@/assets/icons/multicolor/tooltip-tail.svg?react";

type TooltipProps = {
  children: ReactNode;
  className?: string;
};

// 꼬리가 오른쪽을 가리키는 말풍선. 가리킬 대상 왼쪽에 나란히 놓는다
export default function Tooltip({ children, className }: TooltipProps) {
  return (
    <div className={cn("relative z-10 flex items-center", className)}>
      <p className="bg-semantic-border-inverted text-semantic-text-primary rounded-lg px-3 py-2 [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-label-x-small-weak)]">
        {children}
      </p>
      <TooltipTail aria-hidden className="h-3 w-1.5 shrink-0" />
    </div>
  );
}
