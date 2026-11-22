"use client";

import { useRouter } from "next/navigation";

import ErrorView from "@/components/ErrorView";
import { useSurpriseRevealQuery } from "@/hooks/queries/funding/useSurpriseRevealQuery";
import { ApiError } from "@/types/api";
import FundingLockedView from "@/widgets/funding/FundingLockedView";
import SurpriseDetailView from "@/widgets/funding/SurpriseDetailView";
import SurpriseDetailViewSkeleton from "@/widgets/funding/skeleton/SurpriseDetailViewSkeleton";

type SurpriseDetailContainerProps = {
  fundingId: string;
};

// 받는 사람이 공개 전에 조회할 때 서버가 주는 코드
const SURPRISE_LOCKED = "FUNDING_046";

export default function SurpriseDetailContainer({ fundingId }: SurpriseDetailContainerProps) {
  const router = useRouter();
  const { data, error, isError, isSuccess, refetch } = useSurpriseRevealQuery(Number(fundingId));

  if (data) return <SurpriseDetailView surprise={data} onBack={() => router.back()} />;
  if (isError && error instanceof ApiError && error.code === SURPRISE_LOCKED) {
    return <FundingLockedView />;
  }
  // 성공했는데 data가 비어 온 경우도 보여줄 값이 없으니 실패와 같이 재시도를 안내한다
  if (isError || isSuccess) {
    return <ErrorView onRetry={() => void refetch()} onClose={() => router.back()} />;
  }
  return <SurpriseDetailViewSkeleton />;
}
