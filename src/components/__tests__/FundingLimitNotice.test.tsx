import { render, screen } from "@testing-library/react";

import FundingLimitNotice from "@/components/FundingLimitNotice";

describe("FundingLimitNotice", () => {
  it("펀딩 개설 한도 안내 문구를 보여준다", () => {
    render(<FundingLimitNotice />);

    expect(screen.getByText("펀딩은 최대 5개까지만 열 수 있어요")).toBeInTheDocument();
  });
});
