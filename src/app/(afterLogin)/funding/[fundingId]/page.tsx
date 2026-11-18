import FundingDetailContainer from "@/widgets/funding/FundingDetailContainer";

type FundingDetailPageProps = {
  params: Promise<{ fundingId: string }>;
  searchParams: Promise<{ friendId?: string }>;
};

export default async function FundingDetailPage({ params, searchParams }: FundingDetailPageProps) {
  const { fundingId } = await params;
  const { friendId } = await searchParams;

  return <FundingDetailContainer fundingId={fundingId} friendId={friendId} />;
}
