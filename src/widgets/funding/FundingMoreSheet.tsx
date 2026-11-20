"use client";

import Asset from "@/components/Asset";
import BottomSheet from "@/components/BottomSheet";
import InfoBox from "@/components/InfoBox";
import List from "@/components/List";
import IconRight from "@/assets/icons/icon-right.svg?react";

type FundingMoreSheetProps = {
  open: boolean;
  // 이미 한 번 연장한 펀딩이면 더 연장할 수 없다는 안내로 바꾼다
  extended: boolean;
  // 서버가 지금 할 수 없다고 내려준 메뉴는 숨긴다 (예: 이미 마감된 펀딩의 조기 마감)
  canReissueShareCard?: boolean;
  canCloseEarly?: boolean;
  onClose: () => void;
  onReissueShareCardClick: () => void;
  onCloseEarlyClick: () => void;
};

const rightIcon = (
  <Asset icon={<IconRight aria-hidden />} size="small" className="text-semantic-icon-default" />
);

export default function FundingMoreSheet({
  open,
  canReissueShareCard = true,
  canCloseEarly = true,
  extended,
  onClose,
  onReissueShareCardClick,
  onCloseEarlyClick,
}: FundingMoreSheetProps) {
  return (
    <BottomSheet open={open} title="더보기" height="auto" onClose={onClose}>
      <div className="flex w-full flex-col gap-6 pb-8">
        <ul className="flex w-full flex-col">
          {canReissueShareCard && (
            <li>
              <List
                title="공유 카드 다시 받기"
                right={rightIcon}
                onClick={onReissueShareCardClick}
              />
            </li>
          )}
          {canCloseEarly && (
            <li>
              <List
                title="조기 마감하기"
                description="지금까지 모인 만큼으로 마감해요"
                right={rightIcon}
                onClick={onCloseEarlyClick}
              />
            </li>
          )}
        </ul>
        <InfoBox
          text={
            extended
              ? "마감일은 한 번만 연장할 수 있어요"
              : "마감일이 지나면 한 번 더 연장할 수 있어요"
          }
        />
      </div>
    </BottomSheet>
  );
}
