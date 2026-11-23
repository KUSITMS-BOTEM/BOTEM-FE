"use client";

import { useState } from "react";

import { useParams, useRouter } from "next/navigation";

import ProductDetailFallback from "@/components/ProductDetailFallback";
import ProductDetailView from "@/components/ProductDetailView";
import ProductDetailViewSkeleton from "@/components/skeleton/ProductDetailViewSkeleton";
import TextButton from "@/components/TextButton";
import { useChangeFundingProductMutation } from "@/hooks/mutations/funding/useChangeFundingProductMutation";
import { useChooseGiftMutation } from "@/hooks/mutations/funding/useChooseGiftMutation";
import { useFundingManagementQuery } from "@/hooks/queries/funding/useFundingManagementQuery";
import { useFundingResultQuery } from "@/hooks/queries/funding/useFundingResultQuery";
import { useWishQuery } from "@/hooks/queries/wish/useWishQuery";
import { type OriginalGift, useGiftChangeStore } from "@/store/giftChangeStore";
import type { OwnerFundingDetailResponse } from "@/types/funding/ownerFundingDetail";
import { openPendingTab } from "@/utils/openPendingTab";
import type { GiftChangeProduct } from "@/widgets/funding/FundingGiftChangeView";
import FundingOriginalGiftSheet from "@/widgets/funding/FundingOriginalGiftSheet";

export default function FundingGiftChangeWishContainer() {
  const router = useRouter();
  const params = useParams<{ fundingId: string; wishId: string }>();
  const fundingId = Number(params.fundingId);
  const [originalSheetOpen, setOriginalSheetOpen] = useState(false);
  const { data: wish, isLoading, refetch } = useWishQuery(params.wishId);
  const { data: result } = useFundingResultQuery(fundingId);
  const { data: management } = useFundingManagementQuery(fundingId);
  const changeMutation = useChangeFundingProductMutation(fundingId);
  const chooseGiftMutation = useChooseGiftMutation(fundingId);
  const storedFundingId = useGiftChangeStore(state => state.fundingId);
  const storedOriginalGift = useGiftChangeStore(state => state.originalGift);
  // 위시 변경에서 뒤로 가면 다른 선물 고르기가 아니라 선물 확인으로 돌아간다
  const backToResult = () => router.replace(`/funding/${fundingId}/result`);

  if (isLoading) return <ProductDetailViewSkeleton />;
  if (!wish) {
    return (
      <ProductDetailFallback
        message="상품 정보를 불러오지 못했어요"
        onBack={backToResult}
        onRetry={() => refetch()}
      />
    );
  }
  if (wish.status === "DISCONTINUED") {
    return <ProductDetailFallback message="지금은 고를 수 없는 선물이에요" onBack={backToResult} />;
  }

  const isChanged =
    changeMutation.isSuccess || (wish.status === "FUNDING" && wish.fundingId === fundingId);
  const originalGift = resolveOriginalGift(
    storedFundingId === fundingId ? storedOriginalGift : null,
    management,
  );

  // 바꾼 상품을 선물로 정해야 선물 인증 대기로 바뀐다.
  // mutate 호출별 콜백은 응답 전에 화면을 떠나면 실행되지 않아, 열어 둔 탭이 빈 채로 남지 않게 mutateAsync로 처리한다
  const handleBuy = async () => {
    const tab = openPendingTab();
    try {
      const data = await chooseGiftMutation.mutateAsync();
      tab.navigate(data?.productUrl);
    } catch {
      tab.close();
    }
  };
  const ctaPending = changeMutation.isPending || chooseGiftMutation.isPending;

  return (
    <>
      <ProductDetailView
        productImageUrl={wish.productImageUrl}
        productName={wish.productName}
        price={wish.price}
        sellerName={wish.sellerName}
        onBack={backToResult}
        ctaLabel={isChanged ? "쿠팡에서 선물 사러 가기" : "이 선물로 변경하기"}
        ctaColor={isChanged ? "brand" : "neutral"}
        ctaPending={ctaPending}
        ctaDisabled={ctaPending}
        onCtaClick={isChanged ? handleBuy : () => changeMutation.mutate(wish.id)}
        ctaUpper={
          isChanged && (
            <p className="text-semantic-text-tertiary text-center [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-x-small-weak)]">
              24시간 안에 구매 후 인증해 주세요
            </p>
          )
        }
        ctaLower={
          originalGift &&
          result && (
            <TextButton
              size="medium"
              label="기존 선물 보기"
              rightIcon
              onClick={() => setOriginalSheetOpen(true)}
            />
          )
        }
      />
      {originalGift && result && (
        <FundingOriginalGiftSheet
          open={originalSheetOpen}
          collectedAmount={result.confirmedAmount}
          originalGift={originalGift}
          onClose={() => setOriginalSheetOpen(false)}
        />
      )}
    </>
  );
}

// 다른 선물 고르기에서 기록해 둔 기존 선물이 없으면(새로고침 후 바로 진입 등), 아직 바꾸지 않은 펀딩의 지금 상품이 곧 기존 선물이다
function resolveOriginalGift(
  storedOriginalGift: OriginalGift | null,
  management: OwnerFundingDetailResponse | null | undefined,
): Omit<GiftChangeProduct, "id"> | null {
  if (storedOriginalGift) return storedOriginalGift;
  if (!management || management.productChanged) return null;
  return {
    productName: management.product.name,
    price: management.product.price,
    productImageUrl: management.product.imageUrl,
  };
}
