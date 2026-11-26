"use client";

import BottomSheet from "@/components/BottomSheet";
import List from "@/components/List";
import ListHeader from "@/components/ListHeader";
import Title from "@/components/Title";
import { BANKS } from "@/constants/bank";
import type { FundingWish } from "@/types/funding/funding";
import { formatDeadline } from "@/utils/funding/formatDeadline";
import { formatPerPerson } from "@/utils/funding/recommendedAmount";
import type { FundingAccountValues } from "@/widgets/funding/FundingAccountStep";
import type { FundingAmountValues } from "@/widgets/funding/FundingAmountStep";
import type { SurpriseInfoValues } from "@/widgets/funding/SurpriseInfoStep";

type SurpriseConfirmSheetProps = {
  open: boolean;
  wish: FundingWish;
  recipientName: string;
  amount: FundingAmountValues;
  info: SurpriseInfoValues;
  account: FundingAccountValues;
  showOnRecipientProfile: boolean;
  // 개설 요청 중에는 펀딩 열기 버튼을 loading 상태로 잠근다
  submitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onPreview: () => void;
  onEditAmount: () => void;
  onEditInfo: () => void;
  onEditExposure: () => void;
  onEditAccount: () => void;
};

export default function SurpriseConfirmSheet({
  open,
  wish,
  recipientName,
  amount,
  info,
  account,
  showOnRecipientProfile,
  submitting = false,
  onClose,
  onConfirm,
  onPreview,
  onEditAmount,
  onEditInfo,
  onEditExposure,
  onEditAccount,
}: SurpriseConfirmSheetProps) {
  const bank = BANKS.find(({ code }) => code === account.bank);

  return (
    <BottomSheet
      open={open}
      title="서프라이즈 펀딩 열기 확인"
      height="auto"
      buttons={{
        leftLabel: "미리보기",
        leftColor: "brand",
        onLeftClick: onPreview,
        rightLabel: "펀딩 열기",
        rightLoading: submitting,
        onRightClick: onConfirm,
      }}
      onClose={onClose}>
      <div className="flex w-full flex-col gap-3">
        <Title
          type="a2z"
          title={"이대로 서프라이즈\n펀딩을 열까요?"}
          description="열고 나면 펀딩 정보를 바꿀 수 없어요."
        />
        <List type="product" thumbnailSrc={wish.productImageUrl} title={wish.productName} />
        <div className="flex w-full flex-col">
          <ListHeader
            title="금액 정보"
            rightItem={{ label: "변경하기", onClick: onEditAmount, disabled: submitting }}
          />
          <List
            titleUp
            title={`${Number(amount.targetAmount).toLocaleString("ko-KR")}원`}
            description="목표 금액"
          />
          {amount.recommendedAmount && (
            <List
              titleUp
              title={formatPerPerson(amount.recommendedAmount)}
              description="추천 금액"
            />
          )}
        </div>
        <div aria-hidden className="bg-semantic-border-weak -mx-5 h-2.5" />
        <div className="flex w-full flex-col">
          <ListHeader
            title="서프라이즈 정보"
            rightItem={{ label: "변경하기", onClick: onEditInfo, disabled: submitting }}
          />
          <List titleUp title={formatDeadline(info.deadline)} description="마감일" />
          <List
            titleUp
            title={`${formatDeadline(info.revealDate)} / 밤 12시`}
            description="펀딩 공개일"
          />
        </div>
        <div aria-hidden className="bg-semantic-border-weak -mx-5 h-2.5" />
        <div className="flex w-full flex-col">
          <ListHeader
            title="프로필 펀딩 노출"
            rightItem={{ label: "변경하기", onClick: onEditExposure, disabled: submitting }}
          />
          {showOnRecipientProfile ? (
            <List
              titleUp
              title="보여주기로 설정"
              description={`${recipientName}의 프로필에 들른 다른 친구들도 펀딩을 볼 수 있어요`}
            />
          ) : (
            <List titleUp title="보여주지 않기로 설정" />
          )}
        </div>
        <div aria-hidden className="bg-semantic-border-weak -mx-5 h-2.5" />
        <div className="flex w-full flex-col">
          <ListHeader
            title="펀딩 계좌"
            rightItem={{ label: "변경하기", onClick: onEditAccount, disabled: submitting }}
          />
          <List leading={bank?.logo} title={bank?.name ?? ""} description={account.accountNumber} />
        </div>
      </div>
    </BottomSheet>
  );
}
