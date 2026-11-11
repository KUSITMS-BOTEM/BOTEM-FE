import { cn } from "@/utils/cn";

type PageIndicatorProps = {
  total: number;
  current: number;
  className?: string;
};

export default function PageIndicator({ total, current, className }: PageIndicatorProps) {
  return (
    <div
      role="img"
      aria-label={`${total}페이지 중 ${current}페이지`}
      className={cn(
        "bg-semantic-fill-default/70 flex items-center gap-1 rounded-full p-2 shadow-[0_4px_16px_0_var(--color-semantic-shadow-weak)]",
        className,
      )}>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            index + 1 === current ? "bg-base-gray-800" : "bg-base-gray-300",
          )}
        />
      ))}
    </div>
  );
}
