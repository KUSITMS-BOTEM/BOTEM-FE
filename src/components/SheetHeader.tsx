import { cn } from "@/utils/cn";
import IconButton from "@/components/IconButton";
import IconClose from "@/assets/icons/icon-close.svg?react";

type SheetHeaderProps = {
  title: string;
  titleId?: string;
  onClose: () => void;
  showHandle?: boolean;
  className?: string;
};

export default function SheetHeader({
  title,
  titleId,
  onClose,
  showHandle = true,
  className,
}: SheetHeaderProps) {
  return (
    <div
      className={cn(
        "from-semantic-background-default to-semantic-background-default/0 relative flex h-16 w-full shrink-0 flex-col items-center bg-gradient-to-b py-2 backdrop-blur-[2px]",
        showHandle ? "justify-between" : "justify-center",
        className,
      )}>
      {showHandle && (
        <div className="bg-semantic-border-default h-1.5 w-[46px] shrink-0 rounded-full" />
      )}
      <div className="flex h-[42px] items-center justify-center">
        <p
          id={titleId}
          className="text-semantic-text-primary w-[246px] overflow-hidden text-center [letter-spacing:var(--letter-spacing-default)] text-ellipsis whitespace-nowrap [font:var(--semantic-label-medium-strong)]">
          {title}
        </p>
      </div>
      <IconButton
        size="large"
        icon={<IconClose />}
        aria-label="닫기"
        onClick={onClose}
        className="absolute top-2 right-[11px]"
      />
    </div>
  );
}
