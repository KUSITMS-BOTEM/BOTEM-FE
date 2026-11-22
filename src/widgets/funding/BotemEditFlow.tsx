"use client";

import { useState } from "react";

import Dialog from "@/components/Dialog";
import { useUpdateGuestContributionMutation } from "@/hooks/mutations/contribution/useUpdateGuestContributionMutation";
import { useUpdateMyContributionMutation } from "@/hooks/mutations/contribution/useUpdateMyContributionMutation";
import type {
  GuestContributionResponse,
  MyContributionResponse,
} from "@/types/contribution/contribution";
import { toLetterValues } from "@/utils/contribution/toLetterValues";
import { toMessageContributionRequest } from "@/utils/contribution/toMessageContributionRequest";
import BotemEditSheet from "@/widgets/funding/BotemEditSheet";
import LetterWriteSheet, { type LetterWriteValues } from "@/widgets/letter-paper/LetterWriteSheet";

// 내 보탬 수정 플로우: 이름·비밀번호 확인 시트 → 편지 수정 시트 → 수정 완료 안내 Dialog를 순서대로 연결한다
type BotemEditFlowProps = {
  open: boolean;
  recipientName: string;
  shareKey: string;
  // 수정할 내 보탬. 회원은 내 보탬 조회, 비회원은 본인 확인(guest/access) 응답이다. 없으면 편지 시트를 열 수 없다
  contribution?: MyContributionResponse | GuestContributionResponse;
  // 이미 이름·비밀번호를 입력했거나 로그인한 회원이면 확인 시트 없이 바로 편지 수정으로 간다
  skipIdentity?: boolean;
  isLoggedIn?: boolean;
  memberName?: string;
  onClose: () => void;
};

export default function BotemEditFlow({
  open,
  recipientName,
  shareKey,
  contribution,
  skipIdentity = false,
  isLoggedIn = false,
  memberName,
  onClose,
}: BotemEditFlowProps) {
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  // 저장한 값을 다음 수정 세션의 기준으로 삼고, 확인 때 key를 올려 시트를 그 값으로 다시 마운트한다
  // 다른 보탬으로 바뀌면 이전 보탬의 편지를 쓰지 않도록 contributionId와 함께 기억한다
  const [saved, setSaved] = useState<{ contributionId: number; values: LetterWriteValues } | null>(
    null,
  );
  const [letterKey, setLetterKey] = useState(0);
  const updateMy = useUpdateMyContributionMutation(shareKey);
  const updateGuest = useUpdateGuestContributionMutation(shareKey);
  const savedLetter = saved?.contributionId === contribution?.contributionId ? saved?.values : null;
  const initialLetter = savedLetter ?? (contribution && toLetterValues(contribution));

  const save = (values: LetterWriteValues) => {
    if (!contribution) return;
    const onSuccess = () => {
      setSaved({ contributionId: contribution.contributionId, values });
      setIsSavedOpen(true);
    };
    if ("accessToken" in contribution) {
      updateGuest.mutate({ letter: values, access: contribution }, { onSuccess });
      return;
    }
    // 회원 수정 API는 이름·메시지·편지지만 받는다. 스티커·사진·음성은 보내지 않는다
    const { message, paperTemplateCode } = toMessageContributionRequest(values, { requestKey: "" });
    updateMy.mutate(
      {
        contributionId: contribution.contributionId,
        body: {
          participantName: contribution.participantName,
          message: message ?? "",
          paperTemplateCode,
        },
      },
      { onSuccess },
    );
  };

  return (
    <>
      {/* 회원·비회원·서프라이즈 개설자 경로는 모두 skipIdentity로 이 시트를 건너뛴다. 이 시트는 skipIdentity가 아닐 때만 열리며 onSubmit은 아직 서버 확인과 연결 전이다 */}
      <BotemEditSheet
        open={open && !skipIdentity}
        onClose={onClose}
        onSubmit={() => setIsLetterOpen(true)}
      />
      {initialLetter && (
        <LetterWriteSheet
          key={`${letterKey}-${contribution?.contributionId}`}
          open={isLetterOpen || (skipIdentity && open)}
          recipientName={recipientName}
          isLoggedIn={isLoggedIn}
          memberName={memberName}
          initialValues={initialLetter}
          isSavePending={updateMy.isPending || updateGuest.isPending}
          onClose={() => {
            setIsLetterOpen(false);
            // 확인 시트를 건너뛰면 열림 상태가 부모에 있어 부모도 닫아야 시트가 닫힌다
            if (skipIdentity) onClose();
          }}
          onSave={save}
        />
      )}
      {/* 확인을 누르면 수정 시트를 모두 닫아 처음 진입했던 화면으로 돌아간다 */}
      <Dialog
        kind="alert"
        open={isSavedOpen}
        title="보탬을 수정했어요"
        onConfirm={() => {
          setIsSavedOpen(false);
          setIsLetterOpen(false);
          setLetterKey(key => key + 1);
          onClose();
        }}
      />
    </>
  );
}
