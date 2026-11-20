"use client";

import { useRouter } from "next/navigation";

import { useFundingManagementQuery } from "@/hooks/queries/funding/useFundingManagementQuery";
import FundingDetailView from "@/widgets/funding/FundingDetailView";
import FundingLockedView from "@/widgets/funding/FundingLockedView";
import FundingProgressCardSkeleton from "@/widgets/funding/skeleton/FundingProgressCardSkeleton";
import HomeLoadError from "@/widgets/home/HomeLoadError";

type FundingDetailContainerProps = {
  fundingId: string;
  // 서프라이즈를 연 친구. 뒤로가기로 그 친구 프로필에 돌아간다
  friendId?: string;
};

// owner: 내 펀딩을 연 주인 본인
type ViewerRole = "recipient" | "host" | "guest" | "owner";

// TODO(API): 펀딩 조회 API가 생기면 응답의 viewer 역할·공개 시각으로 바꾼다. 잠금 화면을 확인하려면 임시로 "recipient", 참여자 화면은 "guest"로 바꾼다
const MOCK_VIEWER_ROLE = "owner" as ViewerRole;
const MOCK_REVEAL_DATE_LABEL = "10월 13일 0시";

export default function FundingDetailContainer({
  fundingId,
  friendId,
}: FundingDetailContainerProps) {
  const router = useRouter();
  // TODO(API): 지금은 쿼리 friendId만으로 개설자로 판정해 URL을 직접 붙이면 개설자·잠금 우회가 된다. 펀딩 조회 API가 생기면 서버가 내려주는 viewer 역할로 교체한다
  // 개설 직후 이동만 friendId를 달고 들어오므로 그때만 개설자로 본다
  const role: ViewerRole = friendId ? "host" : MOCK_VIEWER_ROLE;
  const ownerQuery = useFundingManagementQuery(Number(fundingId), {
    enabled: role === "owner",
  });

  if (role === "owner") {
    if (ownerQuery.data) {
      return (
        <FundingDetailView fundingId={fundingId} variant="owner" ownerDetail={ownerQuery.data} />
      );
    }
    // 성공했는데 data가 비어 온 경우도 보여줄 값이 없으니 실패와 같이 재시도를 안내한다
    if (ownerQuery.isError || ownerQuery.isSuccess) {
      return (
        <HomeLoadError
          message="펀딩 정보를 불러오지 못했어요"
          onRetry={() => ownerQuery.refetch()}
        />
      );
    }
    return (
      <main aria-busy className="flex min-h-dvh flex-col px-5 pt-[72px]">
        <FundingProgressCardSkeleton />
      </main>
    );
  }

  if (role === "recipient") return <FundingLockedView revealDateLabel={MOCK_REVEAL_DATE_LABEL} />;
  if (role === "guest") return <FundingDetailView fundingId={fundingId} variant="guest" />;

  return (
    <FundingDetailView
      fundingId={fundingId}
      variant="surprise"
      onBack={() => router.push(`/friends/${friendId}`)}
    />
  );
}
