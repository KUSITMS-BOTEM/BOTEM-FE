"use client";

import { useRouter } from "next/navigation";

import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import List from "@/components/List";
import ListHeader from "@/components/ListHeader";
import ShimmerBar from "@/components/skeleton/ShimmerBar";
import Title from "@/components/Title";
import { useWishesQuery } from "@/hooks/queries/wish/useWishesQuery";

// 임시 처리: 위시를 최대 3개만 보여준다. 디자인·기획팀과 상의가 필요한 부분(4개 이상일 때의 노출 방식 등)이다.
const MAX_SELECTABLE_WISH_COUNT = 3;

type FundingOpenBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  className?: string;
};

export default function FundingOpenBottomSheet({
  open,
  onClose,
  className,
}: FundingOpenBottomSheetProps) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useWishesQuery({ enabled: open });

  // 서버가 이미 최신순(createdAt desc)으로 첫 페이지(기본 10개)를 주므로 그 안에서 AVAILABLE만 앞에서 3개 고른다.
  // 3개 미만이어도 다음 페이지를 더 조회해 채우지 않는다 — 지금은 위시를 많이 가진 사용자가 없어 YAGNI.
  // TODO: 사용자가 늘어 첫 페이지에 AVAILABLE이 3개 미만인 경우가 생기면 다음 페이지 조회까지 상세히 다룬다.
  const wishes = data?.content
    .filter(wish => wish.status === "AVAILABLE")
    .slice(0, MAX_SELECTABLE_WISH_COUNT);

  return (
    <BottomSheet open={open} title="펀딩 열기" height="max" onClose={onClose} className={className}>
      <div className="flex w-full flex-col gap-4">
        <Title type="a2z" title="어떤 선물을 받고 싶나요?" />
        <div className="flex flex-col gap-0.5">
          <ListHeader title="내 위시에서 고르기" />
          {isLoading && (
            <div aria-busy className="flex flex-col gap-3 py-3">
              {Array.from({ length: MAX_SELECTABLE_WISH_COUNT }, (_, index) => (
                <ShimmerBar key={index} className="h-14 w-full" />
              ))}
            </div>
          )}
          {isError && (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <p className="text-semantic-text-secondary [font:var(--semantic-subtext-large)]">
                위시를 불러오지 못했어요
              </p>
              <Button onClick={() => refetch()}>다시 시도</Button>
            </div>
          )}
          {wishes && wishes.length === 0 && (
            <p className="text-semantic-text-secondary py-10 text-center [font:var(--semantic-subtext-large)]">
              펀딩으로 열 수 있는 위시가 없어요
            </p>
          )}
          {wishes?.map(wish => (
            <List
              key={wish.id}
              type="product"
              thumbnailSrc={wish.productImageUrl}
              title={`${wish.price.toLocaleString("ko-KR")}원`}
              description={wish.productName}
              titleUp
              textType="price"
            />
          ))}
        </div>
        <ListHeader
          bg
          title="위시 상품을 찾아볼까요?"
          rightItem={{ label: "상품 보기", onClick: () => router.push("/wish/recommended") }}
        />
      </div>
    </BottomSheet>
  );
}
