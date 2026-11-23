"use client";

import { useEffect, useState } from "react";

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
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { useGuestBotemStore } from "@/store/guestBotemStore";
import { handleKakaoLoginClick } from "@/utils/auth/handleKakaoLoginClick";
import { getShareReturnPath, type ShareMemberIntent } from "@/utils/funding/shareMemberIntent";
import { cn } from "@/utils/cn";
import type { FundingDetailResponse } from "@/types/funding/fundingDetail";
import type { OwnerFundingDetailResponse } from "@/types/funding/ownerFundingDetail";
import { getClosedLabel } from "@/utils/funding/fundingProgress";
import { formatSurpriseTitle, toOwnerFundingView } from "@/utils/funding/toOwnerFundingView";
import BotemEditFlow from "@/widgets/funding/BotemEditFlow";
import BotemEditSheet from "@/widgets/funding/BotemEditSheet";
import BotemPopup, { type BotemPopupFriend } from "@/widgets/funding/BotemPopup";
import { useContributionFlow } from "@/widgets/funding/useContributionFlow";
import { useMyBotem } from "@/widgets/funding/useMyBotem";
import MyBotemSheet from "@/widgets/funding/MyBotemSheet";
import DepositConfirmSheet from "@/widgets/funding/DepositConfirmSheet";
import FundingContributeSheet from "@/widgets/funding/FundingContributeSheet";
import FundingGiftProofView from "@/widgets/funding/FundingGiftProofView";
import FundingMessage from "@/widgets/funding/FundingMessage";
import FundingMoreFlow from "@/widgets/funding/FundingMoreFlow";
import FundingPasswordSheet from "@/widgets/funding/FundingPasswordSheet";
import FundingProgressCard from "@/widgets/funding/FundingProgressCard";
import FundingTransferGuideSheet from "@/widgets/funding/FundingTransferGuideSheet";
import ThankCardSheet from "@/widgets/funding/ThankCardSheet";
import LetterWriteSheet from "@/widgets/letter-paper/LetterWriteSheet";
import RollingPaperContainer from "@/widgets/rolling-paper/RollingPaperContainer";
import IconShare from "@/assets/icons/icon-share.svg?react";
import IconDotVertical from "@/assets/icons/icon-dotvertical.svg?react";
import IconLeft from "@/assets/icons/icon-left.svg?react";
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
  // 마감된 내 생일 펀딩의 '롤링페이퍼 보기'를 누를 수 있는지 (롤링페이퍼 공개 여부)
  rollingPaperOpened?: boolean;
  // 공개 여부를 아직 모르는 동안은 안내 문구 대신 기본 버튼 문구를 보여준다
  rollingPaperLoading?: boolean;
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
  // 보태기 버튼은 참여자 화면(guest)에만 있고, 그쪽은 공유용 상세 응답 값이 덮어쓴다
  canContributeAmount: true,
  canParticipate: true,
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
    },
  ],
};

// 공유용 상세 응답에는 금액이 없고 달성률만 있어, 화면이 쓰는 모양으로 옮겨 담는다
const toShareFundingView = (detail: FundingDetailResponse) => ({
  hostName: detail.celebrantName,
  title:
    detail.title ??
    (detail.type === "SURPRISE"
      ? formatSurpriseTitle(detail.celebrantName)
      : `${detail.celebrantName}의 펀딩`),
  story: detail.story ?? undefined,
  pledge: detail.promise ?? undefined,
  // 목표 달성·조기 마감이면 금액 보태기가 닫힌다. 조기 마감은 달성률·마감일로 알 수 없어 서버 값을 쓴다
  closed: !detail.canContributeAmount,
  canContributeAmount: detail.canContributeAmount,
  canParticipate: detail.canParticipate,
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
  rollingPaperOpened = false,
  rollingPaperLoading = false,
  ...source
}: FundingDetailViewProps) {
  const { pageExit, exitPage } = usePageExit();
  const { toast, copyLink } = useShareLink();
  const { profiles, ...view } = source.ownerDetail
    ? toHostFundingView(source.ownerDetail)
    : toShareFundingView(source.detail);
  const funding = { ...MOCK_FUNDING, ...view };
  // 참여자용 API와 공유 링크는 shareKey로, 개설자용 API는 fundingId로 호출한다
  const { shareKey } = source.ownerDetail ?? source.detail;
  const unconfirmedCount = funding.pendingContributionCount;
  const isSurprise = variant === "surprise";
  const isOwner = variant === "owner";
  const isGuest = variant === "guest";
  const showRollingPaperCta = isOwner && funding.closed;
  // 하단 CTA 버튼을 누르면 회원/비회원 구분 Dialog를 띄운다. 값은 어느 버튼에서 왔는지
  // 어느 버튼에서 왔는지에 따라 '예'(로그인 후 복귀 경로)·'아니오'(비회원 플로우)가 갈린다
  const [memberCheckFrom, setMemberCheckFrom] = useState<ShareMemberIntent | null>(null);
  const { mutate: requestKakaoLogin } = useKakaoLoginUriMutation();
  const [isGuestFindOpen, setIsGuestFindOpen] = useState(false);
  // 서프라이즈 개설자 화면은 로그인한 개설자만 열 수 있다
  const isMember = memberIntent !== undefined || isLoggedIn || isSurprise;
  // 비회원이 '보태러가기'에서 확인을 마치거나 회원이 보태러가기로 돌아오면 하단이 '메시지 보태기'/'보태기'로 바뀐다
  const [isContributeReady, setIsContributeReady] = useState(memberIntent === "contribute");
  const {
    accessGuest,
    guestFindError,
    myContributions,
    memberHasNoBotem,
    isCheckingMember,
    isCheckingMyBotem,
    hasConfirmedMyBotem,
    myUnconfirmedCount,
    myBotemFriends,
    showNoBotemNotice,
    closeNoBotemNotice,
  } = useMyBotem({
    shareKey,
    isGuest,
    isMember,
    memberIntent,
    participants: source.detail?.participants ?? [],
  });
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
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isRollingPaperOpen, setIsRollingPaperOpen] = useState(false);
  const [thankCardFriend, setThankCardFriend] = useState<BotemPopupFriend | null>(null);
  const closePopup = () => setIsPopupOpen(false);
  const {
    isMemberGuideOpen,
    setIsMemberGuideOpen,
    isContributeOpen,
    setIsContributeOpen,
    isLetterOpen,
    setIsLetterOpen,
    isPasswordOpen,
    setIsPasswordOpen,
    isExitOpen,
    isMessageOnly,
    setIsExitOpen,
    flowKey,
    contributeAmount,
    setAmount,
    setLetter,
    setPassword,
    isSubmitting,
    markTransferSent,
    submitted,
    requestKeyRef,
    requestExit,
    startMessage,
    startContribute,
    submitContribution,
    completeTransfer,
    handleExitConfirm,
  } = useContributionFlow({ shareKey, isMember });
  // 서버가 남은 금액을 주지 않아 목표 금액에서 확정·확인 대기 달성률을 뺀 값으로 근사한다 (서버가 최종 검증)
  const remainingAmount = Math.max(
    0,
    Math.round((funding.targetAmount * (100 - funding.progress - funding.pendingPercentage)) / 100),
  );
  // 금액 달성(마감)·기간 마감·서버가 알려준 조기 마감 모두 닫힌 펀딩이다
  const closedLabel = getClosedLabel({ percent: funding.progress, deadline: funding.deadline });
  const isClosed = funding.closed || closedLabel !== null;
  // 메시지 보태기까지 닫히면(마감 후) 보태기 버튼을 모두 숨긴다. 이전에 보탠 사람의 '내 보탬 확인'은 남긴다
  const isContributeMode = !hasConfirmedMyBotem && (isContributeReady || memberHasNoBotem);
  const showBottomCta =
    isGuest && !isCheckingMember && (!isContributeMode || funding.canParticipate);

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
              onClick: () => copyLink(`${window.location.origin}/share/${shareKey}`),
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
            <div className="flex items-start gap-2.5 py-1">
              <ProfilePink aria-hidden className="size-6 shrink-0" />
              <h1 className="text-semantic-text-strong min-w-0 [letter-spacing:var(--letter-spacing-default)] whitespace-pre-line [font:var(--semantic-title-a2-z-large)]">
                {funding.title}
              </h1>
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
          {/* 마감된 내 펀딩도 확인 대기 입금이 남아 있으면 입금 확인 진입점(프로필 버튼)을 유지한다 */}
          {!isGuest && (!showRollingPaperCta || unconfirmedCount > 0) && (
            <button
              type="button"
              onClick={() => setIsPopupOpen(true)}
              className="flex cursor-pointer items-center gap-2 self-end">
              {/* Figma FUND-PG-008: 펀딩 주인 화면은 툴팁 없이 프로필 묶음만 보여준다 */}
              {!isOwner && funding.canParticipate && (
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
        {showRollingPaperCta && (
          <BottomCTA>
            <Button
              size="xlarge"
              variant="fill"
              disabled={!rollingPaperOpened}
              onClick={() => setIsRollingPaperOpen(true)}>
              {rollingPaperOpened || rollingPaperLoading
                ? "롤링페이퍼 보기"
                : "홈에서 펑! 터뜨려 주세요"}
            </Button>
          </BottomCTA>
        )}
        {showRollingPaperCta && (
          <RollingPaperContainer
            fundingId={Number(fundingId)}
            open={isRollingPaperOpen}
            showGiftCta={false}
            onClose={() => setIsRollingPaperOpen(false)}
          />
        )}
        {showBottomCta && (
          <BottomCTA>
            {hasConfirmedMyBotem ? (
              <Button size="xlarge" variant="fill" onClick={() => setIsPopupOpen(true)}>
                내 보탬 확인
              </Button>
            ) : isContributeMode ? (
              <>
                <Button size="xlarge" variant="weak" onClick={startMessage}>
                  메시지 보태기
                </Button>
                {funding.canContributeAmount && (
                  <Button size="xlarge" variant="fill" onClick={startContribute}>
                    보태기
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button size="xlarge" variant="weak" onClick={() => setMemberCheckFrom("myBotem")}>
                  내 보탬 확인
                </Button>
                {funding.canParticipate && (
                  <Button
                    size="xlarge"
                    variant="fill"
                    onClick={() => setMemberCheckFrom("contribute")}>
                    보태러 가기
                  </Button>
                )}
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
                  useGuestBotemStore.getState().setIdentity(shareKey, name, password);
                  setIsGuestFindOpen(false);
                  setIsPopupOpen(true);
                },
              },
            )
          }
        />
        {/* 확인 시트 밖(수정 진입)에서 본인 확인이 실패했을 때 안내한다 */}
        {!isGuestFindOpen && guestFindError && (
          <Dialog kind="alert" open title={guestFindError} onConfirm={accessGuest.reset} />
        )}
        <Dialog
          kind="alert"
          open={showNoBotemNotice}
          title="이 펀딩에 보탠 내역이 없어요"
          onConfirm={() => closeNoBotemNotice()}
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
                getShareReturnPath(shareKey, memberCheckFrom),
              );
            }
            setMemberCheckFrom(null);
          }}
        />
        {isGuest ? (
          <MyBotemSheet
            open={isPopupOpen && hasConfirmedMyBotem}
            unconfirmedCount={myUnconfirmedCount}
            friends={myBotemFriends}
            ownerName={funding.hostName}
            isClosed={isClosed}
            onClose={closePopup}
            onEditClick={() => {
              closePopup();
              if (isMember) {
                setIsEditOpen(true);
                return;
              }
              // 비회원은 수정 전에 이름·비밀번호로 내 보탬(과 접근 토큰)을 먼저 받아 온다
              const { name, password } = useGuestBotemStore.getState();
              accessGuest.mutate(
                { participantName: name ?? "", guestPassword: password ?? "" },
                { onSuccess: () => setIsEditOpen(true) },
              );
            }}
          />
        ) : (
          <BotemPopup
            open={isPopupOpen}
            hasMyBotem={hasConfirmedMyBotem}
            isCheckingMyBotem={isCheckingMyBotem}
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
            onThankCardClick={friend => {
              closePopup();
              setThankCardFriend(friend);
            }}
          />
        )}
        {/* 닫으면 언마운트돼 다음 친구에게는 빈 카드로 다시 시작한다. owner 친구의 id는 contributionId다 */}
        {isOwner && thankCardFriend && (
          <ThankCardSheet
            open
            fundingId={Number(fundingId)}
            contributionId={thankCardFriend.id}
            recipientName={thankCardFriend.name}
            onClose={() => setThankCardFriend(null)}
            onDepositUnconfirmed={() => {
              setThankCardFriend(null);
              setIsPopupOpen(true);
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
            shareKey={shareKey}
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
          shareKey={shareKey}
          contribution={
            (isMember ? myContributions.data?.contributions[0] : accessGuest.data) ?? undefined
          }
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
            if (amount !== useFundingContributionStore.getState().amount)
              requestKeyRef.current = crypto.randomUUID();
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
          isNextPending={isSubmitting}
          onNext={values => {
            setLetter(values);
            // 회원은 비밀번호를 정하지 않으므로 바로 제출한다
            if (!isMember) setIsPasswordOpen(true);
            else submitContribution();
          }}
        />
        {/* replace라 완료 뒤 뒤로가기로 보태기 플로우에 돌아오지 않는다 */}
        {submitted && (
          <FundingTransferGuideSheet
            open={isMemberGuideOpen}
            hostName={funding.hostName}
            amount={contributeAmount}
            account={submitted.account}
            onClose={() => setIsMemberGuideOpen(false)}
            isPending={markTransferSent.isPending}
            onComplete={completeTransfer}
          />
        )}
        <FundingPasswordSheet
          open={isPasswordOpen}
          hostName={funding.hostName}
          messageOnly={isMessageOnly}
          isPending={isSubmitting}
          onClose={requestExit}
          onPrev={() => setIsPasswordOpen(false)}
          onComplete={password => {
            setPassword(password);
            submitContribution(password);
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
