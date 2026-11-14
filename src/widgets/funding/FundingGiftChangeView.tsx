import Button from "@/components/Button";
import Header from "@/components/Header";
import InfoBox from "@/components/InfoBox";
import List from "@/components/List";
import ListHeader from "@/components/ListHeader";
import Title from "@/components/Title";
import IconFundingOpen from "@/assets/icons/multicolor/icon-funding-open.svg?react";
import IconLeft from "@/assets/icons/icon-left.svg?react";

export type GiftChangeProduct = {
  id: number;
  productName: string;
  price: number;
  productImageUrl: string;
};

type FundingGiftChangeViewProps = {
  collectedAmount: number;
  currentGift: GiftChangeProduct;
  wishes: GiftChangeProduct[];
  onBack: () => void;
  onSelectCurrentGift: () => void;
  onSelectWish: (wish: GiftChangeProduct) => void;
  onBrowseProducts: () => void;
};

const formatWon = (amount: number) => `${amount.toLocaleString("ko-KR")}원`;

export default function FundingGiftChangeView({
  collectedAmount,
  currentGift,
  wishes,
  onBack,
  onSelectCurrentGift,
  onSelectWish,
  onBrowseProducts,
}: FundingGiftChangeViewProps) {
  const shortfall = Math.max(currentGift.price - collectedAmount, 0);

  const renderSelectButton = (ariaLabel: string, onClick: () => void) => (
    <Button size="small" aria-label={ariaLabel} onClick={onClick}>
      선택
    </Button>
  );

  return (
    <div className="flex flex-col">
      <Header
        title="다른 선물 고르기"
        leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로 가기", onClick: onBack }}
      />
      <main className="flex flex-col gap-3 px-5 pb-8">
        <Title
          type="a2z"
          title={`모인 ${formatWon(collectedAmount)} 안에서\n골라보세요`}
          description="확정된 금액 기준이에요"
        />
        <div className="flex flex-col gap-1">
          <InfoBox
            icon={<IconFundingOpen aria-hidden />}
            text={`기존 선물은 ${formatWon(shortfall)}만 더 보태면 구매할 수 있어요`}
          />
          <List
            type="product"
            thumbnailSrc={currentGift.productImageUrl}
            description={currentGift.productName}
            title={formatWon(currentGift.price)}
            caption="기존 선물"
            titleUp
            textType="price"
            right={renderSelectButton(`${currentGift.productName} 선택`, onSelectCurrentGift)}
          />
        </div>
        {wishes.length > 0 && (
          <section className="flex flex-col gap-0.5">
            <ListHeader title="위시에서 다른 상품 고르기" />
            {wishes.map(wish => (
              <List
                key={wish.id}
                type="product"
                thumbnailSrc={wish.productImageUrl}
                description={wish.productName}
                title={formatWon(wish.price)}
                caption={`남는 금액 ${formatWon(collectedAmount - wish.price)}`}
                titleUp
                textType="price"
                right={renderSelectButton(`${wish.productName} 선택`, () => onSelectWish(wish))}
              />
            ))}
          </section>
        )}
        <ListHeader
          title="위시 상품을 찾아볼까요?"
          rightItem={{ label: "상품 보기", onClick: onBrowseProducts }}
        />
      </main>
    </div>
  );
}
