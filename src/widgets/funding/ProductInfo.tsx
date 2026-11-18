import Image from "next/image";

import IconLock from "@/assets/icons/icon-lock.svg?react";
import { cn } from "@/utils/cn";
import { formatDeadlineShort } from "@/utils/funding/formatDeadline";
import { getDDayLabel } from "@/utils/funding/getDDayLabel";

type ProductInfoProps = {
  productImageUrl: string;
  productName: string;
  /** "YYYY-MM-DD" */
  deadline: string;
  /** 서프라이즈 펀딩이라 마감일 옆에 자물쇠를 보여준다 */
  locked?: boolean;
  className?: string;
};

export default function ProductInfo({
  productImageUrl,
  productName,
  deadline,
  locked = false,
  className,
}: ProductInfoProps) {
  // 날짜 형식이 틀리면 빈 문자열이라 구분자(·)를 붙이지 않는다
  const dDay = getDDayLabel(deadline);

  return (
    <div
      className={cn(
        "text-semantic-text-on-fill flex w-full items-center gap-[10.532px] overflow-clip rounded-[18px] bg-linear-to-b from-transparent from-43% to-white/20 p-3 [letter-spacing:var(--letter-spacing-default)]",
        className,
      )}>
      <div className="bg-base-gray-200 relative size-12 shrink-0 overflow-hidden rounded-[6.857px]">
        {/* 상품 이미지 도메인이 제각각이라 next/image 최적화(remotePatterns)를 쓰지 않는다. 프로젝트 공통 관례 */}
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
        <div className="flex items-center gap-0.5">
          <p className="truncate [font:var(--semantic-body-x-small)]">
            마감 {formatDeadlineShort(deadline)}
            {dDay && ` · ${dDay}`}
          </p>
          {locked && <IconLock aria-hidden className="size-4 shrink-0 [&_path]:fill-white" />}
        </div>
      </div>
    </div>
  );
}
