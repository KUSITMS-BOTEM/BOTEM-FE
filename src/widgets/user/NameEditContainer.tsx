"use client";

import { useRef, useState } from "react";

import { useRouter } from "next/navigation";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import CloseSheet from "@/components/CloseSheet";
import TextField from "@/components/TextField";
import { useUpdateMyProfileMutation } from "@/hooks/mutations/user/useUpdateMyProfileMutation";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { getDisplayName } from "@/utils/user/getDisplayName";

type NameEditContainerProps = { open?: boolean; onClose?: () => void };

export default function NameEditContainer({ open = true, onClose }: NameEditContainerProps) {
  const router = useRouter();
  const { data: profile } = useMyProfileQuery();
  const { mutate: updateProfile, isPending } = useUpdateMyProfileMutation();
  const [nickname, setNickname] = useState("");
  const [synced, setSynced] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  const isSavingRef = useRef(false);
  const close = onClose ?? (() => router.back());

  // 시트는 닫혀도 언마운트되지 않아, 다시 열 때 저장하지 않은 입력을 버리고 현재 프로필로 맞춘다
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setSynced(false);
  }

  if (profile && !synced) {
    setSynced(true);
    setNickname(getDisplayName(profile));
  }

  const handleSave = () => {
    if (!profile?.birthday || isSavingRef.current) return;
    isSavingRef.current = true;
    updateProfile(
      { name: nickname.trim(), birthday: profile.birthday },
      {
        onSuccess: close,
        // 시트는 닫혀도 언마운트되지 않아, 다음에 다시 열었을 때 저장할 수 있게 성공 후에도 잠금을 푼다
        onSettled: () => (isSavingRef.current = false),
      },
    );
  };

  return (
    <CloseSheet open={open} title="이름 수정" closeType="back" onClose={close}>
      <TextField
        label="이름"
        value={nickname}
        onChange={event => setNickname(event.target.value)}
      />
      <BottomCTA>
        <Button
          color="brand"
          size="xlarge"
          // 수정 API가 생일을 필수로 받는다. 온보딩에서 생일을 필수로 받아 실제로는 비어 있지 않다
          disabled={!nickname.trim() || !profile?.birthday}
          states={isPending ? "loading" : "default"}
          onClick={handleSave}>
          수정 완료
        </Button>
      </BottomCTA>
    </CloseSheet>
  );
}
