"use client";

import { useEffect } from "react";

import { useParams, useRouter } from "next/navigation";

import Header from "@/components/Header";
import { useChangeFundingProductMutation } from "@/hooks/mutations/funding/useChangeFundingProductMutation";
import { useFundingManagementQuery } from "@/hooks/queries/funding/useFundingManagementQuery";
import { useFundingResultQuery } from "@/hooks/queries/funding/useFundingResultQuery";
import { useWishesQuery } from "@/hooks/queries/wish/useWishesQuery";
import { useGiftChangeStore } from "@/store/giftChangeStore";
import { findFundingWish, getChangeableWishes } from "@/utils/funding/giftChangeCandidates";
import FundingGiftChangeView, {
  type GiftChangeProduct,
} from "@/widgets/funding/FundingGiftChangeView";
import FundingLoadState from "@/widgets/funding/FundingLoadState";
import IconLeft from "@/assets/icons/icon-left.svg?react";

export default function FundingGiftChangeContainer() {
  const router = useRouter();
  const fundingId = Number(useParams<{ fundingId: string }>().fundingId);
  const resultQuery = useFundingResultQuery(fundingId);
  const managementQuery = useFundingManagementQuery(fundingId);
  const wishesQuery = useWishesQuery();
  const changeMutation = useChangeFundingProductMutation(fundingId);
  const storedFundingId = useGiftChangeStore(state => state.fundingId);
  const storedOriginalGift = useGiftChangeStore(state => state.originalGift);
  const result = resultQuery.data;
  const management = managementQuery.data;
  const wishes = wishesQuery.data?.content;
  const resultPath = `/funding/${fundingId}/result`;

  // 추천 상품에서 위시를 담지 않고 돌아왔다면 이후 평소 위시 담기가 변경 화면으로 새지 않게 끈다
  useEffect(() => {
    useGiftChangeStore.getState().setBrowsingProducts(false);
  }, []);

  // 처음 들어올 때 아직 바꾸지 않았다면 지금 선물이 되돌아갈 기존 선물이다
  useEffect(() => {
    if (!management || !wishes || storedFundingId === fundingId) return;
    const fundingWish = management.productChanged ? undefined : findFundingWish(wishes, fundingId);
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
    );
  }, [management, wishes, storedFundingId, fundingId]);

  if (!result || !management || !wishes) {
    return (
      <div className="flex min-h-dvh flex-col">
        <Header
          title="다른 선물 고르기"
          leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로 가기", onClick: () => router.back() }}
        />
        <FundingLoadState
          isLoading={resultQuery.isLoading || managementQuery.isLoading || wishesQuery.isLoading}
          loadingLabel="고를 수 있는 선물을 불러오는 중이에요"
          errorMessage="선물 정보를 불러오지 못했어요"
          onRetry={() => {
            if (!result) resultQuery.refetch();
            if (!management) managementQuery.refetch();
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
        productName: management.product.name,
        price: management.product.price,
        productImageUrl: management.product.imageUrl,
      };
  const excludeWishIds = [currentWish?.id, originalGift?.wishId].filter(
    (id): id is number => id !== undefined,
  );
  const changeableWishes = getChangeableWishes(wishes, result.confirmedAmount, excludeWishIds);

  // 다른 위시로 바꿨다가 기존 선물을 다시 고르면 기존 위시로 되돌린다
  const handleSelectOriginalGift = () => {
    if (!originalGift || currentWish?.id === originalGift.wishId) {
      router.replace(resultPath);
      return;
    }
    changeMutation.mutate(originalGift.wishId, { onSuccess: () => router.replace(resultPath) });
  };

  return (
    <FundingGiftChangeView
      collectedAmount={result.confirmedAmount}
      currentGift={giftShownAsOriginal}
      wishes={changeableWishes}
      currentGiftPending={changeMutation.isPending || changeMutation.isSuccess}
      onBack={() => router.back()}
      onSelectCurrentGift={handleSelectOriginalGift}
      onSelectWish={wish => router.push(`/funding/${fundingId}/change-gift/wish/${wish.id}`)}
      onBrowseProducts={() => {
        useGiftChangeStore.getState().setBrowsingProducts(true);
        router.push("/wish/recommended");
      }}
    />
  );
}
