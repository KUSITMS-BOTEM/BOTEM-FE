"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Asset from "@/components/Asset";
import ChipGroup from "@/components/ChipGroup";
import Header from "@/components/Header";
import List from "@/components/List";
import Title from "@/components/Title";
import WishCard from "@/widgets/main/WishCard";

import { CATEGORIES, RECOMMENDED_WISHES } from "./constants";
import IconFundingOpen from "@/assets/icons/multicolor/icon-funding-open.svg?react";
import IconLeft from "@/assets/icons/icon-left.svg?react";
import IconRight from "@/assets/icons/icon-right.svg?react";

export default function RecommendedWishList() {
  const router = useRouter();
  const [category, setCategory] = useState(CATEGORIES[0].value);

  return (
    <div className="flex flex-col">
      <Header
        title="위시 추가"
        leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로 가기", onClick: () => router.back() }}
      />
      <div className="flex flex-col gap-6 px-5 pb-8">
        <div className="flex flex-col gap-3">
          <Title title="이런 선물은 어때요?" description="혼자 사긴 부담되는 선물을 골라봤어요." />
          <ChipGroup items={CATEGORIES} value={category} onChange={setCategory} />
          <div className="grid grid-cols-2 gap-x-3 gap-y-4">
            {RECOMMENDED_WISHES.map(wish => (
              <WishCard
                key={wish.id}
                productName={wish.productName}
                price={wish.price}
                productImageUrl={wish.productImageUrl}
                className="w-full"
              />
            ))}
          </div>
        </div>
        <List
          leading={<IconFundingOpen />}
          title="찾는 선물이 없어요"
          description={"상품의 쿠팡 링크를 보내주세요.\n보탬에 추가해 드려요"}
          right={<Asset icon={<IconRight />} size="small" className="text-semantic-icon-default" />}
        />
      </div>
    </div>
  );
}
