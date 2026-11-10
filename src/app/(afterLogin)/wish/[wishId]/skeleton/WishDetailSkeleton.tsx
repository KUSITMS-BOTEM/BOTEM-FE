"use client";

import { useRouter } from "next/navigation";

import Header from "@/components/Header";
import IconLeft from "@/assets/icons/icon-left.svg?react";
import ShimmerBar from "./ShimmerBar";

export default function WishDetailSkeleton() {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      <div className="relative aspect-square w-full shrink-0">
        <ShimmerBar className="absolute inset-0 size-full rounded-none" />
        <Header
          title="위시 상품"
          leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로 가기", onClick: () => router.back() }}
          className="fixed inset-x-0 top-0 z-10 mx-auto w-full max-w-[440px] pt-[env(safe-area-inset-top)]"
        />
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
