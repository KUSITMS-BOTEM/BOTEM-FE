"use client";

import { useState } from "react";

import IconShare from "@/assets/icons/icon-share.svg?react";
import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import OpenSheet from "@/components/OpenSheet";
import RollingPaperCard from "@/widgets/rolling-paper/RollingPaperCard";
import { getVisibleCards, getVisibleSlots } from "@/widgets/rolling-paper/rollingPaperMotion";

type RollingPaperContainerProps = {
  count: number;
};

export default function RollingPaperContainer({ count }: RollingPaperContainerProps) {
  const [open, setOpen] = useState(true);
  const slots = getVisibleSlots(count);

  return (
    <OpenSheet
      open={open}
      title=""
      onClose={() => setOpen(false)}
      headerAction={<IconButton size="large" icon={<IconShare />} aria-label="공유" />}>
      {/* 카드가 시트 좌우 끝까지 흩어졌다 모이므로 콘텐츠 패딩을 뚫고 시트 폭만큼 펼친 뒤 가로로만 잘라낸다 */}
      <div className="relative -mx-5 w-[calc(100%+2.5rem)] overflow-x-clip px-5 pb-28">
        <div className="mb-[7px] flex h-[91px] flex-col gap-1 [font-family:var(--font-family-a2-z)] [letter-spacing:var(--letter-spacing-default)]">
          <p className="text-semantic-text-quaternary text-[17px] [line-height:var(--line-height-default)] font-medium">
            생일 축하해요 지유님!
          </p>
          <p className="text-semantic-text-strong text-2xl [line-height:var(--line-height-default)] font-semibold">
            총 <span className="text-semantic-fill-brand">{count}</span>개의 메세지가
            <br />
            도착했어요!
          </p>
        </div>
        <div className="from-base-gray-100/0 to-base-gray-100 relative h-[387px] w-full rounded-2xl bg-gradient-to-b">
          {/* 카드보다 먼저 그려야 편지지가 문구를 덮는다 */}
          <p className="from-semantic-background-default/70 to-semantic-background-default/0 text-semantic-text-secondary absolute top-[357px] left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-b px-2.5 py-1.5 text-center [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-label-x-small-weak)]">
            클릭 시, 크게 볼 수 있어요
          </p>
          {/* 카드 모션 좌표의 기준점(배경 상단에서 233px 아래 가운데) */}
          <div className="absolute top-[233px] left-1/2 size-0">
            {getVisibleCards(count).map((card, index) => (
              <RollingPaperCard key={slots[index]} card={card} />
            ))}
          </div>
        </div>
      </div>
      <BottomCTA>
        <Button color="brand" size="xlarge">
          메시지 열어보기
        </Button>
      </BottomCTA>
    </OpenSheet>
  );
}
