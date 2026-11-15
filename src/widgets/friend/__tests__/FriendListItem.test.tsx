import { render, screen } from "@testing-library/react";

import FriendListItem from "@/widgets/friend/FriendListItem";

describe("FriendListItem", () => {
  it("제목을 '이름 · 위시 N개' 형식으로 표시한다", () => {
    render(<FriendListItem name="민지" wishCount={3} birthdayText="생일 10월 24일" />);

    expect(screen.getByText("민지 · 위시 3개")).toBeInTheDocument();
  });

  it("위시가 0개여도 '위시 0개'로 표시한다", () => {
    render(<FriendListItem name="예준" wishCount={0} birthdayText="생일 12월 30일" />);

    expect(screen.getByText("예준 · 위시 0개")).toBeInTheDocument();
  });

  it("생일 문구를 표시한다", () => {
    render(<FriendListItem name="민지" wishCount={3} birthdayText="생일 10월 24일" />);

    expect(screen.getByText("생일 10월 24일")).toBeInTheDocument();
  });

  it("dDayText가 있으면 표시하고 없으면 렌더하지 않는다", () => {
    const { rerender } = render(
      <FriendListItem
        name="민지"
        wishCount={3}
        birthdayText="생일 10월 24일"
        dDayText="생일까지 3일 남았어요"
      />,
    );
    expect(screen.getByText("생일까지 3일 남았어요")).toBeInTheDocument();

    rerender(<FriendListItem name="민지" wishCount={3} birthdayText="생일 10월 24일" />);
    expect(screen.queryByText(/남았어요/)).not.toBeInTheDocument();
  });

  it("badge가 없으면 배지를 표시하지 않는다", () => {
    render(<FriendListItem name="하린" wishCount={4} birthdayText="생일 11월 28일" />);

    expect(screen.queryByText("펀딩 중")).not.toBeInTheDocument();
  });

  it.each([
    ["neutral", "펀딩 중"],
    ["brand", "서프라이즈 중"],
  ] as const)("badge(%s)의 label을 표시한다", (color, label) => {
    render(
      <FriendListItem
        name="민지"
        wishCount={3}
        birthdayText="생일 10월 24일"
        badge={{ label, color }}
      />,
    );

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
