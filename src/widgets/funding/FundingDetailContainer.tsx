"use client";

import { useRouter } from "next/navigation";

import FundingDetailView from "@/widgets/funding/FundingDetailView";

type FundingDetailContainerProps = {
  fundingId: string;
  // 서프라이즈를 연 친구. 뒤로가기로 그 친구 프로필에 돌아간다
  friendId?: string;
};

// TODO(API): 펀딩 조회 API가 생기면 응답의 type·친구 id로 variant와 뒤로가기 대상을 정한다
export default function FundingDetailContainer({
  fundingId,
  friendId,
}: FundingDetailContainerProps) {
  const router = useRouter();

  return (
    <FundingDetailView
      fundingId={fundingId}
      variant="surprise"
      onBack={() => (friendId ? router.push(`/friends/${friendId}`) : router.back())}
    />
  );
}
