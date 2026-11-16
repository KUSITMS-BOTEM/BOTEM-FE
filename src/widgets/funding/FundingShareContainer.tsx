"use client";

import { useState } from "react";

import Header from "@/components/Header";
import ProfileBox from "@/components/ProfileBox";
import Tooltip from "@/components/Tooltip";
import BotemPopup from "@/widgets/funding/BotemPopup";
import FundingMessage from "@/widgets/funding/FundingMessage";
import FundingProgressCard from "@/widgets/funding/FundingProgressCard";
import SampleProduct from "@/assets/images/samples/sample-product.png";
import IconShare from "@/assets/icons/icon-share.svg?react";
import IconDotVertical from "@/assets/icons/icon-dotvertical.svg?react";
import ProfilePink from "@/assets/icons/multicolor/profile-pink.svg?react";

type FundingShareContainerProps = {
  fundingId: string;
};

// TODO(API): 비회원 펀딩 공개 조회 API가 나오면 fundingId로 받아온 값으로 교체한다
const MOCK_FUNDING = {
  hostName: "지유",
  title: "지유의 생일",
  story: "올해 생일엔 출퇴근길에 쓸 노캔 헤드폰이 갖고 싶어요. 조금씩 보태주면 감동할게요!",
  pledge: "펀딩이 성공하면 헤드폰 끼고 출근하는 인증샷을 꼭 올릴게요!",
  productName: "소니 WH-1000XM5",
  productImageUrl: SampleProduct.src,
  deadline: "2026-12-31",
  currentAmount: 74074074,
  targetAmount: 123456789,
  participants: ["orange", "blue", "pink"] as const,
  extraParticipantCount: 99,
  unconfirmedCount: 1,
  friends: [
    { id: 1, name: "민수", contributedAt: "2026-11-10T09:00:00" },
    { id: 2, name: "서연", contributedAt: "2026-11-12T18:30:00" },
  ],
};

// TODO: 공유·더보기 동작은 디자인이 정해지면 연결한다
const noop = () => {};

export default function FundingShareContainer({ fundingId }: FundingShareContainerProps) {
  const funding = MOCK_FUNDING;
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const closePopup = () => setIsPopupOpen(false);

  return (
    <main className="flex min-h-dvh flex-col">
      <Header
        title=""
        rightItems={[
          // TODO: 공유 버튼 클릭 시 동작 구현 필요 (예: 카카오톡/링크 공유)
          { icon: <IconShare />, ariaLabel: "공유", onClick: noop },
          // TODO: 더보기 버튼 클릭 시 동작 구현 필요 (예: 메뉴/바텀시트 노출)
          { icon: <IconDotVertical />, ariaLabel: "더보기", onClick: noop },
        ]}
      />
      <div className="flex flex-col gap-4 px-5 pb-[calc(var(--padding-large)+env(safe-area-inset-bottom))]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5 py-1">
            <ProfilePink aria-hidden className="size-6 shrink-0" />
            <h1 className="text-semantic-text-strong min-w-0 [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-title-a2-z-large)]">
              {funding.title}
            </h1>
          </div>
          <FundingMessage story={funding.story} pledge={funding.pledge} />
        </div>
        <FundingProgressCard
          fundingId={fundingId}
          productImageUrl={funding.productImageUrl}
          productName={funding.productName}
          deadline={funding.deadline}
          currentAmount={funding.currentAmount}
          targetAmount={funding.targetAmount}
        />
        <button
          type="button"
          onClick={() => setIsPopupOpen(true)}
          className="flex cursor-pointer items-center gap-2 self-end">
          <Tooltip>나도 {funding.hostName}님께 보태볼까요?</Tooltip>
          <ProfileBox
            profiles={funding.participants.map(color => ({ color }))}
            extraCount={funding.extraParticipantCount}
            className="bg-semantic-fill-default shadow-[0_4px_8px_0_var(--color-semantic-shadow-weak)]"
          />
        </button>
      </div>
      {/* TODO: 팝업 내부 동작(미확인·수정·메세지·보태기)은 보탬 폼 디자인이 정해지면 연결한다 */}
      <BotemPopup
        open={isPopupOpen}
        unconfirmedCount={funding.unconfirmedCount}
        friends={funding.friends}
        ownerName={funding.hostName}
        isClosed={false}
        onClose={closePopup}
        onUnconfirmedClick={noop}
        onEditClick={noop}
        onMessageClick={noop}
        onContributeClick={noop}
      />
    </main>
  );
}
