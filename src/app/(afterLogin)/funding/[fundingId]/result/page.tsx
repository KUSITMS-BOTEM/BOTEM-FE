import FundingResultContainer from "@/widgets/funding/FundingResultContainer";

type FundingResultPageProps = {
  params: Promise<{ fundingId: string }>;
};

export default async function FundingResultPage({ params }: FundingResultPageProps) {
  const { fundingId } = await params;

  return <FundingResultContainer fundingId={fundingId} />;
}
