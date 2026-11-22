import { useEffect, useRef, useState } from "react";

import { DEFAULT_ERROR_MESSAGE, ERROR_MESSAGES } from "@/constants/errorMessages";
import { useAccessGuestContributionMutation } from "@/hooks/mutations/contribution/useAccessGuestContributionMutation";
import { useMyContributionsQuery } from "@/hooks/queries/contribution/useMyContributionsQuery";
import { useGuestBotemStore } from "@/store/guestBotemStore";
import { ApiError } from "@/types/api";
import type { FundingDetailParticipant } from "@/types/funding/fundingDetail";
import type { ShareMemberIntent } from "@/utils/funding/shareMemberIntent";
import { toMyBotemSheetFriends } from "@/utils/funding/toMyBotemSheetFriends";

type Params = {
  shareKey: string;
  isGuest: boolean;
  isMember: boolean;
  memberIntent?: ShareMemberIntent;
  participants: FundingDetailParticipant[];
};

// 공유 화면에서 내가 이 펀딩에 보탠 내역(회원은 내 보탬 조회, 비회원은 본인 확인 응답)과 그에 따른 하단 버튼·시트 상태
export function useMyBotem({ shareKey, isGuest, isMember, memberIntent, participants }: Params) {
  const accessGuest = useAccessGuestContributionMutation(shareKey);
  const { mutate: accessGuestMutate, reset: resetAccessGuest } = accessGuest;
  const guestFindError = accessGuest.error
    ? (accessGuest.error instanceof ApiError && ERROR_MESSAGES[accessGuest.error.code]?.message) ||
      DEFAULT_ERROR_MESSAGE.message
    : undefined;
  // 이 펀딩에서 이름·비밀번호(비회원)나 로그인(회원)으로 내 보탬을 확인하고 나면 하단은 '내 보탬 확인' 버튼만 남는다
  const hasGuestIdentity = useGuestBotemStore(state => state.shareKey === shareKey);
  // 회원은 서버가 이 펀딩에 보탠 내역이 있는지 알려준다. 비로그인 화면에서는 401이 나가지 않도록 조회하지 않는다 (서프라이즈 개설자도 회원이라 조회한다)
  const myContributions = useMyContributionsQuery(shareKey, isMember);
  const memberHasBotem = myContributions.data && myContributions.data.contributions.length > 0;
  const memberHasNoBotem = myContributions.data && myContributions.data.contributions.length === 0;
  // 회원 조회가 끝나기 전에는 하단 버튼을 정할 수 없어 비워 둔다. 조회에 실패하면 두 버튼을 보여주고 중복은 서버가 막는다
  const isCheckingMember = isGuest && isMember && myContributions.isPending;
  const hasConfirmedMyBotem = hasGuestIdentity || !!memberHasBotem;
  // 비회원이 보태기를 마치고 돌아오면 본인 확인 응답이 비어 있어 송금 확인 대기·반려 상태를 알 수 없다. 저장해 둔 이름·비밀번호로 한 번 받아 온다
  const autoAccessedShareKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isGuest || isMember || !hasGuestIdentity || accessGuest.data) return;
    if (autoAccessedShareKeyRef.current === shareKey) return;
    const { name, password } = useGuestBotemStore.getState();
    if (!name || !password) return;
    autoAccessedShareKeyRef.current = shareKey;
    // 실패해도 사용자가 누른 적 없는 요청이라 에러 알림은 띄우지 않는다
    accessGuestMutate(
      { participantName: name, guestPassword: password },
      { onError: resetAccessGuest },
    );
  }, [
    isGuest,
    isMember,
    hasGuestIdentity,
    accessGuest.data,
    shareKey,
    accessGuestMutate,
    resetAccessGuest,
  ]);
  // 내 보탬 시트: 회원은 내 보탬 조회, 비회원은 본인 확인 응답과 입력한 이름으로 내 보탬을 찾는다
  const guestName = useGuestBotemStore(state => (hasGuestIdentity ? state.name : null));
  const myStatuses = isMember
    ? (myContributions.data?.contributions.map(({ status }) => status) ?? [])
    : accessGuest.data
      ? [accessGuest.data.status]
      : [];
  // 개설자가 '받았어요'를 누르기 전(확인 대기)이거나 '못 받았어요'를 누른 보탬이 미확인이다. 송금 전·메시지만 보낸 보탬은 세지 않는다
  const myUnconfirmedCount = myStatuses.filter(
    status => status === "PENDING_CONFIRMATION" || status === "REJECTED",
  ).length;
  const myBotemFriends = toMyBotemSheetFriends({
    participants,
    myName: isMember ? myContributions.data?.contributions[0]?.participantName : guestName,
    hasUnconfirmed: myUnconfirmedCount > 0,
    isRejected: myStatuses.includes("REJECTED"),
  });
  // 보탠 내역이 없는 회원이 '내 보탬 확인'으로 돌아오면 안내만 하고 시트는 열지 않는다
  const [isNoBotemNoticeClosed, setIsNoBotemNoticeClosed] = useState(false);
  const showNoBotemNotice =
    memberIntent === "myBotem" && !!memberHasNoBotem && !isNoBotemNoticeClosed;

  return {
    accessGuest,
    guestFindError,
    myContributions,
    memberHasNoBotem,
    isCheckingMember,
    hasConfirmedMyBotem,
    myUnconfirmedCount,
    myBotemFriends,
    showNoBotemNotice,
    closeNoBotemNotice: () => setIsNoBotemNoticeClosed(true),
  };
}
