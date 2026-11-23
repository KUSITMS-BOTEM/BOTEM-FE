"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Asset from "@/components/Asset";
import List from "@/components/List";
import ListHeader from "@/components/ListHeader";
import CloseSheet from "@/components/CloseSheet";
import TextButton from "@/components/TextButton";
import ShimmerBar from "@/components/skeleton/ShimmerBar";
import { cn } from "@/utils/cn";
import { useLogoutMutation } from "@/hooks/mutations/auth/useLogoutMutation";
import { useFriendsQuery } from "@/hooks/queries/friend/useFriendsQuery";
import { usePayoutAccountsQuery } from "@/hooks/queries/payout-account/usePayoutAccountsQuery";
import { useMyProfileQuery } from "@/hooks/queries/user/useMyProfileQuery";
import { useFriendsEntryStore } from "@/store/friendsEntryStore";
import { handleLogoutClick } from "@/utils/auth/handleLogoutClick";
import { formatBirthdayDisplay } from "@/utils/user/formatBirthdayDisplay";
import { getDisplayName } from "@/utils/user/getDisplayName";
import ClosedFundingSheet from "@/widgets/funding/ClosedFundingSheet";
import PayoutAccountEditSheet from "@/widgets/payout-account/PayoutAccountEditSheet";
import MyMenuProfileRow from "@/widgets/user/MyMenuProfileRow";
import IconAccount from "@/assets/icons/multicolor/icon-account.svg?react";
import IconFaqGuide from "@/assets/icons/multicolor/icon-faq-guide.svg?react";
import IconFriend from "@/assets/icons/multicolor/icon-friend.svg?react";
import IconFundingOpen from "@/assets/icons/multicolor/icon-funding-open.svg?react";
import IconNotification from "@/assets/icons/multicolor/icon-notification.svg?react";
import IconTerms from "@/assets/icons/multicolor/icon-terms.svg?react";
import IconRight from "@/assets/icons/icon-right.svg?react";

const MENU_TEXT_BUTTON_CLASS = "text-semantic-text-secondary";

function MenuTrailing({ label }: { label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap [font:var(--semantic-label-small)]",
        MENU_TEXT_BUTTON_CLASS,
      )}>
      {label}
      <Asset icon={<IconRight aria-hidden />} size="xsmall" className="shrink-0" />
    </span>
  );
}

type MyMenuSheetProps = {
  open: boolean;
  onClose: () => void;
  closedFundingCount: number;
  slideInOnOpen?: boolean;
};

export default function MyMenuSheet({
  open,
  onClose,
  closedFundingCount,
  slideInOnOpen,
}: MyMenuSheetProps) {
  const router = useRouter();
  const { mutate: logout } = useLogoutMutation();
  const { data: profile } = useMyProfileQuery();
  const { data: friends, isPending: isFriendsPending } = useFriendsQuery();
  const { data: payoutAccounts } = usePayoutAccountsQuery();
  const defaultAccount = payoutAccounts?.find(account => account.isDefault);
  const [closedFundingSheetOpen, setClosedFundingSheetOpen] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);

  return (
    <CloseSheet open={open} title="" onClose={onClose} slideInOnOpen={slideInOnOpen}>
      <div className="flex w-full flex-1 flex-col justify-between pb-4">
        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-col">
            <ListHeader title="내 프로필" />
            <MyMenuProfileRow
              onClick={() => router.push("/my/profile")}
              nickname={profile ? getDisplayName(profile) : ""}
              birthdayText={
                profile?.birthday ? `생일 ${formatBirthdayDisplay(profile.birthday)}` : undefined
              }
              profileImageUrl={profile?.profileImageUrl ?? undefined}
            />
          </div>
          <div aria-hidden className="bg-semantic-border-weak -mx-5 h-px" />
          <div className="flex w-full flex-col">
            <List
              leading={<IconFriend />}
              title="친구"
              onClick={() => {
                useFriendsEntryStore.getState().setSlideIn(true);
                router.push("/friends");
              }}
              right={
                isFriendsPending ? (
                  <div role="status" aria-label="친구 수 불러오는 중">
                    <ShimmerBar className="h-4.5 w-8" />
                  </div>
                ) : (
                  friends && (
                    <span
                      className={cn("[font:var(--semantic-label-small)]", MENU_TEXT_BUTTON_CLASS)}>
                      {`${friends.totalCount}명`}
                    </span>
                  )
                )
              }
            />
            <List
              leading={<IconFundingOpen />}
              title="마감된 펀딩"
              onClick={() => setClosedFundingSheetOpen(true)}
              right={<MenuTrailing label={`${closedFundingCount}개`} />}
            />
            <List
              leading={<IconAccount />}
              title="대표 계좌"
              onClick={() => setAccountSheetOpen(true)}
              right={<MenuTrailing label={defaultAccount?.bankName ?? ""} />}
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
      <ClosedFundingSheet
        open={closedFundingSheetOpen}
        onClose={() => setClosedFundingSheetOpen(false)}
      />
      <PayoutAccountEditSheet open={accountSheetOpen} onClose={() => setAccountSheetOpen(false)} />
    </CloseSheet>
  );
}
