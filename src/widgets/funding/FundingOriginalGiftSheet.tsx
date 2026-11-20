import BottomSheet from "@/components/BottomSheet";
import InfoBox from "@/components/InfoBox";
import List from "@/components/List";
import Title from "@/components/Title";
import { formatWon, getShortfall } from "@/utils/funding/giftChangeAmount";
import type { GiftChangeProduct } from "@/widgets/funding/FundingGiftChangeView";
import IconFundingOpen from "@/assets/icons/multicolor/icon-funding-open.svg?react";

type FundingOriginalGiftSheetProps = {
  open: boolean;
  collectedAmount: number;
  originalGift: Omit<GiftChangeProduct, "id">;
  onClose: () => void;
};

export default function FundingOriginalGiftSheet({
  open,
  collectedAmount,
  originalGift,
  onClose,
}: FundingOriginalGiftSheetProps) {
  const shortfall = getShortfall(originalGift.price, collectedAmount);

  return (
    <BottomSheet open={open} title="기존 상품" height="auto" onClose={onClose}>
      <Title
        type="a2z"
        title={`총 ${formatWon(collectedAmount)}이 모였어요`}
        description="확정된 금액 기준이에요"
      />
      <div className="flex flex-col gap-1">
        {shortfall > 0 && (
          <InfoBox
            icon={<IconFundingOpen aria-hidden />}
            text={`기존 선물은 ${formatWon(shortfall)}만 더 보태면 구매할 수 있어요`}
          />
        )}
        <List
          type="product"
          thumbnailSrc={originalGift.productImageUrl}
          thumbnailAlt={originalGift.productName}
          description={originalGift.productName}
          title={formatWon(originalGift.price)}
          caption="기존 선물"
          titleUp
          textType="price"
        />
      </div>
    </BottomSheet>
  );
}
