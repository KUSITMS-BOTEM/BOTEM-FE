import { cn } from "@/utils/cn";

type TextCounterProps = {
  length: number;
  maxLength: number;
  error?: boolean;
  className?: string;
};

export default function TextCounter({
  length,
  maxLength,
  error = false,
  className,
}: TextCounterProps) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center pr-4 pl-2 [letter-spacing:var(--letter-spacing-default)]",
        error ? "text-semantic-text-danger" : "text-semantic-text-tertiary",
        className,
      )}>
      <span className="[font:var(--semantic-label-x-small-weak)]">{length}</span>
      <span className="[font:var(--semantic-label-x-small)]">/{maxLength}</span>
    </span>
  );
}
