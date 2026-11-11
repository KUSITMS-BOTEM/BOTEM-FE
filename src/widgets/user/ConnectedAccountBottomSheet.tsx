"use client";

import BottomSheet from "@/components/BottomSheet";
import List from "@/components/List";
import LogoKakao from "@/assets/icons/multicolor/logo-kakao.svg?react";

type ConnectedAccountBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  email: string | null;
  connectedAt: string;
};

export default function ConnectedAccountBottomSheet({
  open,
  onClose,
  email,
  connectedAt,
}: ConnectedAccountBottomSheetProps) {
  return (
    <BottomSheet
      open={open}
      title="연결된 계정"
      height="auto"
      onClose={onClose}
      buttons={{ rightLabel: "확인", rightColor: "neutral", onRightClick: onClose }}>
      <List
        // 카카오 브랜드 색은 토큰이 없어 BottomCTA의 카카오 버튼과 같은 값을 쓴다
        leading={
          <span className="flex size-full items-center justify-center rounded-full bg-[#fee500]">
            <LogoKakao aria-hidden className="h-[8.35px] w-[9.1px]" />
          </span>
        }
        title={email ?? "카카오 계정"}
        description={`${connectedAt.replaceAll("-", ".")}에 연결`}
      />
    </BottomSheet>
  );
}
