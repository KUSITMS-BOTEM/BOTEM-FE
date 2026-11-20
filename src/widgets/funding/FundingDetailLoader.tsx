"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import ErrorView from "@/components/ErrorView";
import { usePendingContributionItemsQuery } from "@/hooks/queries/contribution/usePendingContributionItemsQuery";
import { useFundingDetailQuery } from "@/hooks/queries/funding/useFundingDetailQuery";
import { useFundingManagementQuery } from "@/hooks/queries/funding/useFundingManagementQuery";
import type { ShareMemberIntent } from "@/utils/funding/shareMemberIntent";
import FundingDetailView from "@/widgets/funding/FundingDetailView";
import FundingDetailViewSkeleton from "@/widgets/funding/skeleton/FundingDetailViewSkeleton";

type FundingDetailLoaderProps = {
  fundingId: string;
  variant?: "guest" | "surprise" | "owner";
  onBack?: () => void;
  memberIntent?: ShareMemberIntent;
  isLoggedIn?: boolean;
};

export default function FundingDetailLoader({
  fundingId,
  variant = "guest",
  isLoggedIn = false,
  ...viewProps
}: FundingDetailLoaderProps) {
  const router = useRouter();
  // 회원은 토큰을 붙여 조회해야 개설자 여부(ownerPreview)를 알 수 있다
  const asMember = isLoggedIn || variant !== "guest";
  const { data, isError, isFetchedAfterMount, refetch } = useFundingDetailQuery(
    Number(fundingId),
    asMember,
  );
  // 받은 입금을 확인하는 개설자 화면만 관리 정보와 확인 대기 목록이 필요하다
  const isHost = variant !== "guest";
  const management = useFundingManagementQuery(Number(fundingId), isHost);
  const pending = usePendingContributionItemsQuery(Number(fundingId), isHost);
  // 서버가 받아 둔 값은 토큰 없이 조회한 것이라, 회원은 마운트 뒤 재조회가 끝나야 개설자 여부가 확정된다
  const verifying = asMember && !isFetchedAfterMount;
  // 개설자가 공유 링크로 들어오면 기존 펀딩 화면으로 보낸다
  const isHostOnShare = variant === "guest" && data?.ownerPreview === true;

  useEffect(() => {
    if (isHostOnShare) router.replace(`/funding/${fundingId}`);
  }, [isHostOnShare, router, fundingId]);

  if (isError || management.isError || pending.isError) {
    const retry = () => {
      if (isError) void refetch();
      if (management.isError) void management.refetch();
      if (pending.isError) void pending.refetch();
    };
    return <ErrorView onRetry={retry} onClose={() => router.replace("/")} />;
  }
  if (!data || verifying || isHostOnShare) return <FundingDetailViewSkeleton />;
  if (isHost && (!management.data || !pending.data)) return <FundingDetailViewSkeleton />;

  return (
    <FundingDetailView
      fundingId={fundingId}
      variant={variant}
      isLoggedIn={isLoggedIn}
      detail={data}
      management={management.data ?? undefined}
      pendingItems={pending.data?.contributions}
      {...viewProps}
    />
  );
}
