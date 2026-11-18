"use client";

import { useState } from "react";

import { notFound, useRouter } from "next/navigation";

import ProductDetailFallback from "@/components/ProductDetailFallback";
import ProductDetailView from "@/components/ProductDetailView";
import ProductDetailViewSkeleton from "@/components/skeleton/ProductDetailViewSkeleton";
import { useFriendProfileQuery } from "@/hooks/queries/friend/useFriendProfileQuery";
import { toFundingWish } from "@/utils/friend/toFundingWish";
import { isValidUrl } from "@/utils/isValidUrl";
import FundingOpenSheet from "@/widgets/funding/FundingOpenSheet";

type FriendWishDetailContainerProps = {
  friendId: string;
  wishId: string;
};

// 친구 위시 단건 API가 아직 없어 친구 프로필 응답의 위시 목록에서 찾는다
export default function FriendWishDetailContainer({
  friendId,
  wishId,
}: FriendWishDetailContainerProps) {
  const router = useRouter();
  const { data, isPending, refetch } = useFriendProfileQuery(friendId);
  const [fundingSheetOpen, setFundingSheetOpen] = useState(false);

  if (isPending) return <ProductDetailViewSkeleton />;
  if (!data) {
    return (
      <ProductDetailFallback
        message="위시 정보를 불러오지 못했어요"
        onBack={() => router.back()}
        onRetry={() => refetch()}
      />
    );
  }

  const wish = data.wishes.find(item => String(item.wishId) === wishId);
  if (!wish) notFound();
  const fundingWish = toFundingWish(wish);

  return (
    <div className="flex flex-col">
      <ProductDetailView
        productImageUrl={fundingWish.productImageUrl}
        productName={wish.productName}
        price={wish.price}
        sellerName={wish.sellerName}
        // 서버 값이라도 javascript: 같은 스킴이면 열지 않는다
        sellerDisabled={!isValidUrl(wish.productUrl)}
        onSellerClick={() => window.open(wish.productUrl, "_blank", "noopener,noreferrer")}
        onBack={() => router.back()}
        ctaLabel="친구 몰래 서프라이즈 열기"
        onCtaClick={() => setFundingSheetOpen(true)}
      />
      <FundingOpenSheet
        open={fundingSheetOpen}
        initialWish={fundingWish}
        recipientName={data.name}
        onClose={() => setFundingSheetOpen(false)}
      />
    </div>
  );
}
