import { cookies } from "next/headers";

import FundingCompleteContainer from "@/widgets/funding/FundingCompleteContainer";

type FundingCompletePageProps = {
  params: Promise<{ shareKey: string }>;
};

export default async function FundingCompletePage({ params }: FundingCompletePageProps) {
  const { shareKey } = await params;
  const isLoggedIn = (await cookies()).get("isLoggedIn")?.value === "true";

  return <FundingCompleteContainer shareKey={shareKey} isLoggedIn={isLoggedIn} />;
}
