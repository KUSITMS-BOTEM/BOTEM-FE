"use client";

import { useParams, useRouter } from "next/navigation";

import Button from "@/components/Button";
import Header from "@/components/Header";
import LoadingAnimation from "@/components/LoadingAnimation";
import { useCompleteGiftVerificationMutation } from "@/hooks/mutations/gift-verification/useCompleteGiftVerificationMutation";
import { useGiftVerificationTargetsQuery } from "@/hooks/queries/home/useGiftVerificationTargetsQuery";
import { getReceivedProductName } from "@/utils/home/giftVerificationTarget";
import FundingGiftVerifyView, {
  type GiftVerifySubmitValues,
} from "@/widgets/funding/FundingGiftVerifyView";
import IconClose from "@/assets/icons/icon-close.svg?react";

const HOME_PATH = "/home";

export default function FundingGiftVerifyContainer() {
  const router = useRouter();
  const { fundingId } = useParams<{ fundingId: string }>();
  const { data, isLoading, isError, refetch } = useGiftVerificationTargetsQuery();
  const { mutate, isPending, isSuccess } = useCompleteGiftVerificationMutation();
  const target = data?.targets.find(item => item.fundingId === Number(fundingId));
  const goHome = () => router.replace(HOME_PATH);

  const handleSubmit = ({ image, thankYouMessage }: GiftVerifySubmitValues) => {
    if (!target) return;
    mutate(
      {
        giftVerificationId: target.giftVerificationId,
        image,
        thankYouMessage,
        replacementProductName: target.replacementProductName,
      },
      // 감사 카드를 보내면 흐름이 끝나므로 홈으로 돌아간다
      { onSuccess: goHome },
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div role="status" className="flex flex-1 items-center justify-center">
          <LoadingAnimation size="large" />
          <span className="sr-only">인증할 선물을 불러오는 중이에요</span>
        </div>
      );
    }
    // 받아둔 목록이 있으면 백그라운드 재조회 실패로 작성 중인 사진·메시지를 날리지 않는다
    if (isError && !data) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-semantic-text-secondary [font:var(--semantic-subtext-large)]">
            인증할 선물을 불러오지 못했어요
          </p>
          <Button onClick={() => refetch()}>다시 시도</Button>
        </div>
      );
    }
    // 이미 인증을 마쳤거나 인증 대상이 아닌 펀딩으로 들어온 경우
    if (!target) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-semantic-text-secondary [font:var(--semantic-subtext-large)]">
            인증할 선물이 없어요
          </p>
          <Button onClick={goHome}>홈으로 가기</Button>
        </div>
      );
    }
    return (
      <FundingGiftVerifyView
        productName={getReceivedProductName(target)}
        productImageUrl={target.productImageUrl}
        // 성공 후 홈으로 넘어가는 동안 다시 눌러 이미 완료된 인증을 재요청하지 않도록 계속 잠근다
        isSubmitting={isPending || isSuccess}
        onSubmit={handleSubmit}
      />
    );
  };

  return (
    <main className="bg-semantic-background-default flex min-h-dvh flex-col">
      <h1 className="sr-only">선물 도착 인증</h1>
      <Header
        title="선물 도착 인증"
        rightItems={[{ icon: <IconClose />, ariaLabel: "닫기", onClick: goHome }]}
      />
      {renderContent()}
    </main>
  );
}
