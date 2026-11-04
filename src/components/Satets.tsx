import { cn } from "@/utils/cn";

export type SatetsColor = "black" | "white" | "brand" | "danger";

const COLOR_STYLE: Record<SatetsColor, string> = {
  black: "bg-semantic-fill-neutral group-hover:opacity-[0.05] group-active:opacity-[0.12]",
  white: "bg-semantic-icon-on-fill group-hover:opacity-[0.14] group-active:opacity-[0.30]",
  brand: "bg-semantic-fill-brand group-hover:opacity-[0.14] group-active:opacity-[0.30]",
  danger: "bg-semantic-fill-danger group-hover:opacity-[0.14] group-active:opacity-[0.30]",
};

type SatetsProps = {
  color: SatetsColor;
  className?: string;
};

export default function Satets({ color, className }: SatetsProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 opacity-0 transition-opacity",
        COLOR_STYLE[color],
        className,
      )}
    />
  );
}
