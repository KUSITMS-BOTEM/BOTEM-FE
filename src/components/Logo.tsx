import BotemSymbol from "@/assets/logo/botem-symbol.svg?react";
import BotemWordmark from "@/assets/logo/botem-wordmark.svg?react";
import { cn } from "@/utils/cn";

type LogoSize = "large" | "medium";

type LogoProps = {
  color?: "default" | "gray";
  size?: LogoSize;
  className?: string;
};

const SIZE_STYLE: Record<LogoSize, { gap: string; symbol: string; wordmark: string }> = {
  large: { gap: "gap-1", symbol: "h-[30px] w-[33.32px]", wordmark: "h-[21.34px] w-[73.28px]" },
  medium: { gap: "gap-0.5", symbol: "h-5 w-[22.21px]", wordmark: "h-[14.23px] w-[48.85px]" },
};

export default function Logo({ color = "default", size = "large", className }: LogoProps) {
  const sizeStyle = SIZE_STYLE[size];

  return (
    <div
      role="img"
      aria-label="보탬"
      className={cn(
        "flex items-center",
        sizeStyle.gap,
        color === "gray" && "[&_path]:fill-semantic-text-quaternary",
        className,
      )}>
      <BotemSymbol aria-hidden className={cn("shrink-0", sizeStyle.symbol)} />
      <BotemWordmark aria-hidden className={cn("shrink-0", sizeStyle.wordmark)} />
    </div>
  );
}
