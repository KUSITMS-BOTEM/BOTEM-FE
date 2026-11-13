"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import Header from "@/components/Header";
import List from "@/components/List";
import ListHeader from "@/components/ListHeader";
import { useFriendsQuery } from "@/hooks/queries/friend/useFriendsQuery";
import { toFriendItemProps } from "@/utils/friend/toFriendItemProps";
import FriendListItem from "@/widgets/friend/FriendListItem";
import IconDown from "@/assets/icons/icon-down.svg?react";
import IconLeft from "@/assets/icons/icon-left.svg?react";
import IconUp from "@/assets/icons/icon-up.svg?react";

const COLLAPSED_COUNT = 2;

export default function FriendsContainer() {
  const router = useRouter();
  const { data } = useFriendsQuery();
  const [expanded, setExpanded] = useState(false);

  const upcoming = data?.upcomingBirthdayFriends ?? [];
  const upcomingIds = new Set(upcoming.map(friend => friend.userId));
  const others = data?.friends.filter(friend => !upcomingIds.has(friend.userId)) ?? [];
  const visibleUpcoming = expanded ? upcoming : upcoming.slice(0, COLLAPSED_COUNT);

  return (
    <div className="bg-semantic-background-default flex min-h-dvh w-full flex-col">
      <Header
        title="친구"
        leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로가기", onClick: () => router.back() }}
      />
      <main className="flex w-full flex-col gap-4 px-5">
        <List
          title="보탬에 친구와 함께해요!"
          description={"초대링크로 가입하면 바로 친구가 되고,\n서로의 위시를 볼 수 있어요"}
          right={
            <Button color="brand" size="small">
              초대링크 전송
            </Button>
          }
        />
        {data && (
          <div className="flex w-full flex-col gap-3">
            <ListHeader title={`전체 ${data.totalCount}명`} />
            {upcoming.length > 0 && (
              <>
                <section className="flex w-full flex-col">
                  <ListHeader title="곧 생일인 친구" as="h3" />
                  {visibleUpcoming.map(friend => (
                    <FriendListItem key={friend.userId} {...toFriendItemProps(friend, true)} />
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
                <FriendListItem key={friend.userId} {...toFriendItemProps(friend)} />
              ))}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
