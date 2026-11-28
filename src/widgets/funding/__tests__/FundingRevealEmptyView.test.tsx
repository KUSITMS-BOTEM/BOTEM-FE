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

  it("'펀딩 마감하기'를 누르면 onClose만 호출한다", async () => {
    const onExtend = vi.fn();
    const onClose = vi.fn();
    render(<FundingRevealEmptyView onExtend={onExtend} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: "펀딩 마감하기" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onExtend).not.toHaveBeenCalled();
  });

  it("종료 요청 중이면 두 버튼을 막고 '펀딩 마감하기'에 로딩을 표시한다", () => {
    render(<FundingRevealEmptyView isClosing onExtend={vi.fn()} onClose={vi.fn()} />);

    const closeButton = screen.getByRole("button", { name: "펀딩 마감하기" });
    expect(closeButton).toBeDisabled();
    expect(closeButton).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "기간 연장하러 가기" })).toBeDisabled();
  });

  it("연장할 수 없어 onExtend가 없으면 '기간 연장하러 가기'를 보여주지 않는다", () => {
    render(<FundingRevealEmptyView onClose={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "기간 연장하러 가기" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "펀딩 마감하기" })).toBeInTheDocument();
  });
});
