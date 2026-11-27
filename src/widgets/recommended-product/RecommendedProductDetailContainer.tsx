"use client";

import { useEffect, useRef } from "react";

import { notFound, useParams, useRouter } from "next/navigation";

import { showGlobalErrorDialog } from "@/lib/queryClient";
import { useAddWishMutation } from "@/hooks/mutations/wish/useAddWishMutation";
import { useWishToast } from "@/hooks/useWishToast";
import { useRecommendedProductQuery } from "@/hooks/queries/recommended-product/useRecommendedProductQuery";
import ProductDetailFallback from "@/components/ProductDetailFallback";
import ProductDetailView from "@/components/ProductDetailView";
import ProductDetailViewSkeleton from "@/components/skeleton/ProductDetailViewSkeleton";
import ToastMessage from "@/components/ToastMessage";
import { isValidUrl } from "@/utils/isValidUrl";
import { resolveRecommendedProductErrorAction } from "@/utils/recommended-product/resolveRecommendedProductErrorAction";

export default function RecommendedProductDetailContainer() {
  const router = useRouter();
  const { productId } = useParams<{ productId: string }>();
  const { data: product, error, isLoading, refetch } = useRecommendedProductQuery(productId);
  const {
    mutate: addWish,
    isPending: isAddWishPending,
    isSuccess: isAddWishSuccess,
  } = useAddWishMutation();
  const errorAction = resolveRecommendedProductErrorAction(error);
  // isPending은 렌더 이후에야 true가 되고 성공 직후엔 이동 전에 false로 풀려, 그 틈의 재클릭이 중복 요청이 된다 — 동기 잠금으로 막는다
  const isAddWishLockedRef = useRef(false);

  const handleAddWish = (recommendedProductId: number) => {
    if (isAddWishLockedRef.current) return;
    isAddWishLockedRef.current = true;
    addWish({ recommendedProductId }, { onError: () => (isAddWishLockedRef.current = false) });
  };

  const showDeletedToast = useWishToast("deleted");

  useEffect(() => {
    if (errorAction === "unauthorized") router.replace("/");
    else if (errorAction === "alert" && error) showGlobalErrorDialog(error);
  }, [errorAction, error, router]);

  // 삭제 직후 상세 캐시가 없으면 로딩 중에도 토스트 타이머가 흘러가므로, 로딩 분기에서도 같은 토스트를 그린다
  const deletedToast = (
    <ToastMessage
      show={showDeletedToast}
      state
      text="위시를 삭제했어요"
      className="pointer-events-none fixed bottom-32 left-1/2 z-20 -translate-x-1/2"
    />
  );

  if (errorAction === "notFound") notFound();
  if (isLoading) {
    return (
      <>
        <ProductDetailViewSkeleton />
        {deletedToast}
      </>
    );
  }

  if (!product) {
    return (
      <ProductDetailFallback
        message="상품 정보를 불러오지 못했어요"
        onBack={() => router.back()}
        onRetry={() => refetch()}
      />
    );
  }

  // 판매 종료 전용 디자인이 아직 없어 "불러오지 못했을 때"와 동일한 안내 레이아웃을 쓴다 — 재시도는 의미가 없어 버튼은 뺀다
  if (product.status === "DISCONTINUED") {
    return (
      <ProductDetailFallback
        message="지금은 고를 수 없는 선물이에요"
        onBack={() => router.back()}
      />
    );
  }

  return (
    <>
      <ProductDetailView
        productImageUrl={product.imageUrl}
        productName={product.name}
        price={product.price}
        sellerName={product.sellerName}
        sellerDisabled={!isValidUrl(product.productUrl)}
        onSellerClick={() => window.open(product.productUrl, "_blank", "noopener,noreferrer")}
        onBack={() => router.back()}
        ctaLabel="위시에 담기"
        ctaColor="neutral"
        ctaPending={isAddWishPending || isAddWishSuccess}
        onCtaClick={() => handleAddWish(product.id)}
      />
      {deletedToast}
    </>
  );
}
