import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import EmptyIllustration from "@/components/effects/EmptyIllustration";

type FundingRevealEmptyViewProps = {
  onExtend?: () => void;
  onClose: () => void;
};

export default function FundingRevealEmptyView({ onExtend, onClose }: FundingRevealEmptyViewProps) {
  return (
    <>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-5 pb-48">
        <EmptyIllustration />
        <div className="flex flex-col items-center gap-2 text-center [letter-spacing:var(--letter-spacing-default)]">
          <h1 className="text-semantic-text-strong [font:var(--semantic-title-medium)]">
            이번엔 조용히 지나갔어요
          </h1>
          <p className="text-semantic-text-tertiary whitespace-pre-line [font:var(--semantic-label-small-weak)]">
            {"아직 아무도 보태지 않았어요.\n기간을 늘리고 한 번 더 공유해 볼까요?"}
          </p>
        </div>
      </main>
      <BottomCTA direction="vertical">
        <Button color="brand" size="xlarge" onClick={onExtend}>
          기간 연장하러 가기
        </Button>
        <Button color="neutral" variant="weak" size="xlarge" onClick={onClose}>
          닫기
        </Button>
      </BottomCTA>
    </>
  );
}
