"use client";

import { useEffect, useRef, useState } from "react";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import OpenSheet from "@/components/OpenSheet";
import Title from "@/components/Title";
import ToastMessage from "@/components/ToastMessage";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { usePreparedImageSave } from "@/hooks/usePreparedImageSave";
import type { FundingWish } from "@/types/funding/funding";
import { cn } from "@/utils/cn";
import FundingShareCard from "@/widgets/funding/FundingShareCard";
import type { FundingInfoValues } from "@/widgets/funding/FundingInfoStep";
import IconShare from "@/assets/icons/icon-share.svg?react";

const SAVE_FAIL_TOAST_MS = 2000;

type FundingOpenCompleteSheetProps = {
  open: boolean;
  wish: FundingWish;
  info: Pick<FundingInfoValues, "targetAmount" | "deadline">;
  shareKey: string;
  onClose: () => void;
  className?: string;
} &
  // 친구 몰래 연 직후 안내
  (
    | { variant: "surprise"; recipientName: string }
    // 펀딩 상세 더보기에서 공유 카드를 다시 받을 때. 카드 제목은 펀딩 제목으로 만든다
    | {
        variant: "funding";
        cardTitle: string;
        /** 카드에 보여줄 달성률(%) */
        progress?: number;
      }
  );

export default function FundingOpenCompleteSheet({
  open,
  wish,
  info,
  onClose,
  className,
  ...props
}: FundingOpenCompleteSheetProps) {
  const { data: profile } = useMyProfileQuery();
  const isSurprise = props.variant === "surprise";
  const cardTitle =
    props.variant === "surprise" ? `${props.recipientName}의\n생일 펀딩` : props.cardTitle;
  const cardRef = useRef<HTMLDivElement>(null);
  const openerName = profile?.name ?? "내";
  const saveImage = usePreparedImageSave(cardRef, `${cardTitle}-공유-카드.png`, {
    enabled: open,
    // 시트가 열린 채 재조회로 카드 값이 바뀌면 저장 이미지도 다시 만든다
    contentKey: JSON.stringify([
      openerName,
      wish.productImageUrl,
      wish.productName,
      info.targetAmount,
      info.deadline,
      props.variant === "funding" ? props.progress : null,
    ]),
  });
  const [saveFailed, setSaveFailed] = useState(false);
  const failTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(failTimerRef.current), []);

  const handleSave = async () => {
    try {
      await saveImage();
    } catch {
      setSaveFailed(true);
      clearTimeout(failTimerRef.current);
      failTimerRef.current = setTimeout(() => setSaveFailed(false), SAVE_FAIL_TOAST_MS);
    }
  };

  return (
    <OpenSheet
      open={open}
      title={isSurprise ? "" : "공유 카드 다시 받기"}
      ariaLabel="서프라이즈 시작"
      closeType={isSurprise ? undefined : "close-left"}
      headerAction={
        !isSurprise && (
          <IconButton
            size="xlarge"
            icon={<IconShare />}
            aria-label="공유 카드 저장"
            onClick={handleSave}
          />
        )
      }
      onClose={onClose}
      className={className}>
      {props.variant === "surprise" && (
        <Title
          title="서프라이즈가 시작됐어요!"
          description={`쉿! ${props.recipientName}님에겐 비밀! 위시 알림도 몰래 켰어요`}
        />
      )}
      <div
        className={cn(
          "flex w-full flex-1 justify-center",
          isSurprise
            ? "items-center pb-[calc(7rem+env(safe-area-inset-bottom))]"
            : "items-start pt-2 pb-[env(safe-area-inset-bottom)]",
        )}>
        {/* 저장되는 이미지는 이 틀 그대로라 카드만 감싼다 */}
        <div ref={cardRef} className="shrink-0">
          <FundingShareCard
            size={isSurprise ? "medium" : "large"}
            openerName={openerName}
            title={cardTitle}
            productImageUrl={wish.productImageUrl}
            productName={wish.productName}
            targetAmount={Number(info.targetAmount)}
            deadline={info.deadline}
            showBadge={!isSurprise}
            progress={props.variant === "funding" ? props.progress : undefined}
          />
        </div>
      </div>
      {isSurprise && (
        <BottomCTA direction="horizontal">
          <Button color="brand" size="xlarge" onClick={handleSave}>
            공유하기
          </Button>
        </BottomCTA>
      )}
      <ToastMessage show={saveFailed} state={false} text="이미지를 저장하지 못했어요" />
    </OpenSheet>
  );
}
