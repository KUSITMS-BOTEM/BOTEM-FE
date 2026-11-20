"use client";

import { useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Button from "@/components/Button";
import LoadingAnimation from "@/components/LoadingAnimation";
import { useFundingManagementQuery } from "@/hooks/queries/funding/useFundingManagementQuery";
import { useFundingResultQuery } from "@/hooks/queries/funding/useFundingResultQuery";
import { useGiftChangeStore } from "@/store/giftChangeStore";
import type { FundingManagementResponse, FundingResultResponse } from "@/types/funding/funding";
import { isValidUrl } from "@/utils/isValidUrl";
import FundingExtendFlow from "@/widgets/funding/FundingExtendFlow";
import FundingResultView, { type FundingResult } from "@/widgets/funding/FundingResultView";

const TARGET_PERCENTAGE = 100;

// 금액·친구 목록은 결과 응답, 상품·연장 가능 여부는 관리 상세 응답을 쓴다 (상품을 바꿨으면 목표 금액과 상품 가격이 다를 수 있다)
const toFundingResult = (
  result: FundingResultResponse,
  management: FundingManagementResponse,
): FundingResult => ({
  goalAchieved: result.achievementPercentage >= TARGET_PERCENTAGE,
  collectedAmount: result.confirmedAmount,
  productName: management.product.name,
  productImage: management.product.imageUrl,
  productPrice: management.product.price,
  giftChanged: management.productChanged,
  canExtend: management.actions.canExtend,
  contributors: result.contributions.map(contribution => ({
    userId: contribution.contributionId,
    profileImageUrl: contribution.profileImageUrl ?? undefined,
  })),
});

type FundingResultContainerProps = {
  fundingId: string;
};

export default function FundingResultContainer({ fundingId }: FundingResultContainerProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion() ?? false;
  const [extendOpen, setExtendOpen] = useState(false);
  const resultQuery = useFundingResultQuery(Number(fundingId));
  const managementQuery = useFundingManagementQuery(Number(fundingId));

  if (resultQuery.isLoading || managementQuery.isLoading) {
    return (
      <div role="status" className="flex min-h-dvh items-center justify-center">
        <LoadingAnimation size="large" />
        <span className="sr-only">펀딩 결과를 불러오는 중이에요</span>
      </div>
    );
  }
  if (!resultQuery.data || !managementQuery.data) {
    const handleRetry = () => {
      if (!resultQuery.data) resultQuery.refetch();
      if (!managementQuery.data) managementQuery.refetch();
    };
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 text-center">
        <p className="text-semantic-text-secondary [font:var(--semantic-subtext-large)]">
          펀딩 결과를 불러오지 못했어요
        </p>
        <Button onClick={handleRetry}>다시 시도</Button>
      </main>
    );
  }

  const result = toFundingResult(resultQuery.data, managementQuery.data);
  const { url: productUrl } = managementQuery.data.product;
  const handleBuy = () => {
    if (!isValidUrl(productUrl)) return;
    window.open(productUrl, "_blank", "noopener,noreferrer");
  };
  // 선물 확인을 떠나면 다른 선물 고르기에서 기억해 둔 기존 선물도 더는 필요 없다
  const handleClose = () => {
    useGiftChangeStore.getState().clear();
    router.replace("/home");
  };

  return (
    <>
      <FundingResultView
        result={result}
        reduceMotion={reduceMotion}
        onClose={handleClose}
        onBuy={handleBuy}
        onChangeGift={() => router.push(`/funding/${fundingId}/change-gift`)}
        onExtend={() => setExtendOpen(true)}
      />
      <FundingExtendFlow
        fundingId={Number(fundingId)}
        open={extendOpen}
        collectedAmount={result.collectedAmount}
        onClose={() => setExtendOpen(false)}
      />
    </>
  );
}
