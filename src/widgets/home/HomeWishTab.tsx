import Link from "next/link";

import Asset from "@/components/Asset";
import Button from "@/components/Button";
import ToastMessage from "@/components/ToastMessage";
import { APP_MAX_WIDTH_CLASS } from "@/constants/layout";
import { useHomeFundingsQuery } from "@/hooks/queries/home/useHomeFundingsQuery";
import { useHomeWishesQuery } from "@/hooks/queries/wish/useHomeWishesQuery";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { useShareLink } from "@/hooks/useShareLink";
import { cn } from "@/utils/cn";
import { getDisplayName } from "@/utils/user/getDisplayName";
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
  const { data: homeFundings } = useHomeFundingsQuery();
  const { toast, copyLink } = useShareLink();
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
  // 위시의 FUNDING status는 마감한 펀딩도 포함하므로(완료·취소 전까지) 진행 중 여부는 홈 펀딩 카드로 판정한다
  const inProgressFundingIds =
    homeFundings?.fundingCards
      .filter(card => card.cardType === "IN_PROGRESS")
      .map(card => card.fundingId) ?? [];

  if (isError && !data)
    return <HomeLoadError message="위시를 불러오지 못했어요" onRetry={() => refetch()} />;
  if (!data || !profile) return <HomeWishTabSkeleton />;
  if (wishes.length === 0) return <HomeEmptyView onAddWish={onAddWish} />;

  return (
    <section className="flex w-full flex-col gap-1">
      <div className="flex h-[51px] w-full items-center justify-between">
        <div className="flex items-center gap-1">
          <h2 className="text-semantic-text-strong [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-title-a2-z-small-weak)]">
            {getDisplayName(profile)}의 위시
          </h2>
          {/* IconButton은 24px 아이콘을 여백 없이 담는 크기가 없어 제목과의 간격이 벌어지므로 직접 만든다 */}
          <button
            type="button"
            aria-label="위시 프로필 링크 복사"
            disabled={!profile.wishProfileUrl}
            onClick={() => copyLink(profile.wishProfileUrl)}
            className="relative inline-flex cursor-pointer rounded-full transition-transform before:absolute before:-inset-2 before:content-[''] active:scale-95 disabled:cursor-not-allowed disabled:opacity-30">
            <Asset icon={<IconLink />} size="medium" className="text-semantic-icon-brand" />
          </button>
        </div>
        <p className="text-semantic-text-tertiary [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-label-x-small-weak)]">
          위시 {data.pages[0]?.totalElements ?? 0}개
        </p>
      </div>
      <ul className="grid w-full grid-cols-2 gap-x-3 gap-y-4 pb-5">
        {wishes.map(wish => (
          <li key={wish.id} className="min-w-0">
            <Link href={`/wish/${wish.id}`} className="block">
              <WishCard
                type={
                  inProgressFundingIds.some(id => id === wish.fundingId) ? "funding" : "default"
                }
                productName={wish.productName}
                price={wish.price}
                productImageUrl={wish.productImageUrl}
                className="w-full"
              />
            </Link>
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
      {/* 우하단 플로팅 버튼과 겹치지 않게 그 위에 띄운다 */}
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-20 mx-auto flex w-full justify-center",
          APP_MAX_WIDTH_CLASS,
        )}>
        <ToastMessage
          show={toast !== null}
          state={toast === "success"}
          text={toast === "fail" ? "링크를 복사하지 못했어요" : "위시 프로필 링크가 복사되었습니다"}
        />
      </div>
    </section>
  );
}
