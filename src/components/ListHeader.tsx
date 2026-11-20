import { cn } from "@/utils/cn";
import Asset from "@/components/Asset";
import Satets from "@/components/Satets";
import TextButton from "@/components/TextButton";
import IconRight from "@/assets/icons/icon-right.svg?react";

type ListHeaderRightItem = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

type ListHeaderProps = {
  title: string;
  as?: "h2" | "h3" | "h4";
  bg?: boolean;
  rightItem?: ListHeaderRightItem;
  // true면 박스 전체가 rightItem.onClick을 실행하는 버튼이 된다
  boxClickable?: boolean;
  className?: string;
};

export default function ListHeader({
  title,
  as: Title = "h2",
  bg = false,
  rightItem,
  boxClickable = false,
  className,
}: ListHeaderProps) {
  const containerClassName = cn(
    "flex w-full items-center justify-between",
    bg ? "bg-semantic-fill-neutral-weak rounded-x-large h-[52px] px-4 py-[16.5px]" : "h-8",
    className,
  );
  const titleClassName =
    "text-semantic-text-primary min-w-0 flex-1 truncate text-left [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-small)]";

  // 버튼 안에는 heading·버튼을 둘 수 없어 제목과 오른쪽 라벨을 표시용 span으로 그린다
  if (boxClickable && rightItem) {
    return (
      <button
        type="button"
        onClick={rightItem.onClick}
        disabled={rightItem.disabled}
        className={cn(
          containerClassName,
          "group relative cursor-pointer disabled:cursor-not-allowed disabled:opacity-30",
        )}>
        <Satets color="black" className={bg ? "rounded-x-large" : "rounded-x-small"} />
        <span className={titleClassName}>{title}</span>
        <span className="text-semantic-text-primary inline-flex shrink-0 items-center pl-px [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-label-small)]">
          <span>{rightItem.label}</span>
          <Asset icon={<IconRight />} size="xsmall" className="shrink-0" />
        </span>
      </button>
    );
  }

  return (
    <div className={containerClassName}>
      <Title className={titleClassName}>{title}</Title>
      {rightItem && (
        <TextButton
          size="medium"
          label={rightItem.label}
          onClick={rightItem.onClick}
          disabled={rightItem.disabled}
          className="shrink-0"
        />
      )}
    </div>
  );
}
