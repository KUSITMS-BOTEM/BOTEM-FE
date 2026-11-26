"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { motion, MotionConfig } from "framer-motion";

import Button from "@/components/Button";
import Header from "@/components/Header";
import List from "@/components/List";
import Profile from "@/components/Profile";
import TextButton from "@/components/TextButton";
import { SLIDE_TRANSITION } from "@/constants/motion";
import {
  ALLOWED_PROFILE_IMAGE_TYPES,
  MAX_PROFILE_IMAGE_SIZE_BYTES,
} from "@/constants/profileImage";
import { useUpdateMyProfileMutation } from "@/hooks/mutations/user/useUpdateMyProfileMutation";
import { useUploadProfileImageMutation } from "@/hooks/mutations/user/useUploadProfileImageMutation";
import { useWithdrawMutation } from "@/hooks/mutations/user/useWithdrawMutation";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { useErrorDialogStore } from "@/store/errorDialogStore";
import { handleWithdrawClick } from "@/utils/auth/handleWithdrawClick";
import { cn } from "@/utils/cn";
import { formatBirthdayDisplay } from "@/utils/user/formatBirthdayDisplay";
import { getDisplayName } from "@/utils/user/getDisplayName";
import BirthdayEditContainer from "@/widgets/user/BirthdayEditContainer";
import ConnectedAccountBottomSheet from "@/widgets/user/ConnectedAccountBottomSheet";
import MenuTrailing from "@/widgets/user/MenuTrailing";
import NameEditContainer from "@/widgets/user/NameEditContainer";
import IconLeft from "@/assets/icons/icon-left.svg?react";

const removeProtocol = (url: string) => url.replace(/^https?:\/\//, "");

const VALUE_CLASS = "max-w-36";

export default function MyProfileContainer() {
  const router = useRouter();
  const { mutate: withdraw } = useWithdrawMutation();
  const { data: profile } = useMyProfileQuery();
  const wishProfileUrl = profile?.wishProfileUrl ?? "";
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [nameSheetOpen, setNameSheetOpen] = useState(false);
  const [birthdaySheetOpen, setBirthdaySheetOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { mutate: uploadProfileImage, isPending: isUploadingImage } =
    useUploadProfileImageMutation();
  const { mutate: updateProfile, isPending: isSavingImage } = useUpdateMyProfileMutation();
  const isImageBusy = isUploadingImage || isSavingImage;

  const handleProfileImageChange = (file: File) => {
    if (!profile?.birthday) return;
    const { birthday } = profile;
    const name = getDisplayName(profile);
    uploadProfileImage(file, {
      onSuccess: imageUrl => updateProfile({ name, birthday, profileImageUrl: imageUrl }),
      onError: () =>
        useErrorDialogStore
          .getState()
          .openErrorDialog("이미지 업로드에 실패했어요. 다시 시도해주세요"),
    });
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip">
        {/* App Router는 이동 즉시 페이지를 언마운트해 퇴장 애니메이션을 못 붙이므로, 오른쪽으로 빠진 뒤에 뒤로 간다 */}
        <motion.div
          className="bg-semantic-background-default flex min-h-dvh flex-col"
          initial={{ x: "100%" }}
          animate={{ x: isClosing ? "100%" : 0 }}
          transition={SLIDE_TRANSITION}
          onAnimationComplete={() => {
            if (isClosing) router.back();
          }}>
          <Header
            title="내 프로필"
            leftItem={{
              icon: <IconLeft />,
              ariaLabel: "뒤로 가기",
              onClick: () => setIsClosing(true),
            }}
          />
          <main className="flex w-full flex-1 flex-col items-center justify-between px-5 pb-[env(safe-area-inset-bottom)]">
            <div className="flex w-full flex-col gap-1">
              <div className="flex w-full justify-center">
                <Profile
                  imageUrl={profile?.profileImageUrl ?? undefined}
                  onImageChange={handleProfileImageChange}
                  allowedTypes={ALLOWED_PROFILE_IMAGE_TYPES}
                  maxSizeBytes={MAX_PROFILE_IMAGE_SIZE_BYTES}
                  // 수정 API가 생일을 필수로 받아, 생일이 없으면 저장할 수 없는 선택 버튼을 숨긴다
                  showIconButton={Boolean(profile?.birthday)}
                  isUploading={isImageBusy}
                />
              </div>
              <List
                title="이름"
                onClick={() => setNameSheetOpen(true)}
                // 이미지 저장이 업로드 시작 시점의 이름·생일을 함께 보내, 그 사이 수정하면 덮어써진다
                disabled={isImageBusy}
                right={
                  <MenuTrailing
                    label={profile ? getDisplayName(profile) : ""}
                    className={cn(VALUE_CLASS, isImageBusy && "opacity-30")}
                  />
                }
              />
              <List
                title="생일"
                onClick={() => setBirthdaySheetOpen(true)}
                disabled={isImageBusy}
                right={
                  <MenuTrailing
                    label={profile?.birthday ? formatBirthdayDisplay(profile.birthday) : ""}
                    className={cn(VALUE_CLASS, isImageBusy && "opacity-30")}
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
          <BirthdayEditContainer
            open={birthdaySheetOpen}
            onClose={() => setBirthdaySheetOpen(false)}
          />
          {profile && (
            <ConnectedAccountBottomSheet
              open={accountSheetOpen}
              onClose={() => setAccountSheetOpen(false)}
              email={profile.email}
              connectedAt={profile.joinedAt}
            />
          )}
        </motion.div>
      </div>
    </MotionConfig>
  );
}
