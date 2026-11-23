import { cookies } from "next/headers";
import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { fundingDetailQueryKey } from "@/hooks/queries/funding/useFundingDetailQuery";
import { parseShareMemberIntent, SHARE_MEMBER_PARAM } from "@/utils/funding/shareMemberIntent";
import { getShareFunding } from "@/app/share/[shareKey]/getShareFunding";
import FundingShareContainer from "@/widgets/funding/FundingShareContainer";

type FundingSharePageProps = {
  params: Promise<{ shareKey: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// 카톡 공유 미리보기용. 조회에 실패하면 기본 메타를 쓴다
export async function generateMetadata({ params }: FundingSharePageProps): Promise<Metadata> {
  try {
    const funding = await getShareFunding((await params).shareKey);
    // 받는 사람이 카톡 미리보기로 상품·사연을 미리 보지 못하게 한다
    if (funding.type === "SURPRISE") {
      return {
        title: "서프라이즈가 도착했어요",
        description: "보탬에서 서프라이즈를 확인해 보세요",
      };
    }
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
  // 참여 회원은 share에 머문다. 개설자는 토큰이 있어야 알 수 있어, 클라이언트가 재조회한 ownerPreview로 기존 펀딩 화면에 보낸다
  const isLoggedIn = (await cookies()).get("isLoggedIn")?.value === "true";
  // 로그인하지 않은 방문자가 복귀 URL을 직접 열어도 회원 흐름으로 들어가지 못하게 한다
  const memberIntent = isLoggedIn
    ? parseShareMemberIntent((await searchParams)[SHARE_MEMBER_PARAM])
    : undefined;
  const funding = await getShareFunding(shareKey);

  const isSurprise = funding.type === "SURPRISE";
  const queryClient = new QueryClient();
  // 서프라이즈는 상품·사연이 HTML에 실리지 않게 hydrate하지 않는다. 공개 시각만 따로 넘긴다
  if (!isSurprise) queryClient.setQueryData(fundingDetailQueryKey(shareKey), funding);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FundingShareContainer
        shareKey={shareKey}
        memberIntent={memberIntent}
        isLoggedIn={isLoggedIn}
        surprise={isSurprise ? { revealAt: funding.revealAt } : undefined}
      />
    </HydrationBoundary>
  );
}
