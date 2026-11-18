"use client";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import OpenSheet from "@/components/OpenSheet";
import Title from "@/components/Title";
import ToastMessage from "@/components/ToastMessage";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { useShareLink } from "@/hooks/useShareLink";
import type { FundingWish } from "@/types/funding/funding";
import { cn } from "@/utils/cn";
import FundingShareCard from "@/widgets/funding/FundingShareCard";
import type { FundingInfoValues } from "@/widgets/funding/FundingInfoStep";

type FundingOpenCompleteSheetProps = {
  open: boolean;
  // surprise: 친구 몰래 연 직후 안내 / funding: 펀딩 상세에서 공유 카드를 다시 받을 때
  // TODO: "funding" variant는 일반 펀딩 개설 플로우에 연결할 때 사용한다. 아직 스토리·테스트에서만 쓰이고 라우트·위젯에는 연결돼 있지 않다
  variant: "surprise" | "funding";
  recipientName: string;
  wish: FundingWish;
  info: FundingInfoValues;
  /** funding variant에서 카드에 보여줄 달성률(%) */
  progress?: number;
  onClose: () => void;
  className?: string;
};

// TODO(API): 펀딩 생성 API 응답의 fundingId로 교체한다
export const MOCK_FUNDING_ID = "1";

export default function FundingOpenCompleteSheet({
  open,
  variant,
  recipientName,
  wish,
  info,
  progress,
  onClose,
  className,
}: FundingOpenCompleteSheetProps) {
  const { data: profile } = useMyProfileQuery();
  const { toast, share, copyLink } = useShareLink();
  const isSurprise = variant === "surprise";
  const shareUrl = () => `${window.location.origin}/share/${MOCK_FUNDING_ID}`;

  const handleShare = () =>
    share({
      title: isSurprise ? `${recipientName}님 서프라이즈 펀딩` : `${recipientName}님의 생일 펀딩`,
      url: shareUrl(),
    });

  return (
    <OpenSheet
      open={open}
      title={isSurprise ? "" : "공유 카드 다시 받기"}
      ariaLabel="서프라이즈 시작"
      onClose={onClose}
      className={className}>
      {isSurprise && (
        <Title
          title="서프라이즈가 시작됐어요!"
          description={`쉿! ${recipientName}님에겐 비밀! 위시 알림도 몰래 켰어요`}
        />
      )}
      <div
        className={cn(
          "flex w-full flex-1 justify-center",
          isSurprise
            ? "items-center pb-[calc(7rem+env(safe-area-inset-bottom))]"
            : "items-start pb-[calc(11.5rem+env(safe-area-inset-bottom))]",
        )}>
        <FundingShareCard
          openerName={profile?.name ?? "내"}
          title={`${recipientName}의\n생일 펀딩`}
          productImageUrl={wish.productImageUrl}
          productName={wish.productName}
          targetAmount={Number(info.targetAmount)}
          deadline={info.deadline}
          showBadge={!isSurprise}
          progress={isSurprise ? undefined : progress}
        />
      </div>
      <BottomCTA direction={isSurprise ? "horizontal" : "vertical"}>
        <Button color="brand" size="xlarge" onClick={handleShare}>
          공유하기
        </Button>
        {!isSurprise && (
          <Button color="neutral" variant="weak" size="xlarge" onClick={() => copyLink(shareUrl())}>
            링크 복사
          </Button>
        )}
      </BottomCTA>
      <ToastMessage
        show={toast !== null}
        state={toast === "success"}
        text={toast === "fail" ? "링크를 복사하지 못했어요" : "링크를 복사했어요"}
      />
    </OpenSheet>
  );
}
