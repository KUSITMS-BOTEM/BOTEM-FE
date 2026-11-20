"use client";

import { useRouter } from "next/navigation";

import { useExtendFundingMutation } from "@/hooks/mutations/funding/useExtendFundingMutation";
import { useFundingManagementQuery } from "@/hooks/queries/funding/useFundingManagementQuery";
import { useFundingExtendToastStore } from "@/store/fundingExtendToastStore";
import { useGiftChangeStore } from "@/store/giftChangeStore";
import FundingExtendSheet from "@/widgets/funding/FundingExtendSheet";

type FundingExtendFlowProps = {
  fundingId: number;
  open: boolean;
  collectedAmount: number;
  onClose: () => void;
};

// 결과 확인 화면들(팡 빈 화면·선물 확인)에서 연장하면 펀딩이 다시 진행 중이 되므로 펀딩 상세로 돌아가 토스트를 띄운다
export default function FundingExtendFlow({
  fundingId,
  open,
  collectedAmount,
  onClose,
}: FundingExtendFlowProps) {
  const router = useRouter();
  const { data: management } = useFundingManagementQuery(fundingId);
  const extendMutation = useExtendFundingMutation(fundingId);

  // 마감일을 모르면 연장 가능 범위를 계산할 수 없어 시트를 열지 않는다
  if (!management) return null;

  const handleExtend = (newDeadline: string) => {
    extendMutation.mutate(newDeadline, {
      onSuccess: () => {
        useGiftChangeStore.getState().clear();
        useFundingExtendToastStore.getState().mark();
        router.replace(`/funding/${fundingId}`);
      },
    });
  };

  return (
    <FundingExtendSheet
      open={open}
      collectedAmount={collectedAmount}
      // 응답은 "YYYY-MM-DDTHH:mm:ss"라 시트가 받는 날짜 부분만 넘긴다
      currentDeadline={management.deadline.slice(0, 10)}
      pending={extendMutation.isPending}
      onExtend={handleExtend}
      onClose={onClose}
    />
  );
}
