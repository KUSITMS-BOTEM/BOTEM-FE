"use client";

import { type ComponentProps } from "react";

import Image from "next/image";

import Asset from "@/components/Asset";
import Badge from "@/components/Badge";
import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Header from "@/components/Header";
import List from "@/components/List";
import ListText from "@/components/ListText";
import Logo from "@/components/Logo";
import PageExitMotion from "@/components/effects/PageExitMotion";
import { APP_MAX_WIDTH_CLASS } from "@/constants/layout";
import { usePageExit } from "@/hooks/usePageExit";
import { cn } from "@/utils/cn";
import IconInfo from "@/assets/icons/icon-info.svg?react";
import IconLeft from "@/assets/icons/icon-left.svg?react";
import IconRight from "@/assets/icons/icon-right.svg?react";

type ProductDetailViewProps = {
  productImageUrl?: string;
  productName: string;
  price: number;
  sellerName?: string | null;
  onSellerClick?: () => void;
  sellerDisabled?: boolean;
  rightItems?: ComponentProps<typeof Header>["rightItems"];
  onBack: () => void;
  ctaLabel: string;
  onCtaClick?: () => void;
  ctaPending?: boolean;
  ctaDisabled?: boolean;
  ctaColor?: "brand" | "neutral";
  statusBadge?: string;
  ctaHelperText?: string;
};

export default function ProductDetailView({
  productImageUrl,
  productName,
  price,
  sellerName,
  onSellerClick,
  sellerDisabled = false,
  rightItems,
  onBack,
  ctaLabel,
  onCtaClick,
  ctaPending = false,
  ctaDisabled = false,
  ctaColor = "brand",
  statusBadge,
  ctaHelperText,
}: ProductDetailViewProps) {
  const { pageExit, exitPage } = usePageExit();
  const sellerRow = sellerName ? (
    <List
      title={sellerName}
      description="판매처"
      titleUp
      right={<Asset icon={<IconRight />} size="small" className="text-semantic-icon-default" />}
    />
  ) : null;

  return (
    <PageExitMotion exit={pageExit}>
      <div className="flex flex-col">
        <div
          className={`bg-semantic-background-default fixed inset-x-0 top-0 z-10 mx-auto w-full ${APP_MAX_WIDTH_CLASS} pt-[env(safe-area-inset-top)]`}>
          <Header
            title="위시 상품"
            leftItem={{
              icon: <IconLeft />,
              ariaLabel: "뒤로 가기",
              onClick: () => exitPage("slide", onBack),
            }}
            rightItems={rightItems}
          />
        </div>
        <div aria-hidden className="h-[calc(64px+env(safe-area-inset-top))] shrink-0" />
        <div className="px-5">
          <div className="bg-semantic-fill-neutral-weak relative aspect-square w-full shrink-0 overflow-hidden rounded-3xl">
            {productImageUrl && (
              <Image
                src={productImageUrl}
                alt={productName}
                fill
                unoptimized
                className="object-cover"
              />
            )}
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-b from-black/0 from-[84.444%] to-black/20 to-[160.69%]"
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 px-5 pt-5">
          <div className="flex w-full flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <ListText
                title={`${price.toLocaleString("ko-KR")}원`}
                description={productName}
                titleUp
                type="price"
              />
              {statusBadge && <Badge color="brand" size="medium" label={statusBadge} />}
            </div>
            <div className="bg-semantic-fill-neutral-weak rounded-large flex items-center gap-1 p-3">
              <Asset icon={<IconInfo />} size="xsmall" className="text-semantic-icon-default" />
              <p className="text-semantic-text-secondary [font:var(--semantic-subtext-medium)]">
                실제 가격은 구매할 때 달라질 수 있어요
              </p>
            </div>
          </div>
          {sellerRow && onSellerClick ? (
            <button
              type="button"
              onClick={onSellerClick}
              disabled={sellerDisabled}
              className="w-full text-left enabled:cursor-pointer disabled:opacity-40">
              {sellerRow}
            </button>
          ) : (
            sellerRow
          )}
          <div className="flex w-full flex-col items-center pt-10">
            <div className="to-semantic-fill-neutral-weak -mx-5 flex w-[calc(100%+40px)] flex-col gap-6 bg-linear-to-b from-transparent to-[27.355%] px-5 py-8">
              <Logo color="gray" size="medium" />
              <p className="text-semantic-text-secondary [font:var(--semantic-subtext-small)]">
                쿠팡 파트너스의 일환으로,
                <br />
                이에 따른 일정액의 수수료를 제공 받습니다.
              </p>
            </div>
          </div>
        </div>
        {/* mb-[42px]: BottomCTA lower 영역(pt-6 24px + 안내 문구 한 줄) 높이 — BottomCTA 구조가 바뀌면 함께 조정 */}
        <div
          aria-hidden
          className={cn(
            "h-[calc(36px+var(--padding-large)+56px+env(safe-area-inset-bottom))]",
            ctaHelperText && "mb-[42px]",
          )}
        />
        <BottomCTA
          lower={
            ctaHelperText && (
              <p className="text-semantic-text-secondary [font:var(--semantic-subtext-medium)]">
                {ctaHelperText}
              </p>
            )
          }>
          <Button
            color={ctaColor}
            size="xlarge"
            states={ctaPending ? "loading" : "default"}
            disabled={ctaDisabled}
            onClick={onCtaClick}>
            {ctaLabel}
          </Button>
        </BottomCTA>
      </div>
    </PageExitMotion>
  );
}
