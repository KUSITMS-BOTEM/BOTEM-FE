"use client";

import { useEffect } from "react";

import { notFound, useParams, useRouter } from "next/navigation";

import { useAddWishMutation } from "@/hooks/mutations/wish/useAddWishMutation";
import { useRecommendedProductQuery } from "@/hooks/queries/recommendedProduct/useRecommendedProductQuery";
import ProductDetailFallback from "@/widgets/wish/ProductDetailFallback";
import ProductDetailView from "@/widgets/wish/ProductDetailView";
import ProductDetailViewSkeleton from "@/widgets/wish/skeleton/ProductDetailViewSkeleton";
import { resolveRecommendedProductErrorAction } from "./helpers";

export default function RecommendedProductDetail() {
  const router = useRouter();
  const { productId } = useParams<{ productId: string }>();
  const { data: product, error, isLoading, refetch } = useRecommendedProductQuery(productId);
  const { mutate: addWish, isPending: isAddWishPending } = useAddWishMutation();
  const errorAction = resolveRecommendedProductErrorAction(error);

  useEffect(() => {
    if (errorAction === "unauthorized") router.replace("/");
    else if (errorAction === "alert") alert(error?.message);
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
    <ProductDetailView
      productImageUrl={product.imageUrl}
      productName={product.name}
      price={product.price}
      sellerName={product.sellerName}
      onBack={() => router.back()}
      ctaLabel="위시에 담기"
      ctaPending={isAddWishPending}
      onCtaClick={() => addWish({ recommendedProductId: product.id })}
    />
  );
}
