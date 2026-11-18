"use client";

import { useRouter } from "next/navigation";

import Header from "@/components/Header";
import { APP_MAX_WIDTH_CLASS } from "@/constants/layout";
import IconLeft from "@/assets/icons/icon-left.svg?react";
import ShimmerBar from "@/components/skeleton/ShimmerBar";

export default function ProductDetailViewSkeleton() {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      <div
        className={`bg-semantic-background-default fixed inset-x-0 top-0 z-10 mx-auto w-full ${APP_MAX_WIDTH_CLASS} pt-[env(safe-area-inset-top)]`}>
        <Header
          title="위시 상품"
          leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로 가기", onClick: () => router.back() }}
        />
      </div>
      <div aria-hidden className="h-[calc(64px+env(safe-area-inset-top))] shrink-0" />
      <div className="px-5">
        <div className="relative aspect-square w-full shrink-0">
          <ShimmerBar className="absolute inset-0 size-full rounded-3xl" />
        </div>
      </div>
      <div className="flex flex-col gap-3 px-5 pt-5">
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <ShimmerBar className="h-5 w-24" />
            <ShimmerBar className="h-6 w-32" />
          </div>
          <ShimmerBar className="rounded-large h-11 w-full" />
        </div>
        <div className="flex w-full items-center gap-3 py-3">
          <div className="flex flex-1 flex-col gap-0.5">
            <ShimmerBar className="h-5 w-12" />
            <ShimmerBar className="h-5 w-40" />
          </div>
          <ShimmerBar className="size-5 shrink-0 rounded-full" />
        </div>
      </div>
    </div>
  );
}
