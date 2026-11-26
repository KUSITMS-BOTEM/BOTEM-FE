"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import Header from "@/components/Header";
import PageExitMotion from "@/components/effects/PageExitMotion";
import { getProfileColor } from "@/components/Profile";
import { usePageExit } from "@/hooks/usePageExit";
import { useFriendProfileQuery } from "@/hooks/queries/friend/useFriendProfileQuery";
import { useHomeFundingsQuery } from "@/hooks/queries/home/useHomeFundingsQuery";
import type { FriendWishResponse } from "@/types/friend/friend";
import { getBirthdayDdayText } from "@/utils/friend/getBirthdayDdayText";
import { toFundingWish } from "@/utils/friend/toFundingWish";
import { formatBirthdayDisplay } from "@/utils/user/formatBirthdayDisplay";
import FriendFundingSection from "@/widgets/friend/FriendFundingSection";
import FriendListItem from "@/widgets/friend/FriendListItem";
import FriendSurpriseWishSheet from "@/widgets/friend/FriendSurpriseWishSheet";
import FriendWishSection from "@/widgets/friend/FriendWishSection";
import FriendProfileSkeleton from "@/widgets/friend/skeleton/FriendProfileSkeleton";
import SurpriseOpenSheet from "@/widgets/funding/SurpriseOpenSheet";
import IconLeft from "@/assets/icons/icon-left.svg?react";

type FriendProfileContainerProps = {
  friendId: string;
};

export default function FriendProfileContainer({ friendId }: FriendProfileContainerProps) {
  const router = useRouter();
  const { pageExit, exitPage } = usePageExit();
  const { data, isPending, refetch } = useFriendProfileQuery(friendId);
  const [wishSheetOpen, setWishSheetOpen] = useState(false);
  const [surpriseWish, setSurpriseWish] = useState<FriendWishResponse | null>(null);
  const [fundingSheetOpen, setFundingSheetOpen] = useState(false);
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const {
    data: homeFundings,
    isPending: isFundingLimitPending,
    isError: isFundingLimitError,
  } = useHomeFundingsQuery();

  const handleSurpriseOpen = () => {
    // 조회가 끝나기 전에는 개설 가능 여부를 알 수 없다. 조회에 실패하면(재조회 실패로 이전 값이 남아도) 개설 요청의 서버 판정에 맡긴다
    if (isFundingLimitPending) return;
    if (!isFundingLimitError && homeFundings?.canOpenFunding === false) setLimitDialogOpen(true);
    else setWishSheetOpen(true);
  };

  const handleWishSelect = (wish: FriendWishResponse) => {
    setWishSheetOpen(false);
    setSurpriseWish(wish);
    setFundingSheetOpen(true);
  };

  return (
    <PageExitMotion exit={pageExit}>
      <div className="bg-semantic-background-default flex min-h-dvh w-full flex-col">
        <Header
          title={data ? `${data.name} 프로필` : "친구 프로필"}
          leftItem={{
            icon: <IconLeft />,
            ariaLabel: "뒤로가기",
            // 공유 링크로 바로 진입하면 돌아갈 히스토리가 없어 back()이 아무 동작도 하지 않는다
            onClick: () =>
              exitPage("slide", () =>
                window.history.length > 1 ? router.back() : router.replace("/home"),
              ),
          }}
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
              <FriendWishSection
                friendId={friendId}
                wishes={data.wishes}
                onSurpriseOpen={handleSurpriseOpen}
              />
              <FriendSurpriseWishSheet
                open={wishSheetOpen}
                wishes={data.wishes}
                onClose={() => setWishSheetOpen(false)}
                onSelect={handleWishSelect}
              />
            </>
          )}
        </main>
        {surpriseWish && data && (
          // 위시는 마운트 때만 읽히므로 위시가 바뀌면 새로 마운트해 입력 상태를 초기화한다
          <SurpriseOpenSheet
            key={surpriseWish.wishId}
            open={fundingSheetOpen}
            wish={toFundingWish(surpriseWish)}
            recipientId={friendId}
            recipientName={data.name}
            recipientBirthday={data.birthday}
            recipientBirthdayDday={data.birthdayDday}
            onClose={() => setFundingSheetOpen(false)}
          />
        )}
        <Dialog
          kind="alert"
          open={limitDialogOpen}
          title={"펀딩은 최대 5개까지만\n열 수 있어요"}
          description={"진행중인 펀딩이 마감되면\n새로운 펀딩을 열 수 있어요"}
          onConfirm={() => setLimitDialogOpen(false)}
        />
      </div>
    </PageExitMotion>
  );
}
