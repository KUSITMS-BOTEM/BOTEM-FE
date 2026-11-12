"use client";

import { useState } from "react";

import IconShare from "@/assets/icons/icon-share.svg?react";
import IconButton from "@/components/IconButton";
import OpenSheet from "@/components/OpenSheet";
import RollingPaperCard from "@/widgets/rolling-paper/RollingPaperCard";
import { getVisiblePoses, getVisibleSlots } from "@/widgets/rolling-paper/rollingPaperMotion";

type RollingPaperContainerProps = {
  count: number;
};

export default function RollingPaperContainer({ count }: RollingPaperContainerProps) {
  const [open, setOpen] = useState(true);
  const slots = getVisibleSlots(count);

  return (
    <OpenSheet open={open} title="" onClose={() => setOpen(false)}>
      {/* 카드가 시트 좌우 끝까지 흩어졌다 모이므로 콘텐츠 패딩을 뚫고 시트 폭만큼 펼친 뒤 가로로만 잘라낸다 */}
      <div className="relative -mx-5 w-[calc(100%+2.5rem)] overflow-x-clip px-5 pb-[65px]">
        <div className="mb-[21px] flex h-[90px] flex-col gap-1 [font-family:var(--font-family-a2-z)] [letter-spacing:var(--letter-spacing-default)]">
          <p className="text-semantic-text-quaternary text-[17px] [line-height:var(--line-height-default)] font-medium">
            생일 축하해요 지유님!
          </p>
          <p className="text-semantic-text-strong text-2xl [line-height:var(--line-height-default)] font-semibold">
            총 <span className="text-semantic-fill-brand">{count}</span>개의 메세지가
            <br />
            도착했어요!
          </p>
        </div>
        <div className="from-base-gray-100/0 to-base-gray-100 relative h-[440px] w-full rounded-2xl bg-gradient-to-b">
          {getVisiblePoses(count).map((poses, index) => (
            <RollingPaperCard key={slots[index]} poses={poses} />
          ))}
        </div>
        <p className="from-semantic-background-default/70 to-semantic-background-default/0 text-semantic-text-secondary absolute top-[calc(90px+21px+440px+10px)] left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-b px-2.5 py-1.5 text-center [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-label-x-small-weak)]">
          클릭 시, 크게 볼 수 있어요
        </p>
        <IconButton
          size="xlarge"
          icon={<IconShare />}
          aria-label="공유"
          className="bg-semantic-fill-default/70 absolute top-[calc(90px+21px+440px)] right-[21px] shadow-[0px_4px_16px_0px_var(--color-semantic-shadow-weak)]"
        />
      </div>
    </OpenSheet>
  );
}
