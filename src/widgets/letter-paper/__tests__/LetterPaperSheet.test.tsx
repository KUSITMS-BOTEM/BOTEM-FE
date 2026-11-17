import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LetterPaperSheet from "@/widgets/letter-paper/LetterPaperSheet";

function renderSheet(props: Partial<React.ComponentProps<typeof LetterPaperSheet>> = {}) {
  return render(
    <LetterPaperSheet
      color="lime"
      selectedStyle="vividSolid"
      onSelect={vi.fn()}
      onClose={vi.fn()}
      {...props}
    />,
  );
}

describe("LetterPaperSheet", () => {
  it("안내 문구와 선택한 색상 이름, 편지지 style 5종을 보여준다", () => {
    renderSheet({ color: "lime" });

    expect(screen.getByText("어떤 편지지를 쓸까요?")).toBeInTheDocument();
    expect(screen.getByText("라임")).toBeInTheDocument();
    expect(screen.queryByText("오렌지")).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
  });

  it("편지지를 누르면 해당 style로 onSelect가 호출된다", async () => {
    const onSelect = vi.fn();
    renderSheet({ onSelect });

    await userEvent.click(screen.getByRole("button", { name: "컬러 도트 편지지" }));

    expect(onSelect).toHaveBeenCalledWith("colorDot");
  });

  it("선택된 편지지만 pressed 상태이다", () => {
    renderSheet({ selectedStyle: "colorDot" });

    expect(screen.getByRole("button", { name: "컬러 도트 편지지" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "솔리드 편지지" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("썸네일에는 본문 글과 음성 메시지 없이 편지지 style만 그린다", () => {
    renderSheet();

    expect(screen.queryByRole("group", { name: "음성 메시지" })).not.toBeInTheDocument();
    // 선택 버튼 5개와 닫기 버튼뿐이다(미리보기 안의 슬롯은 aria-hidden)
    expect(screen.getAllByRole("button")).toHaveLength(6);
  });

  it("닫기 버튼을 누르면 onClose가 호출된다", async () => {
    const onClose = vi.fn();
    renderSheet({ onClose });

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
