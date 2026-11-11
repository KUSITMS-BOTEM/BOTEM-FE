import Title from "@/components/Title";
import FundingCardCarousel, { type FundingCardData } from "@/widgets/home/FundingCardCarousel";

type HomeFundingViewProps = {
  cards: FundingCardData[];
};

export default function HomeFundingView({ cards }: HomeFundingViewProps) {
  return (
    <section className="flex w-full flex-col items-center gap-1">
      <Title type="a2z" title={"작은 보탬들이\n차곡차곡 쌓이고 있어요"} />
      <FundingCardCarousel cards={cards} />
    </section>
  );
}
