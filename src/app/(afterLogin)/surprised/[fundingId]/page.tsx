import SurpriseDetailContainer from "@/widgets/funding/SurpriseDetailContainer";

type SurpriseDetailPageProps = {
  params: Promise<{ fundingId: string }>;
};

export default async function SurpriseDetailPage({ params }: SurpriseDetailPageProps) {
  const { fundingId } = await params;

  return <SurpriseDetailContainer fundingId={fundingId} />;
}
