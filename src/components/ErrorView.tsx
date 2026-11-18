import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import FloorShadow from "@/assets/images/error-floor-shadow.svg?react";

type ErrorViewProps = {
  onRetry: () => void;
  onClose: () => void;
};

export default function ErrorView({ onRetry, onClose }: ErrorViewProps) {
  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-5 pt-26">
      <div aria-hidden className="relative h-[200px] w-[320px]">
        <FloorShadow className="absolute top-[126px] left-[67px]" />
        {/* Figma 그라데이션 정지점이 0~100% 밖(131.7%)에 있어 보이는 구간만 환산한 값 */}
        <span className="absolute top-11 left-26 flex size-28 items-center justify-center rounded-full bg-[linear-gradient(to_bottom,#fffafa_50.989%,white_131.7%)]">
          <span className="text-semantic-icon-danger text-[52px] leading-none font-bold">!</span>
        </span>
      </div>
      <div className="flex flex-col items-center gap-2 text-center [letter-spacing:var(--letter-spacing-default)]">
        <h1 className="text-semantic-text-strong [font:var(--semantic-title-medium)]">
          잠시 문제가 생겼어요
        </h1>
        <p className="text-semantic-text-tertiary text-[14px] leading-[1.4] font-medium">
          요청을 마치지 못했어요.
          <br />
          잠시 후 다시 시도해 주세요
        </p>
      </div>
      <BottomCTA direction="vertical">
        <Button size="xlarge" color="danger" onClick={onRetry}>
          다시 시도
        </Button>
        <Button size="xlarge" variant="weak" onClick={onClose}>
          닫기
        </Button>
      </BottomCTA>
    </main>
  );
}
