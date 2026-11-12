"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { useHomeWishesQuery } from "@/hooks/queries/wish/useHomeWishesQuery";
import { useHomeFundingsQuery } from "@/hooks/queries/home/useHomeFundingsQuery";
import FundingOpenSheet from "@/widgets/funding/FundingOpenSheet";
import FloatingButton from "@/widgets/home/FloatingButton";
import HomeFundingTab from "@/widgets/home/HomeFundingTab";
import HomeHeader from "@/widgets/home/HomeHeader";
import HomeWishTab from "@/widgets/home/HomeWishTab";
import type { MenuDropdownItem } from "@/widgets/home/MenuDropdown";
import type { SegmentValue } from "@/widgets/home/SegmentControl";
import MyMenuSheet from "@/widgets/user/MyMenuSheet";
import IconFundingOpen from "@/assets/icons/multicolor/icon-funding-open.svg?react";
import IconWishAdd from "@/assets/icons/multicolor/icon-wish-add.svg?react";

const WISH_ADD_LABEL = "위시 추가";
const RECOMMENDED_WISH_PATH = "/wish/recommended";

const FLOATING_MENU_ITEMS: MenuDropdownItem[] = [
  { icon: <IconWishAdd />, label: WISH_ADD_LABEL },
  { icon: <IconFundingOpen />, label: "펀딩 추가" },
];

// 친구 수·마감된 펀딩 수 API 명세가 나오기 전까지 쓰는 임시값
const TEMP_FRIEND_COUNT = 8;
const TEMP_CLOSED_FUNDING_COUNT = 0;

export default function HomeContainer() {
  useHomeWishesQuery();
  const { data: homeFundings } = useHomeFundingsQuery();
  const [segment, setSegment] = useState<SegmentValue>("funding");
  const router = useRouter();
  const [fundingSheetOpen, setFundingSheetOpen] = useState(false);
  const [menuSheetOpen, setMenuSheetOpen] = useState(false);

  const goToRecommendedWish = () => router.push(RECOMMENDED_WISH_PATH);
  const openFundingSheet = () => {
    if (homeFundings?.canOpenFunding) setFundingSheetOpen(true);
  };
  const handleFloatingMenuSelect = (item: MenuDropdownItem) => {
    if (item.label === WISH_ADD_LABEL) goToRecommendedWish();
    else openFundingSheet();
  };

  const floatingMenuItems = homeFundings?.canOpenFunding
    ? FLOATING_MENU_ITEMS
    : FLOATING_MENU_ITEMS.slice(0, 1);

  return (
    <div className="bg-semantic-background-lower flex min-h-dvh w-full flex-col overflow-x-hidden pb-17">
      <HomeHeader onSegmentChange={setSegment} onMenuClick={() => setMenuSheetOpen(true)} />
      <main className="flex w-full flex-col px-5">
        {segment === "funding" ? (
          <HomeFundingTab onAddWish={goToRecommendedWish} onOpenFunding={openFundingSheet} />
        ) : (
          <HomeWishTab onAddWish={goToRecommendedWish} />
        )}
      </main>
      <FloatingButton items={floatingMenuItems} onSelect={handleFloatingMenuSelect} />
      <FundingOpenSheet open={fundingSheetOpen} onClose={() => setFundingSheetOpen(false)} />
      <MyMenuSheet
        open={menuSheetOpen}
        onClose={() => setMenuSheetOpen(false)}
        friendCount={TEMP_FRIEND_COUNT}
        closedFundingCount={TEMP_CLOSED_FUNDING_COUNT}
      />
    </div>
  );
}
