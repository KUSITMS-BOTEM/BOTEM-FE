import { cn } from "@/utils/cn";

export type ConfettiBitKind = "circle" | "star" | "bar";

type ConfettiBitProps = {
  kind: ConfettiBitKind;
  className?: string;
};

const KIND_STYLE: Record<ConfettiBitKind, string> = {
  circle: "rounded-full opacity-75",
  star: "opacity-75 [clip-path:polygon(50%_0,65.91%_34.09%,100%_50%,65.91%_65.91%,50%_100%,34.09%_65.91%,0_50%,34.09%_34.09%)]",
  bar: "rounded-xs",
};

export default function ConfettiBit({ kind, className }: ConfettiBitProps) {
  return (
    <div className={cn("relative", KIND_STYLE[kind], className)}>
      <div className="from-base-gray-0/75 via-base-gray-0/15 to-base-gray-0/0 absolute inset-0 rounded-[inherit] bg-linear-to-br from-[14.286%] via-[39.286%] to-[57.143%] shadow-[0_0_6px_color-mix(in_srgb,var(--color-base-gray-0)_70%,transparent)] inset-shadow-[1px_1px_1.5px_color-mix(in_srgb,var(--color-base-gray-0)_60%,transparent)]" />
      <div className="from-base-gray-0/0 to-base-gray-0/25 absolute inset-0 rounded-[inherit] bg-linear-to-br from-[57.143%] to-[85.714%]" />
    </div>
  );
}
