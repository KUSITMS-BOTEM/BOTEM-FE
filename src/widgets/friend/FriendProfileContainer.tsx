"use client";

import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import Header from "@/components/Header";
import { getProfileColor } from "@/components/Profile";
import { useFriendProfileQuery } from "@/hooks/queries/friend/useFriendProfileQuery";
import { getBirthdayDdayText } from "@/utils/friend/getBirthdayDdayText";
import { formatBirthdayDisplay } from "@/utils/user/formatBirthdayDisplay";
import FriendFundingSection from "@/widgets/friend/FriendFundingSection";
import FriendListItem from "@/widgets/friend/FriendListItem";
import FriendWishSection from "@/widgets/friend/FriendWishSection";
import FriendProfileSkeleton from "@/widgets/friend/skeleton/FriendProfileSkeleton";
import IconLeft from "@/assets/icons/icon-left.svg?react";

type FriendProfileContainerProps = {
  friendId: string;
};

export default function FriendProfileContainer({ friendId }: FriendProfileContainerProps) {
  const router = useRouter();
  const { data, isPending, refetch } = useFriendProfileQuery(friendId);

  return (
    <div className="bg-semantic-background-default flex min-h-dvh w-full flex-col">
      <Header
        title={data ? `${data.name} 프로필` : "친구 프로필"}
        leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로가기", onClick: () => router.back() }}
      />
      <main className="flex w-full flex-col gap-4 px-5">
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
            {data.fundings.length > 0 && <FriendFundingSection fundings={data.fundings} />}
            <div aria-hidden className="bg-semantic-border-weak -mx-5 h-px" />
            <FriendWishSection wishes={data.wishes} />
          </>
        )}
      </main>
    </div>
  );
}
