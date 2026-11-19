"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Dialog from "@/components/Dialog";
import OpenSheet from "@/components/OpenSheet";
import { useCreateFundingMutation } from "@/hooks/mutations/funding/useCreateFundingMutation";
import type { FundingWish } from "@/types/funding/funding";
import { cn } from "@/utils/cn";
import { toCreateFundingRequest } from "@/utils/funding/toCreateFundingRequest";
import FundingAccountStep, {
  type FundingAccountValues,
} from "@/widgets/funding/FundingAccountStep";
import FundingConfirmSheet from "@/widgets/funding/FundingConfirmSheet";
import FundingInfoStep, { type FundingInfoValues } from "@/widgets/funding/FundingInfoStep";
import FundingOpenCompleteSheet, {
  MOCK_FUNDING_ID,
} from "@/widgets/funding/FundingOpenCompleteSheet";
import FundingWishSelectStep from "@/widgets/funding/FundingWishSelectStep";

type FundingOpenSheetProps = {
  open: boolean;
  onClose: () => void;
  // 있으면 위시 선택 단계를 건너뛰고 이 상품으로 펀딩 정보부터 시작한다 (친구 위시 서프라이즈)
  initialWish?: FundingWish;
  // 서프라이즈 대상 친구 이름. 있으면 펀딩 열기를 확정한 뒤 개설 완료 화면을 보여준다
  recipientName?: string;
  // 서프라이즈 대상 친구 id. 개설 완료 뒤 이동하는 펀딩 상세에서 뒤로가기 대상이 된다
  recipientId?: string;
  className?: string;
};

type Step = "info" | "account";

const STEP_TITLE: Record<Step, string> = { info: "펀딩 정보", account: "계좌 정보" };

export default function FundingOpenSheet({
  open,
  onClose,
  initialWish,
  recipientName,
  recipientId,
  className,
}: FundingOpenSheetProps) {
  const router = useRouter();
  const { mutateAsync: createFunding, isPending } = useCreateFundingMutation();
  const [selectedWish, setSelectedWish] = useState<FundingWish | null>(initialWish ?? null);
  const [step, setStep] = useState<Step>("info");
  // 계좌 단계는 처음 진입할 때 마운트해 대표 계좌 조회와 등장 모션이 그때 시작되게 한다
  const [accountVisited, setAccountVisited] = useState(false);
  // 각 단계에서 확정(다음·펀딩 열기)한 값. 확인 시트에 보여주고 수정 시트의 초기값이 된다
  const [info, setInfo] = useState<FundingInfoValues | null>(null);
  const [account, setAccount] = useState<FundingAccountValues | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  // 확인 시트를 연 채로 그 위에 띄우는 수정 시트
  const [editing, setEditing] = useState<Step | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  // isPending은 비동기로 갱신돼 더블클릭을 못 막으므로 클릭 즉시 잠그는 1차 방어를 따로 둔다
  const [submitting, setSubmitting] = useState(false);
  // 확인 시트에서 수정한 값. 입력 단계(info·account)에는 반영하지 않고, 펀딩 열기 요청에만 쓰며 시트를 닫으면 버린다
  const [draftInfo, setDraftInfo] = useState<FundingInfoValues | null>(null);
  const [draftAccount, setDraftAccount] = useState<FundingAccountValues | null>(null);
  const confirmInfo = draftInfo ?? info;
  const confirmAccount = draftAccount ?? account;

  // 시트를 닫으면 다음에 열 때 위시 선택(initialWish가 있으면 펀딩 정보)부터 다시 시작한다
  const handleClose = () => {
    setSelectedWish(initialWish ?? null);
    setStep("info");
    setAccountVisited(false);
    setInfo(null);
    setAccount(null);
    setConfirmOpen(false);
    setCompleteOpen(false);
    setEditing(null);
    setDraftInfo(null);
    setDraftAccount(null);
    // 시트가 항상 마운트돼 있어, 성공 뒤에 풀지 않으면 다시 열었을 때 버튼이 잠긴 채 남는다
    setSubmitting(false);
    onClose();
  };

  const handleConfirmClose = () => {
    // 요청 중에 닫으면 취소한 줄 아는 사용자가 성공 뒤 갑자기 이동하게 된다
    if (submitting) return;
    setConfirmOpen(false);
    setDraftInfo(null);
    setDraftAccount(null);
  };

  // 입력 단계(위시를 골랐거나 initialWish로 시작)에서는 입력한 정보가 사라지므로 확인을 받고, 위시 선택 단계에서는 바로 닫는다
  const handleRequestClose = () => (selectedWish ? setLeaveOpen(true) : handleClose());

  // 시트를 닫지 않고 이동만 한다. 이동이 끝나 이 화면이 언마운트될 때 함께 사라져 뒤 화면이 비치지 않는다
  const handleCompleteClose = () => {
    const query = recipientId ? `?friendId=${encodeURIComponent(recipientId)}` : "";
    // TODO(API): 서프라이즈 펀딩 생성 API(POST /api/fundings/surprise) 응답의 fundingId로 교체한다 (지금은 목 ID라 모든 펀딩이 같은 링크로 간다)
    router.push(`/funding/${MOCK_FUNDING_ID}${query}`);
  };

  const handleLeave = () => {
    setLeaveOpen(false);
    handleClose();
  };

  const handleInfoNext = (values: FundingInfoValues) => {
    setInfo(values);
    setAccountVisited(true);
    setStep("account");
  };

  const handleConfirm = async () => {
    if (!selectedWish || !confirmInfo || !confirmAccount) return;
    // TODO(API): 서프라이즈 펀딩 생성 API가 정해지면 서프라이즈도 요청 성공 뒤에 완료 화면을 연다
    if (recipientName) return setCompleteOpen(true);
    setSubmitting(true);
    try {
      await createFunding(toCreateFundingRequest(selectedWish.id, confirmInfo, confirmAccount));
    } catch {
      // 에러 안내는 전역 MutationCache onError가 처리하므로 여기서는 재시도할 수 있게 잠금만 푼다
      setSubmitting(false);
      return;
    }
    // TODO(디자인): 일반 펀딩 개설 완료 화면 Figma가 나오면 FundingOpenCompleteSheet로 교체한다 (docs/todos/funding_open_complete_screen.md)
    router.push("/home");
    // 이동만으로는 이 화면이 언마운트되지 않아 시트가 /home 위에 남으므로 직접 닫는다
    handleClose();
  };

  const handleAccountSubmit = (values: FundingAccountValues) => {
    setAccount(values);
    setConfirmOpen(true);
  };

  return (
    <>
      <OpenSheet
        open={open}
        title={selectedWish ? STEP_TITLE[step] : "펀딩 열기"}
        onClose={handleRequestClose}
        className={className}>
        {selectedWish ? (
          // 이전으로 돌아왔을 때 입력값·단계가 남도록 언마운트하지 않고 숨기기만 한다
          <>
            <div className={cn("w-full", step !== "info" && "hidden")}>
              <FundingInfoStep
                wish={selectedWish}
                defaultValues={info ?? undefined}
                onNext={handleInfoNext}
              />
            </div>
            {accountVisited && (
              <div className={cn("w-full", step !== "account" && "hidden")}>
                <FundingAccountStep
                  defaultValues={account ?? undefined}
                  onSubmit={handleAccountSubmit}
                  onPrev={() => setStep("info")}
                />
              </div>
            )}
          </>
        ) : (
          <FundingWishSelectStep onSelect={setSelectedWish} />
        )}
      </OpenSheet>
      <Dialog
        kind="confirm"
        open={leaveOpen}
        title="펀딩 만들기를 그만둘까요?"
        description="지금까지 입력한 내용은 저장되지 않아요."
        cancelLabel="계속 만들기"
        confirmLabel="그만두기"
        confirmColor="neutral"
        onCancel={() => setLeaveOpen(false)}
        onConfirm={handleLeave}
      />
      {selectedWish && confirmInfo && confirmAccount && (
        <>
          <FundingConfirmSheet
            open={confirmOpen}
            wish={selectedWish}
            info={confirmInfo}
            account={confirmAccount}
            onClose={handleConfirmClose}
            submitting={submitting || isPending}
            onConfirm={handleConfirm}
            onEditInfo={() => setEditing("info")}
            onEditAccount={() => setEditing("account")}
          />
          <OpenSheet
            open={editing !== null}
            title={STEP_TITLE[editing ?? "info"]}
            onClose={() => setEditing(null)}
            className={className}>
            {editing === "info" && (
              <FundingInfoStep
                wish={selectedWish}
                initialValues={confirmInfo}
                submitLabel="수정 완료"
                onNext={values => {
                  setDraftInfo(values);
                  setEditing(null);
                }}
              />
            )}
            {editing === "account" && (
              <FundingAccountStep
                initialValues={confirmAccount}
                submitLabel="수정 완료"
                onSubmit={values => {
                  setDraftAccount(values);
                  setEditing(null);
                }}
              />
            )}
          </OpenSheet>
          {recipientName && (
            <FundingOpenCompleteSheet
              open={completeOpen}
              variant="surprise"
              recipientName={recipientName}
              wish={selectedWish}
              info={confirmInfo}
              onClose={handleCompleteClose}
              className={className}
            />
          )}
        </>
      )}
    </>
  );
}
