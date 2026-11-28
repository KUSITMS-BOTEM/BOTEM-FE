import { useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { useCreateContributionMutation } from "@/hooks/mutations/contribution/useCreateContributionMutation";
import { useCreateMessageContributionMutation } from "@/hooks/mutations/contribution/useCreateMessageContributionMutation";
import { useMarkTransferSentMutation } from "@/hooks/mutations/contribution/useMarkTransferSentMutation";
import { useFundingContributionStore } from "@/store/fundingContributionStore";
import { useGuestBotemStore } from "@/store/guestBotemStore";
import { ApiError } from "@/types/api";
import type { FundingTransferAccount } from "@/widgets/funding/FundingTransferGuideSheet";

// 보태기 플로우(금액 → 편지 → 비밀번호 → 송금 안내)의 시트 열림 상태와 제출·송금 확인 처리
export function useContributionFlow({
  shareKey,
  isMember,
}: {
  shareKey: string;
  isMember: boolean;
}) {
  const router = useRouter();
  const [isMemberGuideOpen, setIsMemberGuideOpen] = useState(false);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const contributeAmount = useFundingContributionStore(state => state.amount);
  const { setAmount, setLetter, setPassword, reset } = useFundingContributionStore.getState();
  const [isExitOpen, setIsExitOpen] = useState(false);
  // 금액 시트에서 다음을 눌러 확정 다이얼로그를 띄운 동안의 금액. null이면 다이얼로그가 닫혀 있다
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);
  // 메시지 보태기는 금액·송금 없이 편지 → 비밀번호만 거친다
  const [isMessageOnly, setIsMessageOnly] = useState(false);
  // 올리면 금액·편지 시트가 새로 마운트되어 입력값이 모두 초기화된다
  const [flowKey, setFlowKey] = useState(0);
  const createMessage = useCreateMessageContributionMutation(shareKey);
  const createContribution = useCreateContributionMutation(shareKey);
  const markTransferSent = useMarkTransferSentMutation(shareKey);
  const isSubmitting = createMessage.isPending || createContribution.isPending;
  // 금액 보태기를 저장한 응답. 송금 안내 시트의 계좌와 송금 확인 호출에 쓴다
  const [submitted, setSubmitted] = useState<{
    contributionId: number;
    account: FundingTransferAccount;
  } | null>(null);
  // 같은 플로우에서 실패 후 재시도하면 같은 키로 보내 서버가 중복 참여를 만들지 않게 한다. 금액이 바뀌면 새로 만든다
  const requestKeyRef = useRef("");
  // 제출·송금 확인 중에 종료하면 입력이 초기화돼 이후 요청이 빈 비밀번호·이름으로 이어지므로 막는다
  const requestExit = () => {
    if (!isSubmitting && !markTransferSent.isPending) setIsExitOpen(true);
  };
  // 보태기를 마치면 돌아왔을 때 하단이 '내 보탬 확인'이 되도록 이 펀딩의 본인 확인을 기록한다 (회원은 비밀번호가 없다)
  const goToComplete = (password = "") => {
    const name = useFundingContributionStore.getState().letter?.name ?? "";
    useGuestBotemStore.getState().setIdentity(shareKey, name, password);
    router.replace(`/share/${shareKey}/complete`);
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

  // 확정한 금액으로 편지 시트를 연다. 금액이 바뀌면 이전 시도와 다른 요청이므로 키를 새로 만든다
  const confirmAmount = () => {
    if (pendingAmount === null) return;
    if (pendingAmount !== useFundingContributionStore.getState().amount)
      requestKeyRef.current = crypto.randomUUID();
    setAmount(pendingAmount);
    setPendingAmount(null);
    setIsLetterOpen(true);
  };

  // 편지를 서버에 제출한다. 메시지 보태기는 바로 완료 화면으로, 금액 보태기는 응답 계좌로 송금 안내를 연다. 회원은 비밀번호 없이 보낸다
  const submitContribution = (password?: string) => {
    const { letter, amount } = useFundingContributionStore.getState();
    if (!letter) return;
    const variables = { letter, requestKey: requestKeyRef.current, guestPassword: password };
    // 이름이 겹치면 비밀번호 시트를 닫아 편지 시트에서 이름을 고치게 한다
    const onError = (error: Error) => {
      if (error instanceof ApiError && error.code === "FUNDING_032") setIsPasswordOpen(false);
    };
    if (isMessageOnly) {
      createMessage.mutate(variables, { onSuccess: () => goToComplete(password), onError });
      return;
    }
    createContribution.mutate(
      { ...variables, amount },
      {
        onSuccess: response => {
          // 계좌 없이는 송금 안내를 열 수 없다
          if (!response) return;
          const { contributionId, payoutAccount } = response;
          setSubmitted({
            contributionId,
            account: { ...payoutAccount, accountHolder: payoutAccount.accountHolder ?? "" },
          });
          setIsMemberGuideOpen(true);
        },
        onError,
      },
    );
  };

  // 송금했다고 서버에 알리고 성공하면 완료 화면으로 간다. 실패하면 reject해 시트가 다시 누를 수 있게 한다
  const completeTransfer = async () => {
    if (!submitted) return;
    const password = isMember ? undefined : useFundingContributionStore.getState().password;
    await markTransferSent.mutateAsync({
      contributionId: submitted.contributionId,
      guestPassword: password,
    });
    goToComplete(password);
  };

  // 보태기 플로우에서 입력한 값을 모두 버리고 열려 있는 시트를 닫는다
  const handleExitConfirm = () => {
    setIsExitOpen(false);
    setIsContributeOpen(false);
    setIsLetterOpen(false);
    setIsPasswordOpen(false);
    setIsMemberGuideOpen(false);
    setPendingAmount(null);
    reset();
    setFlowKey(key => key + 1);
  };

  return {
    isMemberGuideOpen,
    setIsMemberGuideOpen,
    isContributeOpen,
    setIsContributeOpen,
    isLetterOpen,
    setIsLetterOpen,
    isPasswordOpen,
    setIsPasswordOpen,
    isExitOpen,
    setIsExitOpen,
    isMessageOnly,
    flowKey,
    contributeAmount,
    isAmountConfirmOpen: pendingAmount !== null,
    requestAmountConfirm: setPendingAmount,
    cancelAmountConfirm: () => setPendingAmount(null),
    confirmAmount,
    setLetter,
    setPassword,
    isSubmitting,
    markTransferSent,
    submitted,
    requestExit,
    startMessage,
    startContribute,
    submitContribution,
    completeTransfer,
    handleExitConfirm,
  };
}
