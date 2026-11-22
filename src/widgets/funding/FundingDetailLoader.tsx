"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import ErrorView from "@/components/ErrorView";
import { useKakaoLoginUriMutation } from "@/hooks/mutations/auth/useKakaoLoginUriMutation";
import { useFundingDetailQuery } from "@/hooks/queries/funding/useFundingDetailQuery";
import { ApiError } from "@/types/api";
import { handleKakaoLoginClick } from "@/utils/auth/handleKakaoLoginClick";
import { formatRevealLabel } from "@/utils/funding/formatDeadline";
import type { ShareMemberIntent } from "@/utils/funding/shareMemberIntent";
import FundingDetailView from "@/widgets/funding/FundingDetailView";
import FundingLockedView from "@/widgets/funding/FundingLockedView";
import FundingDetailViewSkeleton from "@/widgets/funding/skeleton/FundingDetailViewSkeleton";

type FundingDetailLoaderProps = {
  shareKey: string;
  onBack?: () => void;
  memberIntent?: ShareMemberIntent;
  isLoggedIn?: boolean;
  // 서프라이즈 펀딩이면 넘긴다. 받는 사람의 403 응답에는 공개 시각이 없어 서버가 비로그인으로 받아 둔 값을 쓴다
  surprise?: { revealAt: string | null };
};

// 서프라이즈를 받는 사람이 로그인 상태로 아직 공개되지 않은 펀딩을 조회할 때 서버가 주는 코드
const SURPRISE_LOCKED = "FUNDING_046";

// 공유 링크로 열린 참여자(guest) 화면의 공개 상세 조회를 맡는다. 개설자 화면은 관리 상세를 따로 조회한다
export default function FundingDetailLoader({
  shareKey,
  isLoggedIn = false,
  surprise,
  ...viewProps
}: FundingDetailLoaderProps) {
  const router = useRouter();
  const { mutate: requestKakaoLogin } = useKakaoLoginUriMutation();
  // 비로그인 방문자는 받는 사람인지 알 수 없어, 서프라이즈는 로그인 전까지 내용을 조회하지 않고 잠가 둔다
  const needsLogin = surprise !== undefined && !isLoggedIn;
  // 회원은 토큰을 붙여 조회해야 개설자 여부(ownerPreview)를 알 수 있다
  const { data, error, isError, isFetchedAfterMount, refetch } = useFundingDetailQuery(
    shareKey,
    isLoggedIn,
    { enabled: !needsLogin, skipGlobalError: surprise !== undefined },
  );
  // 서버가 받아 둔 값은 토큰 없이 조회한 것이라, 회원은 마운트 뒤 재조회가 끝나야 개설자 여부가 확정된다
  const verifying = isLoggedIn && !isFetchedAfterMount;
  // 개설자가 공유 링크로 들어오면 기존 펀딩 화면으로 보낸다
  const isHostOnShare = data?.ownerPreview === true;

  useEffect(() => {
    if (isHostOnShare && data) router.replace(`/funding/${data.fundingId}`);
  }, [isHostOnShare, router, data]);

  if (needsLogin)
    return (
      <FundingLockedView
        onKakaoLogin={() =>
          handleKakaoLoginClick(requestKakaoLogin, `/share/${encodeURIComponent(shareKey)}`)
        }
      />
    );
  // 로그인한 받는 사람은 공개 전까지 내용을 볼 수 없다
  if (isError && error instanceof ApiError && error.code === SURPRISE_LOCKED)
    return (
      <FundingLockedView
        revealDateLabel={surprise?.revealAt ? formatRevealLabel(surprise.revealAt) : undefined}
      />
    );
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
