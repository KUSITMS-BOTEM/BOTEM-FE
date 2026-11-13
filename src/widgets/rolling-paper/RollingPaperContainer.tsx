"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import IconShare from "@/assets/icons/icon-share.svg?react";
import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import OpenSheet from "@/components/OpenSheet";
import { cn } from "@/utils/cn";
import RollingPaperCard from "@/widgets/rolling-paper/RollingPaperCard";
import {
  EXIT_BACKGROUND_TRANSITION,
  EXIT_CTA_CLASS,
  EXIT_GRAY_AREA_TARGET,
  EXIT_GRAY_AREA_TRANSITION,
  EXIT_CTA_HIDDEN_CLASS,
  EXIT_HEADER_TRANSITION,
  EXIT_HINT_TRANSITION,
  getVisibleCards,
  getVisibleSlots,
} from "@/widgets/rolling-paper/rollingPaperMotion";

type RollingPaperContainerProps = {
  count: number;
};

export default function RollingPaperContainer({ count }: RollingPaperContainerProps) {
  const [open, setOpen] = useState(true);
  const [opened, setOpened] = useState(false);
  const slots = getVisibleSlots(count);

  return (
    <OpenSheet
      open={open}
      title=""
      onClose={() => setOpen(false)}
      hideScrollbar
      headerAction={<IconButton size="large" icon={<IconShare />} aria-label="공유" />}>
      {/* 카드가 시트 좌우 끝까지 흩어졌다 모이므로 콘텐츠 패딩을 뚫고 시트 폭만큼 펼친 뒤 가로로만 잘라낸다 */}
      <div className="relative -mx-5 w-[calc(100%+2.5rem)] overflow-x-clip px-5 pb-28">
        <motion.div
          className="mb-[7px] flex h-[91px] flex-col gap-1 [font-family:var(--font-family-a2-z)] [letter-spacing:var(--letter-spacing-default)]"
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
        <div className="relative h-[387px] w-full">
          {/* 배경만 따로 사라져야 해서 카드의 부모가 아닌 형제로 둔다 */}
          <motion.div
            className="from-base-gray-100/0 to-base-gray-100 absolute inset-0 rounded-2xl bg-gradient-to-b"
            animate={{ opacity: opened ? 0 : 1 }}
            transition={EXIT_BACKGROUND_TRANSITION}
          />
          {/* 카드보다 먼저 그려야 편지지가 문구를 덮는다 */}
          <motion.p
            className="from-semantic-background-default/70 to-semantic-background-default/0 text-semantic-text-secondary absolute top-[357px] left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-b px-2.5 py-1.5 text-center [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-label-x-small-weak)]"
            animate={{ opacity: opened ? 0 : 1 }}
            transition={EXIT_HINT_TRANSITION}>
            클릭 시, 크게 볼 수 있어요
          </motion.p>
          {/* 카드 배경 크기에서 커져 화면을 덮는다. 도착 화면(내부 배경)이 없어 페이드아웃은 구현하지 않고 덮은 채로 둔다 */}
          <motion.div
            className="bg-base-gray-100 absolute inset-0 rounded-2xl opacity-0"
            animate={opened ? EXIT_GRAY_AREA_TARGET : undefined}
            transition={EXIT_GRAY_AREA_TRANSITION}
          />
          {/* 카드 모션 좌표의 기준점(배경 상단에서 233px 아래 가운데) */}
          <div className="absolute top-[233px] left-1/2 size-0">
            {getVisibleCards(count).map((card, index) => (
              <RollingPaperCard key={slots[index]} card={card} exiting={opened} />
            ))}
          </div>
        </div>
      </div>
      <BottomCTA className={cn(EXIT_CTA_CLASS, opened && EXIT_CTA_HIDDEN_CLASS)}>
        <Button color="brand" size="xlarge" onClick={() => setOpened(true)}>
          메시지 열어보기
        </Button>
      </BottomCTA>
    </OpenSheet>
  );
}
