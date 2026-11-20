import FundingCompleteContainer from "@/widgets/funding/FundingCompleteContainer";

type FundingCompletePageProps = {
  params: Promise<{ shareKey: string }>;
};

export default async function FundingCompletePage({ params }: FundingCompletePageProps) {
  const { shareKey } = await params;

  return <FundingCompleteContainer shareKey={shareKey} />;
}
