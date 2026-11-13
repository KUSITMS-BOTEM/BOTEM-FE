"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { motion, MotionConfig } from "framer-motion";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Header from "@/components/Header";
import Profile from "@/components/Profile";
import SelectBox from "@/components/SelectBox";
import TextField from "@/components/TextField";
import Title from "@/components/Title";
import { useLogoutMutation } from "@/hooks/mutations/auth/useLogoutMutation";
import { useUploadProfileImageMutation } from "@/hooks/mutations/user/useUploadProfileImageMutation";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";
import { useErrorDialogStore } from "@/store/errorDialogStore";
import type { MyProfile } from "@/types/user/profile";
import { getSignupFlow, setSignupFlow } from "@/utils/auth/signupFlowStorage";
import { formatBirthdayDisplay } from "@/utils/user/formatBirthdayDisplay";
import IconLeft from "@/assets/icons/icon-left.svg?react";

// Figma "01 모션 토큰" 기준: ease.standard / duration.enter·move / delay.start·stagger / distance.title·field
const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const TITLE_TRANSITION = { delay: 0.3, duration: 0.45, ease: EASE_STANDARD };
const FIELD_TRANSITION = { delay: 0.8, duration: 0.4, ease: EASE_STANDARD };

// 백엔드 업로드 URL 발급 API(/profile-image/upload-url) 제약과 동일
const ALLOWED_PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PROFILE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export default function ProfileCheckContainer() {
  const router = useRouter();
  const { mutate: logout } = useLogoutMutation();
  const { mutate: uploadProfileImage, isPending: isUploadingImage } =
    useUploadProfileImageMutation();
  const { data: profile } = useMyProfileQuery();
  const [nickname, setNickname] = useState(() => getSignupFlow()?.nickname ?? "");
  const [birthday, setBirthday] = useState(() => getSignupFlow()?.birthday ?? "");
  // 새로 업로드한 이미지만 담는다 — 온보딩 완료 API는 업로드 URL 발급으로 받은 imageUrl만 허용하고, 그 외 값(카카오 이미지 등)은 거부한다. 생략해야 카카오 이미지가 유지된다
  const [uploadedImageUrl, setUploadedImageUrl] = useState(
    () => getSignupFlow()?.profileImageUrl ?? undefined,
  );
  const [syncedProfile, setSyncedProfile] = useState<MyProfile>();

  useEffect(() => {
    if (!getSignupFlow()) router.replace("/");
  }, [router]);

  // 렌더 중 state 동기화 — useEffect 안에서 setState하면 커밋 후 리렌더가 한 번 더 발생해 react-hooks/set-state-in-effect에 걸린다
  // payout-account에서 "이전"으로 돌아온 경우 signupFlow에 저장된 수정값을 우선한다
  if (profile && !syncedProfile) {
    setSyncedProfile(profile);
    const flow = getSignupFlow();
    setNickname(flow?.nickname ?? profile.nickname);
    setBirthday(flow?.birthday ?? profile.birthday ?? "");
  }

  const handleNext = () => {
    setSignupFlow({ step: "accountEntry", nickname, birthday, profileImageUrl: uploadedImageUrl });
    router.push("/auth/payout-account");
  };

  const handleProfileImageChange = (file: File) => {
    uploadProfileImage(file, {
      onSuccess: imageUrl => setUploadedImageUrl(imageUrl),
      onError: () =>
        useErrorDialogStore
          .getState()
          .openErrorDialog("이미지 업로드에 실패했어요. 다시 시도해주세요"),
    });
  };

  const handleBack = () => {
    logout(undefined, {
      onSuccess: () => {
        useAuthStore.getState().clearAccessToken();
        queryClient.removeQueries({ queryKey: ["users", "me"] });
        router.replace("/");
      },
    });
  };

  return (
    <MotionConfig reducedMotion="user">
      <Header
        title="회원가입"
        leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로 가기", onClick: handleBack }}
      />
      <main className="flex flex-col gap-1 px-5">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={TITLE_TRANSITION}>
          <Title
            type="a2z"
            title={"이름과 생일이 맞는지\n확인해주세요"}
            description="등록된 정보와 다르다면 수정해주세요."
          />
        </motion.div>
        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={FIELD_TRANSITION}>
            <Profile
              imageUrl={uploadedImageUrl ?? profile?.profileImageUrl ?? undefined}
              onImageChange={handleProfileImageChange}
              allowedTypes={ALLOWED_PROFILE_IMAGE_TYPES}
              maxSizeBytes={MAX_PROFILE_IMAGE_SIZE_BYTES}
            />
          </motion.div>
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={FIELD_TRANSITION}>
            <TextField
              label="이름"
              value={nickname}
              onChange={event => setNickname(event.target.value)}
            />
            <SelectBox
              variant="birth"
              label="생일"
              value={birthday ? formatBirthdayDisplay(birthday) : ""}
              dateValue={birthday}
              onDateChange={(month, day) =>
                setBirthday(
                  month && day
                    ? `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                    : "",
                )
              }
            />
          </motion.div>
        </div>
      </main>
      <BottomCTA>
        <Button
          color="brand"
          size="xlarge"
          disabled={!nickname || !birthday || isUploadingImage}
          onClick={handleNext}>
          다음으로
        </Button>
      </BottomCTA>
    </MotionConfig>
  );
}
