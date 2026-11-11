import Button from "@/components/Button";
import Title from "@/components/Title";
import PlaceholderMarqueeRow from "@/widgets/home/PlaceholderMarqueeRow";

type HomeEmptyViewProps = {
  onAddWish: () => void;
};

export default function HomeEmptyView({ onAddWish }: HomeEmptyViewProps) {
  return (
    <section className="flex w-full flex-col gap-6">
      <Title type="a2z" title={"갖고 싶은걸\n먼저 담아볼까요?"} />
      <Button color="brand" size="xlarge" onClick={onAddWish} className="w-full">
        위시 추가하기
      </Button>
      <div aria-hidden className="-mx-5 flex flex-col gap-2.5 overflow-hidden">
        <PlaceholderMarqueeRow direction="right" />
        <PlaceholderMarqueeRow direction="left" />
      </div>
    </section>
  );
}
