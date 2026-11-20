import { cache } from "react";

import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { fundingServerService } from "@/apis/funding/fundingServerService";
import { fundingDetailQueryKey } from "@/hooks/queries/funding/useFundingDetailQuery";
import { ApiError } from "@/types/api";
import { parseShareMemberIntent, SHARE_MEMBER_PARAM } from "@/utils/funding/shareMemberIntent";
import FundingShareContainer from "@/widgets/funding/FundingShareContainer";

type FundingSharePageProps = {
  params: Promise<{ shareKey: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const FUNDING_NOT_FOUND = "FUNDING_002";

// generateMetadata와 페이지가 같은 요청을 한 번만 하도록 묶는다. 없는·취소된 펀딩은 404로 보낸다
const getFunding = cache(async (shareKey: string) => {
  try {
    const funding = await fundingServerService.getFundingDetail(shareKey);
    if (!funding) notFound();
    return funding;
  } catch (error) {
    if (error instanceof ApiError && error.code === FUNDING_NOT_FOUND) notFound();
    throw error;
  }
});

// 카톡 공유 미리보기용. 조회에 실패하면 기본 메타를 쓴다
export async function generateMetadata({ params }: FundingSharePageProps): Promise<Metadata> {
  try {
    const funding = await getFunding((await params).shareKey);
    const title = `${funding.celebrantName}님의 보탬`;
    const description = funding.story ?? `${funding.product.name} 펀딩에 함께 보태주세요`;
    return {
      title,
      description,
      openGraph: { title, description, images: [funding.product.imageUrl] },
    };
  } catch {
    return {};
  }
}

export default async function FundingSharePage({ params, searchParams }: FundingSharePageProps) {
  const { shareKey } = await params;
  const memberIntent = parseShareMemberIntent((await searchParams)[SHARE_MEMBER_PARAM]);
  // 참여 회원은 share에 머문다. 개설자는 토큰이 있어야 알 수 있어, 클라이언트가 재조회한 ownerPreview로 기존 펀딩 화면에 보낸다
  const isLoggedIn = (await cookies()).get("isLoggedIn")?.value === "true";
  const funding = await getFunding(shareKey);

  const queryClient = new QueryClient();
  queryClient.setQueryData(fundingDetailQueryKey(shareKey), funding);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FundingShareContainer
        shareKey={shareKey}
        memberIntent={memberIntent}
        isLoggedIn={isLoggedIn}
      />
    </HydrationBoundary>
  );
}
