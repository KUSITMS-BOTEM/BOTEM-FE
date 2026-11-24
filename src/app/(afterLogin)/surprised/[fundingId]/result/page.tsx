import SurpriseResultContainer from "@/widgets/funding/SurpriseResultContainer";

type SurpriseResultPageProps = {
  params: Promise<{ fundingId: string }>;
};

export default async function SurpriseResultPage({ params }: SurpriseResultPageProps) {
  const { fundingId } = await params;

  return <SurpriseResultContainer fundingId={fundingId} />;
}
