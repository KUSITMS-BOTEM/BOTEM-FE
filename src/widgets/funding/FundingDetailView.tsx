"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import Header from "@/components/Header";
import PageExitMotion from "@/components/effects/PageExitMotion";
import ProfileBox from "@/components/ProfileBox";
import Tooltip from "@/components/Tooltip";
import { usePageExit } from "@/hooks/usePageExit";
import { useFundingContributionStore } from "@/store/fundingContributionStore";
import { useGuestBotemStore } from "@/store/guestBotemStore";
import { cn } from "@/utils/cn";
import type { DepositItem } from "@/utils/funding/depositConfirm";
import { getClosedLabel } from "@/utils/funding/fundingProgress";
import BotemEditFlow from "@/widgets/funding/BotemEditFlow";
import BotemEditSheet from "@/widgets/funding/BotemEditSheet";
import BotemPopup from "@/widgets/funding/BotemPopup";
import DepositConfirmSheet from "@/widgets/funding/DepositConfirmSheet";
import FundingContributeSheet from "@/widgets/funding/FundingContributeSheet";
import FundingGiftProofView from "@/widgets/funding/FundingGiftProofView";
import FundingMessage from "@/widgets/funding/FundingMessage";
import FundingPasswordSheet from "@/widgets/funding/FundingPasswordSheet";
import FundingProgressCard from "@/widgets/funding/FundingProgressCard";
import type { FundingTransferAccount } from "@/widgets/funding/FundingTransferGuideSheet";
import LetterWriteSheet from "@/widgets/letter-paper/LetterWriteSheet";
import SampleProduct from "@/assets/images/samples/sample-product.png";
import IconShare from "@/assets/icons/icon-share.svg?react";
import IconLeft from "@/assets/icons/icon-left.svg?react";
import IconLock from "@/assets/icons/icon-lock.svg?react";
import IconDotVertical from "@/assets/icons/icon-dotvertical.svg?react";
import ProfilePink from "@/assets/icons/multicolor/profile-pink.svg?react";

type FundingDetailViewProps = {
  fundingId: string;
  // guest: 비회원 공유 링크 / surprise: 친구 몰래 연 개설자 화면 / owner: 내 펀딩을 연 주인 화면
  variant?: "guest" | "surprise" | "owner";
  // 있으면 헤더 왼쪽에 뒤로가기 버튼을 보여준다
  onBack?: () => void;
};

// TODO(API): 비회원 펀딩 공개 조회 API가 나오면 fundingId로 받아온 값으로 교체한다
const MOCK_FUNDING = {
  hostName: "지유",
  title: "지유의 생일",
  story: "올해 생일엔 출퇴근길에 쓸 노캔 헤드폰이 갖고 싶어요. 조금씩 보태주면 감동할게요!",
  pledge: "펀딩이 성공하면 헤드폰 끼고 출근하는 인증샷을 꼭 올릴게요!",
  productName: "소니 WH-1000XM5",
  productImageUrl: SampleProduct.src,
  deadline: "2026-12-31",
  // TODO(API): 개설자가 선물 인증 사진을 올렸는지 서버 값으로 교체한다 (true면 마감 후 인증 화면)
  hasGiftProof: false,
  currentAmount: 74074074,
  targetAmount: 123456789,
  participants: ["orange", "blue", "pink"] as const,
  extraParticipantCount: 99,
  // TODO(API): 개설자의 확인 대기 입금 목록 API가 나오면 교체한다 (건수도 이 목록 길이로 맞춘다)
  deposits: [
    { id: 1, senderName: "하린이", amount: 45000, depositedAt: "2026-11-18T11:20:00" },
    { id: 2, senderName: "도윤이", amount: 30000, depositedAt: "2026-11-16T09:05:00" },
    { id: 3, senderName: "서준이", amount: 10000, depositedAt: "2026-11-16T08:00:00" },
  ] satisfies DepositItem[],
  // TODO(API): 펀딩 주인이 받은 메세지 수·친구별 감사카드 발송 여부를 서버 값으로 교체한다
  messageCount: 8,
  friends: [
    { id: 1, name: "민수", contributedAt: "2026-11-10T09:00:00", thankCardSent: false },
    { id: 2, name: "서연", contributedAt: "2026-11-12T18:30:00", thankCardSent: true },
  ],
  account: {
    bank: "TOSS_BANK",
    accountHolder: "김지유",
    accountNumber: "1000-1234-5678",
  } satisfies FundingTransferAccount,
};

// TODO: 공유·더보기 동작은 디자인이 정해지면 연결한다
const noop = () => {};

export default function FundingDetailView({
  fundingId,
  variant = "guest",
  onBack,
}: FundingDetailViewProps) {
  const router = useRouter();
  const { pageExit, exitPage } = usePageExit();
  const funding = MOCK_FUNDING;
  const unconfirmedCount = funding.deposits.length;
  const isSurprise = variant === "surprise";
  const isOwner = variant === "owner";
  const isGuest = variant === "guest";
  // 하단 CTA 버튼을 누르면 회원/비회원 구분 Dialog를 띄운다. 값은 어느 버튼에서 왔는지
  // TODO: Dialog '예'(로그인) 이후와 '보태러가기'의 '아니오'(비회원)는 후속 작업에서 이 값으로 분기한다
  const [memberCheckFrom, setMemberCheckFrom] = useState<"myBotem" | "contribute" | null>(null);
  const [isGuestFindOpen, setIsGuestFindOpen] = useState(false);
  // 비회원이 이름·비밀번호로 내 보탬을 확인하고 나면 하단은 '내 보탬 확인' 버튼만 남는다
  const hasGuestIdentity = useGuestBotemStore(state => state.name !== null);
  // 받은 입금을 확인해야 하는 쪽(서프라이즈 개설자·펀딩 주인)
  const confirmsDeposits = isSurprise || isOwner;
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const contributeAmount = useFundingContributionStore(state => state.amount);
  const { setAmount, setLetter, setPassword, reset } = useFundingContributionStore.getState();
  const [isExitOpen, setIsExitOpen] = useState(false);
  // 메시지 보태기는 금액·송금 없이 편지 → 비밀번호만 거친다
  const [isMessageOnly, setIsMessageOnly] = useState(false);
  // 올리면 금액·편지 시트가 새로 마운트되어 입력값이 모두 초기화된다
  const [flowKey, setFlowKey] = useState(0);
  const closePopup = () => setIsPopupOpen(false);
  const requestExit = () => setIsExitOpen(true);

  // 보태기 플로우에서 입력한 값을 모두 버리고 열려 있는 시트를 닫는다
  const handleExitConfirm = () => {
    setIsExitOpen(false);
    setIsContributeOpen(false);
    setIsLetterOpen(false);
    setIsPasswordOpen(false);
    reset();
    setFlowKey(key => key + 1);
  };
  const remainingAmount = funding.targetAmount - funding.currentAmount;
  // 금액 달성(마감)·기간 마감 모두 닫힌 펀딩이다
  const closedLabel = getClosedLabel(funding);
  const isClosed = closedLabel !== null;

  if (isClosed && funding.hasGiftProof) {
    return (
      <FundingGiftProofView
        contributorCount={funding.friends.length}
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
            // TODO: 공유 버튼 클릭 시 동작 구현 필요 (예: 카카오톡/링크 공유)
            { icon: <IconShare />, ariaLabel: "공유", onClick: noop },
            // TODO: 더보기 버튼 클릭 시 동작 구현 필요 (예: 메뉴/바텀시트 노출)
            { icon: <IconDotVertical />, ariaLabel: "더보기", onClick: noop },
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
          <FundingProgressCard
            fundingId={fundingId}
            productImageUrl={funding.productImageUrl}
            productName={funding.productName}
            deadline={funding.deadline}
            currentAmount={funding.currentAmount}
            targetAmount={funding.targetAmount}
            locked={isSurprise}
          />
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
                profiles={funding.participants.map(color => ({ color }))}
                extraCount={funding.extraParticipantCount}
                notification={confirmsDeposits && unconfirmedCount > 0}
                className="bg-semantic-fill-default shadow-[0_4px_8px_0_var(--color-semantic-shadow-weak)]"
              />
            </button>
          )}
        </div>
        {isGuest && (
          <BottomCTA>
            {hasGuestIdentity ? (
              <Button size="xlarge" variant="fill" onClick={() => setIsPopupOpen(true)}>
                내 보탬 확인
              </Button>
            ) : (
              <>
                <Button size="xlarge" variant="weak" onClick={() => setMemberCheckFrom("myBotem")}>
                  내 보탬 확인
                </Button>
                <Button
                  size="xlarge"
                  variant="fill"
                  onClick={() => setMemberCheckFrom("contribute")}>
                  보태러가기
                </Button>
              </>
            )}
          </BottomCTA>
        )}
        {/* TODO(API): 이름·비밀번호로 일치하는 보탬을 조회하는 API가 나오면 여기서 검증하고, 없으면 안내 후 시트를 닫지 않는다. 지금은 입력만 하면 통과한다 */}
        <BotemEditSheet
          open={isGuestFindOpen}
          onClose={() => setIsGuestFindOpen(false)}
          onSubmit={(name, password) => {
            useGuestBotemStore.getState().setIdentity(name, password);
            setIsGuestFindOpen(false);
            setIsPopupOpen(true);
          }}
        />
        <Dialog
          kind="confirm"
          open={memberCheckFrom !== null}
          title="이미 보탬 회원이신가요?"
          description="비회원이여도 보태러갈 수 있어요"
          confirmColor="neutral"
          onCancel={() => {
            if (memberCheckFrom === "myBotem") setIsGuestFindOpen(true);
            setMemberCheckFrom(null);
          }}
          onConfirm={() => setMemberCheckFrom(null)}
        />
        {/* TODO: 팝업 내부 동작(미확인·수정·메세지·보태기)은 보탬 폼 디자인이 정해지면 연결한다 */}
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
            reset();
            setIsMessageOnly(true);
            setIsLetterOpen(true);
          }}
          onContributeClick={() => {
            closePopup();
            // 뒤로가기 등으로 플로우를 중간에 떠나 남은 값이 있으면 비우고 시작한다
            reset();
            setIsMessageOnly(false);
            setIsContributeOpen(true);
          }}
        />
        {/* TODO(API): 실제 API 연결 시 입금 처리 결과를 서버에 반영하고, 팝업의 확인 대기 건수(unconfirmedCount)와 프로필 알림 점도 그 값으로 갱신한다. 지금은 funding.deposits.length로 고정이라 처리 후에도 줄지 않는다 */}
        <DepositConfirmSheet
          open={isDepositOpen}
          deposits={funding.deposits}
          onClose={() => setIsDepositOpen(false)}
        />
        <BotemEditFlow
          open={isEditOpen}
          recipientName={funding.hostName}
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
        {/* TODO: 쿠키가 httpOnly라 로그인 여부를 클라이언트에서 못 읽어 비회원(false)으로 둔다 */}
        <LetterWriteSheet
          key={`letter-${flowKey}`}
          open={isLetterOpen}
          recipientName={funding.hostName}
          isLoggedIn={false}
          onClose={() => setIsLetterOpen(false)}
          onExit={requestExit}
          onNext={values => {
            setLetter(values);
            setIsPasswordOpen(true);
          }}
        />
        {/* TODO(API): 보탬 제출 API가 정해지면 여기서 스토어의 amount·letter·password를 보내고, 성공 뒤에 이동하도록 바꾼다. replace라 뒤로가기로 보태기 플로우에 돌아오지 않는다 */}
        <FundingPasswordSheet
          open={isPasswordOpen}
          hostName={funding.hostName}
          amount={contributeAmount}
          account={funding.account}
          messageOnly={isMessageOnly}
          onClose={requestExit}
          onPrev={() => setIsPasswordOpen(false)}
          onComplete={password => {
            setPassword(password);
            router.replace(`/share/${fundingId}/complete`);
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
      </main>
    </PageExitMotion>
  );
}
