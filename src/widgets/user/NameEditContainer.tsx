"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import CloseSheet from "@/components/CloseSheet";
import TextField from "@/components/TextField";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";

type NameEditContainerProps = { open?: boolean; onClose?: () => void };

export default function NameEditContainer({ open = true, onClose }: NameEditContainerProps) {
  const router = useRouter();
  const { data: profile } = useMyProfileQuery();
  const [nickname, setNickname] = useState("");
  const [synced, setSynced] = useState(false);

  if (profile && !synced) {
    setSynced(true);
    setNickname(profile.nickname);
  }

  return (
    <CloseSheet
      open={open}
      title="이름 수정"
      closeType="back"
      onClose={onClose ?? (() => router.back())}>
      <TextField
        label="이름"
        value={nickname}
        onChange={event => setNickname(event.target.value)}
      />
      {/* 이름 수정 API 명세가 나오기 전이라 저장 동작은 아직 연결하지 않았다 */}
      <BottomCTA>
        <Button color="brand" size="xlarge" disabled={!nickname.trim()}>
          수정 완료
        </Button>
      </BottomCTA>
    </CloseSheet>
  );
}
