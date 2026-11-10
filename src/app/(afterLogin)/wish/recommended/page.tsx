"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Asset from "@/components/Asset";
import ChipGroup from "@/components/ChipGroup";
import Header from "@/components/Header";
import List from "@/components/List";
import Title from "@/components/Title";
import WishCard from "@/widgets/main/WishCard";

import { useRecommendedProductsQuery } from "@/hooks/queries/recommendedProduct/useRecommendedProductsQuery";
import type { RecommendedProductCategory } from "@/types/recommendedProduct/recommendedProduct";
import { ALL_CATEGORY_VALUE, CATEGORY_CHIPS } from "./constants";
import RecommendedWishListSkeleton from "./skeleton/RecommendedWishListSkeleton";
import IconFundingOpen from "@/assets/icons/multicolor/icon-funding-open.svg?react";
import IconLeft from "@/assets/icons/icon-left.svg?react";
import IconRight from "@/assets/icons/icon-right.svg?react";

export default function RecommendedWishList() {
  const router = useRouter();
  const [category, setCategory] = useState<string>(ALL_CATEGORY_VALUE);
  const { data: recommendedProducts, isLoading } = useRecommendedProductsQuery(
    category === ALL_CATEGORY_VALUE ? undefined : (category as RecommendedProductCategory),
  );

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
            <ChipGroup items={CATEGORY_CHIPS} value={category} onChange={setCategory} />
            {recommendedProducts && (
              <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                {recommendedProducts.map(product => (
                  <WishCard
                    key={product.id}
                    productName={product.name}
                    price={product.price}
                    productImageUrl={product.imageUrl}
                    className="w-full"
                  />
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
