"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import List from "@/components/List";
import CloseSheet from "@/components/CloseSheet";
import Profile from "@/components/Profile";
import TextButton from "@/components/TextButton";
import { useWithdrawMutation } from "@/hooks/mutations/user/useWithdrawMutation";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { handleWithdrawClick } from "@/utils/auth/handleWithdrawClick";
import ConnectedAccountBottomSheet from "@/widgets/user/ConnectedAccountBottomSheet";
import NameEditContainer from "@/widgets/user/NameEditContainer";
import BirthdayEditContainer from "@/widgets/user/BirthdayEditContainer";

const removeProtocol = (url: string) => url.replace(/^https?:\/\//, "");

type MyProfileSheetProps = {
  open: boolean;
  onClose: () => void;
};

export default function MyProfileSheet({ open, onClose }: MyProfileSheetProps) {
  const router = useRouter();
  const { mutate: withdraw } = useWithdrawMutation();
  const { data: profile } = useMyProfileQuery();
  const wishProfileUrl = profile?.wishProfileUrl ?? "";
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [nameSheetOpen, setNameSheetOpen] = useState(false);
  const [birthdaySheetOpen, setBirthdaySheetOpen] = useState(false);

  return (
    <CloseSheet open={open} title="내 프로필" onClose={onClose}>
      <div className="flex w-full flex-1 flex-col items-center justify-between">
        <div className="flex w-full flex-col gap-1">
          <div className="flex w-full justify-center">
            <Profile imageUrl={profile?.profileImageUrl ?? undefined} />
          </div>
          <List title="이름" onClick={() => setNameSheetOpen(true)} />
          <List title="생일" onClick={() => setBirthdaySheetOpen(true)} />
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
      </div>
      {profile && (
        <ConnectedAccountBottomSheet
          open={accountSheetOpen}
          onClose={() => setAccountSheetOpen(false)}
          email={profile.email}
          connectedAt={profile.joinedAt}
        />
      )}
      <NameEditContainer open={nameSheetOpen} onClose={() => setNameSheetOpen(false)} />
      <BirthdayEditContainer open={birthdaySheetOpen} onClose={() => setBirthdaySheetOpen(false)} />
    </CloseSheet>
  );
}
