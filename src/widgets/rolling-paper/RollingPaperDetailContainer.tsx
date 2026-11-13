"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import IconLeft from "@/assets/icons/icon-left.svg?react";
import IconButton from "@/components/IconButton";
import { ARRIVAL_BACK_BUTTON_TRANSITION } from "@/widgets/rolling-paper/rollingPaperMotion";

// 퇴장 모션 마지막 장면(회색으로 덮인 화면)에서 이어지는 도착 페이지. 본문은 디자인 확정 전이라 비어 있다
export default function RollingPaperDetailContainer() {
  const router = useRouter();

  return (
    <div className="bg-base-gray-100 flex flex-1 flex-col">
      <motion.header
        className="relative h-16 w-full shrink-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={ARRIVAL_BACK_BUTTON_TRANSITION}>
        <IconButton
          size="xlarge"
          icon={<IconLeft />}
          aria-label="뒤로 가기"
          onClick={() => router.back()}
          className="absolute top-3 left-2.5"
        />
      </motion.header>
    </div>
  );
}
