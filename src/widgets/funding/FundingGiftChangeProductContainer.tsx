"use client";

import { useEffect } from "react";

import { notFound, useParams, useRouter } from "next/navigation";

import { useRecommendedProductQuery } from "@/hooks/queries/recommended-product/useRecommendedProductQuery";
import ProductDetailFallback from "@/components/ProductDetailFallback";
import ProductDetailView from "@/components/ProductDetailView";
import ProductDetailViewSkeleton from "@/components/skeleton/ProductDetailViewSkeleton";
import { resolveRecommendedProductErrorAction } from "@/utils/recommended-product/resolveRecommendedProductErrorAction";

export default function FundingGiftChangeProductContainer() {
  const router = useRouter();
  const { productId } = useParams<{ productId: string }>();
  const { data: product, error, isLoading, refetch } = useRecommendedProductQuery(productId);
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

  if (product.status === "DISCONTINUED") {
    return (
      <ProductDetailFallback
        message="지금은 고를 수 없는 선물이에요"
        onBack={() => router.back()}
      />
    );
  }

  // 선물 변경 API 스펙이 아직 없어 CTA 동작은 연결하지 않았다
  return (
    <ProductDetailView
      productImageUrl={product.imageUrl}
      productName={product.name}
      price={product.price}
      sellerName={product.sellerName}
      onBack={() => router.back()}
      ctaLabel="이 상품으로 변경하기"
    />
  );
}
