import FundingCompleteContainer from "@/widgets/funding/FundingCompleteContainer";

type FundingCompletePageProps = {
  params: Promise<{ fundingId: string }>;
};

export default async function FundingCompletePage({ params }: FundingCompletePageProps) {
  const { fundingId } = await params;

  return <FundingCompleteContainer fundingId={fundingId} />;
}
