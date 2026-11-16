"use client";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import MyMenuSheet from "@/widgets/user/MyMenuSheet";

export const MY_MENU_OPEN_PATH = "/home?menu=open";
const MY_MENU_CLOSED_PATH = "/home";

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
    router.replace(MY_MENU_CLOSED_PATH, { scroll: false });
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
