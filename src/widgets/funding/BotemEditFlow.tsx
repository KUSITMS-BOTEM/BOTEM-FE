"use client";

import { useState } from "react";

import Dialog from "@/components/Dialog";
import BotemEditSheet from "@/widgets/funding/BotemEditSheet";
import LetterWriteSheet, { type LetterWriteValues } from "@/widgets/letter-paper/LetterWriteSheet";

// 내 보탬 수정 플로우: 이름·비밀번호 확인 시트 → 편지 수정 시트 → 수정 완료 안내 Dialog를 순서대로 연결한다
type BotemEditFlowProps = {
  open: boolean;
  recipientName: string;
  onClose: () => void;
};

// TODO(API): 보탬 수정 조회 API가 나오면 이름·비밀번호로 찾은 내 편지로 교체한다
const MOCK_MY_LETTER = {
  text: "지유야 생일 축하해!\n올해도 같이 많이 웃자",
  name: "민지",
  color: "lime",
  paperStyle: "vividSolid",
} satisfies LetterWriteValues;

export default function BotemEditFlow({ open, recipientName, onClose }: BotemEditFlowProps) {
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  // 저장한 값을 다음 수정 세션의 기준으로 삼고, 확인 때 key를 올려 시트를 그 값으로 다시 마운트한다
  const [letter, setLetter] = useState<LetterWriteValues>(MOCK_MY_LETTER);
  const [letterKey, setLetterKey] = useState(0);

  return (
    <>
      {/* TODO(API): 이름·비밀번호 확인(onSubmit) 뒤 동작은 보탬 수정 API가 정해지면 연결한다. 일치하는 보탬이 없으면(없는 이름·비밀번호) Toast나 Dialog로 안내하고 시트는 닫지 않아 재입력할 수 있게 한다 */}
      <BotemEditSheet open={open} onClose={onClose} onSubmit={() => setIsLetterOpen(true)} />
      {/* TODO(API): 저장(onSave)은 보탬 수정 API가 정해지면 연결하고, 성공했을 때만 완료 안내를 띄운다 */}
      <LetterWriteSheet
        key={letterKey}
        open={isLetterOpen}
        recipientName={recipientName}
        isLoggedIn={false}
        initialValues={letter}
        onClose={() => setIsLetterOpen(false)}
        onSave={values => {
          setLetter(values);
          setIsSavedOpen(true);
        }}
      />
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
