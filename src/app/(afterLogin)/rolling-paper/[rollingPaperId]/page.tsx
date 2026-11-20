import RollingPaperDetailContainer from "@/widgets/rolling-paper/RollingPaperDetailContainer";

type RollingPaperPageProps = {
  params: Promise<{ rollingPaperId: string }>;
};

export default async function RollingPaperPage({ params }: RollingPaperPageProps) {
  const { rollingPaperId } = await params;

  return <RollingPaperDetailContainer rollingPaperId={rollingPaperId} />;
}
