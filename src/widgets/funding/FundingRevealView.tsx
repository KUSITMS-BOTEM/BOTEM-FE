import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import RevealMotion from "@/components/effects/RevealMotion";

const TARGET_PERCENTAGE = 100;

type FundingRevealViewProps = {
  contributorNames: string[];
  participantCount: number;
  confirmedAmount: number;
  achievementPercentage: number;
  isOpening: boolean;
  onOpenMessages: () => void;
};

// 마감된 펀딩을 열 때 친구 이름이 날아오는 펑 열기 화면. 생일 펀딩(개설자)과 서프라이즈(받는 사람)가 함께 쓴다
export default function FundingRevealView({
  contributorNames,
  participantCount,
  confirmedAmount,
  achievementPercentage,
  isOpening,
  onOpenMessages,
}: FundingRevealViewProps) {
  const amount = `${confirmedAmount.toLocaleString("ko-KR")}원이 모였어요`;
  const goalAchieved = achievementPercentage >= TARGET_PERCENTAGE;

  return (
    <>
      <main className="flex flex-1 flex-col items-center gap-6 px-5 pt-6 pb-32">
        <RevealMotion names={contributorNames} />
        <div className="flex flex-col items-center gap-2 text-center [letter-spacing:var(--letter-spacing-default)]">
          <h1 className="text-semantic-text-strong [font-family:var(--font-family-a2-z)] text-[22px] [line-height:var(--line-height-default)] font-semibold whitespace-pre-line">
            {`친구 ${participantCount}명이\n보탬을 보냈어요!`}
          </h1>
          <p className="text-semantic-text-tertiary [font:var(--semantic-subtext-large)]">
            {goalAchieved ? `${amount} · 목표 달성` : amount}
          </p>
        </div>
      </main>
      <BottomCTA>
        <Button
          color="brand"
          size="xlarge"
          disabled={isOpening}
          states={isOpening ? "loading" : "default"}
          onClick={onOpenMessages}>
          메시지 열어보기
        </Button>
      </BottomCTA>
    </>
  );
}
