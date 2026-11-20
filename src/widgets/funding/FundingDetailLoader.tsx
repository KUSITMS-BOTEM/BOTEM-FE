"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import ErrorView from "@/components/ErrorView";
import { useFundingDetailQuery } from "@/hooks/queries/funding/useFundingDetailQuery";
import type { ShareMemberIntent } from "@/utils/funding/shareMemberIntent";
import FundingDetailView from "@/widgets/funding/FundingDetailView";
import FundingDetailViewSkeleton from "@/widgets/funding/skeleton/FundingDetailViewSkeleton";

type FundingDetailLoaderProps = {
  shareKey: string;
  onBack?: () => void;
  memberIntent?: ShareMemberIntent;
  isLoggedIn?: boolean;
};

// 공유 링크로 열린 참여자(guest) 화면의 공개 상세 조회를 맡는다. 개설자 화면은 관리 상세를 따로 조회한다
export default function FundingDetailLoader({
  shareKey,
  isLoggedIn = false,
  ...viewProps
}: FundingDetailLoaderProps) {
  const router = useRouter();
  // 회원은 토큰을 붙여 조회해야 개설자 여부(ownerPreview)를 알 수 있다
  const { data, isError, isFetchedAfterMount, refetch } = useFundingDetailQuery(
    shareKey,
    isLoggedIn,
  );
  // 서버가 받아 둔 값은 토큰 없이 조회한 것이라, 회원은 마운트 뒤 재조회가 끝나야 개설자 여부가 확정된다
  const verifying = isLoggedIn && !isFetchedAfterMount;
  // 개설자가 공유 링크로 들어오면 기존 펀딩 화면으로 보낸다
  const isHostOnShare = data?.ownerPreview === true;

  useEffect(() => {
    if (isHostOnShare && data) router.replace(`/funding/${data.fundingId}`);
  }, [isHostOnShare, router, data]);

  if (isError)
    return <ErrorView onRetry={() => void refetch()} onClose={() => router.replace("/")} />;
  if (!data || verifying || isHostOnShare) return <FundingDetailViewSkeleton />;

  return (
    <FundingDetailView
      fundingId={String(data.fundingId)}
      isLoggedIn={isLoggedIn}
      detail={data}
      {...viewProps}
    />
  );
}
