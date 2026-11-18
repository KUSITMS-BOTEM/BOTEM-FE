"use client";

import type { StaticImageData } from "next/image";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Header from "@/components/Header";
import List from "@/components/List";
import TextButton from "@/components/TextButton";
import { isValidUrl } from "@/utils/isValidUrl";
import FundingResultCelebration from "@/widgets/funding/FundingResultCelebration";
import type { ResultContributor } from "@/widgets/funding/FundingResultFriendDot";
import IconClose from "@/assets/icons/icon-close.svg?react";

export type FundingResult = {
  goalAchieved: boolean;
  collectedAmount: number;
  productName: string;
  productImage?: string | StaticImageData;
  productPrice: number;
  giftChanged: boolean;
  canExtend: boolean;
  contributors: ResultContributor[];
};

type FundingResultViewProps = {
  result: FundingResult;
  reduceMotion: boolean;
  onClose: () => void;
  onBuy: () => void;
  onChangeGift: () => void;
  onExtend: () => void;
};

const formatWon = (amount: number) => `${amount.toLocaleString("ko-KR")}원`;

function getCopy({ goalAchieved, collectedAmount, productPrice, giftChanged }: FundingResult) {
  const amount = formatWon(collectedAmount);
  if (goalAchieved) {
    return {
      title: `${amount}이\n모두 모였어요\n선물을 사러갈까요?`,
      productTitle: formatWon(productPrice),
      productDescription: "나의 위시 상품",
    };
  }
  return {
    title: `${amount}이\n모였어요\n어떻게 할까요?`,
    productTitle: `차액 ${formatWon(productPrice - collectedAmount)}만\n보태면 구매할 수 있어요`,
    productDescription: giftChanged ? "변경한 선물" : "기존 선물",
  };
}

export default function FundingResultView({
  result,
  reduceMotion,
  onClose,
  onBuy,
  onChangeGift,
  onExtend,
}: FundingResultViewProps) {
  const copy = getCopy(result);
  const image =
    typeof result.productImage === "string" && !isValidUrl(result.productImage)
      ? undefined
      : result.productImage;

  return (
    <div className="bg-semantic-background-default flex min-h-dvh flex-col">
      <Header
        title=""
        rightItems={[{ icon: <IconClose />, ariaLabel: "닫기", onClick: onClose }]}
      />
      <main className="flex flex-1 flex-col pb-[calc(10rem+env(safe-area-inset-bottom))]">
        <FundingResultCelebration
          productImage={image}
          contributors={result.contributors}
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
              thumbnailAlt={result.productName}
              title={copy.productTitle}
              description={copy.productDescription}
              caption={result.productName}
              textSize="small"
            />
          </div>
        </div>
      </main>
      {result.goalAchieved ? (
        <BottomCTA
          upper={
            <p className="text-semantic-text-tertiary text-center [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-x-small-weak)]">
              24시간 안에 구매 후 인증해 주세요
            </p>
          }>
          <Button color="brand" size="xlarge" onClick={onBuy}>
            쿠팡에서 선물 사러 가기
          </Button>
        </BottomCTA>
      ) : (
        <BottomCTA
          upper={
            result.canExtend && (
              <TextButton size="medium" label="기간연장 (1회)" onClick={onExtend} />
            )
          }>
          <Button color="neutral" variant="weak" size="xlarge" onClick={onChangeGift}>
            다른 선물 고르기
          </Button>
          <Button color="neutral" size="xlarge" onClick={onChangeGift}>
            차액으로 구매
          </Button>
        </BottomCTA>
      )}
    </div>
  );
}
