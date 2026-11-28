"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const isClosed =
    ownerQuery.data?.managementState === "CLOSED" ||
    ownerQuery.data?.managementState === "TARGET_REACHED";
  // 생일 펀딩의 롤링페이퍼는 개설자가 결과(팡)를 연 뒤에 공개된다
  // 조기 마감처럼 아직 결과를 열 수 없는 409(FUNDING_005)는 정상이라 안내·재시도 없이 버튼 문구로만 알린다(그 외 에러는 전역 안내)
  const resultQuery = useFundingResultQuery(Number(fundingId), variant === "owner" && isClosed, [
    "FUNDING_005",
  ]);
  // 서프라이즈 롤링페이퍼는 선물 준비를 마치고 공개 시각이 지난 뒤에야 서버가 내려준다. 시각은 진입 시점 기준으로 한 번만 잰다
  const [enteredAt] = useState(Date.now);
  const surprise = ownerQuery.data;
  const surpriseRollingPaperOpened = Boolean(
    surprise?.giftPreparedAt && surprise.revealAt && Date.parse(surprise.revealAt) <= enteredAt,
  );

  // 공유 링크를 새 탭으로 열면 되돌아갈 히스토리가 없다. 이때만 프로필(없으면 홈)로 보내되, push하면 이 화면이 히스토리에 남아 프로필에서 뒤로 갈 때 다시 돌아오므로 replace한다
  const handleBack = () => {
    if (window.history.length <= 1) router.replace(friendId ? `/friends/${friendId}` : "/home");
    else router.back();
  };

  if (ownerQuery.data) {
    return (
      <FundingDetailView
        fundingId={fundingId}
        variant={variant}
        ownerDetail={ownerQuery.data}
        rollingPaperOpened={
          variant === "surprise"
            ? surpriseRollingPaperOpened
            : Boolean(resultQuery.data?.resultOpenedAt)
        }
        rollingPaperLoading={resultQuery.isLoading}
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
