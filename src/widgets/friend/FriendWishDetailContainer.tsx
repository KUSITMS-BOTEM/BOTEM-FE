"use client";

import { useState } from "react";

import { notFound, useRouter } from "next/navigation";

import FundingLimitNotice from "@/components/FundingLimitNotice";
import ProductDetailFallback from "@/components/ProductDetailFallback";
import ProductDetailView from "@/components/ProductDetailView";
import ProductDetailViewSkeleton from "@/components/skeleton/ProductDetailViewSkeleton";
import { useFriendProfileQuery } from "@/hooks/queries/friend/useFriendProfileQuery";
import { useFriendWishQuery } from "@/hooks/queries/friend/useFriendWishQuery";
import { useHomeFundingsQuery } from "@/hooks/queries/home/useHomeFundingsQuery";
import { ApiError } from "@/types/api";
import { toFundingWish } from "@/utils/friend/toFundingWish";
import { isValidUrl } from "@/utils/isValidUrl";
import SurpriseOpenSheet from "@/widgets/funding/SurpriseOpenSheet";

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
  const {
    data: homeFundings,
    isPending: isFundingLimitPending,
    isError: isFundingLimitError,
  } = useHomeFundingsQuery();
  const data = profileQuery.data;
  const wish = wishQuery.data;

  if (profileQuery.isPending || wishQuery.isPending) return <ProductDetailViewSkeleton />;
  // FRIEND_002: 친구가 아니거나 친구의 위시가 아님 — 재시도로 풀리지 않는 영구 실패
  if (wishQuery.error instanceof ApiError && wishQuery.error.code === "FRIEND_002") notFound();
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
  // 이 친구를 위한 진행 중 서프라이즈가 있으면(친구당 1개) 새로 열지 않고 그 펀딩에 보탠다
  const activeFundingId = wish.activeSurpriseFundingId;
  // 같이 보태기는 새로 개설하지 않아 내 개설 한도와 무관하다
  // 조회에 실패하면(재조회 실패로 이전 값이 남아도) 막지 않고 개설 요청의 서버 판정(FUNDING_019)에 맡긴다
  const isLimitReached =
    !activeFundingId && !isFundingLimitError && homeFundings?.canOpenFunding === false;

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
        ctaLabel={activeFundingId ? "같이 보태기" : "친구 몰래 서프라이즈 열기"}
        onCtaClick={() =>
          // TODO(API): 참여 화면은 /share/{shareKey}인데 응답엔 fundingId뿐이라 지금 경로는 404다. 서프라이즈 참여 작업에서 shareKey를 받아(BE 요청) 경로를 바꾼다
          activeFundingId ? router.push(`/share/${activeFundingId}`) : setFundingSheetOpen(true)
        }
        ctaDisabled={!activeFundingId && (isFundingLimitPending || isLimitReached)}
        ctaUpper={isLimitReached ? <FundingLimitNotice /> : undefined}
      />
      <SurpriseOpenSheet
        open={fundingSheetOpen}
        wish={fundingWish}
        recipientId={friendId}
        recipientName={data.name}
        recipientBirthday={data.birthday}
        recipientBirthdayDday={data.birthdayDday}
        onClose={() => setFundingSheetOpen(false)}
      />
    </div>
  );
}
