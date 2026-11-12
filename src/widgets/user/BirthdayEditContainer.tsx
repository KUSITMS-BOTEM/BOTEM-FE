"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import CloseSheet from "@/components/CloseSheet";
import SelectBox from "@/components/SelectBox";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { formatBirthdayDisplay } from "@/utils/user/formatBirthdayDisplay";

type BirthdayEditContainerProps = { open?: boolean; onClose?: () => void };

export default function BirthdayEditContainer({
  open = true,
  onClose,
}: BirthdayEditContainerProps) {
  const router = useRouter();
  const { data: profile } = useMyProfileQuery();
  const [birthday, setBirthday] = useState("");
  const [synced, setSynced] = useState(false);

  if (profile && !synced) {
    setSynced(true);
    setBirthday(profile.birthday ?? "");
  }

  return (
    <CloseSheet
      open={open}
      title="생일 수정"
      closeType="back"
      onClose={onClose ?? (() => router.back())}>
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
        <Button color="brand" size="xlarge" disabled={!birthday}>
          수정 완료
        </Button>
      </BottomCTA>
    </CloseSheet>
  );
}
