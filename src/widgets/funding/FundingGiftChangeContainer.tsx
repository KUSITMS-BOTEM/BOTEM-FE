"use client";

import { useRouter } from "next/navigation";

import FundingGiftChangeView, {
  type GiftChangeProduct,
} from "@/widgets/funding/FundingGiftChangeView";

// 선물 변경 API 스펙이 아직 없어 화면 확인용 임시 데이터로 렌더한다. 스펙이 나오면 조회 훅으로 교체할 것
const MOCK_COLLECTED_AMOUNT = 301_000;
const MOCK_CURRENT_GIFT: GiftChangeProduct = {
  id: 1,
  productName: "Airpods Max Pro 3",
  price: 329_000,
  productImageUrl: "https://picsum.photos/seed/botem-gift-1/400",
};
const MOCK_WISHES: GiftChangeProduct[] = [
  {
    id: 2,
    productName: "소니 WH-1000XM5",
    price: 289_000,
    productImageUrl: "https://picsum.photos/seed/botem-gift-2/400",
  },
  {
    id: 3,
    productName: "르크루제 머그",
    price: 39_000,
    productImageUrl: "https://picsum.photos/seed/botem-gift-3/400",
  },
  {
    id: 4,
    productName: "스위치 게임 타이틀",
    price: 64_800,
    productImageUrl: "https://picsum.photos/seed/botem-gift-4/400",
  },
];

export default function FundingGiftChangeContainer() {
  const router = useRouter();

  return (
    <FundingGiftChangeView
      collectedAmount={MOCK_COLLECTED_AMOUNT}
      currentGift={MOCK_CURRENT_GIFT}
      wishes={MOCK_WISHES}
      onBack={() => router.back()}
      onSelectCurrentGift={() => {}}
      onSelectWish={() => {}}
      onBrowseProducts={() => router.push("/wish/recommended")}
    />
  );
}
