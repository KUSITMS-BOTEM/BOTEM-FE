import Asset from "@/components/Asset";
import Button from "@/components/Button";
import { useHomeWishesQuery } from "@/hooks/queries/wish/useHomeWishesQuery";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import HomeEmptyView from "@/widgets/home/HomeEmptyView";
import HomeLoadError from "@/widgets/home/HomeLoadError";
import HomeWishTabSkeleton from "@/widgets/home/skeleton/HomeWishTabSkeleton";
import WishCard from "@/widgets/wish/WishCard";
import IconLink from "@/assets/icons/icon-link.svg?react";

type HomeWishTabProps = {
  onAddWish: () => void;
};

export default function HomeWishTab({ onAddWish }: HomeWishTabProps) {
  const { data: profile } = useMyProfileQuery();
  const {
    data,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useHomeWishesQuery();
  const wishes = data?.pages.flatMap(page => page?.content ?? []) ?? [];

  if (isError && !data)
    return <HomeLoadError message="위시를 불러오지 못했어요" onRetry={() => refetch()} />;
  if (!data || !profile) return <HomeWishTabSkeleton />;
  if (wishes.length === 0) return <HomeEmptyView onAddWish={onAddWish} />;

  return (
    <section className="flex w-full flex-col gap-1">
      <div className="flex h-[51px] w-full items-center justify-between">
        <div className="flex items-center gap-0.5">
          <h2 className="text-semantic-text-strong [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-title-a2-z-small-weak)]">
            {profile.nickname}의 위시
          </h2>
          {/* 공유 플로우가 정해지면 링크 복사 동작을 연결한다 */}
          <Asset icon={<IconLink />} size="medium" className="text-semantic-icon-brand" />
        </div>
        <p className="text-semantic-text-tertiary [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-label-x-small-weak)]">
          위시 {data.pages[0]?.totalElements ?? 0}개
        </p>
      </div>
      <ul className="grid w-full grid-cols-2 gap-x-3 gap-y-4 pb-5">
        {wishes.map(wish => (
          <li key={wish.id} className="min-w-0">
            <WishCard
              type={wish.status === "FUNDING" ? "funding" : "default"}
              productName={wish.productName}
              price={wish.price}
              productImageUrl={wish.productImageUrl}
              className="w-full"
            />
          </li>
        ))}
      </ul>
      {(hasNextPage || isFetchNextPageError) && (
        <Button
          color="neutral"
          variant="weak"
          disabled={isFetchingNextPage}
          states={isFetchingNextPage ? "loading" : "default"}
          onClick={() => fetchNextPage()}
          className="w-full">
          {isFetchNextPageError ? "다시 시도" : "더 보기"}
        </Button>
      )}
    </section>
  );
}
