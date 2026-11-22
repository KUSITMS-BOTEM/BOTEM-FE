"use client";

import { type ComponentProps, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import Header from "@/components/Header";
import PageExitMotion from "@/components/effects/PageExitMotion";
import ListHeader from "@/components/ListHeader";
import { usePageExit } from "@/hooks/usePageExit";
import { useFriendsQuery } from "@/hooks/queries/friend/useFriendsQuery";
import type { FriendFundingStatus, FriendResponse } from "@/types/friend/friend";
import { toFriendItemProps } from "@/utils/friend/toFriendItemProps";
import FriendListItem from "@/widgets/friend/FriendListItem";
import FriendsSkeleton from "@/widgets/friend/skeleton/FriendsSkeleton";
import IconDown from "@/assets/icons/icon-down.svg?react";
import IconLeft from "@/assets/icons/icon-left.svg?react";
import IconUp from "@/assets/icons/icon-up.svg?react";
import IconSurprise from "@/assets/icons/multicolor/icon-surprise.svg?react";
import BotemSymbol from "@/assets/logo/botem-symbol.svg?react";

const COLLAPSED_COUNT = 2;

const FUNDING_BADGE: Record<FriendFundingStatus, ComponentProps<typeof FriendListItem>["badge"]> = {
  NONE: undefined,
  FUNDING: { label: "펀딩 중", color: "neutral" },
  SURPRISE_FUNDING: {
    label: "서프라이즈 펀딩중",
    color: "brand",
    icon: <IconSurprise aria-hidden className="shrink-0" />,
  },
};

const toFriendListItemProps = (friend: FriendResponse, withDday = false) => ({
  ...toFriendItemProps(friend, withDday),
  badge: FUNDING_BADGE[friend.fundingStatus ?? "NONE"],
});

export default function FriendsContainer() {
  const router = useRouter();
  const { pageExit, exitPage } = usePageExit();
  const { data, isPending, isError, refetch } = useFriendsQuery();
  const [expanded, setExpanded] = useState(false);

  const upcoming = data?.upcomingBirthdayFriends ?? [];
  const upcomingIds = new Set(upcoming.map(friend => friend.userId));
  const others = data?.friends.filter(friend => !upcomingIds.has(friend.userId)) ?? [];
  const visibleUpcoming = expanded ? upcoming : upcoming.slice(0, COLLAPSED_COUNT);

  return (
    <PageExitMotion exit={pageExit}>
      <div className="bg-semantic-background-default flex min-h-dvh w-full flex-col">
        <Header
          title="친구"
          leftItem={{
            icon: <IconLeft />,
            ariaLabel: "뒤로가기",
            onClick: () => exitPage("slide", () => router.back()),
          }}
        />
        <main className="flex w-full flex-col gap-4 px-5">
          <div className="bg-semantic-fill-neutral-weak -mx-5 flex items-center justify-between gap-2 px-5 py-[15px]">
            <div className="flex min-w-0 items-center gap-2">
              <BotemSymbol aria-hidden className="h-5 w-[22.21px] shrink-0" />
              <p className="text-semantic-text-primary truncate text-[15px] font-semibold tracking-[-0.3px]">
                보탬에 친구와 함께해요!
              </p>
            </div>
            <Button color="brand" size="small" className="shrink-0">
              초대링크 전송
            </Button>
          </div>
          {isPending && <FriendsSkeleton />}
          {isError && (
            <div className="flex w-full flex-col items-center gap-3 py-10">
              <p>친구 목록을 불러오지 못했어요.</p>
              <Button color="brand" size="small" onClick={() => refetch()}>
                다시 시도
              </Button>
            </div>
          )}
          {data && (
            <div className="flex w-full flex-col gap-3">
              <ListHeader title={`전체 ${data.totalCount}명`} />
              {upcoming.length > 0 && (
                <>
                  <section className="flex w-full flex-col">
                    <ListHeader title="곧 생일인 친구" as="h3" />
                    {visibleUpcoming.map(friend => (
                      <Link
                        key={friend.userId}
                        href={`/friends/${friend.userId}`}
                        className="block">
                        <FriendListItem {...toFriendListItemProps(friend, true)} />
                      </Link>
                    ))}
                    {upcoming.length > COLLAPSED_COUNT && (
                      <Button
                        variant="ghost"
                        rightIcon={expanded ? <IconUp /> : <IconDown />}
                        className="w-full"
                        onClick={() => setExpanded(prev => !prev)}>
                        {expanded ? "접기" : "전체보기"}
                      </Button>
                    )}
                  </section>
                  <div aria-hidden className="bg-semantic-border-weak -mx-5 h-px" />
                </>
              )}
              <section className="flex w-full flex-col gap-0.5">
                {others.map(friend => (
                  <Link key={friend.userId} href={`/friends/${friend.userId}`} className="block">
                    <FriendListItem {...toFriendListItemProps(friend)} />
                  </Link>
                ))}
              </section>
            </div>
          )}
        </main>
      </div>
    </PageExitMotion>
  );
}
