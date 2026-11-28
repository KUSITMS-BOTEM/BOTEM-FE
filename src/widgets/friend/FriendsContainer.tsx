"use client";

import { type ComponentProps, useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import Button from "@/components/Button";
import Header from "@/components/Header";
import Logo from "@/components/Logo";
import PageExitMotion from "@/components/effects/PageExitMotion";
import ListHeader from "@/components/ListHeader";
import ToastMessage from "@/components/ToastMessage";
import { APP_MAX_WIDTH_CLASS } from "@/constants/layout";
import { SLIDE_TRANSITION } from "@/constants/motion";
import { usePageExit } from "@/hooks/usePageExit";
import { useShareLink } from "@/hooks/useShareLink";
import { useFriendsQuery } from "@/hooks/queries/friend/useFriendsQuery";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { useFriendsEntryStore } from "@/store/friendsEntryStore";
import type { FriendResponse } from "@/types/friend/friend";
import { cn } from "@/utils/cn";
import { toFriendItemProps } from "@/utils/friend/toFriendItemProps";
import FriendListItem from "@/widgets/friend/FriendListItem";
import FriendsSkeleton from "@/widgets/friend/skeleton/FriendsSkeleton";
import IconDown from "@/assets/icons/icon-down.svg?react";
import IconLeft from "@/assets/icons/icon-left.svg?react";
import IconUp from "@/assets/icons/icon-up.svg?react";
import IconSurprise from "@/assets/icons/multicolor/icon-surprise.svg?react";

const COLLAPSED_COUNT = 2;

type FriendBadge = ComponentProps<typeof FriendListItem>["badge"];

const FUNDING_BADGE: FriendBadge = { label: "펀딩 중", color: "neutral" };
const SURPRISE_FUNDING_BADGE: FriendBadge = {
  label: "서프라이즈 펀딩중",
  color: "brand",
  icon: <IconSurprise aria-hidden className="shrink-0" />,
};

// 배지는 하나만 보여주므로 둘 다 진행 중이면 서프라이즈를 우선한다
const getFundingBadge = (friend: FriendResponse): FriendBadge => {
  if (friend.surpriseFundingInProgress) return SURPRISE_FUNDING_BADGE;
  if (friend.fundingInProgress) return FUNDING_BADGE;
  return undefined;
};

const toFriendListItemProps = (friend: FriendResponse, withDday = false) => ({
  ...toFriendItemProps(friend, withDday),
  badge: getFundingBadge(friend),
});

export default function FriendsContainer() {
  const router = useRouter();
  const { pageExit, exitPage } = usePageExit();
  const { data, isPending, isError, refetch } = useFriendsQuery();
  const { data: profile } = useMyProfileQuery();
  const { toast, share } = useShareLink();
  const [expanded, setExpanded] = useState(false);
  const [slideIn] = useState(() => useFriendsEntryStore.getState().slideIn);

  useEffect(() => {
    useFriendsEntryStore.getState().setSlideIn(false);
  }, []);

  const upcoming = data?.upcomingBirthdayFriends ?? [];
  const upcomingIds = new Set(upcoming.map(friend => friend.userId));
  const others = data?.friends.filter(friend => !upcomingIds.has(friend.userId)) ?? [];
  const collapsedUpcoming = upcoming.slice(0, COLLAPSED_COUNT);
  const extraUpcoming = upcoming.slice(COLLAPSED_COUNT);

  const renderUpcomingFriend = (friend: FriendResponse) => (
    <Link key={friend.userId} href={`/friends/${friend.userId}`} className="block">
      <FriendListItem {...toFriendListItemProps(friend, true)} />
    </Link>
  );

  return (
    <PageExitMotion exit={pageExit} slideIn={slideIn}>
      <div className="bg-semantic-background-default flex min-h-dvh w-full flex-col">
        <Header
          title="친구"
          leftItem={{
            icon: <IconLeft />,
            ariaLabel: "뒤로가기",
            onClick: () => exitPage("slide", () => router.back()),
          }}
        />
        <main className="flex w-full flex-col gap-4">
          <div className="bg-semantic-fill-neutral-weak flex h-[62px] w-full items-center justify-between px-5">
            <div className="flex items-center gap-2">
              <Logo type="symbol" size="medium" />
              <p className="text-semantic-text-primary [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-label-small)]">
                보탬에 친구와 함께해요!
              </p>
            </div>
            <Button
              color="brand"
              size="small"
              className="shrink-0"
              disabled={!profile?.wishProfileUrl}
              onClick={() =>
                profile && share({ title: "보탬에 친구와 함께해요!", url: profile.wishProfileUrl })
              }>
              초대링크 전송
            </Button>
          </div>
          <div className="flex w-full flex-col gap-4 px-5">
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
                      {collapsedUpcoming.map(renderUpcomingFriend)}
                      <AnimatePresence initial={false}>
                        {expanded && extraUpcoming.length > 0 && (
                          <motion.div
                            key="extra-upcoming"
                            className="overflow-hidden"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={SLIDE_TRANSITION}>
                            {extraUpcoming.map(renderUpcomingFriend)}
                          </motion.div>
                        )}
                      </AnimatePresence>
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
          </div>
        </main>
        <div
          className={cn(
            "pointer-events-none fixed inset-x-0 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-20 mx-auto flex w-full justify-center",
            APP_MAX_WIDTH_CLASS,
          )}>
          <ToastMessage
            show={toast !== null}
            state={toast === "success"}
            text={toast === "fail" ? "링크를 복사하지 못했어요" : "초대 링크를 복사했어요"}
          />
        </div>
      </div>
    </PageExitMotion>
  );
}
