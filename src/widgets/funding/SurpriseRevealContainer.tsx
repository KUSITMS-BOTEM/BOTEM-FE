"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import Button from "@/components/Button";
import ErrorView from "@/components/ErrorView";
import Header from "@/components/Header";
import LoadingAnimation from "@/components/LoadingAnimation";
import { useOpenSurpriseMutation } from "@/hooks/mutations/funding/useOpenSurpriseMutation";
import { useSurpriseRevealQuery } from "@/hooks/queries/funding/useSurpriseRevealQuery";
import { useSurpriseThankCardFriendsQuery } from "@/hooks/queries/funding/useSurpriseThankCardFriendsQuery";
import { ApiError } from "@/types/api";
import type { SurpriseThankCardFriend } from "@/types/funding/surprise";
import FundingLockedView from "@/widgets/funding/FundingLockedView";
import FundingRevealView from "@/widgets/funding/FundingRevealView";
import SurpriseThankFriendsSheet from "@/widgets/funding/SurpriseThankFriendsSheet";
import ThankCardSheet from "@/widgets/funding/ThankCardSheet";
import RollingPaperContainer from "@/widgets/rolling-paper/RollingPaperContainer";
import IconClose from "@/assets/icons/icon-close.svg?react";

// 공개 전에는 존재 여부를 숨기려고 서버가 404로 주는 코드
const SURPRISE_LOCKED = "FUNDING_016";

type SurpriseRevealContainerProps = {
  fundingId: string;
};

export default function SurpriseRevealContainer({ fundingId }: SurpriseRevealContainerProps) {
  const id = Number(fundingId);
  const router = useRouter();
  const { data, error, isError, isSuccess, refetch } = useSurpriseRevealQuery(id);
  const openMutation = useOpenSurpriseMutation();
  const opened = !!data?.openedAt;
  // 보탠 친구 전체 이름은 고마운 친구 목록에만 있고, 이 목록은 서프라이즈를 연 뒤에만 조회된다(SURPRISE_NOT_OPENED)
  const friendsQuery = useSurpriseThankCardFriendsQuery(id, opened);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [thankFriend, setThankFriend] = useState<SurpriseThankCardFriend | null>(null);
  // StrictMode에서 effect가 두 번 돌아도 열기 요청은 한 번만 보낸다
  const openRequestedRef = useRef(false);
  const goHome = () => router.replace("/home");
  const goResult = () => router.push(`/surprised/${fundingId}/result`);
  const backToFriends = () => {
    setThankFriend(null);
    setFriendsOpen(true);
  };
  const { mutate: openSurprise } = openMutation;
  const loading = (
    <div role="status" className="flex min-h-dvh items-center justify-center">
      <LoadingAnimation size="large" />
      <span className="sr-only">서프라이즈를 불러오는 중이에요</span>
    </div>
  );

  // 홈 공개 카드의 '팡! 열어볼까요?'를 누르고 들어온 것이 곧 여는 동작이라, 들어오자마자 연다
  useEffect(() => {
    if (!data || data.openedAt || openRequestedRef.current) return;
    openRequestedRef.current = true;
    openSurprise(id);
  }, [data, id, openSurprise]);

  if (!data) {
    if (isError && error instanceof ApiError && error.code === SURPRISE_LOCKED) {
      return <FundingLockedView />;
    }
    if (isError || isSuccess) {
      return <ErrorView onRetry={() => void refetch()} onClose={goHome} />;
    }
    return loading;
  }
  if (openMutation.isError) {
    return <ErrorView onRetry={() => openSurprise(id)} onClose={goHome} />;
  }
  // 이름 모션은 한 번만 재생돼, 이름을 다 받은 뒤에 그린다. 목록을 못 받으면 메시지를 남긴 친구 이름으로 대신한다
  const contributorNames = friendsQuery.data
    ? friendsQuery.data.friends.map(friend => friend.name)
    : friendsQuery.isError
      ? data.messages.map(message => message.participantName)
      : null;
  if (!opened || !contributorNames) return loading;

  // 글을 남긴 친구가 없으면 메시지 화면을 건너뛰고 선물 화면으로 간다
  const handleOpenMessage = () => {
    if (data.messageCount === 0) goResult();
    else setMessagesOpen(true);
  };

  return (
    <>
      <div className="bg-semantic-background-default flex min-h-dvh flex-col">
        <Header
          title=""
          rightItems={[{ icon: <IconClose />, ariaLabel: "닫기", onClick: goHome }]}
        />
        <FundingRevealView
          contributorNames={contributorNames}
          participantCount={data.participantCount}
          confirmedAmount={data.confirmedAmount}
          achievementPercentage={data.confirmedPercentage}
          isOpening={false}
          onOpenMessages={handleOpenMessage}
        />
      </div>
      <RollingPaperContainer
        fundingId={id}
        open={messagesOpen}
        onClose={() => setMessagesOpen(false)}
        ctaButtons={
          <>
            <Button color="brand" variant="weak" size="xlarge" onClick={() => setFriendsOpen(true)}>
              감사카드 보내기
            </Button>
            <Button color="brand" size="xlarge" onClick={goResult}>
              선물 받으러 가기
            </Button>
          </>
        }
      />
      <SurpriseThankFriendsSheet
        open={friendsOpen}
        fundingId={id}
        onClose={() => setFriendsOpen(false)}
        onThankCardClick={friend => {
          setFriendsOpen(false);
          setThankFriend(friend);
        }}
      />
      {/* 닫으면 언마운트돼 다음 친구에게는 빈 카드로 다시 시작한다 */}
      {thankFriend && (
        <ThankCardSheet
          open
          fundingId={id}
          contributionId={thankFriend.contributionId}
          recipientName={thankFriend.name}
          onClose={backToFriends}
          onDepositUnconfirmed={backToFriends}
        />
      )}
    </>
  );
}
