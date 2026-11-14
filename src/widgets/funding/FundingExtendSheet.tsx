"use client";

import { useState } from "react";

import BottomSheet from "@/components/BottomSheet";
import FieldMessage from "@/components/FieldMessage";
import SelectBox from "@/components/SelectBox";
import Title from "@/components/Title";
import { addDays } from "@/utils/funding/addDays";
import { formatDeadlineShort } from "@/utils/funding/formatDeadline";

const MAX_EXTEND_DAYS = 14;

type FundingExtendSheetProps = {
  open: boolean;
  collectedAmount: number;
  currentDeadline: string;
  onExtend: (newDeadline: string) => void;
  onClose: () => void;
};

export default function FundingExtendSheet({
  open,
  collectedAmount,
  currentDeadline,
  onExtend,
  onClose,
}: FundingExtendSheetProps) {
  const [newDeadline, setNewDeadline] = useState("");

  return (
    <BottomSheet
      open={open}
      title="마감일 연장"
      height="auto"
      headerType="handle"
      onClose={onClose}
      buttons={{
        rightLabel: "연장하기",
        rightDisabled: newDeadline === "",
        onRightClick: () => onExtend(newDeadline),
        upper: (
          <p className="text-semantic-text-tertiary flex-1 text-center [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-x-small-weak)]">
            보태준 친구들에게 기간 연장 알림이 가요
          </p>
        ),
      }}>
      <Title
        type="a2z"
        title="마감일을 연장할까요?"
        description={`지금까지 모인 ${collectedAmount.toLocaleString("ko-KR")}원은 그대로 두고,\n새 마감일까지 더 모아요`}
      />
      <div className="flex w-full flex-col gap-2">
        <SelectBox
          variant="deadline"
          label="새 마감일"
          placeholder="날짜를 선택해주세요"
          value={newDeadline && formatDeadlineShort(newDeadline)}
          dateValue={newDeadline}
          minDate={addDays(currentDeadline, 1)}
          maxDate={addDays(currentDeadline, MAX_EXTEND_DAYS)}
          onDeadlineChange={setNewDeadline}
        />
        <FieldMessage>기존 마감일은 {formatDeadlineShort(currentDeadline)}까지에요</FieldMessage>
        <FieldMessage>최대 {MAX_EXTEND_DAYS}일까지 더 연장할 수 있어요</FieldMessage>
      </div>
    </BottomSheet>
  );
}
