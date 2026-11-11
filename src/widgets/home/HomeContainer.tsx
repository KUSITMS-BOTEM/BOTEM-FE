"use client";

import { useState } from "react";

import { useWishesQuery } from "@/hooks/queries/wish/useWishesQuery";
import { useHomeFundingsQuery } from "@/hooks/queries/home/useHomeFundingsQuery";
import { consumeWishPromptPending } from "@/utils/wish/wishPromptStorage";
import FundingOpenSheet from "@/widgets/funding/FundingOpenSheet";
import FloatingButton from "@/widgets/home/FloatingButton";
import HomeFundingTab from "@/widgets/home/HomeFundingTab";
import HomeHeader from "@/widgets/home/HomeHeader";
import HomeWishTab from "@/widgets/home/HomeWishTab";
import type { MenuDropdownItem } from "@/widgets/home/MenuDropdown";
import type { SegmentValue } from "@/widgets/home/SegmentControl";
import MyMenuSheet from "@/widgets/user/MyMenuSheet";
import AddWishBottomSheet from "@/widgets/wish/AddWishBottomSheet";
import IconFundingOpen from "@/assets/icons/multicolor/icon-funding-open.svg?react";
import IconWishAdd from "@/assets/icons/multicolor/icon-wish-add.svg?react";

const WISH_ADD_LABEL = "위시 추가";

const FLOATING_MENU_ITEMS: MenuDropdownItem[] = [
  { icon: <IconWishAdd />, label: WISH_ADD_LABEL },
  { icon: <IconFundingOpen />, label: "펀딩 추가" },
];

// 친구 수·마감된 펀딩 수 API 명세가 나오기 전까지 쓰는 임시값
const TEMP_FRIEND_COUNT = 8;
const TEMP_CLOSED_FUNDING_COUNT = 0;

export default function HomeContainer() {
  useWishesQuery();
  const { data: homeFundings } = useHomeFundingsQuery();
  const [segment, setSegment] = useState<SegmentValue>("funding");
  const [wishSheetOpen, setWishSheetOpen] = useState(() => consumeWishPromptPending());
  const [fundingSheetOpen, setFundingSheetOpen] = useState(false);
  const [menuSheetOpen, setMenuSheetOpen] = useState(false);

  const openWishSheet = () => setWishSheetOpen(true);
  const openFundingSheet = () => {
    if (homeFundings?.canOpenFunding) setFundingSheetOpen(true);
  };
  const handleFloatingMenuSelect = (item: MenuDropdownItem) => {
    if (item.label === WISH_ADD_LABEL) setWishSheetOpen(true);
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
          <HomeFundingTab onAddWish={openWishSheet} onOpenFunding={openFundingSheet} />
        ) : (
          <HomeWishTab onAddWish={openWishSheet} />
        )}
      </main>
      <FloatingButton items={floatingMenuItems} onSelect={handleFloatingMenuSelect} />
      <FundingOpenSheet open={fundingSheetOpen} onClose={() => setFundingSheetOpen(false)} />
      <AddWishBottomSheet
        open={wishSheetOpen}
        onClose={() => setWishSheetOpen(false)}
        onSubmit={() => setWishSheetOpen(false)}
      />
      <MyMenuSheet
        open={menuSheetOpen}
        onClose={() => setMenuSheetOpen(false)}
        friendCount={TEMP_FRIEND_COUNT}
        closedFundingCount={TEMP_CLOSED_FUNDING_COUNT}
      />
    </div>
  );
}
