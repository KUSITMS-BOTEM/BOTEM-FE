"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import { useParams, useRouter } from "next/navigation";

import Asset from "@/components/Asset";
import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import Header from "@/components/Header";
import List from "@/components/List";
import ListText from "@/components/ListText";
import { useDeleteWishMutation } from "@/hooks/mutations/wish/useDeleteWishMutation";
import { useWishQuery } from "@/hooks/queries/wish/useWishQuery";
import { ApiError } from "@/types/api";
import WishDetailSkeleton from "./skeleton/WishDetailSkeleton";
import IconDelete from "@/assets/icons/icon-delete.svg?react";
import IconInfo from "@/assets/icons/icon-info.svg?react";
import IconLeft from "@/assets/icons/icon-left.svg?react";
import IconRight from "@/assets/icons/icon-right.svg?react";

export default function WishDetail() {
  const router = useRouter();
  const { wishId } = useParams<{ wishId: string }>();
  const { data: wish, error } = useWishQuery(wishId);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { mutate: deleteWish, isPending: isDeletePending } = useDeleteWishMutation(wishId);

  useEffect(() => {
    if (!(error instanceof ApiError)) return;
    // WISH_002: 위시 없음(다른 회원의 위시 포함), AUTH_*: 인증 실패(reissue 실패 포함)
    if (error.code === "WISH_002") router.replace("/not-found");
    else if (error.code.startsWith("AUTH_")) router.replace("/");
  }, [error, router]);

  if (!wish) return <WishDetailSkeleton />;

  return (
    <div className="flex flex-col">
      <div className="relative aspect-square w-full shrink-0">
        <Image
          src={wish.productImageUrl}
          alt={wish.productName}
          fill
          unoptimized
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-black/0 from-[84.444%] to-black/20 to-[160.69%]"
        />
        <Header
          title="위시 상품"
          leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로 가기", onClick: () => router.back() }}
          rightItems={[
            {
              icon: <IconDelete />,
              ariaLabel: "삭제",
              onClick: () => setIsDeleteDialogOpen(true),
            },
          ]}
          className="fixed inset-x-0 top-0 z-10 mx-auto w-full max-w-[440px] pt-[env(safe-area-inset-top)]"
        />
      </div>
      <div className="flex flex-col gap-3 px-5 pt-5">
        <div className="flex w-full flex-col gap-2">
          <ListText
            title={`${wish.price.toLocaleString("ko-KR")}원`}
            description={wish.productName}
            titleUp
            type="price"
          />
          <div className="bg-semantic-fill-neutral-weak rounded-large flex items-center gap-1 p-3">
            <Asset icon={<IconInfo />} size="xsmall" className="text-semantic-icon-default" />
            <p className="text-semantic-text-secondary [font:var(--semantic-subtext-medium)]">
              실제 가격은 구매할 때 달라질 수 있어요
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.open(wish.productUrl, "_blank", "noopener,noreferrer")}
          className="w-full cursor-pointer text-left">
          <List
            title="쿠팡 Apple 공식 브랜드관"
            description="판매처"
            titleUp
            right={
              <Asset icon={<IconRight />} size="small" className="text-semantic-icon-default" />
            }
          />
        </button>
        <div className="flex w-full flex-col items-center pt-10">
          <div className="to-semantic-fill-neutral-weak -mx-5 flex w-[calc(100%+40px)] flex-col gap-6 bg-linear-to-b from-transparent to-[27.355%] px-5 py-8">
            <p className="text-semantic-text-primary [font:var(--semantic-label-x-small)]">Logo</p>
            <p className="text-semantic-text-secondary [font:var(--semantic-subtext-small)]">
              쿠팡 파트너스의 일환으로,
              <br />
              이에 따른 일정액의 수수료를 제공 받습니다.
            </p>
          </div>
        </div>
      </div>
      {/* 하단 고정 BottomCTA(그라데이션 36px + padding-large + 버튼 56px)에 콘텐츠가 가려지지 않도록 같은 높이만큼 스크롤 여백 확보 */}
      <div
        aria-hidden
        className="h-[calc(36px+var(--padding-large)+56px+env(safe-area-inset-bottom))]"
      />
      <BottomCTA>
        <Button color="brand" size="xlarge">
          펀딩 열기
        </Button>
      </BottomCTA>
      <Dialog
        open={isDeleteDialogOpen}
        kind="confirm"
        title="내 위시에서 제거할까요?"
        description="위시 추가는 다시 할 수 있어요"
        confirmColor="danger"
        isPending={isDeletePending}
        onConfirm={() => deleteWish()}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
