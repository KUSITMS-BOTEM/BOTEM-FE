import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { parseShareMemberIntent, SHARE_MEMBER_PARAM } from "@/utils/funding/shareMemberIntent";
import FundingShareContainer from "@/widgets/funding/FundingShareContainer";

type FundingSharePageProps = {
  params: Promise<{ fundingId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// TODO(API): 펀딩 조회 API가 내려주는 개설자 여부로 교체한다. 판별 수단이 없어 지금은 항상 true라 로그인한 사용자는 모두 개설자로 본다
const isFundingHost = async () => true;

export default async function FundingSharePage({ params, searchParams }: FundingSharePageProps) {
  const { fundingId } = await params;
  const memberIntent = parseShareMemberIntent((await searchParams)[SHARE_MEMBER_PARAM]);
  // 참여 회원은 share에 머물고, 로그인한 개설자만 기존 펀딩 화면으로 보낸다
  const isLoggedIn = (await cookies()).get("isLoggedIn")?.value === "true";
  if (isLoggedIn && (await isFundingHost())) redirect(`/funding/${fundingId}`);
  // TODO(API): 비회원 펀딩 공개 조회 API가 나오면 여기서 서버 prefetch(server.ts 공개 GET)를 한다. generateMetadata도 같은 응답으로 카톡 OG 미리보기(진행률·상품 이미지)를 만든다

  return (
    <FundingShareContainer
      fundingId={fundingId}
      memberIntent={memberIntent}
      isLoggedIn={isLoggedIn}
    />
  );
}
