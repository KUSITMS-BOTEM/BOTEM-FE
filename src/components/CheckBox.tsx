import { type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { cn } from "@/utils/cn";
import Asset from "@/components/Asset";
import CheckIcon from "@/assets/icons/icon-check.svg?react";

type CheckBoxOwnProps = {
  label?: ReactNode;
  className?: string;
  ref?: Ref<HTMLInputElement>;
};

type CheckBoxProps = CheckBoxOwnProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, keyof CheckBoxOwnProps | "type">;

export default function CheckBox({ label, disabled = false, className, ...props }: CheckBoxProps) {
  return (
    <label
      className={cn(
        "inline-flex max-w-[327px] cursor-pointer items-center gap-2",
        disabled && "cursor-not-allowed opacity-30",
        className,
      )}>
      <input type="checkbox" disabled={disabled} className="peer sr-only" {...props} />
      <span
        aria-hidden
        className={cn(
          "relative inline-flex size-6 shrink-0 items-center justify-center rounded-full transition-colors",
          "border-semantic-border-default bg-semantic-fill-default border-[1.5px]",
          "peer-checked:border-semantic-fill-brand peer-checked:bg-semantic-fill-brand peer-checked:*:opacity-100",
          "peer-focus-visible:ring-semantic-border-strong peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2",
          "before:absolute before:top-1/2 before:-right-2 before:-left-2 before:h-10 before:-translate-y-1/2 before:content-['']",
        )}>
        <Asset
          icon={<CheckIcon />}
          size="xsmall"
          className="text-semantic-icon-on-fill opacity-0 transition-opacity"
        />
      </span>
      {(label || label === 0) && (
        <span className="text-semantic-text-secondary min-w-0 tracking-(--letter-spacing-default) [font:var(--semantic-body-medium-strong)]">
          {label}
        </span>
      )}
    </label>
  );
}
