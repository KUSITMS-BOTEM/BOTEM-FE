"use client";

import BottomSheet from "@/components/BottomSheet";
import List from "@/components/List";
import ListHeader from "@/components/ListHeader";
import Title from "@/components/Title";
import { BANKS } from "@/constants/bank";
import type { WishResponse } from "@/types/wish/wish";
import { formatDeadlineShort } from "@/utils/funding/formatDeadline";
import type { FundingAccountValues } from "@/widgets/funding/FundingAccountStep";
import type { FundingInfoValues } from "@/widgets/funding/FundingInfoStep";

type FundingConfirmSheetProps = {
  open: boolean;
  wish: WishResponse;
  info: FundingInfoValues;
  account: FundingAccountValues;
  onClose: () => void;
  onEditInfo: () => void;
  onEditAccount: () => void;
};

export default function FundingConfirmSheet({
  open,
  wish,
  info,
  account,
  onClose,
  onEditInfo,
  onEditAccount,
}: FundingConfirmSheetProps) {
  const bank = BANKS.find(({ code }) => code === account.bank);

  return (
    <BottomSheet
      open={open}
      title="펀딩 열기 확인"
      height="auto"
      buttons={{ leftLabel: "미리보기", leftColor: "brand", rightLabel: "펀딩 열기" }}
      onClose={onClose}>
      <div className="flex w-full flex-col gap-3">
        <Title
          type="a2z"
          title="이대로 펀딩을 열까요?"
          description="열고 나면 펀딩 정보를 바꿀 수 없어요."
        />
        <div className="flex w-full flex-col">
          <ListHeader title="펀딩 정보" rightItem={{ label: "변경하기", onClick: onEditInfo }} />
          <List
            type="product"
            thumbnailSrc={wish.productImageUrl}
            title={wish.productName}
            description={`목표 ${Number(info.targetAmount).toLocaleString("ko-KR")}원 · 마감 ${formatDeadlineShort(info.deadline)}`}
          />
          {info.pledge.trim() && <List titleUp title={info.pledge} description="공약" />}
          <List titleUp title={info.story} description="사연" />
        </div>
        <div aria-hidden className="bg-semantic-border-weak -mx-5 h-2.5" />
        <div className="flex w-full flex-col">
          <ListHeader title="펀딩 계좌" rightItem={{ label: "변경하기", onClick: onEditAccount }} />
          <List leading={bank?.logo} title={bank?.name ?? ""} description={account.accountNumber} />
        </div>
      </div>
    </BottomSheet>
  );
}
