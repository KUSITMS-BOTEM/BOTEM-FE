"use client";

import { useRouter } from "next/navigation";

import FundingDetailView from "@/widgets/funding/FundingDetailView";
import FundingLockedView from "@/widgets/funding/FundingLockedView";

type FundingDetailContainerProps = {
  fundingId: string;
  // 서프라이즈를 연 친구. 뒤로가기로 그 친구 프로필에 돌아간다
  friendId?: string;
};

type ViewerRole = "recipient" | "host" | "guest";

// TODO(API): 펀딩 조회 API가 생기면 응답의 viewer 역할·공개 시각으로 바꾼다. 잠금 화면을 확인하려면 임시로 "recipient"로 바꾼다
const MOCK_VIEWER_ROLE = "guest" as ViewerRole;
const MOCK_REVEAL_DATE_LABEL = "10월 13일 0시";

export default function FundingDetailContainer({
  fundingId,
  friendId,
}: FundingDetailContainerProps) {
  const router = useRouter();
  // 개설 직후 이동만 friendId를 달고 들어오므로 그때만 개설자로 본다
  const role: ViewerRole = friendId ? "host" : MOCK_VIEWER_ROLE;

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
