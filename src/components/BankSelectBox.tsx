import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

type BankSelectBoxOwnProps = {
  selected: boolean;
  text: string;
  image: ReactNode;
};

type BankSelectBoxProps = BankSelectBoxOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BankSelectBoxOwnProps>;

export default function BankSelectBox({
  selected,
  text,
  image,
  className,
  ...props
}: BankSelectBoxProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "rounded-large flex h-22 w-full min-w-0 cursor-pointer flex-col items-center justify-center gap-2 overflow-clip border-2 px-8 py-3 disabled:cursor-not-allowed",
        selected
          ? "bg-semantic-fill-default border-semantic-border-strong"
          : "bg-semantic-fill-neutral-weak border-transparent",
        className,
      )}
      {...props}>
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center",
          selected && "bg-semantic-fill-default overflow-clip rounded-full",
        )}>
        {image}
      </span>
      <p
        className={cn(
          "text-semantic-text-strong [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap",
          selected
            ? "[font:var(--semantic-label-small-strong)]"
            : "[font:var(--semantic-label-small-weak)]",
        )}>
        {text}
      </p>
    </button>
  );
}
