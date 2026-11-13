import RollingPaperDetailContainer from "@/widgets/rolling-paper/RollingPaperDetailContainer";

type RollingPaperPageProps = {
  searchParams: Promise<{ count?: string }>;
};

export default async function RollingPaperPage({ searchParams }: RollingPaperPageProps) {
  // TODO(API): 롤링페이퍼 조회 API가 나오면 params.rollingPaperId로 편지지 개수를 받아온다. 지금은 목록에서 넘긴 count 쿼리를 쓴다
  const { count } = await searchParams;
  // 값이 없거나 숫자가 아니면 5개로 본다
  const paperCount = Math.max(1, Number.parseInt(count ?? "", 10) || 5);

  return <RollingPaperDetailContainer count={paperCount} />;
}
