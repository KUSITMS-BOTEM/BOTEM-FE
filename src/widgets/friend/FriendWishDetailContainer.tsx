"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import ProductDetailFallback from "@/components/ProductDetailFallback";
import ProductDetailView from "@/components/ProductDetailView";
import ProductDetailViewSkeleton from "@/components/skeleton/ProductDetailViewSkeleton";
import { useFriendProfileQuery } from "@/hooks/queries/friend/useFriendProfileQuery";
import { useFriendWishQuery } from "@/hooks/queries/friend/useFriendWishQuery";
import { toFundingWish } from "@/utils/friend/toFundingWish";
import { isValidUrl } from "@/utils/isValidUrl";
import FundingOpenSheet from "@/widgets/funding/FundingOpenSheet";

type FriendWishDetailContainerProps = {
  friendId: string;
  wishId: string;
};

// 위시 상세(판매처·링크)는 위시 상세 API, 받는 사람 정보(이름·생일)는 친구 프로필 응답에서 가져온다
export default function FriendWishDetailContainer({
  friendId,
  wishId,
}: FriendWishDetailContainerProps) {
  const router = useRouter();
  const profileQuery = useFriendProfileQuery(friendId);
  const wishQuery = useFriendWishQuery(friendId, wishId);
  const [fundingSheetOpen, setFundingSheetOpen] = useState(false);
  const data = profileQuery.data;
  const wish = wishQuery.data;

  if (profileQuery.isPending || wishQuery.isPending) return <ProductDetailViewSkeleton />;
  if (!data || !wish) {
    return (
      <ProductDetailFallback
        message="위시 정보를 불러오지 못했어요"
        onBack={() => router.back()}
        onRetry={() => {
          if (!data) profileQuery.refetch();
          if (!wish) wishQuery.refetch();
        }}
      />
    );
  }

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
        recipientId={friendId}
        onClose={() => setFundingSheetOpen(false)}
      />
    </div>
  );
}
