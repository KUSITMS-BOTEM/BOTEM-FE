import { cn } from "@/utils/cn";

type ShimmerBarProps = {
  className?: string;
};

export default function ShimmerBar({ className }: ShimmerBarProps) {
  return (
    <div
      className={cn(
        "bg-semantic-fill-neutral-weak rounded-small relative overflow-hidden",
        className,
      )}>
      <div
        aria-hidden
        className="absolute inset-0 -translate-x-full animate-[skeleton-shimmer_1.5s_ease-in-out_infinite] bg-linear-to-r from-transparent via-white/70 to-transparent"
      />
    </div>
  );
}
