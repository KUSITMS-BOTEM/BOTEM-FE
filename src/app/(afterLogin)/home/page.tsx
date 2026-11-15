import HomeContainer from "@/widgets/home/HomeContainer";
import RollingPaperContainer from "@/widgets/rolling-paper/RollingPaperContainer";

export default function HomePage() {
  return (
    <>
      <HomeContainer />
      {/* TEMP: 편지지 UI 확인용 임시 렌더입니다. 롤링페이퍼 진입 경로가 생기면 지우세요 */}
      <RollingPaperContainer rollingPaperId="1" count={5} />
    </>
  );
}
