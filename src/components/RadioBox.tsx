import { type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

type RadioBoxProps = {
  label?: ReactNode;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className">;

export default function RadioBox({ label, disabled = false, className, ...props }: RadioBoxProps) {
  return (
    <label
      className={cn(
        "inline-flex max-w-[327px] cursor-pointer items-center gap-2",
        disabled && "cursor-not-allowed opacity-30",
        className,
      )}>
      <input type="radio" disabled={disabled} className="peer sr-only" {...props} />
      <span
        aria-hidden
        className={cn(
          "relative size-6 shrink-0 rounded-full transition-colors",
          "border-semantic-border-default bg-semantic-fill-default border-[1.5px]",
          "peer-checked:border-semantic-fill-brand peer-checked:bg-semantic-fill-brand",
          "after:bg-semantic-fill-default after:absolute after:inset-0 after:m-auto after:size-2.5 after:rounded-full after:opacity-0 after:content-[''] peer-checked:after:opacity-100",
          "peer-focus-visible:ring-semantic-border-strong peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2",
          "before:absolute before:top-1/2 before:-right-[9.5px] before:-left-[9.5px] before:h-10 before:-translate-y-1/2 before:content-['']",
        )}
      />
      {(label || label === 0) && (
        <span className="text-semantic-text-secondary min-w-0 tracking-(--letter-spacing-default) [font:var(--semantic-body-medium-strong)]">
          {label}
        </span>
      )}
    </label>
  );
}
