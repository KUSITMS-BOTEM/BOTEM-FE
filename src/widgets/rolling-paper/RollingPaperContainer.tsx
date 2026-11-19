"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import IconShare from "@/assets/icons/icon-share.svg?react";
import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import OpenSheet from "@/components/OpenSheet";
import { cn } from "@/utils/cn";
import { DUMMY_LETTERS } from "@/widgets/rolling-paper/dummyLetters";
import RollingPaperCard from "@/widgets/rolling-paper/RollingPaperCard";
import RollingPaperOpenOverlay from "@/widgets/rolling-paper/RollingPaperOpenOverlay";
import {
  CARD_CLIP_CLOSE_TRANSITION,
  CARD_CLIP_CLOSED,
  CARD_CLIP_OPEN,
  EXIT_BACKGROUND_TRANSITION,
  EXIT_CTA_CLASS,
  EXIT_CTA_HIDDEN_CLASS,
  EXIT_HEADER_TRANSITION,
  EXIT_HINT_TRANSITION,
  getVisibleCards,
  getVisibleSlots,
  HINT_ENTER_TRANSITION,
} from "@/widgets/rolling-paper/rollingPaperMotion";

type RollingPaperContainerProps = {
  fundingId: number;
  count: number;
  open: boolean;
  onClose: () => void;
};

export default function RollingPaperContainer({
  fundingId,
  count,
  open,
  onClose,
}: RollingPaperContainerProps) {
  const [opened, setOpened] = useState(false);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const slots = getVisibleSlots(count);
  // 도착 페이지는 펀딩 결과 응답에서 메세지 개수를 직접 받는다
  const detailPath = `/rolling-paper/${fundingId}`;

  // 모션이 끝나는 1.1s 뒤 이동하므로 그 사이 페이지를 미리 받아둔다
  const handleOpen = () => {
    router.prefetch(detailPath);
    setOpened(true);
  };

  return (
    <OpenSheet
      open={open}
      title=""
      onClose={onClose}
      hideScrollbar
      overlay={
        opened && (
          <RollingPaperOpenOverlay
            backgroundRef={backgroundRef}
            onCovered={() => router.push(detailPath)}
          />
        )
      }
      headerAction={<IconButton size="large" icon={<IconShare />} aria-label="공유" />}>
      {/* 카드가 시트 좌우 끝까지 흩어졌다 모이므로 콘텐츠 패딩을 뚫고 시트 폭만큼 펼친 뒤 가로로만 잘라낸다.
          -mt-1은 시트 상단 패딩을 상쇄하고, 하단 패딩은 회색 영역과 고정 CTA 사이를 7.5px로 유지한다 */}
      <div className="relative -mx-5 -mt-1 flex w-[calc(100%+2.5rem)] flex-1 flex-col overflow-x-clip px-5 pb-[calc(103.5px+env(safe-area-inset-bottom))]">
        <motion.div
          className="mb-[6.5px] flex h-[91px] shrink-0 flex-col gap-1 [font-family:var(--font-family-a2-z)] [letter-spacing:var(--letter-spacing-default)]"
          animate={{ opacity: opened ? 0 : 1 }}
          transition={EXIT_HEADER_TRANSITION}>
          <p className="text-semantic-text-quaternary text-[17px] [line-height:var(--line-height-default)] font-medium">
            생일 축하해요 지유님!
          </p>
          <p className="text-semantic-text-strong text-2xl [line-height:var(--line-height-default)] font-semibold">
            총 <span className="text-semantic-fill-brand">{count}</span>개의 메세지가
            <br />
            도착했어요!
          </p>
        </motion.div>
        {/* Title과 CTA 사이를 채우되, 카드 스택이 518px까지라 그 이상 길어지지 않고 387px 아래로는 줄지 않는다 */}
        <div ref={backgroundRef} className="relative max-h-[518px] min-h-[387px] w-full flex-1">
          {/* 배경만 따로 사라져야 해서 카드의 부모가 아닌 형제로 둔다 */}
          <motion.div
            className="from-base-gray-100/0 to-base-gray-100/50 absolute inset-0 rounded-2xl bg-gradient-to-b from-[5.297%] to-[84.755%]"
            animate={{ opacity: opened ? 0 : 1 }}
            transition={EXIT_BACKGROUND_TRANSITION}
          />
          {/* 정렬된 편지지는 배경 영역 안에서 잘린다. 퇴장 때도 유지해 카드가 배경 아래 경계에 가려지며 내려간다 */}
          <motion.button
            type="button"
            aria-label="편지지 크게 보기"
            disabled={opened}
            onClick={handleOpen}
            className="focus-visible:outline-semantic-fill-brand absolute inset-0 rounded-2xl focus-visible:outline-2"
            initial={{ clipPath: CARD_CLIP_OPEN }}
            animate={{ clipPath: CARD_CLIP_CLOSED }}
            transition={CARD_CLIP_CLOSE_TRANSITION}>
            {/* 카드 모션 좌표의 기준점(배경 상단에서 233px 아래 가운데) */}
            <div className="absolute top-[233px] left-1/2 size-0">
              {getVisibleCards(count).map((card, index) => (
                <RollingPaperCard
                  key={slots[index]}
                  card={card}
                  letter={DUMMY_LETTERS[index]}
                  exiting={opened}
                />
              ))}
            </div>
          </motion.button>
          <motion.p
            className="from-semantic-background-default/70 to-semantic-background-default/0 text-semantic-text-secondary absolute bottom-[12.5px] left-1/2 z-20 -translate-x-1/2 rounded-full bg-gradient-to-b px-2.5 py-1.5 text-center [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-label-x-small-weak)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: opened ? 0 : 1 }}
            transition={opened ? EXIT_HINT_TRANSITION : HINT_ENTER_TRANSITION}>
            클릭 시, 크게 볼 수 있어요
          </motion.p>
        </div>
      </div>
      <BottomCTA className={cn(EXIT_CTA_CLASS, opened && EXIT_CTA_HIDDEN_CLASS)}>
        <Button
          color="brand"
          size="xlarge"
          onClick={() => router.push(`/funding/${fundingId}/result`)}>
          선물 받으러 가기
        </Button>
      </BottomCTA>
    </OpenSheet>
  );
}
