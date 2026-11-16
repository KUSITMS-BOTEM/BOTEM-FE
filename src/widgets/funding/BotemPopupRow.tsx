import { type ReactNode } from "react";

import { cn } from "@/utils/cn";
import Asset from "@/components/Asset";

type BotemPopupRowProps = {
  icon: ReactNode;
  title: string;
  description: string;
  highlighted?: boolean;
  onClick?: () => void;
};

export default function BotemPopupRow({
  icon,
  title,
  description,
  highlighted = false,
  onClick,
}: BotemPopupRowProps) {
  const rootClassName = "flex w-full items-center gap-3 py-2 text-left";

  const content = (
    <>
      <span
        className={cn(
          "rounded-medium flex size-10 shrink-0 items-center justify-center",
          highlighted ? "bg-semantic-fill-brand-weak" : "bg-semantic-fill-neutral-weak",
        )}>
        <Asset icon={icon} size="medium" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 [letter-spacing:var(--letter-spacing-default)]">
        <span
          className={cn(
            "truncate [font:var(--semantic-label-small)]",
            highlighted ? "text-semantic-text-danger" : "text-semantic-text-primary",
          )}>
          {title}
        </span>
        <span className="text-semantic-text-secondary truncate [font:var(--semantic-subtext-medium)]">
          {description}
        </span>
      </span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(rootClassName, "cursor-pointer")}>
        {content}
      </button>
    );
  }

  return <div className={rootClassName}>{content}</div>;
}
