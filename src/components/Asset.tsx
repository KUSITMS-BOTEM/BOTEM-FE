import { type ReactNode } from "react";
import { cn } from "@/utils/cn";

type AssetSize = "xsmall" | "small" | "medium" | "large";

const SIZE_STYLE: Record<AssetSize, string> = {
  xsmall: "size-4",
  small: "size-5",
  medium: "size-6",
  large: "size-7",
};

type AssetProps = {
  size?: AssetSize;
  icon: ReactNode;
  className?: string;
};

export default function Asset({ size = "xsmall", icon, className }: AssetProps) {
  return (
    <span className={cn("inline-flex shrink-0 [&>svg]:size-full", SIZE_STYLE[size], className)}>
      {icon}
    </span>
  );
}
