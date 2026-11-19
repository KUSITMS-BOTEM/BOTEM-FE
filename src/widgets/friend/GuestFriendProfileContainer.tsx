"use client";

import { useRouter } from "next/navigation";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import InfoBox from "@/components/InfoBox";
import Logo from "@/components/Logo";
import { getProfileColor } from "@/components/Profile";
import TextButton from "@/components/TextButton";
import { useKakaoLoginUriMutation } from "@/hooks/mutations/auth/useKakaoLoginUriMutation";
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
};

export default function GuestFriendProfileContainer({
  wishProfileKey,
}: GuestFriendProfileContainerProps) {
  const router = useRouter();
  const { data, isPending, refetch } = useWishProfileQuery(wishProfileKey);
  const { mutate } = useKakaoLoginUriMutation();
  const hasWish = (data?.wishCount ?? 0) > 0;

  return (
    <div className="bg-semantic-background-default flex min-h-dvh w-full flex-col">
      <header className="flex h-16 w-full items-center justify-between px-5 py-2.5">
        <Logo />
        {data && !hasWish && (
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
        {isPending ? (
          <FriendProfileSkeleton />
        ) : !data ? (
          <div className="flex w-full flex-col items-center gap-3 py-10">
            <p>친구 프로필을 불러오지 못했어요.</p>
            <Button color="brand" size="small" onClick={() => refetch()}>
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
      {data && (
        <BottomCTA
          type="kakao"
          label={hasWish ? "카카오로 3초 만에 보기" : "카카오로 시작하기"}
          onClick={() => handleKakaoLoginClick(mutate, `/friends/${data.userId}`)}
        />
      )}
    </div>
  );
}
