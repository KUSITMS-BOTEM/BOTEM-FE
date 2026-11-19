"use client";

import { useEffect, useState } from "react";

import { notFound, useParams, useRouter } from "next/navigation";

import { showGlobalErrorDialog } from "@/lib/queryClient";
import Dialog from "@/components/Dialog";
import { useDeleteWishMutation } from "@/hooks/mutations/wish/useDeleteWishMutation";
import { useWishQuery } from "@/hooks/queries/wish/useWishQuery";
import ProductDetailFallback from "@/components/ProductDetailFallback";
import ToastMessage from "@/components/ToastMessage";
import { useWishAddedToastStore } from "@/store/wishAddedToastStore";
import ProductDetailView from "@/components/ProductDetailView";
import ProductDetailViewSkeleton from "@/components/skeleton/ProductDetailViewSkeleton";
import { isValidUrl } from "@/utils/isValidUrl";
import { resolveWishErrorAction } from "@/utils/wish/resolveWishErrorAction";
import IconDelete from "@/assets/icons/icon-delete.svg?react";

const ADDED_TOAST_DURATION_MS = 1000;

export default function WishDetailContainer() {
  const router = useRouter();
  const { wishId } = useParams<{ wishId: string }>();
  const { data: wish, error, isLoading, refetch } = useWishQuery(wishId);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { mutate: deleteWish, isPending: isDeletePending } = useDeleteWishMutation(wishId);
  const errorAction = resolveWishErrorAction(error);
  // 위시 담기 직후 이동해 온 경우에만 토스트를 보여준다(초기값으로 읽고, 새로고침·재방문엔 안 뜨도록 아래서 비운다)
  const [showAddedToast, setShowAddedToast] = useState(
    () => useWishAddedToastStore.getState().pending,
  );

  useEffect(() => {
    useWishAddedToastStore.getState().consume();
  }, []);

  // 소비 effect와 분리: StrictMode가 effect를 두 번 돌려도 타이머가 지워지지 않게 한다
  useEffect(() => {
    if (!showAddedToast) return;
    const timer = setTimeout(() => setShowAddedToast(false), ADDED_TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showAddedToast]);

  useEffect(() => {
    if (errorAction === "unauthorized") router.replace("/");
    else if (errorAction === "alert" && error) showGlobalErrorDialog(error);
  }, [errorAction, error, router]);

  if (errorAction === "notFound") notFound();
  if (isLoading) return <ProductDetailViewSkeleton />;
  if (!wish) {
    return (
      <ProductDetailFallback
        message="위시 정보를 불러오지 못했어요"
        onBack={() => router.back()}
        onRetry={() => refetch()}
      />
    );
  }

  const { fundingId } = wish;
  const isFunding = wish.status === "FUNDING";

  // TODO: wish.status === "DISCONTINUED"일 때 다른 디자인을 보여줄 예정 — 디자인 미정이라 분기는 보류
  return (
    <div className="flex flex-col">
      <ProductDetailView
        productImageUrl={wish.productImageUrl}
        productName={wish.productName}
        price={wish.price}
        sellerName={wish.sellerName}
        // 서버 값이라도 javascript: 같은 스킴이면 열지 않는다
        sellerDisabled={!isValidUrl(wish.productUrl)}
        onSellerClick={() => window.open(wish.productUrl, "_blank", "noopener,noreferrer")}
        // 진행 중인 펀딩에 쓰이는 위시는 삭제할 수 없어 휴지통을 숨긴다
        rightItems={
          isFunding
            ? undefined
            : [
                {
                  icon: <IconDelete />,
                  ariaLabel: "삭제",
                  onClick: () => setIsDeleteDialogOpen(true),
                },
              ]
        }
        onBack={() => router.back()}
        statusBadge={isFunding ? "펀딩중" : undefined}
        ctaLabel={isFunding ? "해당 상품 펀딩 보러가기" : "이 상품으로 펀딩 열기"}
        onCtaClick={
          isFunding && fundingId != null ? () => router.push(`/funding/${fundingId}`) : undefined
        }
        ctaHelperText={isFunding ? "펀딩 진행중인 위시 상품은 삭제할 수 없어요" : undefined}
      />
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
      <ToastMessage
        show={showAddedToast}
        state
        text="위시에 추가됐어요"
        className="pointer-events-none fixed bottom-32 left-1/2 z-20 -translate-x-1/2"
      />
    </div>
  );
}
