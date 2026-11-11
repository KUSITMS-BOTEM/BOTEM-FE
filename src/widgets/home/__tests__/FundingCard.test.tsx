import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingCard from "@/widgets/home/FundingCard";

const baseProps = {
  title: "민지 생일 펀딩",
  productName: "에어팟 프로",
  productImageUrl: "/product.png",
  progress: 60,
  dDay: 7,
  targetAmount: 1500000,
};

describe("FundingCard", () => {
  it("제목, 상품명, 상품 이미지를 렌더한다", () => {
    render(<FundingCard {...baseProps} />);

    expect(screen.getByText("민지 생일 펀딩")).toBeInTheDocument();
    expect(screen.getByText("에어팟 프로")).toBeInTheDocument();
    expect(screen.getByAltText("에어팟 프로")).toBeInTheDocument();
  });

  it("마감일과 목표 금액을 ko-KR 천 단위 쉼표로 표시한다", () => {
    render(<FundingCard {...baseProps} />);

    expect(screen.getByText("마감까지 D-7")).toBeInTheDocument();
    expect(screen.getByText("목표")).toBeInTheDocument();
    expect(screen.getByText("1,500,000원")).toBeInTheDocument();
  });

  it("dDay가 null이면 남은 일수 대신 '마감'을 표시한다", () => {
    render(<FundingCard {...baseProps} dDay={null} />);

    expect(screen.getByText("마감")).toBeInTheDocument();
    expect(screen.queryByText(/마감까지/)).not.toBeInTheDocument();
  });

  it("targetAmount가 0이면 '0원'을 표시한다", () => {
    render(<FundingCard {...baseProps} targetAmount={0} />);

    expect(screen.getByText("0원")).toBeInTheDocument();
  });

  it("progress가 progressbar에 전달된다", () => {
    render(<FundingCard {...baseProps} progress={60} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "60");
  });

  it("default 타입에서 participants가 있으면 프로필과 '+N'을 표시한다", () => {
    render(
      <FundingCard {...baseProps} participants={["orange", "lime"]} extraParticipantCount={3} />,
    );

    expect(screen.getByText("+3")).toBeInTheDocument();
  });

  it("default 타입에서 participants가 빈 배열이면 프로필 영역이 없다", () => {
    render(<FundingCard {...baseProps} participants={[]} extraParticipantCount={3} />);

    expect(screen.queryByText("+3")).not.toBeInTheDocument();
  });

  it("default 타입에서 pendingCount가 양수면 '확인대기 N' 배지를 표시한다", () => {
    render(<FundingCard {...baseProps} pendingCount={2} />);

    expect(screen.getByText("확인대기 2")).toBeInTheDocument();
  });

  it("default 타입에서 pendingCount가 0이면 배지를 숨긴다", () => {
    render(<FundingCard {...baseProps} pendingCount={0} />);

    expect(screen.queryByText(/확인대기/)).not.toBeInTheDocument();
  });

  it("default 타입에서는 선물 커버 문구가 없다", () => {
    render(<FundingCard {...baseProps} pendingCount={2} />);

    expect(screen.queryByText(/펑/)).not.toBeInTheDocument();
  });

  it("notification 타입이면 확인대기 건수 안내 문구를 표시한다", () => {
    render(<FundingCard {...baseProps} type="notification" pendingCount={3} />);

    expect(
      screen.getByText(
        (_, el) =>
          el?.tagName === "P" && el.textContent === "확인대기 3건을\n확인하고 펑 터트려봐요!",
      ),
    ).toBeInTheDocument();
  });

  it("open 타입이면 '펑! 터트려볼까요?' 문구를 표시한다", () => {
    render(<FundingCard {...baseProps} type="open" />);

    expect(
      screen.getByText((_, el) => el?.tagName === "P" && el.textContent === "펑!\n터트려볼까요?"),
    ).toBeInTheDocument();
  });

  it("notification 타입에서는 프로필과 배지를 표시하지 않는다", () => {
    render(
      <FundingCard
        {...baseProps}
        type="notification"
        pendingCount={3}
        participants={["orange"]}
        extraParticipantCount={4}
      />,
    );

    expect(screen.queryByText("+4")).not.toBeInTheDocument();
    expect(screen.queryByText("확인대기 3")).not.toBeInTheDocument();
  });

  it("open 타입에서는 프로필과 배지를 표시하지 않는다", () => {
    render(
      <FundingCard
        {...baseProps}
        type="open"
        pendingCount={3}
        participants={["orange"]}
        extraParticipantCount={4}
      />,
    );

    expect(screen.queryByText("+4")).not.toBeInTheDocument();
    expect(screen.queryByText("확인대기 3")).not.toBeInTheDocument();
  });

  it("isSurprise가 true면 '서프라이즈 펀딩' 아이콘을 표시한다", () => {
    render(<FundingCard {...baseProps} isSurprise />);

    expect(screen.getByLabelText("서프라이즈 펀딩")).toBeInTheDocument();
  });

  it("isSurprise 기본값에서는 서프라이즈 아이콘이 없다", () => {
    render(<FundingCard {...baseProps} />);

    expect(screen.queryByLabelText("서프라이즈 펀딩")).not.toBeInTheDocument();
  });
});

describe("FundingCard onClick", () => {
  it("onClick이 있으면 제목을 이름으로 가진 카드 전체 버튼을 렌더한다", () => {
    render(<FundingCard {...baseProps} onClick={vi.fn()} />);

    expect(screen.getByRole("button", { name: "민지 생일 펀딩" })).toBeInTheDocument();
  });

  it("카드 버튼을 누르면 onClick을 호출한다", async () => {
    const onClick = vi.fn();
    render(<FundingCard {...baseProps} onClick={onClick} />);

    await userEvent.click(screen.getByRole("button", { name: "민지 생일 펀딩" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("onClick이 없으면 카드 전체 버튼을 렌더하지 않는다", () => {
    render(<FundingCard {...baseProps} />);

    expect(screen.queryByRole("button", { name: "민지 생일 펀딩" })).not.toBeInTheDocument();
  });
});
