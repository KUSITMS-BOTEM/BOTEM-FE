import SurpriseGiftContainer from "@/widgets/funding/SurpriseGiftContainer";

type SurpriseGiftPageProps = {
  params: Promise<{ fundingId: string }>;
};

export default async function SurpriseGiftPage({ params }: SurpriseGiftPageProps) {
  const { fundingId } = await params;

  return <SurpriseGiftContainer fundingId={fundingId} />;
}
