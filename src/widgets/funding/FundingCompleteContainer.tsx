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
    return { amount, giverName: letter?.name ?? "", hasLetter: letter !== null };
  });

  // 새로고침으로 보태기 플로우 입력값이 사라졌으면 보낸 사람을 알 수 없어 공유 페이지로 돌려보낸다
  useEffect(() => {
    if (!contribution.hasLetter) router.replace(`/share/${shareKey}`);
  }, [contribution.hasLetter, router, shareKey]);

  // 완료 페이지를 떠나면 보태기 플로우의 비밀번호 등 입력값을 메모리에서 지운다
  useEffect(() => () => useFundingContributionStore.getState().reset(), []);

  if (isError)
    return (
      <ErrorView
        onRetry={() => void refetch()}
        onClose={() => router.replace(`/share/${shareKey}`)}
      />
    );
  if (!data || !contribution.hasLetter) return <FundingDetailViewSkeleton />;

  return (
    <FundingCompleteView
      shareKey={shareKey}
      funding={toFundingCompleteData(data, contribution)}
      isMessageOnly={contribution.amount === 0}
    />
  );
}
