import FundingShareContainer from "@/widgets/funding/FundingShareContainer";

type FundingSharePageProps = {
  params: Promise<{ fundingId: string }>;
};

export default async function FundingSharePage({ params }: FundingSharePageProps) {
  const { fundingId } = await params;
  // TODO(API): 비회원 펀딩 공개 조회 API가 나오면 여기서 서버 prefetch(server.ts 공개 GET)를 한다. generateMetadata도 같은 응답으로 카톡 OG 미리보기(진행률·상품 이미지)를 만든다

  return <FundingShareContainer fundingId={fundingId} />;
}
