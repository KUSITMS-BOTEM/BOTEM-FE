import Image from "next/image";

import { cn } from "@/utils/cn";
import { formatDeadlineShort } from "@/utils/funding/formatDeadline";
import { getDDayLabel } from "@/utils/funding/getDDayLabel";

type ProductInfoProps = {
  productImageUrl: string;
  productName: string;
  /** "YYYY-MM-DD" */
  deadline: string;
  className?: string;
};

export default function ProductInfo({
  productImageUrl,
  productName,
  deadline,
  className,
}: ProductInfoProps) {
  return (
    <div
      className={cn(
        "text-semantic-text-on-fill flex w-full items-center gap-[10.532px] overflow-clip rounded-[18px] bg-linear-to-b from-transparent from-43% to-white/20 p-3 [letter-spacing:var(--letter-spacing-default)]",
        className,
      )}>
      <div className="bg-base-gray-200 relative size-12 shrink-0 overflow-hidden rounded-[6.857px]">
        <Image
          src={productImageUrl}
          alt=""
          fill
          sizes="48px"
          unoptimized
          className="object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[1.755px]">
        <p className="truncate [font:var(--semantic-label-small)]">{productName}</p>
        <p className="truncate [font:var(--semantic-body-x-small)]">
          마감 {formatDeadlineShort(deadline)} · {getDDayLabel(deadline)}
        </p>
      </div>
    </div>
  );
}
