"use client";

import { useRef, useState } from "react";

import { useRouter } from "next/navigation";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import CloseSheet from "@/components/CloseSheet";
import SelectBox from "@/components/SelectBox";
import { useUpdateMyProfileMutation } from "@/hooks/mutations/user/useUpdateMyProfileMutation";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { formatBirthdayDisplay } from "@/utils/user/formatBirthdayDisplay";
import { getDisplayName } from "@/utils/user/getDisplayName";

type BirthdayEditContainerProps = { open?: boolean; onClose?: () => void };

export default function BirthdayEditContainer({
  open = true,
  onClose,
}: BirthdayEditContainerProps) {
  const router = useRouter();
  const { data: profile } = useMyProfileQuery();
  const { mutate: updateProfile, isPending } = useUpdateMyProfileMutation();
  const [birthday, setBirthday] = useState("");
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
    setBirthday(profile.birthday ?? "");
  }

  const handleSave = () => {
    if (!profile || isSavingRef.current) return;
    isSavingRef.current = true;
    updateProfile(
      { name: getDisplayName(profile), birthday },
      {
        onSuccess: close,
        // 시트는 닫혀도 언마운트되지 않아, 다음에 다시 열었을 때 저장할 수 있게 성공 후에도 잠금을 푼다
        onSettled: () => (isSavingRef.current = false),
      },
    );
  };

  return (
    <CloseSheet open={open} title="생일 수정" closeType="back" onClose={close}>
      <SelectBox
        variant="birth"
        label="생일"
        value={birthday ? formatBirthdayDisplay(birthday) : ""}
        dateValue={birthday}
        onDateChange={(month, day) =>
          setBirthday(
            month && day ? `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "",
          )
        }
      />
      <BottomCTA>
        <Button
          color="brand"
          size="xlarge"
          disabled={!birthday || !profile}
          states={isPending ? "loading" : "default"}
          onClick={handleSave}>
          수정 완료
        </Button>
      </BottomCTA>
    </CloseSheet>
  );
}
