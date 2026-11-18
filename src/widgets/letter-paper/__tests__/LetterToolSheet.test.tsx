import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LetterToolSheet from "@/widgets/letter-paper/LetterToolSheet";

describe("LetterToolSheet", () => {
  it("제목과 툴 4종이 보인다", () => {
    render(<LetterToolSheet color="orange" onClose={vi.fn()} />);

    expect(screen.getByText("어떤 툴을 추가할까요?")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").map(item => item.textContent)).toEqual([
      "녹음",
      "스티커",
      "사진 추가",
      "편지지",
    ]);
  });

  it("녹음 툴을 누르면 onSelectRecord가 호출된다", async () => {
    const onSelectRecord = vi.fn();
    render(<LetterToolSheet color="orange" onClose={vi.fn()} onSelectRecord={onSelectRecord} />);

    await userEvent.click(screen.getByRole("button", { name: "녹음" }));

    expect(onSelectRecord).toHaveBeenCalledTimes(1);
  });

  it("스티커 툴을 누르면 onSelectSticker가 호출된다", async () => {
    const onSelectSticker = vi.fn();
    render(<LetterToolSheet color="orange" onClose={vi.fn()} onSelectSticker={onSelectSticker} />);

    await userEvent.click(screen.getByRole("button", { name: "스티커" }));

    expect(onSelectSticker).toHaveBeenCalledTimes(1);
  });

  it("편지지 툴을 누르면 onSelectLetter가 호출된다", async () => {
    const onSelectLetter = vi.fn();
    render(<LetterToolSheet color="orange" onClose={vi.fn()} onSelectLetter={onSelectLetter} />);

    await userEvent.click(screen.getByRole("button", { name: "편지지" }));

    expect(onSelectLetter).toHaveBeenCalledTimes(1);
  });

  it("닫기 버튼을 누르면 onClose가 호출된다", async () => {
    const onClose = vi.fn();
    render(<LetterToolSheet color="orange" onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
