"use client";

import BottomSheet from "@/components/BottomSheet";
import List from "@/components/List";
import ListHeader from "@/components/ListHeader";
import Title from "@/components/Title";
import { BANKS } from "@/constants/bank";
import type { FundingWish } from "@/types/funding/funding";
import { formatDeadlineShort } from "@/utils/funding/formatDeadline";
import { formatPerPerson } from "@/utils/funding/recommendedAmount";
import type { FundingAccountValues } from "@/widgets/funding/FundingAccountStep";
import type { FundingAmountValues } from "@/widgets/funding/FundingAmountStep";
import type { FundingInfoValues } from "@/widgets/funding/FundingInfoStep";

type FundingConfirmSheetProps = {
  open: boolean;
  wish: FundingWish;
  amount: FundingAmountValues;
  info: FundingInfoValues;
  account: FundingAccountValues;
  // 개설 요청 중에는 펀딩 열기 버튼을 loading 상태로 잠근다
  submitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onPreview: () => void;
  onEditAmount: () => void;
  onEditInfo: () => void;
  onEditAccount: () => void;
};

export default function FundingConfirmSheet({
  open,
  wish,
  amount,
  info,
  account,
  submitting = false,
  onClose,
  onConfirm,
  onPreview,
  onEditAmount,
  onEditInfo,
  onEditAccount,
}: FundingConfirmSheetProps) {
  const bank = BANKS.find(({ code }) => code === account.bank);

  return (
    <BottomSheet
      open={open}
      title="펀딩 열기 확인"
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
          title="이대로 펀딩을 열까요?"
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
            title="펀딩 정보"
            rightItem={{ label: "변경하기", onClick: onEditInfo, disabled: submitting }}
          />
          <List titleUp title={formatDeadlineShort(info.deadline)} description="마감일" />
          {info.pledge.trim() && <List titleUp title={info.pledge} description="공약" />}
          <List titleUp title={info.story} description="사연" />
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
