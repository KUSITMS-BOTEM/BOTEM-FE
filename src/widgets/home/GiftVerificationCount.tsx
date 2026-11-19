import { cn } from "@/utils/cn";

type GiftVerificationCountProps = {
  count: number;
  className?: string;
};

export default function GiftVerificationCount({ count, className }: GiftVerificationCountProps) {
  return (
    <p
      className={cn(
        "text-semantic-text-primary [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-medium-strong)]",
        className,
      )}>
      인증할 선물이 <span className="text-semantic-text-brand">{count}</span>개 있어요
    </p>
  );
}
