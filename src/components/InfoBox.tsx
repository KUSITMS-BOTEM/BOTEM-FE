import { type ReactNode } from "react";
import { cn } from "@/utils/cn";
import Asset from "@/components/Asset";
import IconInfo from "@/assets/icons/icon-info.svg?react";

type InfoBoxProps = {
  text: string;
  icon?: ReactNode;
  className?: string;
};

export default function InfoBox({ text, icon, className }: InfoBoxProps) {
  return (
    <div
      className={cn(
        "bg-semantic-fill-neutral-weak flex w-full items-center gap-2 rounded-xl p-3",
        className,
      )}>
      <Asset
        icon={icon ?? <IconInfo aria-hidden />}
        size="xsmall"
        className="text-semantic-icon-primary"
      />
      <p className="text-semantic-text-secondary min-w-0 flex-1 [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-subtext-medium)]">
        {text}
      </p>
    </div>
  );
}
