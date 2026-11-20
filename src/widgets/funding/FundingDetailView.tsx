"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import Header from "@/components/Header";
import PageExitMotion from "@/components/effects/PageExitMotion";
import ProfileBox from "@/components/ProfileBox";
import ToastMessage from "@/components/ToastMessage";
import Tooltip from "@/components/Tooltip";
import { APP_MAX_WIDTH_CLASS } from "@/constants/layout";
import { useFundingExtendToast } from "@/hooks/useFundingExtendToast";
import { useShareLink } from "@/hooks/useShareLink";
import { usePageExit } from "@/hooks/usePageExit";
import { useFundingContributionStore } from "@/store/fundingContributionStore";
import { useKakaoLoginUriMutation } from "@/hooks/mutations/auth/useKakaoLoginUriMutation";
import { useAccessGuestContributionMutation } from "@/hooks/mutations/contribution/useAccessGuestContributionMutation";
import { useCreateMessageContributionMutation } from "@/hooks/mutations/contribution/useCreateMessageContributionMutation";
import { useMyContributionsQuery } from "@/hooks/queries/contribution/useMyContributionsQuery";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { DEFAULT_ERROR_MESSAGE, ERROR_MESSAGES } from "@/constants/errorMessages";
import { ApiError } from "@/types/api";
import { useGuestBotemStore } from "@/store/guestBotemStore";
import { handleKakaoLoginClick } from "@/utils/auth/handleKakaoLoginClick";
import { getShareReturnPath, type ShareMemberIntent } from "@/utils/funding/shareMemberIntent";
import { cn } from "@/utils/cn";
import type { FundingDetailResponse } from "@/types/funding/fundingDetail";
import type { OwnerFundingDetailResponse } from "@/types/funding/ownerFundingDetail";
import { getClosedLabel } from "@/utils/funding/fundingProgress";
import { toOwnerFundingView } from "@/utils/funding/toOwnerFundingView";
import BotemEditFlow from "@/widgets/funding/BotemEditFlow";
import BotemEditSheet from "@/widgets/funding/BotemEditSheet";
import BotemPopup from "@/widgets/funding/BotemPopup";
import MyBotemSheet, { type MyBotemSheetFriend } from "@/widgets/funding/MyBotemSheet";
import DepositConfirmSheet from "@/widgets/funding/DepositConfirmSheet";
import FundingContributeSheet from "@/widgets/funding/FundingContributeSheet";
import FundingGiftProofView from "@/widgets/funding/FundingGiftProofView";
import FundingMessage from "@/widgets/funding/FundingMessage";
import FundingMoreFlow from "@/widgets/funding/FundingMoreFlow";
import FundingPasswordSheet from "@/widgets/funding/FundingPasswordSheet";
import FundingProgressCard from "@/widgets/funding/FundingProgressCard";
import FundingTransferGuideSheet, {
  type FundingTransferAccount,
} from "@/widgets/funding/FundingTransferGuideSheet";
import LetterWriteSheet from "@/widgets/letter-paper/LetterWriteSheet";
import IconShare from "@/assets/icons/icon-share.svg?react";
import IconDotVertical from "@/assets/icons/icon-dotvertical.svg?react";
import IconLeft from "@/assets/icons/icon-left.svg?react";
import IconLock from "@/assets/icons/icon-lock.svg?react";
import ProfilePink from "@/assets/icons/multicolor/profile-pink.svg?react";

type FundingDetailViewBaseProps = {
  fundingId: string;
  // guest: 비회원 공유 링크 / surprise: 친구 몰래 연 개설자 화면 / owner: 내 펀딩을 연 주인 화면
  variant?: "guest" | "surprise" | "owner";
  // 있으면 헤더 왼쪽에 뒤로가기 버튼을 보여준다
  onBack?: () => void;
  // 공유 화면에서 로그인해 돌아온 회원이 어느 버튼에서 출발했는지
  memberIntent?: ShareMemberIntent;
  // 서버가 쿠키로 확인한 로그인 여부. 새로고침해 복귀 쿼리가 사라져도 회원임을 유지한다
  isLoggedIn?: boolean;
};

// 공유 화면(guest)은 공개 상세 detail, 개설자 화면(owner·surprise)은 관리 상세 ownerDetail로 그린다
type FundingDetailViewProps = FundingDetailViewBaseProps &
  (
    | { detail: FundingDetailResponse; ownerDetail?: undefined }
    | { detail?: undefined; ownerDetail: OwnerFundingDetailResponse }
  );

// 프로필 묶음에 보여줄 최대 인원. 나머지는 +N으로 묶는다
const MAX_PROFILES = 3;
const PROFILE_COLORS = ["orange", "blue", "pink", "lime"] as const;

// TODO(API): 아래 값은 두 상세 응답에 없어 목으로 남긴다. 개설자 화면은 toOwnerFundingView 값이 덮어쓴다
const MOCK_FUNDING = {
  hostName: "지유",
  closed: false,
  extended: false,
  actions: { canCloseEarly: true, canReissueShareCard: true },
  pendingContributionCount: 3,
  // TODO(API): 펀딩 주인이 받은 메세지 수·친구별 감사카드 발송 여부를 서버 값으로 교체한다
  messageCount: 8,
  friends: [
    { id: 1, name: "민수", contributedAt: "2026-11-10T09:00:00", thankCardSent: false },
    {
      id: 2,
      name: "서연",
      contributedAt: "2026-11-12T18:30:00",
      thankCardSent: true,
      // TODO(API): 참여자 화면의 '내 보탬'(isMine)·개설자 확인 여부(isConfirmed)를 내 보탬 조회 API 값으로 교체한다
      isMine: true,
      isConfirmed: false,
    },
  ] satisfies MyBotemSheetFriend[],
  account: {
    bank: "TOSS_BANK",
    accountHolder: "김민재",
    accountNumber: "1000-1234-5678",
  } satisfies FundingTransferAccount,
};

// 공유용 상세 응답에는 금액이 없고 달성률만 있어, 화면이 쓰는 모양으로 옮겨 담는다
const toShareFundingView = (detail: FundingDetailResponse) => ({
  hostName: detail.celebrantName,
  title: detail.title ?? `${detail.celebrantName}의 펀딩`,
  story: detail.story ?? undefined,
  pledge: detail.promise ?? undefined,
  productName: detail.product.name,
  productImageUrl: detail.product.imageUrl,
  // 응답은 "YYYY-MM-DDTHH:mm:ss"라 날짜만 쓴다
  deadline: detail.deadline.slice(0, 10),
  progress: detail.confirmedPercentage,
  pendingPercentage: detail.pendingPercentage,
  targetAmount: detail.targetAmount,
  participantCount: detail.participantCount,
  hasGiftProof: detail.giftVerification !== null,
  profiles: detail.participants.slice(0, MAX_PROFILES).map((participant, index) => ({
    color: PROFILE_COLORS[index % PROFILE_COLORS.length],
    imageUrl: participant.profileImageUrl ?? undefined,
  })),
  extraParticipantCount: Math.max(0, detail.participantCount - MAX_PROFILES),
});

const toHostFundingView = (ownerDetail: OwnerFundingDetailResponse) => ({
  ...toOwnerFundingView(ownerDetail),
  pendingPercentage: ownerDetail.pendingPercentage,
  participantCount: ownerDetail.participantCount,
  hasGiftProof: false,
});

const noop = () => {};

export default function FundingDetailView({
  fundingId,
  variant = "guest",
  onBack,
  memberIntent,
  isLoggedIn = false,
  ...source
}: FundingDetailViewProps) {
  const router = useRouter();
  const { pageExit, exitPage } = usePageExit();
  const { toast, copyLink } = useShareLink();
  const { profiles, ...view } = source.ownerDetail
    ? toHostFundingView(source.ownerDetail)
    : toShareFundingView(source.detail);
  const funding = { ...MOCK_FUNDING, ...view };
  const unconfirmedCount = funding.pendingContributionCount;
  const isSurprise = variant === "surprise";
  const isOwner = variant === "owner";
  const isGuest = variant === "guest";
  // 하단 CTA 버튼을 누르면 회원/비회원 구분 Dialog를 띄운다. 값은 어느 버튼에서 왔는지
  // 어느 버튼에서 왔는지에 따라 '예'(로그인 후 복귀 경로)·'아니오'(비회원 플로우)가 갈린다
  const [memberCheckFrom, setMemberCheckFrom] = useState<ShareMemberIntent | null>(null);
  const { mutate: requestKakaoLogin } = useKakaoLoginUriMutation();
  const [isGuestFindOpen, setIsGuestFindOpen] = useState(false);
  const accessGuest = useAccessGuestContributionMutation(Number(fundingId));
  const guestFindError = accessGuest.error
    ? (accessGuest.error instanceof ApiError && ERROR_MESSAGES[accessGuest.error.code]?.message) ||
      DEFAULT_ERROR_MESSAGE.message
    : undefined;
  const isMember = memberIntent !== undefined || isLoggedIn;
  // 비회원이 '보태러가기'에서 확인을 마치거나 회원이 보태러가기로 돌아오면 하단이 '메시지 보태기'/'보태기'로 바뀐다
  const [isContributeReady, setIsContributeReady] = useState(memberIntent === "contribute");
  // 이 펀딩에서 이름·비밀번호(비회원)나 로그인(회원)으로 내 보탬을 확인하고 나면 하단은 '내 보탬 확인' 버튼만 남는다
  const hasGuestIdentity = useGuestBotemStore(state => state.fundingId === fundingId);
  // 회원은 서버가 이 펀딩에 보탠 내역이 있는지 알려준다. 비로그인 화면에서는 401이 나가지 않도록 조회하지 않는다
  const myContributions = useMyContributionsQuery(Number(fundingId), isGuest && isMember);
  const memberHasBotem = myContributions.data && myContributions.data.contributions.length > 0;
  const memberHasNoBotem = myContributions.data && myContributions.data.contributions.length === 0;
  // 회원 조회가 끝나기 전에는 하단 버튼을 정할 수 없어 비워 둔다. 조회에 실패하면 두 버튼을 보여주고 중복은 서버가 막는다
  const isCheckingMember = isGuest && isMember && myContributions.isPending;
  const hasConfirmedMyBotem = hasGuestIdentity || !!memberHasBotem;
  // 보탠 내역이 없는 회원이 '내 보탬 확인'으로 돌아오면 안내만 하고 시트는 열지 않는다
  const [isNoBotemNoticeClosed, setIsNoBotemNoticeClosed] = useState(false);
  const showNoBotemNotice =
    memberIntent === "myBotem" && !!memberHasNoBotem && !isNoBotemNoticeClosed;
  // 비회원 화면에서는 401 요청이 나가지 않도록 로그인 복귀한 회원일 때만 조회한다
  const { data: profile } = useMyProfileQuery(isMember);
  const memberName = profile?.name ?? undefined;
  // 받은 입금을 확인해야 하는 쪽(서프라이즈 개설자·펀딩 주인)
  const confirmsDeposits = isSurprise || isOwner;
  // 회원이 '내 보탬 확인'으로 로그인해 돌아오면 팝업을 바로 연다. 보태러가기로 돌아오면 자동으로 열지 않는다
  const [isPopupOpen, setIsPopupOpen] = useState(memberIntent === "myBotem");
  // 시트를 자동으로 여는 신호는 한 번만 쓴다. 쿼리가 남으면 새로고침 때마다 시트가 다시 열린다 (보태러가기 쿼리는 새로고침해도 모드가 유지되도록 둔다)
  useEffect(() => {
    if (memberIntent === "myBotem") window.history.replaceState(null, "", window.location.pathname);
  }, [memberIntent]);
  const showExtendedToast = useFundingExtendToast();
  const [isMemberGuideOpen, setIsMemberGuideOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const contributeAmount = useFundingContributionStore(state => state.amount);
  const { setAmount, setLetter, setPassword, reset } = useFundingContributionStore.getState();
  const [isExitOpen, setIsExitOpen] = useState(false);
  // 메시지 보태기는 금액·송금 없이 편지 → 비밀번호만 거친다
  const [isMessageOnly, setIsMessageOnly] = useState(false);
  // 올리면 금액·편지 시트가 새로 마운트되어 입력값이 모두 초기화된다
  const [flowKey, setFlowKey] = useState(0);
  const createMessage = useCreateMessageContributionMutation(Number(fundingId));
  // 같은 플로우에서 실패 후 재시도하면 같은 키로 보내 서버가 중복 참여를 만들지 않게 한다
  const requestKeyRef = useRef("");
  const closePopup = () => setIsPopupOpen(false);
  const requestExit = () => setIsExitOpen(true);
  // 보태기를 마치면 돌아왔을 때 하단이 '내 보탬 확인'이 되도록 이 펀딩의 본인 확인을 기록한다 (회원은 비밀번호가 없다)
  const goToComplete = (password = "") => {
    const name = useFundingContributionStore.getState().letter?.name ?? "";
    useGuestBotemStore.getState().setIdentity(fundingId, name, password);
    router.replace(`/share/${fundingId}/complete`);
  };

  // 뒤로가기 등으로 플로우를 중간에 떠나 남은 값이 있으면 비우고 시작한다
  const startMessage = () => {
    reset();
    requestKeyRef.current = crypto.randomUUID();
    setIsMessageOnly(true);
    setIsLetterOpen(true);
  };
  const startContribute = () => {
    reset();
    setIsMessageOnly(false);
    setIsContributeOpen(true);
  };

  // 편지를 서버에 제출하고 성공하면 완료 화면으로 간다. 회원은 비밀번호 없이 보낸다
  const submitMessage = (password?: string) => {
    const letter = useFundingContributionStore.getState().letter;
    if (!letter) return;
    createMessage.mutate(
      { letter, requestKey: requestKeyRef.current, guestPassword: password },
      {
        onSuccess: () => goToComplete(password),
        // 이름이 겹치면 비밀번호 시트를 닫아 편지 시트에서 이름을 고치게 한다
        onError: error => {
          if (error instanceof ApiError && error.code === "FUNDING_032") setIsPasswordOpen(false);
        },
      },
    );
  };

  // 보태기 플로우에서 입력한 값을 모두 버리고 열려 있는 시트를 닫는다
  const handleExitConfirm = () => {
    setIsExitOpen(false);
    setIsContributeOpen(false);
    setIsLetterOpen(false);
    setIsPasswordOpen(false);
    setIsMemberGuideOpen(false);
    reset();
    setFlowKey(key => key + 1);
  };
  // 서버가 남은 금액을 주지 않아 목표 금액에서 확정·확인 대기 달성률을 뺀 값으로 근사한다 (서버가 최종 검증)
  const remainingAmount = Math.max(
    0,
    Math.round((funding.targetAmount * (100 - funding.progress - funding.pendingPercentage)) / 100),
  );
  // 금액 달성(마감)·기간 마감·서버가 알려준 조기 마감 모두 닫힌 펀딩이다
  const closedLabel = getClosedLabel({ percent: funding.progress, deadline: funding.deadline });
  const isClosed = funding.closed || closedLabel !== null;

  // 공유 링크로 들어온 친구에게 마감 후 선물 인증을 보여주는 화면이라 개설자 화면은 해당하지 않는다
  if (!confirmsDeposits && isClosed && funding.hasGiftProof) {
    return (
      <FundingGiftProofView
        contributorCount={funding.participantCount}
        productName={funding.productName}
      />
    );
  }

  return (
    <PageExitMotion exit={pageExit}>
      <main className="flex min-h-dvh flex-col">
        <Header
          title=""
          leftItem={
            onBack && {
              icon: <IconLeft />,
              ariaLabel: "뒤로가기",
              onClick: () => exitPage("slide", onBack),
            }
          }
          rightItems={[
            {
              icon: <IconShare />,
              ariaLabel: "공유",
              onClick: () => copyLink(`${window.location.origin}/share/${fundingId}`),
            },
            // 참여자용 공유 화면(guest)에는 더보기가 없다. 개설자 화면의 더보기는 공유 카드 다시 받기·조기 마감이다
            ...(isGuest
              ? []
              : [
                  {
                    icon: <IconDotVertical />,
                    ariaLabel: "더보기",
                    onClick: () => setIsMoreOpen(true),
                  },
                ]),
          ]}
        />
        <div
          className={cn(
            "flex flex-col gap-4 px-5 pb-[calc(var(--padding-large)+env(safe-area-inset-bottom))]",
            // fixed 하단 CTA(그라데이션 36 + 버튼 56 + 여백)에 내용이 가려지지 않게 비운다
            isGuest && "pb-[calc(8rem+env(safe-area-inset-bottom))]",
          )}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 py-1">
              <ProfilePink aria-hidden className="size-6 shrink-0" />
              <h1 className="text-semantic-text-strong min-w-0 [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-title-a2-z-large)]">
                {funding.title}
              </h1>
              {isSurprise && (
                <IconLock role="img" aria-label="서프라이즈 펀딩" className="size-6 shrink-0" />
              )}
            </div>
            <FundingMessage story={funding.story} pledge={funding.pledge} />
          </div>
          <div className="relative">
            <FundingProgressCard
              fundingId={fundingId}
              productImageUrl={funding.productImageUrl}
              productName={funding.productName}
              deadline={funding.deadline}
              percent={funding.progress}
              targetAmount={funding.targetAmount}
              locked={isSurprise}
            />
            <ToastMessage
              show={showExtendedToast}
              state
              text="기간이 연장됐어요"
              className="pointer-events-none absolute inset-x-0 top-full z-20 w-full max-w-none"
            />
          </div>
          {!isGuest && (
            <button
              type="button"
              onClick={() => setIsPopupOpen(true)}
              className="flex cursor-pointer items-center gap-2 self-end">
              {/* Figma FUND-PG-008: 펀딩 주인 화면은 툴팁 없이 프로필 묶음만 보여준다 */}
              {!isOwner && (
                <Tooltip>
                  {isSurprise
                    ? `확인 대기 ${unconfirmedCount}건이 있어요`
                    : closedLabel === "기간 마감"
                      ? "축하 메시지만 보낼 수 있어요!"
                      : isClosed
                        ? "마감일까지 메시지로 보탤까요?"
                        : `나도 ${funding.hostName}님께 보태볼까요?`}
                </Tooltip>
              )}
              <ProfileBox
                profiles={profiles}
                extraCount={funding.extraParticipantCount}
                notification={confirmsDeposits && unconfirmedCount > 0}
                className="bg-semantic-fill-default shadow-[0_4px_8px_0_var(--color-semantic-shadow-weak)]"
              />
            </button>
          )}
        </div>
        {isGuest && !isCheckingMember && (
          <BottomCTA>
            {hasConfirmedMyBotem ? (
              <Button size="xlarge" variant="fill" onClick={() => setIsPopupOpen(true)}>
                내 보탬 확인
              </Button>
            ) : isContributeReady || memberHasNoBotem ? (
              <>
                <Button size="xlarge" variant="weak" onClick={startMessage}>
                  메시지 보태기
                </Button>
                <Button size="xlarge" variant="fill" disabled={isClosed} onClick={startContribute}>
                  보태기
                </Button>
              </>
            ) : (
              <>
                <Button size="xlarge" variant="weak" onClick={() => setMemberCheckFrom("myBotem")}>
                  내 보탬 확인
                </Button>
                <Button
                  size="xlarge"
                  variant="fill"
                  onClick={() => setMemberCheckFrom("contribute")}>
                  보태러 가기
                </Button>
              </>
            )}
          </BottomCTA>
        )}
        {/* 일치하는 보탬이 있을 때만 확인 완료로 본다. 없으면 시트를 닫지 않고 안내해 재입력하게 한다 */}
        <BotemEditSheet
          open={isGuestFindOpen}
          isPending={accessGuest.isPending}
          errorMessage={guestFindError}
          onClose={() => {
            accessGuest.reset();
            setIsGuestFindOpen(false);
          }}
          onSubmit={(name, password) =>
            accessGuest.mutate(
              { participantName: name, guestPassword: password },
              {
                onSuccess: () => {
                  useGuestBotemStore.getState().setIdentity(fundingId, name, password);
                  setIsGuestFindOpen(false);
                  setIsPopupOpen(true);
                },
              },
            )
          }
        />
        <Dialog
          kind="alert"
          open={showNoBotemNotice}
          title="이 펀딩에 보탠 내역이 없어요"
          onConfirm={() => setIsNoBotemNoticeClosed(true)}
        />
        <Dialog
          kind="confirm"
          open={memberCheckFrom !== null}
          title="이미 보탬 회원이신가요?"
          description="비회원이여도 보태러갈 수 있어요"
          confirmColor="neutral"
          onCancel={() => {
            if (memberCheckFrom === "myBotem") setIsGuestFindOpen(true);
            else setIsContributeReady(true);
            setMemberCheckFrom(null);
          }}
          onConfirm={() => {
            if (memberCheckFrom) {
              handleKakaoLoginClick(
                requestKakaoLogin,
                getShareReturnPath(fundingId, memberCheckFrom),
              );
            }
            setMemberCheckFrom(null);
          }}
        />
        {isGuest ? (
          <MyBotemSheet
            open={isPopupOpen && hasConfirmedMyBotem}
            unconfirmedCount={unconfirmedCount}
            friends={funding.friends}
            ownerName={funding.hostName}
            isClosed={isClosed}
            onClose={closePopup}
            onEditClick={() => {
              closePopup();
              setIsEditOpen(true);
            }}
          />
        ) : (
          // TODO: 팝업 내부 동작(미확인·수정·메세지·보태기)은 보탬 폼 디자인이 정해지면 연결한다
          <BotemPopup
            open={isPopupOpen}
            unconfirmedCount={unconfirmedCount}
            friends={funding.friends}
            ownerName={funding.hostName}
            isClosed={isClosed}
            isHost={isSurprise}
            isOwner={isOwner}
            messageCount={funding.messageCount}
            onClose={closePopup}
            // 팝업은 닫지 않는다 — 나중에 showModal된 다이얼로그가 top layer에서 위에 쌓인다
            onUnconfirmedClick={confirmsDeposits ? () => setIsDepositOpen(true) : noop}
            onEditClick={() => {
              closePopup();
              setIsEditOpen(true);
            }}
            onMessageClick={() => {
              closePopup();
              startMessage();
            }}
            onContributeClick={() => {
              closePopup();
              startContribute();
            }}
          />
        )}
        {/* 처리 뒤 관리 상세가 다시 조회돼 owner의 확인 대기 건수·알림 점이 함께 갱신된다 */}
        <DepositConfirmSheet
          open={isDepositOpen}
          fundingId={Number(fundingId)}
          onClose={() => setIsDepositOpen(false)}
        />
        {confirmsDeposits && (
          <FundingMoreFlow
            open={isMoreOpen}
            fundingId={Number(fundingId)}
            extended={funding.extended}
            actions={funding.actions}
            shareCard={{
              cardTitle: `${funding.title} 펀딩`,
              wish: {
                id: 0,
                productName: funding.productName,
                productImageUrl: funding.productImageUrl,
                price: funding.targetAmount,
              },
              info: { targetAmount: String(funding.targetAmount), deadline: funding.deadline },
              progress: funding.progress,
            }}
            onClose={() => setIsMoreOpen(false)}
          />
        )}
        <BotemEditFlow
          open={isEditOpen}
          recipientName={funding.hostName}
          skipIdentity={hasConfirmedMyBotem}
          isLoggedIn={isMember}
          memberName={memberName}
          onClose={() => setIsEditOpen(false)}
        />
        {/* 앞 단계 시트는 열어 둔 채 위에 다음 시트를 띄워(금액 → 편지 → 비밀번호), 이전을 누르면 직전 시트로 돌아온다 */}
        <FundingContributeSheet
          key={`contribute-${flowKey}`}
          open={isContributeOpen}
          hostName={funding.hostName}
          maxAmount={remainingAmount}
          onClose={() => setIsContributeOpen(false)}
          onExit={requestExit}
          onNext={amount => {
            setAmount(amount);
            setIsLetterOpen(true);
          }}
        />
        {/* TODO: 쿠키가 httpOnly라 로그인 여부를 클라이언트에서 못 읽어, 공유 화면에서 로그인해 돌아온 경우(memberIntent)만 회원으로 본다 */}
        <LetterWriteSheet
          key={`letter-${flowKey}`}
          open={isLetterOpen}
          recipientName={funding.hostName}
          isLoggedIn={isMember}
          memberName={memberName}
          onClose={() => setIsLetterOpen(false)}
          onExit={requestExit}
          isNextPending={createMessage.isPending}
          onNext={values => {
            setLetter(values);
            // 회원은 비밀번호를 정하지 않으므로 바로 송금 안내(메시지 보태기는 바로 완료)로 간다
            if (!isMember) setIsPasswordOpen(true);
            else if (isMessageOnly) submitMessage();
            else setIsMemberGuideOpen(true);
          }}
        />
        <FundingTransferGuideSheet
          open={isMemberGuideOpen}
          hostName={funding.hostName}
          amount={contributeAmount}
          account={funding.account}
          onClose={() => setIsMemberGuideOpen(false)}
          onComplete={() => goToComplete()}
        />
        {/* TODO(API): 금액 보태기 제출 API는 아직 연결 전이다(메시지 보태기만 연결됨). replace라 뒤로가기로 보태기 플로우에 돌아오지 않는다 */}
        <FundingPasswordSheet
          open={isPasswordOpen}
          hostName={funding.hostName}
          amount={contributeAmount}
          account={funding.account}
          messageOnly={isMessageOnly}
          isPending={createMessage.isPending}
          onClose={requestExit}
          onPrev={() => setIsPasswordOpen(false)}
          onComplete={password => {
            setPassword(password);
            if (isMessageOnly) submitMessage(password);
            else goToComplete(password);
          }}
        />
        <Dialog
          kind="confirm"
          open={isExitOpen}
          title={`${funding.hostName}에게\n보태기를 그만둘까요?`}
          confirmColor="neutral"
          onCancel={() => setIsExitOpen(false)}
          onConfirm={handleExitConfirm}
        />
        {/* BottomCTA(여백 20 + 버튼 56) 바로 위 중앙. 홈 인디케이터 영역만큼 함께 올린다 */}
        <div
          className={cn(
            "pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-20 mx-auto flex w-full justify-center",
            APP_MAX_WIDTH_CLASS,
          )}>
          <ToastMessage
            show={toast !== null}
            state={toast === "success"}
            text={toast === "fail" ? "링크를 복사하지 못했어요" : "링크를 복사했어요"}
          />
        </div>
      </main>
    </PageExitMotion>
  );
}
