"use client";

import { useState } from "react";

import { useWishesQuery } from "@/hooks/queries/wish/useWishesQuery";
import { consumeWishPromptPending } from "@/utils/wish/wishPromptStorage";
import FundingOpenBottomSheet from "@/widgets/funding/FundingOpenBottomSheet";
import FloatingButton from "@/widgets/home/FloatingButton";
import HomeFundingTab from "@/widgets/home/HomeFundingTab";
import HomeHeader from "@/widgets/home/HomeHeader";
import HomeWishTab from "@/widgets/home/HomeWishTab";
import type { MenuDropdownItem } from "@/widgets/home/MenuDropdown";
import type { SegmentValue } from "@/widgets/home/SegmentControl";
import AddWishBottomSheet from "@/widgets/wish/AddWishBottomSheet";
import IconFundingOpen from "@/assets/icons/multicolor/icon-funding-open.svg?react";
import IconWishAdd from "@/assets/icons/multicolor/icon-wish-add.svg?react";

const WISH_ADD_LABEL = "위시 추가";

const FLOATING_MENU_ITEMS: MenuDropdownItem[] = [
  { icon: <IconWishAdd />, label: WISH_ADD_LABEL },
  { icon: <IconFundingOpen />, label: "펀딩 추가" },
];

export default function HomeContainer() {
  // 위시 탭을 누르기 전에 미리 받아 두어, 탭 전환 시 캐시에서 바로 보여준다
  useWishesQuery();
  const [segment, setSegment] = useState<SegmentValue>("funding");
  // 온보딩을 막 완료한 유저만 진입 시 1회 자동으로 뜨도록, 기존 유저는 등장하지 않는다
  const [wishSheetOpen, setWishSheetOpen] = useState(() => consumeWishPromptPending());
  const [fundingSheetOpen, setFundingSheetOpen] = useState(false);

  const openWishSheet = () => setWishSheetOpen(true);
  const handleFloatingMenuSelect = (item: MenuDropdownItem) => {
    if (item.label === WISH_ADD_LABEL) setWishSheetOpen(true);
    else setFundingSheetOpen(true);
  };

  return (
    <div className="bg-semantic-background-lower flex min-h-dvh w-full flex-col overflow-x-hidden pb-17">
      <HomeHeader onSegmentChange={setSegment} />
      <main className="flex w-full flex-col px-5">
        {segment === "funding" ? (
          <HomeFundingTab onAddWish={openWishSheet} />
        ) : (
          <HomeWishTab onAddWish={openWishSheet} />
        )}
      </main>
      <FloatingButton items={FLOATING_MENU_ITEMS} onSelect={handleFloatingMenuSelect} />
      <FundingOpenBottomSheet open={fundingSheetOpen} onClose={() => setFundingSheetOpen(false)} />
      <AddWishBottomSheet
        open={wishSheetOpen}
        onClose={() => setWishSheetOpen(false)}
        onSubmit={() => setWishSheetOpen(false)}
      />
    </div>
  );
}
