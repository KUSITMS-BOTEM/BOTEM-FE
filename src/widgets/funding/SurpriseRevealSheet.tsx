"use client";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import RevealMotion from "@/components/effects/RevealMotion";
import OpenSheet from "@/components/OpenSheet";
import { withVocativeParticle } from "@/utils/withSubjectParticle";

type SurpriseRevealSheetProps = {
  open: boolean;
  recipientName: string;
  contributorNames: string[];
  totalAmount: number;
  onClose: () => void;
  onOpenMessage?: () => void;
};

// 서프라이즈 마감 후 받는 사람이 홈 배너를 눌렀을 때 보이는 공개 화면
// TODO: 아직 스토리·테스트에서만 쓰인다. 홈 배너와 연결할 때 이 시트를 연다
export default function SurpriseRevealSheet({
  open,
  recipientName,
  contributorNames,
  totalAmount,
  onClose,
  onOpenMessage,
}: SurpriseRevealSheetProps) {
  return (
    <OpenSheet open={open} title="" ariaLabel="서프라이즈 공개" onClose={onClose}>
      <div className="flex w-full flex-col items-center gap-6 pt-5 pb-32">
        <RevealMotion names={contributorNames} />
        <div className="flex flex-col items-center gap-2 text-center [letter-spacing:var(--letter-spacing-default)]">
          <h1 className="text-semantic-text-strong [font-family:var(--font-family-a2-z)] text-[22px] [line-height:var(--line-height-default)] font-semibold whitespace-pre-line">
            {`${withVocativeParticle(recipientName)}, 친구 ${contributorNames.length}명이\n몰래 준비했어!`}
          </h1>
          <p className="text-semantic-text-tertiary [font:var(--semantic-subtext-large)]">
            {`${totalAmount.toLocaleString("ko-KR")}원이 모였어요`}
          </p>
        </div>
      </div>
      <BottomCTA>
        <Button color="brand" size="xlarge" onClick={onOpenMessage}>
          메시지 열어보기
        </Button>
      </BottomCTA>
    </OpenSheet>
  );
}
