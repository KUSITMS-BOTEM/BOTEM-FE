"use client";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Header from "@/components/Header";
import type { SurpriseRevealResponse } from "@/types/funding/surprise";
import { formatSurpriseTitle } from "@/utils/funding/toOwnerFundingView";
import FundingProgressCard from "@/widgets/funding/FundingProgressCard";
import IconLeft from "@/assets/icons/icon-left.svg?react";
import ProfilePink from "@/assets/icons/multicolor/profile-pink.svg?react";

type SurpriseDetailViewProps = {
  surprise: Pick<
    SurpriseRevealResponse,
    | "fundingId"
    | "recipientName"
    | "productName"
    | "productImageUrl"
    | "targetAmount"
    | "achievementPercentage"
    | "deadline"
  >;
  onBack: () => void;
};

// 내가 받은 마감된 서프라이즈. 마감된 내 생일 펀딩처럼 진행 카드와 '롤링페이퍼 보기'만 둔다
export default function SurpriseDetailView({ surprise, onBack }: SurpriseDetailViewProps) {
  return (
    <main className="flex min-h-dvh flex-col">
      <Header title="" leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로가기", onClick: onBack }} />
      <div className="flex flex-col gap-4 px-5 pb-[calc(8rem+env(safe-area-inset-bottom))]">
        <div className="flex items-start gap-2.5 py-1">
          <ProfilePink aria-hidden className="size-6 shrink-0" />
          <h1 className="text-semantic-text-strong min-w-0 [letter-spacing:var(--letter-spacing-default)] whitespace-pre-line [font:var(--semantic-title-a2-z-large)]">
            {formatSurpriseTitle(surprise.recipientName)}
          </h1>
        </div>
        <FundingProgressCard
          fundingId={surprise.fundingId}
          productImageUrl={surprise.productImageUrl}
          productName={surprise.productName}
          deadline={surprise.deadline.slice(0, 10)}
          percent={surprise.achievementPercentage}
          targetAmount={surprise.targetAmount}
        />
      </div>
      <BottomCTA>
        <Button size="xlarge" variant="fill">
          롤링페이퍼 보기
        </Button>
      </BottomCTA>
    </main>
  );
}
