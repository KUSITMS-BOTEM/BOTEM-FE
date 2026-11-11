"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Header from "@/components/Header";
import TextField from "@/components/TextField";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import IconLeft from "@/assets/icons/icon-left.svg?react";

export default function NameEditContainer() {
  const router = useRouter();
  const { data: profile } = useMyProfileQuery();
  const [nickname, setNickname] = useState("");
  const [synced, setSynced] = useState(false);

  if (profile && !synced) {
    setSynced(true);
    setNickname(profile.nickname);
  }

  return (
    <>
      <Header
        title="이름 수정"
        leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로 가기", onClick: () => router.back() }}
      />
      <main className="px-5">
        <TextField
          label="이름"
          value={nickname}
          onChange={event => setNickname(event.target.value)}
        />
      </main>
      {/* 이름 수정 API 명세가 나오기 전이라 저장 동작은 아직 연결하지 않았다 */}
      <BottomCTA>
        <Button color="brand" size="xlarge" disabled={!nickname.trim()}>
          수정 완료
        </Button>
      </BottomCTA>
    </>
  );
}
