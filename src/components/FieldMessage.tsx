import { type ReactNode } from "react";
import { cn } from "@/utils/cn";
import Asset from "@/components/Asset";
import IconInfo from "@/assets/icons/icon-info.svg?react";
import IconCircleCloseFill from "@/assets/icons/icon-circleclosefill.svg?react";
import IconCheckCircleFill from "@/assets/icons/icon-checkcirclefill.svg?react";

export type FieldMessageState = "default" | "error" | "success";

type FieldMessageProps = {
  state?: FieldMessageState;
  id?: string;
  className?: string;
  children: ReactNode;
};

const STATE_STYLE: Record<
  FieldMessageState,
  { text: string; icon: string; Icon: typeof IconInfo }
> = {
  default: {
    text: "text-semantic-text-tertiary",
    icon: "text-semantic-icon-secondary",
    Icon: IconInfo,
  },
  error: {
    text: "text-semantic-text-danger",
    icon: "text-semantic-icon-danger",
    Icon: IconCircleCloseFill,
  },
  success: {
    text: "text-semantic-text-success",
    icon: "text-semantic-icon-success",
    Icon: IconCheckCircleFill,
  },
};

export default function FieldMessage({
  state = "default",
  id,
  className,
  children,
}: FieldMessageProps) {
  const { text, icon, Icon } = STATE_STYLE[state];

  return (
    <div
      id={id}
      className={cn(
        "flex items-start gap-1 pl-5",
        "[letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-x-small-weak)]",
        text,
        className,
      )}>
      <Asset icon={<Icon aria-hidden />} size="xsmall" className={icon} />
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  );
}
