"use client";

import type { ReactNode } from "react";
import { motion, type Easing, type TargetAndTransition } from "framer-motion";

import Badge from "@/components/Badge";
import { getDDayLabel } from "@/utils/funding/getDDayLabel";
import { withSubjectParticle } from "@/utils/withSubjectParticle";
import ProductInfo from "@/widgets/funding/ProductInfo";
import ConfettiSubtle from "@/assets/images/funding-complete/confetti-subtle.svg?react";
import GiftBox from "@/assets/images/funding-complete/gift-box.svg?react";
import ProfileOrange from "@/assets/icons/multicolor/profile-orange.svg?react";

// 카드가 나타난 시점(0초) 기준. Figma 12.2초 타임라인에서 카드 등장(2.3초)을 뺀 값이다
const PROFILE_TRANSITION = {
  delay: 0.106,
  duration: 0.65,
  times: [0, 0.692, 1],
  ease: [[0.3, 0, 0.3, 1], "linear"] as Easing[],
};
const TITLE_DELAY = 0.706;
const CHIP_DELAY = 1.105;
const GIFT_FLOAT = { delay: 1.105, duration: 2, ease: [0.37, 0, 0.63, 1] as Easing };

// 기본은 보탠 사람 문구. 다른 화면(서프라이즈 준비 완료 등)은 title·ariaLabel로 문구를 직접 정한다
type BragCardCopy =
  | { giverName: string; recipientName: string; title?: never; ariaLabel?: never }
  | { title: string; ariaLabel: string; giverName?: never; recipientName?: never };

type FundingBragCardProps = BragCardCopy & {
  productImageUrl: string;
  productName: string;
  /** "YYYY-MM-DD" */
  deadline: string;
  /** 있으면 D-day 배지 자리에 대신 보여준다 */
  badge?: ReactNode;
  /** 우측 상단 프로필 아이콘 */
  showProfile?: boolean;
  /** 상품 이름 아래 줄을 마감일 문구 대신 바꾼다 */
  productCaption?: string;
  /** 모션 감소 설정이면 등장 모션 없이 완성된 모습으로 그린다 */
  reduceMotion: boolean;
};

export default function FundingBragCard({
  giverName,
  recipientName,
  title,
  ariaLabel,
  productImageUrl,
  productName,
  deadline,
  badge,
  showProfile = true,
  productCaption,
  reduceMotion,
}: FundingBragCardProps) {
  const initial = (value: TargetAndTransition) => (reduceMotion ? false : value);
  const dDay = getDDayLabel(deadline);
  const badgeNode =
    badge ?? (dDay && <Badge color="brand" variant="weak" size="medium" label={dDay} />);

  return (
    <section
      aria-label={ariaLabel ?? `${giverName}님이 ${recipientName}님에게 보탠 내용`}
      className="relative flex h-full w-full flex-col px-3 pt-[22px] pb-3">
      <div
        aria-hidden
        className="to-semantic-fill-neutral-weak absolute inset-0 rounded-[28px] bg-linear-to-b from-transparent from-65% to-[121%]"
      />
      <ConfettiSubtle
        aria-hidden
        className="absolute inset-0 block size-full max-w-none overflow-hidden"
      />
      <div className="relative flex w-full items-start justify-between">
        <div className="flex flex-col items-start gap-1 px-2">
          <motion.p
            initial={initial({ opacity: 0, y: 14 })}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              opacity: { delay: TITLE_DELAY, duration: 0.3, ease: "linear" },
              y: { delay: TITLE_DELAY, duration: 0.35, ease: "linear" },
            }}
            className="text-semantic-text-strong [letter-spacing:var(--letter-spacing-default)] whitespace-pre-line [font:var(--semantic-title-a2-z-medium)]">
            {title ?? `${withSubjectParticle(giverName)} ${recipientName}에게\n보탰어요!`}
          </motion.p>
          {badgeNode && (
            <motion.div
              initial={initial({ opacity: 0, scale: 0.3 })}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                opacity: { delay: CHIP_DELAY, duration: 0.1, ease: "linear" },
                scale: { delay: CHIP_DELAY, duration: 0.25, ease: "linear" },
              }}>
              {badgeNode}
            </motion.div>
          )}
        </div>
        {showProfile && (
          <motion.div
            aria-hidden
            initial={initial({ scale: 0.6 })}
            animate={{ scale: [0.6, 1.08, 1] }}
            transition={PROFILE_TRANSITION}
            className="size-9 shrink-0">
            <ProfileOrange className="size-full" />
          </motion.div>
        )}
      </div>
      <div aria-hidden className="relative w-full flex-1">
        <div className="absolute top-[calc(50%+10.86px)] left-[calc(50%+0.35px)] size-[280.69px] -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
            transition={{ ...GIFT_FLOAT, repeat: Infinity }}
            className="relative size-full">
            <GiftBox className="absolute inset-[-3.65%_-4.54%_-8.95%_-3.91%] block size-auto max-w-none" />
          </motion.div>
        </div>
      </div>
      <ProductInfo
        productImageUrl={productImageUrl}
        productName={productName}
        deadline={deadline}
        caption={productCaption}
        className="bg-semantic-fill-default text-semantic-text-strong [&_p:last-child]:text-semantic-text-secondary relative drop-shadow-[0_8px_12px_rgb(26_26_46/0.06)]"
      />
    </section>
  );
}
