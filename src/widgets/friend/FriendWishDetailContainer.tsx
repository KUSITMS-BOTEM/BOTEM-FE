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

export default function FriendWishDetailContainer({
  friendId,
  wishId,
}: FriendWishDetailContainerProps) {
  const router = useRouter();
  const { data: wish, isPending, refetch } = useFriendWishQuery(friendId, wishId);
  // 위시 상세 응답에 친구 이름이 없어 펀딩 시트의 받는 사람 이름은 프로필 조회(목록에서 왔다면 캐시)로 채운다
  // 이름 없이 시트를 열면 서프라이즈가 아닌 일반 펀딩으로 개설되므로 프로필이 올 때까지 CTA를 막는다
  const { data: profile, isPending: profilePending } = useFriendProfileQuery(friendId);
  const [fundingSheetOpen, setFundingSheetOpen] = useState(false);

  if (isPending) return <ProductDetailViewSkeleton />;
  if (!wish) {
    return (
      <ProductDetailFallback
        message="위시 정보를 불러오지 못했어요"
        onBack={() => router.back()}
        onRetry={() => refetch()}
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
        ctaPending={profilePending}
        ctaDisabled={!profile}
      />
      <FundingOpenSheet
        open={fundingSheetOpen}
        initialWish={fundingWish}
        recipientName={profile?.name}
        recipientId={friendId}
        onClose={() => setFundingSheetOpen(false)}
      />
    </div>
  );
}
