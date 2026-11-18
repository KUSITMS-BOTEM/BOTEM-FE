"use client";

import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import List from "@/components/List";
import Title from "@/components/Title";
import type { FriendWishResponse } from "@/types/friend/friend";
import { formatWon } from "@/utils/funding/giftChangeAmount";
import { isValidUrl } from "@/utils/isValidUrl";

type FriendSurpriseWishSheetProps = {
  open: boolean;
  wishes: FriendWishResponse[];
  onClose: () => void;
  onSelect: (wish: FriendWishResponse) => void;
};

export default function FriendSurpriseWishSheet({
  open,
  wishes,
  onClose,
  onSelect,
}: FriendSurpriseWishSheetProps) {
  return (
    <BottomSheet
      open={open}
      title="서프라이즈 위시 선택"
      height="auto"
      headerType="handle"
      showHandleClose
      onClose={onClose}>
      <Title
        type="a2z"
        title={"어떤 위시 상품으로\n서프라이즈를 열까요?"}
        description={"서프라이즈 펀딩은\n받는 사람이 볼 수 없게 비밀로 진행되는 펀딩이에요"}
      />
      <ul className="flex w-full flex-col gap-0.5">
        {wishes.map(wish => (
          <li key={wish.wishId}>
            <List
              type="product"
              textType="price"
              titleUp
              title={formatWon(wish.price)}
              description={wish.productName}
              thumbnailSrc={
                wish.productImageUrl && isValidUrl(wish.productImageUrl)
                  ? wish.productImageUrl
                  : undefined
              }
              right={
                <Button
                  size="small"
                  variant="weak"
                  aria-label={`${wish.productName} 선택하기`}
                  onClick={() => onSelect(wish)}>
                  선택하기
                </Button>
              }
            />
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}
