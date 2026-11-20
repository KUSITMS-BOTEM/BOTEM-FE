"use client";

import { useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Button from "@/components/Button";
import LoadingAnimation from "@/components/LoadingAnimation";
import { useFundingManagementQuery } from "@/hooks/queries/funding/useFundingManagementQuery";
import { useFundingResultQuery } from "@/hooks/queries/funding/useFundingResultQuery";
import type { FundingManagementResponse } from "@/types/funding/fundingManagement";
import type { FundingResultResponse } from "@/types/funding/fundingResult";
import { isValidUrl } from "@/utils/isValidUrl";
import FundingExtendSheet from "@/widgets/funding/FundingExtendSheet";
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

  return (
    <>
      <FundingResultView
        result={result}
        reduceMotion={reduceMotion}
        onClose={() => router.replace("/home")}
        onBuy={handleBuy}
        // TODO(API): change-gift 라우트가 아직 없다. 화면을 만들 때 fundingService.changeFundingProduct(PATCH /api/fundings/{id}/product)를 연결한다
        onChangeGift={() => router.push(`/funding/${fundingId}/change-gift`)}
        onExtend={() => setExtendOpen(true)}
      />
      <FundingExtendSheet
        open={extendOpen}
        collectedAmount={result.collectedAmount}
        // 응답은 "YYYY-MM-DDTHH:mm:ss"라 시트가 받는 날짜 부분만 넘긴다
        currentDeadline={managementQuery.data.deadline.slice(0, 10)}
        // TODO(API): fundingService.extendFunding(POST /api/fundings/{id}/extension)은 있다. mutation 훅을 만들어 연결하고 성공 시 결과·관리·홈 캐시를 무효화한다
        onExtend={() => setExtendOpen(false)}
        onClose={() => setExtendOpen(false)}
      />
    </>
  );
}
