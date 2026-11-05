"use client";

import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import { useLogoutMutation } from "@/hooks/mutations/auth/useLogoutMutation";

import { handleLogoutClick } from "./helpers";

export default function Main() {
  const router = useRouter();
  const { mutate } = useLogoutMutation();

  return (
    <div>
      메인 페이지
      <Button onClick={() => handleLogoutClick(mutate, router)}>로그아웃</Button>
    </div>
  );
}
