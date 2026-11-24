"use client";

import { useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";

import ErrorView from "@/components/ErrorView";
import { useChooseGiftMutation } from "@/hooks/mutations/funding/useChooseGiftMutation";
import { useSurpriseRevealQuery } from "@/hooks/queries/funding/useSurpriseRevealQuery";
import { useGiftChangeStore } from "@/store/giftChangeStore";
import { ApiError } from "@/types/api";
import { openPendingTab } from "@/utils/openPendingTab";
import FundingLockedView from "@/widgets/funding/FundingLockedView";
import SurpriseResultView from "@/widgets/funding/SurpriseResultView";
import SurpriseDetailViewSkeleton from "@/widgets/funding/skeleton/SurpriseDetailViewSkeleton";

// 공개 전에는 존재 여부를 숨기려고 서버가 404로 주는 코드
const SURPRISE_LOCKED = "FUNDING_016";

type SurpriseResultContainerProps = {
  fundingId: string;
};

export default function SurpriseResultContainer({ fundingId }: SurpriseResultContainerProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion() ?? false;
  const { data, error, isError, isSuccess, refetch } = useSurpriseRevealQuery(Number(fundingId));
  const chooseGiftMutation = useChooseGiftMutation(Number(fundingId));
  // 선물 확인을 떠나면 다른 선물 고르기에서 기억해 둔 기존 선물도 더는 필요 없다
  const goHome = () => {
    useGiftChangeStore.getState().clear();
    router.replace("/home");
  };
  // 쿠팡으로 가는 순간 선물을 정해야 선물 인증 대기로 바뀐다.
  // 응답 전에 화면을 떠나도 열어 둔 탭이 빈 채로 남지 않게 mutateAsync로 처리한다
  const handleBuy = async () => {
    const tab = openPendingTab();
    try {
      const choice = await chooseGiftMutation.mutateAsync();
      tab.navigate(choice?.productUrl);
    } catch {
      tab.close();
    }
  };

  if (data)
    return (
      <SurpriseResultView
        surprise={data}
        reduceMotion={reduceMotion}
        onClose={goHome}
        onBuy={handleBuy}
        buyPending={chooseGiftMutation.isPending}
        onChangeGift={() => router.push(`/surprised/${fundingId}/change-gift`)}
      />
    );
  if (isError && error instanceof ApiError && error.code === SURPRISE_LOCKED) {
    return <FundingLockedView />;
  }
  if (isError || isSuccess) return <ErrorView onRetry={() => void refetch()} onClose={goHome} />;
  return <SurpriseDetailViewSkeleton />;
}
