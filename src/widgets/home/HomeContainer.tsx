"use client";

import { Suspense, useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { useHomeWishesQuery } from "@/hooks/queries/wish/useHomeWishesQuery";
import { useHomeFundingsQuery } from "@/hooks/queries/home/useHomeFundingsQuery";
import { useGiftVerificationBannerVariant } from "@/hooks/useGiftVerificationBannerSession";
import type { FundingWish } from "@/types/funding/funding";
import type { HomeWishCardResponse } from "@/types/home/home";
import { getHomePath } from "@/utils/home/getHomePath";
import { isValidUrl } from "@/utils/isValidUrl";
import FundingOpenSheet from "@/widgets/funding/FundingOpenSheet";
import FloatingButton from "@/widgets/home/FloatingButton";
import GiftVerificationBannerLayer from "@/widgets/home/GiftVerificationBannerLayer";
import HomeFundingTab from "@/widgets/home/HomeFundingTab";
import HomeHeader from "@/widgets/home/HomeHeader";
import HomeMyMenuSheet from "@/widgets/home/HomeMyMenuSheet";
import HomeWishTab from "@/widgets/home/HomeWishTab";
import type { MenuDropdownItem } from "@/widgets/home/MenuDropdown";
import type { SegmentValue } from "@/widgets/home/SegmentControl";
import IconFundingOpen from "@/assets/icons/multicolor/icon-funding-open.svg?react";
import IconWishAdd from "@/assets/icons/multicolor/icon-wish-add.svg?react";

const WISH_ADD_LABEL = "위시 추가";
const RECOMMENDED_WISH_PATH = "/wish/recommended";

const FLOATING_MENU_ITEMS: MenuDropdownItem[] = [
  { icon: <IconWishAdd />, label: WISH_ADD_LABEL },
  { icon: <IconFundingOpen />, label: "펀딩 추가" },
];

type HomeContainerProps = {
  autoOpenFunding?: boolean;
};

export default function HomeContainer({ autoOpenFunding = false }: HomeContainerProps) {
  useHomeWishesQuery();
  const { data: homeFundings } = useHomeFundingsQuery();
  const router = useRouter();
  const searchParams = useSearchParams();
  const segment: SegmentValue = searchParams.get("tab") === "wish" ? "wish" : "funding";
  const [fundingSheetOpen, setFundingSheetOpen] = useState(false);
  // 추천 위시 카드에서 열면 위시 선택을 건너뛰고 이 위시의 펀딩 정보부터 시작한다
  const [fundingWish, setFundingWish] = useState<FundingWish | null>(null);
  const giftVerificationBannerVariant = useGiftVerificationBannerVariant();

  // 공유 화면의 "나도 만들기"(/home?open=funding)로 들어오면 한 번 열고 쿼리를 지운다
  const [autoOpenHandled, setAutoOpenHandled] = useState(false);
  const shouldAutoOpen = autoOpenFunding && !!homeFundings && !autoOpenHandled;
  if (shouldAutoOpen) {
    setAutoOpenHandled(true);
    if (homeFundings.canOpenFunding) setFundingSheetOpen(true);
  }
  useEffect(() => {
    if (!autoOpenHandled) return;
    // searchParams를 의존성에 넣으면 replace로 쿼리가 바뀔 때마다 다시 실행되므로 현재 URL을 직접 읽는다
    const current = new URLSearchParams(window.location.search);
    router.replace(getHomePath(current, { open: null }), { scroll: false });
  }, [autoOpenHandled, router]);

  // 홈 page가 searchParams를 읽는 동적 라우트라 router.replace는 탭마다 서버를 다시 거친다. history API는 useSearchParams만 갱신한다
  const changeSegment = (value: SegmentValue) =>
    window.history.replaceState(
      null,
      "",
      getHomePath(searchParams, { tab: value === "wish" ? "wish" : null }),
    );

  const goToRecommendedWish = () => router.push(RECOMMENDED_WISH_PATH);
  const openFundingSheet = (wish: FundingWish | null = null) => {
    if (!homeFundings?.canOpenFunding) return;
    setFundingWish(wish);
    setFundingSheetOpen(true);
  };
  const openWishFunding = (wish: HomeWishCardResponse) =>
    openFundingSheet({
      id: wish.wishId,
      productName: wish.productName,
      price: wish.price,
      productImageUrl: isValidUrl(wish.productImageUrl) ? wish.productImageUrl : undefined,
    });
  const handleFloatingMenuSelect = (item: MenuDropdownItem) => {
    if (item.label === WISH_ADD_LABEL) goToRecommendedWish();
    else openFundingSheet();
  };

  const floatingMenuItems = homeFundings?.canOpenFunding
    ? FLOATING_MENU_ITEMS
    : FLOATING_MENU_ITEMS.slice(0, 1);

  return (
    <div className="bg-semantic-background-lower flex min-h-dvh w-full flex-col overflow-x-hidden pb-17">
      <HomeHeader
        segment={segment}
        onSegmentChange={changeSegment}
        onMenuClick={() =>
          router.replace(getHomePath(searchParams, { menu: "open" }), { scroll: false })
        }
      />
      <main className="flex w-full flex-col px-5">
        {segment === "funding" ? (
          <GiftVerificationBannerLayer variant={giftVerificationBannerVariant}>
            {banner => (
              <HomeFundingTab
                onAddWish={goToRecommendedWish}
                onOpenFunding={openWishFunding}
                banner={banner}
              />
            )}
          </GiftVerificationBannerLayer>
        ) : (
          <HomeWishTab onAddWish={goToRecommendedWish} />
        )}
      </main>
      <FloatingButton items={floatingMenuItems} onSelect={handleFloatingMenuSelect} />
      <FundingOpenSheet
        // 시트는 initialWish를 처음 마운트할 때만 읽으므로 위시가 바뀌면 새로 마운트한다
        key={fundingWish?.id ?? "select"}
        open={fundingSheetOpen}
        initialWish={fundingWish ?? undefined}
        onClose={() => setFundingSheetOpen(false)}
      />
      <Suspense fallback={null}>
        <HomeMyMenuSheet />
      </Suspense>
    </div>
  );
}
