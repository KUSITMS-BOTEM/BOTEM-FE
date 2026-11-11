"use client";

import { useEffect, useState } from "react";

import { notFound, useParams, useRouter } from "next/navigation";

import Dialog from "@/components/Dialog";
import { useDeleteWishMutation } from "@/hooks/mutations/wish/useDeleteWishMutation";
import { useWishQuery } from "@/hooks/queries/wish/useWishQuery";
import ProductDetailFallback from "@/components/ProductDetailFallback";
import ProductDetailView from "@/components/ProductDetailView";
import ProductDetailViewSkeleton from "@/components/skeleton/ProductDetailViewSkeleton";
import { resolveWishErrorAction } from "@/utils/wish/resolveWishErrorAction";
import IconDelete from "@/assets/icons/icon-delete.svg?react";

export default function WishDetailContainer() {
  const router = useRouter();
  const { wishId } = useParams<{ wishId: string }>();
  const { data: wish, error, isLoading, refetch } = useWishQuery(wishId);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { mutate: deleteWish, isPending: isDeletePending } = useDeleteWishMutation(wishId);
  const errorAction = resolveWishErrorAction(error);

  useEffect(() => {
    if (errorAction === "unauthorized") router.replace("/");
    else if (errorAction === "alert") alert(error?.message);
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

  // TODO: wish.status === "DISCONTINUED"일 때 다른 디자인을 보여줄 예정 — 디자인 미정이라 분기는 보류
  return (
    <div className="flex flex-col">
      <ProductDetailView
        productImageUrl={wish.productImageUrl}
        productName={wish.productName}
        price={wish.price}
        // TODO: WishResponse에 판매처 필드 추가되면 교체
        sellerName="쿠팡 Apple 공식 브랜드관"
        onSellerClick={() => window.open(wish.productUrl, "_blank", "noopener,noreferrer")}
        rightItems={[
          { icon: <IconDelete />, ariaLabel: "삭제", onClick: () => setIsDeleteDialogOpen(true) },
        ]}
        onBack={() => router.back()}
        ctaLabel="펀딩 열기"
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
    </div>
  );
}
