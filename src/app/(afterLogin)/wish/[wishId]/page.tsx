"use client";

import { useEffect, useState } from "react";

import { notFound, useParams, useRouter } from "next/navigation";

import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import Header from "@/components/Header";
import { useDeleteWishMutation } from "@/hooks/mutations/wish/useDeleteWishMutation";
import { useWishQuery } from "@/hooks/queries/wish/useWishQuery";
import ProductDetailView from "@/widgets/wish/ProductDetailView";
import ProductDetailViewSkeleton from "@/widgets/wish/ProductDetailViewSkeleton";
import { resolveWishErrorAction } from "./helpers";
import IconDelete from "@/assets/icons/icon-delete.svg?react";
import IconLeft from "@/assets/icons/icon-left.svg?react";

export default function WishDetail() {
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
      <div className="flex flex-col">
        <Header
          title="위시 상품"
          leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로 가기", onClick: () => router.back() }}
        />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
          <p className="text-semantic-text-secondary [font:var(--semantic-subtext-large)]">
            위시 정보를 불러오지 못했어요
          </p>
          <Button onClick={() => refetch()}>다시 시도</Button>
        </div>
      </div>
    );
  }

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
