import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LetterPaper from "@/widgets/letter-paper/LetterPaper";

describe("LetterPaper", () => {
  it("편지 텍스트와 'From. 이름'을 보여준다", () => {
    render(<LetterPaper text="생일 축하해!" senderName="민지" />);

    expect(screen.getByText("생일 축하해!")).toBeInTheDocument();
    expect(screen.getByText("From. 민지")).toBeInTheDocument();
  });

  it("110자 이하는 20px, 111자 이상은 17px 타이포를 쓴다", () => {
    const { rerender } = render(<LetterPaper text={"가".repeat(110)} senderName="민지" />);
    expect(screen.getByText("가".repeat(110))).toHaveClass("[font:var(--semantic-title-small)]");

    rerender(<LetterPaper text={"가".repeat(111)} senderName="민지" />);
    expect(screen.getByText("가".repeat(111))).toHaveClass("[font:var(--semantic-title-x-small)]");
  });

  it("긴 텍스트는 글자 수로 자르지 않고 고정 높이 영역에서 클립한다", () => {
    render(<LetterPaper text={"ㅇ".repeat(300)} senderName="민지" />);

    const body = screen.getByText("ㅇ".repeat(300));
    expect(body).toHaveClass("overflow-hidden", "shrink-0", "h-[252px]");
  });

  it("hasVoiceMessage가 true일 때만 음성 메시지를 보여준다", () => {
    const { rerender } = render(<LetterPaper text="안녕" senderName="민지" />);
    expect(screen.queryByRole("img", { name: "음성 메시지" })).not.toBeInTheDocument();

    rerender(<LetterPaper text="안녕" senderName="민지" hasVoiceMessage />);
    expect(screen.getByRole("img", { name: "음성 메시지" })).toBeInTheDocument();
  });

  it("점 패턴이 있는 스타일에만 점 패턴을 그린다", () => {
    const { container, rerender } = render(
      <LetterPaper style="solid" text="안녕" senderName="민지" />,
    );
    expect(container.querySelector("[class*='--dot']")).toBeNull();

    rerender(<LetterPaper style="colorDot" text="안녕" senderName="민지" />);
    expect(container.querySelector("[class*='--dot']")).not.toBeNull();
  });

  it("style과 color 조합에 맞는 배경색을 쓴다", () => {
    const { container } = render(
      <LetterPaper style="whiteDot" color="blue" text="안녕" senderName="민지" />,
    );

    expect(container.firstElementChild).toHaveClass("bg-base-blue-400");
  });

  it("whiteDot은 lime만 검정 글씨, 나머지 색은 흰 글씨다", () => {
    const { rerender } = render(
      <LetterPaper style="whiteDot" color="lime" text="안녕" senderName="민지" />,
    );
    expect(screen.getByText("안녕")).toHaveClass("text-semantic-text-strong");

    rerender(<LetterPaper style="whiteDot" color="pink" text="안녕" senderName="민지" />);
    expect(screen.getByText("안녕")).toHaveClass("text-semantic-text-on-fill");
  });

  it("아이콘 슬롯에 넘긴 아이콘을 보여주고 클릭 핸들러를 호출한다", async () => {
    const onLargeIconClick = vi.fn();
    const onSmallIconClick = vi.fn();
    render(
      <LetterPaper
        text="안녕"
        senderName="민지"
        largeIcon={<span>큰 아이콘</span>}
        smallIcon={<span>작은 아이콘</span>}
        onLargeIconClick={onLargeIconClick}
        onSmallIconClick={onSmallIconClick}
      />,
    );

    await userEvent.click(screen.getByText("큰 아이콘"));
    await userEvent.click(screen.getByText("작은 아이콘"));

    expect(onLargeIconClick).toHaveBeenCalledTimes(1);
    expect(onSmallIconClick).toHaveBeenCalledTimes(1);
  });

  it("사진 슬롯은 항상 있고 아이콘 슬롯은 2개다", () => {
    render(<LetterPaper text="안녕" senderName="민지" />);

    expect(screen.getByRole("button", { name: "사진 선택" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "아이콘 선택" })).toHaveLength(2);
  });
});
