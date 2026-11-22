"use client";

import { useRouter } from "next/navigation";

import { useFundingResultQuery } from "@/hooks/queries/funding/useFundingResultQuery";
import { useFundingManagementQuery } from "@/hooks/queries/funding/useFundingManagementQuery";
import FundingDetailView from "@/widgets/funding/FundingDetailView";
import FundingProgressCardSkeleton from "@/widgets/funding/skeleton/FundingProgressCardSkeleton";
import HomeLoadError from "@/widgets/home/HomeLoadError";

type FundingDetailContainerProps = {
  fundingId: string;
  // 서프라이즈를 연 친구. 뒤로가기로 그 친구 프로필에 돌아가는 목적지로만 쓴다
  friendId?: string;
};

export default function FundingDetailContainer({
  fundingId,
  friendId,
}: FundingDetailContainerProps) {
  const router = useRouter();
  const ownerQuery = useFundingManagementQuery(Number(fundingId));
  const variant = ownerQuery.data?.type === "SURPRISE" ? "surprise" : "owner";
  const isClosed = ownerQuery.data?.managementState === "CLOSED";
  // 생일 펀딩의 롤링페이퍼는 개설자가 결과(팡)를 연 뒤에 공개된다
  const resultQuery = useFundingResultQuery(Number(fundingId), variant === "owner" && isClosed);

  // push로 프로필에 가면 이 화면이 히스토리에 남아 프로필에서 뒤로 갈 때 다시 돌아온다. 되돌아갈 히스토리가 없을 때만 프로필로 보낸다
  const handleBack = () => {
    if (friendId && window.history.length <= 1) router.push(`/friends/${friendId}`);
    else router.back();
  };

  if (ownerQuery.data) {
    return (
      <FundingDetailView
        fundingId={fundingId}
        variant={variant}
        ownerDetail={ownerQuery.data}
        rollingPaperOpened={Boolean(resultQuery.data?.resultOpenedAt)}
        onBack={handleBack}
      />
    );
  }
  // 성공했는데 data가 비어 온 경우도 보여줄 값이 없으니 실패와 같이 재시도를 안내한다
  if (ownerQuery.isError || ownerQuery.isSuccess) {
    return (
      <HomeLoadError message="펀딩 정보를 불러오지 못했어요" onRetry={() => ownerQuery.refetch()} />
    );
  }
  return (
    <main aria-busy className="flex min-h-dvh flex-col px-5 pt-[72px]">
      <FundingProgressCardSkeleton />
    </main>
  );
}
