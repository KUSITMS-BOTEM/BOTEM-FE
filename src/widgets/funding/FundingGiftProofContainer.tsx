"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import ErrorView from "@/components/ErrorView";
import { useFundingDetailQuery } from "@/hooks/queries/funding/useFundingDetailQuery";
import FundingGiftProofView from "@/widgets/funding/FundingGiftProofView";
import FundingGiftProofViewSkeleton from "@/widgets/funding/skeleton/FundingGiftProofViewSkeleton";

type FundingGiftProofContainerProps = {
  shareKey: string;
  isLoggedIn: boolean;
};

export default function FundingGiftProofContainer({
  shareKey,
  isLoggedIn,
}: FundingGiftProofContainerProps) {
  const router = useRouter();
  const { data, isError, isFetching, refetch } = useFundingDetailQuery(shareKey, isLoggedIn);
  const giftVerification = data?.giftVerification;
  const sharePath = `/share/${shareKey}`;
  // 아직 선물 인증 전인 펀딩은 결과가 없으니 펀딩 상세로 보낸다.
  // 인증 직후 개설자는 인증 전에 받아 둔 캐시가 남아 있을 수 있어, 다시 받는 중에는 판단하지 않는다
  const isUnverified = data !== undefined && !giftVerification && !isFetching;

  useEffect(() => {
    if (isUnverified) router.replace(sharePath);
  }, [isUnverified, router, sharePath]);

  if (isError)
    return <ErrorView onRetry={() => void refetch()} onClose={() => router.replace("/")} />;
  if (!data || !giftVerification) return <FundingGiftProofViewSkeleton />;

  return (
    <FundingGiftProofView
      imageUrl={giftVerification.imageUrl}
      contributorCount={data.participantCount}
      productName={data.product.name}
      isLoggedIn={isLoggedIn}
    />
  );
}
