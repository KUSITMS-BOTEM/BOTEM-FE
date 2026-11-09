import { cn } from "@/utils/cn";

type ProgressBarProps = {
  progress: number;
  "aria-labelledby"?: string;
  className?: string;
};

export default function ProgressBar({
  progress,
  "aria-labelledby": ariaLabelledBy,
  className,
}: ProgressBarProps) {
  const isValid = !Number.isNaN(progress);
  const clamped = isValid ? Math.min(100, Math.max(0, progress)) : 0;

  return (
    <div
      role="progressbar"
      aria-labelledby={ariaLabelledBy}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={isValid ? clamped : undefined}
      className={cn("flex h-7 w-full flex-col py-2", className)}>
      <div className="bg-base-gray-100 flex h-3 w-full items-center rounded-full">
        <div
          className="from-base-orange-400 to-base-orange-500 h-full rounded-full bg-linear-to-r from-[12.5%] to-[21.25%]"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
