"use client";

import { useRouter } from "next/navigation";

import type { ShareMemberIntent } from "@/utils/funding/shareMemberIntent";
import FundingDetailLoader from "@/widgets/funding/FundingDetailLoader";

type FundingShareContainerProps = {
  shareKey: string;
  memberIntent?: ShareMemberIntent;
  isLoggedIn?: boolean;
  surprise?: { revealAt: string | null };
};

export default function FundingShareContainer({
  shareKey,
  memberIntent,
  isLoggedIn,
  surprise,
}: FundingShareContainerProps) {
  const router = useRouter();

  return (
    <FundingDetailLoader
      shareKey={shareKey}
      onBack={isLoggedIn ? () => router.push("/home") : undefined}
      memberIntent={memberIntent}
      isLoggedIn={isLoggedIn}
      surprise={surprise}
    />
  );
}
