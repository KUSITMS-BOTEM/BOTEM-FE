"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import Header from "@/components/Header";
import List from "@/components/List";
import Profile from "@/components/Profile";
import TextButton from "@/components/TextButton";
import { useWithdrawMutation } from "@/hooks/mutations/user/useWithdrawMutation";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { handleWithdrawClick } from "@/utils/auth/handleWithdrawClick";
import { formatBirthdayDisplay } from "@/utils/user/formatBirthdayDisplay";
import BirthdayEditContainer from "@/widgets/user/BirthdayEditContainer";
import ConnectedAccountBottomSheet from "@/widgets/user/ConnectedAccountBottomSheet";
import NameEditContainer from "@/widgets/user/NameEditContainer";
import IconLeft from "@/assets/icons/icon-left.svg?react";

const removeProtocol = (url: string) => url.replace(/^https?:\/\//, "");

const VALUE_BUTTON_CLASS = "text-semantic-text-secondary max-w-36";

export default function MyProfileContainer() {
  const router = useRouter();
  const { mutate: withdraw } = useWithdrawMutation();
  const { data: profile } = useMyProfileQuery();
  const wishProfileUrl = profile?.wishProfileUrl ?? "";
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [nameSheetOpen, setNameSheetOpen] = useState(false);
  const [birthdaySheetOpen, setBirthdaySheetOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header
        title="내 프로필"
        leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로 가기", onClick: () => router.back() }}
      />
      <main className="flex w-full flex-1 flex-col items-center justify-between px-5 pb-[env(safe-area-inset-bottom)]">
        <div className="flex w-full flex-col gap-1">
          <div className="flex w-full justify-center">
            <Profile imageUrl={profile?.profileImageUrl ?? undefined} />
          </div>
          <List
            title="이름"
            right={
              <TextButton
                size="medium"
                label={profile?.nickname ?? ""}
                onClick={() => setNameSheetOpen(true)}
                className={VALUE_BUTTON_CLASS}
              />
            }
          />
          <List
            title="생일"
            right={
              <TextButton
                size="medium"
                label={profile?.birthday ? formatBirthdayDisplay(profile.birthday) : ""}
                onClick={() => setBirthdaySheetOpen(true)}
                className={VALUE_BUTTON_CLASS}
              />
            }
          />
          <List title="연결된 계정" onClick={() => setAccountSheetOpen(true)} />
          <div className="bg-semantic-fill-neutral-weak rounded-xx-large flex w-full px-4 py-3">
            <List
              title={removeProtocol(wishProfileUrl)}
              description="내 위시 프로필 링크"
              titleUp
              right={
                <Button
                  color="neutral"
                  size="small"
                  disabled={!wishProfileUrl}
                  onClick={() => navigator.clipboard.writeText(wishProfileUrl)}>
                  링크 복사
                </Button>
              }
            />
          </div>
        </div>
        <div className="flex py-2">
          <TextButton
            size="medium"
            label="회원 탈퇴"
            rightIcon={false}
            onClick={() => handleWithdrawClick(withdraw, router)}
            className="text-semantic-text-secondary"
          />
        </div>
      </main>
      <NameEditContainer open={nameSheetOpen} onClose={() => setNameSheetOpen(false)} />
      <BirthdayEditContainer open={birthdaySheetOpen} onClose={() => setBirthdaySheetOpen(false)} />
      {profile && (
        <ConnectedAccountBottomSheet
          open={accountSheetOpen}
          onClose={() => setAccountSheetOpen(false)}
          email={profile.email}
          connectedAt={profile.joinedAt}
        />
      )}
    </div>
  );
}
