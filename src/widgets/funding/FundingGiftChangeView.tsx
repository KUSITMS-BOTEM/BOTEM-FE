import Header from "@/components/Header";
import InfoBox from "@/components/InfoBox";
import List from "@/components/List";
import ListHeader from "@/components/ListHeader";
import PageExitMotion from "@/components/effects/PageExitMotion";
import Title from "@/components/Title";
import { usePageExit } from "@/hooks/usePageExit";
import { formatWon, getRemainingAmount, getShortfall } from "@/utils/funding/giftChangeAmount";
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
  // 기존 선물의 위시를 찾지 못하면 넘겨주지 않아 행을 누를 수 없게 한다
  onSelectCurrentGift?: () => void;
  onSelectWish: (wish: GiftChangeProduct) => void;
  onBrowseProducts: () => void;
};

export default function FundingGiftChangeView({
  collectedAmount,
  currentGift,
  wishes,
  onBack,
  onSelectCurrentGift,
  onSelectWish,
  onBrowseProducts,
}: FundingGiftChangeViewProps) {
  const { pageExit, exitPage } = usePageExit();
  const shortfall = getShortfall(currentGift.price, collectedAmount);

  return (
    <PageExitMotion exit={pageExit}>
      <div className="flex flex-col">
        <Header
          title="다른 선물 고르기"
          leftItem={{
            icon: <IconLeft />,
            ariaLabel: "뒤로 가기",
            onClick: () => exitPage("slide", onBack),
          }}
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
              onClick={onSelectCurrentGift}
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
                  caption={`남는 금액 ${formatWon(getRemainingAmount(collectedAmount, wish.price))}`}
                  titleUp
                  textType="price"
                  onClick={() => onSelectWish(wish)}
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
    </PageExitMotion>
  );
}
