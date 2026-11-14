import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingRevealEmptyView from "@/widgets/funding/FundingRevealEmptyView";

describe("FundingRevealEmptyView", () => {
  it("제목과 안내 문구를 보여준다", () => {
    render(<FundingRevealEmptyView onClose={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "이번엔 조용히 지나갔어요" })).toBeInTheDocument();
    expect(screen.getByText(/아직 아무도 보태지 않았어요/)).toBeInTheDocument();
  });

  it("'기간 연장하러 가기'를 누르면 onExtend만 호출한다", async () => {
    const onExtend = vi.fn();
    const onClose = vi.fn();
    render(<FundingRevealEmptyView onExtend={onExtend} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "기간 연장하러 가기" }));

    expect(onExtend).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("'닫기'를 누르면 onClose만 호출한다", async () => {
    const onExtend = vi.fn();
    const onClose = vi.fn();
    render(<FundingRevealEmptyView onExtend={onExtend} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onExtend).not.toHaveBeenCalled();
  });

  it("onExtend 없이 '기간 연장하러 가기'를 눌러도 에러 없이 onClose를 호출하지 않는다", async () => {
    const onClose = vi.fn();
    render(<FundingRevealEmptyView onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "기간 연장하러 가기" }));

    expect(onClose).not.toHaveBeenCalled();
  });
});
