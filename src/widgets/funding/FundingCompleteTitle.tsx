import { cn } from "@/utils/cn";

type FundingCompleteTitleProps = {
  title: string;
  description: string;
  className?: string;
};

export default function FundingCompleteTitle({
  title,
  description,
  className,
}: FundingCompleteTitleProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 [letter-spacing:var(--letter-spacing-default)] whitespace-pre-line",
        className,
      )}>
      <h1 className="text-semantic-text-strong [font:var(--semantic-title-a2-z-large)]">{title}</h1>
      <p className="text-semantic-text-tertiary [font:var(--semantic-subtext-large)]">
        {description}
      </p>
    </div>
  );
}
