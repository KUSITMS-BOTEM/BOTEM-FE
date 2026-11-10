"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import Asset from "@/components/Asset";
import Button from "@/components/Button";
import ChipGroup from "@/components/ChipGroup";
import Header from "@/components/Header";
import List from "@/components/List";
import Title from "@/components/Title";
import WishCard from "@/widgets/main/WishCard";
import RecommendedWishListSkeleton from "@/widgets/wish/skeleton/RecommendedWishListSkeleton";

import { useRecommendedProductsQuery } from "@/hooks/queries/recommendedProduct/useRecommendedProductsQuery";
import { RECOMMENDED_PRODUCT_CATEGORIES } from "@/constants/recommendedProductCategory";
import type { RecommendedProductCategory } from "@/types/recommendedProduct/recommendedProduct";
import IconFundingOpen from "@/assets/icons/multicolor/icon-funding-open.svg?react";
import IconLeft from "@/assets/icons/icon-left.svg?react";
import IconRight from "@/assets/icons/icon-right.svg?react";

const ALL_CATEGORY_VALUE = "ALL" as const;
const CATEGORY_CHIPS = [
  { value: ALL_CATEGORY_VALUE, label: "전체" },
  ...RECOMMENDED_PRODUCT_CATEGORIES,
];

type CategoryFilter = RecommendedProductCategory | typeof ALL_CATEGORY_VALUE;

export default function RecommendedWishList() {
  const router = useRouter();
  const [category, setCategory] = useState<CategoryFilter>(ALL_CATEGORY_VALUE);
  const {
    data: recommendedProducts,
    isLoading,
    isError,
    refetch,
  } = useRecommendedProductsQuery(category === ALL_CATEGORY_VALUE ? undefined : category);

  return (
    <div className="flex flex-col">
      <Header
        title="위시 추가"
        leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로 가기", onClick: () => router.back() }}
      />
      <div className="flex flex-col gap-6 px-5 pb-8">
        {isLoading ? (
          <RecommendedWishListSkeleton />
        ) : (
          <div className="flex flex-col gap-3">
            <Title
              title="이런 선물은 어때요?"
              description="혼자 사긴 부담되는 선물을 골라봤어요."
            />
            <ChipGroup
              items={CATEGORY_CHIPS}
              value={category}
              onChange={value => setCategory(value as CategoryFilter)}
            />
            {isError && !recommendedProducts && (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <p className="text-semantic-text-secondary [font:var(--semantic-subtext-large)]">
                  추천 상품을 불러오지 못했어요
                </p>
                <Button onClick={() => refetch()}>다시 시도</Button>
              </div>
            )}
            {recommendedProducts && (
              <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                {recommendedProducts.map(product => (
                  <Link key={product.id} href={`/wish/recommended/${product.id}`}>
                    <WishCard
                      productName={product.name}
                      price={product.price}
                      productImageUrl={product.imageUrl}
                      className="w-full"
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
        {!isLoading && (
          <List
            leading={<IconFundingOpen />}
            title="찾는 선물이 없어요"
            description={"상품의 쿠팡 링크를 보내주세요.\n보탬에 추가해 드려요"}
            right={
              <Asset icon={<IconRight />} size="small" className="text-semantic-icon-default" />
            }
          />
        )}
      </div>
    </div>
  );
}
