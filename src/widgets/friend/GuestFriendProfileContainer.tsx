"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import InfoBox from "@/components/InfoBox";
import Logo from "@/components/Logo";
import { getProfileColor } from "@/components/Profile";
import TextButton from "@/components/TextButton";
import { useKakaoLoginUriMutation } from "@/hooks/mutations/auth/useKakaoLoginUriMutation";
import { useAddFriendMutation } from "@/hooks/mutations/friend/useAddFriendMutation";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { useWishProfileQuery } from "@/hooks/queries/wish-profile/useWishProfileQuery";
import { handleKakaoLoginClick } from "@/utils/auth/handleKakaoLoginClick";
import { getBirthdayDdayText } from "@/utils/friend/getBirthdayDdayText";
import { formatBirthdayDisplay } from "@/utils/user/formatBirthdayDisplay";
import FriendFundingSection from "@/widgets/friend/FriendFundingSection";
import FriendListItem from "@/widgets/friend/FriendListItem";
import GuestFriendWishSection from "@/widgets/friend/GuestFriendWishSection";
import FriendProfileSkeleton from "@/widgets/friend/skeleton/FriendProfileSkeleton";
import IconFundingOpen from "@/assets/icons/multicolor/icon-funding-open.svg?react";

type GuestFriendProfileContainerProps = {
  wishProfileKey: string;
  isLoggedIn: boolean;
};

export default function GuestFriendProfileContainer({
  wishProfileKey,
  isLoggedIn,
}: GuestFriendProfileContainerProps) {
  const router = useRouter();
  const { data, isPending, refetch } = useWishProfileQuery(wishProfileKey);
  const { mutate } = useKakaoLoginUriMutation();
  const myProfileQuery = useMyProfileQuery(isLoggedIn);
  const addFriend = useAddFriendMutation();
  const hasWish = (data?.wishCount ?? 0) > 0;
  const myProfile = myProfileQuery.data;
  const addFriendIdle = addFriend.isIdle;
  const addFriendMutate = addFriend.mutate;
  const memberFailed = myProfileQuery.isError || addFriend.isError;

  // 위시 프로필 링크는 초대 링크라 로그인 방문자는 바로 친구가 되고(요청·수락 단계 없음) 친구 프로필로 간다
  useEffect(() => {
    if (!isLoggedIn || !data || !myProfile || !addFriendIdle) return;
    // 내 링크에 친구 맺기를 보내면 BE는 성공만 응답해, 이동한 친구 프로필이 404가 된다
    if (myProfile.wishProfileUrl.endsWith(`/@${wishProfileKey}`)) {
      router.replace("/my/profile");
      return;
    }
    addFriendMutate(wishProfileKey, {
      onSuccess: () => router.replace(`/friends/${data.userId}`),
    });
  }, [isLoggedIn, data, myProfile, addFriendIdle, addFriendMutate, wishProfileKey, router]);

  const handleRetry = () => {
    if (!data) refetch();
    if (myProfileQuery.isError) myProfileQuery.refetch();
    if (addFriend.isError) addFriend.reset();
  };
  const showProfile = data && !isLoggedIn;

  return (
    <div className="bg-semantic-background-default flex min-h-dvh w-full flex-col">
      <header className="flex h-16 w-full items-center justify-between px-5 py-2.5">
        <Logo />
        {showProfile && !hasWish && (
          <TextButton
            size="small"
            rightIcon={false}
            label="나도 위시 만들기"
            onClick={() => router.push("/")}
            className="text-semantic-text-secondary"
          />
        )}
      </header>
      <main className="flex w-full flex-col gap-4 px-5 pb-36">
        {isPending || (isLoggedIn && data && !memberFailed) ? (
          <FriendProfileSkeleton />
        ) : !showProfile ? (
          <div className="flex w-full flex-col items-center gap-3 py-10">
            <p>친구 프로필을 불러오지 못했어요.</p>
            <Button color="brand" size="small" onClick={handleRetry}>
              다시 시도
            </Button>
          </div>
        ) : (
          <>
            <FriendListItem
              name={data.name}
              profileColor={getProfileColor(data.userId)}
              imageUrl={data.profileImageUrl ?? undefined}
              birthdayText={
                data.birthday ? `생일 ${formatBirthdayDisplay(data.birthday)}` : undefined
              }
              dDayText={getBirthdayDdayText(data.birthdayDday)}
            />
            {data.fundings.length > 0 && (
              <FriendFundingSection
                fundings={data.fundings}
                notice={
                  <InfoBox
                    text="로그인 없이 바로 보탤 수 있어요"
                    icon={<IconFundingOpen aria-hidden />}
                  />
                }
              />
            )}
            <div aria-hidden className="bg-semantic-border-weak -mx-5 h-px" />
            <GuestFriendWishSection wishCount={data.wishCount} />
          </>
        )}
      </main>
      {showProfile && (
        <BottomCTA
          type="kakao"
          label={hasWish ? "카카오로 3초 만에 보기" : "카카오로 시작하기"}
          // 로그인 후 이 링크로 돌아와야 친구 맺기를 거쳐 친구 프로필로 간다
          onClick={() => handleKakaoLoginClick(mutate, `/share/profile/${wishProfileKey}`)}
        />
      )}
    </div>
  );
}
