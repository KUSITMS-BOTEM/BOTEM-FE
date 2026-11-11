import { cn } from "@/utils/cn";
import List from "@/components/List";
import IconErrorCircleFill from "@/assets/icons/icon-errorcirclefill.svg?react";

type PendingContributionItemProps = {
  senderName: string;
  depositMethod: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
};

export default function PendingContributionItem({
  senderName,
  depositMethod,
  checked,
  onCheckedChange,
  className,
}: PendingContributionItemProps) {
  return (
    <label
      className={cn(
        "flex min-h-[82px] w-full cursor-pointer items-center rounded-2xl px-3 py-4 transition-colors",
        "has-focus-visible:ring-semantic-border-strong has-focus-visible:ring-2 has-focus-visible:ring-offset-2",
        checked
          ? "bg-semantic-fill-neutral-weak border-semantic-border-strong border-2"
          : "bg-semantic-fill-default border-semantic-border-weak border",
        className,
      )}>
      <input
        type="checkbox"
        checked={checked}
        onChange={event => onCheckedChange(event.target.checked)}
        className="sr-only"
      />
      <List
        leading={<IconErrorCircleFill aria-hidden />}
        title={`${senderName}의 보탬`}
        description={depositMethod}
        className="py-0"
      />
    </label>
  );
}
