"use client";

import { useEffect } from "react";

import { useParams, useRouter } from "next/navigation";

import Header from "@/components/Header";
import { useWishesQuery } from "@/hooks/queries/wish/useWishesQuery";
import { giftChangeBasePath, useGiftChangeStore } from "@/store/giftChangeStore";
import { findFundingWish, getChangeableWishes } from "@/utils/funding/giftChangeCandidates";
import FundingGiftChangeView, {
  type GiftChangeProduct,
} from "@/widgets/funding/FundingGiftChangeView";
import FundingLoadState from "@/widgets/funding/FundingLoadState";
import { useGiftChangeSource } from "@/widgets/funding/useGiftChangeSource";
import IconLeft from "@/assets/icons/icon-left.svg?react";

type FundingGiftChangeContainerProps = {
  // 서프라이즈 받는 사람이 고르는 중이면 true
  surprise?: boolean;
};

export default function FundingGiftChangeContainer({
  surprise = false,
}: FundingGiftChangeContainerProps) {
  const router = useRouter();
  const fundingId = Number(useParams<{ fundingId: string }>().fundingId);
  const sourceQuery = useGiftChangeSource(fundingId, surprise);
  const wishesQuery = useWishesQuery();
  const storedFundingId = useGiftChangeStore(state => state.fundingId);
  const storedOriginalGift = useGiftChangeStore(state => state.originalGift);
  const source = sourceQuery.data;
  const wishes = wishesQuery.data?.content;

  // 추천 상품에서 위시를 담지 않고 돌아왔다면 이후 평소 위시 담기가 변경 화면으로 새지 않게 끈다
  useEffect(() => {
    useGiftChangeStore.getState().setBrowsingProducts(false);
  }, []);

  // 처음 들어올 때 아직 바꾸지 않았다면 지금 선물이 되돌아갈 기존 선물이다
  useEffect(() => {
    if (!source || !wishes || storedFundingId === fundingId) return;
    const fundingWish = source.productChanged ? undefined : findFundingWish(wishes, fundingId);
    useGiftChangeStore.getState().start(
      fundingId,
      fundingWish
        ? {
            wishId: fundingWish.id,
            productName: fundingWish.productName,
            price: fundingWish.price,
            productImageUrl: fundingWish.productImageUrl,
          }
        : null,
      surprise,
    );
  }, [source, wishes, storedFundingId, fundingId, surprise]);

  if (!source || !wishes) {
    return (
      <div className="flex min-h-dvh flex-col">
        <Header
          title="다른 선물 고르기"
          leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로 가기", onClick: () => router.back() }}
        />
        <FundingLoadState
          isLoading={sourceQuery.isLoading || wishesQuery.isLoading}
          loadingLabel="고를 수 있는 선물을 불러오는 중이에요"
          errorMessage="선물 정보를 불러오지 못했어요"
          onRetry={() => {
            if (!source) sourceQuery.refetch();
            if (!wishes) wishesQuery.refetch();
          }}
        />
      </div>
    );
  }

  const originalGift = storedFundingId === fundingId ? storedOriginalGift : null;
  const currentWish = findFundingWish(wishes, fundingId);
  const giftShownAsOriginal: GiftChangeProduct = originalGift
    ? { ...originalGift, id: originalGift.wishId }
    : {
        id: currentWish?.id ?? 0,
        productName: source.product.name,
        price: source.product.price,
        productImageUrl: source.product.imageUrl,
      };
  const excludeWishIds = [currentWish?.id, originalGift?.wishId].filter(
    (id): id is number => id !== undefined,
  );
  const changeableWishes = getChangeableWishes(wishes, source.confirmedAmount, excludeWishIds);

  const goToWishDetail = (wishId: number) =>
    router.push(`${giftChangeBasePath(fundingId, surprise)}/change-gift/wish/${wishId}`);

  return (
    <FundingGiftChangeView
      collectedAmount={source.confirmedAmount}
      currentGift={giftShownAsOriginal}
      wishes={changeableWishes}
      onBack={() => router.back()}
      onSelectCurrentGift={
        giftShownAsOriginal.id ? () => goToWishDetail(giftShownAsOriginal.id) : undefined
      }
      onSelectWish={wish => goToWishDetail(wish.id)}
      onBrowseProducts={() => {
        useGiftChangeStore.getState().setBrowsingProducts(true);
        router.push("/wish/recommended");
      }}
    />
  );
}
