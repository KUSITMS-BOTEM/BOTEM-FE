import { render, screen } from "@testing-library/react";

import FundingGiftProofViewSkeleton from "@/widgets/funding/skeleton/FundingGiftProofViewSkeleton";

describe("FundingGiftProofViewSkeleton", () => {
  it("불러오는 중인 영역(aria-busy)으로 노출된다", () => {
    render(<FundingGiftProofViewSkeleton />);

    expect(screen.getByLabelText("선물 인증 불러오는 중")).toHaveAttribute("aria-busy", "true");
  });
});
