import Title from "@/components/Title";
import WishCard from "@/widgets/wish/WishCard";
import type { HomeWishCardResponse } from "@/types/home/home";

type HomeWishRecommendationProps = {
  nickname: string;
  wishes: HomeWishCardResponse[];
};

export default function HomeWishRecommendation({ nickname, wishes }: HomeWishRecommendationProps) {
  return (
    <section className="flex w-full flex-col gap-1">
      <Title
        type="a2z"
        title={`${nickname}님,\n펀딩 열어볼까요?`}
        description="담아둔 위시로 바로 열 수 있어요"
      />
      <ul className="-mx-5 -mb-7 flex [scrollbar-width:none] gap-3 overflow-x-auto px-5 pb-12 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {wishes.map(wish => (
          <li key={wish.wishId} className="shrink-0">
            {/* 펀딩 개설 화면이 생기면 onOpenFunding을 연결한다 */}
            <WishCard
              type="button"
              productName={wish.productName}
              price={wish.price}
              productImageUrl={wish.productImageUrl}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
