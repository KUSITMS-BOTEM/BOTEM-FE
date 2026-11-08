"use client";

import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import { useLogoutMutation } from "@/hooks/mutations/auth/useLogoutMutation";
import { useWithdrawMutation } from "@/hooks/mutations/user/useWithdrawMutation";

import { handleLogoutClick, handleWithdrawClick } from "./helpers";

export default function Main() {
  const router = useRouter();
  const { mutate: logout } = useLogoutMutation();
  const { mutate: withdraw } = useWithdrawMutation();

  return (
    <div>
      메인 페이지
      <Button onClick={() => handleLogoutClick(logout, router)}>로그아웃</Button>
      <Button onClick={() => handleWithdrawClick(withdraw, router)}>회원탈퇴</Button>
    </div>
  );
}
