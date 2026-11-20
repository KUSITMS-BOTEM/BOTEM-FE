"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import ErrorView from "@/components/ErrorView";
import { useFundingDetailQuery } from "@/hooks/queries/funding/useFundingDetailQuery";
import { useFundingContributionStore } from "@/store/fundingContributionStore";
import { toFundingCompleteData } from "@/utils/funding/toFundingCompleteData";
import FundingCompleteView from "@/widgets/funding/FundingCompleteView";
import FundingDetailViewSkeleton from "@/widgets/funding/skeleton/FundingDetailViewSkeleton";

type FundingCompleteContainerProps = {
  shareKey: string;
  isLoggedIn?: boolean;
};

export default function FundingCompleteContainer({
  shareKey,
  isLoggedIn = false,
}: FundingCompleteContainerProps) {
  const router = useRouter();
  const { data, isError, refetch } = useFundingDetailQuery(shareKey, isLoggedIn);
  // 아래 cleanup의 reset이 StrictMode에서 먼저 돌 수 있어 첫 렌더 값을 붙잡아 둔다
  const [contribution] = useState(() => {
    const { amount, letter } = useFundingContributionStore.getState();
    return { amount, giverName: letter?.name ?? "" };
  });

  // 완료 페이지를 떠나면 보태기 플로우의 비밀번호 등 입력값을 메모리에서 지운다
  useEffect(() => () => useFundingContributionStore.getState().reset(), []);

  if (isError)
    return (
      <ErrorView
        onRetry={() => void refetch()}
        onClose={() => router.replace(`/share/${shareKey}`)}
      />
    );
  if (!data) return <FundingDetailViewSkeleton />;

  return (
    <FundingCompleteView
      shareKey={shareKey}
      funding={toFundingCompleteData(data, contribution)}
      isMessageOnly={contribution.amount === 0}
    />
  );
}
