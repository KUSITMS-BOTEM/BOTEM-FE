"use client";

import { LottieSvg } from "lottie-react";

import { APP_MAX_WIDTH_CLASS } from "@/constants/layout";
import { cn } from "@/utils/cn";

const CONFETTI_LOTTIE_URL = "/lottie/funding-complete-confetti.json";

// 로티가 상태바(62px)를 포함한 360×812 프레임 기준이라, 웹에는 없는 그만큼(62/812)을 위로 올린다
const STATUS_BAR_OFFSET = "-translate-y-[7.64%]";

// 라이브러리가 로티 요소에 position을 직접 지정해 absolute가 밀리므로, 배치는 감싸는 div가 맡는다
export default function FundingCompleteConfetti() {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-0 left-1/2 z-10 aspect-360/812 w-full -translate-x-1/2",
        STATUS_BAR_OFFSET,
        APP_MAX_WIDTH_CLASS,
      )}>
      <LottieSvg src={CONFETTI_LOTTIE_URL} autoplay loop={false} className="size-full" />
    </div>
  );
}
