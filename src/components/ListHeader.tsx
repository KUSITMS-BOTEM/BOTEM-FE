import { cn } from "@/utils/cn";
import TextButton from "@/components/TextButton";

type ListHeaderRightItem = {
  label: string;
  onClick: () => void;
};

type ListHeaderProps = {
  title: string;
  as?: "h2" | "h3" | "h4";
  bg?: boolean;
  rightItem?: ListHeaderRightItem;
  className?: string;
};

export default function ListHeader({
  title,
  as: Title = "h2",
  bg = false,
  rightItem,
  className,
}: ListHeaderProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-between",
        bg ? "bg-semantic-fill-neutral-weak rounded-x-large h-[52px] px-4 py-[16.5px]" : "h-8",
        className,
      )}>
      <Title className="text-semantic-text-primary min-w-0 flex-1 truncate [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-small)]">
        {title}
      </Title>
      {rightItem && (
        <TextButton
          size="medium"
          label={rightItem.label}
          onClick={rightItem.onClick}
          className="shrink-0"
        />
      )}
    </div>
  );
}
