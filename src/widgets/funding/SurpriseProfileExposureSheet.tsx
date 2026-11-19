"use client";

import BottomSheet from "@/components/BottomSheet";
import Title from "@/components/Title";

type SurpriseProfileExposureSheetProps = {
  open: boolean;
  recipientName: string;
  // 예 = true, 아니오 = false
  onSelect: (showOnRecipientProfile: boolean) => void;
  onClose: () => void;
};

export default function SurpriseProfileExposureSheet({
  open,
  recipientName,
  onSelect,
  onClose,
}: SurpriseProfileExposureSheetProps) {
  return (
    <BottomSheet
      open={open}
      title="프로필 펀딩 노출"
      height="auto"
      headerType="handle"
      showHandleClose
      buttons={{
        leftLabel: "아니오",
        leftColor: "neutral",
        onLeftClick: () => onSelect(false),
        rightLabel: "예",
        onRightClick: () => onSelect(true),
        upper: (
          <p className="text-semantic-text-tertiary [font:var(--semantic-label-x-small)]">
            {`서프라이즈 펀딩은 ${recipientName}에게 보이지 않아요`}
          </p>
        ),
      }}
      onClose={onClose}>
      <Title
        type="a2z"
        title={`${recipientName}의 프로필에\n서프라이즈 펀딩을\n보여줄까요?`}
        description={`${recipientName}의 프로필에 들른 다른 친구들도\n펀딩을 보고 같이 보탬 할 수 있어요`}
      />
    </BottomSheet>
  );
}
