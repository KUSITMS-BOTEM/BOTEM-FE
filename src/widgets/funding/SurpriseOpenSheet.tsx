"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Dialog from "@/components/Dialog";
import OpenSheet from "@/components/OpenSheet";
import { useCreateSurpriseFundingMutation } from "@/hooks/mutations/funding/useCreateSurpriseFundingMutation";
import type { FundingWish } from "@/types/funding/funding";
import { cn } from "@/utils/cn";
import { toCreateSurpriseFundingRequest } from "@/utils/funding/toCreateSurpriseFundingRequest";
import { formatSurpriseTitle } from "@/utils/funding/toOwnerFundingView";
import FundingAccountStep, {
  type FundingAccountValues,
} from "@/widgets/funding/FundingAccountStep";
import FundingOpenCompleteSheet from "@/widgets/funding/FundingOpenCompleteSheet";
import FundingPreviewSheet from "@/widgets/funding/FundingPreviewSheet";
import SurpriseConfirmSheet from "@/widgets/funding/SurpriseConfirmSheet";
import SurpriseInfoStep, { type SurpriseInfoValues } from "@/widgets/funding/SurpriseInfoStep";
import SurpriseProfileExposureSheet from "@/widgets/funding/SurpriseProfileExposureSheet";

type SurpriseOpenSheetProps = {
  open: boolean;
  onClose: () => void;
  // 받는 사람(친구)의 위시. 위시를 고른 뒤에 열리므로 위시 선택 단계가 없다
  wish: FundingWish;
  recipientId: string;
  recipientName: string;
  recipientBirthday?: string | null;
  recipientBirthdayDday?: number | null;
  className?: string;
};

type Step = "info" | "account";

const STEP_TITLE: Record<Step, string> = { info: "펀딩 정보", account: "펀딩 계좌" };

export default function SurpriseOpenSheet({
  open,
  onClose,
  wish,
  recipientId,
  recipientName,
  recipientBirthday,
  recipientBirthdayDday,
  className,
}: SurpriseOpenSheetProps) {
  const router = useRouter();
  const { mutateAsync: createSurprise, isPending } = useCreateSurpriseFundingMutation();
  const [step, setStep] = useState<Step>("info");
  // 계좌 단계는 처음 진입할 때 마운트해 대표 계좌 조회와 등장 모션이 그때 시작되게 한다
  const [accountVisited, setAccountVisited] = useState(false);
  // 각 단계에서 확정한 값. 확인 시트에 보여주고 수정 시트의 초기값이 된다
  const [info, setInfo] = useState<SurpriseInfoValues | null>(null);
  const [account, setAccount] = useState<FundingAccountValues | null>(null);
  const [showOnProfile, setShowOnProfile] = useState<boolean | null>(null);
  // 펀딩 정보를 확정한 뒤 계좌 단계로 가기 전에 띄우는 프로필 노출 선택 시트
  const [exposureOpen, setExposureOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [createdFundingId, setCreatedFundingId] = useState<number | null>(null);
  const [createdShareKey, setCreatedShareKey] = useState<string | null>(null);
  // 확인 시트를 연 채로 그 위에 띄우는 수정 시트
  const [editing, setEditing] = useState<Step | null>(null);
  const [editingExposure, setEditingExposure] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  // isPending은 비동기로 갱신돼 더블클릭을 못 막으므로 클릭 즉시 잠그는 1차 방어를 따로 둔다
  const [submitting, setSubmitting] = useState(false);
  // 확인 시트에서 수정한 값. 입력 단계에는 반영하지 않고 개설 요청에만 쓰며 시트를 닫으면 버린다
  const [draftInfo, setDraftInfo] = useState<SurpriseInfoValues | null>(null);
  const [draftAccount, setDraftAccount] = useState<FundingAccountValues | null>(null);
  const [draftShowOnProfile, setDraftShowOnProfile] = useState<boolean | null>(null);
  const confirmInfo = draftInfo ?? info;
  const confirmAccount = draftAccount ?? account;
  const confirmShowOnProfile = draftShowOnProfile ?? showOnProfile;

  const handleClose = () => {
    setStep("info");
    setAccountVisited(false);
    setInfo(null);
    setAccount(null);
    setShowOnProfile(null);
    setExposureOpen(false);
    setConfirmOpen(false);
    setCompleteOpen(false);
    setPreviewOpen(false);
    setCreatedFundingId(null);
    setCreatedShareKey(null);
    setEditing(null);
    setEditingExposure(false);
    setDraftInfo(null);
    setDraftAccount(null);
    setDraftShowOnProfile(null);
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
    setDraftShowOnProfile(null);
  };

  const handleLeave = () => {
    setLeaveOpen(false);
    handleClose();
  };

  // 시트를 닫지 않고 이동만 한다. 이동이 끝나 이 화면이 언마운트될 때 함께 사라져 뒤 화면이 비치지 않는다
  const handleCompleteClose = () => {
    router.push(`/funding/${createdFundingId}?friendId=${encodeURIComponent(recipientId)}`);
  };

  const handleInfoNext = (values: SurpriseInfoValues) => {
    setInfo(values);
    setExposureOpen(true);
  };

  const handleExposureSelect = (value: boolean) => {
    setShowOnProfile(value);
    setExposureOpen(false);
    setAccountVisited(true);
    setStep("account");
  };

  const handleAccountSubmit = (values: FundingAccountValues) => {
    setAccount(values);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmInfo || !confirmAccount || confirmShowOnProfile === null) return;
    setSubmitting(true);
    try {
      const created = await createSurprise(
        toCreateSurpriseFundingRequest(
          recipientId,
          wish.id,
          confirmInfo,
          confirmAccount,
          confirmShowOnProfile,
        ),
      );
      setCreatedFundingId(created.fundingId);
      setCreatedShareKey(created.shareKey);
    } catch {
      // 에러 안내는 전역 MutationCache onError가 처리하므로 여기서는 재시도할 수 있게 잠금만 푼다
      setSubmitting(false);
      return;
    }
    setCompleteOpen(true);
  };

  const infoStepProps = {
    wish,
    recipientName,
    recipientBirthday,
    recipientBirthdayDday,
  };

  return (
    <>
      <OpenSheet
        open={open}
        title={STEP_TITLE[step]}
        onClose={() => setLeaveOpen(true)}
        className={className}>
        {/* 이전으로 돌아왔을 때 입력값·단계가 남도록 언마운트하지 않고 숨기기만 한다 */}
        <div className={cn("w-full", step !== "info" && "hidden")}>
          <SurpriseInfoStep
            {...infoStepProps}
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
      </OpenSheet>
      <SurpriseProfileExposureSheet
        open={exposureOpen}
        recipientName={recipientName}
        onSelect={handleExposureSelect}
        onClose={() => setExposureOpen(false)}
      />
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
      {confirmInfo && confirmAccount && confirmShowOnProfile !== null && (
        <>
          <SurpriseConfirmSheet
            open={confirmOpen}
            wish={wish}
            recipientName={recipientName}
            info={confirmInfo}
            account={confirmAccount}
            showOnRecipientProfile={confirmShowOnProfile}
            submitting={submitting || isPending}
            onClose={handleConfirmClose}
            onConfirm={handleConfirm}
            onPreview={() => setPreviewOpen(true)}
            onEditInfo={() => setEditing("info")}
            onEditExposure={() => setEditingExposure(true)}
            onEditAccount={() => setEditing("account")}
          />
          <OpenSheet
            open={editing !== null}
            title={STEP_TITLE[editing ?? "info"]}
            onClose={() => setEditing(null)}
            className={className}>
            {editing === "info" && (
              <SurpriseInfoStep
                {...infoStepProps}
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
          <SurpriseProfileExposureSheet
            open={editingExposure}
            recipientName={recipientName}
            onSelect={value => {
              setDraftShowOnProfile(value);
              setEditingExposure(false);
            }}
            onClose={() => setEditingExposure(false)}
          />
          <FundingPreviewSheet
            open={previewOpen}
            wish={wish}
            info={confirmInfo}
            title={formatSurpriseTitle(recipientName)}
            locked
            onClose={() => setPreviewOpen(false)}
            className={className}
          />
          {createdShareKey !== null && (
            <FundingOpenCompleteSheet
              open={completeOpen}
              variant="surprise"
              recipientName={recipientName}
              wish={wish}
              info={confirmInfo}
              shareKey={createdShareKey}
              onClose={handleCompleteClose}
              className={className}
            />
          )}
        </>
      )}
    </>
  );
}
