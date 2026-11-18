import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig, useReducedMotion } from "framer-motion";

import FundingCard from "@/widgets/home/FundingCard";

vi.mock("framer-motion", async importOriginal => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(useReducedMotion).mockReturnValue(false);
});

afterEach(() => {
  MotionGlobalConfig.skipAnimations = false;
});

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

  it("targetAmount가 없으면 목표 금액을 표시하지 않는다", () => {
    render(<FundingCard {...baseProps} targetAmount={undefined} />);

    expect(screen.queryByText("목표")).not.toBeInTheDocument();
  });

  it("progress가 progressbar에 전달된다", () => {
    render(<FundingCard {...baseProps} progress={60} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "60");
  });

  it("default 타입에서 participants가 있으면 프로필과 '+N'을 표시한다", () => {
    render(
      <FundingCard
        {...baseProps}
        participants={[{ color: "orange" }, { color: "lime" }]}
        extraParticipantCount={3}
      />,
    );

    expect(screen.getByText("+3")).toBeInTheDocument();
  });

  it("default 타입에서 participants가 빈 배열이어도 추가 인원이 있으면 '+N'을 표시한다", () => {
    render(<FundingCard {...baseProps} participants={[]} extraParticipantCount={3} />);

    expect(screen.getByText("+3")).toBeInTheDocument();
  });

  it("default 타입에서 participants가 빈 배열이고 추가 인원도 0이면 프로필 영역이 없다", () => {
    render(<FundingCard {...baseProps} participants={[]} extraParticipantCount={0} />);

    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  it("default 타입에서 pendingCount가 양수면 '확인 대기 N' 배지를 표시한다", () => {
    render(<FundingCard {...baseProps} pendingCount={2} />);

    expect(screen.getByText("확인 대기 2")).toBeInTheDocument();
  });

  it("default 타입에서 pendingCount가 0이면 배지를 숨긴다", () => {
    render(<FundingCard {...baseProps} pendingCount={0} />);

    expect(screen.queryByText(/확인 대기/)).not.toBeInTheDocument();
  });

  it("default 타입에서는 선물 커버 문구가 없다", () => {
    render(<FundingCard {...baseProps} pendingCount={2} />);

    expect(screen.queryByText(/팡/)).not.toBeInTheDocument();
  });

  it("notification 타입이면 확인 대기 건수 안내 라벨을 표시한다", () => {
    render(<FundingCard {...baseProps} type="notification" pendingCount={3} />);

    expect(screen.getByText("확인 대기 3건을 확인하면 열어볼 수 있어요")).toBeInTheDocument();
  });

  it("complete 타입이면 '다 모였어요. 팡! 열어볼까요?' 라벨을 표시한다", () => {
    render(<FundingCard {...baseProps} type="complete" />);

    expect(screen.getByText("다 모였어요. 팡! 열어볼까요?")).toBeInTheDocument();
  });

  it("open 타입이면 '기간이 만료되었어요.' 라벨을 표시하고 선물 커버 문구는 없다", () => {
    render(<FundingCard {...baseProps} type="open" />);

    expect(screen.getByText("기간이 만료되었어요.")).toBeInTheDocument();
    expect(screen.queryByText(/팡/)).not.toBeInTheDocument();
  });

  it("notification 타입에서도 프로필 '+4'와 '확인 대기 3' 배지를 표시한다", () => {
    render(
      <FundingCard
        {...baseProps}
        type="notification"
        pendingCount={3}
        participants={[{ color: "orange" }]}
        extraParticipantCount={4}
      />,
    );

    expect(screen.getByText("+4")).toBeInTheDocument();
    expect(screen.getByText("확인 대기 3")).toBeInTheDocument();
  });

  it("open 타입에서는 프로필과 배지를 표시하지 않는다", () => {
    render(
      <FundingCard
        {...baseProps}
        type="open"
        pendingCount={3}
        participants={[{ color: "orange" }]}
        extraParticipantCount={4}
      />,
    );

    expect(screen.queryByText("+4")).not.toBeInTheDocument();
    expect(screen.queryByText("확인 대기 3")).not.toBeInTheDocument();
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

describe("FundingCard 효과 타입 탭 동작", () => {
  const tapName = { name: "민지 생일 펀딩" };

  it("카드 버튼의 접근 가능한 설명이 라벨 문구다", () => {
    render(<FundingCard {...baseProps} type="complete" onClick={vi.fn()} />);

    expect(screen.getByRole("button", tapName)).toHaveAccessibleDescription(
      "다 모였어요. 팡! 열어볼까요?",
    );
  });

  it("notification 카드를 탭하면 onClick을 즉시 호출한다", async () => {
    const onClick = vi.fn();
    render(<FundingCard {...baseProps} type="notification" pendingCount={3} onClick={onClick} />);

    await userEvent.click(screen.getByRole("button", tapName));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("complete 카드를 탭한 직후에는 onClick을 호출하지 않고, 터지는 연출이 끝난 뒤 호출한다", async () => {
    const onClick = vi.fn();
    MotionGlobalConfig.skipAnimations = true;
    render(<FundingCard {...baseProps} type="complete" onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", tapName));
    expect(onClick).not.toHaveBeenCalled();

    await waitFor(() => expect(onClick).toHaveBeenCalledTimes(1));
  });

  it("open 카드를 탭한 직후에는 onClick을 호출하지 않고, 눌림·페이드가 끝난 뒤 호출한다", async () => {
    const onClick = vi.fn();
    MotionGlobalConfig.skipAnimations = true;
    render(<FundingCard {...baseProps} type="open" onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", tapName));
    expect(onClick).not.toHaveBeenCalled();

    await waitFor(() => expect(onClick).toHaveBeenCalledTimes(1));
  });

  it("open 카드도 모션 줄이기 설정이면 탭 즉시 onClick을 호출한다", async () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const onClick = vi.fn();
    render(<FundingCard {...baseProps} type="open" onClick={onClick} />);

    await userEvent.click(screen.getByRole("button", tapName));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("open 카드 버튼의 접근 가능한 설명이 만료 안내 문구다", () => {
    render(<FundingCard {...baseProps} type="open" onClick={vi.fn()} />);

    expect(screen.getByRole("button", tapName)).toHaveAccessibleDescription("기간이 만료되었어요.");
  });

  it("complete 카드도 모션 줄이기 설정이면 탭 즉시 onClick을 호출한다", async () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const onClick = vi.fn();
    render(<FundingCard {...baseProps} type="complete" onClick={onClick} />);

    await userEvent.click(screen.getByRole("button", tapName));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("터지는 연출 중에 연타해도 onClick은 한 번만 호출한다", async () => {
    const onClick = vi.fn();
    MotionGlobalConfig.skipAnimations = true;
    render(<FundingCard {...baseProps} type="complete" onClick={onClick} />);

    const button = screen.getByRole("button", tapName);
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    await waitFor(() => expect(onClick).toHaveBeenCalledTimes(1));
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
