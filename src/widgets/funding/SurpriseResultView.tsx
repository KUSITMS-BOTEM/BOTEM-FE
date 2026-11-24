"use client";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Header from "@/components/Header";
import List from "@/components/List";
import type { SurpriseRevealResponse } from "@/types/funding/surprise";
import { getFundingResultCopy } from "@/utils/funding/fundingResultCopy";
import { isValidUrl } from "@/utils/isValidUrl";
import FundingResultCelebration from "@/widgets/funding/FundingResultCelebration";
import IconClose from "@/assets/icons/icon-close.svg?react";

const TARGET_PERCENTAGE = 100;

type SurpriseResultViewProps = {
  surprise: Pick<
    SurpriseRevealResponse,
    | "organizerName"
    | "productName"
    | "productImageUrl"
    | "productPrice"
    | "productChanged"
    | "confirmedAmount"
    | "confirmedPercentage"
    | "giftChosen"
    | "messages"
  >;
  reduceMotion: boolean;
  onClose: () => void;
  onBuy: () => void;
  buyPending?: boolean;
  onChangeGift: () => void;
};

// 받는 사람이 '선물 받으러 가기'로 오는 화면. 생일 펀딩 결과 화면(FUND-PG-011/012)처럼 선물을 사거나 바꾼다. 서프라이즈는 기간 연장이 없다
export default function SurpriseResultView({
  surprise,
  reduceMotion,
  onClose,
  onBuy,
  buyPending = false,
  onChangeGift,
}: SurpriseResultViewProps) {
  const image = isValidUrl(surprise.productImageUrl) ? surprise.productImageUrl : undefined;
  const goalAchieved = surprise.confirmedPercentage >= TARGET_PERCENTAGE;
  const copy = getFundingResultCopy({
    goalAchieved,
    collectedAmount: surprise.confirmedAmount,
    productPrice: surprise.productPrice,
    giftChanged: surprise.productChanged,
  });
  const buyState = buyPending ? "loading" : "default";
  const contributors = surprise.messages.map(message => ({
    userId: message.messageId,
    profileImageUrl:
      message.participantProfileImageUrl && isValidUrl(message.participantProfileImageUrl)
        ? message.participantProfileImageUrl
        : undefined,
  }));

  return (
    <div className="bg-semantic-background-default flex min-h-dvh flex-col">
      <Header
        title=""
        rightItems={[{ icon: <IconClose />, ariaLabel: "닫기", onClick: onClose }]}
      />
      <main className="flex flex-1 flex-col pb-[calc(10rem+env(safe-area-inset-bottom))]">
        <FundingResultCelebration
          productImage={image}
          contributors={contributors}
          reduceMotion={reduceMotion}
        />
        <div className="flex flex-col px-5">
          <h1 className="text-semantic-text-strong pt-2 pb-4 [letter-spacing:var(--letter-spacing-default)] whitespace-pre-line [font:var(--semantic-title-large)]">
            {copy.title}
          </h1>
          <div className="border-semantic-border-default bg-semantic-fill-default rounded-xx-large border px-3">
            <List
              type="product"
              thumbnailSrc={image}
              thumbnailAlt={surprise.productName}
              title={copy.productTitle}
              description={
                goalAchieved ? `${surprise.organizerName}님이 준비한 선물` : copy.productDescription
              }
              caption={surprise.productName}
              textSize="small"
            />
          </div>
        </div>
      </main>
      {goalAchieved ? (
        <BottomCTA>
          <Button color="brand" size="xlarge" states={buyState} onClick={onBuy}>
            쿠팡에서 선물 사러 가기
          </Button>
        </BottomCTA>
      ) : (
        <BottomCTA>
          {/* 선물을 정한 뒤엔 상품을 바꿀 수 없어(PATCH /product 거부), 다시 들어와도 고르기 흐름을 시작하지 않게 숨긴다 */}
          {!surprise.giftChosen && (
            <Button color="neutral" variant="weak" size="xlarge" onClick={onChangeGift}>
              다른 선물 고르기
            </Button>
          )}
          <Button color="neutral" size="xlarge" states={buyState} onClick={onBuy}>
            차액으로 구매
          </Button>
        </BottomCTA>
      )}
    </div>
  );
}
