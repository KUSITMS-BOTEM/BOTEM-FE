"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import { getSignupFlow, setSignupFlow } from "@/utils/signupFlowStorage";

export default function ProfileCheck() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [birthday, setBirthday] = useState("");

  useEffect(() => {
    if (!getSignupFlow()) router.replace("/");
  }, [router]);

  const handleNext = () => {
    setSignupFlow({ step: "accountEntry", nickname, birthday });
    router.push("/auth/account-entry");
  };

  return (
    <div>
      프로필 확인 페이지 (신규 유저)
      <input
        placeholder="이름"
        value={nickname}
        onChange={event => setNickname(event.target.value)}
      />
      <input
        placeholder="생일"
        value={birthday}
        onChange={event => setBirthday(event.target.value)}
      />
      <Button onClick={handleNext} disabled={!nickname || !birthday}>
        다음
      </Button>
    </div>
  );
}
