"use client";

import { useEffect, useState } from "react";

import { notFound, useParams, useRouter } from "next/navigation";

import { showGlobalErrorDialog } from "@/lib/queryClient";
import Dialog from "@/components/Dialog";
import { useDeleteWishMutation } from "@/hooks/mutations/wish/useDeleteWishMutation";
import { useWishQuery } from "@/hooks/queries/wish/useWishQuery";
import ProductDetailFallback from "@/components/ProductDetailFallback";
import ToastMessage from "@/components/ToastMessage";
import { useWishToast } from "@/hooks/useWishToast";
import FundingOpenSheet from "@/widgets/funding/FundingOpenSheet";
import ProductDetailView from "@/components/ProductDetailView";
import ProductDetailViewSkeleton from "@/components/skeleton/ProductDetailViewSkeleton";
import { isValidUrl } from "@/utils/isValidUrl";
import { resolveWishErrorAction } from "@/utils/wish/resolveWishErrorAction";
import IconDelete from "@/assets/icons/icon-delete.svg?react";

export default function WishDetailContainer() {
  const router = useRouter();
  const { wishId } = useParams<{ wishId: string }>();
  const { data: wish, error, isLoading, refetch } = useWishQuery(wishId);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [fundingSheetOpen, setFundingSheetOpen] = useState(false);
  const { mutate: deleteWish, isPending: isDeletePending } = useDeleteWishMutation(wishId);
  const errorAction = resolveWishErrorAction(error);
  const showAddedToast = useWishToast("added");

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
  // fundingId 없는 FUNDING은 이동할 곳이 없어 CTA가 죽으므로 펀딩 중으로 다루지 않는다(삭제 가능 여부는 서버가 판정)
  const isFunding = wish.status === "FUNDING" && fundingId != null;

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
        statusBadge={isFunding ? "펀딩 중" : undefined}
        ctaLabel={isFunding ? "해당 상품 펀딩 보러가기" : "이 상품으로 펀딩 열기"}
        onCtaClick={
          isFunding ? () => router.push(`/funding/${fundingId}`) : () => setFundingSheetOpen(true)
        }
        ctaHelperText={isFunding ? "펀딩 진행중인 위시 상품은 삭제할 수 없어요" : undefined}
      />
      <FundingOpenSheet
        open={fundingSheetOpen}
        initialWish={wish}
        onClose={() => setFundingSheetOpen(false)}
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
