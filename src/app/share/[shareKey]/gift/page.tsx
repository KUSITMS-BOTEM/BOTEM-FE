import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getShareFunding } from "@/app/share/[shareKey]/getShareFunding";
import FundingGiftProofContainer from "@/widgets/funding/FundingGiftProofContainer";

type FundingGiftProofPageProps = {
  params: Promise<{ shareKey: string }>;
};

export default async function FundingGiftProofPage({ params }: FundingGiftProofPageProps) {
  const { shareKey } = await params;
  // 서프라이즈는 잠금·공개 시각을 거쳐야 하므로 인증 결과 주소로 바로 들어와도 공유 화면으로 돌려보낸다
  const funding = await getShareFunding(shareKey);
  if (funding.type === "SURPRISE") redirect(`/share/${encodeURIComponent(shareKey)}`);
  const isLoggedIn = (await cookies()).get("isLoggedIn")?.value === "true";

  return <FundingGiftProofContainer shareKey={shareKey} isLoggedIn={isLoggedIn} />;
}
