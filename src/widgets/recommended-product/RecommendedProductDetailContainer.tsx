"use client";

import { useEffect, useRef, useState } from "react";

import { notFound, useParams, useRouter } from "next/navigation";

import { showGlobalErrorDialog } from "@/lib/queryClient";
import { useAddWishMutation } from "@/hooks/mutations/wish/useAddWishMutation";
import { useRecommendedProductQuery } from "@/hooks/queries/recommended-product/useRecommendedProductQuery";
import ProductDetailFallback from "@/components/ProductDetailFallback";
import ProductDetailView from "@/components/ProductDetailView";
import ProductDetailViewSkeleton from "@/components/skeleton/ProductDetailViewSkeleton";
import ToastMessage from "@/components/ToastMessage";
import { useWishDeletedToastStore } from "@/store/wishDeletedToastStore";
import { resolveRecommendedProductErrorAction } from "@/utils/recommended-product/resolveRecommendedProductErrorAction";

const DELETED_TOAST_DURATION_MS = 1000;

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

  // 위시 삭제 직후 이동해 온 경우에만 토스트를 보여준다(초기값으로 읽고, 새로고침·재방문엔 안 뜨도록 아래서 비운다)
  const [showDeletedToast, setShowDeletedToast] = useState(
    () => useWishDeletedToastStore.getState().pending,
  );

  useEffect(() => {
    useWishDeletedToastStore.getState().consume();
  }, []);

  // 소비 effect와 분리: StrictMode가 effect를 두 번 돌려도 타이머가 지워지지 않게 한다
  useEffect(() => {
    if (!showDeletedToast) return;
    const timer = setTimeout(() => setShowDeletedToast(false), DELETED_TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showDeletedToast]);

  useEffect(() => {
    if (errorAction === "unauthorized") router.replace("/");
    else if (errorAction === "alert" && error) showGlobalErrorDialog(error);
  }, [errorAction, error, router]);

  if (errorAction === "notFound") notFound();
  if (isLoading) return <ProductDetailViewSkeleton />;

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
        onBack={() => router.back()}
        ctaLabel="위시에 담기"
        ctaColor="neutral"
        ctaPending={isAddWishPending || isAddWishSuccess}
        onCtaClick={() => handleAddWish(product.id)}
      />
      <ToastMessage
        show={showDeletedToast}
        state
        text="위시를 삭제했어요"
        className="pointer-events-none fixed bottom-32 left-1/2 z-20 -translate-x-1/2"
      />
    </>
  );
}
