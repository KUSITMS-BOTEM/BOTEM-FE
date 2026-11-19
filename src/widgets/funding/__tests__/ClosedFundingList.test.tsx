import { render, screen, within } from "@testing-library/react";

import type { ClosedFundingResponse } from "@/types/funding/closedFunding";
import ClosedFundingList from "@/widgets/funding/ClosedFundingList";

const base: ClosedFundingResponse = {
  fundingId: 1,
  type: "BIRTHDAY",
  productName: "에어팟 프로 2",
  productImageUrl: "",
  deadline: "2025-10-13T23:59:59.999999",
  targetReached: true,
  participantCount: 8,
  recipientName: null,
  giftVerificationStatus: null,
};

describe("ClosedFundingList", () => {
  it("마감일이 같은 펀딩끼리 날짜 헤더 아래로 묶는다", () => {
    render(
      <ClosedFundingList
        fundings={[
          base,
          { ...base, fundingId: 2, deadline: "2025-10-10T23:59:59.999999" },
          { ...base, fundingId: 3, deadline: "2025-10-10T01:00:00" },
        ]}
      />,
    );

    expect(screen.getAllByRole("heading").map(h => h.textContent)).toEqual([
      "2025.10.13",
      "2025.10.10",
    ]);
    const lists = screen.getAllByRole("list");
    expect(lists).toHaveLength(2);
    expect(within(lists[1]).getAllByRole("listitem")).toHaveLength(2);
  });

  it("생일 펀딩의 인증 상태를 뱃지로 보여준다", () => {
    render(
      <ClosedFundingList
        fundings={[
          { ...base, giftVerificationStatus: "REQUIRED" },
          { ...base, fundingId: 2, giftVerificationStatus: "COMPLETED" },
        ]}
      />,
    );

    expect(screen.getByText("인증 필요")).toBeInTheDocument();
    expect(screen.getByText("인증 완료")).toBeInTheDocument();
    expect(screen.getAllByText("내 생일")).toHaveLength(2);
  });

  it("서프라이즈 펀딩은 받는 사람 이름 뱃지를 보여준다", () => {
    render(
      <ClosedFundingList
        fundings={[{ ...base, type: "SURPRISE", recipientName: "서준", targetReached: false }]}
      />,
    );

    expect(screen.getByText("서준 서프라이즈")).toBeInTheDocument();
    expect(screen.getByText("모인 만큼 전달 · 8명 참여")).toBeInTheDocument();
  });
});
