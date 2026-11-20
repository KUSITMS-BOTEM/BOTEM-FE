"use client";

import type { StaticImageData } from "next/image";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Header from "@/components/Header";
import List from "@/components/List";
import TextButton from "@/components/TextButton";
import { getFundingResultCopy } from "@/utils/funding/fundingResultCopy";
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

export default function FundingResultView({
  result,
  reduceMotion,
  onClose,
  onBuy,
  onChangeGift,
  onExtend,
}: FundingResultViewProps) {
  const copy = getFundingResultCopy(result);
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
          <Button color="neutral" size="xlarge" onClick={onBuy}>
            차액으로 구매
          </Button>
        </BottomCTA>
      )}
    </div>
  );
}
