import SurpriseRevealContainer from "@/widgets/funding/SurpriseRevealContainer";

type SurpriseRevealPageProps = {
  params: Promise<{ fundingId: string }>;
};

export default async function SurpriseRevealPage({ params }: SurpriseRevealPageProps) {
  const { fundingId } = await params;

  return <SurpriseRevealContainer fundingId={fundingId} />;
}
