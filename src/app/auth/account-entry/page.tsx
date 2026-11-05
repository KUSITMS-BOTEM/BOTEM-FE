"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import { clearSignupFlow, getSignupFlow } from "@/utils/signupFlowStorage";

export default function AccountEntry() {
  const router = useRouter();

  useEffect(() => {
    if (getSignupFlow()?.step !== "accountEntry") router.replace("/auth/profile-check");
  }, [router]);

  const handleStart = () => {
    clearSignupFlow();
    router.replace("/main");
  };

  return (
    <div>
      계좌 입력 페이지(신규 유저)
      <Button onClick={handleStart}>시작하기</Button>
    </div>
  );
}
