"use client";

import { useEffect } from "react";

import { notFound, useParams, useRouter } from "next/navigation";

import Button from "@/components/Button";
import Header from "@/components/Header";
import { useAddWishMutation } from "@/hooks/mutations/wish/useAddWishMutation";
import { useRecommendedProductQuery } from "@/hooks/queries/recommendedProduct/useRecommendedProductQuery";
import ProductDetailView from "@/widgets/wish/ProductDetailView";
import ProductDetailViewSkeleton from "@/widgets/wish/skeleton/ProductDetailViewSkeleton";
import { resolveRecommendedProductErrorAction } from "./helpers";
import IconLeft from "@/assets/icons/icon-left.svg?react";

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
      <div className="flex flex-col">
        <Header
          title="위시 상품"
          leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로 가기", onClick: () => router.back() }}
        />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
          <p className="text-semantic-text-secondary [font:var(--semantic-subtext-large)]">
            상품 정보를 불러오지 못했어요
          </p>
          <Button onClick={() => refetch()}>다시 시도</Button>
        </div>
      </div>
    );
  }

  // 판매 종료 전용 디자인이 아직 없어 "불러오지 못했을 때"와 동일한 안내 레이아웃을 쓴다 — 재시도는 의미가 없어 버튼은 뺀다
  if (product.status === "DISCONTINUED") {
    return (
      <div className="flex flex-col">
        <Header
          title="위시 상품"
          leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로 가기", onClick: () => router.back() }}
        />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
          <p className="text-semantic-text-secondary [font:var(--semantic-subtext-large)]">
            지금은 고를 수 없는 선물이에요
          </p>
        </div>
      </div>
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
