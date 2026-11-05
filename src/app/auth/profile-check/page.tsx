"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import { getSignupFlow, setSignupFlow } from "@/utils/signupFlowStorage";

export default function ProfileCheck() {
  const router = useRouter();

  useEffect(() => {
    if (!getSignupFlow()) router.replace("/");
  }, [router]);

  const handleNext = () => {
    setSignupFlow({ step: "accountEntry" });
    router.push("/auth/account-entry");
  };

  return (
    <div>
      프로필 확인 페이지 (신규 유저)
      <Button onClick={handleNext}>다음</Button>
    </div>
  );
}
