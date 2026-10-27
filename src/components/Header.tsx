import { type ReactNode } from "react";
import { cn } from "@/utils/cn";
import IconButton from "@/components/IconButton";

type HeaderIconItem = {
  icon: ReactNode;
  ariaLabel: string;
  onClick: () => void;
};

type HeaderProps = {
  title: string;
  leftItem?: HeaderIconItem;
  rightItems?: HeaderIconItem[];
  className?: string;
};

export default function Header({ title, leftItem, rightItems, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "bg-semantic-background-default relative flex h-16 w-full items-center px-2.5",
        className,
      )}>
      {/* 좌/우 아이콘 개수와 무관하게 타이틀이 항상 정중앙에 오도록 절대 중앙 정렬하고,
          가능한 가장 넓은 아이콘 영역(아이콘 2개+gap 4px+여백 10px=94px)을 양쪽에 대칭으로 예약해 겹치지 않게 한다 */}
      <p className="text-semantic-text-primary absolute top-1/2 left-1/2 max-w-[calc(100%-188px)] -translate-x-1/2 -translate-y-1/2 truncate text-center text-[17px] leading-[1.35] font-semibold tracking-[-0.34px]">
        {title}
      </p>
      {leftItem && (
        <IconButton
          size="xlarge"
          icon={leftItem.icon}
          aria-label={leftItem.ariaLabel}
          onClick={leftItem.onClick}
        />
      )}
      {rightItems && rightItems.length > 0 && (
        <div className="ml-auto flex gap-1">
          {rightItems.map((item, index) => (
            <IconButton
              key={index}
              size="xlarge"
              icon={item.icon}
              aria-label={item.ariaLabel}
              onClick={item.onClick}
            />
          ))}
        </div>
      )}
    </header>
  );
}
