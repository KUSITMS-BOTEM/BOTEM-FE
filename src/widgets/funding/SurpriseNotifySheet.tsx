"use client";

import BottomSheet from "@/components/BottomSheet";
import Title from "@/components/Title";

type SurpriseNotifySheetProps = {
  open: boolean;
  recipientName: string;
  // 예 = true, 아니오 = false
  onSelect: (notifyRecipientFriends: boolean) => void;
  onClose: () => void;
};

// TODO(디자인): 디자인 팀이 노출·알림 시트를 합쳐 만든 상태라 문구는 임시다. 확정되면 이 시트의 문구만 바꾼다
export default function SurpriseNotifySheet({
  open,
  recipientName,
  onSelect,
  onClose,
}: SurpriseNotifySheetProps) {
  return (
    <BottomSheet
      open={open}
      title="보탠 친구에게 알리기"
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
        title={"보탠 친구에게도\n알릴까요?"}
        description={"서프라이즈에 보탠 친구들도\n마감일에 알림을 받을 수 있어요"}
      />
    </BottomSheet>
  );
}
