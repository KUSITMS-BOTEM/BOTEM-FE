import { Suspense } from "react";

import FundingRevealContainer from "@/widgets/funding/FundingRevealContainer";

export default function FundingRevealPage() {
  return (
    <Suspense fallback={null}>
      <FundingRevealContainer />
    </Suspense>
  );
}
