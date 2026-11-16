import BotemSymbol from "@/assets/logo/botem-symbol.svg?react";
import BotemWordmark from "@/assets/logo/botem-wordmark.svg?react";
import { cn } from "@/utils/cn";

type LogoProps = {
  className?: string;
};

export default function Logo({ className }: LogoProps) {
  return (
    <div role="img" aria-label="보탬" className={cn("flex items-center gap-1", className)}>
      <BotemSymbol aria-hidden className="h-[30px] w-[33.32px] shrink-0" />
      <BotemWordmark aria-hidden className="h-[21.34px] w-[73.28px] shrink-0" />
    </div>
  );
}
