"use client";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Header from "@/components/Header";
import Tooltip from "@/components/Tooltip";
import type { SurpriseGiftPreparationResponse } from "@/types/funding/surprise";
import { formatRevealLabel } from "@/utils/funding/formatDeadline";
import SurpriseGiftCoupangGuide from "@/widgets/funding/SurpriseGiftCoupangGuide";
import SurpriseGiftWallet from "@/widgets/funding/SurpriseGiftWallet";
import IconClose from "@/assets/icons/icon-close.svg?react";

type SurpriseGiftViewProps = {
  preparation: Pick<
    SurpriseGiftPreparationResponse,
    | "recipientName"
    | "participantCount"
    | "confirmedAmount"
    | "targetReached"
    | "revealAt"
    | "productImageUrl"
    | "productName"
    | "productSellerName"
  >;
  onClose: () => void;
  onBuy: () => void;
  onPrepare: () => void;
  preparePending?: boolean;
  onTransfer: () => void;
};

// 이름이 없는 경우는 서버 스펙상 없지만, 비어 오면 문장이 깨지지 않게 대신 부른다
const RECIPIENT_FALLBACK = "친구";

// SUR-PG-007 마감 · 선물 준비 (주최자). 목표를 채웠으면 쿠팡에서 선물을 산 뒤 '선물 준비하기'로 완료하고, 못 채웠으면 모인 금액을 송금한다
export default function SurpriseGiftView({
  preparation,
  onClose,
  onBuy,
  onPrepare,
  preparePending = false,
  onTransfer,
}: SurpriseGiftViewProps) {
  const recipientName = preparation.recipientName || RECIPIENT_FALLBACK;
  const revealGuide = preparation.revealAt
    ? `이제 선물을 준비해요. ${formatRevealLabel(preparation.revealAt)}에 ${recipientName}에게 공개돼요`
    : "이제 선물을 준비해요";

  return (
    <div className="bg-semantic-background-default flex min-h-dvh flex-col">
      <Header
        title=""
        rightItems={[{ icon: <IconClose />, ariaLabel: "닫기", onClick: onClose }]}
      />
      <main className="flex flex-1 flex-col items-center pb-[calc(10rem+env(safe-area-inset-bottom))]">
        <div className="flex w-full flex-col gap-2 px-5 pt-2 pb-4 tracking-(--letter-spacing-default)">
          <h1 className="text-semantic-text-strong whitespace-pre-line [font:var(--semantic-title-large)]">
            {`친구 ${preparation.participantCount}명이\n${preparation.confirmedAmount.toLocaleString("ko-KR")}원을 모았어요`}
          </h1>
          <p className="text-semantic-text-tertiary [font:var(--semantic-subtext-large)]">
            {preparation.targetReached
              ? revealGuide
              : "롤링페이퍼와 함께 모인 금액을 송금해 볼까요?"}
          </p>
        </div>
        {preparation.targetReached ? (
          <div className="flex w-full flex-1 items-center justify-center">
            <SurpriseGiftCoupangGuide
              productImageUrl={preparation.productImageUrl}
              productName={preparation.productName}
              sellerName={preparation.productSellerName}
            />
          </div>
        ) : (
          <div className="flex h-94 w-full items-center justify-center">
            <SurpriseGiftWallet />
          </div>
        )}
      </main>
      {preparation.targetReached ? (
        <BottomCTA>
          <Button color="brand" variant="weak" size="xlarge" onClick={onBuy}>
            쿠팡에 선물 사러가기
          </Button>
          <div className="relative flex">
            <Tooltip
              direction="down"
              className="absolute bottom-[calc(100%+9px)] left-1/2 -translate-x-1/2">
              구매하셨다면?
            </Tooltip>
            <Button
              color="brand"
              size="xlarge"
              states={preparePending ? "loading" : "default"}
              onClick={onPrepare}
              className="w-full">
              선물 준비하기
            </Button>
          </div>
        </BottomCTA>
      ) : (
        <BottomCTA>
          <Button color="brand" size="xlarge" onClick={onTransfer}>
            {`${recipientName}에게 송금하기`}
          </Button>
        </BottomCTA>
      )}
    </div>
  );
}
