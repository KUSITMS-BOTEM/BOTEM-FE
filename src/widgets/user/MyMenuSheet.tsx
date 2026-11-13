"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import List from "@/components/List";
import ListHeader from "@/components/ListHeader";
import CloseSheet from "@/components/CloseSheet";
import TextButton from "@/components/TextButton";
import { cn } from "@/utils/cn";
import { useLogoutMutation } from "@/hooks/mutations/auth/useLogoutMutation";
import { usePayoutAccountsQuery } from "@/hooks/queries/payout-account/usePayoutAccountsQuery";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { handleLogoutClick } from "@/utils/auth/handleLogoutClick";
import { formatBirthdayDisplay } from "@/utils/user/formatBirthdayDisplay";
import ClosedFundingSheet from "@/widgets/funding/ClosedFundingSheet";
import PayoutAccountEditSheet from "@/widgets/payout-account/PayoutAccountEditSheet";
import MyMenuProfileRow from "@/widgets/user/MyMenuProfileRow";
import MyProfileSheet from "@/widgets/user/MyProfileSheet";
import IconAccount from "@/assets/icons/multicolor/icon-account.svg?react";
import IconFaqGuide from "@/assets/icons/multicolor/icon-faq-guide.svg?react";
import IconFundingOpen from "@/assets/icons/multicolor/icon-funding-open.svg?react";
import IconNotification from "@/assets/icons/multicolor/icon-notification.svg?react";
import IconTerms from "@/assets/icons/multicolor/icon-terms.svg?react";

// Figma의 메뉴 우측 텍스트 버튼은 보조 텍스트 색이라 TextButton 기본색(primary)을 덮어쓴다
const MENU_TEXT_BUTTON_CLASS = "text-semantic-text-secondary";

type MyMenuSheetProps = {
  open: boolean;
  onClose: () => void;
  friendCount: number;
  closedFundingCount: number;
};

export default function MyMenuSheet({
  open,
  onClose,
  friendCount,
  closedFundingCount,
}: MyMenuSheetProps) {
  const router = useRouter();
  const { mutate: logout } = useLogoutMutation();
  const { data: profile } = useMyProfileQuery();
  const { data: payoutAccounts } = usePayoutAccountsQuery();
  const defaultAccount = payoutAccounts?.find(account => account.isDefault);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [closedFundingSheetOpen, setClosedFundingSheetOpen] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);

  return (
    <CloseSheet open={open} title="" onClose={onClose}>
      <div className="flex w-full flex-1 flex-col justify-between pb-4">
        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-col">
            <ListHeader title="내 프로필" />
            <MyMenuProfileRow
              onClick={() => setProfileSheetOpen(true)}
              nickname={profile?.nickname ?? ""}
              birthdayText={
                profile?.birthday ? `생일 ${formatBirthdayDisplay(profile.birthday)}` : undefined
              }
              profileImageUrl={profile?.profileImageUrl ?? undefined}
            />
          </div>
          <div aria-hidden className="bg-semantic-border-weak -mx-5 h-px" />
          <div className="flex w-full flex-col">
            <List
              leading={<IconAccount />}
              title="친구"
              onClick={() => router.push("/friends")}
              right={
                <span className={cn("[font:var(--semantic-label-small)]", MENU_TEXT_BUTTON_CLASS)}>
                  {`${friendCount}명`}
                </span>
              }
            />
            <List
              leading={<IconFundingOpen />}
              title="마감된 펀딩"
              right={
                <TextButton
                  size="medium"
                  label={`${closedFundingCount}개`}
                  onClick={() => setClosedFundingSheetOpen(true)}
                  className={MENU_TEXT_BUTTON_CLASS}
                />
              }
            />
            <List
              leading={<IconAccount />}
              title="대표 계좌"
              right={
                <TextButton
                  size="medium"
                  label={defaultAccount?.bankName ?? ""}
                  onClick={() => setAccountSheetOpen(true)}
                  className={MENU_TEXT_BUTTON_CLASS}
                />
              }
            />
            <List leading={<IconNotification />} title="알림 설정" />
            <List leading={<IconFaqGuide />} title="FAQ · 금액 가이드" />
            <List leading={<IconTerms />} title="이용약관" />
          </div>
        </div>
        <div className="flex px-2">
          <TextButton
            size="medium"
            label="로그아웃"
            rightIcon={false}
            onClick={() => handleLogoutClick(logout, router)}
            className={MENU_TEXT_BUTTON_CLASS}
          />
        </div>
      </div>
      <MyProfileSheet open={profileSheetOpen} onClose={() => setProfileSheetOpen(false)} />
      <ClosedFundingSheet
        open={closedFundingSheetOpen}
        onClose={() => setClosedFundingSheetOpen(false)}
      />
      <PayoutAccountEditSheet open={accountSheetOpen} onClose={() => setAccountSheetOpen(false)} />
    </CloseSheet>
  );
}
