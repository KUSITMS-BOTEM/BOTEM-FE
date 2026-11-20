import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { FriendFundingResponse } from "@/types/friend/friend";
import FriendFundingSection from "@/widgets/friend/FriendFundingSection";

const funding = (fundingId: number): FriendFundingResponse => ({
  fundingId,
  shareKey: `share-key-${fundingId}`,
  type: "BIRTHDAY",
  productName: `상품 ${fundingId}`,
  productImageUrl: null,
  deadline: "2026-10-13T23:59:59.999999",
  remainingDays: 7,
  participantCount: 2,
  firstParticipantName: "민지",
  confirmedPercentage: 50,
});

const fundings = (count: number) => Array.from({ length: count }, (_, index) => funding(index + 1));
const visibleItems = () => within(screen.getByRole("list")).getAllByRole("listitem");

describe("FriendFundingSection", () => {
  it("제목에 진행 중인 펀딩 개수를 보여준다", () => {
    render(<FriendFundingSection fundings={fundings(1)} />);

    expect(screen.getByRole("heading", { name: "진행중인 펀딩 1개" })).toBeInTheDocument();
  });

  it("notice를 넘기면 제목 아래에 보여준다", () => {
    render(<FriendFundingSection fundings={fundings(1)} notice={<p>안내 문구</p>} />);

    const heading = screen.getByRole("heading", { name: "진행중인 펀딩 1개" });
    const notice = screen.getByText("안내 문구");
    expect(heading.compareDocumentPosition(notice) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("펀딩이 2개 이하면 모두 보여주고 전체보기 버튼은 없다", () => {
    render(<FriendFundingSection fundings={fundings(2)} />);

    expect(visibleItems()).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "전체보기" })).not.toBeInTheDocument();
  });

  it("3개 이상이면 2개만 보이다가 전체보기로 모두 펼치고, 접기로 다시 2개로 줄인다", async () => {
    const user = userEvent.setup();
    render(<FriendFundingSection fundings={fundings(5)} />);

    expect(visibleItems()).toHaveLength(2);
    const toggle = screen.getByRole("button", { name: "전체보기" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(visibleItems()).toHaveLength(5);
    expect(screen.getByRole("button", { name: "접기" })).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: "접기" }));
    expect(visibleItems()).toHaveLength(2);
  });
});
