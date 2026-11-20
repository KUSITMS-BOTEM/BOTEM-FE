"use client";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { getHomePath } from "@/utils/home/getHomePath";
import MyMenuSheet from "@/widgets/user/MyMenuSheet";

type HomeMyMenuSheetProps = {
  closedFundingCount: number;
};

export default function HomeMyMenuSheet({ closedFundingCount }: HomeMyMenuSheetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = searchParams.get("menu") === "open";
  const [isRestored, setIsRestored] = useState(isOpen);

  const close = () => {
    setIsRestored(false);
    router.replace(getHomePath(searchParams, { menu: null }), { scroll: false });
  };

  return (
    <MyMenuSheet
      open={isOpen}
      onClose={close}
      closedFundingCount={closedFundingCount}
      slideInOnOpen={!isRestored}
    />
  );
}
