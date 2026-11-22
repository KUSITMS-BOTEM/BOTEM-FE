import { render, screen, within } from "@testing-library/react";

import type { ClosedFundingResponse } from "@/types/funding/closedFunding";
import ClosedFundingList from "@/widgets/funding/ClosedFundingList";

const base: ClosedFundingResponse = {
  fundingId: 1,
  relationship: "OPENED",
  fundingType: "BIRTHDAY",
  opener: { name: "서준", profileImageUrl: null },
  celebrantName: "서준",
  productName: "에어팟 프로 2",
  productImageUrl: "",
  deadline: "2025-10-13T23:59:59",
  rollingPaperCount: 8,
  representativeMessage: null,
};

describe("ClosedFundingList", () => {
  it("마감일이 같은 펀딩끼리 날짜 헤더 아래로 묶는다", () => {
    render(
      <ClosedFundingList
        fundings={[
          base,
          { ...base, fundingId: 2, deadline: "2025-10-10T23:59:59" },
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

  it("내가 연 펀딩은 관리 상세, 받은 서프라이즈는 받은 서프라이즈 상세로 이동하고 참여한 펀딩은 링크가 아니다", () => {
    render(
      <ClosedFundingList
        fundings={[
          { ...base, fundingId: 10 },
          { ...base, fundingId: 11, relationship: "RECEIVED", fundingType: "SURPRISE" },
          { ...base, fundingId: 12, relationship: "PARTICIPATED" },
        ]}
      />,
    );

    const links = screen.getAllByRole("link");
    expect(links.map(link => link.getAttribute("href"))).toEqual(["/funding/10", "/surprised/11"]);
  });
});
