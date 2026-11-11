"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Header from "@/components/Header";
import SelectBox from "@/components/SelectBox";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { formatBirthdayDisplay } from "@/utils/user/formatBirthdayDisplay";
import IconLeft from "@/assets/icons/icon-left.svg?react";

export default function BirthdayEditContainer() {
  const router = useRouter();
  const { data: profile } = useMyProfileQuery();
  const [birthday, setBirthday] = useState("");
  const [synced, setSynced] = useState(false);

  if (profile && !synced) {
    setSynced(true);
    setBirthday(profile.birthday ?? "");
  }

  return (
    <>
      <Header
        title="생일 수정"
        leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로 가기", onClick: () => router.back() }}
      />
      <main className="px-5">
        <SelectBox
          variant="birth"
          label="생일"
          value={birthday ? formatBirthdayDisplay(birthday) : ""}
          onDateChange={(month, day) =>
            setBirthday(
              month && day
                ? `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                : "",
            )
          }
        />
      </main>
      <BottomCTA>
        <Button color="brand" size="xlarge" disabled={!birthday}>
          수정 완료
        </Button>
      </BottomCTA>
    </>
  );
}
