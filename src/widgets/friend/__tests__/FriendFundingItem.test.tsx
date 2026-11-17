import { render, screen } from "@testing-library/react";

import type { FriendFundingResponse } from "@/types/friend/friend";
import FriendFundingItem from "@/widgets/friend/FriendFundingItem";

const base: FriendFundingResponse = {
  fundingId: 10,
  isSurprise: false,
  title: "지유의 생일 펀딩",
  productName: "소니 WH-1000 XM4",
  productImageUrl: "https://example.com/product.png",
  deadline: "2026-10-13",
  currentAmount: 55000,
  targetAmount: 100000,
  representativeParticipantName: "민지",
  participantCount: 7,
};

describe("FriendFundingItem", () => {
  beforeEach(() => {
    // 마감일 D-day가 서울 기준 오늘에 따라 바뀌므로 오늘을 고정한다
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-06T12:00:00+09:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("펀딩 참여 화면(/share/{fundingId})으로 가는 링크다", () => {
    render(<FriendFundingItem funding={base} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/share/10");
  });

  it("마감일·D-day·달성률·참여자 문구를 보여준다", () => {
    render(<FriendFundingItem funding={base} />);

    expect(screen.getByText("펀딩 마감 10월 13일 · D-7")).toBeInTheDocument();
    expect(screen.getByText("55% 달성")).toBeInTheDocument();
    expect(screen.getByText("민지님 외 6명 참여중")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "소니 WH-1000 XM4" })).toHaveAttribute(
      "aria-valuenow",
      "55",
    );
  });

  it("일반 펀딩이면 펀딩 제목을 보여주고 서프라이즈 안내 버튼은 없다", () => {
    render(<FriendFundingItem funding={base} />);

    expect(screen.getByText("지유의 생일 펀딩")).toBeInTheDocument();
    expect(screen.queryByText("서프라이즈")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "서프라이즈 펀딩 안내" })).not.toBeInTheDocument();
  });

  it("서프라이즈 펀딩이면 서프라이즈 라벨과 안내 버튼을 보여주고 제목은 숨긴다", () => {
    render(<FriendFundingItem funding={{ ...base, isSurprise: true }} />);

    expect(screen.getByText("서프라이즈")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "서프라이즈 펀딩 안내" })).toBeInTheDocument();
    expect(screen.queryByText("지유의 생일 펀딩")).not.toBeInTheDocument();
  });

  it("안내 버튼은 링크 안에 중첩되지 않는다", () => {
    render(<FriendFundingItem funding={{ ...base, isSurprise: true }} />);

    expect(screen.getByRole("link")).not.toContainElement(
      screen.getByRole("button", { name: "서프라이즈 펀딩 안내" }),
    );
  });

  it.each([
    ["null", null],
    ["http(s)가 아닌 주소", "javascript:alert(1)"],
  ])("상품 이미지가 %s이면 이미지를 렌더하지 않는다", (_, productImageUrl) => {
    const { container } = render(<FriendFundingItem funding={{ ...base, productImageUrl }} />);

    expect(container.querySelector("img")).not.toBeInTheDocument();
  });
});
