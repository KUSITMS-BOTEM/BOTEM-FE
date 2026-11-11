import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PendingContributionItem from "@/widgets/home/PendingContributionItem";

const baseProps = {
  senderName: "하린이",
  depositMethod: "토스뱅크 계좌",
  checked: false,
  onCheckedChange: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PendingContributionItem", () => {
  it("'{senderName}의 보탬' 제목과 입금 방식을 표시한다", () => {
    render(<PendingContributionItem {...baseProps} />);

    expect(screen.getByText("하린이의 보탬")).toBeInTheDocument();
    expect(screen.getByText("토스뱅크 계좌")).toBeInTheDocument();
  });

  it("checked가 false면 체크박스가 해제 상태다", () => {
    render(<PendingContributionItem {...baseProps} checked={false} />);

    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("checked가 true면 체크박스가 체크 상태다", () => {
    render(<PendingContributionItem {...baseProps} checked />);

    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("해제 상태에서 클릭하면 onCheckedChange(true)를 호출한다", async () => {
    render(<PendingContributionItem {...baseProps} checked={false} />);

    await userEvent.click(screen.getByRole("checkbox"));

    expect(baseProps.onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("체크 상태에서 클릭하면 onCheckedChange(false)를 호출한다", async () => {
    render(<PendingContributionItem {...baseProps} checked />);

    await userEvent.click(screen.getByRole("checkbox"));

    expect(baseProps.onCheckedChange).toHaveBeenCalledWith(false);
  });

  it("카드 전체(라벨)를 눌러도 선택이 토글된다", async () => {
    render(<PendingContributionItem {...baseProps} />);

    await userEvent.click(screen.getByText("하린이의 보탬"));

    expect(baseProps.onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("className을 루트에 추가로 적용한다", () => {
    const { container } = render(
      <PendingContributionItem {...baseProps} className="custom-item" />,
    );

    expect(container.firstElementChild).toHaveClass("custom-item");
  });
});
