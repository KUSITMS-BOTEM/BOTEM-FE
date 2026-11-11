"use client";

import { type ComponentProps } from "react";

import Image from "next/image";

import Asset from "@/components/Asset";
import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Header from "@/components/Header";
import List from "@/components/List";
import ListText from "@/components/ListText";
import { APP_MAX_WIDTH_CLASS } from "@/constants/layout";
import IconInfo from "@/assets/icons/icon-info.svg?react";
import IconLeft from "@/assets/icons/icon-left.svg?react";
import IconRight from "@/assets/icons/icon-right.svg?react";

type ProductDetailViewProps = {
  productImageUrl: string;
  productName: string;
  price: number;
  sellerName: string;
  onSellerClick?: () => void;
  rightItems?: ComponentProps<typeof Header>["rightItems"];
  onBack: () => void;
  ctaLabel: string;
  onCtaClick?: () => void;
  ctaPending?: boolean;
};

export default function ProductDetailView({
  productImageUrl,
  productName,
  price,
  sellerName,
  onSellerClick,
  rightItems,
  onBack,
  ctaLabel,
  onCtaClick,
  ctaPending = false,
}: ProductDetailViewProps) {
  const sellerRow = (
    <List
      title={sellerName}
      description="판매처"
      titleUp
      right={<Asset icon={<IconRight />} size="small" className="text-semantic-icon-default" />}
    />
  );

  return (
    <div className="flex flex-col">
      <div className="relative aspect-square w-full shrink-0">
        <Image src={productImageUrl} alt={productName} fill unoptimized className="object-cover" />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-black/0 from-[84.444%] to-black/20 to-[160.69%]"
        />
        <Header
          title="위시 상품"
          leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로 가기", onClick: onBack }}
          rightItems={rightItems}
          className={`fixed inset-x-0 top-0 z-10 mx-auto w-full ${APP_MAX_WIDTH_CLASS} pt-[env(safe-area-inset-top)]`}
        />
      </div>
      <div className="flex flex-col gap-3 px-5 pt-5">
        <div className="flex w-full flex-col gap-2">
          <ListText
            title={`${price.toLocaleString("ko-KR")}원`}
            description={productName}
            titleUp
            type="price"
          />
          <div className="bg-semantic-fill-neutral-weak rounded-large flex items-center gap-1 p-3">
            <Asset icon={<IconInfo />} size="xsmall" className="text-semantic-icon-default" />
            <p className="text-semantic-text-secondary [font:var(--semantic-subtext-medium)]">
              실제 가격은 구매할 때 달라질 수 있어요
            </p>
          </div>
        </div>
        {onSellerClick ? (
          <button type="button" onClick={onSellerClick} className="w-full cursor-pointer text-left">
            {sellerRow}
          </button>
        ) : (
          sellerRow
        )}
        <div className="flex w-full flex-col items-center pt-10">
          <div className="to-semantic-fill-neutral-weak -mx-5 flex w-[calc(100%+40px)] flex-col gap-6 bg-linear-to-b from-transparent to-[27.355%] px-5 py-8">
            <p className="text-semantic-text-primary [font:var(--semantic-label-x-small)]">Logo</p>
            <p className="text-semantic-text-secondary [font:var(--semantic-subtext-small)]">
              쿠팡 파트너스의 일환으로,
              <br />
              이에 따른 일정액의 수수료를 제공 받습니다.
            </p>
          </div>
        </div>
      </div>
      {/* 하단 고정 BottomCTA(그라데이션 36px + padding-large + 버튼 56px)에 콘텐츠가 가려지지 않도록 같은 높이만큼 스크롤 여백 확보 */}
      <div
        aria-hidden
        className="h-[calc(36px+var(--padding-large)+56px+env(safe-area-inset-bottom))]"
      />
      <BottomCTA>
        <Button
          color="brand"
          size="xlarge"
          states={ctaPending ? "loading" : "default"}
          onClick={onCtaClick}>
          {ctaLabel}
        </Button>
      </BottomCTA>
    </div>
  );
}
