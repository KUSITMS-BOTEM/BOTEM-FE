"use client";

import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import Header from "@/components/Header";
import List from "@/components/List";
import ListHeader from "@/components/ListHeader";
import FriendListItem from "@/widgets/friend/FriendListItem";
import IconDown from "@/assets/icons/icon-down.svg?react";
import IconLeft from "@/assets/icons/icon-left.svg?react";

// 친구 API 명세 전까지 디자인 확인용 정적 더미 데이터
const BIRTHDAY_SOON_FRIENDS = [
  {
    name: "민지",
    wishCount: 3,
    birthdayText: "생일 10월 24일",
    dDayText: "생일까지 3일 남았어요",
    badge: { label: "펀딩 중", color: "neutral" },
  },
  {
    name: "서준",
    wishCount: 6,
    birthdayText: "생일 11월 1일",
    dDayText: "생일까지 7일 남았어요",
    badge: { label: "서프라이즈 중", color: "brand" },
  },
] as const;

const FRIENDS = [
  { name: "하린", wishCount: 4, birthdayText: "생일 11월 28일" },
  { name: "예준", wishCount: 0, birthdayText: "생일 12월 30일" },
  { name: "서준", wishCount: 42, birthdayText: "생일 12월 31일" },
];

export default function FriendsContainer() {
  const router = useRouter();

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
        <div className="flex w-full flex-col gap-3">
          <ListHeader title="전체 12명" />
          <section className="flex w-full flex-col">
            <ListHeader title="곧 생일인 친구" as="h3" />
            {BIRTHDAY_SOON_FRIENDS.map(friend => (
              <FriendListItem key={friend.name} {...friend} />
            ))}
            <Button variant="ghost" rightIcon={<IconDown />} className="w-full">
              전체보기
            </Button>
          </section>
          <div aria-hidden className="bg-semantic-border-weak -mx-5 h-px" />
          <section className="flex w-full flex-col gap-0.5">
            {FRIENDS.map(friend => (
              <FriendListItem key={`${friend.name}-${friend.birthdayText}`} {...friend} />
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
