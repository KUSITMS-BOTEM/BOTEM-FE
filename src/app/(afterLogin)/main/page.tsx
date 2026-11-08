"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import { useLogoutMutation } from "@/hooks/mutations/auth/useLogoutMutation";
import { useWithdrawMutation } from "@/hooks/mutations/user/useWithdrawMutation";
import { consumeWishPromptPending } from "@/utils/wishPromptStorage";
import AddWishBottomSheet from "@/widgets/main/AddWishBottomSheet";

import { handleLogoutClick, handleWithdrawClick } from "./helpers";

export default function Main() {
  const router = useRouter();
  const { mutate: logout } = useLogoutMutation();
  const { mutate: withdraw } = useWithdrawMutation();
  // 온보딩을 막 완료한 유저만 진입 시 1회 자동으로 뜨도록, 기존 유저는 등장하지 않는다
  const [wishSheetOpen, setWishSheetOpen] = useState(() => consumeWishPromptPending());

  return (
    <div>
      메인 페이지
      <Button onClick={() => handleLogoutClick(logout, router)}>로그아웃</Button>
      <Button onClick={() => handleWithdrawClick(withdraw, router)}>회원탈퇴</Button>
      <AddWishBottomSheet
        open={wishSheetOpen}
        onClose={() => setWishSheetOpen(false)}
        onSubmit={() => setWishSheetOpen(false)}
      />
    </div>
  );
}
